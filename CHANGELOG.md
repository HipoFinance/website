# Changelog

Brief running log — a few one-line bullets per session. Detail, reasoning and
verification live in the linked report under `changelog/`.

Covers Claude-assisted sessions on this repo, starting with the first one
(2026-07-22). Ordinary commits before and between those sessions are not listed
here — `git log` remains the complete record.

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
