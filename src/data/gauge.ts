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
import { formatCompact, formatNumber, formatPercent, formatUsd } from '../i18n/format.ts'
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
  hpo?: { holders_count?: number; market?: { market_cap?: { usd?: number }; total_volume?: { usd?: number } } }
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
  hpoMarketCap?: string
  hpoVolume?: string
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
  return value != null && value > 0
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

  const marketCap = data.hpo?.market?.market_cap?.usd
  if (positive(marketCap)) {
    values.hpoMarketCap = compactUsd(locale, marketCap)
  }

  const volume = data.hpo?.market?.total_volume?.usd
  if (positive(volume)) {
    values.hpoVolume = compactUsd(locale, volume)
  }

  const hpoHolders = data.hpo?.holders_count
  if (positive(hpoHolders)) {
    values.hpoHolders = formatCompact(locale, hpoHolders, 1)
  }

  return values
}
