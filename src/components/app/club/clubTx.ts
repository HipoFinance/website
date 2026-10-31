// The Club's two transactions: the claim fee and the instant upgrade (specs/club-website.md §6a, §7).
// Money code: every byte of what these return is what the member's wallet signs and what the Club
// server judges. The server keeps GRAM that arrives with the wrong amount, body, level or sender
// (rule D1, no refund), so nothing here is ever rounded, guessed or read from a float.
//
// Pure functions only. The cell builder is passed in (`beginCell` from ./chain.ts in the page, from
// @ton/core in scripts/club-tx-selftest.mjs) because this module must not import @ton/core itself:
// a static import from the Club chunk would split @ton/core into a chunk of its own, evaluated
// before chain.ts installs the Buffer polyfill (see .claude/rules/app.md, code splitting).
import type { beginCell as BeginCell } from '@ton/core'

export type CellBuilder = typeof BeginCell

// hipo.ton, the wallet that receives claim fees and upgrade payments (club-server addressbook.go:25).
// The non-bounceable form, as club-web sends it, which gives the message bounce = false.
export const HIPO_TON = 'UQCSlnhRIHYCAlt1FoQVlBHzxmaQOMj9Efu80DwoggSlt6UI'
export const HIPO_TON_RAW = '0:92967851207602025b751684159411f3c6669038c8fd11fbbcd03c288204a5b7'

// C, the claim fee: exactly 1 GRAM in nanoGRAM (club-server jobs.go:100, HtonRewardWithdrawalFee).
export const CLAIM_FEE_NANO = '1000000000'

export const OP_CLAIM = 0xfee1
export const OP_UPGRADE = 0xb0

// TON Connect's CHAIN.MAINNET (protocol value). The page passes the enum's own value; this copy is
// only the default the selftest checks against it.
export const TON_MAINNET = '-239'

// v = floor(server time) + 300 (§6 step 5). The wallet contract checks it against chain time.
export const VALID_FOR_SECONDS = 300

// The highest level; n ≤ 10.
export const TOP_LEVEL = 10

// The largest fee a payment is ever built for (Definitions, f_n): 0 < f_n ≤ 10,000 GRAM.
export const MAX_FEE_GRAM = 10_000

// The claim minimum, 100 HPO, in nanoHPO (spec 1 §5).
export const CLAIM_MIN_NANO = 100_000_000_000n

const NANO = 1_000_000_000n

/** validUntil for a request built now: an integer number of seconds, from the server clock only. */
export function validUntilAt(serverTime: number): number | undefined {
  if (typeof serverTime !== 'number' || !Number.isFinite(serverTime) || serverTime <= 0) {
    return undefined
  }
  return Math.floor(serverTime) + VALID_FOR_SECONDS
}

/**
 * n, the 1-based target level of an upgrade, from `clubstatus.club_level` (0-based on the wire):
 * n = club_level + 2. Undefined when the level is not a whole number in 0..8, so n is always 2..10;
 * at club_level 9 (Level 10) there is nothing to upgrade to.
 */
export function upgradeTarget(clubLevel: unknown): number | undefined {
  if (typeof clubLevel !== 'number' || !Number.isSafeInteger(clubLevel) || clubLevel < 0) {
    return undefined
  }
  const n = clubLevel + 2
  return n <= TOP_LEVEL ? n : undefined
}

/**
 * A_n = f_n × 10^9 as a decimal string, from the fee as the server sends it (a JSON number of GRAM).
 * Undefined, so no payment is built, unless the fee is a whole number with 0 < f_n ≤ 10,000: a
 * string, NaN, ±Infinity, 0, a negative, a fraction (20.5) and a float that is not exactly whole
 * (1100.0000000000002) are all refused. The multiplication is BigInt; no float is multiplied.
 */
export function upgradeAmountNano(fee: unknown): string | undefined {
  if (typeof fee !== 'number' || !Number.isSafeInteger(fee) || fee <= 0 || fee > MAX_FEE_GRAM) {
    return undefined
  }
  return (BigInt(fee) * NANO).toString()
}

/**
 * B in nanoHPO from the server's decimal string (2b `unclaimed`, "123.456789012"): digits, an
 * optional dot and at most 9 decimals; no sign, no exponent, no spaces. Anything else is unknown
 * (undefined) and offers no Claim. Never rounded.
 */
export function parseHpoNano(value: unknown): bigint | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const match = /^([0-9]+)(?:\.([0-9]{1,9}))?$/.exec(value)
  if (match === null) {
    return undefined
  }
  const whole = BigInt(match[1])
  const fraction = BigInt((match[2] ?? '').padEnd(9, '0'))
  return whole * NANO + fraction
}

/** The claim body: uint32 0xfee1, uint64 query id 0, nothing else. Base64 BOC. */
export function claimPayload(beginCell: CellBuilder): string {
  return beginCell().storeUint(OP_CLAIM, 32).storeUint(0, 64).endCell().toBoc().toString('base64')
}

/** The upgrade body: uint32 0xb0, uint64 query id 0, uint8 n, nothing else. Base64 BOC. */
export function upgradePayload(beginCell: CellBuilder, n: number): string {
  if (!Number.isSafeInteger(n) || n < 2 || n > TOP_LEVEL) {
    throw new Error('upgrade level out of range')
  }
  return beginCell().storeUint(OP_UPGRADE, 32).storeUint(0, 64).storeUint(n, 8).endCell().toBoc().toString('base64')
}

export interface ClubTxMessage {
  address: string
  amount: string
  payload: string
}

// The shape TON Connect's sendTransaction takes; `network` and `from` pin the request to mainnet
// and to the Club wallet, so a wallet app connected to anything else refuses it.
export interface ClubTx {
  validUntil: number
  network: string
  from: string
  messages: [ClubTxMessage]
}

interface TxBase {
  beginCell: CellBuilder
  // The Club wallet, raw ("0:…"): the connected wallet, already checked to equal clubstatus.club_wallet.
  from: string
  validUntil: number
  network?: string
}

function checkBase({ from, validUntil }: TxBase) {
  if (!/^-?[0-9]+:[0-9a-f]{64}$/.test(from)) {
    throw new Error('from must be a raw address')
  }
  if (!Number.isSafeInteger(validUntil) || validUntil <= 0) {
    throw new Error('validUntil must be whole seconds')
  }
}

/** §6a: one message to hipo.ton, exactly 1 GRAM, body 0xfee1 + 0; no stateInit. */
export function buildClaimTx(base: TxBase): ClubTx {
  checkBase(base)
  return {
    validUntil: base.validUntil,
    network: base.network ?? TON_MAINNET,
    from: base.from,
    messages: [{ address: HIPO_TON, amount: CLAIM_FEE_NANO, payload: claimPayload(base.beginCell) }],
  }
}

/**
 * §7: one message to hipo.ton, A_n nanoGRAM, body 0xb0 + 0 + n; no stateInit. Undefined (nothing to
 * send) when n or the fee is not acceptable — the caller shows an error and sends nothing.
 */
export function buildUpgradeTx(base: TxBase & { n: number; fee: unknown }): ClubTx | undefined {
  checkBase(base)
  if (!Number.isSafeInteger(base.n) || base.n < 2 || base.n > TOP_LEVEL) {
    return undefined
  }
  const amount = upgradeAmountNano(base.fee)
  if (amount === undefined) {
    return undefined
  }
  return {
    validUntil: base.validUntil,
    network: base.network ?? TON_MAINNET,
    from: base.from,
    messages: [{ address: HIPO_TON, amount, payload: upgradePayload(base.beginCell, base.n) }],
  }
}
