import { navigate } from 'astro:transitions/client'
import {
  TonConnectUI,
  THEME,
  CHAIN,
  WalletNotConnectedError,
  type Locales as TonConnectLanguage,
  type SendTransactionRequest,
  type SendTransactionResponse,
  type TonConnectUiOptions,
} from '@tonconnect/ui'
import { action, autorun, computed, makeObservable, observable, runInAction } from 'mobx'
import { Address, Dictionary, type OpenedContract, TonClient4, beginCell, fromNano, toNano } from '@ton/ton'
import {
  ParticipationState,
  type Times,
  Treasury,
  Wallet,
  Parent,
  type TreasuryConfig,
  type WalletState,
  maxAmountToStake,
  opUnstakeTokens,
  treasuryAddresses,
  feeStake,
  feeUnstake,
  createDepositMessage,
  createUnstakeMessage,
} from '@hipo-finance/sdk'
import { OldTreasury } from './OldTreasury'
import { track } from './analytics'
import { detectTmaMode, initTelegramChrome, telegramLanguageCode, tmaClass, type TmaMode } from './tma/telegram'
import { DEFAULT_LOCALE, LOCALES, isReleased } from '../../i18n/registry.mjs'
import { dirOf, langOf, localizedPath, matchLocale, stripLocale, type Locale } from '../../i18n/locale.ts'
import { makeT, type Catalog, type Params, type Translator } from '../../i18n/make-t.ts'
import * as fmt from '../../i18n/format.ts'
// The English app catalog, bundled as the compile-time fallback (spec §D); other locales arrive through
// the #i18n-app JSON tag that AppLayout inlines into the static shell.
import enApp from '../../i18n/en/app.json'

type ActivePage = 'stake' | 'reward' | 'stats' | 'defi'

type ActiveTab = 'stake' | 'unstake'

export type StatsRange = '24h' | '7d' | '30d' | '90d' | '1y'

type UnstakeOption = 'best' | 'instant'

// What `send` handed to `waitForCompletion`, so the confirmation event can name the amount and the
// kind after the fact — by then `clearAmount` has run and `unstakeOption` may have been changed.
// Absent for the old-wallet upgrade, which also waits for a transaction but is not a stake.
type PendingTx = { kind: 'stake' | 'unstake'; amountGram: number; unstakeType?: UnstakeOption }

type WaitForTransaction = 'no' | 'signed' | 'sent' | 'timeout' | 'done'

type AmountAlert = 'none' | 'stake-max' | 'unstake-max' | 'instant-unstake-max'

type WalletRewardsFetchState = 'init' | 'loading' | 'error' | 'done'

interface WalletRewards {
  clubLevel: number
  rewardCoefficients: number[]
  htonHpoRewardRate: number
  hpoSumRewards: number
  htonSumRewards: number
  stakeSumRewards?: number
  stakeRewardsSince?: Date
  htonTotalRewards?: number
  earnedRewards: EarnedReward[]
}

interface EarnedReward {
  roundSince: Date
  time: Date
  stakeReward: number
  tonReward: number
  hpoReward: number
}

// Every field is optional on purpose — a missing market figure must degrade to a placeholder,
// never reject the response and blank the holders count with it.
interface HipoGaugeMarket {
  current_price?: { usd?: number }
  market_cap?: { usd?: number }
  total_volume?: { usd?: number }
  total_supply?: number
  circulating_supply?: number
  price_change_percentage_24h?: number
}

interface HipoGaugeToken {
  holders_count?: number
  market?: HipoGaugeMarket
}

interface HipoGaugeTreasury {
  current_tvl?: number
  current_apy?: number
}

// Wire shape of https://gauge.hipo.finance/data. This is the only place the pre-rename names
// appear: the endpoint still calls GRAM `ton` and hGRAM `hton`. toHipoGauge maps them so no
// other code has to know that.
interface HipoGaugeResponse {
  treasury?: HipoGaugeTreasury
  ton?: HipoGaugeToken
  hton?: HipoGaugeToken
  hpo?: HipoGaugeToken
}

interface HipoGauge {
  treasury?: HipoGaugeTreasury
  gram?: HipoGaugeToken
  hgram?: HipoGaugeToken
  hpo?: HipoGaugeToken
}

function toHipoGauge(response: HipoGaugeResponse): HipoGauge {
  return {
    treasury: response.treasury,
    gram: response.ton,
    hgram: response.hton,
    hpo: response.hpo,
  }
}

const updateHipoGaugeDelay = 5 * 60 * 1000
const retryHipoGaugeDelay = 5 * 1000
const retryWalletRewardsDelay = 5 * 1000
const updateTimesDelay = 5 * 60 * 1000
const updateLastBlockDelay = 30 * 1000
const retryDelay = 3 * 1000

// A read that fails is retried on a fixed 1s gap, 30 times — half a minute for a hiccup to clear.
// Not to be confused with retryDelay above, which is how long a *whole* failed read waits before
// being scheduled again. Until 2026-08-25 the gap here was zero (`setTimeout(attempt)` with no
// delay), so all attempts burned within milliseconds of each other: any brief network failure
// during waitForCompletion exhausted them at once and told the user "Cannot find your transaction"
// seconds after a stake that had in fact landed on-chain.
const retryAttemptDelay = 1000
const retryAttempts = 30
const waitForCompletionDelay = 250 // roughly one block time, since TON's fast blocks
const txValidUntil = 5 * 60

// Reads go to Hipo's own v4 gateway first and fall back to the public one automatically; see
// specs/ton-v4-read-endpoint.md. CORS on the primary is production-origin-only, so a localhost dev
// browser fails over to the public endpoint on its own, with no configuration.
const primaryEndpoint = 'https://v4.hipo.finance'
const fallbackEndpoint = 'https://mainnet-v4.tonhubapi.com'

// Forces one endpoint and disables failover, for testing a single endpoint through a tunnel or a
// mock: PUBLIC_TON_V4_ENDPOINT=http://localhost:3000 npm run dev
const forcedEndpoint = import.meta.env.PUBLIC_TON_V4_ENDPOINT as string | undefined

const tonClientTimeout = 5 * 1000
const endpointFailureThreshold = 3
const endpointProbeDelay = 60 * 1000

// A desynced liteserver keeps answering 200 with an old block, which no amount of retrying fixes,
// so a stale last block counts as the endpoint being down.
const staleBlockAge = 10 * 60 * 1000

function isStaleBlock(now: number): boolean {
  return Date.now() - now * 1000 > staleBlockAge
}

// Thrown when the wallet never answers a transaction request within its validUntil window,
// which happens when the wallet has silently dropped this dapp's session (e.g. after the
// same wallet connected to Hipo from another device or browser).
class StaleSessionError extends Error {}

const averageStakeFee = 15000000n
const averageUnstakeFee = 42000000n

const treasuryAddress = treasuryAddresses.get('mainnet')

const oldTreasuryAddress = Address.parse('EQBNo5qAG8I8J6IxGaz15SfQVB-kX98YhKV_mT36Xo5vYxUa')

// multisig-contract-v2 code hashes (base64, as returned by TonClient4), computed from the
// v2.0 build artifact; the same hash is registered as the multisig interface in tonkeeper/tongo
const multisigCodeHashes = ['09FNqaYn8Ow1MzQYKXYq+SuVQLIb8DZl+sCcK0bqu6w=']

const defaultActivePage: ActivePage = 'stake'
const defaultActiveTab: ActiveTab = 'stake'
const defaultStatsRange: StatsRange = '30d'

interface Route {
  path: string
  activePage: ActivePage
  activeTab?: ActiveTab
}

// location.pathname is the single source of truth for app navigation. The island is mounted on
// these five pages only, so an unknown pathname keeps the defaults instead of guessing.
const routes: Route[] = [
  { path: '/stake/', activePage: 'stake', activeTab: 'stake' },
  { path: '/unstake/', activePage: 'stake', activeTab: 'unstake' },
  { path: '/rewards/', activePage: 'reward' },
  { path: '/stats/', activePage: 'stats' },
  { path: '/defi/', activePage: 'defi' },
]

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') + '/'
}

// Routes are matched with the locale prefix stripped (`/fa/stake/` → `/stake/`); navigateToPath adds
// the current locale back (spec §D).
function routeForPathname(pathname: string): Route | undefined {
  const path = normalizePath(stripLocale(pathname).path)
  return routes.find((route) => route.path === path)
}

// A route without an activeTab keeps whichever tab is current, so returning to the stake page
// lands on the tab the user left it on, as the old #/tab= fragment did.
function routeForState(activePage: ActivePage, activeTab: ActiveTab): Route {
  return (
    routes.find((route) => route.activePage === activePage && (route.activeTab ?? activeTab) === activeTab) ?? routes[0]
  )
}

// TonConnect's UI takes one fixed theme, so the site's `prefers-color-scheme` rule is translated
// into THEME.DARK / THEME.LIGHT here and kept in sync by Model.syncTonConnectTheme. matchMedia is
// guarded because this module is also imported in environments without it.
const tonConnectThemeQuery = () =>
  typeof window === 'undefined' || typeof window.matchMedia !== 'function'
    ? undefined
    : window.matchMedia('(prefers-color-scheme: light)')

const preferredTonConnectTheme = () => (tonConnectThemeQuery()?.matches === true ? THEME.LIGHT : THEME.DARK)

// TonConnect's own connect-button widget is no longer rendered: the header draws a custom
// button from Model state instead (see Header.tsx), driven by openModal()/disconnect(). So no
// `buttonRootId` is passed to TonConnectUI and there is no #ton-connect-button root anymore.
//
// The widget root still is rendered by the island (App.tsx) so that TonConnect's own DOM lives
// inside the persisted element. Left to itself TonConnect appends div#tc-widget-root to
// document.body, which the ClientRouter replaces wholesale on every navigation, taking the
// wallet and transaction modals with it.
const tonConnectWidgetRootId = 'ton-connect-widget-root'

// Marks <html> while the Telegram locale override rewrites its lang/dir (see Model.syncLocale and
// keepRuntimeStyles below).
const localeOverrideAttribute = 'data-locale-override'

// Same problem one level up: TonConnect injects its stylesheet into <head> at runtime (goober),
// and the ClientRouter drops every head element the incoming document does not also carry.
// Handing those styles to the incoming document keeps them, node identity included, so goober
// keeps writing to a live stylesheet.
function keepRuntimeStyles(event: Event) {
  const newDocument = (event as Event & { newDocument?: Document }).newDocument
  if (newDocument == null) {
    return
  }
  document.head.querySelectorAll('style#_goober').forEach((style) => {
    newDocument.head.appendChild(style)
  })

  // TonConnect also mounts Solid portals (notification toasts, and — when its own connect
  // button widget is rendered — the connected-address dropdown) directly under document.body,
  // outside the widget root above, so the swap would orphan them. Adopt them into the incoming
  // body, node identity intact, to keep their reactivity working.
  //
  // Since the button widget was replaced by the header's own button, the dropdown portal is not
  // expected to appear at all; the selector is kept because matching nothing costs nothing,
  // while dropping it would silently orphan the portal if TonConnect ever reintroduces one.
  // The toast selector is load-bearing and must stay: toasts still portal to document.body.
  Array.from(document.body.children).forEach((el) => {
    if (el.tagName === 'DIV' && el.querySelector('[data-tc-dropdown-container], [data-tc-list-notifications]')) {
      newDocument.body.appendChild(el)
    }
  })

  // Carry TonConnect's input-modality marker onto the incoming body so its focus-ring
  // suppression (body.tc-using-mouse) holds across the swap itself.
  if (document.body.classList.contains('tc-using-mouse')) {
    newDocument.body.classList.add('tc-using-mouse')
  }

  // Same idea for the Telegram Mini App marker, one level up: the swap copies <html>'s attributes
  // from the incoming document wholesale, so writing the class there — rather than re-adding it
  // afterwards — is what keeps the static shell hidden without a flash mid-navigation.
  if (document.documentElement.classList.contains(tmaClass)) {
    newDocument.documentElement.classList.add(tmaClass)
  }

  // And for the Telegram locale override (Model.syncLocale): while it is active the live <html lang dir>
  // differ from what the (English) static page declares, and the swap would reset them to the incoming
  // document's — one frame of Heebo and LTR before syncLocale re-applies them. Copy them across first,
  // marker included; only onto another default-locale page, since a page whose URL carries a locale
  // declares its own (correct) attributes and is not overridden.
  if (
    document.documentElement.hasAttribute(localeOverrideAttribute) &&
    localeOfLang(newDocument.documentElement.lang) === DEFAULT_LOCALE
  ) {
    newDocument.documentElement.setAttribute(localeOverrideAttribute, '')
    newDocument.documentElement.lang = document.documentElement.lang
    newDocument.documentElement.dir = document.documentElement.dir
  }

  // TonConnect's portal cleanup captured the body it originally mounted into and will call
  // removeChild on it (e.g. on disconnect) even though the portal now lives elsewhere. The old
  // body is abandoned after the swap, so make its removeChild forgiving instead of throwing.
  const oldBody = document.body
  const removeChild = oldBody.removeChild.bind(oldBody)
  oldBody.removeChild = (<T extends Node>(node: T): T => {
    try {
      return removeChild(node) as T
    } catch {
      node.parentNode?.removeChild(node)
      return node
    }
  }) as typeof oldBody.removeChild
}

// TonConnect suppresses its focus ring for mouse users by toggling 'tc-using-mouse' on the
// body (its own :focus-visible stand-in), but it binds those listeners to the body element
// that existed when it initialized — the ClientRouter replaces the body, so the tracking dies
// after the first navigation and every click paints the ring. Mirror the same toggling at the
// document level, which is never swapped. Still needed after the connect button was replaced:
// the wallet modal and the notification toasts are TonConnect's own UI and use the same rule.
function trackInputModality(event: Event) {
  if (event.type === 'mousedown') {
    document.body.classList.add('tc-using-mouse')
  } else if ((event as KeyboardEvent).key === 'Tab') {
    document.body.classList.remove('tc-using-mouse')
  }
}

// i18n (spec §D). The page locale is whatever <html lang> says — server-rendered by every layout from
// the registry, and copied onto the live document by the ClientRouter on each swap. Either the registry
// key or its BCP-47 tag matches (`pt-BR` → `pt-br`); anything else is English.
function localeOfLang(lang: string): Locale {
  lang = lang.toLowerCase()
  for (const key of Object.keys(LOCALES) as Locale[]) {
    if (key === lang || LOCALES[key].lang.toLowerCase() === lang) {
      return key
    }
  }
  return DEFAULT_LOCALE
}

// The locale the current page declares. While the Telegram override marker is set (syncLocale), the
// live lang/dir are the override's, not the page's — and the override only ever rewrites
// default-locale pages, so the declared locale is the default.
function readDocumentLocale(): Locale {
  if (typeof document === 'undefined') {
    return DEFAULT_LOCALE
  }
  if (document.documentElement.hasAttribute(localeOverrideAttribute)) {
    return DEFAULT_LOCALE
  }
  return localeOfLang(document.documentElement.lang)
}

// AppLayout inlines the locale's merged app catalog as <script type="application/json" id="i18n-app">
// (omitted for English, whose catalog is the bundled enApp). Read as text first so syncLocale can tell
// an unchanged catalog apart without re-parsing it on every swap.
const inlineCatalogId = 'i18n-app'
const emptyCatalog: Catalog = Object.freeze({})

function readInlineCatalogText(): string {
  if (typeof document === 'undefined') {
    return ''
  }
  return document.getElementById(inlineCatalogId)?.textContent ?? ''
}

function parseCatalog(text: string): Catalog {
  if (text.trim() === '') {
    return emptyCatalog
  }
  try {
    const parsed: unknown = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? (parsed as Catalog) : emptyCatalog
  } catch {
    return emptyCatalog
  }
}

// TonConnect's UI speaks 'en' and 'ru' only; the registry's `tonconnect` column picks one per locale.
function tonConnectLanguage(locale: Locale): TonConnectLanguage {
  return LOCALES[locale].tonconnect === 'ru' ? 'ru' : 'en'
}

// Passed both at construction and with every language change: TonConnect's `uiOptions` setter merges
// `language` into its state but assigns `actionsConfiguration` wholesale (see `set uiOptions` in
// @tonconnect/ui), so leaving it out there would drop the Telegram return URL.
const tonConnectActionsConfiguration: NonNullable<TonConnectUiOptions['actionsConfiguration']> = {
  twaReturnUrl: 'https://t.me/HipoFinanceBot',
}

// What parseNumberInput emits and toNano may see: digits, at most one '.', digits ("12", "12.", "0.5").
const canonicalAmount = /^[0-9]+(\.[0-9]*)?$/

export class Model {
  initialized = false
  loading = false

  // observed state
  tonClient?: TonClient4
  address?: Address
  tonBalance?: bigint
  treasury?: OpenedContract<Treasury>
  treasuryState?: TreasuryConfig
  maxBurnableTokens?: bigint
  times?: Times
  walletAddress?: Address
  wallet?: OpenedContract<Wallet>
  walletState?: WalletState
  oldWalletAddress?: Address
  oldWalletTokens?: bigint
  newWalletTokens?: bigint
  activePage: ActivePage = defaultActivePage
  activeTab: ActiveTab = defaultActiveTab
  statsRange: StatsRange = defaultStatsRange
  // The amount input (spec §E). `amountRaw` is the text exactly as typed — the controlled input's value —
  // `amount` its canonical ASCII reading ("1234.5"; '' when the field is empty or unparseable) and
  // `amountInvalid` whether non-empty text failed to parse. Only setAmountToMax and a locale switch
  // rewrite amountRaw (from `amount`, via formatInput): rewriting it on every keystroke would turn a
  // half-typed thousands group into a decimal — see setAmount.
  amountRaw = ''
  amount = ''
  amountInvalid = false
  unstakeOption: UnstakeOption = 'best'

  // The connected wallet's app name ('tonkeeper', 'mytonwallet', …) for the analytics events.
  // Deliberately not observable: no UI reads it, and making it so would re-render on connect.
  connectedWalletName?: string
  waitForTransaction: WaitForTransaction = 'no'
  amountAlert: AmountAlert = 'none'
  ongoingRequests = 0
  errorMessage = ''
  isMultisig = false
  showMultisigGuidance = false
  multisigHint = false
  holdersCount?: number
  gauge?: HipoGauge
  isGaugeRefreshing = false
  walletRewardsFetchState: WalletRewardsFetchState = 'init'
  walletRewards?: WalletRewards

  // i18n: the page locale and the inlined catalog for it (spec §D). Read at construction so the very
  // first render is already in the page's language, and re-read by syncLocale on every swap.
  locale: Locale = readDocumentLocale()
  catalogText = readInlineCatalogText()
  catalog: Catalog = parseCatalog(this.catalogText)

  // unobserved state
  // Telegram Mini App locale override (spec §D): the user's Telegram language and its catalog, set
  // once by applyTelegramLocale and applied by syncLocale whenever the URL carries no locale of its
  // own. Unobserved — only `locale`/`catalog` above render.
  telegramLocale?: Locale
  telegramCatalogText = ''
  tonConnectUI?: TonConnectUI
  lastBlock = 0
  // Endpoint state is deliberately not observable — nothing renders it — and in-memory only, so a
  // fresh page load always starts on the primary.
  tonEndpoint = ''
  tonEndpointFailures = 0
  timeoutEndpointProbe?: ReturnType<typeof setTimeout>
  timeoutReadTimes?: ReturnType<typeof setTimeout>
  timeoutReadLastBlock?: ReturnType<typeof setTimeout>
  timeoutErrorMessage?: ReturnType<typeof setTimeout>
  timeoutHipoGauge?: ReturnType<typeof setTimeout>
  timeoutMultisigHint?: ReturnType<typeof setTimeout>
  timeoutWalletRewards?: ReturnType<typeof setTimeout>

  // Telegram Mini App chrome. Detected synchronously here — the Model is constructed during the
  // island's first render — so the compact chrome is what gets painted inside Telegram, and the
  // desktop chrome is never rendered there at all. See tma/telegram.ts for the two detection
  // tiers; `isTelegram` is observable only so a tier-2 disagreement can revoke it.
  readonly tmaMode: TmaMode = detectTmaMode()
  isTelegram = this.tmaMode !== 'off'

  readonly dedustSwapUrl = 'https://dedust.io/swap/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w/TON'
  readonly dedustPoolUrl = 'https://dedust.io/pools/EQBWsAdyAg-8fs3G-m-eUBCXZuVaOldF5-tCMJBJzxQG7nLX'
  readonly stonSwapUrl =
    'https://app.ston.fi/swap?chartVisible=false&ft=EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w&tt=EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'
  readonly stonPoolUrl = 'https://app.ston.fi/pools/EQDjmQDt12Ys1-gyKZskDSIDAVQaciI3cIUpk46LCWtnKpGF'
  readonly toncoSwapUrl = 'https://app.tonco.io/#/swap?from=EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w&to=TON'
  readonly toncoPoolUrl = 'https://app.tonco.io/#/pool/EQCNtxsO6JYljVLkcJVt7hZZhkC50kMIFAZklE4zBby31RAR'
  readonly groypfiSwapUrl = 'https://groypfi.io/swap/ton/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w'
  readonly swapCoffeeSwapUrl = 'https://swap.coffee/dex?ft=GRAM&st=EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w'
  readonly tonspaceUrl = 'https://t.me/wallet?startattach'
  readonly mtwUrl = 'https://mytonwallet.io/get'
  readonly evaaLoanUrl = 'https://app.evaa.finance/'

  constructor() {
    makeObservable(this, {
      tonClient: observable,
      address: observable,
      tonBalance: observable,
      treasury: observable,
      treasuryState: observable,
      maxBurnableTokens: observable,
      times: observable,
      walletAddress: observable,
      wallet: observable,
      walletState: observable,
      oldWalletAddress: observable,
      oldWalletTokens: observable,
      newWalletTokens: observable,
      activePage: observable,
      activeTab: observable,
      amountRaw: observable,
      amount: observable,
      amountInvalid: observable,
      unstakeOption: observable,
      waitForTransaction: observable,
      amountAlert: observable,
      ongoingRequests: observable,
      errorMessage: observable,
      isMultisig: observable,
      showMultisigGuidance: observable,
      multisigHint: observable,
      holdersCount: observable,
      gauge: observable,
      isGaugeRefreshing: observable,
      walletRewardsFetchState: observable,
      walletRewards: observable,
      statsRange: observable,
      isTelegram: observable,
      locale: observable,
      catalog: observable.ref,

      translator: computed({ keepAlive: true }),
      isWalletConnected: computed,
      isStakeTabActive: computed,
      tonBalanceFormatted: computed,
      htonBalance: computed,
      htonBalanceFormatted: computed,
      maxBurnableTokensFormatted: computed,
      unstakeMoreThanInstantBurnable: computed,
      htonBalanceInTon: computed,
      htonBalanceInTonAfterOneYear: computed,
      roundsPerYear: computed,
      profitAfterOneYear: computed,
      profitAfterOneYearOnLastLevel: computed,
      oldWalletTokensFormatted: computed,
      newWalletTokensFormatted: computed,
      unstakingInProgressFormatted: computed,
      unstakingInProgressDetails: computed,
      stakingInProgressFormatted: computed,
      stakingInProgressDetails: computed,
      maxAmount: computed,
      amountInNano: computed,
      isAmountValid: computed,
      isAmountPositive: computed,
      isButtonEnabled: computed,
      buttonLabel: computed,
      swapUrl: computed,
      youWillReceive: computed,
      youWillReceiveAmount: computed,
      youWillReceiveToken: computed,
      exchangeRate: computed,
      exchangeRateFormatted: computed,
      averageStakeFeeFormatted: computed,
      averageUnstakeFeeFormatted: computed,
      unstakeBestRemain: computed,
      stakeRemain: computed,
      explorerHref: computed,
      treasuryAddressFormatted: computed,
      connectedAddressShort: computed,
      multisigComment: computed,
      multisigTransferAmount: computed,
      multisigTransferAmountFormatted: computed,
      activePath: computed,
      multisigDeepLink: computed,
      apy: computed,
      apyFormatted: computed,
      protocolFee: computed,
      currentlyStaked: computed,
      holdersCountFormatted: computed,
      claimableRewardsFormatted: computed,
      totalEarnedFormatted: computed,
      totalHpoEarnedFormatted: computed,
      totalEarnedSinceFormatted: computed,

      useGauge: computed,
      statsApyFormatted: computed,
      statsStakedFormatted: computed,
      statsHoldersFormatted: computed,
      statsStakedCompact: computed,
      statsStakedExact: computed,
      statsTvlUsdFormatted: computed,
      statsRateFormatted: computed,
      hgramStats: computed,
      hpoStats: computed,
      gramStats: computed,

      setTonClient: action,
      setAddress: action,
      setTimes: action,
      setActivePage: action,
      setActiveTab: action,
      applyPathState: action,
      setUnstakeOption: action,
      setAmount: action,
      setAmountToMax: action,
      clearAmount: action,
      relocalizeAmount: action,
      setWaitForTransaction: action,
      setAmountAlert: action,
      beginRequest: action,
      endRequest: action,
      setErrorMessage: action,
      openMultisigGuidance: action,
      closeMultisigGuidance: action,
      showMultisigHint: action,
      hideMultisigHint: action,
      setWalletRewardsFetchState: action,
      loadWalletRewards: action,
      setStatsRange: action,
      setTelegram: action,
      syncLocale: action,
    })
  }

  // ----------------------------------------------------------------------------------------------
  // i18n API for the views (spec §D/§E). Every method reads this.locale, so observers re-render on a
  // locale change for free.

  // Memoised per (locale, catalog): both are observables, so MobX recomputes exactly when either moves.
  get translator(): Translator {
    return makeT(this.locale, this.catalog, enApp)
  }

  t = (key: string, params?: Params): string => {
    return this.translator.t(key, params)
  }

  // `/stake/` → `/fa/stake/` for the current locale (English unprefixed); external URLs unchanged.
  localizedPath = (path: string): string => {
    return localizedPath(path, this.locale)
  }

  formatNumber = (value: number, opts?: Intl.NumberFormatOptions): string => {
    return fmt.formatNumber(this.locale, value, opts)
  }

  formatNano = (nano: bigint | number, digits = 2): string => {
    return fmt.formatNano(this.locale, nano, digits)
  }

  formatPercent = (ratio: number, digits = 2): string => {
    return fmt.formatPercent(this.locale, ratio, digits)
  }

  formatSignedPercent = (ratio: number): string => {
    return fmt.formatSignedPercent(this.locale, ratio)
  }

  formatCompact = (value: number, digits = 1): string => {
    return fmt.formatCompact(this.locale, value, digits)
  }

  formatUsd = (value: number, opts?: Intl.NumberFormatOptions): string => {
    return fmt.formatUsd(this.locale, value, opts)
  }

  // HPO trades around $0.002, so a fixed 2-decimal price would render it as $0.00: significant digits
  // below a dollar, up to 2 decimals (no padding — "$3", "$1,234.5") above. The charts on StatsPage
  // format prices through this too.
  formatUsdPrice = (value: number): string => {
    if (value < 1) {
      return this.formatUsd(value, { maximumSignificantDigits: 4 })
    }
    return this.formatUsd(value, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  // "$1.2M" — market caps, volumes, TVL.
  formatUsdCompact = (value: number): string => {
    return this.formatUsd(value, { notation: 'compact', maximumFractionDigits: 1 })
  }

  formatRate = (value: number): string => {
    return fmt.formatRate(this.locale, value)
  }

  formatDate = (date: Date | number, opts: Intl.DateTimeFormatOptions): string => {
    return fmt.formatDate(this.locale, date, opts)
  }

  // "3h 20m" from the catalog templates app.format.duration.*; "0m" for nothing left.
  formatDuration = (seconds: number): string => {
    return fmt.formatDuration(this.translator, seconds)
  }

  // ASCII "1234.5" → the locale's digits and decimal symbol (what the amount input displays).
  formatInput = (ascii: string): string => {
    return fmt.formatInput(this.locale, ascii)
  }

  // Anything the user may type in this locale → ASCII "1234.5", or undefined when it is not a number.
  parseNumberInput = (raw: string): string | undefined => {
    return fmt.parseNumberInput(this.locale, raw)
  }

  // Bidi isolation (FSI … PDI) for values interpolated into Model-composed strings (spec §F), so
  // `≈ ۱٬۲۳۴٫۵ GRAM` keeps its reading order inside RTL text. Applied for RTL locales only: LTR text
  // needs none, and English output stays byte-identical to before.
  isolate = (s: string): string => {
    return dirOf(this.locale) === 'rtl' ? fmt.isolate(s) : s
  }

  // "{amount} GRAM" and friends: the unit templates live in the catalog (app.model.gram/hgram/hpo) so
  // translators control spacing and order; the amount is isolated for RTL.
  withUnit = (key: string, amount: string): string => {
    return this.t(key, { amount: this.isolate(amount) })
  }

  // Seconds left until an on-chain `stakeHeldUntil`, as "3h 20m"; undefined once under a minute
  // remains — exactly when the old formatRemain returned '' and its callers hid the label.
  remainUntil = (time: bigint): string | undefined => {
    const diff = Number(time) - Math.floor(Date.now() / 1000)
    return diff < 60 ? undefined : this.formatDuration(diff)
  }

  // Re-reads locale and catalog from the document: in init() and on astro:after-swap — before paint,
  // where astro:page-load would show one frame in the old language. The catalog is replaced only when
  // its JSON text actually changed, so English-to-English swaps leave every observer alone.
  //
  // An explicit URL locale always wins: the Telegram override below only fills in when the document
  // is unprefixed English, so a /fa/stake/ deep link inside the mini app still shows Farsi, and a
  // later swap back to an unprefixed page restores the Telegram language.
  //
  // When the override is in effect the document's own <html lang dir> (English, LTR) are wrong for
  // what the island renders — the per-script font faces in i18n-fonts.css key off html[lang], and the
  // logical/`rtl:` utilities off dir — so they are rewritten here, and marked so keepRuntimeStyles
  // carries them over the next swap. Pages whose URL carries the locale already declare the right
  // attributes and are left alone.
  syncLocale = () => {
    const documentLocale = readDocumentLocale()
    let locale = documentLocale
    let text = readInlineCatalogText()
    if (locale === DEFAULT_LOCALE && this.telegramLocale != null) {
      locale = this.telegramLocale
      text = this.telegramCatalogText
    }
    if (locale !== this.locale) {
      this.locale = locale
      this.applyTonConnectLanguage()
      this.relocalizeAmount()
    }
    if (text !== this.catalogText) {
      this.catalogText = text
      this.catalog = parseCatalog(text)
    }
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      if (locale !== documentLocale) {
        html.setAttribute(localeOverrideAttribute, '')
        html.lang = langOf(locale)
        html.dir = dirOf(locale)
      } else if (html.hasAttribute(localeOverrideAttribute)) {
        // Not reachable today (the override, once set, is never lifted), kept so the marker can never
        // outlive the override: restore the page's own attributes.
        html.removeAttribute(localeOverrideAttribute)
        html.lang = langOf(locale)
        html.dir = dirOf(locale)
      }
    }
  }

  // The amount field after a locale switch: valid text is re-rendered from the canonical value in the
  // new locale's digits and decimal symbol; unparseable text is left as typed (nothing canonical to
  // render it from) but re-read under the new rules, so amountInvalid matches the new locale. While
  // the field has focus (the async Telegram override can land mid-typing) the text is never rewritten —
  // a controlled-input value change would jump the caret — only re-read.
  relocalizeAmount = () => {
    const focused = typeof document !== 'undefined' && document.activeElement?.id === 'amount'
    if (this.amountInvalid || focused) {
      this.setAmount(this.amountRaw)
    } else {
      this.amountRaw = this.formatInput(this.amount)
    }
  }

  // Telegram Mini App locale override (spec §D, phase 5). The mini app's URL is fixed by BotFather
  // and never carries a locale, so inside a confirmed Telegram webview the user's Telegram language
  // (`initDataUnsafe.user.language_code`) picks the locale instead — without navigating, because
  // the static shell is hidden there anyway. Gated three times: only after initTelegramChrome
  // confirmed a real webview (telegramLanguageCode returns nothing otherwise, so this never runs on
  // the public web or in the ?tma=1 preview); only when the current URL is unprefixed (an explicit
  // locale in the URL wins); only for a released registry locale, whose catalog exists as the
  // static /i18n/<locale>.json (src/pages/i18n/[locale].json.ts). Any failure — unknown language,
  // fetch error, malformed JSON — leaves the island in English.
  applyTelegramLocale = async () => {
    if (stripLocale(window.location.pathname).locale !== DEFAULT_LOCALE) {
      return
    }
    const code = await telegramLanguageCode(this.tmaMode)
    if (code == null) {
      return
    }
    const candidates = (Object.keys(LOCALES) as Locale[]).filter((key) => isReleased(key))
    const locale = matchLocale(code, candidates)
    if (locale == null || locale === DEFAULT_LOCALE) {
      return
    }
    let text: string
    try {
      const response = await fetch('/i18n/' + locale + '.json')
      if (!response.ok) {
        return
      }
      text = await response.text()
    } catch (e) {
      console.warn('[hipo] app catalog for Telegram language "' + code + '" failed to load', e)
      return
    }
    if (parseCatalog(text) === emptyCatalog) {
      return
    }
    runInAction(() => {
      this.telegramLocale = locale
      this.telegramCatalogText = text
      this.syncLocale()
    })
  }

  applyTonConnectLanguage = () => {
    if (this.tonConnectUI != null) {
      this.tonConnectUI.uiOptions = {
        language: tonConnectLanguage(this.locale),
        actionsConfiguration: tonConnectActionsConfiguration,
      }
    }
  }

  // ----------------------------------------------------------------------------------------------

  init() {
    if (this.initialized) {
      return
    }

    document.onvisibilitychange = this.controlBackgroundJobs
    this.controlBackgroundJobs()

    // The ClientRouter fires astro:page-load for the initial load, for every in-app navigation,
    // and for browser back/forward, so this one listener covers all three. Adding the same
    // function twice is a no-op, and init() itself runs only once per Model.
    document.addEventListener('astro:page-load', this.applyPathState)
    document.addEventListener('astro:before-swap', keepRuntimeStyles)
    document.addEventListener('astro:after-swap', this.syncLocale)
    document.addEventListener('mousedown', trackInputModality)
    document.addEventListener('keydown', trackInputModality)
    this.syncLocale()
    this.applyPathState()

    if (this.isTelegram) {
      void initTelegramChrome(this.tmaMode).then((confirmed) => {
        if (!confirmed) {
          this.setTelegram(false)
          return
        }
        void this.applyTelegramLocale()
      })
    }

    this.initTonConnect()
    this.loadHipoGauge()

    autorun(() => {
      this.connectTonEndpoint()
    })

    autorun(() => {
      this.readTimes()
    })

    autorun(() => {
      void this.readLastBlock()
    })

    autorun(() => {
      const walletAddress = this.walletAddress
      const activePage = this.activePage
      const walletRewardsFetchState = this.walletRewardsFetchState
      if (walletAddress == null || activePage !== 'reward' || walletRewardsFetchState !== 'init') {
        return
      }
      this.loadWalletRewards()
    })

    this.initialized = true
  }

  get isWalletConnected() {
    return this.address != null
  }

  get isStakeTabActive() {
    return this.activeTab === 'stake'
  }

  get tonBalanceFormatted() {
    if (this.tonBalance != null) {
      return this.withUnit('app.model.gram', this.formatNano(this.tonBalance))
    }
  }

  get htonBalance() {
    return this.walletState?.tokens ?? 0n
  }

  get htonBalanceFormatted() {
    if (this.tonBalance != null) {
      return this.withUnit('app.model.hgram', this.formatNano(this.walletState?.tokens ?? 0n))
    }
  }

  get maxBurnableTokensFormatted() {
    if (this.maxBurnableTokens != null) {
      return this.t('app.model.maxInstant', {
        amount: this.isolate(this.formatNano(Math.max(0, Number(this.maxBurnableTokens ?? 0n)))),
      })
    }
  }

  get unstakeMoreThanInstantBurnable() {
    const amountInNano = this.amountInNano
    const maxBurnableTokens = this.maxBurnableTokens
    return amountInNano != null && maxBurnableTokens != null && amountInNano > maxBurnableTokens
  }

  get htonBalanceInTon() {
    const state = this.treasuryState
    if (state != null && this.walletState != null) {
      const rate = Number(state.totalCoins) / Number(state.totalTokens) || 1
      const balance = Number(this.walletState.tokens ?? 0n) * rate
      return this.withUnit('app.model.approxGram', this.formatNano(balance))
    }
  }

  get htonBalanceInTonAfterOneYear() {
    const apy = this.apy
    const state = this.treasuryState
    if (apy != null && state != null && this.walletState != null) {
      const rate = Number(state.totalCoins) / Number(state.totalTokens) || 1
      const balance = Number(this.walletState.tokens ?? 0n) * rate * (1 + apy)
      return this.withUnit('app.model.approxGram', this.formatNano(balance))
    }
  }

  // The HPO reward is paid once per validation round, so a year's worth of rewards is
  // however many rounds fit in a year. The round length is a network parameter that has
  // changed before (it used to be ~36h, it is ~18h now), so read it from the live round
  // boundaries instead of hardcoding a count, and fall back to the current length until
  // the times are fetched.
  get roundsPerYear() {
    const year = 365 * 24 * 60 * 60
    const times = this.times
    const duration = times != null ? Number(times.nextRoundSince - times.currentRoundSince) : 0
    return duration > 0 ? year / duration : year / 65536
  }

  get profitAfterOneYear() {
    const apy = this.apy
    const state = this.treasuryState
    if (apy == null || state == null || this.walletState == null) {
      return
    }

    const exchangeRate = Number(state.totalCoins) / Number(state.totalTokens) || 1
    const rewardRate = this.walletRewards?.htonHpoRewardRate ?? 0
    const clubLevel = this.walletRewards?.clubLevel ?? 0
    const rewardCoefficients = this.walletRewards?.rewardCoefficients ?? [1]
    const rewardCoefficient = rewardCoefficients[clubLevel] ?? 0

    const hton = Number(this.walletState.tokens ?? 0n)
    const ton = hton * exchangeRate * apy
    const hpo = hton * exchangeRate * rewardRate * rewardCoefficient * this.roundsPerYear

    if (hpo > 0.01) {
      return this.t('app.model.gramPlusHpo', {
        gram: this.isolate(this.formatNano(ton)),
        hpo: this.isolate(this.formatNano(hpo)),
      })
    } else {
      return this.withUnit('app.model.gram', this.formatNano(ton))
    }
  }

  get profitAfterOneYearOnLastLevel() {
    const state = this.treasuryState
    if (state == null || this.walletState == null) {
      return
    }

    const exchangeRate = Number(state.totalCoins) / Number(state.totalTokens) || 1
    const rewardRate = this.walletRewards?.htonHpoRewardRate ?? 0
    const rewardCoefficients = this.walletRewards?.rewardCoefficients ?? [1]
    const rewardCoefficient = rewardCoefficients[rewardCoefficients.length - 1]

    const hton = Number(this.walletState.tokens ?? 0n)
    const hpo = hton * exchangeRate * rewardRate * rewardCoefficient * this.roundsPerYear

    return this.withUnit('app.model.hpo', this.formatNano(hpo))
  }

  get oldWalletTokensFormatted() {
    if (this.oldWalletTokens != null) {
      return this.withUnit('app.model.hgram', this.formatNano(this.oldWalletTokens))
    }
  }

  get newWalletTokensFormatted() {
    if (this.newWalletTokens != null) {
      return this.withUnit('app.model.hgram', this.formatNano(this.newWalletTokens))
    }
  }

  get unstakingInProgressFormatted() {
    return this.withUnit('app.model.hgram', this.formatNano(this.walletState?.unstaking ?? 0n))
  }

  get unstakingInProgressDetails() {
    const value = this.walletState?.unstaking
    if (value == null || value === 0n || this.treasuryState == null) {
      return
    }
    let time = undefined
    const firstParticipationKey = this.treasuryState.participations.keys()[0] ?? 0n
    const firstParticipationValue = this.treasuryState.participations.get(firstParticipationKey)
    if ((firstParticipationValue?.state ?? ParticipationState.Open) >= ParticipationState.Staked) {
      time = firstParticipationValue?.stakeHeldUntil
    }
    return {
      amount: this.withUnit('app.model.hgram', this.formatNano(value)),
      estimated: time == null ? undefined : this.remainUntil(time),
    }
  }

  get stakingInProgressFormatted() {
    let result = 0n
    const empty = Dictionary.empty(Dictionary.Keys.BigUint(32), Dictionary.Values.BigVarUint(4))
    const staking = this.walletState?.staking ?? empty
    const times = staking.keys()
    for (const time of times) {
      const value = staking.get(time)
      if (value != null) {
        result += value
      }
    }
    return this.withUnit('app.model.gram', this.formatNano(result))
  }

  get stakingInProgressDetails() {
    const result = []
    const empty = Dictionary.empty(Dictionary.Keys.BigUint(32), Dictionary.Values.BigVarUint(4))
    const staking = this.walletState?.staking ?? empty
    const times = staking.keys()
    for (const time of times) {
      const value = staking.get(time)
      if (value != null) {
        const until = this.treasuryState?.participations.get(time)?.stakeHeldUntil ?? 0n
        result.push({
          amount: this.withUnit('app.model.gram', this.formatNano(value)),
          estimated: until === 0n ? undefined : this.remainUntil(until),
        })
      }
    }
    return result
  }

  get maxAmount() {
    const isStakeTabActive = this.isStakeTabActive
    const tonBalance = this.tonBalance
    const walletState = this.walletState
    if (isStakeTabActive) {
      // reserve enough GRAM for user's ton wallet storage fee + enough funds for future unstake
      return maxAmountToStake(tonBalance ?? 0n)
    } else {
      return walletState?.tokens ?? 0n
    }
  }

  // `amount` is canonical ASCII ("1234.5") whenever the typed text parsed — see setAmount — so toNano gets
  // exactly what it accepts; text that did not parse (amountInvalid) is undefined, i.e. not sendable.
  // Only the canonical shape is let through: toNano itself would also take "0x10" or "-1". The string
  // is deliberately NOT re-parsed through parseNumberInput here — ASCII "1.500" would read as a German
  // thousands group. Empty stays 0n, which is what toNano('') always returned.
  get amountInNano() {
    if (this.amountInvalid) {
      return undefined
    }
    const amount = this.amount.trim()
    if (amount === '') {
      return 0n
    }
    if (!canonicalAmount.test(amount)) {
      return undefined
    }
    try {
      return toNano(amount)
    } catch {
      return undefined
    }
  }

  get isAmountValid() {
    const nano = this.amountInNano
    return nano != null && nano >= 0n && (this.tonBalance == null || nano <= this.maxAmount)
  }

  get isAmountPositive() {
    const nano = this.amountInNano
    return nano != null && nano > 0n
  }

  get isButtonEnabled() {
    return !this.isWalletConnected || this.isAmountPositive
  }

  get buttonLabel() {
    if (this.isWalletConnected) {
      if (this.isStakeTabActive) {
        return this.t('app.model.buttonStake')
      } else {
        return this.t('app.model.buttonUnstake')
      }
    } else {
      return this.t('app.model.buttonConnect')
    }
  }

  get swapUrl() {
    let url = 'https://groypfi.io/swap/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w/ton'
    if (this.isAmountValid && this.isAmountPositive) {
      url += '?amount=' + this.amount
    }
    return url
  }

  // Undefined until the exchange rate is known, and an empty string while there is no valid
  // positive amount to convert — the mini app renders that case as a plain 0, the desktop form as
  // the bare token name (see youWillReceive).
  get youWillReceiveAmount() {
    const rate = this.exchangeRate
    const nano = this.amountInNano
    if (rate == null) {
      return
    } else if (nano == null || !this.isAmountValid || !this.isAmountPositive) {
      return ''
    } else {
      return this.formatNano(Number(nano) * rate)
    }
  }

  get youWillReceiveToken() {
    return this.isStakeTabActive ? 'hGRAM' : 'GRAM'
  }

  get youWillReceive() {
    const amount = this.youWillReceiveAmount
    if (amount == null) {
      return
    }
    return amount === ''
      ? this.youWillReceiveToken
      : this.t('app.model.youWillReceive', { amount: this.isolate(amount), token: this.youWillReceiveToken })
  }

  get exchangeRate() {
    const state = this.treasuryState
    if (state != null) {
      if (this.isStakeTabActive) {
        return Number(state.totalTokens) / Number(state.totalCoins) || 1
      } else {
        return Number(state.totalCoins) / Number(state.totalTokens) || 1
      }
    }
  }

  get exchangeRateFormatted() {
    const state = this.treasuryState
    if (state != null) {
      const rate = (Number(state.totalCoins) / Number(state.totalTokens)) * 1000000000 || 1
      return this.t('app.model.rate', { rate: this.isolate(this.formatNano(rate, 4)) })
    }
  }

  get averageStakeFeeFormatted() {
    if (this.treasuryState != null) {
      return this.withUnit('app.model.gram', this.formatNano(averageStakeFee, 3))
    }
  }

  get averageUnstakeFeeFormatted() {
    if (this.treasuryState != null) {
      return this.withUnit('app.model.gram', this.formatNano(averageUnstakeFee, 3))
    }
  }

  get unstakeBestRemain() {
    const times = this.times
    const participations = this.treasuryState?.participations
    if (times != null && participations != null) {
      const keys = participations.keys().sort()
      const remain = this.remainUntil(participations.get(keys[0] ?? 0n)?.stakeHeldUntil ?? 0n)
      if (remain != null) {
        return this.t('app.model.receiveGramIn', { remain: this.isolate(remain) })
      }
    }
  }

  get stakeRemain() {
    const times = this.times
    const participations = this.treasuryState?.participations
    const instantMint = this.treasuryState?.instantMint ?? true
    if (times != null && participations != null && !instantMint) {
      const keys = participations.keys().sort()
      keys.reverse()
      for (const key of keys) {
        const participation = participations.get(key)
        const state = participation?.state
        if (
          participation?.stakeHeldUntil != null &&
          state != null &&
          state > ParticipationState.Open &&
          state < ParticipationState.Burning
        ) {
          const remain = this.remainUntil(participation.stakeHeldUntil)
          if (remain != null) {
            return this.t('app.model.receiveHgramIn', { remain: this.isolate(remain) })
          }
        }
      }
    }
  }

  get explorerHref() {
    return 'https://tonviewer.com/' + this.treasuryAddressFormatted
  }

  get treasuryAddressFormatted() {
    return treasuryAddress?.toString() ?? ''
  }

  get multisigComment() {
    return this.isStakeTabActive ? 'd' : 'w'
  }

  get multisigTransferAmount() {
    if (this.isStakeTabActive) {
      if (this.isAmountValid && this.isAmountPositive && this.amountInNano != null) {
        return this.amountInNano + feeStake
      }
      return undefined
    }
    return feeUnstake
  }

  // ASCII digits on purpose: the user retypes this into a multisig UI that takes nothing else.
  get multisigTransferAmountFormatted() {
    const amount = this.multisigTransferAmount
    if (amount != null) {
      return this.withUnit('app.model.gram', fmt.formatAsciiNano(amount))
    }
  }

  get connectedAddressShort() {
    const address = this.address
    if (address == null) {
      return ''
    }
    // Unbounceable (UQ…), the customary form for wallet addresses.
    const friendly = address.toString({ bounceable: false })
    return friendly.slice(0, 4) + '…' + friendly.slice(-4)
  }

  get multisigDeepLink() {
    const address = this.treasuryAddressFormatted
    if (address === '') {
      return undefined
    }
    let link = 'ton://transfer/' + address + '?text=' + this.multisigComment
    const amount = this.multisigTransferAmount
    if (amount != null) {
      link = 'ton://transfer/' + address + '?amount=' + amount.toString() + '&text=' + this.multisigComment
    }
    return link
  }

  get apy() {
    const times = this.times
    const previousRate = this.treasuryState?.previousRate
    const currentRate = this.treasuryState?.currentRate
    if (times != null && previousRate != null && currentRate != null) {
      const duration = Number(times.nextRoundSince - times.currentRoundSince)
      const year = 365 * 24 * 60 * 60
      const compoundingFrequency = year / duration
      const growth = Number(currentRate) / Number(previousRate)
      const apy = Math.pow(growth, compoundingFrequency) - 1
      return apy
    }
  }

  get apyFormatted() {
    if (this.apy != null) {
      return this.formatPercent(this.apy)
    }
  }

  get protocolFee() {
    const governanceFee = this.treasuryState?.governanceFee
    if (governanceFee != null) {
      return this.formatPercent(Number(governanceFee) / 65535)
    }
  }

  get currentlyStaked() {
    if (this.treasuryState != null) {
      return this.withUnit(
        'app.model.gram',
        this.formatNumber(Number(this.treasuryState.totalCoins) / 1000000000, { maximumFractionDigits: 0 }),
      )
    }
  }

  get holdersCountFormatted() {
    if (this.holdersCount != null) {
      return this.formatCompact(this.holdersCount)
    } else {
      return '—'
    }
  }

  // Fall back to the contract whenever the gauge has not answered yet. `gauge` is never cleared
  // on failure, so a failed refresh keeps the last good values rather than flipping the panel
  // mid-session.
  get useGauge() {
    return this.gauge != null
  }

  // The stats getters below prefer the on-chain treasury state and fall back to the gauge, not
  // the other way around: the gauge lags the chain, and the displayed figure should be the
  // contract's. The gauge still fills the first paint (it answers before the block poller has
  // read the treasury), then the on-chain value takes over when it arrives.
  get statsApyFormatted() {
    if (this.apyFormatted != null) {
      return this.apyFormatted
    }
    const apy = this.gauge?.treasury?.current_apy
    if (this.useGauge && apy != null) {
      return this.formatPercent(apy / 100)
    }
  }

  get statsStakedFormatted() {
    if (this.currentlyStaked != null) {
      return this.currentlyStaked
    }
    const tvl = this.gauge?.treasury?.current_tvl
    if (this.useGauge && tvl != null) {
      return this.withUnit('app.model.gram', this.formatNano(tvl, 0))
    }
  }

  // Holders has no contract equivalent — the treasury has no getter for it — so unlike APY and
  // Staked it cannot fall back; it degrades to a dash until the gauge answers.
  get statsHoldersFormatted() {
    const holders = this.useGauge ? this.gauge?.hgram?.holders_count : undefined
    return holders != null ? this.formatCompact(holders) : '—'
  }

  // Same figure as statsStakedFormatted, abbreviated for the Stats page's headline card
  // ("1.54M" rather than "1,540,000 GRAM"), with the unit carried by the card's label.
  get statsStakedCompact() {
    if (this.treasuryState != null) {
      return this.formatCompact(Number(this.treasuryState.totalCoins) / 1000000000)
    }
    const tvl = this.gauge?.treasury?.current_tvl
    if (this.useGauge && tvl != null) {
      return this.formatCompact(tvl / 1000000000)
    }
  }

  // The same figure to the full GRAM ("8,285,160"), shown as selectable text on the staked card —
  // the team copies the exact number from here when talking to the community. Formatted for the
  // page locale like every other number (spec §E); the team reads the English site.
  get statsStakedExact() {
    if (this.treasuryState != null) {
      return this.formatNumber(Number(this.treasuryState.totalCoins) / 1000000000, { maximumFractionDigits: 0 })
    }
    const tvl = this.gauge?.treasury?.current_tvl
    if (this.useGauge && tvl != null) {
      return this.formatNumber(tvl / 1000000000, { maximumFractionDigits: 0 })
    }
  }

  // TVL in dollars: staked GRAM priced at the gauge's GRAM quote. The GRAM amount prefers the
  // on-chain treasury state like the getters above; the price can only come from the gauge, so
  // this stays undefined (and the label omits it) until the gauge has answered.
  get statsTvlUsdFormatted() {
    const price = this.gauge?.gram?.market?.current_price?.usd
    if (!this.useGauge || price == null) {
      return undefined
    }
    if (this.treasuryState != null) {
      return this.formatUsdCompact((Number(this.treasuryState.totalCoins) / 1000000000) * price)
    }
    const tvl = this.gauge?.treasury?.current_tvl
    if (tvl != null) {
      return this.formatUsdCompact((tvl / 1000000000) * price)
    }
  }

  // The protocol rate — how much GRAM one hGRAM redeems for — straight from treasury state, the
  // same source as the stake form's "Exchange rate" row.
  //
  // It is deliberately NOT the ratio of the gauge's two USD quotes, which this used to prefer: that
  // ratio is a market price, it trades below 1 (it read 0.9627 on the live card), and it flatly
  // contradicts both the real rate and the card's "only goes up" caption. There is no fallback on
  // purpose — until the block poller has read the treasury this is undefined, and the card renders
  // a dash rather than a number that is not the rate. controlBackgroundJobs keeps that poller
  // running on the Stats page for exactly this reason.
  get statsRateFormatted() {
    const state = this.treasuryState
    if (state != null) {
      return this.formatRate(Number(state.totalCoins) / Number(state.totalTokens) || 1)
    }
  }

  get hgramStats() {
    return this.useGauge ? this.tokenStats(this.gauge?.hgram) : undefined
  }

  get hpoStats() {
    return this.useGauge ? this.tokenStats(this.gauge?.hpo) : undefined
  }

  get gramStats() {
    return this.useGauge ? this.tokenStats(this.gauge?.gram) : undefined
  }

  // Every field is optional: a partial gauge response must render what it has rather than blank the
  // whole section. The gauge's 24h change is in percent units, hence the /100.
  tokenStats = (token?: HipoGaugeToken): TokenStats | undefined => {
    if (token == null) {
      return undefined
    }
    const market = token.market
    const change = market?.price_change_percentage_24h
    return {
      price: market?.current_price?.usd != null ? this.formatUsdPrice(market.current_price.usd) : undefined,
      change24h: change != null ? this.formatSignedPercent(change / 100) : undefined,
      isChangePositive: (change ?? 0) >= 0,
      marketCap: market?.market_cap?.usd != null ? this.formatUsdCompact(market.market_cap.usd) : undefined,
      totalVolume: market?.total_volume?.usd != null ? this.formatUsdCompact(market.total_volume.usd) : undefined,
      supply: market?.circulating_supply != null ? this.formatCompact(market.circulating_supply) : undefined,
      holders: token.holders_count != null ? this.formatCompact(token.holders_count) : undefined,
    }
  }

  // The claim button's label itself is now static ("Claim Rewards" — see Reward.tsx); this feeds
  // the muted caption shown above the button instead, so a long amount no longer stretches the
  // button on mobile. Same GRAM-only / HPO-only / both-with-"+" branching as before, undefined
  // (no caption) when nothing clears the 0.01 dust threshold.
  get claimableRewardsFormatted() {
    const rewards = this.walletRewards
    if (rewards == null) {
      return undefined
    }
    if (rewards.hpoSumRewards > 0.01 && rewards.htonSumRewards > 0.01) {
      return this.t('app.model.gramPlusHpo', {
        gram: this.isolate(this.formatNumber(rewards.hpoSumRewards, { maximumFractionDigits: 2 })),
        hpo: this.isolate(this.formatNumber(rewards.htonSumRewards, { maximumFractionDigits: 2 })),
      })
    }
    if (rewards.hpoSumRewards > 0.01) {
      return this.withUnit('app.model.gram', this.formatNumber(rewards.hpoSumRewards, { maximumFractionDigits: 2 }))
    }
    if (rewards.htonSumRewards > 0.01) {
      return this.withUnit('app.model.hpo', this.formatNumber(rewards.htonSumRewards, { maximumFractionDigits: 2 }))
    }
    return undefined
  }

  // stake_sum_rewards comes back in the same unit as each earned_rewards[].stake_reward — already
  // in whole GRAM, not nano — so this is formatted like the other *_sum_rewards totals rather than
  // through formatNano. The backend always sends this once wallet rewards have loaded, so undefined
  // here means only "not loaded yet" (Row then shows its placeholder) — zero and dust format like
  // any other amount rather than hiding the row.
  get totalEarnedFormatted() {
    if (this.walletRewards == null) {
      return undefined
    }
    return this.withUnit(
      'app.model.gram',
      this.formatNumber(this.walletRewards.stakeSumRewards ?? 0, { maximumFractionDigits: 2 }),
    )
  }

  // hton_total_rewards is the wallet's LIFETIME HPO earned for holding hGRAM, reward coefficient
  // already applied, in the same unit as earned_rewards[].hpo_reward — whole HPO, not nano. Unlike
  // hton_sum_rewards (the claimable counter, which resets on claim), this one never resets. As with
  // totalEarnedFormatted, undefined means only "not loaded yet"; zero and dust are shown as-is.
  get totalHpoEarnedFormatted() {
    if (this.walletRewards == null) {
      return undefined
    }
    return this.withUnit(
      'app.model.hpo',
      this.formatNumber(this.walletRewards.htonTotalRewards ?? 0, { maximumFractionDigits: 2 }),
    )
  }

  // Same options as the visible (non-title) reward.time in Reward.tsx's per-round rows, which should
  // format through model.formatDate as well so the two agree in every locale. Stays undefined until
  // the date itself is known, independent of the two totals above.
  get totalEarnedSinceFormatted() {
    const since = this.walletRewards?.stakeRewardsSince
    if (since != null) {
      return this.formatDate(since, { month: 'long', day: '2-digit' })
    }
  }

  setLoading(v: boolean) {
    this.loading = v
  }

  setTonClient = (endpoint: string) => {
    this.tonClient = new TonClient4({ endpoint, timeout: tonClientTimeout })
  }

  // TonConnect re-emits onStatusChange for the SAME account — connection restore, bridge
  // reconnect, the injected wallet re-sending `connect` on unlock. Those are not wallet changes,
  // and treating them as one wiped every wallet-derived value below (balances, walletAddress, and
  // walletRewards) mid-session, leaving /rewards/ back at its unhydrated state.
  setAddress = (address?: Address) => {
    const unchanged = this.address == null ? address == null : address != null && this.address.equals(address)
    if (unchanged) {
      return
    }
    clearTimeout(this.timeoutWalletRewards)
    this.address = address
    this.tonBalance = undefined
    this.isMultisig = false
    this.showMultisigGuidance = false
    this.multisigHint = false
    this.walletAddress = undefined
    this.wallet = undefined
    this.walletState = undefined
    this.oldWalletAddress = undefined
    this.oldWalletTokens = undefined
    this.newWalletTokens = undefined
    this.lastBlock = 0
    this.walletRewardsFetchState = 'init'
    this.walletRewards = undefined
  }

  setTimes = (times?: Times) => {
    this.times = times
  }

  // No scrollTo here anymore: a page switch is a real navigation now, so the ClientRouter scrolls
  // to the top going forward and restores the previous position on back/forward.
  setActivePage = (activePage: ActivePage) => {
    if (this.activePage !== activePage) {
      this.activePage = activePage
      this.controlBackgroundJobs()
    }
  }

  setStatsRange = (statsRange: StatsRange) => {
    this.statsRange = statsRange
  }

  // Only ever called to revoke: the launch parameters said Telegram, the SDK then said otherwise.
  setTelegram = (isTelegram: boolean) => {
    this.isTelegram = isTelegram
  }

  setActiveTab = (activeTab: ActiveTab) => {
    if (this.activeTab !== activeTab) {
      this.activeTab = activeTab
      this.clearAmount()
    }
  }

  // Reads the state back out of the URL, never the other way around: every in-app page switch
  // goes through navigate(), and this runs on the astro:page-load it produces. The equality
  // guards in setActivePage/setActiveTab keep it a no-op when nothing changed.
  applyPathState = () => {
    const route = routeForPathname(window.location.pathname)
    if (route == null) {
      return
    }
    this.setActivePage(route.activePage)
    if (route.activeTab != null) {
      this.setActiveTab(route.activeTab)
    }
  }

  // The bare (unprefixed) route for the current page and tab — what the language switcher links to in
  // each locale. Derived from observable state, not location.pathname, so observers re-render on
  // in-app navigation.
  get activePath(): string {
    return routeForState(this.activePage, this.activeTab).path
  }

  navigateToPage = (activePage: ActivePage) => {
    this.navigateToPath(routeForState(activePage, this.activeTab).path)
  }

  navigateToTab = (activeTab: ActiveTab) => {
    this.navigateToPath(routeForState('stake', activeTab).path)
  }

  // navigate() falls back to a full page load when no ClientRouter is present, so this works
  // even if the island is ever mounted on a page without view transitions. The route table holds
  // bare paths; the current locale's prefix is added here (and replaced, if `path` carried one).
  navigateToPath = (path: string) => {
    const target = localizedPath(path, this.locale)
    if (normalizePath(window.location.pathname) === target) {
      return
    }
    void navigate(target)
  }

  setUnstakeOption = (unstakeOption: UnstakeOption) => {
    if (this.unstakeOption !== unstakeOption) {
      this.unstakeOption = unstakeOption
    }
  }

  // The amount input's handler. The text stays in the field exactly as typed (the view renders
  // `amountRaw`) and the WHOLE string is re-read on every keystroke — native or ASCII digits, any
  // separator the locale uses (spec §E) — into canonical ASCII `amount`. Text that does not parse,
  // including a thousands group the user is still typing ("1," "1,0" "1,00" on the way to "1,000"),
  // marks amountInvalid: the field turns the invalid colour and amountInNano is undefined, so it can
  // never be sent as a thousand-fold smaller number. Rewriting the field from the canonical value on
  // each keystroke (as an earlier version did) would do exactly that: a lone group mark has no digits
  // after it yet, so it can only ever read as a decimal, and once formatted back as the locale's decimal
  // symbol the grouping is unreachable — fa "۱٬۰۰۰" became 1.000 GRAM, never 1000.
  setAmount = (raw: string) => {
    this.amountRaw = raw
    if (raw.trim() === '') {
      this.amount = ''
      this.amountInvalid = false
      return
    }
    const parsed = this.parseNumberInput(raw)
    this.amount = parsed ?? ''
    this.amountInvalid = parsed === undefined
  }

  setAmountToMax = () => {
    this.amount = fromNano(this.maxAmount)
    this.amountRaw = this.formatInput(this.amount)
    this.amountInvalid = false
  }

  clearAmount = () => {
    this.amountRaw = ''
    this.amount = ''
    this.amountInvalid = false
  }

  setWaitForTransaction = (wait: WaitForTransaction) => {
    this.waitForTransaction = wait
  }

  setAmountAlert = (amountAlert: AmountAlert) => {
    this.amountAlert = amountAlert
  }

  beginRequest = () => {
    this.ongoingRequests += 1
  }

  endRequest = () => {
    this.ongoingRequests -= 1
  }

  setErrorMessage = (errorMessage: string, delay: number) => {
    this.errorMessage = errorMessage
    clearTimeout(this.timeoutErrorMessage)
    if (errorMessage !== '') {
      this.timeoutErrorMessage = setTimeout(() => {
        this.setErrorMessage('', 0)
      }, delay)
    }
  }

  openMultisigGuidance = () => {
    this.multisigHint = false
    this.showMultisigGuidance = true
  }

  closeMultisigGuidance = () => {
    this.showMultisigGuidance = false
  }

  showMultisigHint = () => {
    this.multisigHint = true
    clearTimeout(this.timeoutMultisigHint)
    this.timeoutMultisigHint = setTimeout(() => {
      this.hideMultisigHint()
    }, 15000)
  }

  hideMultisigHint = () => {
    this.multisigHint = false
    clearTimeout(this.timeoutMultisigHint)
  }

  setWalletRewardsFetchState = (state: WalletRewardsFetchState) => {
    this.walletRewardsFetchState = state
  }

  loadWalletRewards = async () => {
    const address = this.address
    if (address == null || this.walletRewardsFetchState === 'loading') {
      return
    }

    this.setWalletRewardsFetchState('loading')

    const url = 'https://api.hipogang.io/wallet-rewards?address=' + address.toString()

    try {
      this.beginRequest()

      const rewards = await fetch(url, { headers: { Accept: 'application/json' } })
        .then((res) => res.json())
        .then((res) => {
          const ok = res?.ok ?? false
          const rewards = res?.result
          if (!ok) {
            throw new Error()
          } else {
            return rewards
          }
        })

      const walletRewards: WalletRewards = {
        clubLevel: rewards.club_level,
        rewardCoefficients: rewards.reward_coefficients,
        htonHpoRewardRate: rewards.hton_hpo_reward_rate,
        hpoSumRewards: +rewards.hpo_sum_rewards,
        htonSumRewards: +rewards.hton_sum_rewards,
        stakeSumRewards: rewards.stake_sum_rewards != null ? +rewards.stake_sum_rewards : undefined,
        stakeRewardsSince:
          // 0 means "no history yet" on the wire, not the epoch.
          +rewards.stake_rewards_since > 0 ? new Date(+rewards.stake_rewards_since * 1_000) : undefined,
        htonTotalRewards: rewards.hton_total_rewards != null ? +rewards.hton_total_rewards : undefined,
        earnedRewards: rewards.earned_rewards
          .filter((reward: any) => +reward.ton_reward > 0 || +reward.hpo_reward > 0)
          .map((reward: any) => ({
            roundSince: new Date(reward.round_since * 1_000),
            time: new Date(reward.time * 1_000),
            stakeReward: +reward.stake_reward || 0,
            tonReward: +reward.ton_reward || 0,
            hpoReward: +reward.hpo_reward || 0,
          })),
      }

      runInAction(() => {
        this.walletRewards = walletRewards
      })

      this.setWalletRewardsFetchState('done')
    } catch {
      // The endpoint has no caching and briefly 503s during a backend deploy, so 'error' must not
      // be terminal. Dropping back to 'init' re-arms the autorun above, which refetches; any data
      // already on screen stays on screen meanwhile (this catch never clears walletRewards).
      this.setWalletRewardsFetchState('error')
      clearTimeout(this.timeoutWalletRewards)
      this.timeoutWalletRewards = setTimeout(() => {
        this.setWalletRewardsFetchState('init')
      }, retryWalletRewardsDelay)
    } finally {
      this.endRequest()
    }
  }

  // TonAccess is dead, so the endpoint is picked here instead of discovered: primary first, with
  // automatic failover to the public one. Runs once, from an autorun with no observable inputs.
  connectTonEndpoint = () => {
    this.switchTonEndpoint(forcedEndpoint ?? primaryEndpoint)
  }

  // A swap is just a new TonClient4 — cheap and stateless — and the polling autoruns restart
  // themselves off the observable client. lastBlock resets because the "older block" guard below
  // compares against a seqno the previous endpoint reported, and the two are minutes apart at
  // worst; without the reset a swap-back to a slightly lagging primary would fail every read.
  switchTonEndpoint = (endpoint: string) => {
    if (this.tonEndpoint === endpoint) {
      return
    }
    this.tonEndpoint = endpoint
    this.tonEndpointFailures = 0
    this.lastBlock = 0
    this.setTonClient(endpoint)
  }

  // Called after retry() has already exhausted its attempts, so only whole failed read cycles
  // count, and only consecutive ones — every successful read zeroes the counter.
  countTonEndpointFailure = () => {
    this.tonEndpointFailures += 1
    if (this.tonEndpointFailures >= endpointFailureThreshold) {
      this.failOverTonEndpoint()
    }
  }

  // Returns whether it swapped, so a caller mid-read can abandon its cycle: the swap has already
  // restarted the read on the other endpoint.
  failOverTonEndpoint = (): boolean => {
    if (forcedEndpoint != null || this.tonEndpoint !== primaryEndpoint) {
      return false
    }
    this.switchTonEndpoint(fallbackEndpoint)
    this.scheduleTonEndpointProbe()
    return true
  }

  scheduleTonEndpointProbe = () => {
    clearTimeout(this.timeoutEndpointProbe)
    this.timeoutEndpointProbe = setTimeout(() => void this.probeTonEndpoint(), endpointProbeDelay)
  }

  // Probes through a throwaway client of its own — a single GET /block/latest, no retry() — so it
  // can never disturb the reads in flight on the active one.
  probeTonEndpoint = async () => {
    if (this.tonEndpoint !== fallbackEndpoint) {
      return
    }
    try {
      const client = new TonClient4({ endpoint: primaryEndpoint, timeout: tonClientTimeout })
      const lastBlock = await client.getLastBlock()
      if (isStaleBlock(lastBlock.now)) {
        throw new Error('stale block')
      }
      this.switchTonEndpoint(primaryEndpoint)
    } catch {
      this.scheduleTonEndpointProbe()
    }
  }

  readTimes = () => {
    const tonClient = this.tonClient
    clearTimeout(this.timeoutReadTimes)
    if (document.hidden) {
      return
    }
    this.timeoutReadTimes = setTimeout(this.readTimes, updateTimesDelay)

    if (tonClient == null || treasuryAddress == null) {
      this.setTimes(undefined)
      return
    }

    const openedTreasury = tonClient.open(Treasury.createFromAddress(treasuryAddress))
    retry(openedTreasury.getTimes)
      .then((times) => {
        this.tonEndpointFailures = 0
        this.setTimes(times)
      })
      // The endpoint hook goes last: a failover restarts this read on the new endpoint, and its
      // fresh timer must be the one that survives.
      .catch(() => {
        clearTimeout(this.timeoutReadTimes)
        this.timeoutReadTimes = setTimeout(this.readTimes, retryDelay)
        this.countTonEndpointFailure()
      })
  }

  readLastBlock = async () => {
    const tonClient = this.tonClient
    const address = this.address
    clearTimeout(this.timeoutReadLastBlock)
    if (document.hidden) {
      return
    }
    this.timeoutReadLastBlock = setTimeout(() => void this.readLastBlock(), updateLastBlockDelay)

    if (tonClient == null || treasuryAddress == null) {
      runInAction(() => {
        this.tonBalance = undefined
        this.treasury = undefined
        this.treasuryState = undefined
        this.walletAddress = undefined
        this.wallet = undefined
        this.walletState = undefined
        this.oldWalletAddress = undefined
        this.oldWalletTokens = undefined
        this.newWalletTokens = undefined
      })
      return
    }

    try {
      this.beginRequest()
      const lastBlockInfo = await retry(() => tonClient.getLastBlock())
      // Up but stale is the failure an HTTP status can't show, and retrying never clears it, so it
      // swaps at once instead of waiting out the threshold. Nothing to do if the swap is refused
      // (already on the fallback, or overridden): a stale block still reads correctly.
      if (isStaleBlock(lastBlockInfo.now) && this.failOverTonEndpoint()) {
        return
      }
      this.tonEndpointFailures = 0
      const lastBlock = lastBlockInfo.last.seqno
      if (lastBlock < this.lastBlock) {
        throw new Error('older block')
      }
      const treasury = tonClient.openAt(lastBlock, Treasury.createFromAddress(treasuryAddress))

      const readTreasuryState = retry(treasury.getTreasuryState)

      const readMaxBurnableTokens = retry(treasury.getMaxBurnableTokens)

      const readAccountInfo =
        address == null
          ? Promise.resolve(undefined)
          : retry(() => tonClient.getAccountLite(lastBlock, address)).then((value) => ({
              tonBalance: BigInt(value.account.balance.coins),
              codeHash: value.account.state.type === 'active' ? value.account.state.codeHash : undefined,
            }))

      const lastParent = this.treasuryState?.parent
      const readWallet: Promise<[Address, OpenedContract<Wallet>, typeof this.walletState] | undefined> =
        address == null || lastParent == null
          ? Promise.resolve(undefined)
          : (this.walletAddress != null
              ? Promise.resolve(this.walletAddress)
              : retry(() => tonClient.openAt(lastBlock, Parent.createFromAddress(lastParent)).getWalletAddress(address))
            ).then(async (walletAddress) => {
              const wallet = tonClient.openAt(lastBlock, Wallet.createFromAddress(walletAddress))
              const walletState = await wallet.getWalletState().catch((e: unknown) => {
                if (e instanceof Error && 'message' in e && e.message === 'Exit code: -256') {
                  return undefined // wallet does not exists
                } else {
                  throw e
                }
              })
              return [walletAddress, wallet, walletState]
            })

      const parallel: [
        Promise<TreasuryConfig>,
        Promise<bigint>,
        Promise<{ tonBalance: bigint; codeHash: string | undefined } | undefined>,
        Promise<[Address, OpenedContract<Wallet>, typeof this.walletState] | undefined>,
      ] = [readTreasuryState, readMaxBurnableTokens, readAccountInfo, readWallet]
      const [treasuryState, maxBurnableTokens, accountInfo, hton] = await Promise.all(parallel)
      let [walletAddress, wallet, walletState] = hton ?? []

      if (walletAddress == null && address != null && treasuryState.parent != null) {
        try {
          const openedParent = tonClient.openAt(lastBlock, Parent.createFromAddress(treasuryState.parent))
          ;[walletAddress, wallet, walletState] = await retry(() => openedParent.getWalletAddress(address)).then(
            async (walletAddress) => {
              const wallet = tonClient.openAt(lastBlock, Wallet.createFromAddress(walletAddress))
              const walletState = await wallet.getWalletState().catch((e: unknown) => {
                if (e instanceof Error && 'message' in e && e.message === 'Exit code: -256') {
                  return undefined // wallet does not exists
                } else {
                  throw e
                }
              })
              return [walletAddress, wallet, walletState]
            },
          )
        } catch {
          // ignore
        }
      }

      runInAction(() => {
        this.tonBalance = accountInfo?.tonBalance
        this.isMultisig = accountInfo?.codeHash != null && multisigCodeHashes.includes(accountInfo.codeHash)
        this.treasury = treasury
        this.treasuryState = treasuryState
        this.maxBurnableTokens = maxBurnableTokens
        this.walletAddress = walletAddress
        this.wallet = wallet
        this.walletState = walletState
        this.lastBlock = lastBlock
      })

      await this.readOldWallet(tonClient, lastBlock, treasuryState)
    } catch {
      this.setErrorMessage(this.t('app.model.errorTonAccess'), retryDelay - 500)
      clearTimeout(this.timeoutReadLastBlock)
      this.timeoutReadLastBlock = setTimeout(() => void this.readLastBlock(), retryDelay)
      // Last, so that a failover's restarted read owns the timer, not this retry.
      this.countTonEndpointFailure()
    } finally {
      this.endRequest()
    }
  }

  readOldWallet = async (tonClient: TonClient4, lastBlock: number, treasuryState: TreasuryConfig) => {
    const address = this.address

    const readOldWallet: Promise<[Address | undefined, bigint | undefined, bigint | undefined]> =
      address == null || this.oldWalletAddress != null
        ? Promise.resolve([this.oldWalletAddress, this.oldWalletTokens, this.newWalletTokens])
        : Promise.resolve(tonClient.openAt(lastBlock, OldTreasury.createFromAddress(oldTreasuryAddress))).then(
            async (oldTreasury) => {
              const oldWalletAddress = await retry(() => oldTreasury.getWalletAddress(address))
              const oldWallet = tonClient.openAt(lastBlock, Wallet.createFromAddress(oldWalletAddress))
              const oldWalletTokens =
                (await retry(() =>
                  oldWallet
                    .getWalletState()
                    .then((walletState) => walletState.tokens)
                    .catch((e: unknown) => {
                      if (e instanceof Error && 'message' in e && e.message === 'Exit code: -256') {
                        return undefined // wallet does not exists
                      } else {
                        throw e
                      }
                    }),
                )) ?? 0n
              let newWalletTokens = 0n
              if (oldWalletTokens > 0n) {
                const [oldTotalCoins, oldTotalTokens] = await retry(oldTreasury.getTotalCoinsAndTokens)
                if (oldTotalTokens > 0n && treasuryState.totalCoins > 0n) {
                  const coins = (oldWalletTokens * oldTotalCoins) / oldTotalTokens
                  newWalletTokens = (coins * treasuryState.totalTokens) / treasuryState.totalCoins
                }
              }
              return [oldWalletAddress, oldWalletTokens, newWalletTokens]
            },
          )
    const [oldWalletAddress, oldWalletTokens, newWalletTokens] = await readOldWallet

    runInAction(() => {
      this.oldWalletAddress = oldWalletAddress
      this.oldWalletTokens = oldWalletTokens
      this.newWalletTokens = newWalletTokens
    })
  }

  pause = () => {
    clearTimeout(this.timeoutReadTimes)
    clearTimeout(this.timeoutReadLastBlock)
    clearTimeout(this.timeoutEndpointProbe)
  }

  // Re-arming the probe here is what keeps it a single self-scheduling chain: paused with the rest
  // of the polling, and never duplicated by a page swap or a visibility change.
  resume = () => {
    this.readTimes()
    void this.readLastBlock()
    if (this.tonEndpoint === fallbackEndpoint) {
      this.scheduleTonEndpointProbe()
    }
  }

  // The block poller feeds the stake form and — since the rate card must show the protocol rate or
  // nothing at all (see statsRateFormatted) — the Stats page too. Every other page pauses it.
  controlBackgroundJobs = () => {
    if (!document.hidden && (this.activePage === 'stake' || this.activePage === 'stats')) {
      this.resume()
    } else {
      this.pause()
    }
  }

  // The wallet keeps only one session per dapp, so connecting to Hipo from another device
  // or browser silently drops this one while the UI still shows the wallet as connected.
  // A request over a dropped session never gets an answer, so bound every request by its
  // validUntil window and drop the stale session when the wallet stays silent.
  guardedSendTransaction = async (tx: SendTransactionRequest): Promise<SendTransactionResponse> => {
    const tonConnectUI = this.tonConnectUI
    if (tonConnectUI == null) {
      throw new WalletNotConnectedError()
    }

    let timer: ReturnType<typeof setTimeout> | undefined = undefined
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new StaleSessionError())
      }, txValidUntil * 1000)
    })

    const send = tonConnectUI.sendTransaction(tx)

    try {
      return await Promise.race([send, timeout])
    } catch (e) {
      send.catch(() => undefined)
      if (e instanceof StaleSessionError || e instanceof WalletNotConnectedError) {
        void tonConnectUI.disconnect()
        this.setErrorMessage(this.t('app.model.errorSessionExpired'), 10000)
      }
      throw e
    } finally {
      clearTimeout(timer)
    }
  }

  upgradeOldWallet = () => {
    if (
      this.address != null &&
      this.oldWalletAddress != null &&
      this.tonConnectUI != null &&
      this.tonBalance != null &&
      this.oldWalletTokens != null
    ) {
      const queryId = generateRandomQueryId()

      const tx: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + txValidUntil,
        network: CHAIN.MAINNET,
        from: this.address.toRawString(),
        messages: [
          {
            address: this.oldWalletAddress.toString(),
            amount: feeUnstake.toString(),
            payload: beginCell()
              .storeUint(opUnstakeTokens, 32)
              .storeUint(queryId, 64)
              .storeCoins(this.oldWalletTokens)
              .storeAddress(undefined)
              .storeMaybeRef(undefined)
              .endCell()
              .toBoc()
              .toString('base64'),
          },
        ],
      }
      void this.guardedSendTransaction(tx).then(
        () =>
          this.waitForCompletion(queryId).then(() => {
            runInAction(() => {
              this.oldWalletAddress = undefined
              this.oldWalletTokens = undefined
              this.newWalletTokens = undefined
            })
          }),
        (e: unknown) => {
          if (!(e instanceof StaleSessionError) && !(e instanceof WalletNotConnectedError)) {
            this.showMultisigHint()
          }
        },
      )
    }
  }

  send = () => {
    if (
      this.address != null &&
      this.isAmountValid &&
      this.isAmountPositive &&
      this.amountInNano != null &&
      this.treasury != null &&
      this.wallet != null &&
      this.tonConnectUI != null &&
      this.tonBalance != null
    ) {
      if (this.isMultisig) {
        this.openMultisigGuidance()
        return
      }

      const queryId = generateRandomQueryId()

      const message = this.isStakeTabActive
        ? createDepositMessage(this.treasury.address, this.amountInNano, queryId)
        : createUnstakeMessage(this.wallet.address, this.amountInNano, this.unstakeOption, queryId)

      const tx: SendTransactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + txValidUntil,
        network: CHAIN.MAINNET,
        from: this.address.toRawString(),
        messages: [message],
      }
      // Read before sending: `clearAmount` runs on completion, and the unstake option is a live
      // control the user can still move while the wallet dialog is open.
      const isStake = this.isStakeTabActive
      const pending: PendingTx = {
        kind: isStake ? 'stake' : 'unstake',
        // hGRAM for an unstake, GRAM for a stake — the spec asks for `amount_gram` on both.
        amountGram: Number(fromNano(this.amountInNano)),
        unstakeType: isStake ? undefined : this.unstakeOption,
      }
      // Fired here rather than on success, so the funnel counts everyone who reached the wallet
      // dialog — the ones who never sign are exactly the number worth knowing.
      if (isStake) {
        track('stake_initiated', { amount_gram: pending.amountGram })
      }

      void this.guardedSendTransaction(tx).then(
        () =>
          this.waitForCompletion(queryId, pending).then(() => {
            this.clearAmount()
          }),
        (e: unknown) => {
          if (!(e instanceof StaleSessionError) && !(e instanceof WalletNotConnectedError)) {
            this.showMultisigHint()
          }
        },
      )
    }
  }

  waitForCompletion = async (queryId: bigint, pending?: PendingTx) => {
    const tonClient = this.tonClient
    const address = this.address

    if (tonClient == null || address == null) {
      this.setWaitForTransaction('timeout')
      return
    }

    this.setWaitForTransaction('signed')

    try {
      clearTimeout(this.timeoutReadLastBlock)

      // Poll until the transaction's validUntil window has passed, after which it can
      // no longer land on-chain.
      const deadline = Date.now() + txValidUntil * 1000
      while (Date.now() < deadline) {
        await sleep(waitForCompletionDelay)

        const lastBlock = (await retry(() => tonClient.getLastBlock())).last.seqno
        const last = (await retry(() => tonClient.getAccountLite(lastBlock, address))).account.last
        if (last == null) {
          continue
        }
        const txs = await retry(() =>
          tonClient.getAccountTransactions(address, BigInt(last.lt), Buffer.from(last.hash, 'base64')),
        )

        for (const txBlock of txs) {
          const tx = txBlock.tx
          if (tx.description.type !== 'generic' || tx.inMessage == null) {
            continue
          }

          const inPayload = tx.inMessage.body.beginParse()
          if (tx.inMessage.info.type === 'internal' && inPayload.remainingBits >= 32 + 64) {
            inPayload.skip(32)
            if (inPayload.loadUintBig(64) === queryId) {
              await this.readLastBlock()
              clearTimeout(this.timeoutReadLastBlock)
              this.setWaitForTransaction('done')
              if (pending != null) {
                track(pending.kind === 'stake' ? 'stake_confirmed' : 'unstake_confirmed', {
                  amount_gram: pending.amountGram,
                  wallet_name: pending.kind === 'stake' ? this.connectedWalletName : undefined,
                  unstake_type: pending.unstakeType,
                })
              }
              return
            }
          }

          const outMessage = tx.outMessages.get(0)
          if (this.waitForTransaction === 'signed' && outMessage != null) {
            const outPayload = outMessage.body.beginParse()
            if (outPayload.remainingBits >= 32 + 64) {
              outPayload.skip(32)
              if (outPayload.loadUintBig(64) === queryId) {
                this.setWaitForTransaction('sent')
                break
              }
            }
          }
        }
      }

      this.setWaitForTransaction('timeout')
    } catch {
      this.setWaitForTransaction('timeout')
    } finally {
      this.timeoutReadLastBlock = setTimeout(() => void this.readLastBlock(), updateLastBlockDelay)
    }
  }

  initTonConnect = () => {
    if (document.getElementById(tonConnectWidgetRootId) != null) {
      this.connectWallet()
    } else {
      setTimeout(this.initTonConnect, 10)
    }
  }

  connect = () => {
    if (this.tonConnectUI != null) {
      void this.tonConnectUI.openModal()
    }
  }

  // Drives the header's custom wallet pill. TonConnect's own button widget (which used to own
  // this action through its dropdown) is no longer rendered.
  disconnect = () => {
    if (this.tonConnectUI != null) {
      void this.tonConnectUI.disconnect()
    }
  }

  connectWallet = () => {
    this.tonConnectUI = new TonConnectUI({
      manifestUrl: 'https://hipo.finance/tonconnect-manifest.json',
      // No buttonRootId on purpose: the header renders its own wallet button.
      widgetRootId: tonConnectWidgetRootId,
      actionsConfiguration: tonConnectActionsConfiguration,
      // 'en' or 'ru' per the registry; applyTonConnectLanguage re-sets it when the locale changes.
      language: tonConnectLanguage(this.locale),
      // Both palettes are supplied and the active one follows the OS setting, like the rest of
      // the site (src/styles/global.css). TonConnect has no "system" theme of its own, so the
      // media query is read here and re-applied on change via uiOptions.
      uiPreferences: {
        theme: preferredTonConnectTheme(),
        colorsSet: {
          [THEME.DARK]: {
            connectButton: {
              background: '#ff7e73',
              foreground: '#291f20',
            },
            background: {
              primary: '#2b2423', // dialog background
              secondary: '#3d3331', // menu item hover background
              qr: '#f5efe8',
              tint: '#3d3331',
              segment: '#2b2423',
            },
            text: {
              primary: '#f5efe8', // dialog text
              secondary: '#c2b5ac', // dialog subtitle
            },
            icon: {
              primary: '#f5efe8', // browser extension icon
              secondary: '#c2b5ac', // dialog close
              tertiary: '#f5efe8', // loading indicator
              success: '#4ade80', // success notification color
              error: '#ff7e73', // error notification color
            },
            constant: {
              black: '#201b1a', // qrcode color
              white: '#201b1a', // ton connect footer
            },
            accent: '#ff7e73', // coral
          },
          [THEME.LIGHT]: {
            // connectButton and `accent` are the coral fill with dark text on it, so they are the
            // brand coral here too; everything that is a page surface or a piece of text flips.
            connectButton: {
              background: '#ff7e73',
              foreground: '#291f20',
            },
            background: {
              primary: '#ffffff', // dialog background
              secondary: '#faf6ef', // menu item hover background
              qr: '#ffffff',
              tint: '#f1e9de',
              segment: '#ffffff',
            },
            text: {
              primary: '#291f20', // dialog text
              secondary: '#6f6058', // dialog subtitle
            },
            icon: {
              primary: '#291f20', // browser extension icon
              secondary: '#6f6058', // dialog close
              tertiary: '#291f20', // loading indicator
              success: '#16a34a', // success notification color
              error: '#e0574b', // error notification color
            },
            constant: {
              black: '#291f20', // qrcode color
              white: '#ffffff', // ton connect footer
            },
            accent: '#ff7e73', // coral
          },
        },
      },
    })
    // TonConnect replays onStatusChange on page load while it restores a stored session. Those are
    // not connections the visitor just made, and counting them would bury the funnel's first step
    // under returning users. `connectionRestored` settles once that replay is over, so a wallet
    // arriving after it is a real connect.
    let restored = false
    void this.tonConnectUI.connectionRestored.then(() => {
      restored = true
    })
    this.tonConnectUI.onStatusChange((wallet) => {
      const address = wallet == null ? undefined : Address.parseRaw(wallet.account.address)
      const isNewAddress = address != null && (this.address == null || !this.address.equals(address))
      this.connectedWalletName = wallet?.device.appName
      this.setAddress(address)
      if (restored && isNewAddress) {
        track('wallet_connect', { wallet_name: wallet?.device.appName })
      }
    })
    // The modal is long-lived (it survives ClientRouter swaps, see keepRuntimeStyles), so a
    // scheme change while the app is open has to be pushed into it.
    tonConnectThemeQuery()?.addEventListener('change', this.syncTonConnectTheme)
  }

  syncTonConnectTheme = () => {
    if (this.tonConnectUI != null) {
      // actionsConfiguration is re-sent for the same reason applyTonConnectLanguage re-sends it:
      // the uiOptions setter assigns that field wholesale, so omitting it drops twaReturnUrl.
      this.tonConnectUI.uiOptions = {
        uiPreferences: { theme: preferredTonConnectTheme() },
        actionsConfiguration: tonConnectActionsConfiguration,
      }
    }
  }

  // Also the refresh button's handler. clearTimeout on entry means a manual call cancels the
  // pending automatic refresh and restarts the countdown, which is exactly the behaviour wanted.
  loadHipoGauge = () => {
    if (this.isGaugeRefreshing) {
      return
    }
    clearTimeout(this.timeoutHipoGauge)
    runInAction(() => {
      this.isGaugeRefreshing = true
    })
    fetch('https://gauge.hipo.finance/data')
      .then((res) => res.json())
      .then((res: { ok: boolean; result: HipoGaugeResponse }) => {
        // Guard unchanged from before this endpoint fed anything but the holders count: a
        // response without it is still treated as invalid, and every other field is optional.
        const holdersCount = res.result?.hton?.holders_count
        if (res.ok && holdersCount != null && holdersCount >= 0) {
          runInAction(() => {
            this.holdersCount = holdersCount
            this.gauge = toHipoGauge(res.result)
            this.isGaugeRefreshing = false
          })
          clearTimeout(this.timeoutHipoGauge)
          this.timeoutHipoGauge = setTimeout(this.loadHipoGauge, updateHipoGaugeDelay)
        } else {
          throw new Error('invalid response')
        }
      })
      .catch(() => {
        // Deliberately does not clear `gauge`: the last good figures stay on screen instead of
        // the panel flipping to contract values mid-session.
        runInAction(() => {
          this.isGaugeRefreshing = false
        })
        clearTimeout(this.timeoutHipoGauge)
        this.timeoutHipoGauge = setTimeout(this.loadHipoGauge, retryHipoGaugeDelay)
      })
  }
}

export interface TokenStats {
  price?: string
  change24h?: string
  isChangePositive: boolean
  marketCap?: string
  totalVolume?: string
  supply?: string
  holders?: string
}

function generateRandomQueryId(): bigint {
  const randomArray = new BigUint64Array(1)
  crypto.getRandomValues(randomArray)
  return randomArray[0]
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function retry<T>(fn: () => Promise<T>, retries = retryAttempts): Promise<T> {
  return new Promise(function (resolve, reject) {
    let err: Error | undefined
    const attempt = () => {
      if (retries < retryAttempts) {
        console.warn('retry', retries)
      }
      if (retries <= 0) {
        reject(err ?? new Error())
      } else {
        fn()
          .then(resolve)
          .catch((e: unknown) => {
            retries -= 1
            err = e as Error
            setTimeout(attempt, retryAttemptDelay)
          })
      }
    }
    attempt()
  })
}
