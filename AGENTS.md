# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Team rules

The team's general rules for sessions (how to plan and delegate, when a spec is written, the
changelog) are in `rules/team.md` of the `claude-team` repo
(<https://github.com/HipoFinance/claude-team/blob/main/rules/team.md>), and are loaded by each
person's own setup once they have joined. This file holds what is true of this repo only.

## Before you change the site

**English first.** Build and review the English version, then stop for the person's approval; other
locales only after it. **A push to `main` deploys the site at once**: commit and push only when
asked. The procedure is the `locales` skill (`.claude/skills/locales/`).

## What this is

The website for Hipo, a decentralized liquid-staking protocol on the TON blockchain (stake GRAM, receive liquid hGRAM). It is a fully static Astro 6 site (`output: 'static'`, `trailingSlash: 'always'`) with four distinct sections:

1. **Landing pages** (`/`, `/faq/`) — pure Astro components (`src/components/Landing.astro`, `FAQ.astro`, etc.) with small vanilla-JS scripts in `src/scripts/` (menu, banner).
2. **The staking dApp** (`/stake/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/`) — five Astro pages sharing one React island: `AppLayout.astro` mounts `AppIsland` with `client:only='react'` and `transition:persist`, plus Astro's `<ClientRouter />`, so in-app navigation swaps each page's static SEO copy while the island (wallet, polling) survives. Before the island arrives the page paints a **static shell** (`src/components/app/shell/`) — an Astro mirror of the app chrome, replacing the old spinner — which `App.tsx` removes on hydration; see "The static app shell" below. Everything under `src/components/app/` is client-side-only React. `/app/` is a legacy stub that maps old `#/page=…/tab=…` links to the new URLs (see `specs/site-structure-redesign.md`).
3. **HPO token page** (`/hpo/`) — Astro components; live market stats are fetched client-side from `https://gauge.hipo.finance/data` by `src/scripts/hpo-data.js`.
4. **Documentation** (`/docs/`) — Starlight; see `.claude/rules/docs.md`.

The first three sections each have their own layout in `src/layouts/` (`LandingLayout`, `AppLayout`, `HpoLayout`), each pulling in `SEO.astro` (meta tags, `hreflang`, JSON-LD). Starlight owns its own `<head>`, so `/docs/` does **not** use `SEO.astro` (our `src/components/starlight/Head.astro` override only trims `hreflang` and adds `noindex` for draft locales). Every section is multi-locale — see Internationalization below. The exception is the blog (`/blog/`, its own `BlogLayout`), which is English-only — see Blog below.

## Notes by area

These load by themselves when a file of the area is opened. Open the one you need before planning a change there.

- `.claude/rules/blog.md`: the blog: content folders, English-only setup, plugins, OG image, sitemap and Medium copies.
- `.claude/rules/docs.md`: the Starlight documentation: content layout, sidebar, pinned version, search, importer.
- `.claude/rules/app.md`: the staking dApp (MobX Model, TonConnect, code splitting) and the static app shell.
- `.claude/rules/styling.md`: Tailwind 4 theme and tokens, the two colour schemes, no horizontal scroll, RTL.
- `.claude/rules/i18n.md`: translations: registry, helpers, catalogs, the check-i18n gate, adding a page or locale.

## Commands

- `npm run dev` — start the Astro dev server
- `npm run build` — build the static site into `dist/`
- `npm run preview` — preview the production build
- `npx prettier --write <file>` — format (no semicolons, single quotes, 120-char lines; uses astro + tailwindcss plugins)

Requires Node >= 22.12. There is no linter; the only tests are `node --experimental-strip-types scripts/i18n-selftest.mjs` (locale/format helpers) and the `prebuild` translation gate `node scripts/check-i18n.mjs` (see `.claude/rules/i18n.md`). Deployment is automatic: pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages at https://hipo.finance.

Note: the top-level README describes an old pre-Astro setup (plain HTML + Tailwind CLI) and is outdated; trust `package.json` and `astro.config.mjs` instead.

## Changelog

One file, `CHANGELOG.md`, newest first. Each change gets one entry, brief and complete:

- A `## YYYY-MM-DD — <what the change is, in a few words>` heading.
- Bullets, each **brief and complete**: what changed, why in a short clause, and what was declined or left open. A decision that was _declined_ or deferred belongs here too; `git log` does not carry it. As many bullets as the change needs: a large change has more. A bullet may run over one line when it needs to, but says a thing once and has no filler. No tables, no sub-bullets.
- A link to the spec in `specs/` when the change has one, or its name when it lives in another repo. The spec holds the reasoning and the checks.

Write **no new file in `changelog/`**. The detailed reports there, one per session until 2026-10-07, stay as history, and the older entries keep their links to them. Two changes on the same date get two entries.

## Other notes

- `public/llms.txt` is a maintained, curated description of the protocol for LLMs — keep it in sync when protocol-level facts on the site change.
- The brand kit ZIP behind `/docs/brand-kit/` (`public/docs/images/brand-kit-file-1.zip`) is **generated**, not curated: `npm run brand-kit` assembles it from the live site marks under `public/` plus the two logotype lockups in `brand/`, rasterizes every PNG and the `.ico` from those SVGs, derives the light-background colorway by the same recipe documented in `public/images/hipo-light.svg`, and writes `brand/README.md` in as the kit's own README. Never edit the ZIP by hand — change the source asset or the script and re-run it (the script needs the `zip` CLI, and `sharp`, which is a devDependency for this reason alone). Rebuilding from unchanged inputs is byte-identical, so a diff on that blob always means a real change. The kit is what partners and listing sites use, so a mark that changes on the site has to be rebuilt here too. Anything the script derives rather than copies (`toLight`, `logotype`, `flatCoin`) asserts the shape of its source and throws — never soften those into a silent fallback; the failure they prevent is a blank or half-drawn mark shipped to a listing site.
- The sitemap is generated by `@astrojs/sitemap` from the configured `site: 'https://hipo.finance'`. Each URL's `<lastmod>` comes from `src/data/lastmod.mjs`, which dates a page by the newest commit touching its **content inputs** — its locale catalogs, its prose entries, its Markdown — and deliberately not its layout, components, CSS or the catalogs shared across a locale (`site.json`, `seo.json`, `app.json`). Google treats `lastmod` as a binary trust signal and discards it site-wide once it catches a false claim, so the module emits nothing rather than guess: it refuses outright on a shallow clone (hence `fetch-depth: 0` in `deploy.yml`) or when every commit date is identical. A wrong date is far worse than none.
- The sitemap is **split into one file per locale × group** (`sitemap-<locale>-<site|app|docs>-0.xml`, listed by `sitemap-index.xml`), because Search Console never exports indexed URLs and its Page indexing report can only be broken down by sitemap. `sitemapSegment()` in `astro.config.mjs` is the single classifier every chunk defers to; the plugin writes a URL into each chunk whose callback keeps it, so never add a chunk with its own matching rule. A new top-level page lands in `site` by default — add it to `APP_SECTIONS` if it is a dApp page. See `specs/search-console-coverage-sitemaps.md`.
