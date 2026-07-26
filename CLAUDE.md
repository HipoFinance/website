# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Astro dev server
- `npm run build` — build the static site into `dist/`
- `npm run preview` — preview the production build
- `npx prettier --write <file>` — format (no semicolons, single quotes, 120-char lines; uses astro + tailwindcss plugins)

Requires Node >= 22.12. There are no tests and no linter. Deployment is automatic: pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages at https://hipo.finance.

Note: the top-level README describes an old pre-Astro setup (plain HTML + Tailwind CLI) and is outdated; trust `package.json` and `astro.config.mjs` instead.

## What this is

The website for Hipo, a decentralized liquid-staking protocol on the TON blockchain (stake GRAM, receive liquid hGRAM). It is a fully static Astro 6 site (`output: 'static'`, `trailingSlash: 'always'`) with four distinct sections:

1. **Landing pages** (`/`, `/faq/`) — pure Astro components (`src/components/Landing.astro`, `FAQ.astro`, etc.) with small vanilla-JS scripts in `src/scripts/` (menu, banner).
2. **The staking dApp** (`/app/`) — a single React island: `src/pages/app/index.astro` mounts `AppIsland` with `client:only='react'`, so everything under `src/components/app/` is client-side-only React.
3. **HPO token page** (`/hpo/`) — Astro components; live market stats are fetched client-side from `https://gauge.hipo.finance/data` by `src/scripts/hpo-data.js`.
4. **Documentation** (`/docs/`) — Starlight; see below.

The first three sections each have their own layout in `src/layouts/` (`LandingLayout`, `AppLayout`, `HpoLayout`), each pulling in `SEO.astro` (meta tags + JSON-LD). Starlight owns its own `<head>`, so `/docs/` does **not** use `SEO.astro`.

## Documentation (`/docs/`)

Migrated off GitBook (`docs.hipo.finance`) — see `specs/gitbook-docs-migration.md`. Markdown in this repo is now the source of truth; edit `src/content/docs/**.md` directly.

- Rendered by **`@astrojs/starlight`, pinned to `~0.40.0`** — `0.41+` requires Astro 7. Bump both together or the build breaks.
- Content lives at `src/content/docs/<path>.md` but is served under `/docs/`: `src/content.config.ts` prefixes every entry id via `docsLoader({ generateId })`. `index.md` → `/docs/`.
- The sidebar is declared **explicitly** in `astro.config.mjs` (not `autogenerate`) to preserve GitBook's order and emoji labels. Adding a page means adding a sidebar entry.
- `disable404Route: true` keeps `src/pages/404.astro` as the site-wide 404.
- Images and attachments are plain files in `public/docs/images/`, referenced by absolute path.
- `src/styles/docs.css` themes Starlight through its CSS custom properties. It deliberately does **not** import `global.css` — Tailwind's preflight conflicts with Starlight's reset.
- Search is Pagefind, bundled with Starlight and built automatically at the end of `npm run build`.
- `scripts/import-gitbook-docs.mjs` is the one-time importer, kept for reference. Re-running it **wipes and regenerates** `src/content/docs/` and `public/docs/images/`, discarding hand edits.

## dApp architecture (`src/components/app/`)

All state and blockchain logic lives in one MobX store: **`Model.ts` (~1500 lines)**. React components are thin `mobx-react-lite` observers of it. The Model handles:

- **Wallet connection** via `@tonconnect/ui` (`TonConnectUI`), including Telegram Mini App support (`@twa-dev/sdk`).
- **Blockchain access** via `@orbs-network/ton-access` + `TonClient4`, polling the last block every 30s and re-deriving contract state from it via MobX `autorun`s.
- **Protocol contracts** via `@hipo-finance/sdk` (`Treasury`, `Parent`, `Wallet`), plus `OldTreasury.ts` for migrating users off the legacy treasury (see `OldWalletUpgrade.tsx`).
- **Stake/unstake flows** including fee estimates and an "instant vs. best-rate" unstake option; transaction progress is modeled by the `WaitForTransaction` state and shown by `Wait.tsx`.

App navigation state (active page `stake|reward|defi`, active tab, and network) is stored in the **URL hash fragment** (`Model.readFragmentState`/`writeFragmentState`), so `#network=testnet` switches the whole app to testnet — there is no router despite `react-router-dom` being in dependencies.

`pollyfills.ts` installs the `Buffer` polyfill required by the TON libraries; it must stay the first import of the island.

## Styling

Tailwind CSS 4 via the `@tailwindcss/vite` plugin — there is **no `tailwind.config.js`**; the theme (fonts Heebo/Eczar/Poppins, brand colors like `orange`, `brown`, `milky`, `c1`–`c7`) is defined in CSS `@theme` blocks in `src/styles/global.css`. `src/styles/app.css` adds dApp-specific styles. Dark mode uses a class strategy (`@custom-variant dark` keyed off a `.dark` ancestor), toggled by inline scripts in the layouts.

## Changelog

Each working session gets an entry. Keep both halves in sync:

- `CHANGELOG.md` — a brief running log, newest first. One `## YYYY-MM-DD` heading per session, linking to its detailed report, then a few bullets.
- `changelog/YYYY-MM-DD-<slug>.md` — the detailed report: an intro paragraph, a table of the session's commits, sections covering what changed and why, then `### Verification performed` and `### Follow-ups`.

Two sessions on the same date get two entries, distinguished by slug. Record decisions that were _declined_ or deferred too — the point of the report is the reasoning, which `git log` doesn't carry. Same convention as the `nginx` and `operation` repos.

## Other notes

- `public/llms.txt` is a maintained, curated description of the protocol for LLMs — keep it in sync when protocol-level facts on the site change.
- The sitemap is generated by `@astrojs/sitemap` from the configured `site: 'https://hipo.finance'`.
