// Build-time seed for the Stats page's four headline cards.
//
// Three of their figures come from the gauge (src/data/gauge.ts) and are already baked in. The
// rest have no gauge equivalent and used to appear only once the island had read the chain or
// fetched chart history: the hGRAM/GRAM rate, and the "▲ +x% over 1M" delta line under TVL,
// stakers and rate. This fetches them from the same Prometheus range the charts use, so the
// cards are complete in the HTML and on the island's first paint.
//
// Only the two endpoints of each series are kept, never the ~360 points themselves — the full
// response is ~70 KB and inlining it on every locale's Stats page would cost far more than the
// cards are worth. computeDelta() only ever looks at the first and last finite point anyway, and
// this reproduces that rule exactly.
import { PROM_BASE, PROM_QUERY } from './prometheus-query.ts'

// The seed is computed for ONE range, and the card's delta line names its range ("over 1M"), so
// Model only uses it while `statsRange` still matches. 30d/7200 is Model's default — the range a
// visitor landing on /stats/ actually sees — and 7200 is on the proxy's allowed-step list.
export const SEEDED_RANGE = '30d'
const SEEDED_SPAN = 2592000
const SEEDED_STEP = 7200

const FETCH_TIMEOUT_MS = 15000

export type DeltaDirection = 'up' | 'down' | 'flat'

export interface SeededDelta {
  value: number
  unit: '%'
  direction: DeltaDirection
}

export interface StatsSeed {
  range: string
  // hGRAM/GRAM exchange rate, the one card value with no gauge equivalent.
  rate?: number
  deltas: {
    staked?: SeededDelta
    holders?: SeededDelta
    rate?: SeededDelta
  }
}

interface PromResponse {
  status?: string
  data?: { result?: Array<{ metric?: { __name__?: string }; values?: [number, string][] }> }
}

// One fetch per build, shared by every prerendered Stats page. Never rejects.
let pending: Promise<StatsSeed | undefined> | undefined

export function fetchStatsSeed(): Promise<StatsSeed | undefined> {
  if (pending === undefined) {
    pending = loadStatsSeed()
  }
  return pending
}

// Same URL shape as charts/prometheus.ts, and it has to stay that way: the proxy matches the
// percent-encoded query and the step against fixed strings (specs/metrics-proxy-nginx.conf) and
// answers 403 to anything else. encodeURIComponent is what produced the allowlisted string.
function seedUrl(): string {
  const end = Math.floor(Date.now() / 1000 / SEEDED_STEP) * SEEDED_STEP
  const start = end - SEEDED_SPAN
  return (
    PROM_BASE +
    '/api/v1/query_range?query=' +
    encodeURIComponent(PROM_QUERY) +
    '&start=' +
    start +
    '&end=' +
    end +
    '&step=' +
    SEEDED_STEP
  )
}

async function loadStatsSeed(): Promise<StatsSeed | undefined> {
  try {
    const res = await fetch(seedUrl(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      // The gauge host sits behind Cloudflare, which answers a bare Node fetch's default
      // user-agent with a challenge. Identify the build instead of looking like a bot.
      headers: { 'user-agent': 'hipo-website-build (+https://hipo.finance)' },
    })
    if (!res.ok) {
      throw new Error('HTTP ' + res.status)
    }
    const body = (await res.json()) as PromResponse
    if (body.status !== 'success') {
      throw new Error('status ' + String(body.status))
    }

    const series = new Map<string, number[]>()
    for (const item of body.data?.result ?? []) {
      const name = item.metric?.__name__
      if (name == null) {
        continue
      }
      const values: number[] = []
      for (const [, raw] of item.values ?? []) {
        const v = Number(raw)
        if (Number.isFinite(v)) {
          values.push(v)
        }
      }
      series.set(name, values)
    }

    const rateValues = series.get('hipo_treasury_hton_rate') ?? []
    return {
      range: SEEDED_RANGE,
      rate: rateValues.length > 0 ? rateValues[rateValues.length - 1] : undefined,
      deltas: {
        // Scale is irrelevant to a percentage change, so total_coins stays in nanotons here
        // rather than being divided by 1e9 the way the chart client does.
        staked: percentDelta(series.get('hipo_treasury_total_coins')),
        holders: percentDelta(series.get('hipo_hton_holders_count')),
        rate: percentDelta(rateValues),
      },
    }
  } catch (e) {
    // A warning, not an error: the cards degrade to exactly what they showed before this existed
    // — empty until the island reads the chain and its chart history.
    console.warn('[stats] seed unavailable, Stats cards will fill in client-side:', (e as Error).message)
    return undefined
  }
}

// The same first-to-last rule as computeDelta() in src/components/app/charts/delta.ts, for the
// '%' unit. Kept in step with it: a change there belongs here too.
function percentDelta(values: number[] | undefined): SeededDelta | undefined {
  if (values === undefined || values.length < 2) {
    return undefined
  }
  const first = values[0]
  const last = values[values.length - 1]
  if (first === 0) {
    return undefined
  }
  const pct = ((last - first) / Math.abs(first)) * 100
  return { value: pct, unit: '%', direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' }
}
