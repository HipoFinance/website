// A stand-in for the Club server, for local preview only (specs/club-website.md §2): run the site
// with `PUBLIC_CLUB=1 PUBLIC_CLUB_MOCK=1 npm run dev`. ClubPage imports this module only when
// PUBLIC_CLUB_MOCK is '1', so a production build contains none of it.
//
// The URL picks the scenario:
//   ?clubState=  A  A0  B  C  D  D2  E  F  G  belowMin  claimed  top  launching  frozen  loading
//                error  nolink  nowallet  flow2  flow3  empty         (default B)
//   ?clubChain=  clear  onway  old  stale  pagefail  limit            the chain read of the guard
//   ?clubSend=   ok  reject  timeout                                   what the fake wallet answers
//   ?clubNew=    meets  below                                          the HPO of a newly linked wallet
//   ?clubErr=    any spec 2 reason, returned by the next prepare/confirm (e.g. wallet_taken)
//   ?clubFees=   next  mismatch  bad                                    a clublevels the guard refuses
//   ?clubSkew=   seconds the server clock is ahead of the device (default 0)
//   ?clubPay=    claim  upgrade  fail                                  the server's "payment in progress"
//                record: claim / upgrade = one is open from another device (the buttons say "on its
//                way", clubpayintent refuses, a wallet switch or release is refused with
//                payment_in_progress); fail = clubpayintent closes the socket (nothing is sent)
//
// Every figure here is made up for the preview and differs from the wireframes' sample data.
// With a real wallet connected the account follows that wallet (its Club wallet is the connected
// one), the chain reads and the claim send are real, and an upgrade is never sent (payments.ts).
import type { Address } from '@ton/core'
import { ClubSocketError, type ClubTransport, type WalletRewards } from './api.ts'
import { ChainReadError, type ChainRead, type ChainReader } from './payments.ts'
import type { ClubTx } from './clubTx.ts'

type ChainModule = typeof import('../chain')

const FEES = [0, 20, 40, 60, 100, 160, 260, 420, 680, 1100]
const COEFFICIENTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // the new rules: the level number
const HOUR = 3600
const DAY = 24 * HOUR
const ROUND = 65536

const NAMES = ['Nadia', 'Hipo member', 'Kofi', 'Lena', 'Hipo member', 'Rustam', 'Ines', 'Tariq', 'Mei', 'Oskar']

function param(name: string): string | undefined {
  try {
    return new URLSearchParams(window.location.search).get(name) ?? undefined
  } catch {
    return undefined
  }
}

// The scenario is read once per page load and kept for the tab, because in-app navigation drops the
// query string (like ?tma=1 in tma/telegram.ts).
function sticky(name: string): string | undefined {
  const key = 'hipo.club.mock.' + name
  const value = param(name)
  try {
    if (value !== undefined) {
      window.sessionStorage.setItem(key, value)
      return value
    }
    return window.sessionStorage.getItem(key) ?? undefined
  } catch {
    return value
  }
}

export type MockScenario =
  | 'A'
  | 'A0'
  | 'B'
  | 'C'
  | 'D'
  | 'D2'
  | 'E'
  | 'F'
  | 'G'
  | 'belowMin'
  | 'claimed'
  | 'top'
  | 'launching'
  | 'frozen'
  | 'loading'
  | 'error'
  | 'nolink'
  | 'nowallet'
  | 'flow2'
  | 'flow3'
  | 'empty'

export function mockScenario(): MockScenario {
  return (sticky('clubState') as MockScenario | undefined) ?? 'B'
}

function hpo(n: number): string {
  return n.toFixed(9)
}

interface MockAccount {
  account: string
  displayName: string
  clubWallet?: string
  pastWallets: string[]
  clubLevel: number
  state: string
  stateSince?: number
  stateUntil?: number
  restoredAt?: number
  resetAt?: number
  resetFromLevel?: number
  minimum: number
  holdings: number
  unclaimed: number
  referral: number
  claimedThisSeason: boolean
  frozen: boolean
  switchPending: boolean
  wrapupPending: boolean
  claimsOpenAt?: number
  inProgress?: { amount: number; claimTime: number }
  claims: { amount: number; wallet: string; txHash: string; claimTime: number; requestTime: number }[]
  hideName: boolean
  alerts: boolean
  friends: number
  lastSwitchAt?: number
  // The server's "payment in progress" record (clubpayintent).
  payIntent?: { target: 'claim' | 'upgrade'; level?: number; validUntil: number; created: number }
}

// The server keeps a record open until valid_until + this, by server time.
const PAY_INTENT_HOLD = 1260

export class ClubMock implements ClubTransport {
  readonly scenario: MockScenario = mockScenario()
  private chain: ChainModule
  private skew = Number(sticky('clubSkew') ?? '0') || 0
  private auth?: () => Record<string, unknown> | undefined
  private intents = new Map<string, { to?: string; release: boolean; expiresAt: number }>()
  private errOnce = sticky('clubErr')
  private tgDone = false
  // The made-up wallets: the Club wallet, another of the member's wallets, and a wallet a proof links.
  readonly walletA: Address
  readonly walletB: Address
  private acct: MockAccount
  // Set when a real TON Connect wallet is connected: the account then follows it.
  private realWallet?: Address

  constructor(chain: ChainModule) {
    this.chain = chain
    this.walletA = new chain.Address(0, Buffer.from('5a'.repeat(32), 'hex'))
    this.walletB = new chain.Address(0, Buffer.from('b7'.repeat(32), 'hex'))
    this.acct = this.build(this.scenario)
  }

  now(): number {
    return Math.floor(Date.now() / 1000) + this.skew
  }

  private build(scenario: MockScenario): MockAccount {
    const now = this.now()
    const base: MockAccount = {
      account: '777001',
      displayName: 'Ava',
      clubWallet: this.walletA.toRawString(),
      pastWallets: [],
      clubLevel: 5,
      state: 'ok',
      minimum: 52340.5,
      holdings: 61208.37,
      unclaimed: 187.42,
      referral: 3.18,
      claimedThisSeason: false,
      frozen: false,
      switchPending: false,
      wrapupPending: false,
      claims: [
        {
          amount: 1286.4,
          wallet: this.walletA.toRawString(),
          txHash: 'c0ffee'.repeat(10) + 'beef',
          claimTime: now - 40 * DAY,
          requestTime: now - 40 * DAY + 300,
        },
      ],
      hideName: false,
      alerts: true,
      friends: 37,
    }
    // Another device of the account opened a payment a minute ago and is waiting on its wallet.
    const pay = sticky('clubPay')
    if (pay === 'claim' || pay === 'upgrade') {
      base.payIntent = {
        target: pay,
        level: pay === 'upgrade' ? base.clubLevel + 2 : undefined,
        validUntil: now + 240,
        created: now - 60,
      }
    }
    switch (scenario) {
      case 'C':
        return { ...base, unclaimed: 11.07, claimedThisSeason: true }
      case 'D':
        return { ...base, state: 'grace', stateSince: now - 5 * HOUR, stateUntil: now + 19 * HOUR, holdings: 40112.06 }
      case 'D2':
        return {
          ...base,
          state: 'grace',
          stateSince: now - 5 * HOUR,
          stateUntil: now + 19 * HOUR,
          holdings: 40112.06,
          unclaimed: 0.8,
          claimedThisSeason: true,
        }
      case 'E':
        return {
          ...base,
          state: 'suspended',
          stateSince: now - 2 * DAY,
          stateUntil: now + 5 * DAY,
          holdings: 40112.06,
          unclaimed: 23.9,
        }
      case 'F':
        return { ...base, restoredAt: now - 3 * HOUR, holdings: 55019.2 }
      case 'G':
        return {
          ...base,
          clubLevel: 0,
          minimum: 0,
          resetAt: now - 2 * DAY,
          resetFromLevel: 5,
          holdings: 40112.06,
          unclaimed: 9.6,
        }
      case 'belowMin':
        return { ...base, unclaimed: 61.3 }
      case 'claimed':
        return {
          ...base,
          unclaimed: 0.4,
          referral: 0.1,
          claimedThisSeason: true,
          inProgress: { amount: 187.42, claimTime: now - 120 },
        }
      case 'top':
        return { ...base, clubLevel: 9, minimum: 912004.1, holdings: 1004871.5 }
      case 'frozen':
        return { ...base, frozen: true }
      case 'nolink':
        return { ...base, clubWallet: undefined, minimum: 0, holdings: 0 }
      case 'flow2':
      case 'flow3':
        return { ...base, pastWallets: [] }
      case 'empty':
        return { ...base, clubLevel: 0, minimum: 0, holdings: 0, unclaimed: 0, referral: 0, claims: [], friends: 0 }
      default:
        return base
    }
  }

  // --------------------------------------------------------------------------- the wallet side

  /** The wallet the mock pretends is connected when no real wallet is; undefined = none. */
  fakeConnected(): Address | undefined {
    switch (this.scenario) {
      case 'nowallet':
        return undefined
      case 'flow2':
      case 'flow3':
        return this.walletB
      case 'A0':
        return this.walletB
      default:
        return this.walletA
    }
  }

  /** A real TON Connect wallet is connected: the mock account now follows it. */
  followRealWallet(address: Address | undefined) {
    this.realWallet = address
    if (
      address !== undefined &&
      this.acct.clubWallet !== undefined &&
      this.scenario !== 'flow2' &&
      this.scenario !== 'flow3'
    ) {
      this.acct.clubWallet = address.toRawString()
    }
  }

  /** The fake wallet's answer to a send. */
  async send(tx: ClubTx): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 900))
    const mode = sticky('clubSend') ?? 'ok'
    if (mode === 'reject') {
      throw new MockRejection()
    }
    if (mode === 'timeout') {
      throw new Error('mock wallet timeout')
    }
    const now = this.now()
    const payload = tx.messages[0].payload
    const cell = this.chain.Cell.fromBase64(payload).beginParse()
    const op = cell.loadUint(32)
    if (op === 0xfee1) {
      this.acct.inProgress = { amount: this.acct.unclaimed, claimTime: now }
      this.acct.minimum += this.acct.unclaimed
      this.acct.holdings += this.acct.unclaimed
      this.acct.unclaimed = 0
      this.acct.referral = 0
      this.acct.claimedThisSeason = true
      setTimeout(() => {
        const done = this.acct.inProgress
        if (done !== undefined) {
          this.acct.claims.unshift({
            amount: done.amount,
            wallet: this.acct.clubWallet ?? '',
            txHash: 'fade'.repeat(16),
            claimTime: done.claimTime,
            requestTime: done.claimTime + 40,
          })
          this.acct.inProgress = undefined
        }
      }, 20_000)
    } else if (op === 0xb0) {
      cell.loadUintBig(64)
      const n = cell.loadUint(8)
      setTimeout(() => {
        this.acct.clubLevel = Math.max(this.acct.clubLevel, n - 1)
      }, 4000)
    }
  }

  /** The guard's chain reads in the preview, by ?clubChain=. */
  chainReader(): ChainReader {
    return {
      read: async (_address, options): Promise<ChainRead> => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const mode = sticky('clubChain') ?? 'clear'
        const now = this.now()
        if (mode === 'pagefail') {
          throw new ChainReadError('readFailed')
        }
        if (mode === 'limit') {
          throw new ChainReadError('pageLimit')
        }
        const blockTime = mode === 'stale' ? now - 120 : now - 3
        const target = this.acct.clubLevel + 2
        const txs =
          mode === 'onway'
            ? [
                {
                  lt: 9_000n,
                  now: now - 1800,
                  matches: [{ op: 'upgrade' as const, level: target }, { op: 'claim' as const }],
                },
              ]
            : mode === 'old'
              ? [
                  {
                    lt: 8_000n,
                    now: now - DAY - 3600,
                    matches: [{ op: 'upgrade' as const, level: target }, { op: 'claim' as const }],
                  },
                ]
              : []
        const lastLt = 10_000n
        return {
          blockTime,
          balance: 1_500_000_000_000n,
          lastLt,
          txs: [{ lt: lastLt, now: now - 600, matches: [] }, ...txs],
          coveredFrom: options?.downToLt !== undefined && options.downToLt < 7_000n ? options.downToLt : 7_000n,
          reachedLookback: true,
        }
      },
    }
  }

  /** "Log in with Telegram" in the preview: the widget's fields, made up. */
  async telegramLogin(): Promise<Record<string, unknown>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.tgDone = true
    return { id: 777001, first_name: 'Ava', auth_date: this.now(), hash: 'mock' }
  }

  /** A ton_proof from the wallet being linked: walletB, or walletA in flow 2/3's reconnect. */
  async proof(payload: string): Promise<{ address: Address; proof: Record<string, unknown> }> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const address = this.walletB
    return {
      address,
      proof: {
        raw_address: address.toRawString(),
        wallet_state_init: 'te6mock',
        domain: 'hipo.finance',
        payload,
        signature: 'mock',
        timestamp: this.now(),
      },
    }
  }

  /** The open record, as the server decides it: closed once applied or past valid_until + 1260 s. */
  private openPayIntent(): MockAccount['payIntent'] {
    const a = this.acct
    const intent = a.payIntent
    if (intent === undefined) {
      return undefined
    }
    const applied =
      intent.target === 'claim'
        ? a.claims.some((c) => c.claimTime >= intent.created - 60)
        : intent.level !== undefined && a.clubLevel >= intent.level - 1
    if (applied || this.now() > intent.validUntil + PAY_INTENT_HOLD) {
      a.payIntent = undefined
      return undefined
    }
    return intent
  }

  private payIntentBody(): Record<string, unknown> | undefined {
    const intent = this.openPayIntent()
    return intent === undefined
      ? undefined
      : {
          target: intent.target,
          level: intent.level,
          valid_until: intent.validUntil,
          created: intent.created,
          expires_at: intent.validUntil + PAY_INTENT_HOLD,
        }
  }

  // ---------------------------------------------------------------------------- the transport

  setAuth(auth: (() => Record<string, unknown> | undefined) | undefined) {
    this.auth = auth
  }

  onAuthReply?: (body: unknown, sent: Record<string, unknown>) => void
  private authed = false

  close() {
    this.authed = false
  }

  isRejection(e: unknown): boolean {
    return e instanceof MockRejection
  }

  // Like the socket: the first request of a connection authenticates with `clubauth` first.
  async request(type: string, body: Record<string, unknown> = {}): Promise<unknown> {
    if (
      !this.authed &&
      type !== 'clubauth' &&
      this.scenario !== 'loading' &&
      this.scenario !== 'error' &&
      this.scenario !== 'launching'
    ) {
      const auth = this.auth?.()
      if (auth === undefined) {
        throw new ClubSocketError('auth', 'no_credentials')
      }
      const reply = await this.answer('clubauth', auth)
      this.onAuthReply?.(reply, auth)
      if ((reply as { ok?: boolean }).ok !== true) {
        throw new ClubSocketError('auth', String((reply as { reason?: string }).reason))
      }
      this.authed = true
    }
    return this.answer(type, body)
  }

  private async answer(type: string, body: Record<string, unknown>): Promise<unknown> {
    if (this.scenario === 'loading') {
      return new Promise(() => undefined)
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
    if (this.scenario === 'error') {
      throw new ClubSocketError('connect')
    }
    if (this.scenario === 'launching') {
      throw new ClubSocketError('connect')
    }
    const now = this.now()
    const head = { ok: true, now }
    const refused = (reason: string) => ({ ok: false, reason, now })
    const a = this.acct
    switch (type) {
      case 'clubauth': {
        const auth = body
        if (auth.token === undefined && auth.widget === undefined && auth.init_data === undefined) {
          return refused('bad_auth')
        }
        return { ...head, token: 'mock-token-' + now, expires_at: now + 7 * DAY, account: Number(a.account) }
      }
      case 'clublogout':
        this.authed = false
        return head
      case 'clubstatus':
        return this.statusBody(head)
      case 'cluboverview':
        return this.overviewBody(head)
      case 'clubrewards':
        return this.rewardsBody(head)
      case 'clubfriends':
        return this.friendsBody(head, body)
      case 'clubleaderboard':
        return this.boardBody(head, body)
      case 'clubsettings':
        if (typeof body.hide_name === 'boolean') {
          a.hideName = body.hide_name
        }
        if (typeof body.alerts === 'boolean') {
          a.alerts = body.alerts
        }
        return { ...head, settings: { hide_name: a.hideName, alerts: a.alerts, alerts_unreachable: false } }
      case 'clublevels':
        return this.levelsBody()
      case 'clubproofchallenge':
        return { ...head, payload: 'mockchallenge' + now, expires_at: now + 600 }
      case 'clubpayintent': {
        if (sticky('clubPay') === 'fail') {
          throw new ClubSocketError('closed')
        }
        const open = this.payIntentBody()
        if (open !== undefined) {
          return { ...refused('payment_in_progress'), pay_in_progress: open }
        }
        const target = body.target === 'upgrade' ? 'upgrade' : 'claim'
        a.payIntent = {
          target,
          level: target === 'upgrade' && typeof body.level === 'number' ? body.level : undefined,
          validUntil: typeof body.valid_until === 'number' ? body.valid_until : now + 300,
          created: now,
        }
        return { ...head, pay_in_progress: this.payIntentBody() }
      }
      case 'clubpaycancel':
        // Only the record created at `created`, and only on a wallet rejection (as the server).
        if (body.rejected !== true || typeof body.created !== 'number') {
          return refused('bad_request')
        }
        if (a.payIntent?.created === body.created) {
          a.payIntent = undefined
          return { ...head, cleared: true }
        }
        return head
      case 'clublinkprepare':
      case 'clubreleaseprepare': {
        const error = this.takeError()
        if (error !== undefined) {
          return refused(error)
        }
        if (a.frozen) {
          return refused('frozen')
        }
        if (a.clubWallet !== undefined && this.openPayIntent() !== undefined) {
          return refused('payment_in_progress')
        }
        const release = type === 'clubreleaseprepare'
        if (release && a.clubWallet === undefined) {
          return refused('no_club_wallet')
        }
        const proof = (body.proof ?? {}) as Record<string, unknown>
        const to = release ? undefined : String(proof.raw_address ?? this.walletB.toRawString())
        if (!release && to === a.clubWallet) {
          return refused('same_wallet')
        }
        const id = 'intent' + now
        const expiresAt = now + 300
        this.intents.set(id, { to, release, expiresAt })
        const meets = (sticky('clubNew') ?? 'meets') === 'meets'
        const newHpo = release ? 0 : meets ? a.minimum + 4210.66 : Math.max(0, a.minimum - 11873.4)
        return {
          ...head,
          id,
          kind: release ? 'release' : a.clubWallet === undefined ? 'link' : 'switch',
          claims_from_wallet_void: false,
          club_wallet_masked: a.clubWallet === undefined ? undefined : this.mask(a.clubWallet),
          new_wallet: to,
          new_wallet_masked: to === undefined ? undefined : this.mask(to),
          club_level: a.clubLevel,
          boost: COEFFICIENTS[a.clubLevel],
          minimum: hpo(a.minimum),
          new_wallet_hpo: release ? undefined : hpo(newHpo),
          below_minimum: !release && newHpo < a.minimum,
          counted_hpo: release ? hpo(0) : undefined,
          claims_open_at: release || a.clubWallet === undefined ? undefined : now + DAY,
          expires_at: expiresAt,
        }
      }
      case 'clublinkconfirm':
      case 'clubreleaseconfirm': {
        const error = this.takeError()
        if (error !== undefined) {
          return refused(error)
        }
        const intent = this.intents.get(String(body.id))
        if (intent === undefined || intent.expiresAt < now) {
          return refused('expired')
        }
        if (a.clubWallet !== undefined && this.openPayIntent() !== undefined) {
          return refused('payment_in_progress')
        }
        this.intents.delete(String(body.id))
        if (a.clubWallet !== undefined) {
          a.pastWallets.unshift(a.clubWallet)
        }
        const meets = (sticky('clubNew') ?? 'meets') === 'meets'
        if (intent.release) {
          a.clubWallet = undefined
          a.holdings = 0
        } else {
          const initial = a.clubWallet === undefined
          a.clubWallet = intent.to
          a.holdings = meets ? a.minimum + 4210.66 : Math.max(0, a.minimum - 11873.4)
          a.claimsOpenAt = initial ? undefined : now + DAY
        }
        if (a.holdings < a.minimum && a.state === 'ok') {
          a.state = 'grace'
          a.stateSince = now
          a.stateUntil = now + DAY
        }
        a.lastSwitchAt = now
        return { ...head, state: 'done', token: 'mock-token-' + now, expires_at: now + 7 * DAY }
      }
      case 'clubcancel':
        this.intents.delete(String(body.id))
        return head
      case 'hpowithdrawrewards':
        return {
          hpo_sum_rewards: '0',
          hpo_reward_withdrawals: [{ request_time: now, sent: 6.21, fee: 0.5, tx_hash: '' }],
        }
      default:
        throw new ClubSocketError('closed')
    }
  }

  private takeError(): string | undefined {
    const error = this.errOnce
    this.errOnce = undefined
    if (error !== undefined) {
      try {
        window.sessionStorage.removeItem('hipo.club.mock.clubErr')
      } catch {
        // ignored
      }
    }
    return error
  }

  mask(raw: string): string {
    const friendly = this.chain.Address.parse(raw).toString({ bounceable: false })
    return friendly.slice(0, 4) + '…' + friendly.slice(-4)
  }

  private statusBody(head: Record<string, unknown>) {
    const a = this.acct
    return {
      ...head,
      club_wallet: a.clubWallet,
      club_wallet_masked: a.clubWallet === undefined ? undefined : this.mask(a.clubWallet),
      past_wallets: a.pastWallets.map((w) => this.mask(w)),
      club_level: a.clubLevel,
      boost: COEFFICIENTS[a.clubLevel],
      minimum: hpo(a.minimum),
      state: a.state,
      next_switch_at: a.lastSwitchAt !== undefined ? a.lastSwitchAt + DAY : undefined,
      switch_pending: a.switchPending,
      frozen: a.frozen,
      notify_failed: false,
      pay_in_progress: this.payIntentBody(),
    }
  }

  private overviewBody(head: Record<string, unknown>) {
    const a = this.acct
    const now = this.now()
    const next = a.clubLevel < 9 ? a.clubLevel + 1 : undefined
    const short = a.holdings < a.minimum ? Math.ceil(a.minimum - a.holdings) : undefined
    let gate: Record<string, unknown> = { ok: true }
    if (a.clubWallet === undefined) {
      gate = { ok: false, reason: 'no_wallet' }
    } else if (a.inProgress !== undefined) {
      gate = { ok: false, reason: 'in_progress' }
    } else if (a.frozen) {
      gate = { ok: false, reason: 'frozen' }
    } else if (a.switchPending) {
      gate = { ok: false, reason: 'switch_pending' }
    } else if (a.claimsOpenAt !== undefined && a.claimsOpenAt > now) {
      gate = { ok: false, reason: 'link_wait', opens_at: a.claimsOpenAt }
    } else if (a.unclaimed < 100) {
      gate = { ok: false, reason: 'below_min' }
    }
    let chip = 'active'
    if (a.state === 'grace') {
      chip = 'at_risk'
    } else if (a.state === 'suspended') {
      chip = 'suspended'
    } else if (a.resetAt !== undefined && now - a.resetAt < 7 * DAY && a.minimum === 0) {
      chip = 'reset'
    } else if (a.restoredAt !== undefined && now - a.restoredAt < 7 * DAY) {
      chip = 'restored'
    }
    const coefficient = a.state === 'suspended' ? 1 : COEFFICIENTS[a.clubLevel]
    const perRound = (c: number) => String(Math.floor(2.75 * c))
    const listed = a.clubWallet !== undefined && a.state !== 'suspended' && a.minimum > 0
    const hpoWallet = Math.max(0, a.holdings - 18402.3)
    return {
      ...head,
      club_level: a.clubLevel,
      boost: COEFFICIENTS[a.clubLevel],
      next_level: next,
      next_boost: next === undefined ? undefined : COEFFICIENTS[next],
      upgrade_fee:
        next === undefined
          ? undefined
          : sticky('clubFees') === 'mismatch'
            ? FEES[next] + 1
            : sticky('clubFees') === 'bad'
              ? FEES[next] + 0.5
              : FEES[next],
      state: a.state,
      state_since: a.stateSince,
      state_until: a.stateUntil,
      restored_at: a.restoredAt,
      reset_at: a.resetAt,
      reset_from_level: a.resetFromLevel,
      chip,
      minimum: hpo(a.minimum),
      holdings: a.clubWallet === undefined ? undefined : hpo(a.holdings),
      holdings_at: now - 240,
      holdings_fresh: true,
      ratio: a.minimum > 0 ? Math.round((a.holdings / a.minimum) * 100) : undefined,
      short: short === undefined ? undefined : String(short),
      split:
        a.clubWallet === undefined
          ? undefined
          : {
              // As the server sends them: the wallet's own balances decimal, the pool fields nano.
              balance_hpo: hpo(hpoWallet),
              balance_hpo_dedust: String(Math.round((a.holdings - hpoWallet) * 1e9)),
              balance_hpo_stonfi: '0',
              balance_hpo_tonco: '0',
              balance_hton: '412.75',
              balance_hton_dedust: '96400000000',
              balance_hton_stonfi: '0',
              balance_hton_tonco: '3080000000',
              balances_at: now - 240,
              lp_at: now - 900,
            },
      estimate_now: perRound(coefficient),
      estimate_next: next === undefined ? undefined : perRound(COEFFICIENTS[next]),
      unclaimed: hpo(a.unclaimed),
      unclaimed_by_stream: {
        staking: hpo(a.unclaimed - a.referral),
        referral: hpo(Math.min(a.referral, a.unclaimed)),
        community: hpo(0),
      },
      claim_min: 100,
      last_round_hpo: perRound(coefficient),
      claim: gate,
      claims_open_at: a.claimsOpenAt !== undefined && a.claimsOpenAt > now ? a.claimsOpenAt : undefined,
      claim_in_progress:
        a.inProgress === undefined
          ? undefined
          : { amount: hpo(a.inProgress.amount), wallet: a.clubWallet, claim_time: a.inProgress.claimTime },
      recent_claims: a.claims.slice(0, 3).map((c) => ({
        amount: c.amount,
        wallet: c.wallet,
        tx_hash: c.txHash,
        claim_time: c.claimTime,
        request_time: c.requestTime,
      })),
      wrapup_pending: a.wrapupPending,
      pay_in_progress: this.payIntentBody(),
      season: { number: 6, start: now - 9 * DAY },
      claimed_this_season: a.claimedThisSeason,
      seasonal_ok: a.claimedThisSeason && a.state !== 'suspended',
      club_wallet: a.clubWallet,
      club_wallet_masked: a.clubWallet === undefined ? undefined : this.mask(a.clubWallet),
      switch_pending: a.switchPending,
      frozen: a.frozen,
      notify_failed: false,
      display_name: a.displayName,
      friends: { count: a.friends, referral_total: hpo(a.friends === 0 ? 0 : 48.35) },
      rank: listed
        ? {
            listed: true,
            club_level: a.clubLevel,
            rank: 17,
            of: 212,
            band: 10,
            growth: 6.4,
            buy: { x: '2100', rank: 16 },
          }
        : {
            listed: false,
            why: a.clubWallet === undefined ? 'no_wallet' : a.state === 'suspended' ? 'suspended' : 'no_claim',
            club_level: a.clubLevel,
          },
      settings: { hide_name: a.hideName, alerts: a.alerts, alerts_unreachable: false },
    }
  }

  private rewardsBody(head: Record<string, unknown>) {
    const a = this.acct
    const now = this.now()
    const empty = this.scenario === 'empty'
    const rounds = empty
      ? []
      : Array.from({ length: 10 }, (_, i) => ({
          round_since: now - (i + 1) * ROUND,
          time: now - i * ROUND - 3000,
          hpo: hpo(13.75 - i * 0.21),
          stake_reward: (0.2841 - i * 0.0013).toFixed(9),
        }))
    return {
      ...head,
      rounds,
      claims: a.claims.map((c) => ({
        amount: c.amount,
        wallet: c.wallet,
        tx_hash: c.txHash,
        claim_time: c.claimTime,
        request_time: c.requestTime,
      })),
      totals: { staking: hpo(empty ? 0 : 6104.88), referral: hpo(empty ? 0 : 48.35) },
      unclaimed: hpo(a.unclaimed),
      unclaimed_by_stream: {
        staking: hpo(a.unclaimed - a.referral),
        referral: hpo(Math.min(a.referral, a.unclaimed)),
        community: hpo(0),
      },
      referral_rounds: empty
        ? []
        : Array.from({ length: 4 }, (_, i) => ({
            round: 400 - i,
            time: now - i * ROUND - 2000,
            hpo: hpo(0.33 + i * 0.04),
          })),
      referral_before_launch: empty ? undefined : hpo(41.07),
      stake_sum_rewards: empty ? '0' : '19.4417',
      stake_rewards_since: empty ? undefined : now - 75 * DAY,
    }
  }

  private friendsBody(head: Record<string, unknown>, body: Record<string, unknown>) {
    const a = this.acct
    const filter = String(body.filter ?? 'all')
    const offset = Number(body.offset ?? 0)
    const limit = Math.min(50, Number(body.limit ?? 50))
    const all = Array.from({ length: a.friends }, (_, i) => {
      const earning = i < 9
      return {
        name: i % 7 === 3 ? 'Hipo member' : NAMES[i % NAMES.length] + (i >= NAMES.length ? ' ' + (i + 1) : ''),
        friend_hpo: hpo(earning ? 2870 / (i + 1) : 0),
        your_hpo: hpo(earning ? 28.7 / (i + 1) : 0),
      }
    })
    const rows = all.filter((row) =>
      filter === 'earning'
        ? Number(row.friend_hpo) > 0
        : filter === 'not_staking'
          ? Number(row.friend_hpo) === 0
          : true,
    )
    return {
      ...head,
      invite_link: 'https://t.me/HipoFinanceBot/join?startapp=' + a.account,
      count: a.friends,
      referral_total: hpo(a.friends === 0 ? 0 : 48.35),
      rows: rows.slice(offset, offset + limit),
    }
  }

  private boardBody(head: Record<string, unknown>, body: Record<string, unknown>) {
    const a = this.acct
    const level = typeof body.club_level === 'number' ? body.club_level : a.clubLevel
    const by = body.by === 'growth' ? 'growth' : 'hpo'
    const size = level === 3 ? 0 : 24
    const rows = Array.from({ length: size }, (_, i) => ({
      rank: i + 1,
      name: NAMES[i % NAMES.length],
      band: i < 3 ? 1 : i < 11 ? 5 : i < 22 ? 10 : 20,
      // Other members' growth comes as a 5-point band only.
      growth_band: growthBand(by === 'growth' ? 31.2 - i * 1.1 : 12.4 - i * 2.1),
    }))
    const mine = level === a.clubLevel && a.minimum > 0 && a.state !== 'suspended'
    return {
      ...head,
      club_level: level,
      by,
      of: size,
      updated: this.now() - 300,
      rows,
      me: mine
        ? {
            rank: 17,
            name: a.hideName ? 'Hipo member' : a.displayName,
            band: 10,
            growth: 6.4,
            holdings: hpo(a.holdings),
          }
        : undefined,
    }
  }

  private levelsBody() {
    const mode = sticky('clubFees')
    const levels = FEES.map((fee, i) => ({ reward_coefficient: COEFFICIENTS[i], upgrade_fee: fee }))
    if (mode === 'next') {
      return { club_levels: levels, fees_change_at: this.now() + DAY, next: levels }
    }
    return { club_levels: levels }
  }

  // ------------------------------------------------------------------------------ wallet-rewards

  async walletRewards(address: string): Promise<WalletRewards> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (this.scenario === 'error') {
      throw new Error('mock wallet-rewards failure')
    }
    const now = this.now()
    const isClub =
      this.acct.clubWallet !== undefined &&
      this.chain.Address.parse(address).equals(this.chain.Address.parse(this.acct.clubWallet))
    return {
      launching: this.scenario === 'launching',
      club:
        this.scenario === 'launching'
          ? undefined
          : isClub
            ? {
                clubWallet: true,
                clubLevel: this.acct.clubLevel,
                boost: COEFFICIENTS[this.acct.clubLevel],
                status: this.acct.state === 'grace' ? 'at_risk' : this.acct.state,
              }
            : { clubWallet: false },
      hpoSumRewards: this.scenario === 'empty' ? '0' : '12.84',
      hpoWithdrawals: [{ requestTime: now - 120 * DAY, sent: 7.3, fee: 0.5, txHash: '' }],
      earnedRewards: Array.from({ length: 10 }, (_, i) => ({
        time: now - i * ROUND - 3000,
        stakeReward: 0.2841 - i * 0.0013,
        hpoReward: 13.75,
      })),
      stakeSumRewards: '19.4417',
      stakeRewardsSince: now - 75 * DAY,
    }
  }

  // True when the preview should be logged in from the start (a scenario past state A).
  startsLoggedIn(): boolean {
    return !['A', 'A0', 'launching', 'flow2'].includes(this.scenario) || this.tgDone
  }
}

export class MockRejection extends Error {}

// A growth figure as the server bands it (clubGrowthBandOf): {from, to}, or {from: 100} at the top.
function growthBand(growth: number): { from: number; to?: number } {
  if (growth >= 100) {
    return { from: 100 }
  }
  const from = Math.floor(Math.max(growth, -100) / 5) * 5
  return { from, to: from + 5 }
}
