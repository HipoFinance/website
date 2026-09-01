# Changelog

Brief running log — a few one-line bullets per session. Detail, reasoning and
verification live in the linked report under `changelog/`.

Covers Claude-assisted sessions on this repo, starting with the first one
(2026-07-22). Ordinary commits before and between those sessions are not listed
here — `git log` remains the complete record.

## 2026-09-01 — [detailed report](changelog/2026-09-01-verify-page-translations.md)

- `/verify/` moved into `src/components/routes/VerifyRoute.astro` with a `[locale]`
  twin, so it is built and `hreflang`-linked in all ten locales.
- New `verify` catalog namespace, plus `seo.verify.*`, translated into all nine
  released locales.
- `site.footer.verify` translated in every locale; the site and docs footers now
  link `/<locale>/verify/` through `localizedPath`.
- Latin addresses, handles and hostnames on the page carry `dir='ltr'` so they hold
  their order in Persian and Arabic.
- `/verify/` moved from `ENGLISH_ONLY` to `ROUTES` in `src/data/lastmod.mjs`.
- `@HipoGuru` added to the team accounts on `/verify/`, in all ten locales.

## 2026-08-31 — [detailed report](changelog/2026-08-31-verify-addresses-and-footer-link.md)

- `/verify/` prints each wallet's raw address, in both the `UQ…` and `EQ…` forms,
  derived at build time from one string with `@ton/core`.
- The addresses are selectable monospace with a copy button, reusing the clipboard
  core in `src/scripts/anchor-copy.ts` via a new `data-copy-text` hook.
- `SiteFooter.astro` links `/verify/` on every page in every locale; a new Starlight
  `Footer` override adds the same link under `/docs/`.
- `site.footer.verify` added to all ten catalogs, English string everywhere, since
  `/verify/` itself is English-only.

## 2026-08-30 — [detailed report](changelog/2026-08-30-sitemap-lastmod.md)

- Dated every sitemap URL with a `<lastmod>` taken from the git history of that
  page's content inputs, not the build time.
- Excluded layouts, components and the shared `site.json`/`seo.json`/`app.json`
  from a page's date, so a refactor no longer claims pages changed.
- Guarded against shallow clones and uniform histories by emitting no dates at all.
- Set `fetch-depth: 0` on the deploy workflow's checkout.

## 2026-08-30 — [detailed report](changelog/2026-08-30-hipo-fund-docs-rewrite.md)

- Rewrote the Hipo Fund overview and expanded the August 2026 report; no snapshot
  figure changed.
- Corrected three published tables that did not reconcile, and the GRAM benchmark.
- Added an editor's note to the August 2025 report, whose +21.64% "Growth" counted
  the Season 2 claim as return; the real figure is about 4.8%.
- Retitled all four fund pages and their sidebar entries, with unique meta
  descriptions.
- Synced all nine released locales through both rounds; figures verified identical
  across every digit set.

## 2026-08-29 — [detailed report](changelog/2026-08-29-cwv-fonts-and-inp.md)

- Search Console's mobile LCP and CLS issues name only `/`, so the fix is the landing page's font
  chain, not this morning's dApp work: new `FontPreload.astro` preloads the first screen's faces
  per locale, ahead of the stylesheet.
- The 107 KB hero art is now a `<picture>` with a `media` source, so phones — where it is
  `hidden` — stop fetching it, and it carries its intrinsic dimensions.
- First pass at INP: Astro's prefetch was on `hover`, which never fires on a touchscreen, so every
  tap was a cold fetch; `defaultStrategy` is now `viewport`.
- The static shell's Connect and menu buttons are `disabled` — inert mirrors that registered taps
  while the island hydrated.
- `App.tsx` drops the shell in a `useLayoutEffect`, closing a frame where it and the island were
  both laid out.

## 2026-08-29 — [detailed report](changelog/2026-08-29-hipo-rewards-page.md)

- Rewrote Hipo Rewards with the HPO boost formula, the level-coefficient table, a
  worked annual-reward table and the boost's value in percentage points.
- Corrected the reward base to the current GRAM value of the stake, verified
  against reward history and the backend.
- Fixed the level coefficients: Level 5 is 3×, not 5×.
- Dropped the staking-XP claim from the Club page and the glossary — Season 5
  grants no XP for staking.
- Same changes in all nine locales, hashes regenerated.

## 2026-08-29 — [detailed report](changelog/2026-08-29-verify-and-vs-pages.md)

- New `/verify/`, the canonical list of Hipo's official wallets, contracts,
  Telegram channels and social accounts, linked from outreach messages.
- New `/vs/`, the campaign landing page for the 0% protocol fee, with every
  figure baked into the HTML at build time.
- New `src/data/club.ts` reads the Hipo Club reward rate and level coefficients
  at build time; the draft's linear `× level` formula was wrong.
- `SEO.astro` and `LandingLayout` take a `localized` prop, so English-only pages
  stop emitting `hreflang` for locale URLs that do not exist.
- `public/llms.txt` points at `/verify/` for the anti-impersonation list.
- Amount inputs read the decimal key the visitor's own keypad offers, so a
  comma-decimal phone can type `0,3` on the English site.

## 2026-08-29 — [detailed report](changelog/2026-08-29-sdk-ton-core.md)

- `@hipo-finance/sdk` 4.4.0 depends on `@ton/core` instead of the untree-shakable
  `@ton/ton` barrel; `chain.ts` now takes `TonClient4` off it too.
- The chain chunk drops from 144 KB to 122 KB gzipped; the wallet contracts,
  multisig helpers and mnemonic tooling are gone from it.
- Both importers had to change before anything shrank — fixing only the website
  had previously measured a 28-byte saving.

## 2026-08-29 — [detailed report](changelog/2026-08-29-stats-cards-seed.md)

- The Stats page's hGRAM/GRAM rate, staking fee and three "over 1M" deltas are
  now in the HTML instead of filling in after load.
- New `src/data/stats.ts` seeds them from a build-time Prometheus fetch, keeping
  only the endpoints each delta needs rather than ~70 KB of history.
- `protocolFee` falls back to the gauge, which already carried it.
- The static shell now covers `/stats/`: title, range pills and all four cards.

## 2026-08-29 — [detailed report](changelog/2026-08-29-static-app-shell.md)

- The dApp pages now paint the app chrome at build time instead of a spinner —
  new Astro mirrors of the island's markup in `src/components/app/shell/`.
- The stats tiles carry real figures: `AppLayout` inlines the gauge payload as
  `#gauge-data` and the island seeds itself from it, so nothing blinks.
- Crawlers now get the app UI and its live numbers where they used to get
  "Loading the Hipo app…".
- Settled the `@ton/crypto` follow-up: it cannot be trimmed from this repo, the
  `@ton/ton` barrel arrives through `@hipo-finance/sdk`'s own require.

## 2026-08-29 — [detailed report](changelog/2026-08-29-app-island-code-splitting.md)

- The app island dropped from 312 KB to 48 KB gzipped: the TonConnect and TON
  chain stacks are now behind dynamic imports.
- The wallet layer loads on a Connect press, or up front only when a stored
  session is found; the chain layer loads on every page except `/defi/`.
- New `src/components/app/chain.ts` owns every runtime value from `@ton/*` and
  the sdk; `Model.ts` keeps only type imports. `pollyfills.ts` moved there too.
- Corrected the previous entry: `/stats/` does read the chain, so it was not a
  candidate for a wallet-free island.

## 2026-08-29 — [detailed report](changelog/2026-08-29-bake-live-numbers.md)

- Live APY, TVL and holder counts are now baked into the landing and HPO pages
  at build time, so crawlers see real numbers instead of an em dash.
- Both client scripts now format through the same `gaugeValues()` as the build,
  so the browser refresh writes back exactly what was baked.
- The deploy workflow rebuilds every 6 hours to keep those numbers fresh.
- Declined a proposed SSR rewrite: measurements put ~77% of the app island in
  the TON/wallet stack, which SSR would ship unchanged.

## 2026-08-29 — [detailed report](changelog/2026-08-29-locale-font-popularity.md)

- Re-picked the per-script fonts for popularity: `ar` → Cairo, `fa` display →
  Lalezar, `ru` → Roboto + Nunito, `hi` body → Poppins.
- Arabic no longer borrows Persian's Vazirmatn; it has its own `html[lang='ar']`
  block and runs Cairo in both roles.
- Dropped Tajawal after finding it lacks the Arabic decimal and thousands
  separators that `Intl` emits in every `ar` number.
- Replaced Comfortaa with Nunito after browser checks showed Russian headings
  rendering their Cyrillic and Latin halves at visibly different weights.
- Dropped the duplicate `--font-heebo` token; `HpoLayout` now uses `font-body`
  like the other two layouts.

## 2026-08-26 — [detailed report](changelog/2026-08-26-club-page-cross-link.md)

- The Hipo Club page no longer says selling is the only way to lose a level; it
  names both ways and links to Using Multiple Wallets.
- The retention rule is now stated on the Club page too: the amount is summed
  across all connected Club wallets, so moving HPO between your own is free.
- Same edit in all ten locales, hashes regenerated.
- Closed four follow-ups settled by the maintainer: backend deployed, translations
  ship without native review, `borrower.yaml` on v2, reporter thanked.

## 2026-08-25 — [detailed report](changelog/2026-08-25-settle-v1.md)

- Counted protocol v1 on mainnet before deciding it: 211 holders left, ~291 GRAM
  (~$422) in total, largest position ~$12.
- Removed the v1→v2 upgrade path from the dApp — `OldWalletUpgrade.tsx`,
  `OldTreasury.ts` and their whole `Model.ts` surface.
- Dropped the five `app.oldWallet.*` keys from all ten locales and regenerated
  the nine `meta.json` sidecars.
- `readLastBlock` no longer awaits a legacy-contract read, so a dead v1 endpoint
  can no longer trip the healthy v2 error path.

## 2026-08-25 — [detailed report](changelog/2026-08-25-retention-counts-all-wallets.md)

- Retention now sums HPO across all of a user's club wallets, so the page no
  longer asks them to connect the HPO-holding wallet last.
- Five steps became three; recovery gained "connect the wallet that already
  holds it" as an option.
- New caveat the page has to carry: only wallets connected in the Club app
  count toward retention, not ones registered on the website.

## 2026-08-25 — [detailed report](changelog/2026-08-25-unreachable-message.md)

- Added an `unreachable` wait state so a failed read no longer claims the
  transaction did not happen.
- The poll loop now rides out read failures for the whole `validUntil` window.
- New `app.wait.unreachable*` strings in all ten locales.

## 2026-08-25 — [detailed report](changelog/2026-08-25-retry-backoff.md)

- `retry` rescheduled failed attempts with no delay, spending all ten in a
  couple of seconds.
- Reads now retry 30 times, 1 second apart, so a hiccup no longer surfaces as
  "Cannot find your transaction" after a stake that landed.
- `console.warn('retry', …)` now fires from the first failed attempt.

## 2026-08-25 — [detailed report](changelog/2026-08-25-dapp-analytics-events.md)

- Added `wallet_connect`, `stake_initiated`, `stake_confirmed` and
  `unstake_confirmed` GA4 events to the dApp.
- Gated `wallet_connect` on `connectionRestored` so restored sessions are not
  counted as new connects.
- Added `src/components/app/analytics.ts`, a no-op when `gtag` is absent.

## 2026-08-25 — [detailed report](changelog/2026-08-25-multiple-wallets-docs.md)

- New `/docs/wallets-and-rewards/` page: how rewards follow wallets, and the
  airdrop rule that resets a club level when a different wallet is connected.
- Written in all ten locales, with the sidebar entry under Tokens & Governance.
- Prompted by a large holder's support question; the underlying check reads
  only the most recently connected wallet.

## 2026-08-25 — [detailed report](changelog/2026-08-25-yearly-hpo-reward-round-count.md)

- "Rewards after a year" annualized the per-round HPO with a hardcoded
  `20 * 12` = 240 rounds, a stale ~36-hour round, halving the figure.
- The count now comes from the live round boundaries, as the `apy` getter
  already did.
- The legacy `webapp` carries the same bug but is archived and read-only;
  confirmed retired, so the fix was not needed there.
- Reported by a user, who diagnosed the old reward cycle correctly from the
  ratio alone.

## 2026-08-25 — [detailed report](changelog/2026-08-25-banner-cls.md)

- Decided the promo banner's visibility before the first paint instead of
  revealing it after load, removing the home page's main layout shift.
- Moved the banner's storage key and codes into `src/scripts/banner-constants.js`.
- Re-applied the banner state on `astro:after-swap`, which ClientRouter would
  otherwise strip from `<html>`.

## 2026-08-25 — [detailed report](changelog/2026-08-25-google-analytics.md)

- Added Google Analytics 4 to every page, including `/docs/`, which Starlight
  builds outside `SEO.astro`.
- Sent a `page_view` on `astro:after-swap` so the dApp's client-side navigation
  is counted.
- Tagged every hit with `hipo_platform` (`telegram_mini_app` or `web`), and
  moved the TMA probe above `<SEO>` so it is set in time.

## 2026-08-24 — [detailed report](changelog/2026-08-24-nine-locale-translation.md)

- Translated the site into six new locales (`ar`, `de`, `it`, `tr`, `id`, `pt-br`) and resynchronised `fa`, `ru`, `hi`.
- Grew `GLOSSARY.md` to a binding terminology sheet and style block for all nine locales.
- Expanded the four docs-merge redirects per locale in `astro.config.mjs`.
- Flipped all nine locales from `draft` to `indexed`, and documented the locale URLs in `public/llms.txt`.
- Merged the light-theme work from `main` and translated its new copy into all nine locales.

## 2026-08-24 — [detailed report](changelog/2026-08-24-anchor-copy-links.md)

- Added a hover-revealed copy-link icon to every `/faq/` section and question (49 icons).
- Added the same to the `/hpo/` section headings and FAQ answers (13 icons).
- New `AnchorLink.astro` + `anchor-copy.ts`: a plain click copies the absolute URL, modified clicks still navigate.
- Added `site.anchor.copy` / `site.anchor.copied` to the English site catalog.

## 2026-08-24 — [detailed report](changelog/2026-08-24-docs-formatting-sweep.md)

- Wrote alt text for all 22 docs images and removed the 21 empty figcaptions.
- Normalised heading levels across 30 docs pages and stripped bold from headings.
- Replaced the `\ <sub>` wallet run-ons with tables and removed stray `<br>`.
- Repacked both brand kits from `.rar` to `.zip` and corrected the brand-kit copy.
- Added deep-link anchors to the `/hpo/` sections and FAQ answers, with per-question JSON-LD URLs.

## 2026-08-24 — [detailed report](changelog/2026-08-24-fund-report-docs-restructure.md)

- Generated the Hipo Fund quarterly report (Aug 24, 2026) from on-chain data
  via the new `scripts/hipo-fund-snapshot.mjs`.
- Restructured the docs sidebar into 9 groups with dated archive labels and
  four redirected merges.
- Added the Fees & Gas, Risks, Contracts & Audits, Glossary and Staking
  Without the App pages.
- Rewrote `/docs/` as a hub.

## 2026-08-23 — [detailed report](changelog/2026-08-23-footer-cta.md)

- Replaced the footer's "Join Hipo on Telegram" strip with a "Start Staking
  GRAM" CTA linking to `/stake/`.
- Hid that footer CTA on the app pages, where it duplicates the page you are
  already on.
- Rewrote the 404 page around the hippo artwork, keeping its two links.
- Added the missing `<meta name="viewport">` to the 404 page.

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

## 2026-08-22 — [detailed report](changelog/2026-08-22-light-theme.md)

- Added a site-wide light palette (landing, dApp, docs, 404, Mini App),
  selected by `prefers-color-scheme` only — no toggle.
- Split coral into `--color-accent` (foreground, darkens on cream) and
  `--color-accent-fill` (solid brand coral); swept `bg-accent` accordingly.
- Added `hipo-light.svg`, and started the docs on `data-theme` from the media
  query instead of pinning it to dark.
- Turned the home page's "How Hipo works" steps into a snapping horizontal
  carousel below `sm`.
- Moved the security-audits section to the end of the home page and dropped
  `/join` from the Hipo Club button.
- Closed the "How Hipo works" row with a "Start Staking GRAM" CTA card linking
  to `/stake/`.

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
