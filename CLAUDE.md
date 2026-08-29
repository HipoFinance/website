# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Orchestration workflow

You (Fable) are the orchestrator. Plan, decompose, synthesize. Reasoning-heavy phases go to deep-reasoner (Opus). Mechanical work goes to fast-worker (Sonnet). For high-stakes decisions, run deep-reasoner twice with slightly different framings and synthesize the best of both. Keep your own context lean. Delegate rather than doing mechanical work yourself.

## Commands

- `npm run dev` — start the Astro dev server
- `npm run build` — build the static site into `dist/`
- `npm run preview` — preview the production build
- `npx prettier --write <file>` — format (no semicolons, single quotes, 120-char lines; uses astro + tailwindcss plugins)

Requires Node >= 22.12. There is no linter; the only tests are `node --experimental-strip-types scripts/i18n-selftest.mjs` (locale/format helpers) and the `prebuild` translation gate `node scripts/check-i18n.mjs` (see Internationalization). Deployment is automatic: pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages at https://hipo.finance.

Note: the top-level README describes an old pre-Astro setup (plain HTML + Tailwind CLI) and is outdated; trust `package.json` and `astro.config.mjs` instead.

## What this is

The website for Hipo, a decentralized liquid-staking protocol on the TON blockchain (stake GRAM, receive liquid hGRAM). It is a fully static Astro 6 site (`output: 'static'`, `trailingSlash: 'always'`) with four distinct sections:

1. **Landing pages** (`/`, `/faq/`) — pure Astro components (`src/components/Landing.astro`, `FAQ.astro`, etc.) with small vanilla-JS scripts in `src/scripts/` (menu, banner).
2. **The staking dApp** (`/stake/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/`) — five Astro pages sharing one React island: `AppLayout.astro` mounts `AppIsland` with `client:only='react'` and `transition:persist`, plus Astro's `<ClientRouter />`, so in-app navigation swaps each page's static SEO copy while the island (wallet, polling) survives. Before the island arrives the page paints a **static shell** (`src/components/app/shell/`) — an Astro mirror of the app chrome, replacing the old spinner — which `App.tsx` removes on hydration; see "The static app shell" below. Everything under `src/components/app/` is client-side-only React. `/app/` is a legacy stub that maps old `#/page=…/tab=…` links to the new URLs (see `specs/site-structure-redesign.md`).
3. **HPO token page** (`/hpo/`) — Astro components; live market stats are fetched client-side from `https://gauge.hipo.finance/data` by `src/scripts/hpo-data.js`.
4. **Documentation** (`/docs/`) — Starlight; see below.

The first three sections each have their own layout in `src/layouts/` (`LandingLayout`, `AppLayout`, `HpoLayout`), each pulling in `SEO.astro` (meta tags, `hreflang`, JSON-LD). Starlight owns its own `<head>`, so `/docs/` does **not** use `SEO.astro` (our `src/components/starlight/Head.astro` override only trims `hreflang` and adds `noindex` for draft locales). Every section is multi-locale — see Internationalization below.

## Documentation (`/docs/`)

Migrated off GitBook (`docs.hipo.finance`) — see `specs/gitbook-docs-migration.md`. Markdown in this repo is now the source of truth; edit `src/content/docs/**.md` directly.

- Rendered by **`@astrojs/starlight`, pinned to `~0.40.0`** — `0.41+` requires Astro 7. Bump both together or the build breaks.
- English content lives at `src/content/docs/<path>.md`, translations at `src/content/docs/<locale>/<path>.md` (same relative path), all served under `/docs/` resp. `/<locale>/docs/`: `src/content.config.ts` builds locale-first ids (`fa/docs/x`) via `docsLoader({ generateId })`. `index.md` → `/docs/`.
- The sidebar is declared **explicitly** in `astro.config.mjs` (not `autogenerate`) to preserve GitBook's order and emoji labels; its labels are translated through `src/i18n/<locale>/docs-sidebar.json` (`group:<English label>` keys for groups). Adding a page means adding a sidebar entry, a translated label, and the translated page in every released locale (the build fails otherwise).
- Starlight's `locales` are generated from the registry (English = root locale) and it owns Astro's i18n config — never add `i18n` to `astro.config.mjs` or import `astro:i18n`. Root-relative links in translated docs are prefixed by `src/i18n/remark-localize-links.mjs`.
- `disable404Route: true` keeps `src/pages/404.astro` as the site-wide 404.
- Images and attachments are plain files in `public/docs/images/`, referenced by absolute path.
- `src/styles/docs.css` themes Starlight through its CSS custom properties. It deliberately does **not** import `global.css` — Tailwind's preflight conflicts with Starlight's reset.
- Search is Pagefind, bundled with Starlight and built automatically at the end of `npm run build`.
- `scripts/import-gitbook-docs.mjs` is the one-time importer, kept for reference. Re-running it **wipes and regenerates** `src/content/docs/` and `public/docs/images/`, discarding hand edits.

## dApp architecture (`src/components/app/`)

All state and blockchain logic lives in one MobX store: **`Model.ts`**. React components are thin `mobx-react-lite` observers of it. The Model handles:

- **Wallet connection** via `@tonconnect/ui` (`TonConnectUI`); the manifest lives at `/tonconnect-manifest.json` (a legacy copy stays at `/app/tonconnect-manifest.json` for old sessions). The header's connect/disconnect button is **our own React component** (`tonConnectUI.openModal()` / `Model.disconnect`) — TonConnect's button widget is not rendered (`buttonRootId` unset). TonConnect's modal root, stylesheet, toast portals, and focus-ring modality class are kept alive across view transitions by handlers in `Model.ts` (`keepRuntimeStyles`, `trackInputModality`) — re-verify those when bumping `@tonconnect/ui`.
- **Code splitting.** The two heavy dependency stacks are behind dynamic imports and Model.ts holds only `import type` for them, so the eager island is ~48 KB gzipped instead of ~312 KB. `./chain.ts` re-exports every runtime value from `@ton/*` and `@hipo-finance/sdk` and is fetched by `loadChain()` — note it takes them from **`@ton/core`** and from `@ton/ton/dist/client/TonClient4.js`, never from the `@ton/ton` entry point: that barrel is CommonJS with no `exports` map, so importing it drags in the wallet contracts, multisig helpers and mnemonic tooling (this is also why `@hipo-finance/sdk` ≥ 4.4.0 is required — it peer-depends on `@ton/core`). The deep path is unversioned, so re-check it when bumping `@ton/ton`, and keep the `.js` extension: Vite resolves without it, Node's ESM resolver does not; `@tonconnect/ui` is fetched by `loadTonConnect()`. Reach them through `chain!.X` / the module a path awaited — never add a static import of those packages back to `Model.ts`. `ensureChain()` runs from `init()` on every page except `/defi/` (which reads nothing from the chain); `ensureWallet()` loads TonConnect **and** the chain, on a Connect press or when a stored session is found under the `ton-connect-storage_bridge-connection` localStorage key. `isChainReady` is the observable that makes the guarded getters (`amountInNano`, `isAmountValid`, the fee lines, `stakingInProgress*`, `treasuryAddressFormatted`) recompute when the module lands — until then they report "not ready" rather than a wrong number.
- **Blockchain access** via `TonClient4` against a fixed mainnet v4 endpoint (ton-access is dead — see the comment in `Model.setTonClient`'s caller), polling the last block every 30s and re-deriving contract state from it via MobX `autorun`s. Mainnet only; testnet support was removed 2026-08-10.
- **Protocol contracts** via `@hipo-finance/sdk` (`Treasury`, `Parent`, `Wallet`).
- **Stake/unstake flows** including fee estimates and an "instant vs. best-rate" unstake option; transaction progress is modeled by the `WaitForTransaction` state and shown by `Wait.tsx`.

App navigation state (`activePage`, `activeTab`) is derived from **`location.pathname`** via a route table in `Model.ts` (`/stake/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/`, with or without a locale prefix — note `/rewards/` maps to the internal id `'reward'`). The Model syncs on the `astro:page-load` event; UI components navigate through `model.navigateToPage`/`navigateToTab`, which call Astro's `navigate()` with `model.localizedPath(...)` so the static shell swaps too. Never pass props to `AppIsland` — differing props make Astro re-hydrate the persisted island and reset the React tree. The island's locale comes from the document: `AppLayout.astro` inlines the merged app catalog as `<script type="application/json" id="i18n-app">` on non-English pages and `Model.syncLocale()` reads it on `astro:after-swap`; inside the Telegram Mini App (URL has no locale) `Model.applyTelegramLocale` fetches `/i18n/<locale>.json` instead. All user-visible strings go through `model.t(key)` (`src/i18n/<locale>/app.json`), all numbers/dates through `model.format*` — never hand-roll number formatting or parse amounts with `parseFloat`; the amount input keeps the raw text in `model.amountRaw` and the canonical value in `model.amount` (see `setAmount`).

`pollyfills.ts` installs the `Buffer` polyfill required by the TON libraries. It is the first import of **`chain.ts`** (not of the island, as it used to be) — Rollup keeps side-effectful imports in source order within a chunk, so that is what guarantees the polyfill is installed before the TON libraries evaluate. Importing it from the island again would pull `buffer` back into the eager chunk for every visitor.

## The static app shell (`src/components/app/shell/`)

`AppShell.astro` and its parts (`ShellHeader`, `ShellStakeForm`, `ShellStats`, `ShellIcon`) are hand-written Astro mirrors of the island's React markup, rendered at build time into the `[data-app-loading]` wrapper that `App.tsx` deletes the moment it hydrates. They exist so the app pages paint their chrome — and their live figures — instead of a spinner, and so crawlers see the app rather than a loading message.

The rule that makes them work: **a mirror reproduces the island's FIRST-paint state, not its eventual state** — no wallet connected, nothing read from the chain. Rendering a value the island would then blank is a worse flash than the spinner was. Chain-gated rows (`youWillReceive`, `exchangeRate`, the fee lines) are therefore rendered present-but-empty, so they hold their final height from the first paint.

The stats strip is the one exception, and the reason it works is the `#gauge-data` script tag: `AppLayout` inlines the build-time gauge payload, `ShellStats` renders figures from it via `appStats()` in `src/data/gauge.ts`, and `Model` seeds its own `gauge`/`holdersCount` from the same tag (`readInlineGauge`) so the island's first paint reproduces them exactly. `appStats()` deliberately formats differently from `gaugeValues()` — it matches Model's `statsApyFormatted` / `statsStakedCompact` / `statsHoldersFormatted`, which round differently from the landing page's copies.

`/stats/` has a second seed: `src/data/stats.ts` fetches the charts' Prometheus range at build time and keeps only the last rate value plus a first-to-last delta for staked/holders/rate, inlined as `#stats-data` on that page alone. It exists because the rate and the deltas have no gauge equivalent. `Model.seededDelta` is **range-guarded** — the card line names its window ("over 1M"), so the seed is dropped as soon as `statsRange` differs from the range it was computed for. The query string lives in `src/data/prometheus-query.ts` because the chart client, that build-time fetch and the nginx allowlist in `specs/metrics-proxy-nginx.conf` must agree on it byte-for-byte; the gauge host is behind Cloudflare, so the build-time fetch must send a `user-agent` or it gets a challenge.

Classes in the mirrors are **copied** from the React components and must stay copied; a divergence shows up as the page shifting when React mounts. `ShellIcon.astro` likewise carries lucide's icon paths and default SVG attributes by hand — re-check them against `node_modules/lucide-react/dist/esm/icons/<name>.mjs` when bumping lucide. The wrapper is `data-tma-hide`, because this is the desktop chrome and Telegram gets `TmaApp` instead. Only `/stake/` and `/unstake/` have a body mirror so far; the other three get the header only.

## Styling

Tailwind CSS 4 via the `@tailwindcss/vite` plugin — there is **no `tailwind.config.js`**; the theme is defined in CSS `@theme` blocks in `src/styles/global.css`. New markup uses the semantic tokens (`bg-bg`, `bg-surface`, `bg-surface-deep`, `border-border`, `text-text`/`-muted`/`-faint`, `text-accent`, `bg-accent-fill`, `text-positive`, …) and the two faces `font-body` (Heebo) and `font-fredoka` (display) — never a raw hex. `src/styles/app.css` is a **separate Tailwind compilation** for the dApp (own `@theme`; duplicates the font tokens deliberately). The design source of truth is the handoff bundle recreated in `specs`/changelog 2026-08-11; primary CTA style is the coral pill with the hard offset shadow `shadow-[0_6px_0_var(--color-accent-shadow)]`. `global.css`, `app.css` and `docs.css` all import `src/styles/i18n-fonts.css`, which declares the per-script font subsets (`unicode-range`) and swaps the font tokens under `html[lang=…]`.

**Two schemes, no toggle.** Warm Dark (the 2026-08-11 redesign) is the authored base; a light palette was added 2026-08-22 and is selected by **`prefers-color-scheme` alone** — there is no switcher, no `localStorage`, and no `.dark` class. Every scheme-dependent value is a custom property re-declared in a `@media (prefers-color-scheme: light)` block: `src/styles/global.css` for the site, `src/styles/app.css` for the chart gridlines, `src/styles/docs.css` for Starlight (keyed on `data-theme`, which `src/components/starlight/ThemeProvider.astro` sets from the same media query; `ThemeSelect.astro` still renders nothing). To theme something new, add a token — do not add a `dark:` variant.

Two details that bite:

- **Coral has two tokens.** `--color-accent` is coral as a _foreground_ (links, the hero highlight, the APY stat) and darkens to `#e0574b` on cream so it keeps its contrast. `--color-accent-fill` is coral as a _solid fill_ under `text-on-accent` (buttons, the banner, `::selection`) and is the brand `#ff7e73` in both schemes. Using `bg-accent` is a bug: it compiles (both tokens live in the same `@theme` block) and silently paints the foreground coral as a fill, which is the contrast regression the split exists to prevent.
- **The logo is two files.** `hipo.svg` (cream body) for dark, `hipo-light.svg` (warm-dark line art, transparent body) for light. Both `<img>`s are in the markup at every logo site and `.logo-on-dark` / `.logo-on-light` in `global.css` pick one; Starlight does the same through `logo: { light, dark }` in `astro.config.mjs`.

Colors that live outside CSS need the media query read in JS: the TonConnect modal's `colorsSet` (`Model.ts`, both themes supplied, kept in sync by `syncTonConnectTheme`) and the Telegram Mini App chrome (`tma/telegram.ts`, read once at startup).

RTL is supported: use **logical utilities only** (`ms-/me-/ps-/pe-/start-/end-/text-start/text-end`, `rtl:` variants) — never `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right` (the one allow-listed exception is the SVG chart code in `LineChart.tsx`). Wrap Latin tickers/numbers inside RTL copy with the `num` utility or `model.isolate`.

## Internationalization (`src/i18n/`)

Spec: `specs/multi-language-site.md` (read its Decisions log before changing behaviour). English lives at the root URLs, every other locale under `/<locale>/` (`src/pages/[locale]/**` mirrors the English routes through the shared `src/components/routes/*Route.astro`).

- **Registry** `src/i18n/registry.mjs` — `LOCALES` keyed by URL segment with `lang`, `dir`, `label`, `tonconnect`, optional `intl`, and `status`: `draft` (built only with `I18N_INCLUDE_DRAFTS=1`, local preview), `indexed` (built + `hreflang` + sitemap, **no** visible language UI — crawler-only launch) or `public` (also in the dropdowns / suggestion banner). English must stay `public`. Flipping `status` is the whole rollout mechanism; locales are released in batches of ≥3.
- **Helpers** — `locale.ts` (`localeOf(Astro)`, `localizedPath`, `stripLocale`, `langOf`, `dirOf`, `intlOf`, `localeParams` for `getStaticPaths`), `t.ts` (`getT(locale, namespaces)`, `getAppCatalog`), `prose.ts` (`getProse`), `format.ts` (Intl-based `format*`, `parseNumberInput`, `formatInput`, `formatAsciiNano`, `isolate`). Use these; don't read catalogs or `Intl` directly in components.
- **Content per locale** — catalogs `src/i18n/<locale>/{site,landing,hpo,faq,seo,app}.json` (flat dotted lowerCamel keys, `{placeholders}`, HTML limited to `a strong em code br` with safe hrefs); long prose in the Markdown collection `src/content/prose/<locale>/**` (FAQ, HPO FAQ, app-shell cards); docs in `src/content/docs/<locale>/**`; sidebar labels `src/i18n/<locale>/docs-sidebar.json`; Starlight UI strings `src/content/i18n/<lang>.json`; per-item source hashes + review flags in `src/i18n/<locale>/meta.json` (generated, never hand-edit). Terminology: `src/i18n/GLOSSARY.md`.
- **Gate** — `node scripts/check-i18n.mjs` runs as `prebuild`: a released (`indexed`/`public`) locale missing any key, prose file, doc or sidebar label **fails the build**; stale (English changed) and unreviewed items only warn. After translating run `--update-hashes <locale>`; after native review `--mark-reviewed <locale> <prefix>`; `--top-urls <locale>` lists the URLs to submit in Search Console. So: **every change to English copy, prose or docs must ship with the matching change in each released locale.**
- **Adding a page** — English route + `src/pages/[locale]/...` twin (copy an existing pair), strings in the catalogs, prose in the collection, a sidebar entry + label for docs, translations for every released locale, and (for app pages) the route table in `Model.ts`.
- **Adding a locale** — registry entry (+ `intl` tag if the defaults are wrong), fonts in `i18n-fonts.css` if it needs a new script, a TonConnect language if supported, then the full translation set (catalogs, prose, docs, sidebar, `src/content/i18n/<lang>.json`) at 100 % before flipping off `draft`.
- **Switchers** `src/components/LanguageSwitcher.astro`, `src/components/app/LanguageSwitcher.tsx`, `src/components/starlight/LanguageSelect.astro` and the suggestion banner in `Banner.astro`/`src/scripts/banner.js` are dormant until ≥2 locales are `public`. `/app/` stays English-only; `public/llms.txt` and the OG image are English for all locales.

## Changelog

Each working session gets an entry. Keep both halves in sync:

- `CHANGELOG.md` — **very brief**, newest first. One `## YYYY-MM-DD` heading per session, linking to its detailed report, then **3–5 one-line bullets** naming only _what_ changed. No rationale, no trade-offs, no tables, no sub-bullets. If a bullet needs a second line to make sense, it belongs in the report instead.
- `changelog/YYYY-MM-DD-<slug>.md` — the detailed report, and the only place detail goes: an intro paragraph, a table of the session's commits, sections covering what changed and why, then `### Verification performed` and `### Follow-ups`. Length here is fine.

Two sessions on the same date get two entries, distinguished by slug. Record decisions that were _declined_ or deferred too — the point of the report is the reasoning, which `git log` doesn't carry. Same convention as the `nginx` and `operation` repos.

## Other notes

- `public/llms.txt` is a maintained, curated description of the protocol for LLMs — keep it in sync when protocol-level facts on the site change.
- The sitemap is generated by `@astrojs/sitemap` from the configured `site: 'https://hipo.finance'`.
