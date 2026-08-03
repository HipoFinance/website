# Time-series charts on the Stats page

**Status:** implemented — pending the reverse-proxy exposure of the
Prometheus query API at `gauge.hipo.finance/prometheus/api/v1/query_range`
(see below), until which every chart shows its in-card error state by design

## Goal

Give the Stats page (`/app/#/page=stats/`) Grafana-style history charts fed by
the Hipo Prometheus, alongside the existing gauge-fed figure cards. Five charts:
APY, Staked (TVL), hGRAM holders, hGRAM & GRAM price, HPO price.

## Data source

Prometheus `query_range` over HTTP, called directly from the browser. The
instance is currently internal; the maintainer will expose it behind a reverse
proxy (spec below). Until then the endpoint is unreachable and the charts show
their error state — everything else on the page is unaffected by design.

- Base URL: single constant `PROM_BASE` in `src/components/app/charts/prometheus.ts`:
  `https://gauge.hipo.finance/prometheus` — the query API path-mounted on the
  gauge host (the app calls `<base>/api/v1/query_range`), overridable at
  dev/build time via `PUBLIC_PROM_BASE`
  (e.g. `PUBLIC_PROM_BASE=http://localhost:9090 npm run dev`) for testing
  against a tunnelled or mock Prometheus.
  The base must be public HTTPS: the fetch runs in the visitor's browser, so a
  swarm-internal name (`http://prometheus1`) can never work — no public DNS,
  and mixed content is blocked on an https page. Note also that
  `gauge.hipo.finance/metrics` is the *scrape* endpoint — current values in
  text exposition format, no history, no CORS — it cannot feed the charts;
  only the Prometheus server's query API can, via the proxy route.
- Endpoint: `GET {PROM_BASE}/api/v1/query_range?query=…&start=…&end=…&step=…`.
  GET with no custom headers → CORS simple request, no preflight. Never POST.
- **One query string, fixed across all ranges** (only start/end/step vary):

```
max by (__name__) ({__name__=~"hipo_treasury_apy|hipo_treasury_total_coins|hipo_hton_holders_count|hipo_hton_current_price|hipo_hpo_current_price|hipo_ton_current_price"})
```

  `by (__name__)` keeps the metric name as the series key and dedups if an HA
  pair ever double-scrapes. A single fixed string is what makes the proxy
  allowlist and cache below practical — do not vary it per range.
- Metric names use the pre-rename tokens: `hton` = hGRAM, `ton` = GRAM.
  `hipo_treasury_total_coins` is nanotons → divide by 1e9 in the mapping layer.
  `hipo_treasury_apy` is already percent. Values arrive as strings
  (`[[ts, "1.23"], …]`); `Number(v)` and drop non-finite.
- Gauge collect interval is 5m (scrape 15s), so plain instant sampling at each
  step is the true level of every series; no `*_over_time` windowing.

### Ranges and steps (~300–400 points each)

| Range | span (s)   | step (s) |
| ----- | ---------- | -------- |
| 24h   | 86,400     | 300      |
| 7d    | 604,800    | 1,800    |
| 30d   | 2,592,000  | 7,200    |
| 90d   | 7,776,000  | 21,600   |
| 1y    | 31,536,000 | 86,400   |

Default **30d**. No "all"/3y — retention rolls off and the left edge would
silently move. `end = floor(now/step)*step`, `start = end − span`: inside one
step window every user requests a byte-identical URL, so the proxy cache
absorbs essentially all traffic.

### Caching, refresh, failure

- Module-level cache in `prometheus.ts`: `Map<rangeId, {fetchedAt, series}>`,
  TTL 300s, so range ping-pong and page remounts are instant.
- One in-flight `AbortController`; abort on range change and page unmount.
  `AbortSignal.timeout` backstop 15s. A request-sequence guard so a slow 1y
  response can never overwrite a later 24h selection.
- Auto-refresh: the page-scoped store refetches the active range every 300s
  while mounted, skipped when `document.hidden` or not mainnet. No global
  timer — the store only exists while the Stats page is mounted.
- The Refresh button additionally busts the active range's cache entry and
  refetches, alongside its existing `loadHipoGauge()` call. One button, one
  mental model.
- Failures never touch `Model` error state (`setErrorMessage` is for
  transaction errors). Chart cards show a quiet in-card error + Retry; figure
  cards render exactly as today. `result: []` with HTTP 200 is "No data for
  this range", never treated as loading.
- **Gaps:** the gauge exporter skips `Collect` on error, so series drop out of
  `/metrics` and `query_range` returns holes; series may have *different*
  timestamp sets. Build each series independently (never zip by index) and
  break the line path when `Δt > 2.5 × step` — an outage must read as a gap,
  not an interpolated straight line. Do not pad or extrapolate short history.

## Charts

All hand-rolled SVG — no chart dependency. Rationale: ≤ 370 points × ≤ 2
series; strokes bound to CSS variables re-theme on dark-mode toggle with zero
JS (the `.dark` class flip produces no React signal, which would force
destroy-and-recreate with a canvas library); and the code we'd write to
configure uPlot is comparable in size to drawing the paths ourselves. Escape
hatch: keep `LineChart` props library-shaped (`series`, `valueFormat`,
`height`); if zoom/brush is ever requested, swapping uPlot into that one file
is the move.

| # | Title              | Series (metric)                                              | Unit  | Shape        |
| - | ------------------ | ------------------------------------------------------------ | ----- | ------------ |
| 1 | APY                | `hipo_treasury_apy`                                           | %     | stepped line |
| 2 | Staked             | `hipo_treasury_total_coins` ÷ 1e9                             | GRAM  | line         |
| 3 | hGRAM holders      | `hipo_hton_holders_count`                                     | count | line         |
| 4 | hGRAM & GRAM price | `hipo_hton_current_price`, `hipo_ton_current_price`           | USD   | 2 lines      |
| 5 | HPO price          | `hipo_hpo_current_price`                                      | USD   | line         |

- APY is stepped (`H`/`V` path segments): it changes discretely per validator
  round; a slope would invent intermediate values.
- Prices split because HPO (~$0.002) on hGRAM/GRAM's axis (~$3–6) is a flat
  line on the floor; dual axes are forbidden. hGRAM and GRAM share chart 4
  deliberately — their spread is the staking premium.
- No area fills anywhere: honest zero-baseline areas would flatten TVL, and
  cropped-baseline areas are an anti-pattern. Lines with ~8% padded auto
  y-domain.

### Palette (validated with the dataviz palette validator, both surfaces)

CSS variables in `src/styles/app.css`; SVG strokes reference them directly.

```css
:root {
  --chart-hgram: #e2564b; /* also APY/Staked/Holders — protocol = hGRAM hue */
  --chart-gram: #0a88ca;
  --chart-hpo: #7e22ce;
  --chart-grid: rgba(119, 100, 100, 0.1);
  --chart-ink: #71665f;
}
.dark {
  --chart-hgram: #e2665a;
  --chart-gram: #3b9ad6;
  --chart-hpo: #a06ce0;
  --chart-grid: rgba(255, 255, 255, 0.08);
  --chart-ink: #b8aa9c;
}
```

Color follows the entity, never position: everything protocol/hGRAM is the
coral, GRAM the blue, HPO the purple. Brand `--color-orange` `#ff7e73` fails
contrast as a 2px line (2.48:1 on white; L 0.739 outside the dark band) —
these are re-stepped siblings, used only for chart strokes and legend chips.

### Card anatomy

- Same chrome as figure cards: `m-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-dark-800`
  (p-6, the plot needs width). Charts sit in a `max-w-3xl` column.
- Header row: title left (`text-lg font-bold`); **delta chip** right — change
  across the visible range, `+1.2 pp` for APY, `+8.4%` for the rest, colored
  `text-green-600` up / `text-orange` down, muted `over 30d` suffix. No
  absolute "latest" number in the header: the gauge-fed cards above carry the
  current values, and two sources for one number on one page will eventually
  disagree. The delta is derived from the chart's own data.
- Plot: height 200px mobile / 240px `sm:`, plus a ~24px x-axis band inside the
  container. Width via `ResizeObserver`, points computed in pixel space.
- Grid: 4 horizontal hairlines only, solid, `--chart-grid`. Tick labels 11px
  `tabular-nums` in `--chart-ink`. 2px series strokes,
  `stroke-linejoin="round"`.
- Last point of each series: 3px dot with a 2px surface ring + the formatted
  value in muted ink beside it (direct label; doubles as the contrast relief).
- Legend only on chart 4: color stroke chips + names above the plot.
- Y formats: APY `12.4%`; Staked compact `1.2M` (+ axis unit GRAM); holders
  compact count; USD significant-digit aware (`$3.42`, `$0.0021`). X ticks:
  24h `14:00` · 7d `Mon 12` · 30d/90d `12 Aug` · 1y `Aug`, localized via
  `navigator.language` like `Reward.tsx` does.

### Interaction

- Crosshair: vertical hairline snapping to the nearest sample, dot per series,
  tooltip (absolutely-positioned div clamped inside the card): localized
  timestamp header, then color chip + name + value rows, `tabular-nums`.
- **Synced across all five charts** through a single `hoveredTs` observable on
  the charts store — hovering one moves the hairline on all.
- Touch: tap-and-drag scrubs; tooltip offset ~48px above the touch point. On
  `touchstart` track dx/dy and only `preventDefault` once the gesture is
  clearly horizontal — vertical page scroll must survive over a 240px-tall
  chart on a 360px screen. Dismiss on touchend + ~2s or next tap elsewhere.
- Keyboard/a11y: container `tabindex=0`, `role="img"`, `aria-label` with
  metric, range, first/last/min/max; arrow keys move the crosshair, Home/End
  jump. Each card has a `<details>` "Show table" rendering the series as an
  HTML table (the non-visual escape hatch).
- No animations (also satisfies `prefers-reduced-motion`).

### States

- First load per range: fixed-height shimmer skeleton (no layout jump).
- Refetch/range switch with data on screen: keep the old chart at
  `opacity-60` with a small spinner in the header — never flash a skeleton
  over an existing chart.
- Error: in-card "Couldn't load history" + Retry. Empty: "No data for this
  range".

## Page structure (`StatsPage.tsx`)

```
Statistics / subtitle
[ 24h 7d 30d 90d 1y ]                 [⟳ Refresh]   ← one control row
── Protocol ──
  <Stats/> figure card (unchanged, max-w-lg)
  APY · Staked · hGRAM holders            [chart cards, max-w-3xl]
── Market ── (mainnet only, unchanged rule)
  hGRAM & GRAM price · HPO price          [chart cards]
  hGRAM | HPO | GRAM figure cards         (md:grid-cols-3 on desktop)
── testnet note (extended to mention charts)
```

**All charts are mainnet-only** (Prometheus scrapes the mainnet gauge), so the
entire chart subtree renders under `model.isMainnet` and unmounts on testnet —
no request is ever issued there, same rule as the market sections.

Range is app state like everything else: `#/page=stats/range=7d/` via
`readFragmentState`/`writeFragmentState`, whitelist-validated, omitted at the
default (30d). This is the only `Model.ts` change besides holding the range
observable; fetching, chart state and errors live in the page-scoped store.

## Files

- `src/components/app/charts/prometheus.ts` — new: `PROM_BASE`, range table,
  `queryRange()` (URL build, fetch, abort, parse, per-series `{t, v}[]`,
  module-level TTL cache).
- `src/components/app/charts/ChartsStore.ts` — new: page-scoped MobX store
  (`makeAutoObservable`), created in `StatsPage` via `useState`; holds per-range
  fetch status, series, `hoveredTs`, auto-refresh timer, `refresh()`.
- `src/components/app/charts/LineChart.tsx` — new: presentational SVG chart
  card (no Model import).
- `src/components/app/charts/RangeSelector.tsx` — new: segmented control.
- `src/components/app/StatsPage.tsx` — restructure per above.
- `src/components/app/Model.ts` — `statsRange` observable + fragment
  read/write/whitelist.
- `src/styles/app.css` — the CSS variables above.

## Reverse-proxy exposure spec (maintainer's infra repos)

A ready-to-adapt nginx config implementing everything below is at
`specs/metrics-proxy-nginx.conf` (upstream `prometheus1` + `prometheus2`
backup, exact-query and step allowlists, CORS, cache, rate limit), written
for the chosen mount: `location = /prometheus/api/v1/query_range` inside the
existing `gauge.hipo.finance` server block, with a rewrite stripping the
`/prometheus` prefix before `proxy_pass`. The exporter route
(`location = /metrics`) is unrelated and stays as-is. The nginx service must
be attached to the monitor overlay network so `prometheus1`/`prometheus2`
resolve.

A dedicated host (e.g. `metrics.hipo.finance`, HTTPS + HSTS) remains a fine
alternative — either way, never
path-mounted under `hipo.finance` (keeps cookies out of scope, independently
firewallable).

- **Allow exactly** `GET|HEAD|OPTIONS /api/v1/query_range`; everything else
  404. Never a `location /api/` prefix. The rest of the API either destroys
  (`/api/v1/admin/*`, `/-/reload`, `/-/quit`), leaks
  (`/api/v1/status/config` dumps prometheus.yml **including scrape
  credentials**; `/api/v1/targets`, `/api/v1/rules` map internal hosts;
  `/api/v1/series`, `/api/v1/labels` enumerate every job on the box), or
  bulk-exports (`/federate`, `/debug/pprof/*`).
- Deny POST (query_range accepts it; bodies dodge URL-length limits and logs).
- CORS: `Access-Control-Allow-Origin: https://hipo.finance` exact +
  `Vary: Origin`, no credentials header. 204 OPTIONS handler with
  `Max-Age: 86400`. CORS is not access control — the allowlist below is.
- Query guards: match `$arg_query` against the one fixed query string above
  (url-encoded); reject `step` missing/0, `(end−start)/step > 1500`,
  `end−start > 400d`, query > 300 chars.
- Cache before rate-limit: `proxy_cache_valid 200 5m` keyed on `$request_uri`,
  `Cache-Control: public, max-age=300` downstream;
  `limit_req rate=10r/m burst=10 nodelay` per IP. Step-snapped URLs mean
  Prometheus sees ~1 query per range per 5 minutes at any traffic level.
- Prometheus backstops: `--query.timeout=30s`, lowered `--query.max-samples`;
  confirm `--web.enable-admin-api` stays off.
- No API token in the frontend — a token in JS is not a secret.
- Log `$arg_query` truncated; alert on 4xx rate (probing signal).

## Local testing before the swarm launch

Prometheus runs on the swarm-internal `monitor` overlay network
(`prometheus1`/`prometheus2`, no published ports), so it cannot be reached
from a workstation directly. To test the charts against the real data before
deploying the proxy:

1. **Bridge** — the `monitor` network is not `attachable`, so join it with a
   one-off swarm *service* (a `docker run --network` would be refused). On a
   manager node:

   ```sh
   docker network ls --filter name=monitor          # find <stack>_monitor
   docker service create --name prom-bridge \
     --network <stack>_monitor \
     --publish published=19090,target=19090,mode=host \
     alpine/socat tcp-listen:19090,fork,reuseaddr tcp-connect:prometheus1:9090
   ```

2. **Tunnel** — from the workstation, forward a local port to the node
   running the bridge task (`docker service ps prom-bridge` shows which):

   ```sh
   ssh -N -L 9090:127.0.0.1:19090 <node>
   ```

3. **Point the app at it** — Prometheus answers its API with
   `Access-Control-Allow-Origin: *` by default (`--web.cors.origin`), so the
   dev server can call the tunnel directly, no local proxy needed:

   ```sh
   PUBLIC_PROM_BASE=http://localhost:9090 npm run dev
   # open http://localhost:4321/app/#/page=stats/
   ```

   Sanity checks while there: the figures roughly match the gauge cards
   above the charts; `hton`→hGRAM / `ton`→GRAM labels aren't swapped (compare
   against `curl 'http://localhost:9090/api/v1/query?query=hipo_hton_current_price'`);
   the left edge of the 1y range reflects how long the gauge has actually
   been scraped.

4. **Clean up** — `docker service rm prom-bridge` and drop the tunnel. The
   bridge exposes the raw, unguarded Prometheus API on the node's localhost
   for as long as it runs; treat it as a test fixture, not a deployment.

## Acceptance criteria

- [x] `npm run build` passes.
- [x] With the endpoint unreachable (its state today): Stats page renders,
      figure cards unaffected, each chart card shows the quiet error + Retry,
      no error overlay, no console spam beyond the failed fetches.
- [x] Against a local mock of `query_range` (temporary `PROM_BASE` override
      during verification only): five charts render; APY is stepped; prices
      split as specified; axis/tooltip formats per table; a series with a
      missing interval > 2.5×step renders a visible gap.
- [x] Range selector: five options, default 30d, `#/page=stats/range=7d/`
      round-trips (direct load opens Stats with 7d active), unknown values fall
      back to 30d, default omitted from the hash.
- [x] Crosshair syncs across all five charts; tooltip values match the mock
      data; keyboard arrows move the crosshair; table view shows the series.
- [x] Dark-mode toggle recolors charts with no remount (CSS vars only).
- [x] Testnet (`#network=testnet`): zero chart requests issued, charts absent,
      note shown.
- [x] Refresh button: busts the active range cache + refetches charts and
      gauge together; disabled/spinning state unchanged from before.
- [x] Mobile 360px: cards fit, vertical scroll works over charts, touch scrub
      shows tooltip above the finger (tooltip position asserted by code review;
      the rest measured).

### Verification status

Driven with Playwright against the installed Chrome from a scratchpad outside
the repo (the Claude Chrome extension would not connect, same as the previous
session; no test dependency added to the project). 23 automated assertions,
all passing, against the dev server plus a local mock `query_range` server
that generates all six metrics with a deliberate outage between 55% and 65% of
every window: request shape (one fetch on load, step snapping, all six metrics
in the single query), stepped-vs-linear paths, gap breaks, 2-series price
chart, crosshair sync (5 hairlines, exactly 1 tooltip), range round-trip via
hash including the bogus-value fallback, dark-mode restroke without remount
(`rgb(226,86,75)` → `rgb(226,102,90)`), table view, testnet (zero requests),
endpoint-down degradation (5 error cards, page alive), and 360px overflow.

Three defects found and fixed during review/verification, none by the build:

1. A failed 300s auto-refresh replaced rendered charts with error cards; now a
   refresh failure keeps the last good data, matching the gauge rule.
2. The tooltip rendered on all five charts at once because it keyed off the
   shared `hoveredTs`; now gated on the local pointer/focus, so the crosshair
   syncs but only the hovered chart gets a tooltip.
3. At 360px the control row overflowed by 67px (now wraps) and y-tick labels
   collided with last-point value labels in the shared right-hand band (now
   the colliding tick label is dropped).
