import type { ChartPoint } from './prometheus'

export interface Delta {
  text: string
  direction: 'up' | 'down' | 'flat'
}

// First-to-last change over whatever window the caller already fetched. Lives here rather than
// inside LineChart because the Stats page's headline cards show the same figure as their
// green/coral delta line — and must show nothing at all when it isn't computable.
export function computeDelta(points: ChartPoint[], unit: 'pp' | '%'): Delta | undefined {
  const finite = points.filter((p) => Number.isFinite(p.v))
  if (finite.length < 2) {
    return undefined
  }
  const first = finite[0]
  const last = finite[finite.length - 1]
  if (unit === 'pp') {
    const diff = last.v - first.v
    return {
      text: (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' pp',
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
    }
  }
  if (first.v === 0) {
    return undefined
  }
  const pct = ((last.v - first.v) / Math.abs(first.v)) * 100
  return {
    text: (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%',
    direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
  }
}
