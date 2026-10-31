#!/usr/bin/env node
// Byte checks of the Club's two transaction builders and the payment guard
// (specs/club-website.md §6, §6a, §7 and the Money acceptance criteria).
//
//   node --experimental-strip-types scripts/club-tx-selftest.mjs
//
// The builders and the guard take their cell builder and chain reader as arguments, so they run
// here against @ton/core directly and against fake transaction lists, with no browser and no network.
// `--print-boc` also prints the claim and upgrade payloads, for the club-server parser check.

import assert from 'node:assert/strict'
import { Address, Cell, beginCell } from '@ton/core'
import {
  CLAIM_FEE_NANO,
  HIPO_TON,
  HIPO_TON_RAW,
  TON_MAINNET,
  buildClaimTx,
  buildUpgradeTx,
  claimPayload,
  parseHpoNano,
  upgradeAmountNano,
  upgradePayload,
  upgradeTarget,
  validUntilAt,
} from '../src/components/app/club/clubTx.ts'
import {
  CLUB_LAUNCH,
  LOCKS_KEY,
  LOOKBACK,
  PAY_WEB_LOCK,
  ChainReadError,
  addAck,
  archiveFirstPage,
  continueLockRead,
  createChainReader,
  judgeChain,
  judgeLock,
  matchOfBody,
  readLocks,
  removeLock,
  sendClubPayment,
  writeLock,
} from '../src/components/app/club/payments.ts'

let count = 0
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      count++
    })
    .catch((e) => {
      console.error('FAIL', name)
      throw e
    })
}

// Two made-up wallets (raw workchain-0 addresses), never hipo.ton.
const CLUB = new Address(0, Buffer.alloc(32, 0x11))
const OTHER = new Address(0, Buffer.alloc(32, 0x22))
const HIPO = Address.parse(HIPO_TON)
const FEES = [0, 20, 40, 60, 100, 160, 260, 420, 680, 1100]

// ------------------------------------------------------------------------------------ builders

function decodeBits(payload) {
  const cell = Cell.fromBase64(payload)
  return { cell, slice: cell.beginParse() }
}

await check('claim tx is exactly one 1 GRAM message to hipo.ton with 0xfee1 + 0', () => {
  const tx = buildClaimTx({ beginCell, from: CLUB.toRawString(), validUntil: 1793440000 })
  assert.deepEqual(Object.keys(tx).sort(), ['from', 'messages', 'network', 'validUntil'])
  assert.equal(tx.network, TON_MAINNET)
  assert.equal(tx.messages.length, 1)
  const [message] = tx.messages
  assert.deepEqual(Object.keys(message).sort(), ['address', 'amount', 'payload'])
  assert.equal(message.amount, '1000000000')
  assert.equal(CLAIM_FEE_NANO, '1000000000')
  assert.equal(Address.parse(message.address).toRawString(), HIPO_TON_RAW)
  assert.equal(HIPO_TON_RAW, '0:92967851207602025b751684159411f3c6669038c8fd11fbbcd03c288204a5b7')
  // Non-bounceable form: the message goes with bounce = false.
  assert.equal(Address.isFriendly(message.address), true)
  assert.equal(Address.parseFriendly(message.address).isBounceable, false)
  const { cell, slice } = decodeBits(message.payload)
  assert.equal(cell.bits.length, 96)
  assert.equal(cell.refs.length, 0)
  assert.equal(slice.loadUint(32), 0xfee1)
  assert.equal(slice.loadUintBig(64), 0n)
  assert.equal(slice.remainingBits, 0)
})

await check('upgrade amounts for n = 2..10 on the after-L table', () => {
  const expected = [
    '20000000000',
    '40000000000',
    '60000000000',
    '100000000000',
    '160000000000',
    '260000000000',
    '420000000000',
    '680000000000',
    '1100000000000',
  ]
  for (let n = 2; n <= 10; n++) {
    const tx = buildUpgradeTx({ beginCell, from: CLUB.toRawString(), validUntil: 1793440000, n, fee: FEES[n - 1] })
    assert.ok(tx)
    assert.equal(tx.messages.length, 1)
    assert.equal(tx.messages[0].amount, expected[n - 2])
    assert.equal(Address.parse(tx.messages[0].address).toRawString(), HIPO_TON_RAW)
    const { cell, slice } = decodeBits(tx.messages[0].payload)
    assert.equal(cell.bits.length, 104)
    assert.equal(cell.refs.length, 0)
    assert.equal(slice.loadUint(32), 0xb0)
    assert.equal(slice.loadUintBig(64), 0n)
    assert.equal(slice.loadUint(8), n)
    assert.equal(slice.remainingBits, 0)
  }
})

await check('fees that are not a whole number in (0, 10000] build nothing', () => {
  for (const fee of [
    0,
    -1,
    20.5,
    10001,
    '420',
    NaN,
    Infinity,
    -Infinity,
    1e21,
    1100.0000000000002,
    null,
    undefined,
    20n,
  ]) {
    assert.equal(upgradeAmountNano(fee), undefined, String(fee))
    assert.equal(
      buildUpgradeTx({ beginCell, from: CLUB.toRawString(), validUntil: 1, n: 5, fee }),
      undefined,
      String(fee),
    )
  }
  assert.equal(upgradeAmountNano(10000), '10000000000000')
  assert.equal(buildUpgradeTx({ beginCell, from: CLUB.toRawString(), validUntil: 1, n: 11, fee: 20 }), undefined)
  assert.equal(buildUpgradeTx({ beginCell, from: CLUB.toRawString(), validUntil: 1, n: 1, fee: 20 }), undefined)
})

await check('n = club_level + 2, 2..10 only', () => {
  assert.equal(upgradeTarget(0), 2)
  assert.equal(upgradeTarget(3), 5)
  assert.equal(upgradeTarget(8), 10)
  assert.equal(upgradeTarget(9), undefined)
  for (const bad of [-1, 1.5, '3', NaN, undefined]) {
    assert.equal(upgradeTarget(bad), undefined)
  }
})

await check('B parsing is exact and strict', () => {
  assert.equal(parseHpoNano('100'), 100_000_000_000n)
  assert.equal(parseHpoNano('100.000000000'), 100_000_000_000n)
  assert.equal(parseHpoNano('123.456789012'), 123_456_789_012n)
  assert.equal(parseHpoNano('99.999999999'), 99_999_999_999n)
  for (const bad of ['1e2', '100.0000000001', '-5', '', ' 100', '100 ', '+1', '.5', '1.', 100, null]) {
    assert.equal(parseHpoNano(bad), undefined, JSON.stringify(bad))
  }
})

await check('validUntil = floor(server time) + 300, whole seconds', () => {
  assert.equal(validUntilAt(1793440000.9), 1793440300)
  assert.equal(validUntilAt(1793440000), 1793440300)
  assert.equal(Number.isInteger(validUntilAt(1793440000.5)), true)
  assert.equal(validUntilAt(NaN), undefined)
  assert.equal(validUntilAt(0), undefined)
})

await check('the builders reject a non-raw from and a fractional validUntil', () => {
  assert.throws(() => buildClaimTx({ beginCell, from: CLUB.toString(), validUntil: 1 }))
  assert.throws(() => buildClaimTx({ beginCell, from: CLUB.toRawString(), validUntil: 1.5 }))
})

await check('matching bodies: claim, upgrade with level, upgrade too short, other ops', () => {
  assert.deepEqual(matchOfBody(Cell.fromBase64(claimPayload(beginCell))), { op: 'claim' })
  assert.deepEqual(matchOfBody(Cell.fromBase64(upgradePayload(beginCell, 7))), { op: 'upgrade', level: 7 })
  assert.deepEqual(matchOfBody(beginCell().storeUint(0xb0, 32).endCell()), { op: 'upgrade' })
  assert.equal(matchOfBody(beginCell().storeUint(0, 32).storeStringTail('hi').endCell()), undefined)
  assert.equal(matchOfBody(beginCell().endCell()), undefined)
})

// ------------------------------------------------------------------------------------ the guard

class MemoryStore {
  constructor() {
    this.map = new Map()
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null
  }
  setItem(key, value) {
    this.map.set(key, value)
  }
}

const T0 = CLUB_LAUNCH + 2 * 24 * 3600 // two days after L
const GRAM = 1_000_000_000n

function read({
  blockTime = T0,
  balance = 2000n * GRAM,
  lastLt = 1000n,
  txs = [],
  coveredFrom,
  reachedLookback = true,
} = {}) {
  return {
    blockTime,
    balance,
    lastLt,
    txs,
    coveredFrom: coveredFrom ?? (txs.length > 0 ? txs[txs.length - 1].lt - 1n : lastLt),
    reachedLookback,
  }
}

function status(over = {}) {
  return { clubWallet: CLUB.toRawString(), clubLevel: 3, state: 'ok', switchPending: false, frozen: false, ...over }
}

function overview(over = {}) {
  return {
    ...status(),
    stateUntil: undefined,
    unclaimed: '150.5',
    claimOk: true,
    claimReason: undefined,
    claimsOpenAt: undefined,
    claimInProgress: false,
    claims: [],
    upgradeFee: 100,
    wrapupPending: false,
    ...over,
  }
}

function levels(over = {}) {
  return { fees: FEES, hasNext: false, ...over }
}

class UserRejects extends Error {}

// A guard context with every read faked. `sent` collects the transactions handed to the wallet, and
// `lockAtSend` records whether the lock was in the store at the moment send was called.
function context(over = {}) {
  const store = over.store ?? new MemoryStore()
  const ctx = {
    account: '42',
    serverNow: () => T0 + 5,
    connected: CLUB,
    // TON Connect's account at the instant of the send; the same wallet unless a test changes it.
    connectedNow: () => ctx.connected,
    parseAddress: (value) => {
      try {
        return Address.parse(value)
      } catch {
        return undefined
      }
    },
    readStatus: async () => status(over.status),
    readOverview: async () => overview(over.overview),
    readLevels: async () => levels(over.levels),
    chain: { read: async () => over.read ?? read() },
    store,
    beginCell,
    network: TON_MAINNET,
    sent: [],
    lockAtSend: [],
    send: async (tx) => {
      ctx.lockAtSend.push(readLocks(store).length)
      ctx.sent.push(tx)
      if (over.sendError) {
        throw over.sendError
      }
    },
    isUserRejection: (e) => e instanceof UserRejects,
    mockWithRealWallet: false,
    // The server's "payment in progress" record: `intents` collects each clubpayintent body with the
    // number of locks stored at that moment; `cancels` the same for each clubpaycancel.
    intents: [],
    cancels: [],
    openPayIntent: async (intent) => {
      ctx.intents.push({ ...intent, locksAtIntent: readLocks(store).length })
      return over.intent ? over.intent(intent) : { ok: true, created: T0 + 4 }
    },
    cancelPayIntent: async (created) => {
      ctx.cancels.push({ created, locks: readLocks(store).length })
      if (over.cancelError) {
        throw over.cancelError
      }
    },
    ...over.ctx,
  }
  return ctx
}

const claimSnapshot = { clubWallet: CLUB.toRawString(), clubLevel: 3, state: 'ok', switchPending: false }
const upgradeSnapshot = { ...claimSnapshot, fee: 100 }

async function expectRefused(ctx, kind, snapshot, reason) {
  const result = await sendClubPayment(ctx, kind, snapshot)
  assert.equal(result.outcome, 'refused', `${kind} expected refusal ${reason}, got ${JSON.stringify(result)}`)
  assert.equal(result.reason, reason)
  assert.equal(ctx.sent.length, 0, 'nothing may be sent')
  return result
}

function claimTx(now, lt) {
  return { lt, now, matches: [{ op: 'claim' }] }
}

function upgradeTx(now, lt, level) {
  return { lt, now, matches: [{ op: 'upgrade', level }] }
}

await check('a claim is sent when every check passes, after the lock is written', async () => {
  const ctx = context()
  const result = await sendClubPayment(ctx, 'claim', claimSnapshot)
  assert.equal(result.outcome, 'sent')
  assert.equal(ctx.sent.length, 1)
  assert.deepEqual(ctx.lockAtSend, [1])
  assert.equal(ctx.sent[0].validUntil, T0 + 5 + 300)
  assert.equal(ctx.sent[0].from, CLUB.toRawString())
  const [lock] = readLocks(ctx.store)
  const { id, ...rest } = lock
  assert.match(id, /^[0-9a-f]{32}$/)
  assert.deepEqual(rest, {
    account: '42',
    target: 'claim',
    validUntil: T0 + 305,
    created: T0 + 5,
    startLt: '1000',
    wallet: CLUB.toRawString(),
  })
})

await check('an upgrade is sent for n = club_level + 2 at the clublevels fee', async () => {
  const ctx = context()
  const result = await sendClubPayment(ctx, 'upgrade', upgradeSnapshot)
  assert.equal(result.outcome, 'sent')
  assert.equal(ctx.sent[0].messages[0].amount, '100000000000')
  const slice = Cell.fromBase64(ctx.sent[0].messages[0].payload).beginParse()
  slice.skip(96)
  assert.equal(slice.loadUint(8), 5)
  assert.equal(readLocks(ctx.store)[0].target, 5)
})

await check('validUntil follows server time with the device clock 10 minutes wrong', async () => {
  const realNow = Date.now
  try {
    Date.now = () => realNow() + 10 * 60 * 1000
    const ctx = context({ ctx: { serverNow: () => T0 + 0.75 } })
    const result = await sendClubPayment(ctx, 'claim', claimSnapshot)
    assert.equal(result.outcome, 'sent')
    assert.equal(ctx.sent[0].validUntil, T0 + 300)
  } finally {
    Date.now = realNow
  }
})

await check(
  'claim refusals: session, server time, mismatch, frozen, switch pending, gates, open time, balance',
  async () => {
    await expectRefused(context({ ctx: { account: undefined } }), 'claim', claimSnapshot, 'noSession')
    await expectRefused(context({ ctx: { serverNow: () => undefined } }), 'claim', claimSnapshot, 'noServerTime')
    await expectRefused(context({ ctx: { connected: OTHER } }), 'claim', claimSnapshot, 'mismatch')
    await expectRefused(context({ ctx: { connected: undefined } }), 'claim', claimSnapshot, 'noWallet')
    await expectRefused(
      context({ status: { frozen: true }, overview: { frozen: true } }),
      'claim',
      claimSnapshot,
      'frozen',
    )
    await expectRefused(
      context({ status: { switchPending: true }, overview: { switchPending: true } }),
      'claim',
      { ...claimSnapshot, switchPending: true },
      'switchPending',
    )
    for (const reason of [
      'launching',
      'no_wallet',
      'in_progress',
      'frozen',
      'switch_pending',
      'no_link',
      'link_wait',
      'revert_hold',
      'below_min',
    ]) {
      const result = await expectRefused(
        context({ overview: { claimOk: false, claimReason: reason } }),
        'claim',
        claimSnapshot,
        'gate',
      )
      assert.equal(result.detail, reason)
    }
    await expectRefused(context({ overview: { claimInProgress: true } }), 'claim', claimSnapshot, 'gate')
    await expectRefused(context({ overview: { unclaimed: '99.999999999' } }), 'claim', claimSnapshot, 'belowMin')
    await expectRefused(context({ overview: { unclaimed: '1e2' } }), 'claim', claimSnapshot, 'unknownBalance')
    // claims_open_at + 60 s by server time: T0 + 5 < (T0 - 50) + 60.
    await expectRefused(context({ overview: { claimsOpenAt: T0 - 50 } }), 'claim', claimSnapshot, 'claimsNotOpen')
    const open = context({ overview: { claimsOpenAt: T0 - 55 } })
    assert.equal((await sendClubPayment(open, 'claim', claimSnapshot)).outcome, 'sent')
    // 1.04 GRAM < 1 GRAM + 0.05 GRAM.
    const poor = await expectRefused(
      context({ read: read({ balance: 1_040_000_000n }) }),
      'claim',
      claimSnapshot,
      'balance',
    )
    assert.equal(poor.detail, '1050000000')
    assert.equal(
      (await sendClubPayment(context({ read: read({ balance: 1_050_000_000n }) }), 'claim', claimSnapshot)).outcome,
      'sent',
    )
  },
)

await check(
  'upgrade refusals: top level, next table, fee mismatch, state E deadline, wrapup pass 2, mock',
  async () => {
    await expectRefused(
      context({ status: { clubLevel: 9 }, overview: { clubLevel: 9, upgradeFee: undefined } }),
      'upgrade',
      { ...upgradeSnapshot, clubLevel: 9 },
      'topLevel',
    )
    await expectRefused(context({ levels: { hasNext: true } }), 'upgrade', upgradeSnapshot, 'feesChanging')
    await expectRefused(context({ overview: { upgradeFee: 160 } }), 'upgrade', upgradeSnapshot, 'feeMismatch')
    await expectRefused(context({ levels: { fees: [0, 20, 40, 60, 100.5] } }), 'upgrade', upgradeSnapshot, 'feeInvalid')
    await expectRefused(context({ levels: { fees: [0, 20, 40, 60, '100'] } }), 'upgrade', upgradeSnapshot, 'feeInvalid')
    // The modal showed another fee than the fresh table: refreshed, not sent.
    await expectRefused(context(), 'upgrade', { ...upgradeSnapshot, fee: 60 }, 'changed')
    const suspended = { state: 'suspended' }
    await expectRefused(
      context({ status: suspended, overview: { ...suspended, stateUntil: T0 + 5 + 3600 } }),
      'upgrade',
      { ...upgradeSnapshot, state: 'suspended' },
      'deadline',
    )
    await expectRefused(
      context({ status: suspended, overview: { ...suspended, stateUntil: T0 - 10 } }),
      'upgrade',
      { ...upgradeSnapshot, state: 'suspended' },
      'deadline',
    )
    const fine = context({ status: suspended, overview: { ...suspended, stateUntil: T0 + 5 + 3601 } })
    assert.equal((await sendClubPayment(fine, 'upgrade', { ...upgradeSnapshot, state: 'suspended' })).outcome, 'sent')
    // wrapup_pending from L + 23 h by server time.
    const at = (now) =>
      context({ overview: { wrapupPending: true }, ctx: { serverNow: () => now }, read: read({ blockTime: now }) })
    await expectRefused(at(CLUB_LAUNCH + 23 * 3600), 'upgrade', upgradeSnapshot, 'wrapup')
    assert.equal((await sendClubPayment(at(CLUB_LAUNCH + 23 * 3600 - 1), 'upgrade', upgradeSnapshot)).outcome, 'sent')
    await expectRefused(context({ ctx: { mockWithRealWallet: true } }), 'upgrade', upgradeSnapshot, 'mockUpgrade')
    // A claim from mock data with a real wallet is allowed (the pre-L claim test).
    assert.equal(
      (await sendClubPayment(context({ ctx: { mockWithRealWallet: true } }), 'claim', claimSnapshot)).outcome,
      'sent',
    )
  },
)

await check('re-read: wallet, level, state or switch_pending changed since the modal → nothing sent', async () => {
  await expectRefused(context({ status: { clubWallet: OTHER.toRawString() } }), 'claim', claimSnapshot, 'changed')
  await expectRefused(
    context({ status: { clubLevel: 4 }, overview: { clubLevel: 4 } }),
    'upgrade',
    upgradeSnapshot,
    'changed',
  )
  await expectRefused(context({ overview: { state: 'grace' } }), 'claim', claimSnapshot, 'changed')
  await expectRefused(context({ status: { switchPending: true } }), 'claim', claimSnapshot, 'changed')
  // The same wallet in another form is not a change.
  const friendly = context({ status: { clubWallet: CLUB.toString() } })
  assert.equal((await sendClubPayment(friendly, 'claim', claimSnapshot)).outcome, 'sent')
})

await check('fail closed: stale block, failed page, page limit', async () => {
  await expectRefused(context({ read: read({ blockTime: T0 + 5 - 61 }) }), 'claim', claimSnapshot, 'stale')
  assert.equal(
    (await sendClubPayment(context({ read: read({ blockTime: T0 + 5 - 60 }) }), 'claim', claimSnapshot)).outcome,
    'sent',
  )
  const failing = (failure) =>
    context({ ctx: { chain: { read: async () => Promise.reject(new ChainReadError(failure)) } } })
  await expectRefused(failing('readFailed'), 'claim', claimSnapshot, 'readFailed')
  await expectRefused(failing('pageLimit'), 'upgrade', upgradeSnapshot, 'pageLimit')
  await expectRefused(context({ read: read({ reachedLookback: false }) }), 'claim', claimSnapshot, 'pageLimit')
  const thrown = context({ ctx: { chain: { read: async () => Promise.reject(new Error('network')) } } })
  await expectRefused(thrown, 'claim', claimSnapshot, 'readFailed')
})

await check('chain check from a second device (empty storage)', async () => {
  // An upgrade to this n from the last hour, level not raised.
  await expectRefused(
    context({ read: read({ txs: [upgradeTx(T0 - 3600, 900n, 5)] }) }),
    'upgrade',
    upgradeSnapshot,
    'onItsWay',
  )
  // Another n does not block.
  assert.equal(
    (
      await sendClubPayment(
        context({ read: read({ txs: [upgradeTx(T0 - 3600, 900n, 4)] }) }),
        'upgrade',
        upgradeSnapshot,
      )
    ).outcome,
    'sent',
  )
  // A claim fee with no claim record at or after its time.
  await expectRefused(context({ read: read({ txs: [claimTx(T0 - 3600, 900n)] }) }), 'claim', claimSnapshot, 'onItsWay')
  // Covered only by a record with claim_time 0 and an older request_time: still on its way.
  await expectRefused(
    context({
      read: read({ txs: [claimTx(T0 - 3600, 900n)] }),
      overview: { claims: [{ claimTime: 0, requestTime: T0 - 7200 }] },
    }),
    'claim',
    claimSnapshot,
    'onItsWay',
  )
  // Covered by a record with claim_time ≥ its time: does not block.
  const covered = context({
    read: read({ txs: [claimTx(T0 - 3600, 900n)] }),
    overview: { claims: [{ claimTime: T0 - 3600 }] },
  })
  assert.equal((await sendClubPayment(covered, 'claim', claimSnapshot)).outcome, 'sent')
  // A record with claim_time 0 and a later request_time covers it.
  const byRequest = context({
    read: read({ txs: [claimTx(T0 - 3600, 900n)] }),
    overview: { claims: [{ claimTime: 0, requestTime: T0 - 3000 }] },
  })
  assert.equal((await sendClubPayment(byRequest, 'claim', claimSnapshot)).outcome, 'sent')
  // An upgrade message for this n while the level shows it applied cannot happen for n = level + 2;
  // a message for a lower level that was applied does not block either.
  assert.equal(
    (
      await sendClubPayment(
        context({ read: read({ txs: [upgradeTx(T0 - 3600, 900n, 4)] }) }),
        'upgrade',
        upgradeSnapshot,
      )
    ).outcome,
    'sent',
  )
})

await check('a message over 24 h old and not applied blocks until the member acknowledges it', async () => {
  const store = new MemoryStore()
  const old = read({ txs: [claimTx(T0 - LOOKBACK - 10, 900n)] })
  const first = await expectRefused(context({ store, read: old }), 'claim', claimSnapshot, 'notApplied')
  assert.equal(first.at, T0 - LOOKBACK - 10)
  await expectRefused(context({ store, read: old }), 'claim', claimSnapshot, 'notApplied')
  addAck(store, first.ackKey)
  const after = context({ store, read: old })
  assert.equal((await sendClubPayment(after, 'claim', claimSnapshot)).outcome, 'sent')
})

await check('pending lock: kept on a timeout, across reloads; released by a rejection', async () => {
  const store = new MemoryStore()
  const timeout = context({ store, sendError: new Error('timeout') })
  assert.equal((await sendClubPayment(timeout, 'claim', claimSnapshot)).outcome, 'walletError')
  assert.equal(readLocks(store).length, 1)
  // A reload is a new context on the same storage: the lock blocks a second send.
  const again = context({ store })
  await expectRefused(again, 'claim', claimSnapshot, 'locked')
  // A logout or a wallet disconnect does not touch the store; the lock is keyed by account, not session.
  const otherAccount = context({ store, ctx: { account: '43' } })
  assert.equal((await sendClubPayment(otherAccount, 'claim', claimSnapshot)).outcome, 'sent')
  assert.equal(readLocks(store).filter((lock) => lock.account === '42').length, 1)

  const rejectStore = new MemoryStore()
  const rejected = context({ store: rejectStore, sendError: new UserRejects() })
  assert.equal((await sendClubPayment(rejected, 'claim', claimSnapshot)).outcome, 'rejected')
  assert.deepEqual(readLocks(rejectStore), [])
  assert.deepEqual(rejected.lockAtSend, [1])
})

await check('pending lock: released by the server showing the payment', async () => {
  const lock = { account: '42', target: 5, validUntil: T0 + 300, created: T0, startLt: '1000' }
  const acks = new Set()
  assert.equal(judgeLock(lock, undefined, { clubLevel: 3, claims: [] }, acks).kind, 'keep')
  assert.deepEqual(judgeLock(lock, undefined, { clubLevel: 4, claims: [] }, acks), { kind: 'released', by: 'server' })
  // The level jumped by two (a seasonal raise on top): still released.
  assert.deepEqual(judgeLock(lock, undefined, { clubLevel: 5, claims: [] }, acks), { kind: 'released', by: 'server' })

  const claim = { account: '42', target: 'claim', validUntil: T0 + 300, created: T0, startLt: '1000' }
  assert.equal(judgeLock(claim, undefined, { claims: [{ claimTime: T0 - 61 }] }, acks).kind, 'keep')
  assert.equal(judgeLock(claim, undefined, { claims: [{ claimTime: T0 - 60 }] }, acks).kind, 'released')
  assert.equal(judgeLock(claim, undefined, { claims: [{ claimTime: 0, requestTime: T0 - 100 }] }, acks).kind, 'keep')
  assert.equal(
    judgeLock(claim, undefined, { claims: [{ claimTime: 0, requestTime: T0 + 100 }] }, acks).kind,
    'released',
  )
  assert.equal(judgeLock(claim, undefined, { claims: [{}] }, acks).kind, 'keep')
})

await check('pending lock: never released on elapsed time alone', async () => {
  const lock = { account: '42', target: 'claim', validUntil: T0 + 300, created: T0, startLt: '1000' }
  // A week later, no read and no server evidence.
  assert.equal(judgeLock(lock, undefined, { claims: [] }, new Set()).kind, 'keep')
  // A week later, a read that does not reach startLt.
  const short = read({
    blockTime: T0 + 7 * 86400,
    lastLt: 5000n,
    txs: [{ lt: 5000n, now: T0 + 7 * 86400, matches: [] }],
    coveredFrom: 4000n,
  })
  assert.equal(judgeLock(lock, short, { claims: [] }, new Set()).kind, 'keep')
})

await check('chain release: v + 59 keeps, short pages keep, a complete read at v + 60 releases', async () => {
  const v = T0 + 300
  const lock = { account: '42', target: 'claim', validUntil: v, created: T0, startLt: '1000' }
  const evidence = { claims: [] }
  const later = [{ lt: 1100n, now: v - 10, matches: [] }]
  assert.equal(
    judgeLock(lock, read({ blockTime: v + 59, lastLt: 1100n, txs: later, coveredFrom: 1000n }), evidence, new Set())
      .kind,
    'keep',
  )
  assert.equal(
    judgeLock(lock, read({ blockTime: v + 60, lastLt: 1100n, txs: later, coveredFrom: 1050n }), evidence, new Set())
      .kind,
    'keep',
  )
  assert.deepEqual(
    judgeLock(lock, read({ blockTime: v + 60, lastLt: 1100n, txs: later, coveredFrom: 1000n }), evidence, new Set()),
    {
      kind: 'released',
      by: 'chain',
    },
  )
  // No transaction since the lock: covered at once.
  assert.equal(
    judgeLock(lock, read({ blockTime: v + 60, lastLt: 1000n, txs: [], coveredFrom: 1000n }), evidence, new Set()).kind,
    'released',
  )
  // A matching message that landed keeps the lock (on its way) …
  const landed = [{ lt: 1100n, now: T0 + 20, matches: [{ op: 'claim' }] }]
  assert.equal(
    judgeLock(lock, read({ blockTime: v + 60, lastLt: 1100n, txs: landed, coveredFrom: 1000n }), evidence, new Set())
      .kind,
    'keep',
  )
  // … and over 24 h old and not applied, asks for the member's acknowledgement first.
  const notApplied = judgeLock(
    lock,
    read({ blockTime: T0 + 20 + LOOKBACK + 1, lastLt: 1100n, txs: landed, coveredFrom: 1000n }),
    evidence,
    new Set(),
  )
  assert.equal(notApplied.kind, 'notApplied')
  assert.deepEqual(
    judgeLock(
      lock,
      read({ blockTime: T0 + 20 + LOOKBACK + 1, lastLt: 1100n, txs: landed, coveredFrom: 1000n }),
      evidence,
      new Set([notApplied.ackKey]),
    ),
    { kind: 'released', by: 'ack' },
  )
  // The device clock plays no part: judgeLock reads no clock at all.
  const realNow = Date.now
  try {
    Date.now = () => realNow() + 10 * 60 * 1000
    assert.equal(
      judgeLock(lock, read({ blockTime: v + 59, lastLt: 1100n, txs: later, coveredFrom: 1000n }), evidence, new Set())
        .kind,
      'keep',
    )
    assert.equal(
      judgeLock(lock, read({ blockTime: v + 60, lastLt: 1100n, txs: later, coveredFrom: 1000n }), evidence, new Set())
        .kind,
      'released',
    )
  } finally {
    Date.now = realNow
  }
})

await check('a held lock is settled by the next attempt, which still sends nothing', async () => {
  const store = new MemoryStore()
  writeLock(store, { account: '42', target: 'claim', validUntil: T0 - 100, created: T0 - 400, startLt: '1000' })
  const ctx = context({ store, read: read({ blockTime: T0, lastLt: 1000n, txs: [], coveredFrom: 1000n }) })
  await expectRefused(ctx, 'claim', claimSnapshot, 'lockReleased')
  assert.equal(store.getItem(LOCKS_KEY), '[]')
  assert.equal((await sendClubPayment(context({ store }), 'claim', claimSnapshot)).outcome, 'sent')
})

await check('judgeChain: the newest unapplied match decides', () => {
  const r = read({ txs: [claimTx(T0 - 100, 950n), claimTx(T0 - LOOKBACK - 100, 900n)] })
  assert.equal(judgeChain(r, '42', 'claim', { claims: [] }, new Set()).kind, 'onItsWay')
  assert.equal(judgeChain(r, '42', 'claim', { claims: [{ claimTime: T0 - 100 }] }, new Set()).kind, 'clear')
})

// ------------------------------------------------------------------------------------ the reader

function fakeTx(lt, now, prevLt, out = []) {
  return {
    lt,
    now,
    prevTransactionLt: prevLt,
    prevTransactionHash: lt * 7n,
    outMessages: { values: () => out },
  }
}

function toHipo(body) {
  return { info: { type: 'internal', dest: HIPO }, body }
}

// A fake TonClient4: the account's transactions newest first, served `pageSize` at a time.
function fakeClient(txs, { pageSize = 3, now = T0, failAt } = {}) {
  let pages = 0
  return {
    pages: () => pages,
    getLastBlock: async () => ({ last: { seqno: 1 }, now }),
    getAccountLite: async () => ({
      account: {
        balance: { coins: '5000000000' },
        last: txs.length === 0 ? null : { lt: txs[0].lt.toString(), hash: Buffer.alloc(32).toString('base64') },
      },
    }),
    getAccountTransactions: async (_address, lt) => {
      pages++
      if (failAt === pages) {
        throw new Error('boom')
      }
      const start = txs.findIndex((tx) => tx.lt === lt)
      return txs.slice(start, start + pageSize).map((tx) => ({ block: {}, tx }))
    },
  }
}

function chainOf(n, { step = 3600, from = 2000n } = {}) {
  const txs = []
  for (let i = 0; i < n; i++) {
    const lt = from - BigInt(i) * 10n
    txs.push(fakeTx(lt, T0 - i * step, i === n - 1 ? 0n : lt - 10n))
  }
  return txs
}

await check('reader: pages back until a transaction older than 24 h, and parses matches', async () => {
  const txs = chainOf(40)
  txs[2].outMessages = { values: () => [toHipo(Cell.fromBase64(claimPayload(beginCell)))] }
  txs[3].outMessages = {
    values: () => [{ info: { type: 'internal', dest: CLUB }, body: Cell.fromBase64(claimPayload(beginCell)) }],
  }
  const client = fakeClient(txs)
  const reader = createChainReader({ tonClient: () => client, parseAddress: (v) => Address.parse(v) })
  const result = await reader.read(CLUB)
  assert.equal(result.reachedLookback, true)
  assert.equal(result.blockTime, T0)
  assert.equal(result.balance, 5_000_000_000n)
  assert.equal(result.lastLt, 2000n)
  // 25 hourly transactions cover 24 h; pages of 3 → 9 pages.
  assert.equal(client.pages(), 9)
  assert.ok(result.txs.at(-1).now < T0 - LOOKBACK)
  assert.deepEqual(result.txs[2].matches, [{ op: 'claim' }])
  assert.deepEqual(result.txs[3].matches, [])
  assert.equal(result.coveredFrom, result.txs.at(-1).lt - 10n)
})

await check('reader: the 10-page cap fails closed, as does a failed page', async () => {
  const busy = fakeClient(chainOf(100, { step: 600 }))
  const reader = createChainReader({ tonClient: () => busy, parseAddress: (v) => Address.parse(v) })
  await assert.rejects(reader.read(CLUB), (e) => e instanceof ChainReadError && e.failure === 'pageLimit')
  assert.equal(busy.pages(), 10)
  const broken = fakeClient(chainOf(40), { failAt: 2 })
  await assert.rejects(
    createChainReader({ tonClient: () => broken, parseAddress: (v) => Address.parse(v) }).read(CLUB),
    (e) => e instanceof ChainReadError && e.failure === 'readFailed',
  )
  await assert.rejects(
    createChainReader({ tonClient: () => undefined, parseAddress: (v) => Address.parse(v) }).read(CLUB),
    (e) => e instanceof ChainReadError && e.failure === 'readFailed',
  )
})

await check('reader: a young wallet is covered back to its first transaction; an empty one at once', async () => {
  const young = fakeClient(chainOf(5, { step: 60 }))
  const result = await createChainReader({ tonClient: () => young, parseAddress: (v) => Address.parse(v) }).read(CLUB)
  assert.equal(result.reachedLookback, true)
  assert.equal(result.coveredFrom, 0n)
  assert.equal(result.txs.length, 5)
  const empty = await createChainReader({
    tonClient: () => fakeClient([]),
    parseAddress: (v) => Address.parse(v),
  }).read(CLUB)
  assert.deepEqual(empty.txs, [])
  assert.equal(empty.lastLt, 0n)
  assert.equal(empty.coveredFrom, 0n)
})

await check('a claim sent before L counts as applied; one after L is judged as before', async () => {
  const claimTx = (lt, now) => ({ lt, now, matches: [{ op: 'claim' }] })
  const readOf = (tx) => ({
    blockTime: T0,
    balance: 0n,
    lastLt: tx.lt,
    txs: [tx],
    coveredFrom: 0n,
    reachedLookback: true,
  })
  const none = { claims: [] }
  // paid under the old rules (not in recent_claims), past the old sweep's 24 h hold-back: no
  // "wasn't applied" after L (T0 is two days after L)
  assert.deepEqual(judgeChain(readOf(claimTx(10n, CLUB_LAUNCH - 1)), 'acct', 'claim', none, new Set()), {
    kind: 'clear',
  })
  // a fee sent just before L that the old sweep may still hold keeps blocking (money audit F1)
  const soon = { ...readOf(claimTx(11n, CLUB_LAUNCH - 3600)), blockTime: CLUB_LAUNCH + 1200 }
  assert.equal(judgeChain(soon, 'acct', 'claim', none, new Set()).kind, 'onItsWay')
  // and inside the hour of margin past 24 h it is still judged, not taken as settled
  const edge = { ...readOf(claimTx(12n, CLUB_LAUNCH - 3600)), blockTime: CLUB_LAUNCH - 3600 + LOOKBACK + 1800 }
  assert.equal(judgeChain(edge, 'acct', 'claim', none, new Set()).kind, 'notApplied')
  // a Club claim at L or after, unapplied and older than 24 h, still needs support
  const late = judgeChain(readOf(claimTx(20n, CLUB_LAUNCH)), 'acct', 'claim', none, new Set())
  assert.equal(late.kind, 'notApplied')
  // and one inside the 24 h is on its way
  assert.equal(judgeChain(readOf(claimTx(30n, T0 - 60)), 'acct', 'claim', none, new Set()).kind, 'onItsWay')
})

// The v4 node keeps about 16 h of history: an idle wallet's first page fails there (HTTP 500).
const idle = (txs) => ({
  ...fakeClient(txs),
  getAccountTransactions: async () => {
    throw new Error('500')
  },
})
const archiveOf = (txs) => async () => txs.map((tx) => ({ lt: tx.lt, now: tx.now, matches: [] }))

await check('reader: an idle wallet the v4 node cannot read is read from the archive', async () => {
  const old = chainOf(5, { step: 30 * 3600 }).map((tx) => ({ ...tx, now: tx.now - 2 * LOOKBACK }))
  const reader = createChainReader({
    tonClient: () => idle(old),
    parseAddress: (v) => Address.parse(v),
    archivePage: archiveOf(old),
  })
  const result = await reader.read(CLUB)
  assert.equal(result.reachedLookback, true)
  assert.equal(result.txs.length, 5)
  assert.equal(result.lastLt, old[0].lt)
  assert.equal(result.coveredFrom, old[4].lt)
})

await check('reader: the archive is refused unless it is the same chain and past the lookback', async () => {
  const old = chainOf(3).map((tx) => ({ ...tx, now: tx.now - 2 * LOOKBACK }))
  const fails = async (deps, options) =>
    assert.rejects(
      createChainReader({ tonClient: () => idle(old), parseAddress: (v) => Address.parse(v), ...deps }).read(
        CLUB,
        options,
      ),
      (e) => e instanceof ChainReadError && e.failure === 'readFailed',
    )
  // no archive at all
  await fails({})
  // the archive fails, or answers empty
  await fails({ archivePage: async () => undefined })
  await fails({ archivePage: async () => [] })
  // its newest transaction is not the account's last one (behind or ahead of the v4 node)
  await fails({ archivePage: archiveOf(old.slice(1)) })
  // the newest transaction is inside the lookback: a claim on its way could hide behind the failure
  const recent = chainOf(3, { step: 60 })
  await assert.rejects(
    createChainReader({
      tonClient: () => idle(recent),
      parseAddress: (v) => Address.parse(v),
      archivePage: archiveOf(recent),
    }).read(CLUB),
    (e) => e instanceof ChainReadError && e.failure === 'readFailed',
  )
  // a read that must reach a lock, or continues from a cursor, never takes the archive
  await fails({ archivePage: archiveOf(old) }, { downToLt: old[2].lt })
  await fails({ archivePage: archiveOf(old) }, { downToTime: T0 - 3 * LOOKBACK })
})

await check(
  'archive: messages to hipo.ton are parsed like the v4 reader’s; a failed or odd answer is undefined',
  async () => {
    const body = Cell.fromBase64(claimPayload(beginCell))
    const toncenter = {
      ok: true,
      result: [
        {
          transaction_id: { lt: '2000', hash: '' },
          utime: T0 - 2 * LOOKBACK,
          out_msgs: [
            {
              destination: HIPO.toString(),
              msg_data: { '@type': 'msg.dataRaw', body: body.toBoc().toString('base64') },
            },
            {
              destination: CLUB.toString(),
              msg_data: { '@type': 'msg.dataRaw', body: body.toBoc().toString('base64') },
            },
            { destination: '', msg_data: { '@type': 'msg.dataRaw', body: '' } },
          ],
        },
        { transaction_id: { lt: '1990', hash: '' }, utime: T0 - 2 * LOOKBACK - 60, out_msgs: [] },
      ],
    }
    let url
    const fetchFn = async (u) => ((url = u), { ok: true, json: async () => toncenter })
    const page = await archiveFirstPage(
      CLUB,
      HIPO,
      (v) => Address.parse(v),
      (b) => Cell.fromBase64(b),
      fetchFn,
    )
    assert.ok(
      url.startsWith('https://toncenter.com/api/v2/getTransactions?address=') &&
        url.endsWith('&limit=20&archival=true'),
    )
    assert.deepEqual(page, [
      { lt: 2000n, now: T0 - 2 * LOOKBACK, matches: [{ op: 'claim' }] },
      { lt: 1990n, now: T0 - 2 * LOOKBACK - 60, matches: [] },
    ])
    const failed = async () => ({ ok: false, json: async () => ({}) })
    assert.equal(
      await archiveFirstPage(
        CLUB,
        HIPO,
        (v) => Address.parse(v),
        (b) => Cell.fromBase64(b),
        failed,
      ),
      undefined,
    )
    const odd = async () => ({ ok: true, json: async () => ({ ok: true, result: [{ utime: 1 }] }) })
    assert.equal(
      await archiveFirstPage(
        CLUB,
        HIPO,
        (v) => Address.parse(v),
        (b) => Cell.fromBase64(b),
        odd,
      ),
      undefined,
    )
  },
)

await check('reader: pages further back to a lock’s startLt when asked', async () => {
  const txs = chainOf(60)
  const client = fakeClient(txs, { pageSize: 10 })
  const reader = createChainReader({ tonClient: () => client, parseAddress: (v) => Address.parse(v) })
  const result = await reader.read(CLUB, { downToLt: txs[45].lt })
  assert.ok(result.coveredFrom <= txs[45].lt)
})

// ------------------------------------------------------------------------------- two tabs, old locks

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Two tabs of one browser: one shared store, reads that take a while, clicks 20 ms apart.
async function twoTabs(webLocks) {
  const store = new MemoryStore()
  const slow = (tab) =>
    context({
      store,
      ctx: {
        webLocks,
        readStatus: async () => {
          await sleep(50)
          return status()
        },
        chain: {
          read: async () => {
            await sleep(50)
            return read()
          },
        },
        send: async () => {
          tab.sent.push('tx')
        },
      },
    })
  const a = { sent: [] }
  const b = { sent: [] }
  const first = sendClubPayment(slow(a), 'upgrade', upgradeSnapshot)
  await sleep(20)
  const second = sendClubPayment(slow(b), 'upgrade', upgradeSnapshot)
  const results = await Promise.all([first, second])
  return { results, sends: a.sent.length + b.sent.length, locks: readLocks(store).length }
}

await check('two tabs: overlapping guards send once, without Web Locks (the re-read before the lock)', async () => {
  const { results, sends, locks } = await twoTabs(null)
  assert.equal(sends, 1)
  assert.equal(locks, 1)
  assert.deepEqual(
    results.map((r) => r.outcome),
    ['sent', 'refused'],
  )
  assert.equal(results[1].reason, 'locked')
})

await check('two tabs: overlapping guards send once under the Web Lock', async () => {
  // Node has navigator.locks, as browsers do; the guard takes it by default.
  assert.equal(typeof globalThis.navigator?.locks?.request, 'function')
  const { results, sends, locks } = await twoTabs(undefined)
  assert.equal(sends, 1)
  assert.equal(locks, 1)
  assert.equal(results[1].reason, 'locked')
  // While another tab holds the account's Web Lock, a guard is refused at once and reads nothing.
  let reads = 0
  const ctx = context({ ctx: { chain: { read: async () => (reads++, read()) } } })
  let release
  const held = navigator.locks.request(PAY_WEB_LOCK + '42', () => new Promise((resolve) => (release = resolve)))
  await sleep(1)
  await expectRefused(ctx, 'claim', claimSnapshot, 'locked')
  assert.equal(reads, 0)
  release()
  await held
  assert.equal((await sendClubPayment(context(), 'claim', claimSnapshot)).outcome, 'sent')
})

await check('two tabs: a rejection in tab A never removes tab B’s lock for the same payment', async () => {
  const store = new MemoryStore()
  // Tab B wrote its lock for the same account, target and second just as A asked its wallet.
  let lockB
  const a = context({
    store,
    ctx: {
      webLocks: null,
      send: async () => {
        const [lockA] = readLocks(store)
        lockB = { ...lockA, id: 'b'.repeat(32) }
        writeLock(store, lockB)
        throw new UserRejects()
      },
    },
  })
  assert.equal((await sendClubPayment(a, 'upgrade', upgradeSnapshot)).outcome, 'rejected')
  assert.deepEqual(readLocks(store), [lockB])
  // B's lock still blocks a third try.
  await expectRefused(context({ store }), 'upgrade', upgradeSnapshot, 'locked')
  // removeLock by id: two locks with the same account, target and validUntil.
  const both = new MemoryStore()
  const one = { id: '1'.repeat(32), account: '42', target: 5, validUntil: T0, created: T0, startLt: '1' }
  const two = { ...one, id: '2'.repeat(32) }
  writeLock(both, one)
  writeLock(both, two)
  removeLock(both, one)
  assert.deepEqual(readLocks(both), [two])
})

await check('the connected wallet is read again right before the send', async () => {
  // The member switches wallets in TON Connect while the guard awaits its reads.
  const ctx = context({ ctx: { live: CLUB } })
  ctx.connectedNow = () => ctx.live
  ctx.readOverview = async () => {
    ctx.live = OTHER
    return overview()
  }
  await expectRefused(ctx, 'claim', claimSnapshot, 'mismatch')
  assert.deepEqual(readLocks(ctx.store), [])
  const gone = context({ ctx: { connectedNow: () => undefined } })
  await expectRefused(gone, 'upgrade', upgradeSnapshot, 'mismatch')
  assert.deepEqual(readLocks(gone.store), [])
})

await check('lock coverage by chain time: a transaction older than created − 60 s covers the lock', () => {
  const v = T0 + 300
  // An unreadable startLt (or one from another wallet) is covered by chain time alone.
  const lock = { account: '42', target: 'claim', validUntil: v, created: T0, startLt: 'x' }
  const evidence = { claims: [] }
  const older = [
    { lt: 9100n, now: T0 + 100, matches: [] },
    { lt: 9000n, now: T0 - 61, matches: [] },
  ]
  assert.deepEqual(
    judgeLock(lock, read({ blockTime: v + 60, lastLt: 9100n, txs: older, coveredFrom: 8990n }), evidence, new Set()),
    {
      kind: 'released',
      by: 'chain',
    },
  )
  const notOlder = [{ lt: 9100n, now: T0 - 60, matches: [] }]
  assert.equal(
    judgeLock(lock, read({ blockTime: v + 60, lastLt: 9100n, txs: notOlder, coveredFrom: 9090n }), evidence, new Set())
      .kind,
    'keep',
  )
  const matched = [{ lt: 9100n, now: T0 + 10, matches: [{ op: 'claim' }] }, ...older.slice(1)]
  assert.equal(
    judgeLock(lock, read({ blockTime: v + 60, lastLt: 9100n, txs: matched, coveredFrom: 8990n }), evidence, new Set())
      .kind,
    'keep',
  )
})

// A lock from about 65 h ago on a wallet with a transaction every 10 minutes: 390 since the lock.
function oldLockSetup({ pageSize, matchAfterLock = false }) {
  const txs = chainOf(400, { step: 600, from: 1_000_000n })
  const at = 390
  if (matchAfterLock) {
    txs[at - 1].outMessages = { values: () => [toHipo(Cell.fromBase64(claimPayload(beginCell)))] }
  }
  const created = txs[at].now + 30
  const store = new MemoryStore()
  writeLock(store, {
    id: 'c'.repeat(32),
    account: '42',
    target: 'claim',
    validUntil: created + 300,
    created,
    startLt: txs[at].lt.toString(),
  })
  const client = fakeClient(txs, { pageSize })
  const chain = createChainReader({ tonClient: () => client, parseAddress: (v) => Address.parse(v) })
  return { store, chain, client }
}

await check('an old lock beyond the page cap is paged on and released, never blocking for good', async () => {
  const { store, chain } = oldLockSetup({ pageSize: 20 })
  // The guard's read stops at its 10 pages (24 h reached); the lock's own read goes on from there.
  await expectRefused(context({ store, ctx: { chain } }), 'claim', claimSnapshot, 'lockReleased')
  assert.deepEqual(readLocks(store), [])
  assert.equal((await sendClubPayment(context({ store, ctx: { chain } }), 'claim', claimSnapshot)).outcome, 'sent')
})

await check('an old lock further back than two reads goes on from its stored place at the next try', async () => {
  const { store, chain } = oldLockSetup({ pageSize: 15 })
  await expectRefused(context({ store, ctx: { chain } }), 'claim', claimSnapshot, 'locked')
  const [stored] = readLocks(store)
  assert.ok(stored.resume !== undefined && BigInt(stored.resume.lt) < 1_000_000n - 2990n)
  await expectRefused(context({ store, ctx: { chain } }), 'claim', claimSnapshot, 'lockReleased')
  assert.deepEqual(readLocks(store), [])
})

await check('an old lock whose message landed is not released by the chain: not applied, then the ack', async () => {
  const { store, chain } = oldLockSetup({ pageSize: 20, matchAfterLock: true })
  const result = await expectRefused(context({ store, ctx: { chain } }), 'claim', claimSnapshot, 'notApplied')
  assert.equal(readLocks(store).length, 1)
  assert.equal(readLocks(store)[0].resume, undefined)
  addAck(store, result.ackKey)
  await expectRefused(context({ store, ctx: { chain } }), 'claim', claimSnapshot, 'lockReleased')
})

await check('continueLockRead: nothing more is read, or stored, before validUntil + 60', async () => {
  const store = new MemoryStore()
  const lock = { id: 'd'.repeat(32), account: '42', target: 'claim', validUntil: T0 + 300, created: T0, startLt: '5' }
  writeLock(store, lock)
  let reads = 0
  const r = read({
    blockTime: T0 + 359,
    lastLt: 9000n,
    txs: [{ lt: 9000n, now: T0 + 100, matches: [] }],
    coveredFrom: 8990n,
  })
  r.cursor = { lt: '8990', hash: '' }
  const out = await continueLockRead({ store, chain: { read: async () => (reads++, read()) } }, CLUB, lock, r)
  assert.equal(out, r)
  assert.equal(reads, 0)
  assert.equal(readLocks(store)[0].resume, undefined)
})

// ------------------------------------------------- the server's "payment in progress" record

await check('clubpayintent is the last await: sent once, before the lock, with target, level and v', async () => {
  const claim = context()
  assert.equal((await sendClubPayment(claim, 'claim', claimSnapshot)).outcome, 'sent')
  assert.deepEqual(claim.intents, [
    { target: 'claim', validUntil: T0 + 305, wallet: CLUB.toRawString(), locksAtIntent: 0 },
  ])
  assert.deepEqual(claim.lockAtSend, [1])
  assert.equal(claim.cancels.length, 0)
  const upgrade = context()
  assert.equal((await sendClubPayment(upgrade, 'upgrade', upgradeSnapshot)).outcome, 'sent')
  assert.deepEqual(upgrade.intents, [
    { target: 'upgrade', level: 5, validUntil: T0 + 305, wallet: CLUB.toRawString(), locksAtIntent: 0 },
  ])
  assert.equal(upgrade.sent[0].validUntil, T0 + 305)
})

await check('a second device: payment_in_progress from clubpayintent → "on its way", nothing sent', async () => {
  for (const [kind, snapshot, open] of [
    ['claim', claimSnapshot, { target: 'claim', validUntil: T0 + 200, created: T0 - 100 }],
    ['upgrade', upgradeSnapshot, { target: 'upgrade', level: 5, validUntil: T0 + 200, created: T0 - 100 }],
    ['upgrade', upgradeSnapshot, { target: 'upgrade', validUntil: T0 + 200, created: T0 - 100 }],
  ]) {
    const ctx = context({ intent: async () => ({ ok: false, reason: 'payment_in_progress', open }) })
    const result = await expectRefused(ctx, kind, snapshot, 'onItsWay')
    assert.equal(result.at, T0 - 100)
    assert.equal(ctx.intents.length, 1)
    assert.equal(readLocks(ctx.store).length, 0, 'no lock is written')
    assert.equal(ctx.cancels.length, 0)
  }
  // The refusal without the record: still "on its way", with no time.
  const bare = context({ intent: async () => ({ ok: false, reason: 'payment_in_progress' }) })
  const result = await expectRefused(bare, 'claim', claimSnapshot, 'onItsWay')
  assert.equal(result.at, undefined)
})

await check('wallet_changed from clubpayintent → walletChanged, nothing sent, no lock', async () => {
  const ctx = context({ intent: async () => ({ ok: false, reason: 'wallet_changed' }) })
  await expectRefused(ctx, 'claim', claimSnapshot, 'walletChanged')
  assert.equal(readLocks(ctx.store).length, 0)
  assert.equal(ctx.cancels.length, 0)
})

await check("another payment's open record → payInProgress, nothing sent", async () => {
  const claimOpen = { target: 'claim', validUntil: T0 + 200, created: T0 - 100 }
  const upgradeOpen = { target: 'upgrade', level: 5, validUntil: T0 + 200, created: T0 - 100 }
  const otherLevel = { target: 'upgrade', level: 7, validUntil: T0 + 200, created: T0 - 100 }
  const unknown = { target: 'unknown' }
  for (const [kind, snapshot, open] of [
    ['upgrade', upgradeSnapshot, claimOpen],
    ['claim', claimSnapshot, upgradeOpen],
    ['upgrade', upgradeSnapshot, otherLevel],
    ['claim', claimSnapshot, unknown],
    ['upgrade', upgradeSnapshot, unknown],
  ]) {
    const ctx = context({ intent: async () => ({ ok: false, reason: 'payment_in_progress', open }) })
    await expectRefused(ctx, kind, snapshot, 'payInProgress')
    const viaOverview = context({ overview: { payInProgress: open } })
    await expectRefused(viaOverview, kind, snapshot, 'payInProgress')
    assert.equal(viaOverview.intents.length, 0)
  }
})

await check('the intent fails closed: a throw, a closed socket, any other refusal, a malformed answer', async () => {
  for (const intent of [
    async () => {
      throw new Error('closed')
    },
    async () => ({ ok: false, reason: 'rate_limited' }),
    async () => ({ ok: false, reason: 'not_open' }),
    async () => ({ ok: false }),
    async () => undefined,
    async () => ({ ok: 'yes' }),
  ]) {
    for (const [kind, snapshot] of [
      ['claim', claimSnapshot],
      ['upgrade', upgradeSnapshot],
    ]) {
      const ctx = context({ intent })
      await expectRefused(ctx, kind, snapshot, 'intentFailed')
      assert.equal(ctx.intents.length, 1)
      assert.equal(readLocks(ctx.store).length, 0)
    }
  }
})

await check('pay_in_progress on cluboverview or clubstatus → no intent, nothing sent', async () => {
  const open = { target: 'claim', validUntil: T0 + 200, created: T0 - 30 }
  const ctx = context({ overview: { payInProgress: open } })
  const result = await expectRefused(ctx, 'claim', claimSnapshot, 'onItsWay')
  assert.equal(result.at, T0 - 30)
  assert.equal(ctx.intents.length, 0)
  const up = { target: 'upgrade', level: 5, validUntil: T0 + 200, created: T0 - 30 }
  const viaStatus = context({ status: { payInProgress: up } })
  await expectRefused(viaStatus, 'upgrade', upgradeSnapshot, 'onItsWay')
  assert.equal(viaStatus.intents.length, 0)
})

await check('a wallet rejection sends clubpaycancel, then releases the lock', async () => {
  const ctx = context({ sendError: new UserRejects('declined') })
  const result = await sendClubPayment(ctx, 'claim', claimSnapshot)
  assert.equal(result.outcome, 'rejected')
  assert.deepEqual(ctx.cancels, [{ created: T0 + 4, locks: 1 }], 'cancel names the record, before the lock goes')
  assert.equal(readLocks(ctx.store).length, 0)
  // A failed cancel still releases the local lock (the record closes on its own time).
  const failed = context({ sendError: new UserRejects('declined'), cancelError: new Error('closed') })
  assert.equal((await sendClubPayment(failed, 'upgrade', upgradeSnapshot)).outcome, 'rejected')
  assert.deepEqual(failed.cancels, [{ created: T0 + 4, locks: 1 }])
  assert.equal(readLocks(failed.store).length, 0)
  // An ok without the record's created: nothing to name, no cancel; the lock is still released.
  const bare = context({ sendError: new UserRejects('declined'), intent: async () => ({ ok: true }) })
  assert.equal((await sendClubPayment(bare, 'claim', claimSnapshot)).outcome, 'rejected')
  assert.equal(bare.cancels.length, 0)
  assert.equal(readLocks(bare.store).length, 0)
})

await check('a wallet timeout keeps the lock and the record: no cancel', async () => {
  const ctx = context({ sendError: new Error('timeout') })
  const result = await sendClubPayment(ctx, 'claim', claimSnapshot)
  assert.equal(result.outcome, 'walletError')
  assert.equal(ctx.cancels.length, 0)
  assert.equal(readLocks(ctx.store).length, 1)
})

await check('no record is opened for a send that is refused anyway', async () => {
  // A store that keeps nothing: refused before the intent.
  const store = { getItem: () => null, setItem: () => undefined }
  const silent = context({ store })
  await expectRefused(silent, 'claim', claimSnapshot, 'storage')
  assert.equal(silent.intents.length, 0)
  const throwing = context({
    store: {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
    },
  })
  await expectRefused(throwing, 'claim', claimSnapshot, 'storage')
  assert.equal(throwing.intents.length, 0)
  // The connected wallet changed before the intent: refused, no intent.
  const moved = context()
  moved.connectedNow = () => OTHER
  await expectRefused(moved, 'claim', claimSnapshot, 'mismatch')
  assert.equal(moved.intents.length, 0)
  // Every earlier refusal comes before the intent too (here the chain check).
  const onway = context({ read: read({ txs: [claimTx(T0 - 600, 990n)] }) })
  await expectRefused(onway, 'claim', claimSnapshot, 'onItsWay')
  assert.equal(onway.intents.length, 0)
})

await check('the wallet or another tab changes while clubpayintent is awaited → nothing sent', async () => {
  const moved = context({
    intent: async () => {
      moved.connectedNow = () => OTHER
      return { ok: true }
    },
  })
  await expectRefused(moved, 'claim', claimSnapshot, 'mismatch')
  const store = new MemoryStore()
  const raced = context({
    store,
    intent: async () => {
      writeLock(store, {
        id: 'other-tab',
        account: '42',
        target: 'claim',
        validUntil: T0 + 300,
        created: T0,
        startLt: '1000',
      })
      return { ok: true }
    },
  })
  await expectRefused(raced, 'claim', claimSnapshot, 'locked')
})

await check('a lock is judged on a read of the wallet that paid it, not the new Club wallet', async () => {
  const lock = {
    id: 'e'.repeat(32),
    account: '42',
    target: 'claim',
    validUntil: T0 + 300,
    created: T0,
    startLt: '1000',
    wallet: CLUB.toRawString(),
  }
  const moved = { ...claimSnapshot, clubWallet: OTHER.toRawString() }
  const wallets = { clubWallet: OTHER.toRawString() }
  const run = (clubRead) => {
    const store = new MemoryStore()
    writeLock(store, lock)
    const reads = []
    const ctx = context({
      store,
      status: wallets,
      overview: wallets,
      ctx: {
        serverNow: () => T0 + 400,
        connected: OTHER,
        chain: {
          read: async (address) => {
            reads.push(address.toRawString())
            // The new wallet's read reaches back to 0: it would cover the lock if it counted.
            return address.equals(OTHER) ? read({ blockTime: T0 + 400, lastLt: 50n, coveredFrom: 0n }) : clubRead
          },
        },
      },
    })
    return { ctx, store, reads }
  }
  // W2's read covers everything, but the lock is W1's: its own read does not reach the lock, so it stays.
  const kept = run(read({ blockTime: T0 + 400, lastLt: 2000n, coveredFrom: 1500n }))
  await expectRefused(kept.ctx, 'claim', moved, 'locked')
  assert.equal(readLocks(kept.store).length, 1)
  assert.ok(kept.reads.includes(CLUB.toRawString()), 'the lock wallet is read')
  // W1's read covers the lock past validUntil + 60 with no match: released.
  const freed = run(read({ blockTime: T0 + 400, lastLt: 2000n, coveredFrom: 900n }))
  await expectRefused(freed.ctx, 'claim', moved, 'lockReleased')
  assert.deepEqual(readLocks(freed.store), [])
  // W1's read failing keeps the lock.
  const failing = run(read())
  failing.ctx.chain.read = async (address) => {
    if (address.equals(CLUB)) {
      throw new Error('down')
    }
    return read({ blockTime: T0 + 400, lastLt: 50n, coveredFrom: 0n })
  }
  await expectRefused(failing.ctx, 'claim', moved, 'locked')
  assert.equal(readLocks(failing.store).length, 1)
})

await check('an opened record is cancelled when the page then sends nothing; a lost reply sends nothing', async () => {
  // The late checks refuse: the connected wallet changed during the intent await.
  const moved = context({
    ctx: {
      openPayIntent: async () => {
        moved.connected = OTHER
        return { ok: true, created: T0 + 4 }
      },
    },
  })
  await expectRefused(moved, 'claim', claimSnapshot, 'mismatch')
  assert.deepEqual(moved.cancels, [{ created: T0 + 4, locks: 0 }])
  // writeLock fails (storage) after the intent.
  const store = new MemoryStore()
  let failing = false
  const realSet = store.setItem.bind(store)
  store.setItem = (key, value) => {
    if (failing && key === LOCKS_KEY) {
      throw new Error('quota')
    }
    return realSet(key, value)
  }
  const full = context({
    store,
    ctx: {
      openPayIntent: async () => {
        failing = true
        return { ok: true, created: T0 + 4 }
      },
    },
  })
  await expectRefused(full, 'claim', claimSnapshot, 'storage')
  assert.deepEqual(full.cancels, [{ created: T0 + 4, locks: 0 }])
  // A timeout or lost reply: no `created`, nothing to cancel, nothing sent.
  const lost = context({
    intent: async () => {
      throw new Error('timeout')
    },
  })
  await expectRefused(lost, 'claim', claimSnapshot, 'intentFailed')
  assert.equal(lost.cancels.length, 0)
  // An ok without `created` that then refuses late: nothing to name.
  const lateBare = context({
    ctx: {
      openPayIntent: async () => {
        lateBare.connected = OTHER
        return { ok: true }
      },
    },
  })
  await expectRefused(lateBare, 'claim', claimSnapshot, 'mismatch')
  assert.equal(lateBare.cancels.length, 0)
})

if (process.argv.includes('--print-boc')) {
  console.log('claim', claimPayload(beginCell))
  for (let n = 2; n <= 10; n++) {
    console.log('upgrade', n, upgradePayload(beginCell, n))
  }
}

console.log(`club-tx-selftest: ${count} checks passed`)
