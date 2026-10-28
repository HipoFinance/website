// Refreshes the live numbers on the HPO page: the hero market card (#hpoPrice
// #hpoMarketCap #hpoCirculating #hpoHolders) and the "Impressive metrics" card (#hpoTvlGram #hpoTvlUsd
// #hpoStakers), re-polled every 5 minutes.
//
// These values are already IN the HTML: src/components/Hpo.astro bakes them at build time via
// src/data/gauge.ts, and this script formats through the very same gaugeValues(), so a refresh
// that finds unchanged numbers writes back exactly what was baked. A field the gauge omits comes
// back undefined and is SKIPPED rather than written, so a partial payload can never blank out a
// good baked value; a failed fetch leaves the page as built and retries.
//
// The tokenomics card's supply bar (#hpoBurned #hpoSupplyCirculating #hpoSupplyHeld, each with a
// `Pct` and a `Bar` element) and the fully diluted value sentence (#hpoFdv) refresh from the same
// payload through hpoSupply(). The burned
// count is the one figure with an entrance: it is blanked to zero as soon as this script runs
// (the card is far below the fold) and counted up to the live figure when the card scrolls into
// view; until 2026-10-17 it came from a TON v4 run in the browser instead of the gauge
// (specs/hpo-tokenomics-supply-bar.md).
//
// Numbers follow the page's locale (spec §E): `<html lang>` is mapped back to its registry key and
// every value goes through src/i18n/format.ts, so `/fa/` gets Persian digits without any change here.

import { LOCALES } from '../i18n/registry.mjs'
import { formatNumber } from '../i18n/format.ts'
import { interpolate } from '../i18n/make-t.ts'
import { gaugeValues, hpoSupply, HPO_SECTION_KEYS } from '../data/gauge.ts'

const locale = pageLocale()

// Every GaugeValues key that names an element on this page.
const IDS = ['hpoPrice', 'hpoMarketCap', 'hpoCirculating', 'hpoHolders', 'hpoTvlGram', 'hpoTvlUsd', 'hpoStakers']

// The burned count's entrance. The baked figure rides along as data-burned; the text is blanked to
// zero right away (only when there is a figure to count to: with the gauge down at build time the
// em dash stays) and counted up to the target (baked, or the gauge's once a refresh landed) the
// first time the figure itself scrolls fully into view. Reduced-motion users keep the baked figure
// and get each refresh at once. Once shown, refreshes write the figure directly like every other id.
let elBurned = document.getElementById('hpoBurned')
let burnedTarget = Number(elBurned?.dataset.burned) > 0 ? Number(elBurned.dataset.burned) : undefined
let burnedSeen = false
let burnedShown = elBurned == null || window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!burnedShown) {
  if (burnedTarget !== undefined) {
    SetText(elBurned, formatNumber(locale, 0))
  }
  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect()
          burnedSeen = true
          countBurnedUp()
        }
      },
      { threshold: 1 },
    )
    io.observe(elBurned)
  } else {
    burnedSeen = true
    countBurnedUp()
  }
}

function countBurnedUp() {
  if (burnedShown || !burnedSeen || burnedTarget === undefined) {
    return
  }
  burnedShown = true
  const target = burnedTarget
  const duration = 1400
  const t0 = performance.now()
  const tick = (now) => {
    const p = Math.min((now - t0) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    // The gauge may have refreshed the target mid-count; the last frame lands on the latest.
    SetText(elBurned, formatNumber(locale, Math.round((p < 1 ? target : burnedTarget) * eased)))
    if (p < 1) {
      requestAnimationFrame(tick)
    }
  }
  requestAnimationFrame(tick)
}

// The supply bar: the two compact figures and the three percentages and segment widths are
// written like the other ids; the burned count goes through the entrance above.
let updateSupply = (data) => {
  const supply = hpoSupply(locale, data)
  if (supply === undefined) {
    return
  }
  burnedTarget = supply.burnedExact
  if (burnedShown) {
    SetText(elBurned, supply.burned)
  } else {
    countBurnedUp()
  }
  // The fully diluted value sentence: its template rides along in data-template.
  // Hidden when the payload has no price, rather than left saying the old figures beside a bar
  // that moved on.
  const elFdv = document.getElementById('hpoFdv')
  if (elFdv != null) {
    elFdv.hidden = supply.fdv === undefined
    if (supply.fdv !== undefined) {
      elFdv.textContent = interpolate(elFdv.dataset.template ?? '', {
        total: supply.total,
        fdv: supply.fdv,
        circulating: supply.circulating,
      })
    }
  }
  for (const [stem, value, pct, share] of [
    ['hpoBurned', undefined, supply.burnedPct, supply.burnedShare],
    ['hpoSupplyCirculating', supply.circulating, supply.circulatingPct, supply.circulatingShare],
    ['hpoSupplyHeld', supply.held, supply.heldPct, supply.heldShare],
  ]) {
    if (stem === 'hpoSupplyHeld' && supply.sections !== undefined) {
      SetText(document.getElementById(stem), value)
      SetText(document.getElementById(stem + 'Pct'), pct)
      const heldBar = document.getElementById(stem + 'Bar')
      if (heldBar != null) {
        heldBar.hidden = true
      }
      continue
    }
    SetText(document.getElementById(stem), value)
    SetText(document.getElementById(stem + 'Pct'), pct)
    const bar = document.getElementById(stem + 'Bar')
    if (bar != null) {
      bar.hidden = false
      bar.style.width = share + '%'
    }
  }
  // The held figure's swatch is hatched like its segments when the split is drawn, solid otherwise.
  const swatch = document.getElementById('hpoSupplyHeldSwatch')
  if (swatch != null) {
    const split = supply.sections !== undefined
    swatch.classList.toggle('hatch', split)
    swatch.classList.toggle('bg-border-strong', !split)
    if (split) {
      swatch.style.setProperty('--hatch-color', 'var(--color-border-strong)')
    } else {
      swatch.style.removeProperty('--hatch-color')
    }
  }
  // The held total split by wallet: the section bars and list rows when the payload has the split,
  // otherwise the sections leave the layout and the single held segment above is drawn.
  const list = document.getElementById('hpoHeldSections')
  if (list != null) {
    list.hidden = supply.sections === undefined
  }
  for (const key of [...HPO_SECTION_KEYS, 'other']) {
    const stem = 'hpoHeld' + key.charAt(0).toUpperCase() + key.slice(1)
    const section = supply.sections?.find((s) => s.key === key)
    const bar = document.getElementById(stem + 'Bar')
    if (bar != null) {
      bar.hidden = section === undefined
      if (section !== undefined) {
        bar.style.width = section.share + '%'
      }
    }
    const row = document.getElementById(stem)?.closest('li')
    if (row != null) {
      row.hidden = section === undefined
    }
    if (section !== undefined) {
      SetText(document.getElementById(stem), section.amount)
      SetText(document.getElementById(stem + 'Pct'), section.pct)
    }
  }
  // The bar's accessible label follows the figures; its two templates ride along in data attributes.
  const elBar = document.getElementById('hpoSupplyBar')
  if (elBar != null) {
    const d = elBar.dataset
    const labels = JSON.parse(d.labels ?? '{}')
    const sections = (supply.sections ?? [])
      .map((s) => interpolate(d.sectionItem ?? '', { label: labels[s.key] ?? s.key, amount: s.amount, pct: s.pct }))
      .join(d.separator ?? ', ')
    elBar.setAttribute(
      'aria-label',
      interpolate((supply.sections === undefined ? d.template : d.templateSections) ?? '', {
        minted: d.minted ?? '',
        burned: supply.burned,
        circulating: supply.circulating,
        held: supply.held,
        sections,
      }),
    )
  }
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
        const el = document.getElementById(id)
        // While the chart's readout holds the price figure (hpo-sparkline.ts), a refreshed price
        // goes to data-live and the readout restores it when the pointer leaves.
        if (id === 'hpoPrice' && el?.dataset.inspecting === '1') {
          if (values[id] !== undefined) {
            el.dataset.live = values[id]
          }
          continue
        }
        SetText(el, values[id])
      }
      updateSupply(res.result)
    })
    .catch(() => {
      clearTimeout(timer)
      timer = setTimeout(updateHpoData, 5000)
    })
}

// A function declaration, hoisted: the burned count's entrance above calls it before this line.
function SetText(el, text) {
  if (el != null && text !== undefined) {
    el.textContent = text
  }
}

// The registry key whose `lang` matches <html lang> (e.g. lang="fa" → 'fa'); English otherwise.
function pageLocale() {
  const lang = document.documentElement.lang
  const match = Object.entries(LOCALES).find(([, info]) => info.lang === lang)
  return match === undefined ? 'en' : match[0]
}

updateHpoData()
