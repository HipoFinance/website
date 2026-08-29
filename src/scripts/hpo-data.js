// Refreshes the live numbers on the HPO page: the hero market card (#hpoMarketCap #hpoVolume
// #hpoHolders) and the "Impressive metrics" card (#hpoTvlGram #hpoTvlUsd #hpoStakers), re-polled
// every 5 minutes.
//
// These values are already IN the HTML: src/components/Hpo.astro bakes them at build time via
// src/data/gauge.ts, and this script formats through the very same gaugeValues(), so a refresh
// that finds unchanged numbers writes back exactly what was baked. A field the gauge omits comes
// back undefined and is SKIPPED rather than written, so a partial payload can never blank out a
// good baked value; a failed fetch leaves the page as built and retries.
//
// #hpoBurned is the exception and stays purely client-side: it comes from a TON v4 run, not the
// gauge, and its count-up animation starts at zero — baking the final figure would make it visibly
// reset on load.
//
// Numbers follow the page's locale (spec §E): `<html lang>` is mapped back to its registry key and
// every value goes through src/i18n/format.ts, so `/fa/` gets Persian digits without any change here.

import { LOCALES } from '../i18n/registry.mjs'
import { formatNumber } from '../i18n/format.ts'
import { gaugeValues } from '../data/gauge.ts'

const locale = pageLocale()

// Every GaugeValues key that names an element on this page.
const IDS = ['hpoMarketCap', 'hpoVolume', 'hpoHolders', 'hpoTvlGram', 'hpoTvlUsd', 'hpoStakers']

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
      const values = gaugeValues(locale, res.result)
      for (const id of IDS) {
        SetText(document.getElementById(id), values[id])
      }
    })
    .catch(() => {
      clearTimeout(timer)
      timer = setTimeout(updateHpoData, 5000)
    })
}

let SetText = (el, text) => {
  if (el != null && text !== undefined) {
    el.textContent = text
  }
}

// The registry key whose `lang` matches <html lang> (e.g. lang="pt-BR" → 'pt-br'); English otherwise.
function pageLocale() {
  const lang = document.documentElement.lang
  const match = Object.entries(LOCALES).find(([, info]) => info.lang === lang)
  return match === undefined ? 'en' : match[0]
}

updateHpoData()
updateBurned()
