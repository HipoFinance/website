# Changelog

Brief running log — a few one-line bullets per session. Detail, reasoning and
verification live in the linked report under `changelog/`.

Covers Claude-assisted sessions on this repo, starting with the first one
(2026-07-22). Ordinary commits before and between those sessions are not listed
here — `git log` remains the complete record.

## 2026-08-23 — [detailed report](changelog/2026-08-23-faq-restructure.md)

- Restructured the site FAQ from 67 questions in 10 sections to 40 in 9, with
  old anchors aliased client-side.
- Rebuilt the HPO page FAQ as 7 items, adding the HPO contract address,
  profit-share payout details and how to vote.
- Added FAQPage JSON-LD to `/faq/` and `/hpo/`.
- Kept draft-locale docs out of the build; recorded the seasonal-burns change
  (history since Season 4).

## 2026-08-23 — [detailed report](changelog/2026-08-23-content-accuracy-fixes.md)

- Reviewed the FAQ, HPO page and docs for structure, ambiguities and cuts,
  and audited every link (0 dead of 119).
- Fixed the accuracy findings per `specs/content-accuracy-fixes.md`: minimum
  stake, audit list, Hipo Gang → Hipo Club, reward cadence, hardcoded APY,
  Hipo Club Season-4 model, TVL milestones, Why-TON, testnet claim, typos.
- Re-pointed the DEX swap links in `Model.ts` and the unstaking tutorial off
  the pre-rename `hTON` symbol.
- Mirrored every change in the fa, ru and hi twins and refreshed their hashes.

## 2026-08-22 — [detailed report](changelog/2026-08-22-multi-language-site.md)

- Added site-wide i18n: locale registry, `/<locale>/` routes, catalogs,
  `prose` collection, Starlight locales, island catalog delivery, Intl
  formatting, per-script fonts, RTL-safe CSS.
- Translated Persian, Russian and Hindi to 100 % (catalogs, prose, docs,
  sidebar) and set them to `indexed` for the crawler-only launch.
- Added `scripts/check-i18n.mjs` (prebuild gate, hashes, review flags) and
  `scripts/i18n-selftest.mjs`.
- Fixed the amount input's thousands-separator parsing and the Telegram
  locale override's `lang`/`dir`.
- Added dormant language switchers and a language-suggestion banner, off
  until a second locale is `public`.

## 2026-08-19 — [detailed report](changelog/2026-08-19-dune-dashboard-docs.md)

- Added a "Hipo on Dune" docs page describing the Dune dashboard and how it
  complements Hipo Stats.
- Added its sidebar entry after Hipo Stats and a cross-link from the Hipo
  Stats docs page.
- Listed the new docs page in `public/llms.txt`.

## 2026-08-18 — [detailed report](changelog/2026-08-18-ready-to-burn-sdk-bump.md)

- Updated `@hipo-finance/sdk` to 4.3.0 for the treasury's new
  `ready_to_burn` participation state (inserted at 6, `burning` moved to 7).
- Fixes `stakeRemain` skipping a round that had settled but was still
  holding its bills; no source change was needed, only the corrected enum.
- Declined a suggested edit to `Model.ts:824` that would have pinned that
  off-by-one in place under a correct-looking constant.

## 2026-08-16 — [detailed report](changelog/2026-08-16-total-earned-rewards.md)

- "Total earned" row (with "Since <date>" caption) on the rewards page,
  fed by new `stake_sum_rewards` / `stake_rewards_since` API fields.
- Backend accumulator added in HipoGang/app (`jobs.go` + `/wallet-rewards`),
  O(1) per wallet, seeded from the stored 10-round history.
- Fixed `Model.ts` reading the typo'd `hpo_sum_rewars` wire key, which made
  `hpoSumRewards` NaN and suppressed the HPO claim-label variants.
- Follow-on: "Total HPO earned" row backed by a lifetime per-wallet
  `hton_total_rewards` counter in HipoGang/app.
- Rewards-page polish: always-rendered total rows under an "Earned since"
  caption, static Claim button with amounts above it, "Rewards" tab label.
- Fixed the page reverting to its unhydrated state when TonConnect
  re-emits status for the same account; rewards fetch errors now retry.

## 2026-08-15 — [detailed report](changelog/2026-08-15-community-and-aggregators.md)

- Added an Aggregators section (GroypFi, swap.coffee) to the dApp's DeFi
  page and the `/defi/` SEO prose.
- "How to buy HPO" step 03 now names STON.fi, DeDust, TONCO, GroypFi, and
  swap.coffee instead of STON.fi alone.
- New "Hipo Community" section on the landing page above Hipo Club, linking
  to `t.me/hipo_chat`; hero badge row removed.
- Tokenomics docs gained a "Burned So Far" section linking to the live
  counter at `/hpo/#tokenomics`; swept the last `hpo.hipo.finance` docs
  links over to `/hpo/`.
- Replaced the home-page mascot with the new 3D piggy-bank render.

## 2026-08-13 — [detailed report](changelog/2026-08-13-v4-followups.md)

- `hpo-data.js`'s burned-HPO lookup now reads `v4.hipo.finance` first, with
  the public endpoint as a per-call fallback (also what keeps localhost dev
  working).
- nginx and operation follow-ups landed in their own repos: `make test`
  fixed, TON v4 staleness alerting added.
- Declined giving `gauge.hipo.finance/data` the same `expires off` cache
  treatment as the v4 vhost — the gauge service sets no `Cache-Control` of
  its own yet.

## 2026-08-13 — [detailed report](changelog/2026-08-13-ton-v4-endpoint-implementation.md)

- Client now reads from `v4.hipo.finance` first, failing over to the public
  TON v4 endpoint after 3 failed read cycles or a stale last block.
- Added a 60s recovery probe on a throwaway client to swap back to the
  primary without disturbing in-flight reads.
- Deployed the nginx vhost (HipoGang `nginx`/`operation` repos) restricted
  to Hipo's own liteserver, with CORS locked to hipo.finance.
- Fixed the default vhost proxying unmatched hostnames to Grafana's login;
  added `specs/ton-v4-nginx.conf`.

## 2026-08-13 — [detailed report](changelog/2026-08-13-tokenomics-donut-chart.md)

- Replaced the HPO page's static tokenomics image with an inline SVG donut
  and legend in Warm Dark colors.
- Added a live burned layer: an ember arc plus an exact count-up in the
  donut hole, animated when the chart scrolls into view.
- Removed the unused `public/images/tokenomics.svg`.

## 2026-08-12 — [detailed report](changelog/2026-08-12-allowlist-403-hotfix.md)

- Matched the Prometheus allowlist's new 8-metric query (with
  `hipo_treasury_protocol_fee`), fixing the 403s that blanked all charts.
- Synced `specs/metrics-proxy-nginx.conf` with the deployed single-entry map.
- Moved the burned-HPO lookup off rate-limited tonapi onto the TON v4 API.

## 2026-08-12 — [detailed report](changelog/2026-08-12-team-feedback-round.md)

- De-jargoned the copy: Staking fee, Yearly rewards, decision-making token,
  no more `$HPO`; landing stats go fiat-first with exact counts.
- Added an app loading indicator, tab-bar icons, a compact DeFi page, and
  Telegram help lines; TMA rewards button moved above the fold.
- Added a live "Burned so far" figure and a copyable exact staked amount;
  Stats page now prefers on-chain values over the gauge.

## 2026-08-12 — [detailed report](changelog/2026-08-12-site-chrome-unification.md)

- Wired the now-live gauge protocol fee into the landing page; swapped the
  hero mascot for the new 3D render, hidden on mobile.
- Unified one flat header menu, one footer, and one global announcement
  banner across all non-docs pages; logo everywhere without the filled disk.
- Refreshed the HPO page: burn-focused "built to get scarcer" section,
  rewritten FAQ, unbacked stats removed.
- Fixed the landing Hipo Club card's icon and docs link.
- Wrote `specs/ton-v4-read-endpoint.md` (self-hosted TON v4 read endpoint);
  implementation pending review.

## 2026-08-11 — [detailed report](changelog/2026-08-11-hton-rate-chart.md)

- Added an hGRAM/GRAM rate history chart to the Stats page from the newly
  allowlisted `hipo_treasury_hton_rate` metric.
- The rate stat card now shows a range delta computed from that history.
- Synced `specs/metrics-proxy-nginx.conf` with the deployed two-query allowlist.

## 2026-08-11 — [detailed report](changelog/2026-08-11-live-data-loading.md)

- All landing and HPO page numbers now show an em dash until live gauge
  data loads; no baked-in placeholder values remain.
- Replaced the HPO page's fake sparkline with real 30-day HPO price
  history from the allowlisted Prometheus query.
- Fixed a bug where a failed gauge response wrote `$-1`-style values.
- Pointed the Telegram bot's Hipo App button at `/stake/` (HipoGang/app repo).

## 2026-08-11 — [detailed report](changelog/2026-08-11-telegram-mini-app.md)

- Added the Telegram Mini App compact chrome per the redesign mockup,
  active only inside the Telegram webview (`?tma=1` to preview).
- Fixed the Stats hGRAM/GRAM rate card to show only the protocol rate,
  never the USD-quote ratio; block polling now also runs on `/stats/`.
- Re-added `@twa-dev/sdk`, lazy-loaded only when Telegram is detected.

## 2026-08-11 — [detailed report](changelog/2026-08-11-warm-dark-redesign.md)

- Implemented the "Warm Dark" visual redesign across landing, FAQ, HPO,
  docs, and the staking app.
- Site is now single-theme dark; the light mode and theme toggles are gone.
- Replaced TonConnect's button widget with a custom header wallet button.
- Restyled the Stats page into the design's card/chart language, keeping all data.
- Added Fredoka, dropped Poppins/Eczar, and swept all legacy palette tokens,
  `hipo-*` utilities, and `GeckoChart.astro`.

## 2026-08-10 — [detailed report](changelog/2026-08-10-site-structure-implementation.md)

- Replaced `/app/` with prerendered `/stake/`, `/unstake/`, `/rewards/`,
  `/stats/`, `/defi/` pages, each with crawlable SEO copy.
- Rewrote app navigation from hash fragments to pathnames, with Astro
  `ClientRouter` and a persisted island.
- Removed testnet support entirely.
- Moved the TonConnect manifest to the site root; `/app/` is now a redirect stub.
- Dropped `react-router-dom`, `@orbs-network/ton-access`, and `@twa-dev/sdk`.

## 2026-08-10 — [detailed report](changelog/2026-08-10-site-structure-spec.md)

- Wrote `specs/site-structure-redesign.md`: dissolve `/app/` into prerendered
  `/stake/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/` pages.

## 2026-08-04 — [detailed report](changelog/2026-08-04-stats-feedback-round.md)

- Removed the Stats page Refresh button; data now refreshes on page open.
- Removed the Stats page TON Explorer link.
- Moved the More Stats link below the last chart, centered.
- Pointed the Stake page's More Stats at the Stats tab instead of the
  external stats site.
- Restyled section headings as a centered line instead of a highlighted bar.

## 2026-08-04 — [detailed report](changelog/2026-08-04-stats-links-placement.md)

- Moved the More Stats and TON Explorer links below the Refresh button.
- Added extra space above the Refresh button on thin screens.

## 2026-08-03 — [detailed report](changelog/2026-08-03-stats-page-layout.md)

- Rearranged the Stats page: last-value cards first, history charts after,
  protocol figures as a row of tiles in one full-width card.
- Restyled section headers as highlighted centered bars, with the range
  selector moved down beside the charts it controls.
- Moved the More Stats and TON Explorer links to the page's top-right corner.
- Renamed the mislabeled "24h volume" market row to "Total volume".
- Fixed the Community-Driven card width workaround on the landing page.

## 2026-08-02 — [detailed report](changelog/2026-08-02-stats-charts.md)

- Restored the stashed Stats tab page (nav entry, routing, gauge-fed figures).
- Added five hand-rolled SVG history charts fed by Prometheus `query_range`
  with a 24h–1y range selector persisted in the URL hash.
- Charts are mainnet-only, degrade to in-card errors while
  `metrics.hipo.finance` is not yet exposed, and re-theme via CSS variables.
- Wrote `specs/app-stats-charts.md` plus `specs/metrics-proxy-nginx.conf`, and
  added a `PUBLIC_PROM_BASE` override with a swarm tunnel recipe for
  pre-launch testing.

## 2026-07-29 — [detailed report](changelog/2026-07-29-unstake-options-docs.md)

- Documented the Full and Instant unstake options across `FAQ.astro`, both
  unstaking docs pages, and `public/llms.txt`.
- Added a FAQ question comparing the two and rewrote the four existing
  unstaking answers around them.
- Stopped presenting a DEX swap as the way to get GRAM immediately; it is now
  the fallback when Instant cannot cover the amount.

## 2026-07-28 — [detailed report](changelog/2026-07-28-faq-accuracy-pass.md)

- Dropped the hand-added `src/content/docs/faq/faq.md`; `/faq/` stays the only
  FAQ.
- Corrected `FAQ.astro` on reward accrual, deferred minting, unstaking timing,
  fees, audits, minimum stake and support links.
- Added a question on how long minting takes; fixed eight live typos.
- Fixed the validation round length in `public/llms.txt` and
  `introduction/hipo-rewards.md` — a round is ~18 hours, not 36.

## 2026-07-27 — [detailed report](changelog/2026-07-27-mcp-client-setup-docs.md)

- Rewrote the Claude Code connection instructions on `/docs/hipo-mcp-server/`
  to lead with `claude mcp add` and warn that an `mcpServers` block in
  `settings.json` is ignored.
- Added a `-s user` example, noting `user` is a scope keyword, not a username.
- Reframed both `mcpServers` JSON blocks as being for Claude Desktop, Cursor,
  and other file-configured clients.

## 2026-07-27 — [detailed report](changelog/2026-07-27-mcp-server-docs.md)

- Documented the Hipo MCP Server as a new docs page,
  `/docs/hipo-mcp-server/`, from a read of the `HipoFinance/mcp` source.
- Added its top-level `🤖 Hipo MCP Server` sidebar entry to `astro.config.mjs`.
- Added the MCP server to `public/llms.txt` in three places and bumped
  `Last reviewed`.

## 2026-07-26 — [detailed report](changelog/2026-07-26-docs-link-audit.md)

- Audited all 131 link references in `src/content/docs/**.md`; no dead links.
- Switched six `http://` links to `https://`, plus three more in
  `Landing.astro`, `Banner.astro` and `app/Header.tsx`.
- Normalized `app.hipo.finance/#/…` to `hipo.finance/app/#/…` in six places.

## 2026-07-26 — [detailed report](changelog/2026-07-26-changelog-brevity.md)

- Tightened the `CHANGELOG.md` half of the changelog convention in `CLAUDE.md`
  to 3–5 one-line bullets, no rationale.
- Offered to retrofit the five existing entries to match; not done.

## 2026-07-26 — [detailed report](changelog/2026-07-26-faq-anchors-and-cutover-runbook.md)

- Added a stable anchor id and a `#` permalink to all **64 questions and 10
  sections** on `/faq/`, so individual answers can be linked to from anywhere.
- Used the new anchors for the two links the docs migration had to leave
  pointing at the FAQ page root (`tutorials/staking`, `tutorials/unstaking`).
- Added the "up to 36 hours" figure to the FAQ unstaking answer, which its new
  link text promised but the answer did not state.
- Aligned `public/llms.txt` with that answer; dropped an "average around 30
  hours" claim inherited from the retired GitBook FAQ and no longer supported.
- Recorded a **cutover runbook** in `specs/gitbook-docs-migration.md` for the
  pending `docs.hipo.finance` redirect, correcting a wrong premise in the
  original section: the hostname is DNS-only, not proxied, so no Cloudflare
  rule can fire until that record is switched.
- Merged and pushed the docs migration to `main`; both `/docs/` and the FAQ
  changes are live.
- Started this changelog, reconstructing the four earlier Claude-assisted
  sessions from the commit record, and documented the convention in
  `CLAUDE.md`.

## 2026-07-25 — [detailed report](changelog/2026-07-25-gitbook-docs-migration.md)

- Moved all **38 documentation pages** off GitBook into this repo, served at
  `/docs/` by Starlight (pinned `~0.40.0`; `0.41+` requires Astro 7).
- Mounted the docs by prefixing every collection entry id in
  `src/content.config.ts`, keeping a clean file tree under `src/content/docs/`.
- Declared the sidebar explicitly in `astro.config.mjs` to preserve GitBook's
  order and emoji labels; `disable404Route` keeps `src/pages/404.astro`.
- Committed `scripts/import-gitbook-docs.mjs`, the one-time importer that
  recovered 23 images and 2 attachments and converted GitBook syntax.
- Repointed every in-repo link off `docs.hipo.finance`.
- **Not done:** the Cloudflare redirect — see the 2026-07-26 entry.

## 2026-07-25 — [detailed report](changelog/2026-07-25-claude-code-onboarding.md)

- Added `CLAUDE.md`, the repo orientation guide (commands, the three site
  sections, dApp architecture, Tailwind 4 conventions).
- Added the `/spec` slash command (`.claude/commands/spec.md`): interview,
  then write a spec for review, with implementation explicitly deferred.

## 2026-07-24 — [detailed report](changelog/2026-07-24-llms-txt-gas-costs.md)

- Added a **Gas costs and refunds** section to `public/llms.txt`: the attached
  amounts are gas prepayments rather than protocol fees, how deposit and
  unstake refunds differ, and how to net flows to measure a real return.

## 2026-07-22 — [detailed report](changelog/2026-07-22-llms-txt-rewrite.md)

- Rewrote `public/llms.txt`: dropped the internal website-authoring guidance,
  kept the naming rules, FAQ, risk guardrails and links.
- Added a **Technical resources** section linking the contract repo docs and
  the current mainnet treasury/parent addresses.
- Fixed the ton.vote DAO link, which pointed at an unregistered `/hipo` alias.
