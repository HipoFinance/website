// The one Prometheus query the site is allowed to send, and the steps it may send it with.
//
// It lives here, on its own, because three places have to agree on it byte-for-byte:
//
//   1. src/components/app/charts/prometheus.ts — the dApp's chart fetch, in the browser.
//   2. src/data/stats.ts — the build-time fetch that seeds the Stats page's headline cards.
//   3. specs/metrics-proxy-nginx.conf — the reverse proxy's allowlist, which matches the
//      percent-encoded query and the step against fixed strings and returns 403 for anything
//      else. CORS is not the access control there; this allowlist is.
//
// So a chart change that edits the query needs the nginx map updated in the same deploy, and the
// metric names must keep this exact order. Everything else about the request (start/end) varies.
export const PROM_QUERY =
  'max by (__name__) ({__name__=~"hipo_treasury_apy|hipo_treasury_total_coins|hipo_treasury_hton_rate|hipo_treasury_protocol_fee|hipo_hton_holders_count|hipo_hton_current_price|hipo_hpo_current_price|hipo_ton_current_price"})'

// This code runs in the visitor's browser as well as at build time, so the base must be a public
// HTTPS URL — never a swarm-internal name like prometheus1. The route is an nginx path-mount on
// the gauge host that proxies only /api/v1/query_range (see specs/app-stats-charts.md). Override
// at dev/build time for a tunnelled or mock Prometheus:
//   PUBLIC_PROM_BASE=http://localhost:9090 npm run dev
export const PROM_BASE =
  (import.meta.env.PUBLIC_PROM_BASE as string | undefined) ?? 'https://gauge.hipo.finance/prometheus'
