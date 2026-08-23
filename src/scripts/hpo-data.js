// Fetches https://gauge.hipo.finance/data and fills in the live numbers on the HPO page: the
// hero market card (#hpoMarketCap #hpoVolume #hpoHolders) and the "Impressive metrics" card
// (#hpoTvlGram #hpoTvlUsd #hpoStakers). Every value starts as an em dash ("—") in the markup and
// is only overwritten when the fetch succeeds — a missing field or a failed fetch must never
// write a fake or stale number, it just leaves the dash in place.
//
// Numbers follow the page's locale (spec §E): `<html lang>` is mapped back to its registry key and
// every value goes through src/i18n/format.ts, so `/fa/` gets Persian digits without any change here.

import { LOCALES } from '../i18n/registry.mjs'
import { formatCompact, formatNumber, formatUsd } from '../i18n/format.ts'

const locale = pageLocale()

let elMarketCap = document.getElementById('hpoMarketCap')
let elHpoVolume = document.getElementById('hpoVolume')
let elHpoHolders = document.getElementById('hpoHolders')
let elTvlGram = document.getElementById('hpoTvlGram')
let elTvlUsd = document.getElementById('hpoTvlUsd')
let elStakers = document.getElementById('hpoStakers')
let elBurned = document.getElementById('hpoBurned')
let elBurnArc = document.getElementById('hpoBurnArc')
let elBurnChart = document.getElementById('hpoTokenomicsChart')

// "Burned so far" in the middle of the tokenomics donut: 1B HPO were minted; burns shrink the
// on-chain total supply, so the difference IS the burned amount — a real number, not marketing
// copy. Read via the TON v4 API's get_jetton_data run (same API the dApp's TonClient4 speaks),
// preferring Hipo's own endpoint like the app does (specs/ton-v4-read-endpoint.md), with the
// public one as a per-call fallback — which is also what keeps localhost dev working, since the
// primary's CORS is production-origin-only. Only queried on the HPO page (the element exists
// nowhere else); both endpoints failing leaves the dash and a flat arc.
const TON_V4 = 'https://v4.hipo.finance'
const TON_V4_FALLBACK = 'https://mainnet-v4.tonhubapi.com'
const HPO_JETTON = 'EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM'
const HPO_MINTED = 1000000000

let fetchV4 = (path) => {
  return fetch(TON_V4 + path)
    .then((res) => {
      if (!res.ok) {
        throw new Error('v4 primary: ' + res.status)
      }
      return res
    })
    .catch(() => fetch(TON_V4_FALLBACK + path))
}

// Sweep the ember arc to the burned share of the minted supply (the CSS transition in Hpo.astro
// animates the dasharray change) and count the exact figure up from zero. Deferred until the
// chart scrolls into view so the animation is actually seen, and skipped entirely for
// reduced-motion users, who get the final number at once.
let revealBurned = (burned) => {
  const run = () => {
    if (elBurnArc != null) {
      const pct = (burned / HPO_MINTED) * 100
      elBurnArc.setAttribute('stroke-dasharray', pct + ' ' + (100 - pct))
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      SetText(elBurned, formatNumber(locale, burned))
      return
    }
    const duration = 1400
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      SetText(elBurned, formatNumber(locale, Math.round(burned * eased)))
      if (p < 1) {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  }
  if (elBurnChart != null && typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect()
          run()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(elBurnChart)
  } else {
    run()
  }
}

let updateBurned = () => {
  if (elBurned == null) {
    return
  }
  fetchV4('/block/latest')
    .then((res) => res.json())
    .then((res) => fetchV4('/block/' + res.last.seqno + '/' + HPO_JETTON + '/run/get_jetton_data'))
    .then((res) => res.json())
    .then((res) => {
      // get_jetton_data's first stack item is the total supply in nano.
      const item = res.exitCode === 0 ? res.result?.[0] : undefined
      const supply = item?.type === 'int' ? Number(item.value) / 1000000000 : NaN
      if (Number.isFinite(supply) && supply > 0 && supply <= HPO_MINTED) {
        revealBurned(Math.round(HPO_MINTED - supply))
      }
    })
    .catch(() => {})
}

let updateHpoData = () => {
  let timer = setTimeout(updateHpoData, 300000)

  fetch('https://gauge.hipo.finance/data')
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) {
        return
      }
      const result = res.result

      const marketCap = result.hpo?.market?.market_cap?.usd
      if (marketCap != null && marketCap > 0) {
        SetText(elMarketCap, FormatCompactUsd(marketCap))
      }

      const volume = result.hpo?.market?.total_volume?.usd
      if (volume != null && volume > 0) {
        SetText(elHpoVolume, FormatCompactUsd(volume))
      }

      const holders = result.hpo?.holders_count
      if (holders != null && holders > 0) {
        SetText(elHpoHolders, FormatCompact1Fraction(holders))
      }

      const stakedNano = result.treasury?.current_tvl
      if (stakedNano != null) {
        const staked = stakedNano / 1000000000
        SetText(elTvlGram, FormatCompact2Fraction(staked))

        const gramPrice = result.ton?.market?.current_price?.usd
        if (gramPrice != null && gramPrice > 0) {
          SetText(elTvlUsd, FormatCompactUsd(staked * gramPrice))
        }
      }

      const stakers = result.hton?.holders_count
      if (stakers != null && stakers > 0) {
        SetText(elStakers, FormatCompact1Fraction(stakers))
      }
    })
    .catch(() => {
      clearTimeout(timer)
      timer = setTimeout(updateHpoData, 5000)
    })
}

let SetText = (el, text) => {
  if (el != null) {
    el.textContent = text
  }
}

// The registry key whose `lang` matches <html lang> (e.g. lang="pt-BR" → 'pt-br'); English otherwise.
function pageLocale() {
  const lang = document.documentElement.lang
  const match = Object.entries(LOCALES).find(([, info]) => info.lang === lang)
  return match === undefined ? 'en' : match[0]
}

let FormatCompact1Fraction = (n) => {
  return formatCompact(locale, n, 1)
}

let FormatCompact2Fraction = (n) => {
  return formatCompact(locale, n, 2)
}

// "$1.2M" in English; the currency sign goes wherever the locale puts it.
let FormatCompactUsd = (n) => {
  return formatUsd(locale, n, { notation: 'compact', maximumFractionDigits: 1 })
}

updateHpoData()
updateBurned()
