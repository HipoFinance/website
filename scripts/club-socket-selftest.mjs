#!/usr/bin/env node
// Checks of the Club's WebSocket client and its clubauth credentials (specs/club-website.md §2, §3):
// src/components/app/club/socket.ts against a fake WebSocket, and src/components/app/club/auth.ts.
//
//   node --experimental-strip-types scripts/club-socket-selftest.mjs
//
// No network: the fake socket opens, fails, closes and replies when a check tells it to.

import assert from 'node:assert/strict'
import { authBody, authOutcome, initDataUserId, sessionFitsInitData } from '../src/components/app/club/auth.ts'

const created = []
class FakeSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  static onCreate = undefined
  readyState = 0
  sent = []
  closeDelay = 0
  constructor(url) {
    this.url = url
    created.push(this)
    FakeSocket.onCreate?.(this)
  }
  send(text) {
    if (this.readyState !== 1) {
      throw new Error('not open')
    }
    this.sent.push(JSON.parse(text))
  }
  close() {
    if (this.readyState >= 2) {
      return
    }
    this.readyState = 2
    setTimeout(() => {
      this.readyState = 3
      this.onclose?.()
    }, this.closeDelay)
  }
  // test controls
  open() {
    this.readyState = 1
    this.onopen?.()
  }
  fail() {
    this.readyState = 3
    this.onerror?.()
    this.onclose?.()
  }
  reply(type, body) {
    this.onmessage?.({ data: JSON.stringify({ type, body }) })
  }
  types() {
    return this.sent.map((message) => message.type)
  }
}
globalThis.WebSocket = FakeSocket
const { ClubSocket } = await import('../src/components/app/club/socket.ts')

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))
// Waits for what the client does next (a send, a close) instead of for a guessed number of
// milliseconds: a fixed pause races the fake socket's own timers on a loaded machine.
const until = async (condition, what) => {
  for (let i = 0; i < 3000 && !condition(); i++) {
    await tick(1)
  }
  assert.ok(condition(), `timed out waiting for ${what}`)
}
const sent = (socket, ...types) => socket !== undefined && socket.types().join() === types.join()
const opens = (socket) => setTimeout(() => socket.open(), 5)
const fails = (socket) => setTimeout(() => socket.fail(), 1)
const outcome = (promise) =>
  promise.then(
    (value) => ['ok', value],
    (e) => ['err', e.message],
  )

let count = 0
async function check(name, fn) {
  created.length = 0
  FakeSocket.onCreate = undefined
  try {
    await fn()
    count++
  } catch (e) {
    console.error('FAIL', name)
    throw e
  }
}

// ------------------------------------------------------------------------------------ the socket

await check('a late close of the old socket never rejects the new socket’s requests', async () => {
  const socket = new ClubSocket('wss://x')
  socket.setAuth(() => ({ token: 't' }))
  FakeSocket.onCreate = opens
  const first = socket.request('clubstatus')
  await until(() => sent(created[0], 'clubauth'), 'the first clubauth')
  created[0].reply('clubauth', { ok: true })
  await until(() => sent(created[0], 'clubauth', 'clubstatus'), 'the first clubstatus')
  created[0].reply('clubstatus', { ok: true })
  await first
  // close() (a login, a reauth, a logout), then a request at once; the old socket's close event
  // arrives late, after the new socket's clubauth was sent.
  created[0].closeDelay = 50
  socket.close()
  socket.setAuth(() => ({ widget: { hash: 'h' } }))
  const second = outcome(socket.request('clubstatus'))
  await until(() => sent(created[1], 'clubauth'), 'the new socket’s clubauth')
  assert.deepEqual(created[1].sent[0].body, { widget: { hash: 'h' } })
  // The old socket's close event arrives only now, after the new socket's clubauth was sent.
  await until(() => created[0].readyState === 3, 'the old socket’s late close')
  created[1].reply('clubauth', { ok: true, token: 'NEW' })
  await until(() => sent(created[1], 'clubauth', 'clubstatus'), 'the new clubstatus')
  created[1].reply('clubstatus', { ok: true, n: 2 })
  assert.deepEqual(await second, ['ok', { ok: true, n: 2 }])
  assert.equal(created.length, 2)
})

await check('a reconnect during the backoff pause opens one socket for every request', async () => {
  const socket = new ClubSocket('wss://x')
  socket.setAuth(() => ({ token: 't' }))
  FakeSocket.onCreate = fails
  assert.equal((await outcome(socket.request('clubstatus')))[0], 'err')
  FakeSocket.onCreate = opens
  const a = outcome(socket.request('clubstatus'))
  await tick(10)
  const b = outcome(socket.request('clubleaderboard'))
  await until(() => created.length > 1 && sent(created[1], 'clubauth'), 'the clubauth after the backoff pause')
  assert.equal(created.length - 1, 1, 'one socket after the failure')
  const [fresh] = created.slice(1)
  assert.deepEqual(fresh.types(), ['clubauth'])
  fresh.reply('clubauth', { ok: true })
  await until(() => sent(fresh, 'clubauth', 'clubstatus', 'clubleaderboard'), 'both requests after the clubauth')
  fresh.reply('clubstatus', { ok: true })
  fresh.reply('clubleaderboard', { ok: true })
  assert.deepEqual(await a, ['ok', { ok: true }])
  assert.deepEqual(await b, ['ok', { ok: true }])
})

await check('a request that times out closes its socket: a late reply never answers the next one', async () => {
  const socket = new ClubSocket('wss://x', { requestTimeout: 100 })
  socket.setAuth(() => ({ token: 't' }))
  FakeSocket.onCreate = opens
  const first = outcome(socket.request('cluboverview'))
  await until(() => sent(created[0], 'clubauth'), 'the clubauth')
  created[0].reply('clubauth', { ok: true })
  assert.deepEqual(await first, ['err', 'timeout'])
  assert.ok(created[0].readyState >= 2, 'the timed-out socket is closed')
  const second = outcome(socket.request('cluboverview'))
  await until(() => created.length > 1, 'the second socket')
  // The first request's reply, late, on the old socket.
  created[0].reply('cluboverview', { ok: true, unclaimed: 'STALE' })
  await until(() => sent(created[1], 'clubauth'), 'the second clubauth')
  assert.equal(created.length, 2)
  created[1].reply('clubauth', { ok: true })
  await until(() => sent(created[1], 'clubauth', 'cluboverview'), 'the second cluboverview')
  created[1].reply('cluboverview', { ok: true, unclaimed: 'fresh' })
  assert.deepEqual(await second, ['ok', { ok: true, unclaimed: 'fresh' }])
})

await check('the auth body is peeked before the socket exists and taken only once it is open', async () => {
  const socket = new ClubSocket('wss://x')
  let body = { init_data: 'first' }
  socket.setAuth(() => body)
  const replies = []
  socket.onAuthReply = (reply, sent) => replies.push([reply, sent])
  FakeSocket.onCreate = (s) => {
    // The credential changes between the socket's creation and its opening.
    body = { init_data: 'second' }
    opens(s)
  }
  const request = outcome(socket.request('clubstatus'))
  await until(() => sent(created[0], 'clubauth'), 'the clubauth')
  assert.deepEqual(created[0].sent[0].body, { init_data: 'second' })
  created[0].reply('clubauth', { ok: true })
  await until(() => sent(created[0], 'clubauth', 'clubstatus'), 'the clubstatus')
  created[0].reply('clubstatus', { ok: true })
  await request
  assert.deepEqual(replies, [[{ ok: true }, { init_data: 'second' }]])
  // Nothing to authenticate with: no socket at all.
  const none = new ClubSocket('wss://y')
  none.setAuth(() => undefined)
  assert.deepEqual(await outcome(none.request('clubstatus')), ['err', 'auth: no_credentials'])
  assert.equal(created.length, 1)
})

// --------------------------------------------------------------------------- the credentials (§3)

// ClubModel's credential handling over auth.ts, the same steps as ClubModel.onAuthReply.
function holder(over = {}) {
  const c = { tma: true, initData: 'user=%7B%22id%22%3A42%7D&hash=x', initDataUsed: false, ...over }
  return {
    c,
    body: () => authBody(c),
    onAuthReply: (reply, sent) => {
      const result = authOutcome(reply, sent, c)
      if (result.spendWidget) {
        c.widget = undefined
      }
      if (result.spendInitData) {
        c.initDataUsed = true
      }
      if (result.session === 'set') {
        c.token = reply.token
      } else if (result.session === 'drop') {
        c.token = undefined
      }
    },
  }
}

await check('initData is never spent before the socket is open, nor on busy or rate_limited', async () => {
  const h = holder()
  const socket = new ClubSocket('wss://x')
  socket.setAuth(h.body)
  socket.onAuthReply = h.onAuthReply
  // A failed connect.
  FakeSocket.onCreate = fails
  assert.equal((await outcome(socket.request('clubstatus')))[0], 'err')
  assert.equal(h.c.initDataUsed, false)
  assert.equal(created[0].sent.length, 0)
  // Busy, then rate limited: the credential stays.
  FakeSocket.onCreate = opens
  for (const reason of ['busy', 'rate_limited']) {
    await tick(2100)
    const before = created.length
    const busy = outcome(socket.request('clubstatus'))
    await until(() => created.length > before && sent(created.at(-1), 'clubauth'), 'the clubauth')
    const s = created.at(-1)
    assert.deepEqual(s.sent[0].body, { init_data: h.c.initData })
    s.reply('clubauth', { ok: false, reason })
    assert.deepEqual(await busy, ['err', 'auth: ' + reason])
    assert.equal(h.c.initDataUsed, false, reason)
  }
  // Accepted: spent, and the session's token is what the next connection uses.
  const before = created.length
  const ok = outcome(socket.request('clubstatus'))
  await until(() => created.length > before && sent(created.at(-1), 'clubauth'), 'the clubauth')
  const s = created.at(-1)
  s.reply('clubauth', { ok: true, token: 'T', account: '42' })
  await until(() => sent(s, 'clubauth', 'clubstatus'), 'the clubstatus')
  s.reply('clubstatus', { ok: true })
  assert.equal((await ok)[0], 'ok')
  assert.equal(h.c.initDataUsed, true)
  assert.deepEqual(h.body(), { token: 'T' })
})

await check('the Mini App sends its initData on every open, before a stored token', () => {
  const h = holder({ token: 'stored' })
  assert.deepEqual(h.body(), { init_data: h.c.initData })
  // On the website (not the Mini App) the stored token resumes.
  assert.deepEqual(holder({ tma: false, token: 'stored' }).body(), { token: 'stored' })
  // A fresh login popup goes first everywhere.
  const widget = { hash: 'w' }
  assert.deepEqual(holder({ token: 'stored', widget }).body(), { widget })
})

await check('bad_auth leaves the stored session; bad_session clears it', () => {
  const sent = { init_data: 'user=%7B%22id%22%3A42%7D&hash=x' }
  const refused = authOutcome({ ok: false, reason: 'bad_auth' }, sent, {
    tma: true,
    initData: sent.init_data,
    initDataUsed: false,
    token: 'stored',
  })
  assert.deepEqual(refused, { spendWidget: false, spendInitData: true, session: 'keep' })
  assert.equal(
    authOutcome({ ok: false, reason: 'bad_session' }, { token: 't' }, { tma: false, initDataUsed: false }).session,
    'drop',
  )
  assert.equal(
    authOutcome({ ok: true, token: 'n', account: '42' }, { token: 't' }, { tma: false, initDataUsed: false }).session,
    'set',
  )
})

await check('a stored session of another Telegram user than the initData’s is not kept', () => {
  const data = 'query_id=1&user=%7B%22id%22%3A42%2C%22first_name%22%3A%22A%22%7D&auth_date=1&hash=h'
  assert.equal(initDataUserId(data), '42')
  assert.equal(sessionFitsInitData('42', data), true)
  assert.equal(sessionFitsInitData('43', data), false)
  // No readable user: nothing to compare, the session stays.
  assert.equal(sessionFitsInitData('43', 'mock-init-data'), true)
  assert.equal(initDataUserId(undefined), undefined)
})

console.log(`club-socket-selftest: ${count} checks passed`)
process.exit(0)
