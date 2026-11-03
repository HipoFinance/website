// The Club's state and its checks (specs/club-website.md §3–§9): the session, the reads, the wallet
// check and the three wallet flows, which Overview status to show, and the actions behind every Club
// button. Money code: the checks before a claim, an upgrade and the revenue-share withdrawal live
// here, and every payment goes through payments.ts `sendClubPayment`, the only caller of
// sendTransaction for the Club.
//
// One ClubModel per Model, created the first time a Club page renders (clubModelFor). It lives in the
// lazy Club chunk, so the eager island carries none of it.
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx'
import type { Address } from '@ton/core'
import type { Model } from '../Model'
import { makeT, type Catalog, type Translator } from '../../../i18n/make-t.ts'
import enApp from '../../../i18n/en/app.json'
import enClub from '../../../i18n/en/club.json'
import * as fmt from '../../../i18n/format.ts'
import {
  ClubSocketError,
  fetchWalletRewards,
  gateMessage,
  headOf,
  toAuth,
  toChallenge,
  toConfirm,
  toFriends,
  toLeaderboard,
  toLevels,
  toOverview,
  toPayIntentReply,
  toPrepare,
  toRewards,
  toSettingsReply,
  toStatus,
  toWithdraw,
  type BoardBy,
  type ClubFriendRow,
  type ClubLeaderboard,
  type ClubLevels,
  type ClubOverview,
  type ClubRewards,
  type ClubStatus,
  type ClubTransport,
  type FriendsFilter,
  type PrepareReply,
  type ReplyHead,
  type WalletRewards,
} from './api.ts'
import { authBody, authOutcome, sessionFitsInitData, type Credentials } from './auth.ts'
import { CLAIM_MIN_NANO, HIPO_TON, parseHpoNano, upgradeAmountNano, upgradeTarget } from './clubTx.ts'
import {
  CLAIMS_OPEN_MARGIN,
  SUSPEND_DEADLINE_MARGIN,
  WRAPUP_PAUSE_FROM,
  addAck,
  archiveFirstPage,
  createChainReader,
  intentCovers,
  claimLockDue,
  locksFor,
  readAcks,
  readLocks,
  sendClubPayment,
  settleDueClaimLocks,
  settleLocks,
  type AppliedEvidence,
  type GuardOverview,
  type GuardStatus,
  type KeyValueStore,
  type ModalSnapshot,
  type PaymentContext,
  type PaymentRefusal,
} from './payments.ts'

type ChainModule = typeof import('../chain')
type TonConnectModule = typeof import('@tonconnect/ui')
type MockModule = typeof import('./mock.ts')
type Mock = InstanceType<MockModule['ClubMock']>

export type ClubTab = 'overview' | 'rewards' | 'friends' | 'community'

const SESSION_KEY = 'hipo.club.session'
const OVERVIEW_POLL = 30_000
const NOT_OPEN_POLL = 60_000
// A rate_limited read (a fixed one-minute window per account) or a busy one is not a failure: keep
// what is shown, and load again when the window is over.
const RATE_LIMITED_RETRY = 60_000
const BUSY_RETRY = 5_000
const BUSY_RETRIES = 12
const FINISHING_POLL = 15_000
const FINISHING_FOR = 3 * 60_000
// How long the Link Telegram window waits for Telegram's login to load before it says so.
const TG_LOGIN_TIMEOUT = 10_000
// requestProof: how long the wallet's answer may still arrive after TON Connect's window closes,
// when it closed without a wallet (cancelled) or with one whose proof has not come yet.
const PROOF_AFTER_CANCEL = 5_000
const PROOF_AFTER_SELECT = 120_000
// How often a load may check the due claim locks on the chain (settleDueClaimLocks).
const CLAIM_LOCK_CHECK_EVERY = 5 * 60_000
// Revenue share: offered from 10 GRAM; the server deducts 0.5 GRAM (withdrawrewards.go:61).
export const REVENUE_MIN = 10
export const REVENUE_FEE = 0.5
// The swap link of the Buy HPO actions (2b §4, BUILD-PLAN §2).
export const BUY_HPO_URL = 'https://app.ston.fi/swap?chartVisible=false&ft=TON&tt=HPO'
export const HIPO_CHAT_URL = 'https://t.me/hipo_chat'
export const LIMZO_URL = 'https://limzo.com/s/hipo'
export const SHARE_URL = 'https://t.me/share/url?url='

export interface Session {
  token: string
  expiresAt: number
  account: string
}

export type After = 'claim' | 'upgrade' | 'changeWallet' | 'friends' | 'alerts' | 'community' | 'hideName'

export type Flow = 0 | 1 | 2 | 3

export type Modal =
  | { kind: 'linkTelegram'; after?: After }
  | { kind: 'changeWallet' }
  | { kind: 'choose'; flow: 2 | 3 }
  | { kind: 'connect'; flow: Flow; reconnect: boolean }
  | { kind: 'confirm'; flow: Flow; prepare: PrepareReply; release: boolean }
  | { kind: 'claim' }
  | { kind: 'claimDone'; amount: string; qualified: boolean; target?: number; below: boolean }
  | { kind: 'upgrade' }
  | { kind: 'upgradeDone'; level: number }
  // `from: 'load'`: opened by the load's check of the due claim locks, not by a payment press.
  | { kind: 'notApplied'; at: number; ackKey: string; payment: 'claim' | 'upgrade'; from?: 'load' }

export type Tone = 'info' | 'success' | 'warn' | 'neutral'

// A strip set by a flow's outcome ("… is now your Club wallet"); shown over the state's own strip
// until the next Club page load.
export interface Notice {
  tone: Tone
  title: string
  body?: string
  action?: 'buy' | 'choose' | 'connect'
}

// Which status the Overview shows, in the order of §5.
export type ClubView =
  | 'loading'
  | 'error'
  | 'launching'
  | 'connect'
  | 'A'
  | 'A0'
  | 'frozen'
  | 'paused'
  | 'nolink'
  | 'connectClub'
  | 'E'
  | 'D'
  | 'D2'
  | 'G'
  | 'F'
  | 'C'
  | 'B'
  | 'onItsWay'
  | 'upgradeOnItsWay'
  | 'belowMin'
  | 'gate'

export type ActionError = { key: string; params?: Record<string, string> }

// The sentence of a payment refusal (§6) and of each spec 2 refusal reason (§4).
export function refusalKey(reason: PaymentRefusal | string): string {
  return 'club.error.' + reason.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

function hasStorage(): KeyValueStore | undefined {
  try {
    const store = window.localStorage
    const probe = 'hipo.club.probe'
    store.setItem(probe, '1')
    store.removeItem(probe)
    return store
  } catch {
    return undefined
  }
}

// Storage that refuses: when the browser keeps nothing, the pending lock cannot be written, so
// payments.ts sends nothing.
const refusingStore: KeyValueStore = {
  getItem: () => null,
  setItem: () => {
    throw new Error('no storage')
  },
}

function readSession(): Session | undefined {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? 'null')
    if (
      parsed != null &&
      typeof parsed.token === 'string' &&
      typeof parsed.account === 'string' &&
      typeof parsed.expiresAt === 'number' &&
      parsed.expiresAt > Date.now() / 1000
    ) {
      return parsed
    }
  } catch {
    // no session
  }
  return undefined
}

function writeSession(session: Session | undefined) {
  try {
    if (session === undefined) {
      window.localStorage.removeItem(SESSION_KEY)
    } else {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
  } catch {
    // The session then lasts for this page only.
  }
}

function readInlineClubCatalog(): Catalog {
  try {
    const text = document.getElementById('i18n-club')?.textContent
    return text ? JSON.parse(text) : {}
  } catch {
    return {}
  }
}

const isMockBuild = import.meta.env.PUBLIC_CLUB_MOCK === '1'

export class ClubModel {
  readonly model: Model
  private chain: ChainModule
  private tonConnect?: TonConnectModule
  private transport: ClubTransport
  readonly mock?: Mock

  session?: Session = readSession()
  status?: ClubStatus
  overview?: ClubOverview
  rewards?: ClubRewards
  walletRewards?: WalletRewards
  walletRewardsFor?: string
  friendsRows: ClubFriendRow[] = []
  friendsMeta?: { inviteLink?: string; count?: number; referralTotal?: string }
  friendsFilter: FriendsFilter = 'all'
  friendsDone = false
  friendsLoading = false
  board?: ClubLeaderboard
  boardLevel?: number
  boardBy: BoardBy = 'hpo'
  levels?: ClubLevels
  phase: 'idle' | 'loading' | 'ready' | 'error' | 'launching' = 'idle'
  loadError?: string
  // Server time = device time + this offset, from the last Club reply's `now`.
  serverOffset?: number
  // The device clock, observable, so countdowns re-render.
  tick = Math.floor(Date.now() / 1000)
  modal?: Modal
  notice?: Notice
  actionError?: ActionError
  busy = false
  // Telegram's login (our telegramLogin chunk and telegram.org's script), loaded when the Link
  // Telegram window opens so that a press reaches the popup at once: a press that first waits for
  // the downloads is no longer a click to the browser, which then blocks the popup (Hipo Chat A4).
  tgLogin: 'idle' | 'loading' | 'ready' | 'failed' = 'idle'
  private tgModule?: typeof import('./telegramLogin.ts')
  decidedLater = false
  promptedMismatchFor?: string
  claimOnItsWay?: number
  withdrawing = false
  withdrawResult?: 'done' | 'failed'
  tma: boolean
  private initDataUsed = false
  // One immediate retry with the stored token after a refused widget or initData (loadFailed).
  private retriedBadAuth = false
  private pendingWidget?: Record<string, unknown>
  // A load's check of the due claim locks on the chain (settleDueClaimLocks), while it runs: the next
  // load skips it and a payment press waits for it. At most one check per CLAIM_LOCK_CHECK_EVERY.
  private claimLockCheck?: Promise<void>
  private claimLockCheckedAt = 0
  private timers: ReturnType<typeof setTimeout>[] = []
  private pollTimer?: ReturnType<typeof setTimeout>
  private loadSeq = 0
  // The current wallet-link attempt (startLink): a newer attempt or closing the dialog ends the
  // older one, so its late steps change nothing. proofWait ends the requestProof wait under way.
  private linkAttempt = 0
  private proofWait?: { end: () => void }
  private disposers: (() => void)[] = []
  private storage: KeyValueStore

  constructor(model: Model, chain: ChainModule, transport: ClubTransport, mock?: Mock) {
    this.model = model
    this.chain = chain
    this.transport = transport
    this.mock = mock
    this.tma = model.isTelegram
    this.storage = hasStorage() ?? refusingStore
    transport.setAuth(() => this.authBody())
    makeObservable<ClubModel, 'setFriends'>(this, {
      session: observable.ref,
      status: observable.ref,
      overview: observable.ref,
      rewards: observable.ref,
      walletRewards: observable.ref,
      friendsRows: observable.ref,
      friendsMeta: observable.ref,
      friendsFilter: observable,
      friendsDone: observable,
      friendsLoading: observable,
      board: observable.ref,
      boardLevel: observable,
      boardBy: observable,
      levels: observable.ref,
      phase: observable,
      loadError: observable,
      serverOffset: observable,
      tick: observable,
      modal: observable.ref,
      notice: observable.ref,
      actionError: observable.ref,
      busy: observable,
      tgLogin: observable,
      decidedLater: observable,
      claimOnItsWay: observable,
      withdrawing: observable,
      withdrawResult: observable,
      connected: computed,
      translator: computed,
      view: computed,
      mismatch: computed,
      setFriends: action,
      openModal: action,
      closeModal: action,
      setNotice: action,
      setError: action,
      decideLater: action,
    })
  }

  // ------------------------------------------------------------------------------ i18n

  get translator(): Translator {
    const locale = this.model.locale
    // The page's own catalog (#i18n-club on localized Club pages; /i18n/<locale>.json in Telegram,
    // merged into model.catalog) over the bundled English.
    const catalog: Catalog = { ...this.model.catalog, ...(locale === 'en' ? {} : readInlineClubCatalog()) }
    return makeT(locale, catalog, { ...enApp, ...enClub })
  }

  t = (key: string, params?: Record<string, string | number>): string => this.translator.t(key, params)

  // HPO and GRAM figures arrive as decimal strings; this is display only.
  amount = (value: string | number | undefined, digits = 2): string => {
    const n = typeof value === 'string' ? Number(value) : value
    if (n === undefined || !Number.isFinite(n)) {
      return '—'
    }
    return fmt.formatNumber(this.model.locale, n, { minimumFractionDigits: 0, maximumFractionDigits: digits })
  }

  amount2 = (value: string | number | undefined): string => {
    const n = typeof value === 'string' ? Number(value) : value
    if (n === undefined || !Number.isFinite(n)) {
      return '—'
    }
    return fmt.formatNumber(this.model.locale, n, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Fixed decimals, so a table's rows line up; a tiny non-zero value keeps 2 significant digits.
  amountFixed = (value: string | number | undefined, digits: number): string => {
    const raw = typeof value === 'string' ? Number(value) : value
    if (raw === undefined || !Number.isFinite(raw)) {
      return '—'
    }
    const n = raw === 0 ? 0 : raw // no "-0.00"
    if (n !== 0 && Math.abs(n) < 10 ** -digits) {
      return fmt.formatNumber(this.model.locale, n, { maximumSignificantDigits: 2 })
    }
    return fmt.formatNumber(this.model.locale, n, { minimumFractionDigits: digits, maximumFractionDigits: digits })
  }

  // Signed, "+1.5" or "−1.5"; a value that shows as zero gets no sign, "—" stays "—".
  signed = (value: string | number | undefined, digits: number, fixed = false): string => {
    const n = typeof value === 'string' ? Number(value) : value
    if (n === undefined || !Number.isFinite(n)) {
      return '—'
    }
    const text = fixed ? this.amountFixed(Math.abs(n), digits) : this.amount(Math.abs(n), digits)
    if (!/[1-9\u0661-\u0669\u06F1-\u06F9\u0967-\u096F]/.test(text)) {
      return text
    }
    return (n >= 0 ? '+' : '−') + text
  }

  // Rounded up to 2 decimals, so a shortfall is never understated (Definitions, s).
  amountUp = (value: string | number | undefined): string => {
    const n = typeof value === 'string' ? Number(value) : value
    if (n === undefined || !Number.isFinite(n)) {
      return '—'
    }
    return this.amount2(Math.ceil(n * 100) / 100)
  }

  whole = (value: string | number | undefined): string => {
    const n = typeof value === 'string' ? Number(value) : value
    if (n === undefined || !Number.isFinite(n)) {
      return '—'
    }
    return fmt.formatNumber(this.model.locale, Math.floor(n), { maximumFractionDigits: 0 })
  }

  boost = (coefficient: number | undefined): string => {
    if (coefficient === undefined) {
      return '—'
    }
    return this.t('club.common.boostValue', {
      value: fmt.formatNumber(this.model.locale, coefficient, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    })
  }

  level = (clubLevel0: number | undefined): string =>
    clubLevel0 === undefined ? '—' : fmt.formatNumber(this.model.locale, clubLevel0 + 1)

  date = (unix: number | undefined, withTime = false): string => {
    if (unix === undefined || unix <= 0) {
      return '—'
    }
    const text = fmt.formatDate(this.model.locale, unix * 1000, {
      month: 'short',
      day: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' } : { timeZone: 'UTC' }),
    })
    return withTime ? this.t('club.common.utc', { time: text }) : text
  }

  // "3h 20m" under two days, whole days above (a 7-day restore window reads "5 days").
  duration = (seconds: number): string => {
    const s = Math.max(0, seconds)
    if (s >= 2 * 86400) {
      return this.t('club.common.days', { count: fmt.formatNumber(this.model.locale, Math.floor(s / 86400)) })
    }
    return fmt.formatDuration(this.translator, s)
  }

  // ------------------------------------------------------------------------------ clocks

  serverNow(): number | undefined {
    if (this.serverOffset === undefined) {
      return undefined
    }
    return Date.now() / 1000 + this.serverOffset
  }

  // For display (countdowns): the server's clock when known, else the device's.
  get displayNow(): number {
    return this.tick + (this.serverOffset ?? 0)
  }

  private noteReply(head: ReplyHead) {
    if (head.now !== undefined) {
      const offset = head.now - Date.now() / 1000
      runInAction(() => {
        this.serverOffset = offset
      })
    }
  }

  // ------------------------------------------------------------------------------ wallets

  get realWalletConnected(): boolean {
    return this.model.tonConnectUI?.wallet != null
  }

  // The connected wallet: TON Connect's, or in the mock preview the made-up one.
  get connected(): Address | undefined {
    return this.model.address
  }

  parse(value: string | undefined): Address | undefined {
    if (value === undefined) {
      return undefined
    }
    try {
      return this.chain.Address.parse(value)
    } catch {
      return undefined
    }
  }

  mask(value: string | Address | undefined): string {
    if (value === undefined) {
      return '—'
    }
    const address = typeof value === 'string' ? this.parse(value) : value
    if (address === undefined) {
      return '—'
    }
    const friendly = address.toString({ bounceable: false })
    return friendly.slice(0, 4) + '…' + friendly.slice(-4)
  }

  get clubWallet(): string | undefined {
    return this.overview?.clubWallet ?? this.status?.clubWallet
  }

  get clubWalletMasked(): string {
    return this.overview?.clubWalletMasked ?? this.status?.clubWalletMasked ?? this.mask(this.clubWallet)
  }

  // §4: a session, the account has a Club wallet, and the connected wallet is another one.
  get mismatch(): boolean {
    if (this.session === undefined || this.clubWallet === undefined) {
      return false
    }
    const connected = this.connected
    const club = this.parse(this.clubWallet)
    return connected !== undefined && club !== undefined && !connected.equals(club)
  }

  get clubWalletConnected(): boolean {
    const connected = this.connected
    const club = this.parse(this.clubWallet)
    return connected !== undefined && club !== undefined && connected.equals(club)
  }

  // ------------------------------------------------------------------------------ the view

  // False until the first load settles whether there is a session: a pending Telegram login (the
  // Mini App's initData, the preview's mock login) can still turn "not linked" into "linked".
  get sessionKnown(): boolean {
    return this.session !== undefined || (this.phase !== 'idle' && this.phase !== 'loading')
  }

  get view(): ClubView {
    if (this.phase === 'launching') {
      return 'launching'
    }
    if (this.phase === 'error') {
      return 'error'
    }
    if (this.session === undefined) {
      if (this.connected === undefined) {
        return 'connect'
      }
      if (this.walletRewards === undefined || this.phase === 'loading' || this.phase === 'idle') {
        return 'loading'
      }
      return this.walletRewards.club?.clubWallet === true ? 'A' : 'A0'
    }
    const o = this.overview
    if (o === undefined || this.status === undefined) {
      return 'loading'
    }
    if (o.frozen || this.status.frozen) {
      return 'frozen'
    }
    if (this.clubWallet === undefined) {
      return 'nolink'
    }
    if (this.mismatch && this.decidedLater) {
      return 'paused'
    }
    if (this.connected === undefined) {
      return 'connectClub'
    }
    if (o.state === 'suspended') {
      return 'E'
    }
    if (o.state === 'grace') {
      return o.claimedThisSeason ? 'D2' : 'D'
    }
    if (o.chip === 'reset') {
      return 'G'
    }
    if (o.chip === 'restored') {
      return 'F'
    }
    if (
      o.claimInProgress !== undefined ||
      this.claimOnItsWay !== undefined ||
      (o.payInProgress !== undefined && intentCovers(o.payInProgress, 'claim'))
    ) {
      return 'onItsWay'
    }
    // An upgrade payment the server has a record of (§5.7), like the claim above.
    if (o.payInProgress?.target === 'upgrade') {
      return 'upgradeOnItsWay'
    }
    if (o.claimedThisSeason) {
      return 'C'
    }
    if (o.claim.ok) {
      return 'B'
    }
    if (o.claim.reason === 'below_min') {
      return 'belowMin'
    }
    return 'gate'
  }

  // B parsed exactly; undefined when the server's string is not one (then no Claim).
  get unclaimedNano(): bigint | undefined {
    return parseHpoNano(this.overview?.unclaimed)
  }

  // The Claim button's state (§6a), on the data shown; payments.ts checks it all again on fresh data.
  get claimBlock(): ActionError | undefined {
    const o = this.overview
    if (this.session === undefined) {
      return { key: 'club.claim.needsTelegram' }
    }
    if (o === undefined) {
      return { key: 'club.claim.loading' }
    }
    if (o.frozen) {
      return { key: 'club.error.frozen' }
    }
    if (this.mismatch) {
      return { key: 'club.paused.button' }
    }
    if (this.clubWallet === undefined) {
      return { key: 'club.claim.linkClubWallet' }
    }
    if (this.connected === undefined || !this.clubWalletConnected) {
      return { key: 'club.claim.connectClub', params: { wallet: this.clubWalletMasked } }
    }
    if (o.switchPending) {
      return { key: 'club.gate.switchPending' }
    }
    if (o.claimInProgress !== undefined || this.claimOnItsWay !== undefined) {
      return { key: 'club.gate.inProgress' }
    }
    // The server's "payment in progress" record, opened on any device of the account (or here).
    if (o.payInProgress !== undefined) {
      return intentCovers(o.payInProgress, 'claim')
        ? { key: 'club.gate.inProgress' }
        : { key: 'club.pay.otherOnItsWay' }
    }
    const b = this.unclaimedNano
    if (b === undefined) {
      return { key: 'club.claim.unknown' }
    }
    if (!o.claim.ok) {
      return this.gateError(o.claim.reason ?? 'unknown')
    }
    if (b < CLAIM_MIN_NANO) {
      return { key: 'club.claim.opensAtMin' }
    }
    // Reading tick makes the countdown re-render every second and the button turn on at zero by itself.
    void this.tick
    const now = this.serverNow()
    if (now === undefined) {
      return { key: 'club.claim.loading' }
    }
    if (o.claimsOpenAt !== undefined && now < o.claimsOpenAt + CLAIMS_OPEN_MARGIN) {
      const left = Math.max(0, Math.ceil(o.claimsOpenAt + CLAIMS_OPEN_MARGIN - now))
      const time = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
      return { key: 'club.claim.opensIn', params: { time } }
    }
    return undefined
  }

  // The sentence of a claim gate reason (cluboverview `claim.reason`), with the gate's `opens_at` as
  // {date}; a reason this page has no sentence for (an older server's) gets the generic one.
  gateError(reason: string): ActionError {
    const { key, dateAt } = gateMessage(reason, this.overview)
    if (!this.translator.has(key)) {
      return { key: 'club.gate.unknown' }
    }
    return { key, params: { date: this.date(dateAt, true) } }
  }

  // n, the upgrade's target (1-based), and its fee from clublevels, when an upgrade can be offered.
  get upgradeOffer(): { n: number; fee: unknown; amountOk: boolean } | undefined {
    const o = this.overview
    if (o === undefined) {
      return undefined
    }
    const n = upgradeTarget(o.clubLevel)
    if (n === undefined) {
      return undefined
    }
    const fee = this.levels?.levels[n - 1]?.fee ?? o.upgradeFee
    return { n, fee, amountOk: upgradeAmountNano(fee) !== undefined }
  }

  get upgradeBlock(): ActionError | undefined {
    const o = this.overview
    if (this.session === undefined) {
      return { key: 'club.upgrade.needsTelegram' }
    }
    if (o === undefined) {
      return { key: 'club.claim.loading' }
    }
    if (upgradeTarget(o.clubLevel) === undefined) {
      return { key: 'club.levelUp.topTitle' }
    }
    if (o.frozen) {
      return { key: 'club.error.frozen' }
    }
    if (this.mismatch) {
      return { key: 'club.paused.button' }
    }
    if (this.clubWallet === undefined) {
      return { key: 'club.upgrade.linkClubWallet' }
    }
    if (this.connected === undefined || !this.clubWalletConnected) {
      return { key: 'club.upgrade.connectClub', params: { wallet: this.clubWalletMasked } }
    }
    if (o.switchPending) {
      return { key: 'club.gate.switchPending' }
    }
    if (o.payInProgress !== undefined) {
      return intentCovers(o.payInProgress, upgradeTarget(o.clubLevel))
        ? { key: 'club.pay.upgradeOnItsWay' }
        : { key: 'club.pay.otherOnItsWay' }
    }
    const now = this.serverNow()
    if (now === undefined) {
      return { key: 'club.claim.loading' }
    }
    if (o.state === 'suspended' && (o.stateUntil === undefined || o.stateUntil - now <= SUSPEND_DEADLINE_MARGIN)) {
      return { key: 'club.error.deadline' }
    }
    if (o.wrapupPending && now >= WRAPUP_PAUSE_FROM) {
      return { key: 'club.error.wrapup' }
    }
    if (this.levels?.hasNext) {
      return { key: 'club.error.feesChanging' }
    }
    if (this.upgradeOffer?.amountOk !== true) {
      return { key: 'club.error.feeInvalid' }
    }
    return undefined
  }

  get revenueBalance(): number | undefined {
    const value = this.walletRewards?.hpoSumRewards
    const n = value === undefined ? undefined : Number(value)
    return n !== undefined && Number.isFinite(n) ? n : undefined
  }

  get withdrawBlock(): ActionError | undefined {
    if (this.session === undefined) {
      return { key: 'club.revenue.needsTelegram' }
    }
    if (this.mismatch) {
      return { key: 'club.paused.button' }
    }
    if (this.clubWallet === undefined) {
      return { key: 'club.revenue.noWallet' }
    }
    const r = this.revenueBalance
    if (r === undefined || r < REVENUE_MIN) {
      return { key: 'club.revenue.belowMin' }
    }
    if (this.withdrawing) {
      return { key: 'club.revenue.inFlight' }
    }
    return undefined
  }

  // ------------------------------------------------------------------------------ lifecycle

  start() {
    this.disposers.push(
      reaction(
        () => [this.model.address?.toRawString(), this.model.activePage] as const,
        ([address, page], previous) => {
          if (page !== 'club') {
            this.stopPolling()
            return
          }
          if (previous !== undefined && previous[0] !== address) {
            // A TON Connect change while a Club page is open: the wallet check runs again (§4).
            runInAction(() => {
              this.promptedMismatchFor = undefined
            })
            this.mock?.followRealWallet(this.realWalletConnected ? this.model.address : undefined)
          }
          void this.load()
        },
      ),
    )
    const clock = setInterval(() => {
      runInAction(() => {
        this.tick = Math.floor(Date.now() / 1000)
      })
    }, 1000)
    this.disposers.push(() => clearInterval(clock))
    document.addEventListener('astro:page-load', this.onPageLoad)
    this.disposers.push(() => document.removeEventListener('astro:page-load', this.onPageLoad))
    if (this.mock !== undefined) {
      this.mock.followRealWallet(this.realWalletConnected ? this.model.address : undefined)
    }
    void this.load()
  }

  private onPageLoad = () => {
    if (this.model.activePage === 'club') {
      runInAction(() => {
        this.notice = undefined
      })
      void this.load()
    }
  }

  private stopPolling() {
    clearTimeout(this.pollTimer)
    this.pollTimer = undefined
  }

  private schedule(delay: number) {
    this.stopPolling()
    this.pollTimer = setTimeout(() => {
      if (this.model.activePage === 'club' && !document.hidden) {
        void this.load(true)
      } else {
        this.schedule(delay)
      }
    }, delay)
  }

  // ------------------------------------------------------------------------------ requests

  private get credentials(): Credentials {
    return {
      tma: this.tma,
      widget: this.pendingWidget,
      initData: this.initData,
      initDataUsed: this.initDataUsed,
      token: this.session?.token,
    }
  }

  // The body of the next clubauth (auth.ts). No side effects: the socket peeks at it before it
  // connects, and a one-time credential is spent in onAuthReply, on the server's answer to it.
  private authBody(): Record<string, unknown> | undefined {
    return authBody(this.credentials)
  }

  private initData?: string

  // Whether a connection could authenticate now.
  private hasCredentials(): boolean {
    return authBody(this.credentials) !== undefined
  }

  // A Club request; the reply's head updates the server clock and a session refusal clears the session.
  private async req(type: string, body?: Record<string, unknown>): Promise<unknown> {
    const reply = await this.transport.request(type, body)
    const head = headOf(reply)
    this.noteReply(head)
    if (head.reason === 'bad_session') {
      this.dropSession()
    }
    return reply
  }

  // Every clubauth reply, with the body it answers (auth.ts decides what it spends and keeps).
  onAuthReply = (body: unknown, sent?: Record<string, unknown>) => {
    const auth = toAuth(body)
    this.noteReply(auth)
    const outcome = authOutcome(auth, sent, this.credentials)
    if (outcome.spendWidget) {
      this.pendingWidget = undefined
    }
    if (outcome.spendInitData) {
      this.initDataUsed = true
    }
    if (outcome.session === 'set') {
      this.setSession({
        token: auth.token!,
        expiresAt: auth.expiresAt ?? Date.now() / 1000 + 86400,
        account: auth.account!,
      })
    } else if (outcome.session === 'drop') {
      this.dropSession()
    }
  }

  private setSession(session: Session | undefined) {
    writeSession(session)
    runInAction(() => {
      this.session = session
    })
  }

  private dropSession() {
    this.setSession(undefined)
    runInAction(() => {
      this.status = undefined
      this.overview = undefined
      this.rewards = undefined
      this.board = undefined
      this.friendsRows = []
      this.friendsMeta = undefined
    })
  }

  // ------------------------------------------------------------------------------ loading

  async load(poll = false): Promise<void> {
    const seq = ++this.loadSeq
    if (!poll) {
      runInAction(() => {
        if (this.phase !== 'ready') {
          this.phase = 'loading'
        }
      })
    }
    // §3: the Mini App authenticates with its initData on every open, a stored session or not; a
    // stored session of another Telegram user than the one opening it is dropped.
    if (this.tma && this.initData === undefined) {
      this.initData =
        this.mock !== undefined ? 'mock-init-data' : await (await import('./telegramLogin.ts')).telegramInitData()
      if (this.session !== undefined && !sessionFitsInitData(this.session.account, this.initData)) {
        this.dropSession()
      }
    }
    if (this.mock !== undefined && this.session === undefined && this.mock.startsLoggedIn() && !this.mockLoggedOut) {
      // The preview starts logged in for every scenario past state A.
      this.pendingWidget = { mock: true }
    }
    try {
      if (this.session === undefined && !this.hasCredentials()) {
        await this.loadWalletOnly()
      } else {
        await this.loadAccount()
      }
      if (seq !== this.loadSeq) {
        return
      }
      this.retriedBadAuth = false
      this.busyRetries = 0
      runInAction(() => {
        if (this.phase !== 'launching') {
          this.phase = 'ready'
        }
        this.loadError = undefined
      })
      this.afterLoad()
      this.schedule(this.phase === 'launching' ? NOT_OPEN_POLL : OVERVIEW_POLL)
    } catch (e) {
      if (seq !== this.loadSeq) {
        return
      }
      await this.loadFailed(e)
    }
  }

  // busy answers in a row (loadFailed)
  private busyRetries = 0

  private mockLoggedOut = false

  private async loadWalletOnly() {
    const address = this.connected
    if (address === undefined) {
      runInAction(() => {
        this.walletRewards = undefined
        this.walletRewardsFor = undefined
      })
      return
    }
    const rewards = await this.fetchWalletRewards(address)
    runInAction(() => {
      this.walletRewards = rewards
      this.walletRewardsFor = address.toRawString()
      this.phase = rewards.launching ? 'launching' : 'ready'
    })
  }

  private fetchWalletRewards(address: Address): Promise<WalletRewards> {
    // /wallet-rewards parses only the user-friendly form (club-server currentwallet.go ParseAddr)
    return this.mock !== undefined
      ? this.mock.walletRewards(address.toRawString())
      : fetchWalletRewards(address.toString())
  }

  private async loadAccount() {
    const statusBody = await this.req('clubstatus')
    const status = toStatus(statusBody)
    if (!status.ok) {
      await this.refusedLoad(status)
      return
    }
    const overview = toOverview(await this.req('cluboverview'))
    if (!overview.ok) {
      await this.refusedLoad(overview)
      return
    }
    runInAction(() => {
      this.status = status
      this.overview = overview
      if (this.phase === 'launching') {
        this.phase = 'ready'
      }
    })
    this.settleLocksFromServer()
    void this.settleDueClaimLocks()
    // The revenue-share balance and the base GRAM history of the Club wallet (/wallet-rewards).
    const club = this.parse(overview.clubWallet)
    if (club !== undefined && this.walletRewardsFor !== club.toRawString()) {
      this.fetchWalletRewards(club)
        .then((rewards) =>
          runInAction(() => {
            this.walletRewards = rewards
            this.walletRewardsFor = club.toRawString()
          }),
        )
        .catch(() => undefined)
    }
    if (this.levels === undefined) {
      this.req('clublevels')
        .then((body) => runInAction(() => (this.levels = toLevels(body))))
        .catch(() => undefined)
    }
    if (this.model.clubTab === 'overview' && (this.board === undefined || this.boardLevel === undefined)) {
      void this.loadBoard(overview.clubLevel, this.boardBy)
    }
    if (this.model.clubTab === 'rewards') {
      void this.loadRewards()
    }
    if (this.model.clubTab === 'friends' && this.friendsMeta === undefined) {
      void this.loadFriends('all', true)
    }
  }

  private async refusedLoad(head: ReplyHead) {
    if (head.reason === 'not_open') {
      runInAction(() => {
        this.phase = 'launching'
      })
      return
    }
    if (head.reason === 'bad_session' || head.reason === 'reauth') {
      this.dropSession()
      await this.loadWalletOnly()
      return
    }
    throw new ClubSocketError('auth', head.reason)
  }

  private async loadFailed(e: unknown) {
    if (
      e instanceof ClubSocketError &&
      e.kind === 'auth' &&
      e.reason === 'bad_auth' &&
      this.session !== undefined &&
      !this.retriedBadAuth
    ) {
      // The widget or the initData was refused; the stored session stays (§3) and the next
      // connection, at once, authenticates with its token instead.
      this.retriedBadAuth = true
      this.schedule(0)
      return
    }
    if (e instanceof ClubSocketError && e.kind === 'auth' && (e.reason === 'bad_session' || e.reason === 'bad_auth')) {
      if (e.reason === 'bad_session') {
        this.dropSession()
      }
      try {
        await this.loadWalletOnly()
        runInAction(() => {
          if (this.phase !== 'launching') {
            this.phase = 'ready'
          }
        })
      } catch {
        runInAction(() => {
          this.phase = 'error'
        })
      }
      this.schedule(OVERVIEW_POLL)
      return
    }
    // The new handshake is refused before the launch migration (HTTP 403, a failed connect in the
    // browser): /wallet-rewards tells "launching" apart from an outage.
    if (e instanceof ClubSocketError && e.kind === 'connect') {
      const address = this.connected
      let launching = this.mock?.scenario === 'launching'
      if (!launching && address !== undefined) {
        try {
          launching = (await this.fetchWalletRewards(address)).launching
        } catch {
          // unknown
        }
      }
      if (launching) {
        runInAction(() => {
          this.phase = 'launching'
        })
        this.schedule(NOT_OPEN_POLL)
        return
      }
    }
    // Not the error phase: a first load stays in the loading phase until the retry. busy is a login
    // in flight; one that lasts past BUSY_RETRIES tries is shown as the error after all.
    const transient =
      e instanceof ClubSocketError &&
      e.kind === 'auth' &&
      (e.reason === 'rate_limited' || (e.reason === 'busy' && this.busyRetries < BUSY_RETRIES))
    if (transient) {
      if (e.reason === 'busy') {
        this.busyRetries++
      }
      runInAction(() => {
        this.loadError = e.message
      })
      this.schedule(e.reason === 'busy' ? BUSY_RETRY : RATE_LIMITED_RETRY)
      return
    }
    this.busyRetries = 0
    runInAction(() => {
      // A failed poll keeps what is shown; a failed first load shows the error.
      if (this.overview === undefined && this.walletRewards === undefined) {
        this.phase = 'error'
      }
      this.loadError = e instanceof Error ? e.message : String(e)
    })
    this.schedule(OVERVIEW_POLL)
  }

  // On every load: the wallet check of §4 (flow 3, once per connected wallet per page load).
  private afterLoad() {
    if (this.mismatch && !this.decidedLater) {
      const key = this.connected?.toRawString()
      if (key !== undefined && this.promptedMismatchFor !== key && this.modal === undefined) {
        runInAction(() => {
          this.promptedMismatchFor = key
          this.modal = { kind: 'choose', flow: 3 }
        })
      }
    }
    if (!this.mismatch && this.decidedLater) {
      runInAction(() => {
        this.decidedLater = false
      })
    }
  }

  // Release (2) of every pending lock from what the server shows; the chain releases happen in the
  // guard's own read at the next attempt.
  private settleLocksFromServer() {
    const account = this.session?.account
    const o = this.overview
    if (account === undefined || o === undefined || this.status === undefined) {
      return
    }
    const evidence = {
      clubLevel: this.status.clubLevel,
      claims: [...(o.claimInProgress ? [o.claimInProgress] : []), ...o.recentClaims],
    }
    const targets = new Set(
      readLocks(this.storage)
        .filter((lock) => lock.account === account)
        .map((lock) => lock.target),
    )
    for (const target of targets) {
      settleLocks(this.storage, account, target, undefined, evidence)
    }
    const claimHeld = locksFor(this.storage, account, 'claim').length > 0
    runInAction(() => {
      this.claimOnItsWay = claimHeld ? (this.claimOnItsWay ?? Math.floor(Date.now() / 1000)) : undefined
    })
  }

  // A claim lock past its deadline is judged on the chain at a load, at most every
  // CLAIM_LOCK_CHECK_EVERY, not only in the guard: the guard runs on the Claim press, which the lock
  // itself turns off. Nothing is loaded unless such a lock is held; a failure keeps the lock for a
  // later load.
  private async settleDueClaimLocks() {
    const account = this.session?.account
    const club = this.parse(this.overview?.clubWallet)
    const now = this.serverNow()
    if (account === undefined || club === undefined || now === undefined || this.claimLockCheck !== undefined) {
      return
    }
    if (Date.now() - this.claimLockCheckedAt < CLAIM_LOCK_CHECK_EVERY) {
      return
    }
    if (!locksFor(this.storage, account, 'claim').some((lock) => claimLockDue(lock, now))) {
      return
    }
    const o = this.overview!
    const evidence = {
      clubLevel: this.status?.clubLevel,
      claims: [...(o.claimInProgress ? [o.claimInProgress] : []), ...o.recentClaims],
    }
    this.claimLockCheckedAt = Date.now()
    this.claimLockCheck = this.checkDueClaimLocks(account, club, evidence)
    await this.claimLockCheck
  }

  private async checkDueClaimLocks(account: string, club: Address, evidence: AppliedEvidence) {
    try {
      const ctx = await this.paymentContext()
      // The account, the Club wallet and the evidence were read before that await.
      if (ctx.account !== account) {
        return
      }
      const due = await settleDueClaimLocks(ctx, club, evidence)
      if (due.released) {
        this.settleLocksFromServer()
      }
      // A claim that landed more than 24 h ago and was never applied: its lock waits for the member
      // to read that, and the guard that shows it never runs while the lock turns Claim off.
      // An ack stored while this check awaited the chain (the member read an earlier window) is not
      // shown again.
      if (
        due.notApplied !== undefined &&
        this.modal === undefined &&
        this.session?.account === account &&
        !readAcks(this.storage).has(due.notApplied.ackKey)
      ) {
        this.openModal({
          kind: 'notApplied',
          at: due.notApplied.at,
          ackKey: due.notApplied.ackKey,
          payment: 'claim',
          from: 'load',
        })
      }
    } catch {
      // Kept: the next load, or the guard on a press, tries again.
    } finally {
      this.claimLockCheck = undefined
    }
  }

  async loadRewards() {
    if (this.session === undefined) {
      if (this.connected !== undefined && this.walletRewards === undefined) {
        await this.loadWalletOnly().catch(() => undefined)
      }
      return
    }
    try {
      const rewards = toRewards(await this.req('clubrewards'))
      if (rewards.ok) {
        runInAction(() => {
          this.rewards = rewards
        })
      }
    } catch {
      // The tab shows its own retry.
    }
  }

  private setFriends(rows: ClubFriendRow[], meta: ClubModel['friendsMeta'], filter: FriendsFilter, done: boolean) {
    this.friendsRows = rows
    this.friendsMeta = meta
    this.friendsFilter = filter
    this.friendsDone = done
  }

  async loadFriends(filter: FriendsFilter, reset: boolean) {
    if (this.session === undefined || this.friendsLoading) {
      return
    }
    runInAction(() => {
      this.friendsLoading = true
    })
    try {
      const offset = reset ? 0 : this.friendsRows.length
      const reply = toFriends(await this.req('clubfriends', { filter, offset, limit: 50 }))
      if (reply.ok) {
        const rows = reset ? reply.rows : [...this.friendsRows, ...reply.rows]
        this.setFriends(
          rows,
          { inviteLink: reply.inviteLink, count: reply.count, referralTotal: reply.referralTotal },
          filter,
          reply.rows.length < 50,
        )
      }
    } catch {
      // kept as shown
    } finally {
      runInAction(() => {
        this.friendsLoading = false
      })
    }
  }

  async loadBoard(level: number, by: BoardBy) {
    if (this.session === undefined) {
      return
    }
    runInAction(() => {
      this.boardLevel = level
      this.boardBy = by
    })
    try {
      const board = toLeaderboard(await this.req('clubleaderboard', { club_level: level, by }))
      if (board.ok) {
        runInAction(() => {
          this.board = board
        })
      }
    } catch {
      // kept as shown
    }
  }

  async setSetting(setting: { hide_name?: boolean; alerts?: boolean }) {
    if (this.session === undefined) {
      this.openModal({ kind: 'linkTelegram', after: setting.alerts !== undefined ? 'alerts' : 'hideName' })
      return
    }
    try {
      const reply = toSettingsReply(await this.req('clubsettings', setting))
      if (!reply.ok) {
        this.setError({ key: refusalKey(reply.reason ?? 'retry') })
        return
      }
      runInAction(() => {
        if (this.overview !== undefined) {
          this.overview = { ...this.overview, settings: reply.settings }
        }
      })
      if (setting.hide_name !== undefined && this.boardLevel !== undefined) {
        void this.loadBoard(this.boardLevel, this.boardBy)
      }
    } catch {
      this.setError({ key: 'club.error.retry' })
    }
  }

  // ------------------------------------------------------------------------------ modals

  openModal(modal: Modal) {
    this.actionError = undefined
    this.modal = modal
    if (modal.kind === 'linkTelegram') {
      void this.prepareTelegramLogin()
    }
  }

  closeModal() {
    this.linkAttempt++
    this.proofWait?.end()
    this.modal = undefined
    this.actionError = undefined
    this.busy = false
  }

  setNotice(notice: Notice | undefined) {
    this.notice = notice
  }

  setError(error: ActionError | undefined) {
    // A refusal reason this page has no sentence for (an older server's) gets the generic one.
    if (error !== undefined && error.key.startsWith('club.error.') && !this.translator.has(error.key)) {
      error = { key: 'club.error.retry' }
    }
    this.actionError = error
  }

  decideLater() {
    this.decidedLater = true
    this.modal = undefined
  }

  private setBusy(busy: boolean) {
    runInAction(() => {
      this.busy = busy
    })
  }

  // An action that needs Telegram: open the login first, then continue.
  needTelegram(after: After): boolean {
    if (this.session !== undefined) {
      return false
    }
    this.openModal({ kind: 'linkTelegram', after })
    return true
  }

  // ------------------------------------------------------------------------------ Telegram login

  // Loads Telegram's login ahead of the press; the Continue button waits for it. A load that fails
  // or takes over TG_LOGIN_TIMEOUT (telegram.org blocked, a blocker extension) shows an error, and
  // a press then tries again, so the button never stays dead.
  async prepareTelegramLogin() {
    if (this.tgLogin === 'loading' || this.tgLogin === 'ready') {
      return
    }
    if (this.mock !== undefined) {
      runInAction(() => (this.tgLogin = 'ready'))
      return
    }
    runInAction(() => {
      this.tgLogin = 'loading'
      if (this.actionError?.key === 'club.error.tgLoadFailed') {
        this.actionError = undefined
      }
    })
    let timer: ReturnType<typeof setTimeout> | undefined
    let module: typeof import('./telegramLogin.ts') | undefined
    try {
      await Promise.race([
        import('./telegramLogin.ts').then((m) => {
          module = m
          return m.preloadTelegramLogin()
        }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Telegram login took too long')), TG_LOGIN_TIMEOUT)
        }),
      ])
      this.tgModule = module
      runInAction(() => (this.tgLogin = 'ready'))
    } catch {
      // a hung download is dropped, so that the next try (a VPN turned on) fetches afresh
      module?.abandonTelegramLogin()
      runInAction(() => {
        this.tgLogin = 'failed'
        // only on the window that asked; opening it again tries the load again
        if (this.modal?.kind === 'linkTelegram') {
          this.setError({ key: 'club.error.tgLoadFailed' })
        }
      })
    } finally {
      clearTimeout(timer)
    }
  }

  async loginTelegram(after?: After) {
    if (this.tgLogin !== 'ready') {
      void this.prepareTelegramLogin()
      return
    }
    // The popup opens here, in the press itself, before anything is awaited (see telegramLogin).
    const opening =
      this.mock !== undefined ? this.mock.telegramLogin() : this.tgModule!.telegramLogin(this.model.locale)
    this.setBusy(true)
    this.setError(undefined)
    try {
      const widget = await opening
      if (widget === undefined) {
        this.setBusy(false)
        return
      }
      this.mockLoggedOut = false
      this.transport.close()
      this.pendingWidget = widget as Record<string, unknown>
      const status = toStatus(await this.req('clubstatus'))
      if (!status.ok) {
        this.setError({ key: refusalKey(status.reason ?? 'retry') })
        this.setBusy(false)
        return
      }
      runInAction(() => {
        this.status = status
        this.modal = undefined
      })
      this.setBusy(false)
      await this.load()
      this.afterLogin(after)
    } catch (e) {
      this.pendingWidget = undefined
      this.setBusy(false)
      if (e instanceof Error && e.name === 'PopupBlockedError') {
        this.setError({ key: 'club.error.tgPopupBlocked' })
        return
      }
      const reason = e instanceof ClubSocketError ? (e.reason ?? 'retry') : 'loginFailed'
      this.setError({ key: refusalKey(reason) })
    }
  }

  // §3: after the login, the account's Club wallet decides the next step.
  private afterLogin(after?: After) {
    const status = this.status
    if (status === undefined) {
      return
    }
    const connected = this.connected
    if (status.clubWallet === undefined) {
      if (connected === undefined) {
        this.setNotice({
          tone: 'info',
          title: this.t('club.link.connectFirstTitle'),
          body: this.t('club.link.connectFirstBody'),
          action: 'connect',
        })
        return
      }
      void this.startLink(0)
      return
    }
    const club = this.parse(status.clubWallet)
    if (connected === undefined) {
      this.setNotice({
        tone: 'info',
        title: this.t('club.connectClub.title', { wallet: this.clubWalletMasked }),
        body: this.t('club.connectClub.body'),
        action: 'connect',
      })
      return
    }
    if (club !== undefined && !connected.equals(club)) {
      runInAction(() => {
        this.promptedMismatchFor = connected.toRawString()
      })
      this.openModal({ kind: 'choose', flow: 2 })
      return
    }
    this.continueAfter(after)
  }

  private continueAfter(after?: After) {
    switch (after) {
      case 'claim':
        void this.openClaim()
        break
      case 'upgrade':
        void this.openUpgrade()
        break
      case 'changeWallet':
        this.openModal({ kind: 'changeWallet' })
        break
      case 'friends':
        this.model.navigateToClubTab('friends')
        break
      case 'community':
        this.model.navigateToClubTab('community')
        break
      default:
        break
    }
  }

  async logout() {
    try {
      await this.req('clublogout')
    } catch {
      // logged out locally regardless
    }
    this.transport.close()
    this.mockLoggedOut = true
    this.dropSession()
    runInAction(() => {
      this.decidedLater = false
      this.modal = undefined
      this.busy = false
    })
    void this.load()
  }

  // ------------------------------------------------------------------------------ wallet flows

  // Start linking or switching to a wallet: a fresh TON Connect connect with a ton_proof (§4).
  async startLink(flow: Flow) {
    this.openModal({ kind: 'connect', flow, reconnect: false })
    const attempt = ++this.linkAttempt
    this.setBusy(true)
    try {
      const challenge = toChallenge(await this.req('clubproofchallenge', { purpose: 'link' }))
      if (attempt !== this.linkAttempt) {
        return
      }
      if (!challenge.ok || challenge.payload === undefined) {
        this.refusal(challenge.reason)
        return
      }
      const proof = await this.requestProof(challenge.payload, attempt)
      if (attempt !== this.linkAttempt) {
        return
      }
      if (proof === undefined) {
        this.setBusy(false)
        return
      }
      const prepare = toPrepare(await this.req('clublinkprepare', { proof: proof.proof }))
      if (attempt !== this.linkAttempt) {
        return
      }
      if (!prepare.ok) {
        this.refusal(prepare.reason)
        return
      }
      runInAction(() => {
        this.modal = { kind: 'confirm', flow, prepare, release: false }
        this.busy = false
      })
    } catch (e) {
      if (attempt !== this.linkAttempt) {
        return
      }
      this.setBusy(false)
      this.setError({ key: 'club.error.retry' })
    }
  }

  // A refusal reason's sentence.
  private refusal(reason: string | undefined) {
    this.setBusy(false)
    this.setError({ key: refusalKey(reason ?? 'retry') })
  }

  // TON Connect returns a ton_proof only when connecting: set the parameters, disconnect, open the
  // modal, and wait for the wallet. The parameters are cleared afterwards.
  private async requestProof(
    payload: string,
    attempt: number,
  ): Promise<{ address: Address; proof: Record<string, unknown> } | undefined> {
    if (this.mock !== undefined && !this.realWalletConnected) {
      const result = await this.mock.proof(payload)
      this.model.setAddress(result.address)
      return result
    }
    this.model.startPickerWatch()
    await this.model.ensureWalletSettled()
    // A Cancel while TON Connect was still loading: open nothing.
    if (attempt !== this.linkAttempt) {
      this.model.endConnect()
      return undefined
    }
    const ui = this.model.tonConnectUI
    if (ui === undefined) {
      this.model.endConnect()
      return undefined
    }
    // Claim the wait before the disconnect below, so an older wait's cleanup leaves these
    // parameters alone, and a Cancel during the disconnect still ends this one.
    this.proofWait?.end()
    let ended = false
    const wait: { end: () => void } = { end: () => void (ended = true) }
    this.proofWait = wait
    ui.setConnectRequestParameters({ state: 'ready', value: { tonProof: payload } })
    try {
      if (ui.connected) {
        await ui.disconnect()
      }
      return await new Promise((resolve) => {
        let settled = false
        let closeTimer: ReturnType<typeof setTimeout> | undefined
        const finish = (value: { address: Address; proof: Record<string, unknown> } | undefined) => {
          if (!settled) {
            settled = true
            clearTimeout(closeTimer)
            offStatus()
            offModal()
            resolve(value)
          }
        }
        wait.end = () => finish(undefined)
        if (ended) {
          resolve(undefined)
          return
        }
        // TON Connect re-sends a connected account without its ton_proof (a restored session, a
        // bridge reconnect, the account before the disconnect): only this challenge's proof, or the
        // wallet's refusal of it, ends the wait.
        const offStatus = ui.onStatusChange(
          (wallet) => {
            const reply = wallet?.connectItems?.tonProof
            const seen =
              reply == null ? 'none' : 'error' in reply ? 'error' : reply.proof.payload === payload ? 'match' : 'other'
            console.debug('[club] proof wait: wallet event', { connected: wallet != null, proof: seen })
            if (wallet == null || reply == null) {
              return
            }
            if ('error' in reply) {
              this.setError({ key: 'club.error.badProof' })
              finish(undefined)
              return
            }
            if (reply.proof.payload !== payload) {
              return
            }
            finish({
              address: this.chain.Address.parseRaw(wallet.account.address),
              proof: {
                raw_address: wallet.account.address,
                wallet_state_init: wallet.account.walletStateInit,
                domain: reply.proof.domain.value,
                payload: reply.proof.payload,
                signature: reply.proof.signature,
                timestamp: reply.proof.timestamp,
              },
            })
          },
          (error) => {
            // A refused or failed connect. With TON Connect's window open it shows the error and its
            // own Retry, which still carries this challenge: the close timer decides. Inside a wallet's
            // own browser there is no window, and this is the only sign of it.
            console.debug('[club] proof wait: connect error', { error: error.name })
            if (ui.modalState.status === 'opened') {
              return
            }
            this.setError({ key: 'club.error.rejected' })
            finish(undefined)
          },
        )
        const offModal = ui.onModalStateChange((state) => {
          clearTimeout(closeTimer)
          if (state.status !== 'closed') {
            return
          }
          console.debug('[club] proof wait: TON Connect closed', { reason: state.closeReason })
          const selected = state.closeReason === 'wallet-selected'
          closeTimer = setTimeout(
            () => {
              console.debug('[club] proof wait: gave up', { selected })
              if (selected) {
                this.setError({ key: 'club.error.badProof' })
              }
              finish(undefined)
            },
            selected ? PROOF_AFTER_SELECT : PROOF_AFTER_CANCEL,
          )
        })
        void ui.openModal().then(this.model.endConnect)
      })
    } finally {
      // A newer attempt's wait has already set its own parameters: leave them.
      if (this.proofWait === wait) {
        this.proofWait = undefined
        ui.setConnectRequestParameters(null)
      }
    }
  }

  async confirmChange() {
    const modal = this.modal
    if (modal?.kind !== 'confirm' || modal.prepare.id === undefined) {
      return
    }
    this.setBusy(true)
    this.setError(undefined)
    try {
      const reply = toConfirm(
        await this.req(modal.release ? 'clubreleaseconfirm' : 'clublinkconfirm', { id: modal.prepare.id }),
      )
      if (!reply.ok) {
        // The server used up this confirm's record when it refused it: a retry starts over with a fresh
        // prepare.
        this.refusal(reply.reason)
        return
      }
      if (reply.token !== undefined && this.session !== undefined) {
        this.setSession({ ...this.session, token: reply.token, expiresAt: reply.expiresAt ?? this.session.expiresAt })
      }
      const prepare = modal.prepare
      const name = this.overview?.displayName ?? ''
      runInAction(() => {
        this.modal = undefined
        this.busy = false
        this.decidedLater = false
      })
      if (reply.state === 'finishing') {
        this.setNotice({
          tone: 'info',
          title: this.t('club.flow.finishingTitle'),
          body: this.t('club.flow.finishingBody'),
        })
        this.watchFinishing()
      } else if (modal.release) {
        this.setNotice({
          tone: 'warn',
          title: this.t('club.flow.releasedTitle', { wallet: prepare.clubWalletMasked ?? '—' }),
          body: this.t('club.flow.releasedBody', { name }),
        })
      } else if (prepare.belowMinimum) {
        const short = Number(prepare.minimum ?? '0') - Number(prepare.newWalletHpo ?? '0')
        this.setNotice({
          tone: 'warn',
          title: this.t('club.flow.doneBelowTitle', { wallet: prepare.newWalletMasked ?? '—' }),
          body: this.t('club.flow.doneBelowBody', {
            held: this.amount2(prepare.newWalletHpo),
            minimum: this.amount2(prepare.minimum),
            short: this.amountUp(short),
            name,
          }),
          action: 'buy',
        })
      } else {
        this.setNotice({
          tone: 'success',
          title: this.t('club.flow.doneTitle', { wallet: prepare.newWalletMasked ?? '—' }),
          body: this.t(prepare.clubWalletMasked ? 'club.flow.doneBody' : 'club.flow.doneFirstBody', {
            old: prepare.clubWalletMasked ?? '—',
            name,
            boost: this.boost(prepare.boost),
          }),
        })
      }
      await this.load()
    } catch {
      this.setBusy(false)
      this.setError({ key: 'club.error.retry' })
    }
  }

  private watchFinishing() {
    const until = Date.now() + FINISHING_FOR
    const step = () => {
      const timer = setTimeout(async () => {
        try {
          const status = toStatus(await this.req('clubstatus'))
          if (status.ok && !status.switchPending) {
            runInAction(() => {
              this.status = status
              this.notice = { tone: 'success', title: this.t('club.flow.finishedTitle') }
            })
            await this.load()
            return
          }
        } catch {
          // try again
        }
        if (Date.now() < until) {
          step()
        }
      }, FINISHING_POLL)
      this.timers.push(timer)
    }
    step()
  }

  async cancelChange(logoutAfter: boolean) {
    const modal = this.modal
    if (modal?.kind === 'confirm' && modal.prepare.id !== undefined) {
      this.req('clubcancel', { id: modal.prepare.id }).catch(() => undefined)
    }
    const flow = modal?.kind === 'confirm' || modal?.kind === 'choose' || modal?.kind === 'connect' ? modal.flow : 0
    this.closeModal()
    if (logoutAfter || flow === 2) {
      // Flow 2's Cancel leaves Telegram unlinked and the member in the wallet-only view.
      await this.logout()
      return
    }
    if (flow === 3) {
      this.decideLater()
    }
  }

  // A payment of this member is open: the server's record, or a pending lock of this browser.
  // The server decides a switch or release (`payment_in_progress`); this only adds the warning to
  // the undo / release confirm screen.
  get paymentOpen(): boolean {
    const account = this.session?.account
    return (
      this.overview?.payInProgress !== undefined ||
      (account !== undefined && readLocks(this.storage).some((lock) => lock.account === account))
    )
  }

  async startRelease() {
    this.setBusy(true)
    this.setError(undefined)
    try {
      const prepare = toPrepare(await this.req('clubreleaseprepare'))
      if (!prepare.ok) {
        this.refusal(prepare.reason)
        return
      }
      runInAction(() => {
        this.modal = { kind: 'confirm', flow: 1, prepare, release: true }
        this.busy = false
      })
    } catch {
      this.setBusy(false)
      this.setError({ key: 'club.error.retry' })
    }
  }

  // "Reconnect previous": client only. Disconnect, open TON Connect, compare again.
  async reconnectPrevious(flow: 2 | 3) {
    const club = this.parse(this.clubWallet)
    this.openModal({ kind: 'connect', flow, reconnect: true })
    if (this.mock !== undefined && !this.realWalletConnected) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      this.model.setAddress(club)
    } else {
      this.model.startPickerWatch()
      await this.model.ensureWalletSettled()
      const ui = this.model.tonConnectUI
      if (ui === undefined) {
        return
      }
      if (ui.connected) {
        await ui.disconnect()
      }
      await new Promise<void>((resolve) => {
        const off = ui.onModalStateChange((state) => {
          if (state.status === 'closed') {
            off()
            resolve()
          }
        })
        void ui.openModal().then(this.model.endConnect)
      })
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    const connected = this.connected
    runInAction(() => {
      this.modal = undefined
    })
    if (connected !== undefined && club !== undefined && connected.equals(club)) {
      const grace = this.overview?.state === 'grace'
      runInAction(() => {
        this.decidedLater = false
      })
      this.setNotice({
        tone: 'success',
        title: this.t('club.flow.welcomeBackTitle', { wallet: this.clubWalletMasked }),
        body: this.t('club.flow.welcomeBackBody') + (grace ? ' ' + this.t('club.flow.welcomeBackGrace') : ''),
      })
    } else if (connected !== undefined) {
      this.openModal({ kind: 'choose', flow })
    }
  }

  // ------------------------------------------------------------------------------ claim and upgrade

  // The modal's snapshot: what the member saw; payments.ts re-reads and compares.
  get snapshot(): ModalSnapshot | undefined {
    const o = this.overview
    if (o === undefined) {
      return undefined
    }
    return {
      clubWallet: this.clubWallet,
      clubLevel: this.status?.clubLevel ?? o.clubLevel,
      state: this.status?.state ?? o.state,
      switchPending: (this.status?.switchPending ?? false) || o.switchPending,
      fee: this.upgradeOffer?.fee,
    }
  }

  async openClaim() {
    if (this.needTelegram('claim')) {
      return
    }
    this.openModal({ kind: 'claim' })
  }

  async openUpgrade() {
    if (this.needTelegram('upgrade')) {
      return
    }
    // A fresh clublevels whenever the modal opens (§2).
    this.openModal({ kind: 'upgrade' })
    try {
      const levels = toLevels(await this.req('clublevels'))
      runInAction(() => {
        this.levels = levels
      })
    } catch {
      this.setError({ key: 'club.error.serverRead' })
    }
  }

  private async tonConnectModule(): Promise<TonConnectModule> {
    this.tonConnect ??= await import('@tonconnect/ui')
    return this.tonConnect
  }

  private async paymentContext(): Promise<PaymentContext> {
    const fake = this.mock !== undefined && !this.realWalletConnected
    const tonConnect = fake ? undefined : await this.tonConnectModule()
    const asGuardStatus = async (): Promise<GuardStatus> => {
      const status = toStatus(await this.req('clubstatus'))
      if (!status.ok) {
        throw new Error(status.reason ?? 'refused')
      }
      runInAction(() => {
        this.status = status
      })
      return status
    }
    const asGuardOverview = async (): Promise<GuardOverview> => {
      const o = toOverview(await this.req('cluboverview'))
      if (!o.ok) {
        throw new Error(o.reason ?? 'refused')
      }
      runInAction(() => {
        this.overview = o
      })
      return {
        clubWallet: o.clubWallet,
        clubLevel: o.clubLevel,
        state: o.state,
        switchPending: o.switchPending,
        frozen: o.frozen,
        stateUntil: o.stateUntil,
        unclaimed: o.unclaimed,
        claimOk: o.claim.ok,
        claimReason: o.claim.reason,
        claimsOpenAt: o.claimsOpenAt,
        claimInProgress: o.claimInProgress !== undefined,
        claims: [...(o.claimInProgress ? [o.claimInProgress] : []), ...o.recentClaims],
        upgradeFee: o.upgradeFee,
        wrapupPending: o.wrapupPending,
        payInProgress: o.payInProgress,
      }
    }
    return {
      account: this.session?.account,
      serverNow: () => this.serverNow(),
      connected: this.connected,
      // Read again by the guard right before the send: TON Connect's account at that instant (the
      // made-up wallet in the mock preview).
      connectedNow: () => (fake ? this.connected : this.parse(this.model.tonConnectUI?.account?.address)),
      parseAddress: (value) => this.parse(value),
      readStatus: asGuardStatus,
      readOverview: asGuardOverview,
      readLevels: async () => {
        const levels = toLevels(await this.req('clublevels'))
        runInAction(() => {
          this.levels = levels
        })
        return { fees: levels.levels.map((level) => level.fee), hasNext: levels.hasNext }
      },
      chain: fake
        ? this.mock!.chainReader()
        : createChainReader({
            tonClient: () => this.model.tonClient,
            parseAddress: (v) => this.chain.Address.parse(v),
            archivePage: (address, hipo) =>
              archiveFirstPage(
                address,
                hipo,
                (v) => this.chain.Address.parse(v),
                (boc) => this.chain.Cell.fromBase64(boc),
              ),
          }),
      store: this.storage,
      beginCell: this.chain.beginCell,
      network: tonConnect?.CHAIN.MAINNET ?? '-239',
      send: (tx) =>
        fake
          ? this.mock!.send(tx)
          : // The Club's only send: TON Connect through the Model's guard (bounded by validUntil,
            // a dropped session disconnects). Reached from sendClubPayment alone.
            this.model.guardedSendTransaction(tx as unknown as Parameters<Model['guardedSendTransaction']>[0]),
      isUserRejection: (e) =>
        (tonConnect !== undefined && e instanceof tonConnect.UserRejectsError) ||
        (e as Error)?.constructor?.name === 'MockRejection',
      mockWithRealWallet: this.mock !== undefined && this.realWalletConnected,
      openPayIntent: async (intent) => {
        const reply = toPayIntentReply(
          await this.req('clubpayintent', {
            target: intent.target,
            ...(intent.level !== undefined ? { level: intent.level } : {}),
            valid_until: intent.validUntil,
            wallet: intent.wallet,
          }),
        )
        if (reply.ok) {
          return { ok: true, created: reply.open?.created }
        }
        const open = reply.open
        if (open !== undefined) {
          // Shown at once: the buttons say "on its way" without waiting for the next poll.
          runInAction(() => {
            if (this.overview !== undefined) {
              this.overview = { ...this.overview, payInProgress: open }
            }
          })
        }
        return { ok: false, reason: reply.reason, open }
      },
      cancelPayIntent: async (created) => {
        // `not_yours` (the record is not this session's) is done too: nothing to cancel from here.
        await this.req('clubpaycancel', { created, rejected: true })
      },
    }
  }

  async pay(kind: 'claim' | 'upgrade') {
    const snapshot = this.snapshot
    if (snapshot === undefined || this.busy) {
      return
    }
    this.setBusy(true)
    this.setError(undefined)
    const before = this.overview
    // This tab's check of the due claim locks holds the payment Web Lock; the guard would be refused
    // as "locked" while it runs.
    await this.claimLockCheck
    const result = await sendClubPayment(await this.paymentContext(), kind, snapshot)
    this.setBusy(false)
    switch (result.outcome) {
      case 'sent': {
        if (kind === 'claim') {
          const target = before !== undefined && before.clubLevel < 9 ? before.clubLevel + 2 : undefined
          const qualified =
            before !== undefined && !before.claimedThisSeason && before.state === 'ok' && target !== undefined
          runInAction(() => {
            this.claimOnItsWay = Math.floor(Date.now() / 1000)
            this.modal = {
              kind: 'claimDone',
              amount: before?.unclaimed ?? '0',
              qualified,
              target,
              below: before?.state === 'grace',
            }
          })
        } else {
          runInAction(() => {
            this.modal = { kind: 'upgradeDone', level: (snapshot.clubLevel ?? 0) + 1 }
          })
        }
        this.schedule(OVERVIEW_POLL)
        return
      }
      case 'rejected':
        this.setError({ key: 'club.error.rejected' })
        return
      case 'walletError':
        this.setError({ key: 'club.error.walletError' })
        return
      case 'refused': {
        if (result.reason === 'notApplied' && result.at !== undefined && result.ackKey !== undefined) {
          this.openModal({ kind: 'notApplied', at: result.at, ackKey: result.ackKey, payment: kind })
          return
        }
        if (result.reason === 'changed') {
          // The account changed since the modal opened: the modal shows the fresh data.
          await this.load(true)
          this.setError({ key: 'club.error.changed' })
          return
        }
        if (result.reason === 'onItsWay') {
          if (result.at === undefined) {
            // A server record with no time: the same "on its way" without the date.
            this.setError({ key: 'club.error.locked' })
            return
          }
          runInAction(() => {
            if (kind === 'claim') {
              this.claimOnItsWay = result.at
            }
          })
          this.setError({ key: 'club.error.onItsWay', params: { date: this.date(result.at, true) } })
          return
        }
        if (result.reason === 'balance') {
          const need = result.detail !== undefined ? Number(BigInt(result.detail)) / 1e9 : undefined
          this.setError({ key: 'club.error.balance', params: { amount: this.amount(need, 2) } })
          return
        }
        if (result.reason === 'gate') {
          this.setError(this.gateError(result.detail ?? 'in_progress'))
          return
        }
        this.setError({ key: refusalKey(result.reason) })
        return
      }
    }
  }

  acknowledge(ackKey: string, payment: 'claim' | 'upgrade', from?: 'load') {
    addAck(this.storage, ackKey)
    this.closeModal()
    if (from === 'load') {
      // Read at a load: the lock is judged again now that the ack is stored, which releases it
      // (release (4)) and clears "on its way". The member presses Claim when they choose to.
      this.claimLockCheckedAt = 0
      void this.settleDueClaimLocks()
      return
    }
    if (payment === 'claim') {
      this.openModal({ kind: 'claim' })
    } else {
      void this.openUpgrade()
    }
  }

  // ------------------------------------------------------------------------------ revenue share

  async withdraw() {
    if (this.withdrawBlock !== undefined || this.clubWallet === undefined) {
      return
    }
    const club = this.parse(this.clubWallet)
    if (club === undefined) {
      return
    }
    runInAction(() => {
      this.withdrawing = true
      this.withdrawResult = undefined
    })
    try {
      const reply = toWithdraw(await this.req('hpowithdrawrewards', { raw_address: club.toRawString(), value: -1 }))
      runInAction(() => {
        if (this.walletRewards !== undefined) {
          this.walletRewards = {
            ...this.walletRewards,
            hpoSumRewards: reply.hpoSumRewards,
            hpoWithdrawals: reply.withdrawals,
          }
        }
        this.withdrawResult = 'done'
      })
    } catch {
      // A closed socket means "failed, try again": the server refuses a second withdrawal of an
      // emptied balance, so a retry by the member is safe; nothing retries here.
      runInAction(() => {
        this.withdrawResult = 'failed'
      })
    } finally {
      runInAction(() => {
        this.withdrawing = false
      })
    }
  }

  // ------------------------------------------------------------------------------ misc

  shareUrl(link: string): string {
    return SHARE_URL + encodeURIComponent(link) + '&text=' + encodeURIComponent(this.t('club.friends.shareText'))
  }

  get hipoTon(): string {
    return HIPO_TON
  }

  dispose() {
    for (const dispose of this.disposers) {
      dispose()
    }
    for (const timer of this.timers) {
      clearTimeout(timer)
    }
    this.stopPolling()
  }
}

// ------------------------------------------------------------------------------------ the factory

const instances = new WeakMap<Model, Promise<ClubModel>>()

export function clubModelFor(model: Model): Promise<ClubModel> {
  let pending = instances.get(model)
  if (pending === undefined) {
    pending = (async () => {
      const chain = await import('../chain')
      await model.ensureChain()
      let mock: Mock | undefined
      let transport: ClubTransport
      if (isMockBuild) {
        const mockModule: MockModule = await import('./mock.ts')
        mock = new mockModule.ClubMock(chain)
        transport = mock
        // The preview's made-up connected wallet, unless a real wallet is (or will be) connected.
        const fake = mock.fakeConnected()
        if (model.address === undefined && fake !== undefined && !hasTonConnectSession()) {
          model.setAddress(fake)
        }
      } else {
        const { ClubSocket } = await import('./socket.ts')
        transport = new ClubSocket()
      }
      const club = new ClubModel(model, chain, transport, mock)
      transport.onAuthReply = club.onAuthReply
      club.start()
      return club
    })()
    instances.set(model, pending)
  }
  return pending
}

function hasTonConnectSession(): boolean {
  try {
    return window.localStorage.getItem('ton-connect-storage_bridge-connection') != null
  } catch {
    return false
  }
}
