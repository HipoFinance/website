// Pure geometry and arithmetic for the /vs/ realized-APY chart.
//
// Split out of src/data/lst.ts so that it carries NO import of lst-rates.json. This module is
// imported by src/scripts/vs-stake.js, which runs in the visitor's browser — an import of the
// 169 KB dataset here would be bundled into that script and shipped to every visitor. The dataset
// stays on the build side; only the ~100 sampled growth factors the page actually draws are
// inlined into the HTML.
//
// Same functions at build time and on the client, so the chart cannot jump the first time the
// stake is changed. See specs/realized-apy-comparison.md.

export const COMPARED = ['tonstakers', 'stakee'] as const
export type Compared = (typeof COMPARED)[number]
export type Protocol = 'hipo' | Compared

export interface GrowthSeries {
  /** ISO dates, one per sampled point. */
  days: string[]
  /** Growth factor since the first day, per protocol: 1.0 on day one. */
  growth: Record<Protocol, number[]>
}

export interface ChartPoint {
  x: number
  y: number
}

export interface ChartTick {
  y: number
  value: number
}

export interface ChartGeometry {
  width: number
  height: number
  /** One entry per compared protocol, in COMPARED order. */
  series: {
    id: Compared
    path: string
    area: string
    endX: number
    endY: number
    endValue: number
    /** Row for this series' end labels, resolved so they never collide — see the sweep below. */
    labelY: number
  }[]
  ticks: ChartTick[]
  /** Fraction digits the axis ticks (and the end-value labels read against them) should use — see
   *  the derivation where it's computed. */
  tickDigits: number
  xLabels: { x: number; day: string }[]
  zeroY: number
}

const MARGIN = { top: 16, right: 118, bottom: 34, left: 62 }

/** GRAM a Hipo staker earned above `id`, on `stake`, at every sampled point. */
export function extraGram(series: GrowthSeries, id: Compared, stake: number): number[] {
  return series.growth.hipo.map((h, i) => (h - series.growth[id][i]) * stake)
}

/**
 * Round `hi` up to a readable axis maximum, and the tick values under it.
 *
 * The LAST tick is the axis top, and it must land at or above `hi`: `chartGeometry` scales every
 * point against it, so a top tick below the data draws that part of the line outside the viewBox,
 * where it is simply not rendered. This used to stop at the last tick BELOW `hi` instead, which
 * hid whenever the grid happened to land above the data and bit the moment it did not — on
 * 2026-09-20 the top tick was 1,500 against a 1,685 GRAM peak, and the Tonstakers line ran off the
 * top of the chart with its end label at y = −15.7 (reported: "the label is off the chart and
 * invisible"). Hence the count is derived rather than walked.
 *
 * `step` is the smallest readable interval that is at least an eighth of `hi`, so the axis carries
 * roughly eight intervals.
 *
 * (2026-09-30) It used to be a quarter, i.e. four intervals, and `chartGeometry` padded `hi` by 8%
 * on top. The two together made the axis top overshoot the data badly at some magnitudes — worst
 * case, the drawn line filled only ~62% of the frame. Concretely: a live gap of 1,811 GRAM times
 * 1.08 was about to cross 2,000, which would have pushed the top tick from 2,000 to 3,000 — a third
 * of the line's height gone, and the grid down to three lines, on a chart already criticised for
 * looking flat. Eight intervals keeps the top at 2,000 for the same data while adding the
 * intermediate gridlines, which is what makes the early, small part of the series readable. The
 * padding is dropped with it: `count = ceil(hi / step)` below already guarantees the top tick lands
 * at or above the data, so the 8% was only compounding with the rung to cause the overshoot.
 */
export function axisTicks(hi: number): number[] {
  const raw = (hi || 1) / 8
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((k) => k * magnitude).find((k) => k >= raw) ?? 10 * magnitude
  // At least one interval, so an all-zero series still yields a non-zero top: `yOf` divides by it.
  // The epsilon keeps a `hi` that is already an exact multiple from adding an empty interval.
  const count = Math.max(1, Math.ceil(hi / step - 1e-9))
  const ticks: number[] = []
  for (let i = 0; i <= count; i++) {
    ticks.push((Math.round(i * 1e6) / 1e6) * step)
  }
  return ticks
}

/**
 * The chart's geometry for a given stake. Pure: same inputs, same SVG, at build time and in the
 * browser. The y-axis always starts at zero — the difference between these protocols is around a
 * percentage point, and a cropped axis would make that fill the frame (spec R15).
 *
 * Zero is at the TOP and the lines descend (2026-09-20). The series is a shortfall — GRAM a stake
 * did NOT earn at that protocol — and drawing a shortfall upwards put the two competitors above
 * Hipo's baseline on the one page arguing Hipo pays more. Read at a glance, which is how this
 * page is read, a higher line means a better protocol; the chart was saying the opposite of the
 * section it sits in. Inverted, Hipo is the reference at the top and each protocol falls away from
 * it by what it left on the table, which is both the honest reading and the intended one. The tick
 * VALUES go negative with it — the axis has to agree with the picture, and a downward axis labelled
 * with positive magnitudes would be the kind of quiet misdirection this page exists to call out.
 */
export function chartGeometry(series: GrowthSeries, stake: number, width = 940, height = 340): ChartGeometry {
  const n = series.days.length - 1
  let hi = 0
  for (const id of COMPARED) {
    for (const v of extraGram(series, id, stake)) {
      if (Number.isFinite(v) && v > hi) {
        hi = v
      }
    }
  }
  const ticks = axisTicks(hi)
  const top = ticks[ticks.length - 1]
  // Digits needed so the tick step itself is distinguishable — at a small stake the step can be a
  // fraction of a GRAM, and `maximumFractionDigits: 0` alone rounds every tick to "0, -0, -0" (2026-
  // 09-30). `axisTicks` always returns at least two entries (see its `count` floor), so ticks[1] is
  // the step. Capped at 2: below a hundredth of a GRAM the figure stops being meaningful.
  const step = ticks[1] - ticks[0]
  const tickDigits = Math.min(2, Math.max(0, Math.ceil(-Math.log10(step))))

  const xOf = (i: number) => MARGIN.left + (i / n) * (width - MARGIN.left - MARGIN.right)
  // v is a shortfall magnitude, so it grows DOWNWARD from the zero line at the top.
  const yOf = (v: number) => MARGIN.top + (v / top) * (height - MARGIN.top - MARGIN.bottom)

  const out: ChartGeometry = {
    width,
    height,
    series: [],
    // Negated for display: the axis reads 0, −500, −1,000 … downwards. `axisTicks` stays a plain
    // positive-magnitude helper, and `v === 0` keeps the zero line's own tick unsigned.
    ticks: ticks.map((v) => ({ y: yOf(v), value: v === 0 ? 0 : -v })),
    tickDigits,
    xLabels: [],
    zeroY: yOf(0),
  }

  for (let i = 0; i <= n; i += 13) {
    out.xLabels.push({ x: xOf(i), day: series.days[i] })
  }

  for (const id of COMPARED) {
    const vals = extraGram(series, id, stake)
    let path = ''
    let area = ''
    let pen = false
    let lastIndex = 0
    // x-index the current run started at, so that run's own area subpath closes back to ITS start,
    // not the series' first point — closing every run to the same x is what filled the wash under a
    // gap and left earlier runs as degenerate slivers (2026-09-30).
    let runStart = 0
    for (let i = 0; i <= n; i++) {
      const v = vals[i]
      if (!Number.isFinite(v)) {
        if (pen) {
          // The run that was just open ends here: close ITS subpath along the zero line before the
          // gap breaks it. `path` (the stroke) gets no such close — a stroke should break at a gap.
          area += `L${xOf(lastIndex).toFixed(1)} ${yOf(0).toFixed(1)}L${xOf(runStart).toFixed(1)} ${yOf(0).toFixed(1)}Z`
        }
        pen = false
        continue
      }
      if (!pen) {
        runStart = i
        area += 'M' + xOf(i).toFixed(1) + ' ' + yOf(v).toFixed(1)
      } else {
        area += 'L' + xOf(i).toFixed(1) + ' ' + yOf(v).toFixed(1)
      }
      path += (pen ? 'L' : 'M') + xOf(i).toFixed(1) + ' ' + yOf(v).toFixed(1)
      pen = true
      lastIndex = i
    }
    if (pen) {
      // The last run never hit a gap to close it, so close it here.
      area += `L${xOf(lastIndex).toFixed(1)} ${yOf(0).toFixed(1)}L${xOf(runStart).toFixed(1)} ${yOf(0).toFixed(1)}Z`
    }
    out.series.push({
      id,
      path,
      area,
      endX: xOf(lastIndex),
      endY: yOf(vals[lastIndex]),
      endValue: vals[lastIndex],
      labelY: 0, // resolved below, once every series' endY is known
    })
  }

  // Resolve each series' end-label row so two competitor labels — or a competitor and "Hipo" —
  // never overlap. Sweep over a COPY sorted by endY; `out.series` itself must stay in COMPARED
  // order because both consumers index it by id, so the sweep mutates the same objects by
  // reference rather than reordering the array.
  //
  // It takes TWO passes. The first pushes labels down out of each other's way, which is enough
  // while there is room below. When the lines end close together AND close to the floor there is
  // no room below — two protocols within a few GRAM of each other at the foot of the chart put
  // both labels past the x-axis row, and clamping them there alone just stacks them on top of one
  // another (the first pass alone left them 8.6px apart in exactly that case). The second pass
  // walks back up from the floor and lifts whatever the clamp would have collided.
  const LABEL_HALF = 14 // half-height of a two-line competitor label block
  const LABEL_GAP = 2 * LABEL_HALF + 2 // the closest two label rows may sit
  const HIPO_BOTTOM = 10 // how far the one-line Hipo label extends below its own baseline row
  const floor = height - MARGIN.bottom + LABEL_HALF - 6 // never past the x-axis row
  const byDepth = [...out.series].sort((a, b) => a.endY - b.endY)

  let occupied = out.zeroY + HIPO_BOTTOM
  for (const entry of byDepth) {
    entry.labelY = Math.max(entry.endY, occupied + LABEL_HALF + 2)
    occupied = entry.labelY + LABEL_HALF
  }

  let ceiling = floor
  for (let i = byDepth.length - 1; i >= 0; i--) {
    byDepth[i].labelY = Math.min(byDepth[i].labelY, ceiling)
    ceiling = byDepth[i].labelY - LABEL_GAP
  }

  return out
}

/** The figures the headline and the table show, for a given stake. */
export function stakeOutcome(series: GrowthSeries, stake: number) {
  const last = series.days.length - 1
  const hipoGrowth = series.growth.hipo[last]
  return {
    startDay: series.days[0],
    endDay: series.days[last],
    hipoEnd: hipoGrowth * stake,
    hipoEarned: (hipoGrowth - 1) * stake,
    others: COMPARED.map((id) => ({
      id,
      end: series.growth[id][last] * stake,
      earned: (series.growth[id][last] - 1) * stake,
      extra: (hipoGrowth - series.growth[id][last]) * stake,
    })),
  }
}

/** Presets offered next to the stake input. */
export const STAKE_PRESETS = [1000, 10000, 100000, 1000000]
export const DEFAULT_STAKE = 100000
