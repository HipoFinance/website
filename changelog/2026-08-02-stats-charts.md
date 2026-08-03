# 2026-08-02 — Stats page: restore from stash, add Prometheus history charts

Two pieces of work in one session. First, the Stats _figures_ page designed in
`specs/app-stats-page.md` — whose tracked-file edits existed only in a git
stash (`stash@{0}`, cut from `4b4d36c`) while the spec claimed "implemented" —
was restored: `git stash apply` merged cleanly over the six newer
transaction-polling commits, and the build passed unchanged. Second, the page
gained what it was ultimately for: Grafana-style time-series charts fed by the
Hipo Prometheus, per the new `specs/app-stats-charts.md`.

## Commits

Committed the following morning (2026-08-03):

| Commit    | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `e235b46` | Add Stats page with Prometheus history charts                     |
| `f651f05` | Mount the Prometheus query route at gauge.hipo.finance/prometheus |
| `dfeffc6` | Hide upstream CORS headers in the Prometheus proxy template       |

## What changed

- **Figures page restored** (from stash): `'stats'` in `ActivePage` and the
  fragment whitelist, the fourth nav entry, the `App.tsx` branch, the widened
  typed gauge with 300s refresh and `isGaugeRefreshing`, and `StatsPage.tsx`.
- **Five SVG history charts** on `/app/#/page=stats/`: APY (stepped — it moves
  per validator round), Staked, hGRAM holders, hGRAM & GRAM price (two series;
  their spread is the staking premium), HPO price (alone — $0.002 on a $3 axis
  would flatline). Crosshair synced across all five through one MobX
  observable; tooltip only on the hovered/focused chart; touch scrubbing that
  preserves vertical scroll; keyboard crosshair; per-card `<details>` table
  view; delta chips; skeleton/dim/error/empty states.
- **No chart library.** Hand-rolled SVG, strokes bound to CSS variables in
  `app.css`, so the `.dark` class flip re-themes charts with zero JS — the
  deciding argument, since the theme toggle produces no React signal.
  Escape hatch documented in the spec: `LineChart` props are library-shaped,
  so uPlot can replace the internals of one file if zoom/brush is ever asked
  for. Palette validated with the dataviz checker against both card surfaces;
  brand orange `#ff7e73` fails as a 2px line, so charts use re-stepped
  siblings (`#e2564b`/`#e2665a` etc.).
- **Data layer** in `src/components/app/charts/`: one fixed `query_range`
  query for all six metrics (`max by (__name__)` keeps names as keys),
  step-snapped start/end so every user in a 5-minute window requests a
  byte-identical URL, module-level 300s cache, abort + sequence guard,
  page-scoped `ChartsStore` created per mount. `Model.ts` gained only the
  `statsRange` hash-fragment state (`range=7d`, default 30d omitted). Gaps
  break the line when Δt > 2.5×step — the gauge exporter drops series from
  `/metrics` on collection errors, so outages must read as gaps.
- **Mainnet-only**: the chart subtree renders under `model.isMainnet`, so
  testnet issues zero Prometheus requests; the testnet note now mentions
  charts.
- **Token figure cards widened** (maintainer feedback): the hGRAM/HPO/GRAM
  grid goes 3-across only from `lg` (at `md` the thirds are ~245px and
  label/value pairs nearly touched) and card padding dropped from `p-8` to
  `p-6`, matching the chart cards.
- **USD price format unified** (maintainer feedback): `formatUsdPrice` in
  `Model.ts` switched from 8 fraction digits to 4 significant digits for
  sub-$1 values ($0.00219615 → $0.002196), is now exported, and the charts
  use it instead of a local duplicate — figure cards and charts can no longer
  drift apart.

## Design process

Two independent Opus design passes (operational-simplicity framing vs UX
framing) were synthesized: ops won the library (hand-rolled SVG over uPlot)
and the single-fixed-query data layer; UX won the page structure, the split
price charts, stepped APY, delta chips, synced crosshair, and the validated
palette. Declined from the UX pass: `avg_over_time` windowing (unnecessary at
a 15s scrape interval, and it would break the single fixed query string), area
fills (zero-baseline flattens TVL; cropped baselines lie), and a 3y/"all"
range (retention roll-off silently moves the left edge). Declined from the ops
pass: three separate single-series price charts (hGRAM+GRAM belong together)
and skipping URL persistence of the range.

## Pending infra (maintainer)

The query API is not exposed yet; the app targets
`https://gauge.hipo.finance/prometheus/api/v1/query_range` — an nginx
path-mount on the gauge host proxying to the internal
`prometheus1`/`prometheus2` pair. (Settled after some back-and-forth: the
base must be public HTTPS because the fetch runs in visitors' browsers, so
swarm-internal names can't work; and `/metrics` is the exporter's scrape
endpoint — snapshot only, no history — so the mount got its own
`/prometheus` prefix.) The reverse-proxy spec is
in `specs/app-stats-charts.md`, and a ready-to-adapt nginx config
(`prometheus1` + `prometheus2` backup upstream, exact-query and step
allowlists, CORS, 5m cache, rate limit) is at
`specs/metrics-proxy-nginx.conf`. Until deployed, charts show their in-card
error state and nothing else on the page is affected.

Clarified during the session: `gauge.hipo.finance/metrics` — initially
offered as the data source — is the _scrape_ endpoint (current values, text
exposition format, no history, no CORS) and cannot feed the charts; only the
Prometheus query API can. Since Prometheus lives on the swarm-internal
`monitor` network with no published ports, the spec now carries a
pre-launch test path: a one-off `socat` swarm service bridging
`prometheus1:9090` to a node port, an SSH tunnel, and a
`PUBLIC_PROM_BASE=http://localhost:9090 npm run dev` override — the env
override was added to `charts/prometheus.ts` for exactly this, and verified
end-to-end against the mock (the browser-emitted query string also matches
the nginx allowlist encoding byte-for-byte).

### Verification performed

`npm run build` and ephemeral `tsc --noEmit` clean. 23 Playwright assertions
(scratchpad, installed Chrome, no repo test deps) against the dev server plus
a mock `query_range` server with an injected outage window — request shape,
path shapes, gap rendering, crosshair sync, hash round-trip, dark-mode
restroke without remount, testnet isolation, endpoint-down degradation,
360px overflow. Desktop and mobile screenshots eyeballed per the dataviz
checklist. Three review findings fixed: refresh failure no longer discards
rendered charts; tooltip no longer appears on all five charts; mobile control
row wrapped and colliding y-tick labels dropped.

### Follow-ups

- Expose `metrics.hipo.finance` per the proxy spec, then sanity-check live
  values against `curl` once real data flows (metric names still use the
  pre-rename `hton`/`ton` tokens — the label mapping is asserted only against
  the mock).
- Replace the placeholder `page-stats-*.svg` nav icons with designed ones
  (file swap, no code change).
- The `deep-reasoner` and `fast-worker` agent definitions in `.claude/agents/`
  are new this session and referenced by CLAUDE.md's orchestration section.
