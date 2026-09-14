// The build-time half of the /vs/ realized-APY comparison: it reads the backfilled dataset and
// turns it into the sampled growth series the page draws.
//
// The geometry and the arithmetic live in ./lst-geometry.ts, which deliberately imports nothing
// from here — that module is also loaded by the browser, and this one pulls in a 169 KB JSON.
//
// See specs/realized-apy-comparison.md. The measurement is `rate(t) / rate(t0)` per protocol, read
// from each protocol's own contracts at historical blocks and backfilled into lst-rates.json by
// scripts/backfill-lst-rates.mjs. Nothing here is advertised, projected or annualized — the growth
// factors are what the chain returned.
import rates from './lst-rates.json' with { type: 'json' }
import { COMPARED, type GrowthSeries, type Protocol } from './lst-geometry.ts'

// Every 7th day, plus the final day. A realized-growth curve is monotone and very smooth, so ~105
// points draw the same line as 731 — and this array is inlined into the HTML of every locale's
// page, where the difference is 3 KB against 22 KB. The endpoints are exact either way, which is
// what the headline figures are read from.
const STRIDE = 7

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
