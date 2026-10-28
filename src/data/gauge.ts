// The live protocol numbers shown on the landing and HPO pages (APY, TVL, holders, HPO market
// data), all sourced from https://gauge.hipo.finance/data.
//
// Both halves of the pipeline live here on purpose:
//
//   - `fetchGauge()` runs at BUILD time, in the Astro frontmatter of Landing.astro / Hpo.astro, so
//     the real numbers are baked into the HTML. Before this existed every figure shipped as an em
//     dash and only appeared after the client fetch, which meant crawlers indexed "—" and the
//     first paint carried no data (see changelog 2026-08-29).
//   - `gaugeValues()` formats a gauge payload into the exact strings the markup shows, keyed by
//     the DOM id that carries each one. `src/scripts/landing-data.js` and `src/scripts/hpo-data.js`
//     call the SAME function on the client, so the value the visitor's browser writes a moment
//     later is character-identical to the baked one — no flip, and no chance of the two
//     formattings drifting apart when someone changes a rounding rule.
//
// A missing field, a failed fetch or a slow gauge must never produce a fake or stale-looking
// number: every value is optional and the caller falls back to the placeholder already in the
// markup. The build never fails because of this module.
import { formatCompact, formatNumber, formatPercent, formatRate, formatUsd, formatUsdPrice } from '../i18n/format.ts'
import type { Locale } from '../i18n/locale.ts'

const GAUGE_URL = 'https://gauge.hipo.finance/data'

// Long enough for a cold gauge, short enough that an unreachable host cannot stall a deploy. The
// build carries on with dashes when it trips.
const FETCH_TIMEOUT_MS = 10000

// Only the fields the pages actually render; the endpoint returns a great deal more.
export interface GaugeData {
  treasury?: { current_tvl?: number; current_apy?: number; protocol_fee?: number }
  ton?: { market?: { current_price?: { usd?: number } } }
  hton?: { holders_count?: number }
  hpo?: {
    holders_count?: number
    market?: {
      current_price?: { usd?: number }
      market_cap?: { usd?: number }
      // Whole HPO: total supply minus what the project's tokenomics wallets hold, read from the
      // chain by the gauge (gauge's specs/hpo-price-from-pools.md).
      circulating_supply?: number
      // Whole HPO, from the jetton master. Only falls, with burns; 1B minted minus this is the
      // burned figure on the tokenomics card (specs/hpo-tokenomics-supply-bar.md).
      total_supply?: number
      // Whole HPO held in the project wallets, by allocation label (community, liquidity, …); from
      // the gauge's specs/hpo-locked-wallet-balances.md. Absent until the gauge ships it.
      locked_supply?: Record<string, number>
      // Percent units: -4.19 means -4.19 %. Not shown on the site since 2026-10-28: the /hpo/ change
      // follows the chart's range instead (src/data/stats.ts).
      price_change_percentage_24h?: number
    }
  }
}

// The formatted strings, keyed by the DOM id that displays each. `stakedExact` is not an id: it is
// the unrounded amount shown as a hover tooltip on the two staked figures.
export interface GaugeValues {
  heroApy?: string
  heroFee?: string
  heroHolders?: string
  statApy?: string
  statFee?: string
  statStaked?: string
  statStakedUsd?: string
  statHolders?: string
  hpoPrice?: string
  hpoMarketCap?: string
  hpoCirculating?: string
  hpoHolders?: string
  hpoTvlGram?: string
  hpoTvlUsd?: string
  hpoStakers?: string
  stakedExact?: string
}

// One fetch per build, shared by all ~512 prerendered pages: the first caller starts it and every
// other awaits the same promise. Never rejects — a failure resolves to undefined and the pages
// render their placeholders.
let pending: Promise<GaugeData | undefined> | undefined

export function fetchGauge(): Promise<GaugeData | undefined> {
  if (pending === undefined) {
    pending = loadGauge()
  }
  return pending
}

async function loadGauge(): Promise<GaugeData | undefined> {
  try {
    const res = await fetch(GAUGE_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!res.ok) {
      throw new Error('HTTP ' + res.status)
    }
    const body = (await res.json()) as { ok?: boolean; result?: GaugeData }
    if (body.ok !== true || body.result === undefined) {
      throw new Error('payload not ok')
    }
    return body.result
  } catch (e) {
    // A warning, not an error: the pages degrade to the em dashes they used to always show, which
    // the client fetch then fills in as before. Worth seeing in the build log all the same.
    console.warn('[gauge] live numbers unavailable, building with placeholders:', (e as Error).message)
    return undefined
  }
}

// Percentages arrive as plain percentage numbers (17.34 → "17.34%"), so they are divided by 100
// before formatPercent's `style: 'percent'` multiplies them back.
function percent(locale: Locale, value: number): string {
  return formatPercent(locale, value / 100, 2)
}

function compactUsd(locale: Locale, value: number): string {
  return formatUsd(locale, value, { notation: 'compact', maximumFractionDigits: 1 })
}

function positive(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

// The three figures the dApp's stats strip shows under the stake form, and the same three on the
// Stats page's headline cards. Formatted to match Model's `statsApyFormatted`,
// `statsStakedCompact` and `statsHoldersFormatted` exactly — NOT gaugeValues() above, which
// rounds the landing page's copies differently (2 fraction digits on the staked figure, an exact
// holder count). The static app shell renders these and the island's first paint reproduces them
// from the same payload, inlined as #gauge-data, so nothing moves when React mounts.
export interface AppStats {
  apy?: string
  staked?: string
  holders?: string
}

export function appStats(locale: Locale, data: GaugeData | undefined): AppStats {
  const stats: AppStats = {}
  if (data === undefined) {
    return stats
  }

  const apy = data.treasury?.current_apy
  if (apy != null) {
    stats.apy = formatPercent(locale, apy / 100, 2)
  }

  const stakedNano = data.treasury?.current_tvl
  if (stakedNano != null) {
    stats.staked = formatCompact(locale, stakedNano / 1000000000, 1)
  }

  const holders = data.hton?.holders_count
  if (positive(holders)) {
    stats.holders = formatCompact(locale, holders, 1)
  }

  return stats
}

// The four headline cards on /stats/. Same formatters, and the same contract-then-gauge
// preference, as Model's statsStakedCompact / statsApyFormatted / statsHoldersFormatted /
// statsRateFormatted / statsTvlUsdFormatted / statsStakedExact / protocolFee — the shell renders
// these and the island reproduces them from the same two seeds, so nothing moves on mount. The
// rate has no gauge equivalent and comes from the Prometheus seed instead.
export interface StatsCards {
  staked?: string
  stakedExact?: string
  tvlUsd?: string
  apy?: string
  protocolFee?: string
  holders?: string
  rate?: string
}

export function statsCards(locale: Locale, data: GaugeData | undefined, rate: number | undefined): StatsCards {
  const cards: StatsCards = {}

  if (rate != null) {
    cards.rate = formatRate(locale, rate)
  }
  if (data === undefined) {
    return cards
  }

  const apy = data.treasury?.current_apy
  if (apy != null) {
    cards.apy = formatPercent(locale, apy / 100, 2)
  }

  const fee = data.treasury?.protocol_fee
  if (fee != null) {
    cards.protocolFee = formatPercent(locale, fee / 100, 2)
  }

  const stakedNano = data.treasury?.current_tvl
  if (stakedNano != null) {
    const staked = stakedNano / 1000000000
    cards.staked = formatCompact(locale, staked, 1)
    cards.stakedExact = formatNumber(locale, staked, { maximumFractionDigits: 0 })

    const gramPrice = data.ton?.market?.current_price?.usd
    if (positive(gramPrice)) {
      cards.tvlUsd = formatUsd(locale, staked * gramPrice, { notation: 'compact', maximumFractionDigits: 1 })
    }
  }

  const holders = data.hton?.holders_count
  if (positive(holders)) {
    cards.holders = formatCompact(locale, holders, 1)
  }

  return cards
}

// The gauge-derived figures on /vs/, keyed by the `data-vs-live` attribute that carries each one
// in the markup. A fourth rounding of the same three numbers, for the same reason the three above
// differ from each other: /vs/ prints the EXACT staked total rather than a compact one, because
// that page's whole argument is that its figures are the real ones and a rounded headline undercuts
// it. The fee repeats — the hero card and every row of the reward table — so the writer looks up
// ALL the nodes carrying a key, not the first.
//
// `src/scripts/vs-data.js` calls this in the browser with a fresh payload, exactly as
// landing-data.js calls gaugeValues(), so a refreshed figure is character-identical to the baked
// one whenever the number has not moved.

// The stakes in the "What 0% is worth" table. Shared with the client script, which re-derives the
// same per-year rows: two copies of this list would drift the moment one is edited.
export const VS_EXAMPLES = [1000, 5000, 10000, 50000]

export function vsValues(locale: Locale, data: GaugeData | undefined): Record<string, string> {
  const values: Record<string, string> = {}
  if (data === undefined) {
    return values
  }

  const apy = data.treasury?.current_apy
  if (apy != null) {
    values.apy = percent(locale, apy)
    for (const stake of VS_EXAMPLES) {
      // "≈ 170 GRAM" is one cell, not a number in a sentence, so the whole string is formatted
      // here: the client has no business re-assembling it out of pieces.
      values['earn:' + stake] = '≈ ' + formatNumber(locale, stake * (apy / 100), { maximumFractionDigits: 0 }) + ' GRAM'
    }
  }

  // A 0% fee is the real, advertised value, so no `> 0` guard — same as gaugeValues above.
  const fee = data.treasury?.protocol_fee
  if (fee != null) {
    values.fee = percent(locale, fee)
  }

  const stakedNano = data.treasury?.current_tvl
  if (stakedNano != null) {
    values.staked = formatNumber(locale, stakedNano / 1000000000, { maximumFractionDigits: 0 })
  }

  return values
}

export function gaugeValues(locale: Locale, data: GaugeData | undefined): GaugeValues {
  const values: GaugeValues = {}
  if (data === undefined) {
    return values
  }

  const apy = data.treasury?.current_apy
  if (apy != null) {
    values.heroApy = values.statApy = percent(locale, apy)
  }

  // A 0% fee is a real value the site currently advertises, so no `> 0` guard here.
  const fee = data.treasury?.protocol_fee
  if (fee != null) {
    values.heroFee = values.statFee = percent(locale, fee)
  }

  const stakedNano = data.treasury?.current_tvl
  if (stakedNano != null) {
    const staked = stakedNano / 1000000000
    values.statStaked = values.hpoTvlGram = formatCompact(locale, staked, 2)
    // The compact figure is what renders; the exact amount rides along as a hover tooltip.
    values.stakedExact = formatNumber(locale, staked, { maximumFractionDigits: 0 }) + ' GRAM'

    const gramPrice = data.ton?.market?.current_price?.usd
    if (positive(gramPrice)) {
      values.statStakedUsd = values.hpoTvlUsd = compactUsd(locale, staked * gramPrice)
    }
  }

  // hGRAM holders: exact on the landing page (team feedback prefers real numbers over "23,000+"),
  // compact in the HPO page's metrics card, which is a denser layout.
  const holders = data.hton?.holders_count
  if (positive(holders)) {
    values.statHolders = values.heroHolders = formatNumber(locale, holders)
    values.hpoStakers = formatCompact(locale, holders, 1)
  }

  const price = data.hpo?.market?.current_price?.usd
  if (positive(price)) {
    values.hpoPrice = formatUsdPrice(locale, price)
  }

  const marketCap = data.hpo?.market?.market_cap?.usd
  if (positive(marketCap)) {
    values.hpoMarketCap = compactUsd(locale, marketCap)
  }

  // Replaced the 24h volume on 2026-10-17: the gauge no longer has a volume for HPO (it prices
  // HPO from the pools' reserves, not from trade flow), and the supply is what explains the market
  // cap beside it.
  const circulating = data.hpo?.market?.circulating_supply
  if (positive(circulating)) {
    values.hpoCirculating = formatCompact(locale, circulating, 1)
  }

  const hpoHolders = data.hpo?.holders_count
  if (positive(hpoHolders)) {
    values.hpoHolders = formatCompact(locale, hpoHolders, 1)
  }

  return values
}

// The 1,000,000,000 HPO minted once at launch. The supply bar's three shares are of this figure.
export const HPO_MINTED = 1000000000

// The tokenomics card's supply bar: where the minted 1B are today, and the fully diluted value
// under it (readers compare with CoinGecko's $4M, which is this figure). The burned amount is the exact
// whole-HPO count ("22,925,231", the figure the page counts up to; `burnedExact` is its number),
// the other two compact with one decimal ("45.6M"), each percentage one decimal, and each share a
// number 0–100 for the segment widths. Undefined unless the gauge
// gave both supplies and they make sense (0 < circulating ≤ total ≤ minted): the page then keeps
// its em dashes rather than draw a bar from a half payload.
export interface HpoSupply {
  burned: string
  burnedPct: string
  burnedShare: number
  burnedExact: number
  circulating: string
  circulatingPct: string
  circulatingShare: number
  held: string
  heldPct: string
  heldShare: number
  // The total supply, compact ("977.1M"), and the fully diluted value, price × total supply
  // ("$4.1M"); the sentence under the supply bar explains the gap to the market cap with them.
  // fdv is undefined without a price.
  total: string
  fdv?: string
  // The held amount split by allocation (HPO_SECTION_KEYS order, then `other`); undefined when the
  // gauge sent no split or one that exceeds the held total, and the bar draws one held segment.
  sections?: { key: string; amount: string; pct: string; share: number }[]
}

// The allocation labels the site knows, in the donut's order; Hpo.astro and hpo-data.js share it.
// A section the gauge sends under another label is drawn as `other`.
export const HPO_SECTION_KEYS = ['community', 'liquidity', 'team', 'marketing', 'treasury', 'advisers']

export function hpoSupply(locale: Locale, data: GaugeData | undefined): HpoSupply | undefined {
  const total = data?.hpo?.market?.total_supply
  const circulating = data?.hpo?.market?.circulating_supply
  if (!positive(total) || !positive(circulating) || circulating > total || total > HPO_MINTED) {
    return undefined
  }
  const burned = HPO_MINTED - total
  const held = total - circulating
  const share = (value: number) => (value / HPO_MINTED) * 100
  // The printed percentages must sum to 100: burned, circulating and every held section are
  // rounded to the decimal shown and the largest held section (the held total without sections)
  // takes the remainder (rounded independently, 2.3 + 4.6 + 93.2 happens).
  const tenth = (value: number) => Math.round(share(value) * 10) / 10
  const entries: { key: string; value: number }[] = []
  const locked = data?.hpo?.market?.locked_supply
  if (
    locked !== undefined &&
    locked !== null &&
    typeof locked === 'object' &&
    !Array.isArray(locked) &&
    Object.keys(locked).length > 0
  ) {
    let known = 0
    let unknown = 0
    for (const key of HPO_SECTION_KEYS) {
      const value = locked[key]
      if (positive(value)) {
        entries.push({ key, value })
        known += value
      }
    }
    for (const [key, value] of Object.entries(locked)) {
      if (!HPO_SECTION_KEYS.includes(key) && positive(value)) {
        unknown += value
      }
    }
    const other = unknown + (held - known - unknown > 1 ? held - known - unknown : 0)
    if (other > 0 && (unknown > 0 || held - known > 1)) {
      entries.push({ key: 'other', value: other })
    }
  }
  const sectionSum = entries.reduce((sum, e) => sum + e.value, 0)
  const split = entries.length > 0 && sectionSum <= held + 1
  const tenths = split ? entries.map((e) => tenth(e.value)) : []
  let largest = 0
  tenths.forEach((v, i) => {
    if (v > tenths[largest]) {
      largest = i
    }
  })
  const othersTenth = tenth(burned) + tenth(circulating) + tenths.reduce((a, b) => a + b, 0)
  if (split) {
    tenths[largest] = Math.max(0, tenths[largest] + (100 - othersTenth))
  }
  const heldTenth = Math.max(0, 100 - tenth(burned) - tenth(circulating))
  const price = data?.hpo?.market?.current_price?.usd
  return {
    total: formatCompact(locale, total, 1),
    fdv: positive(price) ? compactUsd(locale, price * total) : undefined,
    burned: formatNumber(locale, Math.round(burned)),
    burnedPct: formatPercent(locale, tenth(burned) / 100, 1),
    burnedShare: share(burned),
    burnedExact: Math.round(burned),
    circulating: formatCompact(locale, circulating, 1),
    circulatingPct: formatPercent(locale, tenth(circulating) / 100, 1),
    circulatingShare: share(circulating),
    held: formatCompact(locale, held, 1),
    heldPct: formatPercent(locale, heldTenth / 100, 1),
    heldShare: share(held),
    sections: split
      ? entries.map((e, i) => ({
          key: e.key,
          amount: formatCompact(locale, e.value, 1),
          pct: formatPercent(locale, tenths[i] / 100, 1),
          share: share(e.value),
        }))
      : undefined,
  }
}
