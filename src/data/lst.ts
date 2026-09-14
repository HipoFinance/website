// The build-time half of the /vs/ realized-APY comparison: it reads the backfilled dataset, tops
// it up from the gauge, and turns the result into the sampled growth series the page draws.
//
// The geometry and the arithmetic live in ./lst-geometry.ts, which deliberately imports nothing
// from here — that module is also loaded by the browser, and this one pulls in a 169 KB JSON.
//
// See specs/realized-apy-comparison.md. The measurement is `rate(t) / rate(t0)` per protocol,
// where the rate is the total GRAM a protocol holds over the liquid tokens it has issued. Nothing
// here is advertised, projected or annualized — the factors are what the chain returned.
//
// TWO SOURCES, ONE RULE. `lst-rates.json` is a two-year backfill committed to this repo;
// `gauge.hipo.finance/lst-rates` is a live tail that gauge appends one reading to per UTC day.
// They can never disagree, because **the committed file is authoritative for every date it
// contains and the gauge supplies only dates after its last one**. That is the whole conflict
// resolution — there is no merge, no preference order to get wrong, and re-cutting the baseline
// simply moves the boundary forward.
import rates from './lst-rates.json' with { type: 'json' }
import { COMPARED, type GrowthSeries, type Protocol } from './lst-geometry.ts'

// Every 7th day, plus the final day. A realized-growth curve is monotone and very smooth, so ~105
// points draw the same line as 731 — and this array is inlined into the HTML of every locale's
// page, where the difference is 3 KB against 22 KB. The endpoints are exact either way, which is
// what the headline figures are read from.
const STRIDE = 7

// Override at dev/build time to point at a local or mock gauge, the same way
// src/data/prometheus-query.ts allows for Prometheus:
//   PUBLIC_LST_TAIL_URL=http://localhost:8787/lst-rates npm run build
const TAIL_URL = (import.meta.env.PUBLIC_LST_TAIL_URL as string | undefined) ?? 'https://gauge.hipo.finance/lst-rates'
// Long enough for a cold gauge, short enough that an unreachable host cannot stall a deploy.
const FETCH_TIMEOUT_MS = 10000

const PROTOCOLS = ['hipo', ...COMPARED] as Protocol[]

interface DailySample {
  staked: string
  supply: string
}

interface TailResponse {
  ok?: boolean
  result?: { protocols?: Record<string, { samples?: Record<string, DailySample> }> }
}

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const dayMs = 86400000

/**
 * The gauge's live tail, or undefined. Never rejects and never fails the build: without it the
 * comparison simply ends on the baseline's last day, which is correct, just older.
 */
async function fetchTail(): Promise<Record<string, Record<string, DailySample>> | undefined> {
  try {
    const res = await fetch(TAIL_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      // The gauge host sits behind Cloudflare, which answers a bare Node fetch's default
      // user-agent with a challenge. Identify the build instead of looking like a bot.
      headers: { 'user-agent': 'hipo-website-build (+https://hipo.finance)' },
    })
    if (!res.ok) {
      throw new Error('HTTP ' + res.status)
    }
    const body = (await res.json()) as TailResponse
    if (body.ok !== true || body.result?.protocols === undefined) {
      throw new Error('unexpected payload')
    }
    const out: Record<string, Record<string, DailySample>> = {}
    for (const [id, entry] of Object.entries(body.result.protocols)) {
      out[id] = entry.samples ?? {}
    }
    return out
  } catch (e) {
    console.warn('[lst] gauge tail unavailable, /vs/ will end at the committed baseline:', (e as Error).message)
    return undefined
  }
}

let pending: Promise<GrowthSeries> | undefined

/** The sampled growth series, computed once per build and shared by every prerendered page. */
export function growthSeries(): Promise<GrowthSeries> {
  if (pending === undefined) {
    pending = buildSeries()
  }
  return pending
}

async function buildSeries(): Promise<GrowthSeries> {
  const baselineStart = Date.parse(rates.start + 'T00:00:00Z')
  const baselineEnd = baselineStart + (rates.days - 1) * dayMs
  const tail = await fetchTail()

  // How far past the baseline the gauge can carry us. A tail date at or before the baseline's last
  // day is ignored outright rather than compared — see the rule in this file's header.
  let end = baselineEnd
  if (tail !== undefined) {
    for (const samples of Object.values(tail)) {
      for (const date of Object.keys(samples)) {
        const ms = Date.parse(date + 'T00:00:00Z')
        if (Number.isFinite(ms) && ms > end) {
          end = ms
        }
      }
    }
  }

  // A contiguous day grid, so the x-axis stays linear in time even when the gauge missed a day.
  // A day nothing covers becomes NaN and the chart draws a gap rather than a straight line
  // through it.
  const total = Math.round((end - baselineStart) / dayMs) + 1
  const days: string[] = []
  for (let i = 0; i < total; i++) {
    days.push(isoDay(baselineStart + i * dayMs))
  }

  const growth = {} as Record<Protocol, number[]>
  for (const id of PROTOCOLS) {
    const baseline = (rates.protocols as Record<string, { staked: (string | null)[]; supply: (string | null)[] }>)[id]
    const tailSamples = tail?.[id] ?? {}

    const rate: number[] = []
    for (let i = 0; i < total; i++) {
      let staked: string | null | undefined
      let supply: string | null | undefined
      if (i < rates.days) {
        staked = baseline.staked[i]
        supply = baseline.supply[i]
      } else {
        const sample = tailSamples[days[i]]
        staked = sample?.staked
        supply = sample?.supply
      }
      rate.push(staked == null || supply == null ? Number.NaN : Number(staked) / Number(supply))
    }

    const base = rate[0]
    if (!Number.isFinite(base)) {
      throw new Error(`lst: ${id} has no rate on the first day of the window — it cannot anchor a growth series`)
    }
    // Rounded to 7 places: at the largest offered stake that is a hundredth of a GRAM, and it is
    // what keeps the inlined payload small.
    rate.forEach((v, i) => {
      rate[i] = Number.isFinite(v) ? Math.round((v / base) * 1e7) / 1e7 : Number.NaN
    })
    growth[id] = rate
  }

  // Sample down, always keeping the last day: it is where every headline figure is read from.
  const indices: number[] = []
  for (let i = 0; i < total; i += STRIDE) {
    indices.push(i)
  }
  if (indices[indices.length - 1] !== total - 1) {
    indices.push(total - 1)
  }

  const sampled = {} as Record<Protocol, number[]>
  for (const id of PROTOCOLS) {
    sampled[id] = indices.map((i) => growth[id][i])
  }

  const lastBaseline = isoDay(baselineEnd)
  if (days[days.length - 1] !== lastBaseline) {
    console.log(`[lst] gauge tail carried the comparison from ${lastBaseline} to ${days[days.length - 1]}`)
  }

  return { days: indices.map((i) => days[i]), growth: sampled }
}
