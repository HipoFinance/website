// The Club's WebSocket client (specs/club-website.md §2): `wss://api.hipogang.io/ws` opened with no
// query (spec 2's new handshake), `clubauth` sent first on every connection, replies matched by
// `type`, protocol `v: 42`.
//
// - One request of a type in flight at a time; a second of the same type waits for the first.
// - A closed or failed socket rejects what is in flight with ClubSocketError ("failed, try again").
//   Nothing is retried here: the callers poll, and a payment or a withdrawal is never sent twice.
// - The next request after a close reconnects, with a growing pause after repeated failures, and
//   re-authenticates with whatever the auth callback returns then (the stored token, or initData).
//   Only one connection is ever being made at a time, also during that pause.
// - The auth callback is only peeked at before the socket exists; its body is taken again once the
//   socket is open and sent at once, and `onAuthReply` gets the reply with the body it answers, so
//   a one-time credential (the Mini App's initData) is spent only on a server answer.
// - Waiters belong to their socket: a late close of an old socket never rejects the requests of the
//   new one, and a request that times out closes its socket, so a late reply (replies are matched
//   by type) can never answer the next request of that type.
// - Before the launch migration the server refuses the handshake itself (HTTP 403), which a browser
//   reports as a plain connection failure; ClubModel tells "launching" apart through /wallet-rewards.
import { ClubSocketError, type ClubTransport } from './api.ts'

export const CLUB_WS_URL = 'wss://api.hipogang.io/ws'
const PROTOCOL_VERSION = 42
const REQUEST_TIMEOUT = 15_000
const CONNECT_TIMEOUT = 10_000
const MAX_BACKOFF = 30_000

interface Waiter {
  resolve: (body: unknown) => void
  reject: (error: unknown) => void
  timer: ReturnType<typeof setTimeout>
}

// One socket and the replies awaited on it, per type, in send order.
interface Connection {
  socket: WebSocket
  waiters: Map<string, Waiter[]>
  closed: boolean
}

export class ClubSocket implements ClubTransport {
  private url: string
  // The authenticated connection requests go to.
  private live?: Connection
  // The connection being made (the backoff pause, the socket's opening and its clubauth), shared by
  // every request that arrives meanwhile.
  private connecting?: Promise<Connection>
  // Bumped by close(): a connection still being made for an older generation is thrown away.
  private generation = 0
  private auth?: () => Record<string, unknown> | undefined
  // The tail of each type's queue, so a request starts only after the previous one of its type ended.
  private queues = new Map<string, Promise<unknown>>()
  private failures = 0
  private nextConnectAt = 0
  // Called with every clubauth reply and the auth body it answers.
  onAuthReply?: (body: unknown, sent: Record<string, unknown>) => void

  private requestTimeout: number
  private connectTimeout: number

  // The timeouts are options only for scripts/club-socket-selftest.mjs.
  constructor(url = CLUB_WS_URL, options: { requestTimeout?: number; connectTimeout?: number } = {}) {
    this.url = url
    this.requestTimeout = options.requestTimeout ?? REQUEST_TIMEOUT
    this.connectTimeout = options.connectTimeout ?? CONNECT_TIMEOUT
  }

  setAuth(auth: (() => Record<string, unknown> | undefined) | undefined) {
    this.auth = auth
  }

  request(type: string, body: Record<string, unknown> = {}): Promise<unknown> {
    const previous = this.queues.get(type) ?? Promise.resolve()
    const run = previous.catch(() => undefined).then(() => this.send(type, body))
    this.queues.set(type, run)
    return run
  }

  close() {
    this.generation++
    this.connecting = undefined
    const live = this.live
    this.live = undefined
    if (live !== undefined) {
      this.shut(live, new ClubSocketError('closed'))
    }
  }

  private async send(type: string, body: Record<string, unknown>): Promise<unknown> {
    const connection = await this.connect()
    return this.exchange(connection, type, body)
  }

  private exchange(connection: Connection, type: string, body: Record<string, unknown>): Promise<unknown> {
    const socket = connection.socket
    if (connection.closed || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new ClubSocketError('closed'))
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        removeWaiter(connection, type, waiter)
        reject(new ClubSocketError('timeout'))
        // Its reply may still come, and replies carry no id: this socket is done.
        this.shut(connection, new ClubSocketError('closed'))
      }, this.requestTimeout)
      const waiter: Waiter = { resolve, reject, timer }
      const waiting = connection.waiters.get(type) ?? []
      waiting.push(waiter)
      connection.waiters.set(type, waiting)
      try {
        socket.send(JSON.stringify({ type, body, v: PROTOCOL_VERSION }))
      } catch {
        removeWaiter(connection, type, waiter)
        clearTimeout(timer)
        reject(new ClubSocketError('closed'))
      }
    })
  }

  private connect(): Promise<Connection> {
    const live = this.live
    if (live !== undefined && !live.closed && live.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve(live)
    }
    if (this.connecting === undefined) {
      const attempt = this.open(this.generation)
      this.connecting = attempt
      const settle = () => {
        if (this.connecting === attempt) {
          this.connecting = undefined
        }
      }
      attempt.then(settle, settle)
    }
    return this.connecting
  }

  private async open(generation: number): Promise<Connection> {
    const wait = this.nextConnectAt - Date.now()
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait))
    }
    if (generation !== this.generation) {
      throw new ClubSocketError('closed')
    }
    // A peek only: nothing is taken from the callback until the socket is open.
    if (this.auth?.() === undefined) {
      throw new ClubSocketError('auth', 'no_credentials')
    }
    const socket = new WebSocket(this.url)
    const connection: Connection = { socket, waiters: new Map(), closed: false }
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.close()
        reject(new ClubSocketError('connect'))
      }, this.connectTimeout)
      socket.onopen = () => {
        clearTimeout(timer)
        resolve()
      }
      socket.onerror = () => {
        clearTimeout(timer)
        reject(new ClubSocketError('connect'))
      }
      socket.onclose = () => {
        clearTimeout(timer)
        reject(new ClubSocketError('connect'))
      }
    }).catch((e) => {
      connection.closed = true
      this.failed()
      throw e
    })
    socket.onmessage = (event) => this.receive(connection, event)
    socket.onclose = () => this.shut(connection, new ClubSocketError('closed'))
    socket.onerror = () => undefined
    if (generation !== this.generation) {
      this.shut(connection, new ClubSocketError('closed'))
      throw new ClubSocketError('closed')
    }
    // clubauth is the first message on every connection; nothing else is sent before its reply.
    const auth = this.auth?.()
    if (auth === undefined) {
      this.shut(connection, new ClubSocketError('closed'))
      throw new ClubSocketError('auth', 'no_credentials')
    }
    let reply: unknown
    try {
      reply = await this.exchange(connection, 'clubauth', auth)
    } catch (e) {
      this.shut(connection, new ClubSocketError('closed'))
      this.failed()
      throw e
    }
    this.onAuthReply?.(reply, auth)
    const ok = (reply as { ok?: unknown } | null)?.ok === true
    if (!ok) {
      const reason = (reply as { reason?: unknown } | null)?.reason
      this.shut(connection, new ClubSocketError('closed'))
      throw new ClubSocketError('auth', typeof reason === 'string' ? reason : undefined)
    }
    if (generation !== this.generation) {
      this.shut(connection, new ClubSocketError('closed'))
      throw new ClubSocketError('closed')
    }
    this.failures = 0
    this.nextConnectAt = 0
    this.live = connection
    return connection
  }

  private failed() {
    this.failures++
    this.nextConnectAt = Date.now() + Math.min(MAX_BACKOFF, 1000 * 2 ** Math.min(this.failures - 1, 5))
  }

  private receive(connection: Connection, event: MessageEvent) {
    if (connection.closed) {
      return
    }
    let message: { type?: unknown; body?: unknown }
    try {
      message = JSON.parse(String(event.data))
    } catch {
      return
    }
    if (typeof message.type !== 'string') {
      return
    }
    const waiter = connection.waiters.get(message.type)?.shift()
    if (waiter === undefined) {
      return
    }
    clearTimeout(waiter.timer)
    waiter.resolve(message.body)
  }

  // Ends one connection: its socket is closed, it answers nothing more, and only its own waiters are
  // rejected. When it was the live one, the next request reconnects.
  private shut(connection: Connection, error: ClubSocketError) {
    if (this.live === connection) {
      this.live = undefined
    }
    if (!connection.closed) {
      connection.closed = true
      try {
        connection.socket.close()
      } catch {
        // already closed
      }
    }
    for (const waiting of connection.waiters.values()) {
      for (const waiter of waiting.splice(0)) {
        clearTimeout(waiter.timer)
        waiter.reject(error)
      }
    }
  }
}

function removeWaiter(connection: Connection, type: string, waiter: Waiter) {
  const waiting = connection.waiters.get(type)
  if (waiting !== undefined) {
    const index = waiting.indexOf(waiter)
    if (index >= 0) {
      waiting.splice(index, 1)
    }
  }
}
