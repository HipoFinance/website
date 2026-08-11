# 2026-08-11 — Telegram Mini App chrome

Third session of the day, following the Warm Dark redesign: the deferred Telegram Mini App
chrome from the design handoff (`Mini App.dc.html` + README §7), plus a data-correctness fix
Behrang caught on the live Stats page. Implemented by a deep-reasoner subagent with
orchestrator verification in Chrome via the `?tma=1` override.

| Commit    | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `d819aac` | Add the Telegram Mini App chrome and fix the Stats rate card |

### Telegram Mini App

- Inside the Telegram webview the island renders a compact phone-first chrome per the mockup:
  header row (logo chip, current-page title in Fredoka, live "APY · fee" subline, wallet chip
  that connects/disconnects), segmented stake/unstake pill, a two-card "You stake / You
  receive" form driven by the same Model logic as desktop, exchange-rate and APY rows, a
  full-width coral submit, and a bottom tab row (Stake · Reward · Stats · DeFi, coral active
  dot, ≥44px targets). Reward/Stats/DeFi render their responsive content between header and
  tabs. Outside Telegram nothing changes.
- **Detection is two-tier**: a synchronous inline probe in `AppLayout`'s head (Telegram launch
  params in the hash, telegram-web-app's sessionStorage marker, or our own session marker)
  marks `<html class="tma">` before first paint so the static shell never flashes; then
  `@twa-dev/sdk` — dynamically imported only when tier 1 fires, since its bundled script is
  side-effectful — confirms via real `initData`/platform and can revoke a false positive.
  `?tma=1` forces the mode for browser preview (remembered for the tab session, since
  in-app navigation drops the query); `?tma=0` clears it. `TelegramWebviewProxy` was
  deliberately rejected as a signal: it also exists in Telegram's plain in-app browser.
- **Shell suppression across navigation**: the SEO copy, cross-link nav, and `AppFooter` sit
  in the static shell under `data-tma-hide` hooks, hidden by a `.tma` rule; the ClientRouter
  swap wipes `<html>` attributes, so the class is written onto the incoming document in the
  existing `astro:before-swap` handler (flash-free) with an `astro:after-swap` backstop.
- SDK calls (`ready`, `expand`, `setHeaderColor`/`setBackgroundColor`/`setBottomBarColor`,
  `disableVerticalSwipes`) are try/catch'd **and** version-gated per Telegram client version.
  Layout uses `--tg-viewport-stable-height` (fallback `100dvh`) with the tab row as the last
  flex row rather than `position: fixed`, so the keyboard can't displace it; safe-area padding
  included.
- The shared overlays (`Wait`, loading/error, the TonConnect widget root) moved to chrome-
  independent siblings in `App.tsx` so a tier-2 detection revoke can never remount the element
  TonConnect mounted into. `@twa-dev/sdk` re-added to dependencies (it had been removed as
  unused during the restructure); it builds into its own lazy chunk, absent from the main
  island bundle.

### Stats rate correctness (Behrang's catch)

The live "hGRAM / GRAM rate" card showed 0.9627 — the ratio of the two USD market quotes from
the gauge, a non-monotonic market quantity that contradicted the card's "only goes up"
caption. The protocol redemption rate (treasury `totalCoins/totalTokens`, ≈1.15) is the number
that only goes up. Fixed: the computed now returns only the treasury-derived rate and the
USD-ratio path is deleted; with no data the card renders an em-dash rather than any fallback
number. `controlBackgroundJobs` now keeps the 30-second block poller running on `/stats/` (it
previously ran only on the stake page), so the real rate actually populates there. The TMA
header subline was also aligned to the gauge-preferred APY computed so it fills without
waiting for chain state.

### Prometheus investigation (no code yet)

Behrang asked whether the rate-history metric already exists, since stats.hipo.finance charts
it. Confirmed via the public Grafana dashboard's panel-data API: the "hGRAM price in GRAM"
panel plots the true protocol rate (1.147→1.1507 over the sampled week, strictly monotonic),
so **the data is already in Prometheus** — no exporter work needed. The website can't reach
it because the nginx mount in front of `gauge.hipo.finance/prometheus` allowlists the site's
exact `query_range` query string (verified: the production query returns 200, any variant
403s), and the public dashboard strips metric names. Ask for the colleague: provide the
metric name and extend the nginx allowlist; then the site adds a one-line series definition.

### Verification performed

- `npm run build` green (49 pages); prettier clean.
- Browser pass at 390×760 with `?tma=1`: compact chrome matches the mockup (header row,
  two-card form, dashes for not-yet-loaded data, bottom tabs); tab navigation runs through
  view transitions with the shell staying hidden and `.tma` surviving the swap; the Stats
  page inside TMA shows real gauge numbers and an em-dash on the rate card (the old code
  would have shown ≈0.88 here); `?tma=0` restores the desktop chrome fully; no
  `[Telegram.WebView]` console output in normal mode (SDK chunk not loaded).
- The subagent verified the SDK lands in a separate 52 KB lazy chunk, not the island bundle.

### Follow-ups

- **Real-device Telegram testing after deploy** (the webview can't be simulated locally):
  iOS + Android cold-open (blend, expand, no shell flash, tab row vs. home indicator),
  Telegram Desktop/Web iframe launch, TonConnect end-to-end (connect, stake, unstake, Wait
  modal, disconnect), keyboard vs. tab row, vertical-swipe behavior on scrollable pages, an
  old (<6.9) client, pull-to-refresh, and confirming plain browsers stay unchanged.
- Update the BotFather Mini App URL to `https://hipo.finance/stake/` (still pending from the
  restructure; unlocks the real-device testing above).
- Exchange-rate history chart once the colleague supplies the metric name + allowlist change.
