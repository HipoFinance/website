import type { ChartPoint } from './prometheus'

export type DeltaUnit = 'pp' | '%'

// `value` is in the unit's own scale: percentage points for 'pp', percent (3.2 for +3.2%) for '%'.
// Formatting is the caller's job (StatsPage builds a locale-aware DeltaFormat from the Model), so
// this module stays free of both the Model and any English text.
export interface Delta {
  value: number
  unit: DeltaUnit
  direction: 'up' | 'down' | 'flat'
}

export type DeltaFormat = (delta: Delta) => string

// First-to-last change over whatever window the caller already fetched. Lives here rather than
// inside LineChart because the Stats page's headline cards show the same figure as their
// green/coral delta line — and must show nothing at all when it isn't computable.
export function computeDelta(points: ChartPoint[], unit: DeltaUnit): Delta | undefined {
  const finite = points.filter((p) => Number.isFinite(p.v))
  if (finite.length < 2) {
    return undefined
  }
  const first = finite[0]
  const last = finite[finite.length - 1]
  if (unit === 'pp') {
    const diff = last.v - first.v
    return { value: diff, unit, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat' }
  }
  if (first.v === 0) {
    return undefined
  }
  const pct = ((last.v - first.v) / Math.abs(first.v)) * 100
  return { value: pct, unit, direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' }
}
