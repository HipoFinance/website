import type { ChartPoint } from './prometheus'

// hGRAM's dollar price, computed from GRAM's price and the protocol's redemption rate rather than
// read from the `hipo_hton_current_price` series.
//
// That series is CoinGecko's volume-weighted average of hGRAM's DEX tickers, and it is not
// reliable: through August and September 2026 it alternated between ~1.158 GRAM and 0.864 — the
// same number upside down — because the ticker carrying most of the weighted volume reported its
// pool inverted. A published price below GRAM's is not a market event, it is impossible: one hGRAM
// redeems at the treasury for `hipo_treasury_hton_rate` GRAM, on demand, and that rate starts at 1
// and only rises.
//
// Both inputs here are sound: GRAM's price is a deep, many-venue market that no single bad ticker
// moves, and the rate is read straight off the treasury contract. Their product is what an hGRAM
// is worth, and it is right for the whole history as well as for today — which is why the chart
// derives it instead of waiting for a fixed feed to accumulate correct points.
//
// Joined on timestamp, never by index: the gauge exporter drops a series it could not read rather
// than holding its last value, so the two arrive with independent holes.
export function deriveHgramPrice(gramPrice: ChartPoint[], rate: ChartPoint[]): ChartPoint[] {
  if (gramPrice.length === 0 || rate.length === 0) {
    return []
  }

  const rateAt = new Map<number, number>()
  for (const point of rate) {
    rateAt.set(point.t, point.v)
  }

  const points: ChartPoint[] = []
  for (const point of gramPrice) {
    const r = rateAt.get(point.t)
    // A rate below 1 cannot come from the treasury, so it is a bad sample rather than a cheap
    // hGRAM: skipped, leaving a gap the chart draws as a gap.
    if (r != null && r >= 1) {
      points.push({ t: point.t, v: point.v * r })
    }
  }
  return points
}
