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
  series: { id: Compared; path: string; area: string; endX: number; endY: number; endValue: number }[]
  ticks: ChartTick[]
  xLabels: { x: number; day: string }[]
  zeroY: number
}

const MARGIN = { top: 16, right: 118, bottom: 34, left: 62 }

function rateSeries(id: Protocol): (number | null)[] {
  const p = (rates.protocols as Record<string, { staked: (string | null)[]; supply: (string | null)[] }>)[id]
  return p.staked.map((s, i) => {
    const u = p.supply[i]
    return s === null || u === null ? null : Number(s) / Number(u)
  })
}

let cached: GrowthSeries | undefined

/** The sampled growth series, computed once per build. */
export function growthSeries(): GrowthSeries {
  if (cached !== undefined) {
    return cached
  }
  const start = Date.parse(rates.start + 'T00:00:00Z')
  const total = rates.days

  const indices: number[] = []
  for (let i = 0; i < total; i += STRIDE) {
    indices.push(i)
  }
  if (indices[indices.length - 1] !== total - 1) {
    indices.push(total - 1)
  }

  const days = indices.map((i) => new Date(start + i * 86400000).toISOString().slice(0, 10))
  const growth = {} as Record<Protocol, number[]>
  for (const id of ['hipo', ...COMPARED] as Protocol[]) {
    const r = rateSeries(id)
    const base = r[0]
    if (base === null || base === undefined) {
      throw new Error(`lst: ${id} has no rate on the first day of the window — it cannot anchor a growth series`)
    }
    // Rounded to 7 places: at the largest offered stake that is a hundredth of a GRAM, and it is
    // what keeps the inlined payload small.
    growth[id] = indices.map((i) => {
      const v = r[i]
      return v === null ? Number.NaN : Math.round((v / base) * 1e7) / 1e7
    })
  }
  cached = { days, growth }
  return cached
}

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
 * `step` is the smallest readable interval that is at least a quarter of `hi`, so the axis is
 * always four intervals or fewer.
 */
export function axisTicks(hi: number): number[] {
  const raw = (hi || 1) / 4
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
  const ticks = axisTicks(hi * 1.08)
  const top = ticks[ticks.length - 1]

  const xOf = (i: number) => MARGIN.left + (i / n) * (width - MARGIN.left - MARGIN.right)
  const yOf = (v: number) => height - MARGIN.bottom - (v / top) * (height - MARGIN.top - MARGIN.bottom)

  const out: ChartGeometry = {
    width,
    height,
    series: [],
    ticks: ticks.map((v) => ({ y: yOf(v), value: v })),
    xLabels: [],
    zeroY: yOf(0),
  }

  for (let i = 0; i <= n; i += 13) {
    out.xLabels.push({ x: xOf(i), day: series.days[i] })
  }

  for (const id of COMPARED) {
    const vals = extraGram(series, id, stake)
    let path = ''
    let pen = false
    let lastIndex = 0
    for (let i = 0; i <= n; i++) {
      const v = vals[i]
      if (!Number.isFinite(v)) {
        pen = false
        continue
      }
      path += (pen ? 'L' : 'M') + xOf(i).toFixed(1) + ' ' + yOf(v).toFixed(1)
      pen = true
      lastIndex = i
    }
    out.series.push({
      id,
      path,
      // Closed back along the zero line: the filled band is "what Hipo earned on top", which is
      // the whole point of the chart.
      area:
        path === ''
          ? ''
          : path + `L${xOf(lastIndex).toFixed(1)} ${yOf(0).toFixed(1)}L${xOf(0).toFixed(1)} ${yOf(0).toFixed(1)}Z`,
      endX: xOf(lastIndex),
      endY: yOf(vals[lastIndex]),
      endValue: vals[lastIndex],
    })
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
