# Site structure redesign: dissolve `/app/` into path-based pages

## 1. Summary

The staking dApp currently lives at a single URL, `/app/`, with its sections (`stake`, `reward`, `stats`, `defi`) and tabs (`stake`/`unstake`) encoded in the URL hash fragment. Hash fragments are not separate documents to search engines, and the island is `client:only`, so the app contributes almost nothing indexable. This redesign replaces `/app/` with five prerendered, path-based pages — `/stake/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/` — each carrying its own crawlable HTML (title, meta, JSON-LD, explainer copy) while mounting the same shared React island, so the app keeps its current single-page feel: wallet connection and blockchain polling survive navigation between app pages. Testnet support is removed entirely. The graphical redesign (including a unified site-wide header) is explicitly a later phase.

## 2. Requirements

1. Five new pages exist and are prerendered at build time: `/stake/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/` (trailing slashes, per the existing `trailingSlash: 'always'` config).
2. Each page's static HTML contains: a unique `<title>` and meta description, canonical URL, Open Graph tags, JSON-LD, and section-specific explainer content (copy and/or FAQ) that is present without JavaScript. All via the existing `SEO.astro` / `AppLayout` path.
3. Each page mounts the **same** shared React app island (`client:only='react'`), which renders the section matching `location.pathname`:
   - `/stake/` → `StakeUnstake` with the stake tab active
   - `/unstake/` → `StakeUnstake` with the unstake tab active
   - `/rewards/` → `Reward`
   - `/stats/` → `StatsPage`
   - `/defi/` → `Defi`
4. Navigating between app pages (via the app's own header/tabs or browser back/forward) updates the URL path, swaps the page's static copy, and does **not** reset wallet connection, `TonClient` state, or the 30-second block polling. Mechanism: Astro `<ClientRouter />` (view transitions) with `transition:persist` on the island — see §5.
5. Every app URL is directly loadable (deep links, refresh, wallet-app redirects back to the site, Telegram webview) and shows the correct section immediately.
6. Switching the stake/unstake tab navigates between `/stake/` and `/unstake/` (URL always reflects the visible tab).
7. The URL path is the single source of truth for app navigation. `Model.readFragmentState` / `writeFragmentState` and the `ActivePage`/`ActiveTab` hash encoding are removed; `activePage`/`activeTab` are derived from the pathname.
8. `/app/` no longer serves the app. It becomes a tiny stub page whose inline script parses the legacy hash format (`#/page=…/tab=…`) and redirects: `#/page=reward` → `/rewards/`, `#/page=stats` → `/stats/`, `#/page=defi` → `/defi/`, `#/tab=unstake` → `/unstake/`, anything else (including no hash or unparseable hash) → `/stake/`. The stub is `noindex` and excluded from the sitemap.
9. The TonConnect manifest moves to `https://hipo.finance/tonconnect-manifest.json`; `Model.ts` is updated to reference the new URL. A copy remains at the old `/app/tonconnect-manifest.json` path so wallets holding existing sessions can still resolve it.
10. Testnet support is removed entirely: the `#network=testnet` handling, `TestnetBadge.tsx`, the hidden switch-network prompt, `isMainnet` and all its branches, testnet contract addresses, the testnet TonClient endpoint, and the wallet network-mismatch flow. The app is mainnet-only.
11. All internal links to `/app/` (landing page "Launch App" and equivalents, app `Header.tsx`/`Footer.tsx`, FAQ, docs content, `public/llms.txt`) point to the new URLs; `/stake/` is the canonical app entry point.
12. `react-router-dom` is removed from `package.json` (it is unused today and this design does not need it).
13. The sitemap (auto-generated) includes the five new pages. `npm run build` succeeds and the built `dist/` contains the prerendered HTML with the per-page copy verifiable via grep.

## 3. Out of scope

- **Visual/graphical redesign**, including unifying the landing header with the app header — explicitly the next phase. App pages keep the existing React `Header.tsx`/`Footer.tsx`; landing/HPO keep theirs.
- **True SSR / live data in HTML.** Hosting stays GitHub Pages, `output: 'static'`. Live numbers (APY, TVL, balances, charts) hydrate client-side as today.
- **Restructuring `/`, `/faq/`, `/hpo/`, `/docs/`** — unchanged apart from link updates.
- **BotFather configuration** (pointing the Telegram Mini App at `/stake/`) — happens outside this repo; listed as a coordinated follow-up.
- **Updating external listings** (wallet dApp catalogs, ton.app, aggregators) that link to `/app/` — the redirect stub covers them; updating listings is a follow-up.

## 4. UX / behavior

- **Page layout (all five app pages):** app UI (island) first, section-specific static content below it. The copy is normal page content — visible to users scrolling down and to crawlers, not hidden or collapsed-by-default.
- **First visit to any app page:** static shell paints immediately (header area, copy); the island hydrates and shows its existing loading behavior. No behavior change from today's `/app/` beyond the URL.
- **In-app navigation:** clicking Stake/Rewards/Stats/DeFi in the app header, or the stake/unstake tabs, performs a client-side view transition: URL and static copy update, island persists with all state (wallet, polling, entered amounts on the current widget are not required to survive — see §6). Feels like today's instant tab switching.
- **Entering the app from landing/HPO/docs:** a normal full page load of the target app page.
- **Back/forward:** browser history works across app pages; each history entry is a real path.
- **Legacy links:** `/app/`, `/app/#/page=reward`, bookmarks, and the old Telegram entry URL all land on the correct new page via the stub (a brief blank flash is acceptable).
- **JS disabled / crawler view:** each app page shows its title and explainer content; the app UI area shows nothing (as today). Acceptable.
- **Dark mode, mobile:** unchanged mechanisms via `AppLayout`; new copy sections must render correctly in both themes and on mobile widths.
- **Copy per page (drafted during implementation, reviewed by Behrang):**
  - `/stake/` — what liquid staking on Hipo is, how staking GRAM→hGRAM works, current-APY context, link to docs.
  - `/unstake/` — how unstaking works, instant vs. best-rate options and their trade-offs.
  - `/rewards/` — how rewards accrue to hGRAM value, how the history shown is computed.
  - `/stats/` — what each protocol metric/chart means.
  - `/defi/` — what the listed DeFi integrations are.

## 5. Technical approach

**Chosen navigation mechanism — and why it differs from the interview answer.** The interview selected "shared island + client router (react-router)". While validating that, a flaw surfaced: the SEO copy must live in the static Astro shell *outside* the `client:only` island (content inside a `client:only` island is never in the built HTML). A React-router-style takeover swaps only what the island renders, so navigating `/stake/` → `/rewards/` would leave `/stake/`'s static copy sitting under the rewards UI. Astro's `<ClientRouter />` (view transitions) solves exactly this: it swaps the page's static content on navigation while `transition:persist` keeps the island's DOM and React tree alive. Same user-visible result as promised (instant nav, no wallet/state loss, real URLs), correct static copy per URL. If `transition:persist` proves unreliable with the `client:only` island in practice, the fallback is accepting an island remount on app-page navigation (wallet session restores from localStorage; a brief loading state) — the URL structure and SEO outcome are unaffected by which mechanism ships.

**Pages & layout**
- New: `src/pages/stake/index.astro`, `unstake/index.astro`, `rewards/index.astro`, `stats/index.astro`, `defi/index.astro`. Each supplies per-page SEO props and its copy; shared chrome lives in `AppLayout`.
- `AppLayout.astro` gains `<ClientRouter />` in its head and mounts `AppIsland` (moved out of the old `app/index.astro`) in a wrapper with `transition:persist` (stable persist name identical across pages), with a slot for per-page copy below. `ClientRouter` lives only on app pages, so landing↔app transitions are normal full loads.
- `src/pages/app/index.astro` is replaced by the redirect stub (inline script per requirement 8, `noindex`).

**Model / island changes (`src/components/app/`)**
- `Model.ts`: delete `readFragmentState`/`writeFragmentState` and the `FragmentState` type. Add a pathname↔state mapping (`/stake/`→`{stake, stake}`, `/unstake/`→`{stake, unstake}`, `/rewards/`→`reward`, `/stats/`→`stats`, `/defi/`→`defi`). On init and on Astro's `astro:page-load` event, derive `activePage`/`activeTab` from `location.pathname`. `setActivePage`/`setActiveTab` call `navigate()` from `astro:transitions/client` instead of writing the hash; the resulting `astro:page-load` updates the observables (URL remains the single source of truth). Existing `autorun`s gated on `activePage` (rewards fetch at `Model.ts:380`, gauge refresh at `Model.ts:1264`) work unchanged.
- Testnet removal (requirement 10): `Model.ts` (~20 sites: testnet treasury address, testnet endpoint at `Model.ts:1066`, `isMainnet` computed and branches, network-mismatch handling around `Model.ts:1552`, switch-network prompt at `Model.ts:1591`, network fragment parsing), `TestnetBadge.tsx` deleted, references removed from `Header.tsx`, `Stats.tsx`, `StatsPage.tsx`. The gauge-vs-contract fallback logic in `Stats` simplifies since `isMainnet` is always true.
- `Header.tsx` nav items and `StakeUnstake.tsx` tab switch become path navigations (via the Model setters); `Footer.tsx` links updated.
- Manifest: move `public/app/tonconnect-manifest.json` → `public/tonconnect-manifest.json`, keep a copy at the old path, update `Model.ts:1478`.

**Housekeeping**
- Update `Landing.astro` (and any other "Launch App"/"Open App" links), FAQ/docs content linking to `/app/`, and `public/llms.txt`.
- Remove `react-router-dom` from `package.json`.
- Per-page OG images: reuse existing assets from `public/og/` unless a suitable one is missing, in which case reuse the generic one (new artwork is a design-phase task).
- Changelog entry per repo convention.

**No new dependencies.** Astro 6 ships view transitions/`ClientRouter` natively.

## 6. Edge cases & error handling

- **Unparseable or absent legacy hash on `/app/`:** redirect to `/stake/`.
- **In-progress form input across navigation:** entered amounts live in component/Model state; with the persisted island they survive navigation. If the fallback (remount) mechanism is used, they reset — acceptable, matches a fresh visit.
- **Transaction in progress (`WaitForTransaction` / `Wait.tsx` modal) while navigating:** with the persisted island the wait state survives. This must be verified during implementation; if the modal can be lost under the fallback mechanism, in-app navigation should be blocked while a transaction is pending.
- **Wallet-app redirect returns:** TonConnect returns the user to the page URL they connected from; since state is in the path, the correct section loads. `twaReturnUrl` (`t.me/HipoFinanceBot`) is unaffected.
- **Telegram Mini App:** until BotFather is updated, the TMA opens `/app/` and gets client-side redirected to `/stake/` — works, slightly slower first paint. After BotFather update, direct.
- **Old manifest URL:** wallets with pre-existing sessions fetch `/app/tonconnect-manifest.json`; the retained copy answers them.
- **Crawlers and the island:** `client:only` means the app UI never appears in HTML; each page's static copy is what gets indexed. No hydration-mismatch risk since nothing app-related is prerendered.
- **404:** unchanged (`src/pages/404.astro`); no catch-all needed since the five paths are real pages.

## 7. Open questions & assumptions

- **URL naming (assumed):** `/rewards/` (plural) even though the internal page id is `reward`; `/stats/`, `/defi/` as-is. Internal ids in `Model.ts` stay as they are; only URLs are plural where natural.
- **`/stake/` is the canonical app entry** — all "Launch App" style links point there (assumed; it matches `defaultActivePage`).
- **Copy authorship:** drafted during implementation from docs/protocol knowledge, reviewed by Behrang before merge; the SEO value depends on this content being accurate and substantive.
- **Manifest copy retention:** old path kept indefinitely (costs nothing); can be dropped later once old sessions are presumed dead.
- **`transition:persist` with a `client:only` island** is expected to work in current Astro 6; requirement 4's fallback (island remount) is the contingency, and choosing it does not change URL structure, SEO, or any other requirement.
- **Follow-ups after deploy (outside this repo):** update the BotFather Mini App URL to `https://hipo.finance/stake/`; update external listings/catalogs pointing at `/app/`; watch Search Console for the new pages being indexed.
- **Follow-up (separate workstream): self-hosted read endpoint with fallback.** To address public-node unreliability, Hipo will run its own liteserver-backed `ton-api-v4` HTTP endpoint (infra lives in the `operation`/`nginx` repos, behind a cache since v4 responses are block-keyed and immutable). The website-side change is small and independent of this restructure: point `TonClient4` at the Hipo endpoint first and fall back to `@orbs-network/ton-access` when it is unreachable. Only the read path (balances, treasury state, fee estimates) is affected — transactions go through the user's wallet via TonConnect. To be specced separately once the infra exists.
- **Declined during interview:** true SSR (stays on GitHub Pages); keeping `/app/` alive as a second entry point; unified site-wide header (deferred to design phase); keeping testnet support in any form (removed entirely, including the previously suggested "switch-only" removal).
