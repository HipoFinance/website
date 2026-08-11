# 2026-08-11 — hGRAM/GRAM rate history chart

Fifth session of the day, closing the follow-up recorded in the redesign and live-data
reports: Alireza deployed `hipo_treasury_hton_rate` (nginx commit `4620f0d` — the metric
itself had existed in the exporter all along; it is exactly treasury
`totalCoins/totalTokens`), so the Stats page can now chart the protocol exchange rate.

| Commit    | Description                                              |
| --------- | -------------------------------------------------------- |
| `22de545` | Add the hGRAM/GRAM rate history chart to the Stats page. |

### What changed

- **`charts/prometheus.ts`**: `hipo_treasury_hton_rate` added to the fixed `query_range`
  query — inserted after `hipo_treasury_total_coins`, byte-for-byte where the new nginx
  allowlist entry expects it — and to the `MetricName` union. No unit conversion; the
  metric is already a plain ratio.
- **`StatsPage.tsx`**: a sixth chart card, **"hGRAM / GRAM rate"**, placed after Active
  stakers so the 2-column grid pairs up as TVL+APY / stakers+rate / the two price charts.
  Coral line with the accent area fill, 4-decimal values (same formatting as the stat
  card), `%` delta.
- **Rate stat card**: now shows the green range delta computed from the fetched history
  (like the TVL and stakers cards); the "only goes up" caption remains as the flat/no-data
  fallback — `StatCard` already renders caption only when there is no non-flat delta.
- **`specs/metrics-proxy-nginx.conf`**: synced with the deployed config — the map now
  carries both accepted queries, the old 6-metric one (droppable once this ships) and the
  new 7-metric one.
- The HPO page sparkline shares `queryRange`, so it silently switches to the new query;
  both queries are allowlisted, so deploy order doesn't matter in either direction.

### Verification performed

- `encodeURIComponent` of the new client query compared byte-for-byte against the
  deployed nginx map entry: identical.
- Production probe of the new query returned 200 with all seven series; the 30-day
  `hipo_treasury_hton_rate` series reads 1.1362 → 1.1504, monotonic — the correct
  protocol rate, not the banned USD-quote ratio.
- `npm run build` clean; prettier clean; `tsc --noEmit` reports zero errors under `src/`.
- Browser pass skipped: the Chrome extension was disconnected, and localhost charts are
  CORS-blocked anyway (production-origin allowlist) — **verify the chart draws on
  hipo.finance after deploy**.

### Follow-ups

- Post-deploy: confirm the rate chart (and the HPO sparkline from the previous session)
  render on production.
- Tell Alireza once this is live so the old 6-metric allowlist entry can be dropped.
- Still outstanding from the combined colleague ask: expose `treasury.governance_fee` in
  `gauge.hipo.finance/data` to make the landing/stats protocol-fee figure live.
