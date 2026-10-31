// The one adapter between the Club server's wire format and the page (specs/club-website.md §2).
// Spec 2 (`clubauth`, `clubstatus`, linking) and spec 2b (`cluboverview`, `clubrewards`,
// `clubfriends`, `clubleaderboard`, `clubsettings`) as built in club-server's game/redis/clubread.go,
// clublink.go and clubsession.go; `/wallet-rewards` as in currentwallet.go. If the server's format
// changes, this file changes and nothing else.
//
// Every mapper is defensive: a missing or mistyped field becomes undefined, never a guessed value.
// Amounts stay the server's decimal strings; parseHpoNano in clubTx.ts is the only reader of an
// amount a decision depends on.
import type { ServerPayIntent } from './payments.ts'

// ------------------------------------------------------------------------------------ primitives

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function int(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined
}

function bool(value: unknown): boolean {
  return value === true
}

function obj(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

// ------------------------------------------------------------------------------------ replies

// The head of every Club reply (clubReply): ok, the refusal reason, the server's clock and, on a
// not_open reply after L, launching.
export interface ReplyHead {
  ok: boolean
  reason?: string
  now?: number
  launching: boolean
}

export function headOf(body: unknown): ReplyHead {
  const b = obj(body)
  return { ok: bool(b.ok), reason: str(b.reason), now: int(b.now), launching: bool(b.launching) }
}

export interface AuthReply extends ReplyHead {
  token?: string
  expiresAt?: number
  account?: string
}

export function toAuth(body: unknown): AuthReply {
  const b = obj(body)
  const account = int(b.account)
  return { ...headOf(b), token: str(b.token), expiresAt: int(b.expires_at), account: account?.toString() }
}

// `pay_in_progress` {target, level, valid_until, created}: the server's open "payment in progress"
// record (decided 2026-10-27). Present with an unreadable target it still blocks (target 'unknown').
export function toPayInProgress(value: unknown): ServerPayIntent | undefined {
  if (value == null) {
    return undefined
  }
  const b = obj(value)
  return {
    target: b.target === 'claim' || b.target === 'upgrade' ? b.target : 'unknown',
    level: int(b.level),
    validUntil: int(b.valid_until),
    created: int(b.created),
  }
}

// The clubpayintent reply (club-server clubpayintent.go): ok with the record written, or a refusal;
// `payment_in_progress` carries the open record. Both under `pay_in_progress`.
export interface PayIntentReply extends ReplyHead {
  open?: ServerPayIntent
}

export function toPayIntentReply(body: unknown): PayIntentReply {
  const b = obj(body)
  return { ...headOf(b), open: toPayInProgress(b.pay_in_progress) }
}

export type ClubState = 'ok' | 'grace' | 'suspended'

export interface ClubStatus extends ReplyHead {
  clubWallet?: string
  clubWalletMasked?: string
  pastWallets: string[]
  // 0-based, as on the wire; members see clubLevel + 1.
  clubLevel: number
  boost?: number
  minimum?: string
  state: string
  nextSwitchAt?: number
  switchPending: boolean
  frozen: boolean
  notifyFailed: boolean
  payInProgress?: ServerPayIntent
}

export function toStatus(body: unknown): ClubStatus {
  const b = obj(body)
  return {
    ...headOf(b),
    clubWallet: str(b.club_wallet),
    clubWalletMasked: str(b.club_wallet_masked),
    pastWallets: list(b.past_wallets).filter((w): w is string => typeof w === 'string'),
    clubLevel: int(b.club_level) ?? 0,
    boost: num(b.boost),
    minimum: str(b.minimum),
    state: str(b.state) ?? 'ok',
    nextSwitchAt: int(b.next_switch_at),
    switchPending: bool(b.switch_pending),
    frozen: bool(b.frozen),
    notifyFailed: bool(b.notify_failed),
    payInProgress: toPayInProgress(b.pay_in_progress),
  }
}

export interface ClaimGate {
  ok: boolean
  reason?: string
  opensAt?: number
}

/**
 * The sentence of a claim gate reason: its catalog key `club.gate.<reason in camelCase>` and the time
 * its {date} names (the gate's `opens_at`, else `claims_open_at`; link_wait and revert_hold need it).
 */
export function gateMessage(
  reason: string,
  overview: { claim?: ClaimGate; claimsOpenAt?: number } | undefined,
): { key: string; dateAt?: number } {
  return {
    key: 'club.gate.' + reason.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
    dateAt: overview?.claim?.opensAt ?? overview?.claimsOpenAt,
  }
}

export interface ClaimRecord {
  amount?: number
  wallet?: string
  txHash?: string
  claimTime?: number
  requestTime?: number
}

function toClaimRecord(value: unknown): ClaimRecord {
  const b = obj(value)
  return {
    amount: num(b.amount),
    wallet: str(b.wallet),
    txHash: str(b.tx_hash),
    claimTime: int(b.claim_time),
    requestTime: int(b.request_time),
  }
}

export interface ClaimInProgress {
  amount?: string
  wallet?: string
  claimTime?: number
  // Not sent by the server today (ClubClaimInProgress has claim_time only); read if it appears.
  requestTime?: number
}

export interface Streams {
  staking?: string
  referral?: string
  community?: string
}

function toStreams(value: unknown): Streams | undefined {
  if (value == null) {
    return undefined
  }
  const b = obj(value)
  return { staking: str(b.staking), referral: str(b.referral), community: str(b.community) }
}

export interface WalletSplit {
  balanceHpo?: string
  balanceHpoDedust?: string
  balanceHpoStonfi?: string
  balanceHpoTonco?: string
  balanceHton?: string
  balanceHtonDedust?: string
  balanceHtonStonfi?: string
  balanceHtonTonco?: string
  balancesAt?: number
  lpAt?: number
}

export interface ClubRank {
  listed: boolean
  why?: string
  clubLevel: number
  rank?: number
  of?: number
  band?: number
  growth?: number
  buy?: { x: string; rank: number }
}

export interface ClubSettings {
  hideName: boolean
  alerts: boolean
  alertsUnreachable: boolean
}

function toSettings(value: unknown): ClubSettings {
  const b = obj(value)
  return { hideName: bool(b.hide_name), alerts: bool(b.alerts), alertsUnreachable: bool(b.alerts_unreachable) }
}

export interface ClubSeason {
  number?: number
  start?: number
  end?: number
}

export interface ClubOverview extends ReplyHead {
  clubLevel: number
  boost?: number
  nextLevel?: number
  nextBoost?: number
  // GRAM, a JSON number: FeeAt(next, now). Kept as sent; the guard checks it.
  upgradeFee?: unknown

  state: string
  stateSince?: number
  stateUntil?: number
  restoredAt?: number
  resetAt?: number
  resetFromLevel?: number
  chip: string

  minimum?: string
  holdings?: string
  holdingsAt?: number
  holdingsFresh: boolean
  ratio?: number
  short?: string
  split?: WalletSplit
  estimateNow?: string
  estimateNext?: string

  unclaimed?: string
  unclaimedByStream?: Streams
  claimMin?: number
  lastRoundHpo?: string

  claim: ClaimGate
  claimsOpenAt?: number
  claimInProgress?: ClaimInProgress
  recentClaims: ClaimRecord[]
  wrapupPending: boolean
  payInProgress?: ServerPayIntent

  season: ClubSeason
  claimedThisSeason: boolean
  seasonalOk: boolean

  clubWallet?: string
  clubWalletMasked?: string
  switchPending: boolean
  frozen: boolean
  notifyFailed: boolean
  displayName?: string

  friends: { count?: number; referralTotal?: string }
  rank: ClubRank
  settings: ClubSettings
}

export function toOverview(body: unknown): ClubOverview {
  const b = obj(body)
  const gate = obj(b.claim)
  const split = b.split == null ? undefined : obj(b.split)
  const rank = obj(b.rank)
  const buy = rank.buy == null ? undefined : obj(rank.buy)
  const progress = b.claim_in_progress == null ? undefined : obj(b.claim_in_progress)
  const season = obj(b.season)
  const friends = obj(b.friends)
  return {
    ...headOf(b),
    clubLevel: int(b.club_level) ?? 0,
    boost: num(b.boost),
    nextLevel: int(b.next_level),
    nextBoost: num(b.next_boost),
    upgradeFee: b.upgrade_fee,

    state: str(b.state) ?? 'ok',
    stateSince: int(b.state_since),
    stateUntil: int(b.state_until),
    restoredAt: int(b.restored_at),
    resetAt: int(b.reset_at),
    resetFromLevel: int(b.reset_from_level),
    chip: str(b.chip) ?? 'active',

    minimum: str(b.minimum),
    holdings: str(b.holdings),
    holdingsAt: int(b.holdings_at),
    holdingsFresh: bool(b.holdings_fresh),
    ratio: int(b.ratio),
    short: str(b.short),
    split:
      split === undefined
        ? undefined
        : {
            balanceHpo: str(split.balance_hpo),
            balanceHpoDedust: str(split.balance_hpo_dedust),
            balanceHpoStonfi: str(split.balance_hpo_stonfi),
            balanceHpoTonco: str(split.balance_hpo_tonco),
            balanceHton: str(split.balance_hton),
            balanceHtonDedust: str(split.balance_hton_dedust),
            balanceHtonStonfi: str(split.balance_hton_stonfi),
            balanceHtonTonco: str(split.balance_hton_tonco),
            balancesAt: int(split.balances_at),
            lpAt: int(split.lp_at),
          },
    estimateNow: str(b.estimate_now),
    estimateNext: str(b.estimate_next),

    unclaimed: str(b.unclaimed),
    unclaimedByStream: toStreams(b.unclaimed_by_stream),
    claimMin: int(b.claim_min),
    lastRoundHpo: str(b.last_round_hpo),

    claim: { ok: bool(gate.ok), reason: str(gate.reason), opensAt: int(gate.opens_at) },
    claimsOpenAt: int(b.claims_open_at),
    claimInProgress:
      progress === undefined
        ? undefined
        : {
            amount: str(progress.amount),
            wallet: str(progress.wallet),
            claimTime: int(progress.claim_time),
            requestTime: int(progress.request_time),
          },
    recentClaims: list(b.recent_claims).map(toClaimRecord),
    wrapupPending: bool(b.wrapup_pending),
    payInProgress: toPayInProgress(b.pay_in_progress),

    season: { number: int(season.number), start: int(season.start), end: int(season.end) },
    claimedThisSeason: bool(b.claimed_this_season),
    seasonalOk: bool(b.seasonal_ok),

    clubWallet: str(b.club_wallet),
    clubWalletMasked: str(b.club_wallet_masked),
    switchPending: bool(b.switch_pending),
    frozen: bool(b.frozen),
    notifyFailed: bool(b.notify_failed),
    displayName: str(b.display_name),

    friends: { count: int(friends.count), referralTotal: str(friends.referral_total) },
    rank: {
      listed: bool(rank.listed),
      why: str(rank.why),
      clubLevel: int(rank.club_level) ?? 0,
      rank: int(rank.rank),
      of: int(rank.of),
      band: int(rank.band),
      growth: num(rank.growth),
      buy: buy === undefined ? undefined : { x: str(buy.x) ?? '', rank: int(buy.rank) ?? 0 },
    },
    settings: toSettings(b.settings),
  }
}

export interface ClubRound {
  time?: number
  hpo?: string
  stakeReward?: string
}

export interface ClubRewards extends ReplyHead {
  rounds: ClubRound[]
  claims: ClaimRecord[]
  totals: { staking?: string; referral?: string }
  unclaimed?: string
  unclaimedByStream?: Streams
  referralRounds: { round?: number; time?: number; hpo?: string }[]
  referralBeforeLaunch?: string
  stakeSumRewards?: string
  stakeRewardsSince?: number
}

export function toRewards(body: unknown): ClubRewards {
  const b = obj(body)
  const totals = obj(b.totals)
  return {
    ...headOf(b),
    rounds: list(b.rounds).map((value) => {
      const r = obj(value)
      return { time: int(r.time), hpo: str(r.hpo), stakeReward: str(r.stake_reward) }
    }),
    claims: list(b.claims).map(toClaimRecord),
    totals: { staking: str(totals.staking), referral: str(totals.referral) },
    unclaimed: str(b.unclaimed),
    unclaimedByStream: toStreams(b.unclaimed_by_stream),
    referralRounds: list(b.referral_rounds).map((value) => {
      const r = obj(value)
      return { round: int(r.round), time: int(r.time), hpo: str(r.hpo) }
    }),
    referralBeforeLaunch: str(b.referral_before_launch),
    stakeSumRewards: str(b.stake_sum_rewards),
    stakeRewardsSince: int(b.stake_rewards_since),
  }
}

export type FriendsFilter = 'all' | 'earning' | 'not_staking'

export interface ClubFriendRow {
  name: string
  friendHpo?: string
  yourHpo?: string
}

export interface ClubFriends extends ReplyHead {
  inviteLink?: string
  count?: number
  referralTotal?: string
  rows: ClubFriendRow[]
}

export function toFriends(body: unknown): ClubFriends {
  const b = obj(body)
  return {
    ...headOf(b),
    inviteLink: str(b.invite_link),
    count: int(b.count),
    referralTotal: str(b.referral_total),
    rows: list(b.rows).map((value) => {
      const r = obj(value)
      return { name: str(r.name) ?? '', friendHpo: str(r.friend_hpo), yourHpo: str(r.your_hpo) }
    }),
  }
}

export type BoardBy = 'hpo' | 'growth'

export interface ClubBoardRow {
  rank?: number
  name: string
  band?: number
  // The member's own row: growth this season, exact (%, one decimal).
  growth?: number
  // Other members' rows: a 5-point band, `growth_band {from, to?}` (club-server clubleaderboard.go).
  growthBand?: GrowthBand
}

// A growth band: from `low` to `high` percent, or `low` and over when `high` is undefined.
export interface GrowthBand {
  low: number
  high?: number
}

/**
 * `{from: 20, to: 25}` → {20, 25}; `{from: 100}` → {100} (100 % or more). The string form "20-25" /
 * "100+" / "-10--5" is read too. Anything else is undefined (no figure shown).
 */
export function parseGrowthBand(value: unknown): GrowthBand | undefined {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    const b = obj(value)
    const low = int(b.from)
    const high = b.to == null ? undefined : int(b.to)
    if (low === undefined || (b.to != null && (high === undefined || high <= low))) {
      return undefined
    }
    return { low, high }
  }
  if (typeof value !== 'string') {
    return undefined
  }
  const open = /^(-?\d+(?:\.\d+)?)\+$/.exec(value.trim())
  if (open !== null) {
    return { low: Number(open[1]) }
  }
  const range = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/.exec(value.trim())
  if (range !== null) {
    const low = Number(range[1])
    const high = Number(range[2])
    return low <= high ? { low, high } : undefined
  }
  return undefined
}

export interface ClubLeaderboard extends ReplyHead {
  clubLevel: number
  by?: string
  of?: number
  updated?: number
  rows: ClubBoardRow[]
  me?: ClubBoardRow & { holdings?: string }
}

function toBoardRow(value: unknown): ClubBoardRow {
  const r = obj(value)
  return {
    rank: int(r.rank),
    name: str(r.name) ?? '',
    band: int(r.band),
    growth: num(r.growth),
    growthBand: parseGrowthBand(r.growth_band ?? r.growth),
  }
}

export function toLeaderboard(body: unknown): ClubLeaderboard {
  const b = obj(body)
  return {
    ...headOf(b),
    clubLevel: int(b.club_level) ?? 0,
    by: str(b.by),
    of: int(b.of),
    updated: int(b.updated),
    rows: list(b.rows).map(toBoardRow),
    me: b.me == null ? undefined : { ...toBoardRow(b.me), holdings: str(obj(b.me).holdings) },
  }
}

export function toSettingsReply(body: unknown): ReplyHead & { settings: ClubSettings } {
  const b = obj(body)
  return { ...headOf(b), settings: toSettings(b.settings) }
}

export interface ClubLevel {
  coefficient?: number
  // GRAM, a JSON number as sent; never parsed into an amount here.
  fee: unknown
}

export interface ClubLevels {
  levels: ClubLevel[]
  feesChangeAt?: number
  hasNext: boolean
}

export function toLevels(body: unknown): ClubLevels {
  const b = obj(body)
  return {
    levels: list(b.club_levels).map((value) => {
      const level = obj(value)
      return { coefficient: num(level.reward_coefficient), fee: level.upgrade_fee }
    }),
    feesChangeAt: int(b.fees_change_at),
    // A `next` table or `fees_change_at` after L means the server's clock or L is wrong (§7).
    hasNext: b.next != null || b.fees_change_at != null,
  }
}

export interface ChallengeReply extends ReplyHead {
  payload?: string
  expiresAt?: number
}

export function toChallenge(body: unknown): ChallengeReply {
  const b = obj(body)
  return { ...headOf(b), payload: str(b.payload), expiresAt: int(b.expires_at) }
}

export interface PrepareReply extends ReplyHead {
  id?: string
  kind?: string
  revert: boolean
  claimsFromWalletVoid: boolean
  clubWalletMasked?: string
  previousWalletMasked?: string
  newWallet?: string
  newWalletMasked?: string
  clubLevel: number
  boost?: number
  minimum?: string
  newWalletHpo?: string
  belowMinimum: boolean
  countedHpo?: string
  claimsOpenAt?: number
  expiresAt?: number
}

export function toPrepare(body: unknown): PrepareReply {
  const b = obj(body)
  return {
    ...headOf(b),
    id: str(b.id),
    kind: str(b.kind),
    revert: bool(b.revert),
    claimsFromWalletVoid: bool(b.claims_from_wallet_void),
    clubWalletMasked: str(b.club_wallet_masked),
    previousWalletMasked: str(b.previous_wallet_masked),
    newWallet: str(b.new_wallet),
    newWalletMasked: str(b.new_wallet_masked),
    clubLevel: int(b.club_level) ?? 0,
    boost: num(b.boost),
    minimum: str(b.minimum),
    newWalletHpo: str(b.new_wallet_hpo),
    belowMinimum: bool(b.below_minimum),
    countedHpo: str(b.counted_hpo),
    claimsOpenAt: int(b.claims_open_at),
    expiresAt: int(b.expires_at),
  }
}

export interface ConfirmReply extends ReplyHead {
  state?: string
  token?: string
  expiresAt?: number
}

export function toConfirm(body: unknown): ConfirmReply {
  const b = obj(body)
  return { ...headOf(b), state: str(b.state), token: str(b.token), expiresAt: int(b.expires_at) }
}

// The revenue-share withdrawal reply (withdrawrewards.go HpoWithdrawalResponse): no clubReply head.
export interface WithdrawReply {
  hpoSumRewards?: string
  withdrawals: { requestTime?: number; sent?: number; fee?: number; txHash?: string }[]
}

export function toWithdraw(body: unknown): WithdrawReply {
  const b = obj(body)
  return {
    hpoSumRewards: str(b.hpo_sum_rewards),
    withdrawals: list(b.hpo_reward_withdrawals).map((value) => {
      const r = obj(value)
      return { requestTime: int(r.request_time), sent: num(r.sent), fee: num(r.fee), txHash: str(r.tx_hash) }
    }),
  }
}

// ------------------------------------------------------------------------------- /wallet-rewards

// State A (2b §2, decided 2026-10-27): whether the address is an account's Club wallet and, when it
// is, its level, boost and holding status. The server also sends a `band`; the page does not show it
// (decision: no percentile band in State A).
export interface WalletClub {
  clubWallet: boolean
  clubLevel?: number
  boost?: number
  status?: string
}

export interface EarnedRound {
  time?: number
  stakeReward?: number
  hpoReward?: number
}

export interface WalletRewards {
  // True while L has passed and the launch migration is not done.
  launching: boolean
  club?: WalletClub
  // R, the revenue-share balance in GRAM (decimal string).
  hpoSumRewards?: string
  hpoWithdrawals: { requestTime?: number; sent?: number; fee?: number; txHash?: string }[]
  earnedRewards: EarnedRound[]
  stakeSumRewards?: string
  stakeRewardsSince?: number
}

export const WALLET_REWARDS_URL = 'https://api.hipogang.io/wallet-rewards?address='

export function toWalletRewards(result: unknown): WalletRewards {
  const b = obj(result)
  const club = b.club == null ? undefined : obj(b.club)
  const anyNum = (value: unknown) => {
    const n = typeof value === 'string' ? Number(value) : value
    return num(n)
  }
  return {
    launching: bool(b.club_launching),
    club:
      club === undefined
        ? undefined
        : {
            clubWallet: bool(club.club_wallet),
            clubLevel: int(club.club_level),
            boost: num(club.boost),
            status: str(club.status),
          },
    hpoSumRewards: str(b.hpo_sum_rewards),
    hpoWithdrawals: list(b.hpo_reward_withdrawals).map((value) => {
      const r = obj(value)
      return { requestTime: int(r.request_time), sent: num(r.sent), fee: num(r.fee), txHash: str(r.tx_hash) }
    }),
    earnedRewards: list(b.earned_rewards).map((value) => {
      const r = obj(value)
      return { time: int(r.time), stakeReward: anyNum(r.stake_reward), hpoReward: anyNum(r.hpo_reward) }
    }),
    stakeSumRewards: str(b.stake_sum_rewards),
    stakeRewardsSince: int(b.stake_rewards_since),
  }
}

export async function fetchWalletRewards(address: string): Promise<WalletRewards> {
  const response = await fetch(WALLET_REWARDS_URL + encodeURIComponent(address), {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error('wallet-rewards ' + response.status)
  }
  const json = obj(await response.json())
  if (json.ok !== true) {
    throw new Error('wallet-rewards refused')
  }
  return toWalletRewards(json.result)
}

// --------------------------------------------------------------------------------- the transport

// The Club server as the page sees it: one request, one reply body, matched by type. socket.ts is the
// real one; mock.ts stands in for it under PUBLIC_CLUB_MOCK=1.
export interface ClubTransport {
  // Sends `clubauth` on a fresh connection with this body; the reply decides the session.
  setAuth(auth: (() => Record<string, unknown> | undefined) | undefined): void
  request(type: string, body?: Record<string, unknown>): Promise<unknown>
  close(): void
  // Called with every clubauth reply (a new token, or a refusal) and the auth body it answers.
  onAuthReply?: (body: unknown, sent: Record<string, unknown>) => void
}

// The connection closed, failed or timed out during a request: "failed, try again". A payment or a
// withdrawal is never retried on this.
export class ClubSocketError extends Error {
  kind: 'closed' | 'connect' | 'timeout' | 'auth'
  reason?: string
  constructor(kind: 'closed' | 'connect' | 'timeout' | 'auth', reason?: string) {
    super(kind + (reason ? ': ' + reason : ''))
    this.kind = kind
    this.reason = reason
  }
}
