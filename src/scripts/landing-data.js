// Refreshes the live numbers on the landing page in the visitor's browser: the hero APY pill, the
// hero holders count, the stats row, and the HPO panel stats (#hpoMarketCap #hpoVolume #hpoHolders
// — the same ids hpo-data.js fills on the HPO page).
//
// These values are already IN the HTML: src/components/Landing.astro bakes them at build time via
// src/data/gauge.ts, so crawlers and the first paint see real figures instead of em dashes. This
// script exists to correct them for a visitor arriving between scheduled rebuilds, and it formats
// through the very same gaugeValues(), so what it writes is character-identical to what was baked
// whenever the numbers have not moved — no flash, no drift between two copies of the rounding rules.
//
// A field the gauge omits comes back undefined and is SKIPPED rather than written, so a partial
// payload can never blank out a good baked value; a failed fetch leaves the page exactly as built.
//
// This module script is deferred by the browser, so the DOM is already parsed by the time it runs —
// no need to wait for window 'load', which would also block on images.
import { LOCALES } from '../i18n/registry.mjs'
import { gaugeValues } from '../data/gauge.ts'

const locale = pageLocale()

// Every GaugeValues key that names an element on this page. `stakedExact` is handled separately —
// it is a tooltip, not an element.
const IDS = [
  'heroApy',
  'heroFee',
  'heroHolders',
  'statStaked',
  'statStakedUsd',
  'statApy',
  'statFee',
  'statHolders',
  'hpoMarketCap',
  'hpoVolume',
  'hpoHolders',
]

let updateLandingData = () => {
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
      // The compact staked figure renders; the exact amount rides along as a hover tooltip (the
      // Stats page shows it as selectable text for copying).
      SetTitle(document.getElementById('statStaked'), values.stakedExact)
      SetTitle(document.getElementById('statStakedUsd'), values.stakedExact)
    })
    .catch(() => {})
}

let SetText = (el, text) => {
  if (el != null && text !== undefined) {
    el.textContent = text
  }
}

let SetTitle = (el, text) => {
  if (el != null && text !== undefined) {
    el.title = text
  }
}

// The registry key whose `lang` matches <html lang> (e.g. lang="pt-BR" → 'pt-br'); English otherwise.
function pageLocale() {
  const lang = document.documentElement.lang
  const match = Object.entries(LOCALES).find(([, info]) => info.lang === lang)
  return match === undefined ? 'en' : match[0]
}

updateLandingData()
