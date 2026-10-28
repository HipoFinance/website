// Draws the HPO hero chart from real price history over the Stats page's five ranges, and shows
// the price and the date of the point under the pointer (specs/hpo-chart-ranges-and-hover.md).
//
// The history comes through queryRange from the Stats page's Prometheus client
// (src/components/app/charts/prometheus.ts), so the query string sent to
// https://gauge.hipo.finance/prometheus/api/v1/query_range stays byte-identical to the one the
// nginx allowlist permits, and the five steps are the ones the Stats page already sends. See
// prometheus.ts for why the query is one fixed combined string across all metrics and ranges.
//
// Until the fetch resolves the <svg id="hpoSparkline"> stays empty; its class reserves the height,
// so no fake line or shape is ever drawn. A failed fetch shows the Stats page's error line in the
// chart's place; fewer than two points shows its "no data" line.
//
// The readout reuses the card's own price figure: while a point is picked, #hpoPrice shows that
// point's price (the live text is kept in data-live and restored on leave; hpo-data.js writes a
// refreshed price there meanwhile) and #hpoHoverTime shows its time where the range's change is.
// #hpoChange shows the change from the first to the last point of the shown range, labelled with the
// pill's own text; Hpo.astro bakes it for the opening range.
import { queryRange, stepFor, STATS_RANGES, type ChartPoint } from '../components/app/charts/prometheus'
import type { StatsRange } from '../components/app/Model'
import { LOCALES } from '../i18n/registry.mjs'
import type { Locale } from '../i18n/locale.ts'
import { formatDate, formatSignedPercent, formatUsdPrice } from '../i18n/format.ts'
import { interpolate } from '../i18n/make-t.ts'

const svgNs = 'http://www.w3.org/2000/svg'
const height = 120
// The line stays inside this band; the fill runs down to the bottom edge.
const padTop = 8
const padBottom = 8
const defaultRange: StatsRange = '30d'

const svg = document.getElementById('hpoSparkline') as unknown as SVGSVGElement | null
const note = document.getElementById('hpoSparklineNote')
const rangeGroup = document.getElementById('hpoRange')
const elPrice = document.getElementById('hpoPrice')
const elTime = document.getElementById('hpoHoverTime')
const elChangeWrap = document.getElementById('hpoChangeWrap')
const elChange = document.getElementById('hpoChange')
const elChangeLabel = document.getElementById('hpoChangeLabel')

if (svg != null) {
  init(svg)
}

interface Loaded {
  range: StatsRange
  points: ChartPoint[]
  start: number
  end: number
}

function init(svg: SVGSVGElement) {
  const locale = pageLocale()
  const title = svg.dataset.title ?? ''
  const buttons = Array.from(rangeGroup?.querySelectorAll<HTMLButtonElement>('button[data-range]') ?? [])

  let range: StatsRange = defaultRange
  let loaded: Loaded | undefined
  let failed = false
  let width = measure()
  // The picked point, as an index into loaded.points.
  let hovered: number | undefined
  // The hover marks of the current drawing, placed by applyHover.
  let marks: { group: SVGGElement; hairline: SVGLineElement; ring: SVGCircleElement; dot: SVGCircleElement } | undefined
  let xOf = (t: number) => 0 * t
  let yOf = (v: number) => 0 * v
  let requestId = 0

  const touch: { x: number; y: number; decided: boolean; horizontal: boolean } = {
    x: 0,
    y: 0,
    decided: false,
    horizontal: false,
  }
  let touchDismiss: ReturnType<typeof setTimeout> | undefined

  function measure(): number {
    return Math.max(1, Math.round(svg.getBoundingClientRect().width) || 400)
  }

  // The range the drawing and the readout describe: the loaded one while a switch is in flight.
  function shown(): StatsRange {
    return loaded?.range ?? range
  }

  function rangeLabel(): string {
    const key = shown()
    return buttons.find((b) => b.dataset.range === key)?.textContent?.trim() ?? key
  }

  function price(v: number): string {
    return formatUsdPrice(locale, v)
  }

  // The Stats page's hover time: a date for a year, date and time of day for the rest.
  function time(t: number): string {
    const date = t * 1000
    if (shown() === '1y') {
      return formatDate(locale, date, { year: 'numeric', month: 'short', day: 'numeric' })
    }
    return formatDate(locale, date, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
    const node = document.createElementNS(svgNs, name)
    for (const [key, value] of Object.entries(attrs)) {
      node.setAttribute(key, value)
    }
    return node
  }

  function showNote(text: string | undefined) {
    if (note == null) {
      return
    }
    note.hidden = text === undefined
    note.textContent = text ?? ''
  }

  function load(next: StatsRange) {
    range = next
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.range === next))
    }
    const id = ++requestId
    svg.style.opacity = '0.6'
    queryRange(next)
      .then((result) => {
        if (id !== requestId) {
          return
        }
        const points = (result.series.hipo_hpo_current_price ?? []).filter((p) => Number.isFinite(p.v))
        loaded = { range: next, points, start: result.start, end: result.end }
        failed = false
      })
      .catch(() => {
        if (id !== requestId) {
          return
        }
        loaded = undefined
        failed = true
      })
      .finally(() => {
        if (id !== requestId) {
          return
        }
        svg.style.opacity = ''
        hovered = undefined
        draw()
      })
  }

  function showChange(first: number | undefined, last: number | undefined) {
    if (elChange == null || elChangeLabel == null || elChangeWrap == null) {
      return
    }
    elChangeWrap.dataset.range = shown()
    if (
      first === undefined ||
      last === undefined ||
      !Number.isFinite(first) ||
      !Number.isFinite(last) ||
      !(first > 0)
    ) {
      elChangeWrap.hidden = true
      return
    }
    elChange.textContent = formatSignedPercent(locale, last / first - 1)
    elChangeLabel.textContent = rangeLabel()
    elChange.classList.toggle('text-positive', last >= first)
    elChange.classList.toggle('text-accent', last < first)
    elChangeWrap.hidden = false
  }

  function draw() {
    while (svg.firstChild != null) {
      svg.removeChild(svg.firstChild)
    }
    marks = undefined
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

    const points = loaded?.points ?? []
    if (loaded == null || points.length < 2) {
      // A range with no line shows no change: not another window's, and not the baked figure, which is
      // as old as the last deploy and would sit beside the Live badge with nothing to refresh it.
      if (loaded != null || failed) {
        showChange(undefined, undefined)
      }
      showNote(failed ? svg.dataset.error : loaded == null ? undefined : svg.dataset.empty)
      svg.setAttribute('aria-label', interpolate(svg.dataset.ariaEmpty ?? '', { title, range: rangeLabel() }))
      applyHover()
      return
    }
    showNote(undefined)

    const start = loaded.start
    const spanT = loaded.end - start || 1
    const values = points.map((p) => p.v)
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const spanV = maxV - minV
    const band = height - padTop - padBottom
    xOf = (t: number) => ((t - start) / spanT) * width
    yOf = (v: number) => (spanV > 0 ? height - padBottom - ((v - minV) / spanV) * band : height / 2)

    // One path per contiguous run, so an outage reads as a gap rather than a straight line across
    // it; the same 2.5-step rule as the Stats charts.
    const maxGap = stepFor(loaded.range) * 2.5
    let line = ''
    let area = ''
    let run: ChartPoint[] = []
    const flush = () => {
      if (run.length >= 2) {
        const coords = run.map((p) => xOf(p.t).toFixed(1) + ',' + yOf(p.v).toFixed(1))
        line += 'M' + coords.join(' L') + ' '
        area +=
          'M' +
          xOf(run[0].t).toFixed(1) +
          ',' +
          height +
          ' L' +
          coords.join(' L') +
          ' L' +
          xOf(run[run.length - 1].t).toFixed(1) +
          ',' +
          height +
          ' Z '
      }
      run = []
    }
    for (const p of points) {
      const prev = run[run.length - 1]
      if (prev != null && p.t - prev.t > maxGap) {
        flush()
      }
      run.push(p)
    }
    flush()

    // Green when the window ended at or above where it started, coral when below, the same split as
    // the change figure beside the price (showChange), so the colour says what the chart shows
    // (Behrang, 2026-10-17).
    const color = values[values.length - 1] >= values[0] ? 'var(--color-positive)' : 'var(--color-accent)'
    showChange(values[0], values[values.length - 1])

    svg.appendChild(el('path', { d: area.trim(), fill: color, 'fill-opacity': '0.12', stroke: 'none' }))
    svg.appendChild(
      el('path', { d: line.trim(), fill: 'none', stroke: color, 'stroke-width': '2.5', 'stroke-linejoin': 'round' }),
    )

    const group = el('g', { visibility: 'hidden' })
    const hairline = el('line', { y1: '0', y2: String(height), stroke: 'var(--color-text-faint)', 'stroke-width': '1' })
    const ring = el('circle', { r: '5', fill: 'var(--color-surface)' })
    const dot = el('circle', { r: '3', fill: color })
    group.append(hairline, ring, dot)
    svg.appendChild(group)
    marks = { group, hairline, ring, dot }

    svg.setAttribute(
      'aria-label',
      interpolate(svg.dataset.aria ?? '', {
        title,
        range: rangeLabel(),
        first: price(values[0]),
        last: price(values[values.length - 1]),
        min: price(minV),
        max: price(maxV),
      }),
    )
    applyHover()
  }

  // The index of the point nearest in time to t, or none when the nearest is across a gap: the
  // readout then says nothing rather than a figure from the far side of an outage.
  function nearest(t: number): number | undefined {
    const points = loaded?.points ?? []
    if (points.length === 0) {
      return undefined
    }
    let lo = 0
    let hi = points.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (points[mid].t < t) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    if (lo > 0 && Math.abs(points[lo - 1].t - t) < Math.abs(points[lo].t - t)) {
      lo -= 1
    }
    return Math.abs(points[lo].t - t) > stepFor(shown()) * 2.5 ? undefined : lo
  }

  function hoverAtClientX(clientX: number) {
    if (loaded == null) {
      return
    }
    const rect = svg.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / (rect.width || 1)))
    hovered = nearest(loaded.start + ratio * (loaded.end - loaded.start))
    applyHover()
  }

  function clearHover() {
    hovered = undefined
    applyHover()
  }

  function applyHover() {
    const point = hovered === undefined ? undefined : loaded?.points[hovered]
    if (point === undefined || marks === undefined) {
      marks?.group.setAttribute('visibility', 'hidden')
      restoreLive()
      return
    }
    const x = xOf(point.t).toFixed(1)
    const y = yOf(point.v).toFixed(1)
    marks.hairline.setAttribute('x1', x)
    marks.hairline.setAttribute('x2', x)
    for (const circle of [marks.ring, marks.dot]) {
      circle.setAttribute('cx', x)
      circle.setAttribute('cy', y)
    }
    marks.group.setAttribute('visibility', 'visible')

    if (elPrice != null) {
      if (elPrice.dataset.inspecting !== '1') {
        elPrice.dataset.live = elPrice.textContent ?? ''
        elPrice.dataset.inspecting = '1'
      }
      elPrice.textContent = price(point.v)
    }
    if (elTime != null) {
      elTime.textContent = time(point.t)
      elTime.classList.remove('invisible')
    }
    // The range's change is a different fact from the picked point; `invisible` keeps its box so the
    // row never reflows mid-scrub, as on the Stats charts.
    elChangeWrap?.classList.add('invisible')
  }

  function restoreLive() {
    if (elPrice != null && elPrice.dataset.inspecting === '1') {
      elPrice.textContent = elPrice.dataset.live ?? ''
      delete elPrice.dataset.inspecting
      delete elPrice.dataset.live
    }
    elTime?.classList.add('invisible')
    elChangeWrap?.classList.remove('invisible')
  }

  svg.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'touch') {
      hoverAtClientX(e.clientX)
    }
  })
  svg.addEventListener('pointerleave', clearHover)

  svg.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0]
      if (t == null) {
        return
      }
      touch.x = t.clientX
      touch.y = t.clientY
      touch.decided = false
      touch.horizontal = false
      clearTimeout(touchDismiss)
    },
    { passive: true },
  )
  svg.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0]
      if (t == null) {
        return
      }
      if (!touch.decided) {
        const dx = t.clientX - touch.x
        const dy = t.clientY - touch.y
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          touch.decided = true
          touch.horizontal = Math.abs(dx) > Math.abs(dy)
        }
      }
      // Only a clearly sideways drag scrubs; a vertical one must keep scrolling the page.
      if (touch.horizontal) {
        e.preventDefault()
        hoverAtClientX(t.clientX)
      }
    },
    { passive: false },
  )
  // A lifted finger has no leave event; without this the card would stay on that sample.
  svg.addEventListener('touchend', () => {
    touchDismiss = setTimeout(clearHover, 2000)
  })

  svg.addEventListener('keydown', (e) => {
    const points = loaded?.points ?? []
    if (points.length === 0) {
      return
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      hovered = e.key === 'Home' ? 0 : points.length - 1
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const current = hovered ?? points.length - 1
      hovered = e.key === 'ArrowLeft' ? Math.max(0, current - 1) : Math.min(points.length - 1, current + 1)
    } else {
      return
    }
    applyHover()
  })
  svg.addEventListener('blur', clearHover)

  rangeGroup?.addEventListener('click', (e) => {
    const button = (e.target as Element).closest<HTMLButtonElement>('button[data-range]')
    const next = button?.dataset.range as StatsRange | undefined
    // The pressed pill is a retry after a failed fetch (prometheus.ts caches successes only).
    if (next !== undefined && (next !== range || failed) && STATS_RANGES.includes(next)) {
      load(next)
    }
  })

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(() => {
      const next = measure()
      if (next !== width) {
        width = next
        draw()
      }
    }).observe(svg)
  }

  load(range)
}

// The registry key whose `lang` matches <html lang> (e.g. lang="fa" → 'fa'); English otherwise.
function pageLocale(): Locale {
  const lang = document.documentElement.lang
  const match = Object.entries(LOCALES).find(([, info]) => info.lang === lang)
  return (match === undefined ? 'en' : match[0]) as Locale
}
