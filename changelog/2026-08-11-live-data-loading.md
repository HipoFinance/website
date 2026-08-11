# 2026-08-11 — Live data loading states

Fourth session of the day. Behrang's requirement after the redesign shipped: no page may
flash a static/fake number where live data belongs — show a loading state (em dash) until
the real value arrives, then fill. A fast-worker subagent did the sweep; the orchestrator
caught a crash during verification and fixed the initial-run ordering.

| Commit    | Description                                                     |
| --------- | --------------------------------------------------------------- |
| `83baa7d` | Show loading dashes until live data arrives on landing and HPO. |

### What changed

- **Landing**: hero APY pill, stats row (staked, `$ TVL`, APY, holders), and the HPO panel
  values all start as "—" and fill from `gauge.hipo.finance/data`. The hero sentence's
  hardcoded "23,000+" became a live-swapped span with the natural-language fallback "Join
  thousands of GRAM holders…". `landing-data.js` now runs immediately at module evaluation
  (module scripts are deferred, so the DOM is ready) instead of waiting for the window
  `load` event, which blocked on image loading and lengthened the dash window.
- **HPO page**: market-card values switched from `&nbsp;` to "—"; the "Impressive metrics"
  card's stale hardcoded figures ("1.54M GRAM ($8.5M) TVL", "17K active stakers") are now
  live spans (staked, USD TVL, hGRAM holders — live is ~23.2K, so the old copy understated
  it). The hero **sparkline was a hardcoded fake polyline under a "Live market data" label**;
  it now plots the real 30-day `hipo_hpo_current_price` series by reusing `queryRange` from
  the app's `prometheus.ts` — the request stays byte-identical to the nginx-allowlisted
  query. Empty (height reserved) until data arrives; on failure it stays empty. The compiled
  chunk shares the app's small prometheus module, not the island bundle (`StatsRange` is a
  type-only import, erased at compile time).
- **Bug fixed in passing** (pre-existing): `hpo-data.js` wrote `SetMarketCap(-1)`-style
  values on a failed/`!res.ok` gauge response, rendering strings like `$-1`; failures now
  leave the dash.
- **Bug fixed at integration** (introduced by the sweep, caught in browser verification):
  the immediate-run refactor called `updateLandingData()`/`updateHpoData()` above their
  `let` declarations — a temporal-dead-zone `ReferenceError` that killed both scripts, so
  dashes never filled. The invocations were moved below all declarations.
- **App island**: `Model.holdersCountFormatted`'s bare-hyphen fallback became an em dash;
  the stat tiles and StatCards already used `?? '—'`.

### Static by design (decisions)

- **Protocol fee ("0%")** on the landing pill and stats card: the gauge exposes no fee
  field and the fee is an on-chain governance parameter, not market data — kept as copy
  with an explanatory comment. Going live requires the gauge to expose
  `treasury.governance_fee` (added to the colleague ask alongside the rate metric).
- **Community-size claims** on the HPO page (Hipo Gang, Telegram, YouTube, Twitter counts)
  and tokenomics figures ("12% of 500M"): no live source; genuinely static copy.

### Related (different repo)

The Telegram bot's `/start` "Hipo App" WebApp button was pointed at
`https://hipo.finance/stake/` (was the legacy `/app/`): HipoGang/app commit `66686ca`,
pushed; Behrang deploys the bot. Being a WebApp button, it opens the new Mini App chrome.
Behrang also updated the BotFather Mini App URL this session.

### Verification performed

- Built HTML greps: zero occurrences of any of the old baked-in numbers on `/` and `/hpo/`;
  all placeholder elements render "—" (or the fallback sentence) in the prerendered HTML.
- Browser pass on the preview: initial dashes, then hero APY/holders/staked/TVL and every
  HPO metric fill with live values (16.69%, 23,000+, 8.24M/$11.1M, $1.7M cap, 23.2K
  stakers); no console errors. The TDZ crash above was found exactly this way — the first
  post-sweep pass showed dashes that never filled.
- Sparkline renders empty on localhost (the Prometheus allowlist/CORS is production-origin
  only) — **verify it draws on hipo.finance after deploy**.

### Follow-ups

- Post-deploy: confirm the HPO sparkline draws on production.
- Colleague ask (combined): expose the protocol-rate history metric name + extend the nginx
  `query_range` allowlist (for the Stats chart), and expose `treasury.governance_fee` in
  `gauge.hipo.finance/data` (to make the landing fee figure live).
