# 2026-08-10 — Site structure implementation

Implementation of `specs/site-structure-redesign.md` (specced earlier the same day — see the
companion report `2026-08-10-site-structure-spec.md` for the interview reasoning). The dApp no
longer lives behind a single hash-routed `/app/` URL: it is five prerendered pages sharing one
persistent React island. Work was split between two subagents — the island refactor
(deep-reasoner/Opus) and the Astro shells/content (fast-worker/Sonnet) — with orchestrator
integration on top.

| Commit    | Description                                                   |
| --------- | ------------------------------------------------------------- |
| `4affcf1` | Restructure the site: replace /app/ with path-based app pages |

### The five pages and the shell

- New pages `src/pages/{stake,unstake,rewards,stats,defi}/index.astro`, each with unique
  title/description, canonical, JSON-LD (`FAQPage` where the page has visible Q&A), and
  ~150–300 words of copy grounded in `src/content/docs/**` and `Defi.tsx` — no invented facts,
  no hardcoded APY numbers.
- `AppLayout.astro` now carries `<ClientRouter />`, mounts `AppIsland` with
  `client:only='react' transition:persist='app-island'`, and renders per-page copy through a
  slot, followed by a static cross-link nav (added at integration: the island's page switches
  are `onClick` handlers, so crawlers need real `<a>` links between the five pages).
- The theme script in `AppLayout` re-applies `.dark` on `astro:after-swap` — found at
  integration: the ClientRouter swap resets `<html>` attributes and does not re-run inline
  scripts, so dark mode was silently lost on the first in-app navigation.
- `/app/` is a tiny `noindex` stub that parses the legacy `#/page=…/tab=…` hash
  (order-independent, `network=` ignored) and `location.replace`s to the new URL, `/stake/`
  as fallback. Excluded from the sitemap via a `filter` in `astro.config.mjs`.

### The island refactor

- `location.pathname` is the single source of truth: a route table in `Model.ts` maps the five
  paths to `activePage`/`activeTab` (`/rewards/` → internal id `'reward'`). The Model syncs on
  `astro:page-load`; UI calls `navigateToPage`/`navigateToTab`, which invoke Astro's
  `navigate()`. `readFragmentState`/`writeFragmentState` are gone. The header's "Stake" entry
  preserves the old behavior of returning to whichever tab was last active.
- TonConnect survives view transitions via measures inside the island: the widget root is
  now a div rendered by `App.tsx` (`widgetRootId`) so modals live in the persisted subtree, and
  an `astro:before-swap` handler carries TonConnect's injected `style#_goober` sheet into the
  incoming document. The same handler also adopts TonConnect's body-mounted Solid portals (the
  connected-address dropdown and the notification toasts) into the incoming body — without
  this they died on the first navigation — and defuses the portals' stale cleanup by making
  the abandoned old body's `removeChild` forgiving (TonConnect captures the original body and
  calls `removeChild` on it on disconnect; the method is looked up on the instance at call
  time, so overriding it on the discarded element is contained). Confirmed working with a real
  wallet: dropdown opens after navigation, disconnect works, toasts appear after navigation.
- Focus-ring regression after navigation, root-caused via computed styles: TonConnect ships
  its own :focus-visible stand-in — `tc-root :focus` paints a blue outline, suppressed by
  `body.tc-using-mouse tc-root :focus { outline: none }`, with mousedown/keydown listeners
  toggling that class bound to the body element that existed at init. The ClientRouter swaps
  the body, the listeners die, and from then on every mouse click on the wallet button painted
  the keyboard ring. Fixed by mirroring the exact toggling (`mousedown` adds the class, `Tab`
  removes it) at the document level, which is never swapped, and carrying the class onto the
  incoming body during each swap. A first-attempt fix (blurring ClientRouter-restored focus on
  `astro:page-load`) addressed a mechanism that turned out not to be the cause and was removed.
- `<Wait>` (transaction progress) was hoisted out of the stake-page branch in `App.tsx` so an
  in-flight transaction modal survives page switches; no nav blocking needed since the modal
  overlays the header.
- Testnet removed entirely per spec: `network`/`isMainnet`, testnet addresses and endpoint,
  chain-mismatch flow, the hidden logo-click switch, `TestnetBadge.tsx` (deleted), and the
  mainnet-only conditionals in `Stats.tsx`/`StatsPage.tsx`/`ChartsStore.ts`. The docs page
  `why-your-security-matters.md` lost its now-false "click the logo five times" tip.
- The stats range no longer round-trips through the URL (the old `#/range=` had no home in the
  new URL map); `/stats/?range=` support was noted as a possible follow-up.
- TonConnect `manifestUrl` → `https://hipo.finance/tonconnect-manifest.json`; the file moved to
  `public/` root with its `url` field set to the site root, and the old copy retained at
  `/app/tonconnect-manifest.json` for pre-existing wallet sessions.

### Housekeeping

- Link sweep: landing/HPO components, headers/footers, `public/llms.txt`, and ~18 docs pages
  now point at the new URLs (context-specific: unstaking docs → `/unstake/`, etc.).
- Dependencies dropped: `react-router-dom` (per spec) plus `@orbs-network/ton-access` and
  `@twa-dev/sdk`, both found to be reference-free even before this session (ton-access had
  been dead since the endpoint was hardcoded; only the `twaReturnUrl` string remains and it
  doesn't need the SDK).
- CLAUDE.md's site-structure and dApp-architecture sections rewritten to match reality,
  including the "never pass props to AppIsland" persistence caveat.

### Verification performed

- `npm run build` passes; all five pages plus the stub prerender; per-page copy confirmed
  present in `dist/` HTML; sitemap contains the five new URLs and excludes `/app/`;
  `dist/tonconnect-manifest.json` serves correctly; preview server returns 200 on all six
  routes.
- `react-router-dom`/`ton-access`/`twa-dev` confirmed absent from `package.json`, lockfile,
  and `src/`.
- Browser pass over the preview build (Chrome, via the extension): a `window` marker proved
  the island survives every in-app navigation (header switches, tab switches, browser
  back/forward — no full reloads); URL, title, and per-page static copy swap correctly; the
  Stats page shows live gauge data after navigating to it; the theme toggle's choice persists
  across swaps (exercising the `astro:after-swap` fix); the TonConnect modal opens fully
  styled after six-plus view transitions (goober stylesheet and widget root confirmed
  present); all four legacy-redirect cases map correctly (`#/page=reward`, mixed
  `page`+`tab`, ignored `network=testnet`, bare `/app/`); a cold deep-load of `/unstake/`
  preselects the unstake tab; zero console errors throughout. The two promo banners seen
  during testing (fixed top bar and footer Telegram banner) are pre-existing design, not a
  duplication bug.
- Behrang tested with a real connected wallet against the preview build: connect works (with
  the manifest temporarily pointed at the old live URL — see below), balances survive
  navigation, the address-chip dropdown works after navigation, disconnect works, the
  transaction progress modal stays open across browser back/forward, and transaction toasts
  appear correctly after navigating.
- During wallet testing, `manifestUrl` temporarily pointed at the old
  `/app/tonconnect-manifest.json` (the new root manifest 404s until first deploy); it was
  reverted to `https://hipo.finance/tonconnect-manifest.json` before committing.

### Follow-ups

- Manual browser QA per above, ideally including a real wallet connect → navigate → transact.
- After deploy: update the BotFather Mini App URL to `/stake/`, update external catalogs
  linking to `/app/`, watch Search Console for indexing of the five pages.
- Known small items: `astro:page-load` events are deprecated in Astro 7 (migration item
  alongside the Starlight pin); per-page OG images deferred to the design phase; optional
  `/stats/?range=` deep links. The TonConnect portal adoption in `keepRuntimeStyles` pokes at
  library internals (`data-tc-*` markup, cleanup behavior) — re-verify it when bumping
  `@tonconnect/ui`.
- Next projects per the spec discussion: graphical redesign (unified header), `Model.ts`
  split into domain stores, self-hosted liteserver read endpoint with ton-access fallback.
