// What the Club's `clubauth` sends and what its reply does to the credentials (specs/club-website.md
// §3). Pure functions over the credentials ClubModel holds, so scripts/club-socket-selftest.mjs can
// drive them with the socket.
//
// - The body: a fresh Telegram login (the widget) first; in the Mini App its initData, on every open
//   and before any stored token; else the stored session's token.
// - A one-time credential (the widget, the initData) is spent only on the server's answer to it:
//   accepted, or refused for good. A busy or rate-limited server, a failed connect or a timeout keeps
//   it for the next try.
// - Only clublogout, `bad_session` or expiry clear the stored session; a refused widget or initData
//   (`bad_auth`) leaves it. In the Mini App a stored session of another Telegram user than the one
//   opening it is dropped.
import type { AuthReply } from './api.ts'

export interface Credentials {
  tma: boolean
  // A Telegram login popup's fields, waiting to be sent.
  widget?: Record<string, unknown>
  // The Mini App's launch data, and whether the server has answered it.
  initData?: string
  initDataUsed: boolean
  token?: string
}

// clubauth refusals that say nothing about the credential: it is kept for the next try.
export const TRANSIENT_AUTH: ReadonlySet<string> = new Set(['busy', 'rate_limited', 'not_open'])

/** The body of the next clubauth; undefined when there is nothing to authenticate with. */
export function authBody(c: Credentials): Record<string, unknown> | undefined {
  if (c.widget !== undefined) {
    return { widget: c.widget }
  }
  if (c.tma && !c.initDataUsed && c.initData !== undefined) {
    return { init_data: c.initData }
  }
  if (c.token !== undefined) {
    return { token: c.token }
  }
  return undefined
}

export interface AuthOutcome {
  // The credential `sent` carried is spent.
  spendWidget: boolean
  spendInitData: boolean
  // What happens to the stored session.
  session: 'set' | 'drop' | 'keep'
}

/** What one clubauth reply does, given the body it answers and the credentials held now. */
export function authOutcome(
  reply: Pick<AuthReply, 'ok' | 'reason' | 'token' | 'account'>,
  sent: Record<string, unknown> | undefined,
  c: Credentials,
): AuthOutcome {
  const answered = !(reply.ok !== true && reply.reason !== undefined && TRANSIENT_AUTH.has(reply.reason))
  return {
    spendWidget: answered && sent?.widget !== undefined && sent.widget === c.widget,
    spendInitData: answered && sent?.init_data !== undefined && sent.init_data === c.initData,
    session:
      reply.ok === true && reply.token !== undefined && reply.account !== undefined
        ? 'set'
        : reply.reason === 'bad_session'
          ? 'drop'
          : 'keep',
  }
}

/** The Telegram user id in a Mini App's initData (its `user` field), as a session's account. */
export function initDataUserId(initData: string | undefined): string | undefined {
  if (initData === undefined) {
    return undefined
  }
  try {
    const user = JSON.parse(new URLSearchParams(initData).get('user') ?? 'null')
    const id = user?.id
    return typeof id === 'number' && Number.isSafeInteger(id) ? id.toString() : undefined
  } catch {
    return undefined
  }
}

/** Whether a stored session may stay for the Telegram user opening the Mini App with `initData`. */
export function sessionFitsInitData(account: string, initData: string | undefined): boolean {
  const user = initDataUserId(initData)
  return user === undefined || user === account
}
