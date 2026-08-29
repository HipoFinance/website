import type { StatsRange } from '../Model'

// Single fixed query string across every range (only start/end/step vary) so the reverse-proxy
// allowlist and cache can match on it verbatim; `by (__name__)` keeps the metric name as the
// series key and dedups an HA scrape pair. Metric names use the pre-rename tokens: `hton` =
// hGRAM, `ton` = GRAM. Both constants live in src/data/prometheus-query.ts because the
// build-time seed fetch (src/data/stats.ts) and the nginx allowlist have to agree with them —
// see the note there. Until that proxy is deployed every chart shows its quiet in-card error
// state, by design; nothing else on the page is affected.
import { PROM_BASE, PROM_QUERY as QUERY } from '../../../data/prometheus-query.ts'

export { PROM_BASE }

export type MetricName =
  | 'hipo_treasury_apy'
  | 'hipo_treasury_total_coins'
  | 'hipo_treasury_hton_rate'
  | 'hipo_treasury_protocol_fee'
  | 'hipo_hton_holders_count'
  | 'hipo_hton_current_price'
  | 'hipo_ton_current_price'
  | 'hipo_hpo_current_price'

export interface ChartPoint {
  t: number
  v: number
}

export type SeriesMap = Partial<Record<MetricName, ChartPoint[]>>

export interface QueryRangeResult {
  start: number
  end: number
  series: SeriesMap
}

export const STATS_RANGES: StatsRange[] = ['24h', '7d', '30d', '90d', '1y']

// Display labels for the range switcher and the chart captions. The design asks for
// 1W / 1M / 1Y / All; these are the same shorthand over the ranges the store actually supports.
// There is deliberately no "All" — see the RANGE_CONFIG note below.
// Catalog keys for the range pills ("24H", "1W", …); resolved through model.t by the callers.
export const RANGE_LABEL_KEYS: Record<StatsRange, string> = {
  '24h': 'app.chart.range24h',
  '7d': 'app.chart.range1w',
  '30d': 'app.chart.range1m',
  '90d': 'app.chart.range3m',
  '1y': 'app.chart.range1y',
}

interface RangeConfig {
  span: number
  step: number
}

// ~300-400 points per range. Default is 30d (see Model.ts). No "all"/3y: retention rolls off and
// the left edge would silently move.
const RANGE_CONFIG: Record<StatsRange, RangeConfig> = {
  '24h': { span: 86400, step: 300 },
  '7d': { span: 604800, step: 1800 },
  '30d': { span: 2592000, step: 7200 },
  '90d': { span: 7776000, step: 21600 },
  '1y': { span: 31536000, step: 86400 },
}

export function stepFor(range: StatsRange): number {
  return RANGE_CONFIG[range].step
}

const cacheTtlMs = 300 * 1000

const cache = new Map<StatsRange, { fetchedAt: number; result: QueryRangeResult }>()

export function bustCache(range: StatsRange) {
  cache.delete(range)
}

interface PromApiResponse {
  status: string
  data?: {
    result?: Array<{
      metric?: { __name__?: string }
      values?: [number, string][]
    }>
  }
}

// AbortSignal.any isn't available in every browser this app still supports, so fall back to a
// manually wired controller that aborts as soon as any input signal does.
function combineSignals(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any(signals)
  }
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      break
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }
  return controller.signal
}

// One fetch per range for every series. Never zip series by index: the gauge exporter skips
// Collect on error, so series drop out of /metrics independently and query_range returns holes —
// each series must be built from its own timestamp set.
export async function queryRange(
  range: StatsRange,
  signal?: AbortSignal,
  opts: { bustCache?: boolean } = {},
): Promise<QueryRangeResult> {
  if (opts.bustCache === true) {
    cache.delete(range)
  }
  const cached = cache.get(range)
  if (cached != null && Date.now() - cached.fetchedAt < cacheTtlMs) {
    return cached.result
  }

  const { span, step } = RANGE_CONFIG[range]
  // Step-snapped so every user requests a byte-identical URL inside one step window, which is
  // what makes the proxy cache absorb essentially all traffic.
  const end = Math.floor(Date.now() / 1000 / step) * step
  const start = end - span

  const url =
    PROM_BASE +
    '/api/v1/query_range?query=' +
    encodeURIComponent(QUERY) +
    '&start=' +
    start +
    '&end=' +
    end +
    '&step=' +
    step

  const signals = [AbortSignal.timeout(15000)]
  if (signal != null) {
    signals.push(signal)
  }

  const res = await fetch(url, { signal: combineSignals(signals) })
  if (!res.ok) {
    throw new Error('query_range failed: ' + res.status)
  }
  const body = (await res.json()) as PromApiResponse
  if (body.status !== 'success') {
    throw new Error('query_range status: ' + body.status)
  }

  const series: SeriesMap = {}
  for (const item of body.data?.result ?? []) {
    const name = item.metric?.__name__ as MetricName | undefined
    if (name == null) {
      continue
    }
    const points: ChartPoint[] = []
    for (const [t, raw] of item.values ?? []) {
      const v = Number(raw)
      if (Number.isFinite(v)) {
        // hipo_treasury_total_coins is nanotons; every other metric is already in display units.
        points.push({ t, v: name === 'hipo_treasury_total_coins' ? v / 1e9 : v })
      }
    }
    series[name] = points
  }

  const result: QueryRangeResult = { start, end, series }
  cache.set(range, { fetchedAt: Date.now(), result })
  return result
}
