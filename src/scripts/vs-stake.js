// The stake control on /vs/: re-scales the realized-APY comparison when the visitor picks a
// different amount.
//
// Everything this touches is ALREADY in the HTML — src/components/routes/VsRoute.astro bakes the
// chart, the headline figures and the table at build time for the default stake, so the page is
// complete for a visitor with no JS and for the link-preview crawlers this page is written for.
// This only rewrites those same numbers for a different stake.
//
// The geometry comes from src/data/lst-geometry.ts, the very same module the Astro component calls
// at build time, so the first interaction re-draws the identical line rather than a subtly
// different one. That module deliberately holds no import of the 169 KB dataset: only the ~100
// sampled growth factors the chart draws are inlined into the page.
//
// Numbers follow the page's locale, the same way src/scripts/hpo-data.js does it: `<html lang>` is
// mapped back to its registry key and every value goes through src/i18n/format.ts, so `/fa/` gets
// Persian digits and `/ar/` Arabic-Indic ones with nothing locale-aware written here.
import { LOCALES } from '../i18n/registry.mjs'
import { formatNumber, formatUsd } from '../i18n/format.ts'
import { chartGeometry, stakeOutcome } from '../data/lst-geometry.ts'

const payload = document.getElementById('vs-lst-data')
const chart = document.getElementById('vsGapChart')
const input = document.getElementById('vsStakeInput')
if (payload !== null && chart !== null && input !== null) {
  const data = JSON.parse(payload.textContent)
  const series = { days: data.days, growth: data.growth }

  const lang = document.documentElement.lang
  const locale = Object.keys(LOCALES).find((key) => LOCALES[key].lang === lang) ?? 'en'

  const gram = (value) => formatNumber(locale, value, { maximumFractionDigits: 0 })
  const usd = (value) => formatUsd(locale, value, { maximumFractionDigits: 0 })

  const ticks = document.getElementById('vsGapTicks')
  const chips = [...document.querySelectorAll('[data-vs-stake]')]
  const cells = new Map()
  for (const node of document.querySelectorAll('[data-vs-cell]')) {
    cells.set(node.dataset.vsCell, node)
  }

  const svgns = 'http://www.w3.org/2000/svg'
  const set = (key, text) => {
    const node = cells.get(key)
    if (node !== undefined) {
      node.textContent = text
    }
  }

  const render = (stake) => {
    const geo = chartGeometry(series, stake)
    const outcome = stakeOutcome(series, stake)

    // The tick count changes with the stake, so the group is rebuilt rather than patched.
    if (ticks !== null) {
      ticks.replaceChildren(
        ...geo.ticks.flatMap((tick) => {
          const line = document.createElementNS(svgns, 'line')
          line.setAttribute('x1', '62')
          line.setAttribute('x2', String(geo.width - 118))
          line.setAttribute('y1', tick.y)
          line.setAttribute('y2', tick.y)
          line.setAttribute('stroke', tick.value === 0 ? 'var(--color-text-faint)' : 'var(--color-border)')
          line.setAttribute('stroke-width', '1')
          const text = document.createElementNS(svgns, 'text')
          text.setAttribute('x', '52')
          text.setAttribute('y', String(tick.y + 4))
          text.setAttribute('text-anchor', 'end')
          text.setAttribute('font-size', '11')
          text.setAttribute('fill', 'var(--color-text-faint)')
          text.textContent = gram(tick.value)
          return [line, text]
        }),
      )
    }

    for (const item of geo.series) {
      chart.querySelector(`[data-vs-path="${item.id}"]`)?.setAttribute('d', item.path)
      chart.querySelector(`[data-vs-area="${item.id}"]`)?.setAttribute('d', item.area)
      const end = chart.querySelector(`[data-vs-end="${item.id}"]`)
      if (end !== null) {
        end.setAttribute('x', String(item.endX + 10))
        end.setAttribute('y', String(item.endY + 4))
      }
    }

    set('stake', gram(stake))
    set('hipoEnd', gram(outcome.hipoEnd))
    set('hipoEndUsd', usd(outcome.hipoEnd * data.gramUsd))
    set('end:hipo', gram(outcome.hipoEnd))
    set('earned:hipo', gram(outcome.hipoEarned))
    set('earnedUsd:hipo', usd(outcome.hipoEarned * data.gramUsd))
    for (const other of outcome.others) {
      set(`extra:${other.id}`, gram(other.extra))
      set(`extraUsd:${other.id}`, usd(other.extra * data.gramUsd))
      set(`end:${other.id}`, gram(other.end))
      set(`earned:${other.id}`, gram(other.earned))
      set(`earnedUsd:${other.id}`, usd(other.earned * data.gramUsd))
      set(`diff:${other.id}`, gram(other.extra))
    }

    for (const chip of chips) {
      chip.setAttribute('aria-pressed', String(Number(chip.dataset.vsStake) === stake))
    }
  }

  // The input is a plain number field, so its value is ASCII whatever the page's digits look like;
  // only what we WRITE back needs localising. A blank or nonsense entry leaves the last good
  // figures on screen rather than blanking the page.
  const readStake = () => {
    const value = Number(input.value)
    return Number.isFinite(value) && value > 0 ? value : undefined
  }

  input.addEventListener('input', () => {
    const stake = readStake()
    if (stake !== undefined) {
      render(stake)
    }
  })

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const stake = Number(chip.dataset.vsStake)
      input.value = String(stake)
      render(stake)
    })
  }

  // Nothing is rendered on load: the HTML already carries the default stake's figures, and
  // re-rendering them here would be the one way to make them differ from what was baked.
}
