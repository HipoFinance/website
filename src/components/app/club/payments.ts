// The payment guard (specs/club-website.md §6): the one function that asks a wallet to sign a Club
// payment, and the checks that run before it. Money code.
//
// `sendClubPayment` is the only caller of sendTransaction for the Club. It runs the steps of §6 in
// order and sends nothing when any of them fails:
//
//   1. static checks: a session, not frozen, no wallet mismatch, enough GRAM;
//   2. a payment on its way, read from the chain: the Club wallet's own transactions back 24 h, at a
//      block no older than ~60 s by server time, at most 10 pages, failing closed;
//   3. a pending lock in this browser for the same account and target;
//   4. a re-read of clubstatus / cluboverview (and clublevels for an upgrade) right before the send;
//   5. the server's "payment in progress" record, which every device of the account sees (decided
//      2026-10-27): an open one in the re-read refuses; otherwise `clubpayintent` opens one, and
//      anything but its `ok` (a refusal, an error, a closed socket) sends nothing;
//   6. after the last await: the connected wallet is still the Club wallet and no other tab wrote a
//      lock meanwhile; then the pending lock is written and sendTransaction is called;
//   7. the lock is released only on evidence (a wallet rejection, which also cancels the server's
//      record, the server showing the payment, a complete chain read past validUntil + 60 s with no
//      matching message, or a landed message over 24 h old that the member has acknowledged).
//
// Every decision below is a pure function of what was read, so scripts/club-tx-selftest.mjs can drive
// it with fake transaction lists. Server time is the device clock plus the offset of the last Club
// reply's `now`; the chain checks use the block's own time instead.
//
// Two tabs of one browser share the locks: the whole guard runs under the Web Lock
// `hipo.club.pay:<account>` where the browser has one, and the lock list is re-read synchronously
// right before a lock is written, so a second tab can never write a second lock and send.
import type { Address, Cell } from '@ton/core'
import type { TonClient4 } from '@ton/ton'
import {
  CLAIM_FEE_NANO,
  CLAIM_MIN_NANO,
  HIPO_TON,
  OP_CLAIM,
  OP_UPGRADE,
  buildClaimTx,
  buildUpgradeTx,
  parseHpoNano,
  upgradeAmountNano,
  upgradeTarget,
  validUntilAt,
  type CellBuilder,
  type ClubTx,
} from './clubTx.ts'

// ------------------------------------------------------------------------------------------ constants

// g, the gas margin of the balance check (display only; the wallet pays its own fees).
export const GAS_MARGIN_NANO = 50_000_000n
// How old the block of a chain read may be, by server time.
export const MAX_BLOCK_AGE = 60
// How far back the chain read must reach: a transaction older than this, by chain time.
export const LOOKBACK = 24 * 60 * 60
// The page cap of the chain read; hitting it first fails closed.
export const MAX_PAGES = 10
// A pending payment can no longer land once a block this far past validUntil is read.
export const LAND_MARGIN = 60
// A claim sent before L counts as settled by the old rules only once it is this far past the
// server's 24 h hold-back of a waiting fee (jobs.go htonSweepHoldBack), so a fee still held there
// keeps blocking: one hour for a pass that starts just inside the 24 h. Money audit, 2026-10-31.
export const PRE_L_SETTLED_AFTER = LOOKBACK + 60 * 60
// Release (2) of a claim lock compares the claim record's time with `created` minus this, for the
// skew between the server clock (`created`) and chain time (`claim_time`) — the server audit's note.
export const CLAIM_RECORD_SKEW = 60
// The same skew on the chain side: a lock's own message lands in a transaction of chain time at
// least `created` minus this, so a read that reaches an older transaction covers the lock.
export const CHAIN_TIME_SKEW = 60
// State E: Upgrade is off while the restore deadline is this close, or past (§7).
export const SUSPEND_DEADLINE_MARGIN = 60 * 60
// L, the launch: Sat 2026-10-31 09:00 UTC (the server's --season-end).
export const CLUB_LAUNCH = 1793437200
// Wrapup pass 2 may raise a `noclaim` account from L + 24 h; Upgrade pauses for it from L + 23 h.
export const WRAPUP_PAUSE_FROM = CLUB_LAUNCH + 23 * 60 * 60
// A claim that opens at `claims_open_at` is offered from 60 s after it, by server time (§6a).
export const CLAIMS_OPEN_MARGIN = 60

export const LOCKS_KEY = 'hipo.club.pending'
// Written once before the server record is opened: a browser that keeps nothing is refused there,
// before an open record would block the account's other devices for nothing.
export const STORE_PROBE_KEY = 'hipo.club.pay.probe'
export const ACKS_KEY = 'hipo.club.acks'
// The Web Lock the whole guard runs under, per account (shared by the tabs of one browser).
export const PAY_WEB_LOCK = 'hipo.club.pay:'

// ------------------------------------------------------------------------------------------ types

export type PaymentKind = 'claim' | 'upgrade'
// What a pending lock and an acknowledgement are keyed by: n for an upgrade, 'claim' for a claim.
export type Target = number | 'claim'

export interface PendingLock {
  // A random nonce: the lock is removed and updated by it alone, so one tab never touches another
  // tab's lock. Optional only for a lock stored before ids existed.
  id?: string
  account: string
  target: Target
  validUntil: number
  // Server time when the lock was written, just before sendTransaction.
  created: number
  // The Club wallet's last transaction LT from the step-2 read, as a decimal string (0 when none).
  startLt: string
  // The wallet the payment was sent from (raw), for reading past Club wallets later.
  wallet?: string
  // Where the chain check of this lock goes on next time: everything from the top of the read that
  // stored it down to here had no matching message, and that read was at a block ≥ validUntil + 60,
  // so no later transaction can carry this lock's message. Set when the lock is older than one
  // read can reach.
  resume?: ChainCursor
}

// A place in an account's transaction list, JSON-safe: the LT (decimal) and hash (base64) of the
// next transaction to read, going back.
export interface ChainCursor {
  lt: string
  hash: string
}

// One Club-wallet transaction as the guard needs it: its LT, chain time, and the matching messages it
// sent to hipo.ton.
export interface ChainTx {
  lt: bigint
  now: number
  matches: MatchedMessage[]
}

// An outgoing message to hipo.ton with a Club op. `level` is the upgrade's n; undefined when the body
// is too short to carry one, which is treated as matching every n (it can only over-block).
export interface MatchedMessage {
  op: 'claim' | 'upgrade'
  level?: number
}

export interface ChainRead {
  // The block the read was made at: its time (chain time) and the account's balance there.
  blockTime: number
  balance: bigint
  // The account's last transaction LT at that block (0n for an account with no transactions).
  lastLt: bigint
  // Newest first; every transaction of the account with lt > coveredFrom.
  txs: ChainTx[]
  coveredFrom: bigint
  // True when the pages reached a transaction older than LOOKBACK, or the account's first one.
  reachedLookback: boolean
  // Where the next older page would start; undefined once the account's first transaction is in.
  cursor?: ChainCursor
}

export type ChainReadFailure = 'stale' | 'readFailed' | 'pageLimit'

// The server's "payment in progress" record (`pay_in_progress` of cluboverview / clubstatus, and of a
// `payment_in_progress` refusal of clubpayintent): one per account, open until the payment is
// applied or until valid_until + 1260 s by server time. `unknown` is a record whose target the page
// cannot read; it blocks both payments.
export interface ServerPayIntent {
  target: 'claim' | 'upgrade' | 'unknown'
  // The upgrade's n (1-based), as the message carries it.
  level?: number
  validUntil?: number
  // Server time when the record was opened.
  created?: number
}

/** Whether an open record is this very payment (then "on its way"), not another one. */
export function intentCovers(intent: ServerPayIntent, target: Target | undefined): boolean {
  if (intent.target === 'claim') {
    return target === 'claim'
  }
  if (intent.target === 'upgrade') {
    return typeof target === 'number' && (intent.level === undefined || intent.level === target)
  }
  return false
}

// What clubpayintent answered: ok with the record it wrote (its `created` is what clubpaycancel
// names), or a refusal (`payment_in_progress` with the open record).
export type PayIntentAnswer = { ok: true; created?: number } | { ok: false; reason?: string; open?: ServerPayIntent }

// The claim records of cluboverview that can show a claim fee applied (`claim_in_progress` and
// `recent_claims`): `claim_time` is chain time, 0 on old records, which then count by `request_time`.
export interface ClaimRecordTimes {
  claimTime?: number
  requestTime?: number
}

export function claimRecordTime(record: ClaimRecordTimes): number | undefined {
  if (record.claimTime != null && record.claimTime > 0) {
    return record.claimTime
  }
  if (record.requestTime != null && record.requestTime > 0) {
    return record.requestTime
  }
  return undefined
}

function sameTarget(match: MatchedMessage, target: Target): boolean {
  if (target === 'claim') {
    return match.op === 'claim'
  }
  return match.op === 'upgrade' && (match.level === undefined || match.level === target)
}

// --------------------------------------------------------------------------------- chain judgement

/** Fail closed on a read that is stale by server time, or that did not reach back far enough. */
export function chainReadProblem(read: ChainRead, serverNow: number): ChainReadFailure | undefined {
  if (!Number.isFinite(serverNow) || serverNow - read.blockTime > MAX_BLOCK_AGE) {
    return 'stale'
  }
  if (!read.reachedLookback) {
    return 'pageLimit'
  }
  return undefined
}

// Whether the server shows a matching message of chain time `txNow` as applied (§6 step 2).
export interface AppliedEvidence {
  // clubstatus.club_level, 0-based.
  clubLevel?: number
  claims: ClaimRecordTimes[]
}

export function messageApplied(target: Target, txNow: number, evidence: AppliedEvidence, blockTime: number): boolean {
  if (target === 'claim') {
    // A claim sent before L is never in the account's history (recent_claims): the old rules'
    // sweep settled it. Once it is past the old sweep's hold-back it can no longer be paid, so it
    // counts as applied; inside that window the old sweep may still hold it, and it is judged as
    // before (on its way within 24 h).
    if (txNow < CLUB_LAUNCH && blockTime - txNow > PRE_L_SETTLED_AFTER) {
      return true
    }
    return evidence.claims.some((record) => {
      const time = claimRecordTime(record)
      return time !== undefined && time >= txNow
    })
  }
  return evidence.clubLevel !== undefined && evidence.clubLevel >= target - 1
}

export type ChainVerdict =
  | { kind: 'clear' }
  | { kind: 'onItsWay'; at: number }
  | { kind: 'notApplied'; at: number; ackKey: string }

export function ackKeyOf(account: string, target: Target, lt: bigint): string {
  return `${account}|${target}|${lt.toString()}`
}

/**
 * §6 step 2 on a complete read: the newest matching message that is not applied decides. At most
 * 24 h old by chain time → on its way; older → "wasn't applied; contact support", which blocks until
 * the member acknowledges it (its ack key is then in `acks`).
 */
export function judgeChain(
  read: ChainRead,
  account: string,
  target: Target,
  evidence: AppliedEvidence,
  acks: ReadonlySet<string>,
): ChainVerdict {
  for (const tx of read.txs) {
    if (!tx.matches.some((match) => sameTarget(match, target))) {
      continue
    }
    if (messageApplied(target, tx.now, evidence, read.blockTime)) {
      continue
    }
    if (read.blockTime - tx.now <= LOOKBACK) {
      return { kind: 'onItsWay', at: tx.now }
    }
    const ackKey = ackKeyOf(account, target, tx.lt)
    if (!acks.has(ackKey)) {
      return { kind: 'notApplied', at: tx.now, ackKey }
    }
  }
  return { kind: 'clear' }
}

export type LockVerdict =
  | { kind: 'released'; by: 'server' | 'chain' | 'ack' }
  | { kind: 'keep'; why: 'onItsWay' | 'waiting' | 'noRead'; at?: number }
  | { kind: 'notApplied'; at: number; ackKey: string }

/**
 * §6 step 6, releases (2)–(4). (1), the wallet's explicit rejection, is decided where the send
 * returns. A lock never expires on time alone: without evidence it is kept.
 */
export function judgeLock(
  lock: PendingLock,
  read: ChainRead | undefined,
  evidence: AppliedEvidence,
  acks: ReadonlySet<string>,
): LockVerdict {
  // (2) The server shows it applied.
  if (lock.target === 'claim') {
    const since = lock.created - CLAIM_RECORD_SKEW
    if (
      evidence.claims.some((record) => {
        const time = claimRecordTime(record)
        return time !== undefined && time >= since
      })
    ) {
      return { kind: 'released', by: 'server' }
    }
  } else if (evidence.clubLevel !== undefined && evidence.clubLevel >= lock.target - 1) {
    return { kind: 'released', by: 'server' }
  }
  if (read === undefined) {
    return { kind: 'keep', why: 'noRead' }
  }
  const covered = lockCovered(lock, read)
  // A matching message that landed after the lock was created.
  const landed = landedFor(lock, read.txs)
  if (landed !== undefined) {
    if (read.blockTime - landed.now <= LOOKBACK) {
      return { kind: 'keep', why: 'onItsWay', at: landed.now }
    }
    // (4) Landed more than 24 h ago and still not applied: released once the member has read it.
    const ackKey = ackKeyOf(lock.account, lock.target, landed.lt)
    if (acks.has(ackKey)) {
      return { kind: 'released', by: 'ack' }
    }
    return { kind: 'notApplied', at: landed.now, ackKey }
  }
  // (3) Nothing landed, the read covers every transaction from the lock's creation to its block, and
  // that block is at least 60 s past validUntil by chain time: the request can no longer land.
  if (covered && read.blockTime >= lock.validUntil + LAND_MARGIN) {
    return { kind: 'released', by: 'chain' }
  }
  return { kind: 'keep', why: 'waiting' }
}

/** The newest matching message among `txs` that landed after the lock was created. */
function landedFor(lock: PendingLock, txs: ChainTx[]): ChainTx | undefined {
  const startLt = lockStartLt(lock)
  // By LT, or by chain time when the stored startLt is unreadable.
  return txs.find(
    (tx) =>
      (startLt !== undefined ? tx.lt > startLt : tx.now >= lock.created - CHAIN_TIME_SKEW) &&
      tx.matches.some((match) => sameTarget(match, lock.target)),
  )
}

function lockStartLt(lock: PendingLock): bigint | undefined {
  try {
    return BigInt(lock.startLt)
  } catch {
    return undefined
  }
}

/**
 * Whether a read covers every transaction since the lock was created: its pages reach the lock's
 * startLt, or a transaction of chain time below `created` − 60 s (which also covers a lock whose
 * startLt is unreadable). The read must be of the wallet that paid the lock; settleLocksWithChain
 * reads that wallet itself.
 */
export function lockCovered(lock: PendingLock, read: ChainRead): boolean {
  const startLt = lockStartLt(lock)
  if (startLt !== undefined && read.coveredFrom <= startLt) {
    return true
  }
  return read.txs.some((tx) => tx.now < lock.created - CHAIN_TIME_SKEW)
}

// ------------------------------------------------------------------------------------- chain reader

export interface ChainReadOptions {
  // Also page back, within the page cap, until every transaction with lt > downToLt is covered (a
  // lock's startLt) or a transaction older than downToTime (chain time) is reached. Unlike the
  // lookback, not reaching it is no failure: the read returns what it has and its cursor.
  downToLt?: bigint
  downToTime?: number
  // Page on from here (an earlier read's cursor) instead of the account's last transaction; the
  // lookback then does not apply.
  from?: ChainCursor
}

export interface ChainReader {
  read(address: Address, options?: ChainReadOptions): Promise<ChainRead>
}

export class ChainReadError extends Error {
  // A plain field, not a parameter property: the selftest runs this file through Node's type
  // stripping, which has no parameter properties.
  failure: ChainReadFailure

  constructor(failure: ChainReadFailure) {
    super(failure)
    this.failure = failure
  }
}

// What the real reader needs from ./chain.ts and the Model; passed in so this module imports nothing
// from @ton/* at run time.
export interface ChainDeps {
  tonClient: () => TonClient4 | undefined
  parseAddress: (friendly: string) => Address
  // The first page again from an archive (toncenter), for when the v4 endpoint cannot read it: its
  // node keeps about 16 h of history, so a wallet idle longer than that fails there. Undefined: no
  // second source, and that failure stays readFailed.
  archivePage?: (address: Address, hipo: Address) => Promise<ChainTx[] | undefined>
}

// toncenter's getTransactions: a liteserver proxy with full history, open to any origin.
export const ARCHIVE_URL = 'https://toncenter.com/api/v2/getTransactions'
export const ARCHIVE_PAGE = 20

/**
 * The account's newest ARCHIVE_PAGE transactions from toncenter, newest first, parsed the way the v4
 * reader parses them. Undefined on any failure or an unexpected shape: the caller then fails closed.
 */
export async function archiveFirstPage(
  address: Address,
  hipo: Address,
  parseAddress: (friendly: string) => Address,
  cellFromBase64: (boc: string) => Cell,
  fetchFn: typeof fetch = fetch,
): Promise<ChainTx[] | undefined> {
  try {
    const url = `${ARCHIVE_URL}?address=${encodeURIComponent(address.toString())}&limit=${ARCHIVE_PAGE}&archival=true`
    const response = await fetchFn(url)
    if (!response.ok) {
      return undefined
    }
    const json = await response.json()
    if (json?.ok !== true || !Array.isArray(json.result)) {
      return undefined
    }
    return json.result.map((tx: any): ChainTx => {
      const matches: MatchedMessage[] = []
      for (const message of tx.out_msgs ?? []) {
        let dest: Address
        try {
          dest = parseAddress(message.destination)
        } catch {
          continue // an external out message has no destination
        }
        const body = message.msg_data?.['@type'] === 'msg.dataRaw' ? message.msg_data.body : undefined
        if (!dest.equals(hipo) || typeof body !== 'string' || body === '') {
          continue
        }
        const match = matchOfBody(cellFromBase64(body))
        if (match !== undefined) {
          matches.push(match)
        }
      }
      return { lt: BigInt(tx.transaction_id.lt), now: Number(tx.utime), matches }
    })
  } catch {
    return undefined
  }
}

function bufferFromHash(hash: bigint): Buffer {
  return Buffer.from(hash.toString(16).padStart(64, '0'), 'hex')
}

function cursorOf(lt: bigint, hash: bigint): ChainCursor | undefined {
  return lt === 0n ? undefined : { lt: lt.toString(), hash: bufferFromHash(hash).toString('base64') }
}

function matchesOf(tx: any, hipo: Address): MatchedMessage[] {
  const out: MatchedMessage[] = []
  for (const message of tx.outMessages.values()) {
    if (message.info.type !== 'internal' || !message.info.dest.equals(hipo)) {
      continue
    }
    const match = matchOfBody(message.body)
    if (match !== undefined) {
      out.push(match)
    }
  }
  return out
}

export function matchOfBody(body: Cell): MatchedMessage | undefined {
  try {
    const slice = body.beginParse()
    if (slice.remainingBits < 32) {
      return undefined
    }
    const op = slice.loadUint(32)
    if (op === OP_CLAIM) {
      return { op: 'claim' }
    }
    if (op === OP_UPGRADE) {
      if (slice.remainingBits >= 72) {
        slice.loadUintBig(64)
        return { op: 'upgrade', level: slice.loadUint(8) }
      }
      return { op: 'upgrade' }
    }
  } catch {
    // An unreadable body is no Club message.
  }
  return undefined
}

/** The real reader: the Club wallet's transactions through TonClient4, newest first. */
export function createChainReader(deps: ChainDeps): ChainReader {
  return {
    read: async (address, options = {}) => {
      const client = deps.tonClient()
      if (client === undefined) {
        throw new ChainReadError('readFailed')
      }
      const hipo = deps.parseAddress(HIPO_TON)
      try {
        const last = await client.getLastBlock()
        const account = await client.getAccountLite(last.last.seqno, address)
        const blockTime = last.now
        const balance = BigInt(account.account.balance.coins)
        if (account.account.last == null) {
          return { blockTime, balance, lastLt: 0n, txs: [], coveredFrom: 0n, reachedLookback: true }
        }
        const lastLt = BigInt(account.account.last.lt)
        const from = options.from
        let lt = from !== undefined ? BigInt(from.lt) : lastLt
        let hash: Buffer = Buffer.from(from !== undefined ? from.hash : account.account.last.hash, 'base64')
        const txs: ChainTx[] = []
        let coveredFrom = lt
        let reachedLookback = from !== undefined
        let cursor: ChainCursor | undefined
        for (let page = 0; page < MAX_PAGES; page++) {
          let batch: Awaited<ReturnType<TonClient4['getAccountTransactions']>> = []
          try {
            batch = await client.getAccountTransactions(address, lt, hash)
          } catch {
            // an empty batch: the archive below, or readFailed
          }
          if (batch.length === 0) {
            // The v4 node cannot read a transaction older than its history. A plain read (no cursor,
            // no lock to reach) takes the first page from the archive instead, but only when it is the
            // same chain (its newest transaction is the account's last one) and that transaction is
            // already past the lookback, so the page is the whole read the v4 path would have made.
            const plain = page === 0 && from === undefined && options.downToLt === undefined
            if (plain && options.downToTime === undefined && deps.archivePage !== undefined) {
              const archived = await deps.archivePage(address, hipo)
              const newest = archived?.[0]
              if (newest !== undefined && newest.lt === lastLt && newest.now < blockTime - LOOKBACK) {
                return {
                  blockTime,
                  balance,
                  lastLt,
                  txs: archived!,
                  coveredFrom: archived![archived!.length - 1].lt,
                  reachedLookback: true,
                }
              }
            }
            throw new ChainReadError('readFailed')
          }
          for (const { tx } of batch) {
            // Pages overlap at their boundary in some gateways; skip what is already in.
            if (txs.length > 0 && tx.lt >= txs[txs.length - 1].lt) {
              continue
            }
            txs.push({ lt: tx.lt, now: tx.now, matches: matchesOf(tx, hipo) })
          }
          const oldest = batch[batch.length - 1].tx
          coveredFrom = oldest.prevTransactionLt
          cursor = cursorOf(oldest.prevTransactionLt, oldest.prevTransactionHash)
          reachedLookback ||= oldest.now < blockTime - LOOKBACK || oldest.prevTransactionLt === 0n
          const reachedLock =
            (options.downToLt === undefined && options.downToTime === undefined) ||
            (options.downToLt !== undefined && coveredFrom <= options.downToLt) ||
            (options.downToTime !== undefined && oldest.now < options.downToTime)
          if ((reachedLookback && reachedLock) || oldest.prevTransactionLt === 0n) {
            return { blockTime, balance, lastLt, txs, coveredFrom, reachedLookback, cursor }
          }
          lt = oldest.prevTransactionLt
          hash = bufferFromHash(oldest.prevTransactionHash)
        }
        // The page cap: a failure only while the 24 h lookback is not reached. A lock further back
        // than the cap is paged on from the cursor (see continueLockRead).
        if (!reachedLookback) {
          throw new ChainReadError('pageLimit')
        }
        return { blockTime, balance, lastLt, txs, coveredFrom, reachedLookback, cursor }
      } catch (e) {
        if (e instanceof ChainReadError) {
          throw e
        }
        throw new ChainReadError('readFailed')
      }
    },
  }
}

// -------------------------------------------------------------------------------- local storage

export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function readJsonList(store: KeyValueStore, key: string): unknown[] {
  try {
    const parsed = JSON.parse(store.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function isLock(value: any): value is PendingLock {
  return (
    value != null &&
    typeof value.account === 'string' &&
    (value.target === 'claim' || (Number.isSafeInteger(value.target) && value.target >= 2 && value.target <= 10)) &&
    Number.isSafeInteger(value.validUntil) &&
    typeof value.created === 'number' &&
    typeof value.startLt === 'string'
  )
}

// A malformed `resume` or `id` never drops the lock itself (that would let a second send through):
// the field alone is left out.
function cleanLock(lock: PendingLock): PendingLock {
  const clean: PendingLock = { ...lock }
  const resume = lock.resume as unknown as { lt?: unknown; hash?: unknown } | undefined
  if (
    resume !== undefined &&
    !(typeof resume?.lt === 'string' && /^[0-9]+$/.test(resume.lt) && typeof resume.hash === 'string')
  ) {
    delete clean.resume
  }
  if (lock.id !== undefined && typeof lock.id !== 'string') {
    delete clean.id
  }
  if (lock.wallet !== undefined && typeof lock.wallet !== 'string') {
    delete clean.wallet
  }
  return clean
}

export function readLocks(store: KeyValueStore): PendingLock[] {
  return readJsonList(store, LOCKS_KEY).filter(isLock).map(cleanLock)
}

export function locksFor(store: KeyValueStore, account: string, target: Target): PendingLock[] {
  return readLocks(store).filter((lock) => lock.account === account && lock.target === target)
}

/** What a lock is removed and updated by: its nonce, or for a lock from before ids all its fields. */
export function lockKey(lock: PendingLock): string {
  return lock.id ?? `${lock.account}|${lock.target}|${lock.validUntil}|${lock.created}|${lock.startLt}`
}

/** A random nonce for a new lock. */
export function newLockId(): string {
  const bytes = new Uint8Array(16)
  const crypto = (globalThis as { crypto?: { getRandomValues?: (array: Uint8Array) => Uint8Array } }).crypto
  if (crypto?.getRandomValues !== undefined) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Writes a lock and reads it back; throws when the store does not keep it (then nothing is sent). */
export function writeLock(store: KeyValueStore, lock: PendingLock) {
  const locks = readLocks(store)
  locks.push(lock)
  store.setItem(LOCKS_KEY, JSON.stringify(locks))
  const key = lockKey(lock)
  if (!readLocks(store).some((stored) => lockKey(stored) === key)) {
    throw new Error('the pending lock was not stored')
  }
}

/** Removes this one lock (by its id); another tab's lock for the same payment stays. */
export function removeLock(store: KeyValueStore, lock: PendingLock) {
  const key = lockKey(lock)
  store.setItem(LOCKS_KEY, JSON.stringify(readLocks(store).filter((stored) => lockKey(stored) !== key)))
}

/** Replaces this one lock (by its id) with `lock`; a lock already removed stays removed. */
export function updateLock(store: KeyValueStore, lock: PendingLock) {
  const key = lockKey(lock)
  store.setItem(LOCKS_KEY, JSON.stringify(readLocks(store).map((stored) => (lockKey(stored) === key ? lock : stored))))
}

export function readAcks(store: KeyValueStore): Set<string> {
  return new Set(readJsonList(store, ACKS_KEY).filter((value): value is string => typeof value === 'string'))
}

export function addAck(store: KeyValueStore, ackKey: string) {
  const acks = readAcks(store)
  acks.add(ackKey)
  // Bounded: an ack only matters for a message the 24 h read can still see.
  store.setItem(ACKS_KEY, JSON.stringify([...acks].slice(-50)))
}

// ---------------------------------------------------------------------------- the account reads

// What the guard reads from the server, already mapped by api.ts. Only the fields the guard checks.
export interface GuardStatus {
  clubWallet?: string
  clubLevel: number
  state: string
  switchPending: boolean
  frozen: boolean
  // The server's open "payment in progress" record, when there is one.
  payInProgress?: ServerPayIntent
}

export interface GuardOverview extends GuardStatus {
  stateUntil?: number
  unclaimed?: string
  claimOk: boolean
  claimReason?: string
  claimsOpenAt?: number
  claimInProgress: boolean
  claims: ClaimRecordTimes[]
  upgradeFee?: unknown
  wrapupPending: boolean
}

export interface GuardLevels {
  // club_levels[i].upgrade_fee as the server sent them (JSON numbers, GRAM).
  fees: unknown[]
  hasNext: boolean
}

// What the modal showed; the re-read of step 4 must agree with it.
export interface ModalSnapshot {
  clubWallet?: string
  clubLevel: number
  state: string
  switchPending: boolean
  fee?: unknown
}

// ---------------------------------------------------------------------------- the send

export type PaymentRefusal =
  | 'noSession'
  | 'noServerTime'
  | 'frozen'
  | 'mismatch'
  | 'noWallet'
  | 'switchPending'
  | 'balance'
  | 'stale'
  | 'readFailed'
  | 'pageLimit'
  | 'onItsWay'
  | 'notApplied'
  | 'locked'
  | 'lockReleased'
  | 'changed'
  | 'gate'
  | 'belowMin'
  | 'unknownBalance'
  | 'claimsNotOpen'
  | 'topLevel'
  | 'feeInvalid'
  | 'feeMismatch'
  | 'feesChanging'
  | 'deadline'
  | 'wrapup'
  | 'storage'
  | 'mockUpgrade'
  | 'serverRead'
  | 'payInProgress'
  | 'intentFailed'
  | 'walletChanged'

export type PaymentResult =
  | { outcome: 'sent'; lock: PendingLock }
  | { outcome: 'rejected' }
  | { outcome: 'walletError'; error: unknown }
  | { outcome: 'refused'; reason: PaymentRefusal; at?: number; ackKey?: string; detail?: string }

export interface PaymentContext {
  // The session's account, set only when a session exists.
  account?: string
  // Server time; undefined until the session's first Club reply has arrived.
  serverNow: () => number | undefined
  // The connected wallet when the payment was started (what the modal showed).
  connected?: Address
  // The wallet TON Connect has connected at this instant; read again right before the send.
  connectedNow: () => Address | undefined
  parseAddress: (value: string) => Address | undefined
  // Fresh reads, right before the send (step 4).
  readStatus: () => Promise<GuardStatus>
  readOverview: () => Promise<GuardOverview>
  readLevels: () => Promise<GuardLevels>
  chain: ChainReader
  store: KeyValueStore
  beginCell: CellBuilder
  network: string
  send: (tx: ClubTx) => Promise<unknown>
  isUserRejection: (error: unknown) => boolean
  // True when the account data is the local mock while a real wallet is connected: an upgrade is
  // then never sent (no real upgrade from mock data, spec §13).
  mockWithRealWallet: boolean
  // The Web Locks API the guard runs under: undefined takes `navigator.locks` when the browser has
  // it, null runs without (the synchronous re-read before the lock is written still holds).
  webLocks?: WebLocksLike | null
  // clubpayintent: opens the server's "payment in progress" record, the last await before the send.
  // Anything but `{ ok: true }`, and any throw, sends nothing.
  openPayIntent: (intent: {
    target: PaymentKind
    level?: number
    validUntil: number
    wallet: string
  }) => Promise<PayIntentAnswer>
  // clubpaycancel {created, rejected: true}: clears that record (the server clears only the one
  // created then). Called only on the wallet's explicit rejection.
  cancelPayIntent: (created: number) => Promise<void>
}

// The part of the Web Locks API (navigator.locks) the guard uses.
export interface WebLocksLike {
  request<T>(name: string, options: { ifAvailable: boolean }, callback: (lock: unknown) => Promise<T>): Promise<T>
}

function defaultWebLocks(): WebLocksLike | null {
  const locks = (globalThis as { navigator?: { locks?: WebLocksLike } }).navigator?.locks
  return locks !== undefined && typeof locks.request === 'function' ? locks : null
}

/**
 * Hook, not built yet (waits for the person): the wallets whose own transactions step 2 reads for a
 * payment on its way. Today the Club wallet alone; the account's past Club wallets would join it.
 * The first is always the Club wallet: its read also gives the balance and settles the locks.
 */
export function walletsToRead(clubWallet: Address): Address[] {
  return [clubWallet]
}

function refused(reason: PaymentRefusal, extra: Partial<{ at: number; ackKey: string; detail: string }> = {}) {
  return { outcome: 'refused' as const, reason, ...extra }
}

// An open server record refuses: this payment's own record is "on its way" (as a found chain message
// is), another payment's is `payInProgress`.
function intentRefusal(intent: ServerPayIntent, target: Target) {
  if (intentCovers(intent, target)) {
    return refused('onItsWay', intent.created !== undefined ? { at: intent.created } : {})
  }
  return refused('payInProgress')
}

function storeWritable(store: KeyValueStore): boolean {
  try {
    store.setItem(STORE_PROBE_KEY, '1')
    return store.getItem(STORE_PROBE_KEY) === '1'
  } catch {
    return false
  }
}

function sameWallet(ctx: PaymentContext, a: string | undefined, b: string | undefined): boolean {
  if (a === undefined || b === undefined) {
    return a === b
  }
  const left = ctx.parseAddress(a)
  const right = ctx.parseAddress(b)
  return left !== undefined && right !== undefined && left.equals(right)
}

/** The claim checks of §6a on fresh data; undefined when Claim may be sent. */
export function claimProblem(overview: GuardOverview, serverNow: number): PaymentRefusal | undefined {
  if (overview.frozen) {
    return 'frozen'
  }
  if (overview.switchPending) {
    return 'switchPending'
  }
  if (overview.claimInProgress || !overview.claimOk) {
    return 'gate'
  }
  const unclaimed = parseHpoNano(overview.unclaimed)
  if (unclaimed === undefined) {
    return 'unknownBalance'
  }
  if (unclaimed < CLAIM_MIN_NANO) {
    return 'belowMin'
  }
  if (
    overview.claimsOpenAt !== undefined &&
    overview.claimsOpenAt > 0 &&
    serverNow < overview.claimsOpenAt + CLAIMS_OPEN_MARGIN
  ) {
    return 'claimsNotOpen'
  }
  return undefined
}

/** The upgrade checks of §7 on fresh data; the fee f_n when it may be sent. */
export function upgradeProblem(
  overview: GuardOverview,
  levels: GuardLevels,
  serverNow: number,
): { problem: PaymentRefusal } | { n: number; fee: number } {
  if (overview.frozen) {
    return { problem: 'frozen' }
  }
  if (overview.switchPending) {
    return { problem: 'switchPending' }
  }
  const n = upgradeTarget(overview.clubLevel)
  if (n === undefined) {
    return { problem: 'topLevel' }
  }
  if (levels.hasNext) {
    return { problem: 'feesChanging' }
  }
  const fee = levels.fees[n - 1]
  if (upgradeAmountNano(fee) === undefined) {
    return { problem: 'feeInvalid' }
  }
  if (overview.upgradeFee !== fee) {
    return { problem: 'feeMismatch' }
  }
  if (overview.state === 'suspended') {
    if (overview.stateUntil === undefined || overview.stateUntil - serverNow <= SUSPEND_DEADLINE_MARGIN) {
      return { problem: 'deadline' }
    }
  }
  if (overview.wrapupPending && serverNow >= WRAPUP_PAUSE_FROM) {
    return { problem: 'wrapup' }
  }
  return { n, fee: fee as number }
}

/**
 * Tries to release this account's locks for `target` from what was just read; returns the locks
 * still held and, when one blocks on an unapplied landed message, that verdict.
 */
export function settleLocks(
  store: KeyValueStore,
  account: string,
  target: Target,
  read: ChainRead | undefined,
  evidence: AppliedEvidence,
): { held: PendingLock[]; verdict?: LockVerdict } {
  const acks = readAcks(store)
  const held: PendingLock[] = []
  let verdict: LockVerdict | undefined
  for (const lock of locksFor(store, account, target)) {
    const judged = judgeLock(lock, read, evidence, acks)
    if (judged.kind === 'released') {
      removeLock(store, lock)
    } else {
      held.push(lock)
      if (verdict === undefined || judged.kind === 'notApplied') {
        verdict = judged
      }
    }
  }
  return { held, verdict }
}

/**
 * A held lock the guard's read does not cover (older than its pages reach) is paged on from where
 * that read stopped, or from the lock's own `resume` when that is further back, up to the page cap
 * again. When the block is ≥ validUntil + 60 and still nothing matched, the place it stopped is
 * stored in the lock, so the next attempt goes on from there and the lock is released in the end
 * (§6 step 6 (3)): a member is never blocked for good by a busy wallet.
 */
export async function continueLockRead(
  ctx: Pick<PaymentContext, 'chain' | 'store'>,
  address: Address,
  lock: PendingLock,
  read: ChainRead,
): Promise<ChainRead> {
  if (lockCovered(lock, read) || read.blockTime < lock.validUntil + LAND_MARGIN) {
    return read
  }
  // A match already in the read decides without paging further.
  if (landedFor(lock, read.txs) !== undefined) {
    return read
  }
  let from = read.cursor
  if (lock.resume !== undefined && (from === undefined || BigInt(lock.resume.lt) < BigInt(from.lt))) {
    from = lock.resume
  }
  if (from === undefined) {
    return read
  }
  let more: ChainRead
  try {
    more = await ctx.chain.read(address, {
      from,
      downToLt: lockStartLt(lock),
      downToTime: lock.created - CHAIN_TIME_SKEW,
    })
  } catch {
    return read
  }
  const lowest = read.txs.length > 0 ? read.txs[read.txs.length - 1].lt : undefined
  const merged: ChainRead = {
    ...read,
    txs: [...read.txs, ...more.txs.filter((tx) => lowest === undefined || tx.lt < lowest)],
    coveredFrom: more.coveredFrom,
    cursor: more.cursor,
  }
  if (landedFor(lock, merged.txs) === undefined && !lockCovered(lock, merged) && merged.cursor !== undefined) {
    updateLock(ctx.store, { ...lock, resume: merged.cursor })
  }
  return merged
}

/**
 * settleLocks with the chain: each held lock for this target is judged on the guard's read, paged
 * on for that lock where the read does not reach it (continueLockRead).
 */
export async function settleLocksWithChain(
  ctx: Pick<PaymentContext, 'chain' | 'store' | 'parseAddress' | 'serverNow'>,
  address: Address,
  account: string,
  target: Target,
  read: ChainRead,
  evidence: AppliedEvidence,
): Promise<{ held: PendingLock[]; verdict?: LockVerdict }> {
  const acks = readAcks(ctx.store)
  const held: PendingLock[] = []
  let verdict: LockVerdict | undefined
  for (const lock of locksFor(ctx.store, account, target)) {
    // A lock is judged on a read of the wallet that paid it. When the Club wallet has changed since,
    // the guard's read is of another wallet and never counts; the lock's own wallet is read instead.
    // A lock without a wallet (old locks) is judged on the guard's read, as before.
    const own = lock.wallet !== undefined ? ctx.parseAddress(lock.wallet) : undefined
    let lockAddress = address
    let lockRead: ChainRead | undefined = read
    if (lock.wallet !== undefined && (own === undefined || !own.equals(address))) {
      lockRead = undefined
      if (own !== undefined) {
        lockAddress = own
        try {
          const one = await ctx.chain.read(own, {
            downToLt: lockStartLt(lock),
            downToTime: lock.created - CHAIN_TIME_SKEW,
          })
          if (chainReadProblem(one, ctx.serverNow() ?? one.blockTime) === undefined) {
            lockRead = one
          }
        } catch {
          // Unreadable: the lock is kept.
        }
      }
    }
    let judged = judgeLock(lock, lockRead, evidence, acks)
    if (lockRead !== undefined && judged.kind === 'keep' && judged.why === 'waiting') {
      judged = judgeLock(lock, await continueLockRead(ctx, lockAddress, lock, lockRead), evidence, acks)
    }
    if (judged.kind === 'released') {
      removeLock(ctx.store, lock)
    } else {
      held.push(lock)
      if (verdict === undefined || judged.kind === 'notApplied') {
        verdict = judged
      }
    }
  }
  return { held, verdict }
}

/**
 * The one function that sends a Club payment (§6). `kind` is the payment; `snapshot` is what the
 * modal showed. Any failed step returns a refusal and nothing is sent.
 *
 * It runs under the Web Lock `hipo.club.pay:<account>` (ifAvailable) where the browser has Web
 * Locks: while another tab of this browser is in the guard for the account, this one is refused as
 * `locked` at once rather than queued behind that tab's wallet prompt.
 */
export async function sendClubPayment(
  ctx: PaymentContext,
  kind: PaymentKind,
  snapshot: ModalSnapshot,
): Promise<PaymentResult> {
  const account = ctx.account
  if (account === undefined) {
    return refused('noSession')
  }
  const locks = ctx.webLocks === undefined ? defaultWebLocks() : ctx.webLocks
  if (locks === null) {
    return guard(ctx, kind, snapshot)
  }
  let ran = false
  try {
    return await locks.request(PAY_WEB_LOCK + account, { ifAvailable: true }, async (held) => {
      ran = true
      return held == null ? refused('locked') : guard(ctx, kind, snapshot)
    })
  } catch (e) {
    // The Web Lock itself failed (a sandboxed frame): the guard runs without it, once.
    if (ran) {
      throw e
    }
    return guard(ctx, kind, snapshot)
  }
}

async function guard(ctx: PaymentContext, kind: PaymentKind, snapshot: ModalSnapshot): Promise<PaymentResult> {
  // 1. Static checks.
  const account = ctx.account
  if (account === undefined) {
    return refused('noSession')
  }
  const now0 = ctx.serverNow()
  if (now0 === undefined) {
    return refused('noServerTime')
  }
  if (kind === 'upgrade' && ctx.mockWithRealWallet) {
    return refused('mockUpgrade')
  }
  if (snapshot.clubWallet === undefined) {
    return refused('noWallet')
  }
  const connected = ctx.connected
  const clubWallet = ctx.parseAddress(snapshot.clubWallet)
  if (connected === undefined || clubWallet === undefined) {
    return refused('noWallet')
  }
  if (!connected.equals(clubWallet)) {
    return refused('mismatch')
  }
  const target: Target = kind === 'claim' ? 'claim' : (upgradeTarget(snapshot.clubLevel) ?? -1)
  if (target === -1) {
    return refused('topLevel')
  }

  // 2. A payment on its way, from the chain. Paged back, within the page cap, to every held lock as
  // well, so the same read can settle them in step 3 (an older lock is paged on there).
  const pending = locksFor(ctx.store, account, target)
  let downToLt: bigint | undefined
  let downToTime: number | undefined
  for (const lock of pending) {
    const lt = lockStartLt(lock)
    if (lt !== undefined && (downToLt === undefined || lt < downToLt)) {
      downToLt = lt
    }
    const time = lock.created - CHAIN_TIME_SKEW
    downToTime = downToTime === undefined || time < downToTime ? time : downToTime
  }
  const wallets = walletsToRead(clubWallet)
  const reads: ChainRead[] = []
  for (const [index, wallet] of wallets.entries()) {
    let one: ChainRead
    try {
      one = await ctx.chain.read(wallet, index === 0 ? { downToLt, downToTime } : {})
    } catch (e) {
      return refused(e instanceof ChainReadError ? e.failure : 'readFailed')
    }
    const problem = chainReadProblem(one, ctx.serverNow() ?? now0)
    if (problem !== undefined) {
      return refused(problem)
    }
    reads.push(one)
  }
  // The Club wallet's read: the balance, the lock's startLt and the lock settling come from it.
  const read = reads[0]
  const now2 = ctx.serverNow() ?? now0

  let status: GuardStatus
  let overview: GuardOverview
  try {
    ;[status, overview] = await Promise.all([ctx.readStatus(), ctx.readOverview()])
  } catch {
    return refused('serverRead')
  }
  const evidence: AppliedEvidence = { clubLevel: status.clubLevel, claims: overview.claims }

  // 3. A pending lock in this browser: send nothing, and try to release it.
  if (pending.length > 0) {
    const { held, verdict } = await settleLocksWithChain(ctx, clubWallet, account, target, read, evidence)
    if (held.length === 0) {
      return refused('lockReleased')
    }
    if (verdict?.kind === 'notApplied') {
      return refused('notApplied', { at: verdict.at, ackKey: verdict.ackKey })
    }
    if (verdict?.kind === 'keep' && verdict.why === 'onItsWay') {
      return refused('onItsWay', { at: verdict.at })
    }
    return refused('locked')
  }

  const acks = readAcks(ctx.store)
  for (const one of reads) {
    const verdict = judgeChain(one, account, target, evidence, acks)
    if (verdict.kind === 'onItsWay') {
      return refused('onItsWay', { at: verdict.at })
    }
    if (verdict.kind === 'notApplied') {
      return refused('notApplied', { at: verdict.at, ackKey: verdict.ackKey })
    }
  }

  // The server's open "payment in progress" record, from another device, the Mini App or this one.
  const openIntent = overview.payInProgress ?? status.payInProgress
  if (openIntent !== undefined) {
    return intentRefusal(openIntent, target)
  }

  // 4. Re-read just before the send: clubstatus and cluboverview were read above, after the chain;
  // an upgrade also reads a fresh clublevels. Anything that differs from the modal refreshes it.
  let levels: GuardLevels | undefined
  if (kind === 'upgrade') {
    try {
      levels = await ctx.readLevels()
    } catch {
      return refused('serverRead')
    }
  }
  for (const fresh of [status, overview]) {
    if (
      !sameWallet(ctx, fresh.clubWallet, snapshot.clubWallet) ||
      fresh.clubLevel !== snapshot.clubLevel ||
      fresh.state !== snapshot.state ||
      fresh.switchPending !== snapshot.switchPending
    ) {
      return refused('changed')
    }
  }
  if (status.frozen || overview.frozen) {
    return refused('frozen')
  }
  const now4 = ctx.serverNow() ?? now2

  let tx: ClubTx | undefined
  let amount: bigint
  const validUntil = validUntilAt(now4)
  if (validUntil === undefined) {
    return refused('noServerTime')
  }
  const from = connected.toRawString()
  if (kind === 'claim') {
    const claim = claimProblem(overview, now4)
    if (claim !== undefined) {
      return refused(claim, claim === 'gate' ? { detail: overview.claimReason ?? 'in_progress' } : {})
    }
    amount = BigInt(CLAIM_FEE_NANO)
    tx = buildClaimTx({ beginCell: ctx.beginCell, from, validUntil, network: ctx.network })
  } else {
    const upgrade = upgradeProblem(overview, levels!, now4)
    if ('problem' in upgrade) {
      return refused(upgrade.problem)
    }
    if (upgrade.n !== target || upgrade.fee !== snapshot.fee) {
      return refused('changed')
    }
    tx = buildUpgradeTx({
      beginCell: ctx.beginCell,
      from,
      validUntil,
      network: ctx.network,
      n: upgrade.n,
      fee: upgrade.fee,
    })
    if (tx === undefined) {
      return refused('feeInvalid')
    }
    amount = BigInt(tx.messages[0].amount)
  }
  // The balance check of step 1, on the balance of the same read.
  if (read.balance < amount + GAS_MARGIN_NANO) {
    return refused('balance', { detail: (amount + GAS_MARGIN_NANO).toString() })
  }

  // 5. The server's record. The checks of step 6 run once before it too, so no record is opened for a
  // send that would be refused anyway (an open record blocks every device until the server has processed it).
  const early = lastChecks(ctx, clubWallet, account, target)
  if (early !== undefined) {
    return early
  }
  if (!storeWritable(ctx.store)) {
    return refused('storage')
  }
  let answer: PayIntentAnswer
  try {
    answer = await ctx.openPayIntent({
      target: kind,
      ...(kind === 'upgrade' ? { level: target as number } : {}),
      validUntil,
      wallet: clubWallet.toRawString(),
    })
  } catch {
    // A closed socket or a timeout: the record may or may not be open; fail closed.
    return refused('intentFailed')
  }
  if (answer?.ok !== true) {
    if (answer?.reason === 'payment_in_progress') {
      return answer.open !== undefined ? intentRefusal(answer.open, target) : refused('onItsWay')
    }
    if (answer?.reason === 'wallet_changed') {
      return refused('walletChanged')
    }
    return refused('intentFailed', answer?.reason !== undefined ? { detail: answer.reason } : {})
  }

  const intentCreated = answer.created

  // 6. From here to sendTransaction nothing awaits, so no other tab or wallet event can come between
  // these checks and the send.
  const late = lastChecks(ctx, clubWallet, account, target)
  if (late !== undefined) {
    await cancelUnsent(ctx, intentCreated)
    return late
  }
  // Write the pending lock, then ask the wallet.
  const lock: PendingLock = {
    id: newLockId(),
    account,
    target,
    validUntil,
    created: now4,
    startLt: read.lastLt.toString(),
    wallet: from,
  }
  try {
    writeLock(ctx.store, lock)
  } catch {
    await cancelUnsent(ctx, intentCreated)
    return refused('storage')
  }
  try {
    await ctx.send(tx)
  } catch (e) {
    // 7 (1): only an explicit rejection releases. A timeout, a stale session or a closed bridge keeps
    // the lock and the server's record: the request may still be signed and land. A rejection clears
    // the server's record first (a failed cancel leaves it to close on its own time), then the lock.
    if (ctx.isUserRejection(e)) {
      // Without the record's `created` there is nothing to name: it then closes at valid_until + 1260 s.
      if (intentCreated !== undefined) {
        try {
          await ctx.cancelPayIntent(intentCreated)
        } catch {
          // The record then closes on its own time.
        }
      }
      removeLock(ctx.store, lock)
      return { outcome: 'rejected' }
    }
    return { outcome: 'walletError', error: e }
  }
  return { outcome: 'sent', lock }
}

// The record was opened but the page then sends nothing: nothing reached the wallet, so the record is
// cleared (a failed cancel leaves it to close on the server's time). Without `created` there is
// nothing to name.
async function cancelUnsent(ctx: PaymentContext, created: number | undefined) {
  if (created === undefined) {
    return
  }
  try {
    await ctx.cancelPayIntent(created)
  } catch {
    // The record then closes on its own time.
  }
}

// The synchronous checks right before the send: the wallet TON Connect has connected now must still
// be the one the transaction is from, and no other tab may have written a lock for this payment
// while this one awaited.
function lastChecks(ctx: PaymentContext, clubWallet: Address, account: string, target: Target) {
  const live = ctx.connectedNow()
  if (live === undefined || !live.equals(clubWallet)) {
    return refused('mismatch')
  }
  if (locksFor(ctx.store, account, target).length > 0) {
    return refused('locked')
  }
  return undefined
}
