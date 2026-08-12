# Self-hosted TON v4 read endpoint with public fallback

## Summary

Every read the dApp makes (last block, treasury state, wallet balances, fee estimates, unstake
options) goes through a single public endpoint, `https://mainnet-v4.tonhubapi.com`, hardcoded in
`Model.ts` since ton-access died. When that endpoint is slow or down, the whole app degrades and
we can do nothing about it. Hipo already runs its own liteserver infrastructure — the gauge,
hipogang, and hpo-trader services all talk ADNL directly to it — but browsers cannot speak ADNL.
This spec puts tonwhales' open-source **`ton-api-v4`** (the same software that backs
mainnet-v4.tonhubapi.com) in front of Hipo's liteserver, exposed at **`https://v4.hipo.finance`**
behind nginx with caching, origin-locked CORS, and rate limiting — and teaches the website to
prefer it, falling back to the public endpoint automatically when it is unreachable, with periodic
recovery probing. `TonClient4` speaks the v4 API natively, so the client change is an endpoint
swap plus failover logic; no library changes.

## Requirements

1. The website's `TonClient4` connects to `https://v4.hipo.finance` by default. No other change
   to how reads are performed.
2. When the primary endpoint fails — a threshold of **3 consecutive failed requests** (after the
   existing `retry()` exhausts its attempts), or a last-block response whose block timestamp is
   **older than 10 minutes** (up but stale counts as down) — the Model swaps the client to
   `https://mainnet-v4.tonhubapi.com` and continues polling without user-visible interruption.
3. While on the fallback, the Model probes the primary every **60 seconds** (a `GET
/block/latest` with the existing 5-second timeout); on a fresh, successful response it swaps
   back. The probe never interferes with in-flight reads on the fallback.
4. Endpoint choice is in-memory only. A fresh page load always starts at the primary.
5. A `PUBLIC_TON_V4_ENDPOINT` build/dev-time override forces a specific endpoint and disables
   failover, mirroring the `PUBLIC_PROM_BASE` pattern — used for local testing against tunnels or
   mocks.
6. Server side: a `ton-api-v4` service runs in the swarm (operation repo), configured against
   Hipo's liteserver(s) only — it must not silently lean on public liteservers, or the endpoint
   stops being a reliability improvement.
7. nginx terminates TLS for `v4.hipo.finance` and proxies to the service with:
   - `GET`/`HEAD`/`OPTIONS` only;
   - CORS locked to `https://hipo.finance` (same header discipline as the Prometheus route:
     hide upstream CORS headers, add our own);
   - per-IP rate limiting sized for the app's polling pattern (the island polls every 30 s and
     fans out several reads per block; start at ~120 r/m with burst headroom and tune after
     observing real traffic);
   - `proxy_cache` honoring upstream `Cache-Control` — the v4 API is designed for this:
     block-keyed responses (`/block/{seqno}/…`, `/account/{seqno}/…`) are immutable and cache
     indefinitely, while `/block/latest` gets only a seconds-scale micro-cache.
8. The nginx contract is carried in this repo as `specs/ton-v4-nginx.conf`, kept in sync with the
   deployed config in the nginx repo — same convention as `specs/metrics-proxy-nginx.conf`.
9. Transactions are untouched: they go through the user's wallet via TonConnect and never touch
   this endpoint.

## Out of scope

- Migrating backend services (gauge, hipogang, hpo-trader) — they already speak ADNL directly to
  the liteserver and don't need an HTTP hop.
- Standing up additional liteservers for HA; this spec assumes the existing node. A second
  liteserver later only changes the `ton-api-v4` config, nothing client-side.
- The Prometheus route, gauge `/data`, or any other `gauge.hipo.finance` route.
- Opening the endpoint as a public community RPC (explicitly declined: origin-locked +
  rate-limited instead).

## UX / behavior

There is none — that's the point. Failover and recovery are invisible; the existing loading
states, `retry()` behavior, and error banner are unchanged. The error banner appears only in the
case that exists today: all reads failing (now meaning _both_ endpoints are down). No indicator
shows which endpoint is active; the only trace is the network tab.

## Technical approach

**Client (`src/components/app/Model.ts`)** — the only file that changes:

- The legacy `connectTonAccess` (and its dead ton-access comment block) becomes the endpoint
  manager: it owns the primary/fallback constants, the active-endpoint state, the failure
  counter, the staleness check, and the recovery-probe timer. `setTonClient` stays as is —
  swapping endpoints means constructing a new `TonClient4`, which is cheap and stateless.
- Failure counting hooks into the `catch` paths that already exist around `readLastBlock` /
  `readTimes` / wallet reads; no new error surface. The staleness check reads the timestamp
  already present in the last-block response.
- MobX: active endpoint doesn't need to be observable (nothing renders it), so this adds no
  reactivity surface.

**Server (operation + nginx repos, contract mirrored here):**

- New swarm service running tonwhales `ton-api-v4`, attached to the network where the liteserver
  is reachable, configured with Hipo's liteserver address/key (same values the other stack
  services already use).
- DNS `v4.hipo.finance` + certificate via the existing `cert.sh` flow.
- nginx server block per requirement 7; cache storage sized generously since immutable
  block-keyed entries dominate.
- Monitoring rides the existing swarm monitor; a probe of `v4.hipo.finance/block/latest`
  freshness is the one health signal worth alerting on.

## Edge cases & error handling

- **Primary up but stale** (liteserver desynced, ton-api-v4 wedged): caught by the 10-minute
  block-timestamp check, treated as failure — this is the failure mode a naive "HTTP 200 = healthy"
  check would miss, and the reason the check exists.
- **Both endpoints down:** identical to today's single-endpoint outage — existing retry loop and
  error banner. No new UI.
- **Flapping primary:** the 3-failure threshold plus the 60-second probe interval bound the swap
  frequency; a marginal primary costs at most one failed request cycle per minute.
- **Recovery probe races a swap-back mid-poll:** the swap constructs a new client between poll
  cycles; in-flight requests on the old client complete or fail harmlessly under the existing
  retry.
- **Localhost dev:** CORS on the primary is production-origin-only, so dev browsers fail over to
  the public endpoint automatically — dev keeps working with zero configuration, and
  `PUBLIC_TON_V4_ENDPOINT` exists when someone needs to test against the real primary through a
  tunnel.
- **Telegram Mini App:** same origin (`hipo.finance`), same behavior; nothing special.

## Open questions & assumptions

- **Assumption:** the liteserver the backend services use is Hipo-run with capacity for the
  website's read load once caching absorbs repeats (the cache should reduce origin traffic to
  roughly one uncached read per unique block/account pair).
- **Assumption:** tonwhales `ton-api-v4` runs cleanly from its published image with a custom
  network config pointing at one liteserver; exact image tag and env/config format verified at
  implementation time, in the operation repo.
- Rate-limit and cache numbers above are starting points, tuned after observing production
  traffic — the deployed nginx config is authoritative; the spec copy follows it.
- Threshold values (3 failures, 10-minute staleness, 60-second probe) are judgment calls, chosen
  to be conservative; adjust freely at implementation if testing suggests better ones.
