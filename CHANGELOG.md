# Changelog

Brief running log — a few one-line bullets per session. Detail, reasoning and
verification live in the linked report under `changelog/`.

Covers Claude-assisted sessions on this repo, starting with the first one
(2026-07-22). Ordinary commits before and between those sessions are not listed
here — `git log` remains the complete record.

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
