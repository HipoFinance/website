---
paths:
  - "src/components/app/**"
  - "src/layouts/AppLayout.astro"
  - "src/data/gauge.ts"
  - "src/data/stats.ts"
  - "src/pages/app/**"
  - "src/pages/stake/**"
  - "src/pages/unstake/**"
  - "src/pages/rewards/**"
  - "src/pages/stats/**"
  - "src/pages/defi/**"
---

# dApp architecture and static shell

## dApp architecture (`src/components/app/`)

All state and blockchain logic lives in one MobX store: **`Model.ts`**. React components are thin `mobx-react-lite` observers of it. The Model handles:

- **Wallet connection** via `@tonconnect/ui` (`TonConnectUI`); the manifest lives at `/tonconnect-manifest.json` (a legacy copy stays at `/app/tonconnect-manifest.json` for old sessions). The header's connect/disconnect button is **our own React component** (`tonConnectUI.openModal()` / `Model.disconnect`) — TonConnect's button widget is not rendered (`buttonRootId` unset). TonConnect's modal root, stylesheet, toast portals, and focus-ring modality class are kept alive across view transitions by handlers in `Model.ts` (`keepRuntimeStyles`, `trackInputModality`) — re-verify those when bumping `@tonconnect/ui`.
- **Code splitting.** The two heavy dependency stacks are behind dynamic imports and Model.ts holds only `import type` for them, so the eager island is ~52 KB gzipped instead of the ~290 KB it and the two lazy chunks come to together (measured 2026-09-11; re-measure with `gzip -c dist/_astro/AppIsland.*.js | wc -c` rather than trusting this number). `./chain.ts` re-exports every runtime value from `@ton/*` and `@hipo-finance/sdk` and is fetched by `loadChain()` — note it takes them from **`@ton/core`** and from `@ton/ton/dist/client/TonClient4.js`, never from the `@ton/ton` entry point: that barrel is CommonJS with no `exports` map, so importing it drags in the wallet contracts, multisig helpers and mnemonic tooling (this is also why `@hipo-finance/sdk` ≥ 4.4.0 is required — it peer-depends on `@ton/core`). The deep path is unversioned, so re-check it when bumping `@ton/ton`, and keep the `.js` extension: Vite resolves without it, Node's ESM resolver does not; `@tonconnect/ui` is fetched by `loadTonConnect()`. Reach them through `chain!.X` / the module a path awaited — never add a static import of those packages back to `Model.ts`. `ensureChain()` runs from `init()` on every page except `/defi/` (which reads nothing from the chain); `ensureWallet()` loads TonConnect **and** the chain, on a Connect press or when a stored session is found under the `ton-connect-storage_bridge-connection` localStorage key. `isChainReady` is the observable that makes the guarded getters (`amountInNano`, `isAmountValid`, the fee lines, `stakingInProgress*`, `treasuryAddressFormatted`) recompute when the module lands — until then they report "not ready" rather than a wrong number.
- **Blockchain access** via `TonClient4` against a fixed mainnet v4 endpoint (ton-access is dead — see the comment in `Model.setTonClient`'s caller), polling the last block every 10s on the stake form and re-deriving contract state from it via MobX `autorun`s (`/stats/` polls at 5min instead, the gauge's cadence — see `scheduleNextBlockRead`). Mainnet only; testnet support was removed 2026-08-10.
- **Protocol contracts** via `@hipo-finance/sdk` (`Treasury`, `Parent`, `Wallet`).
- **Stake/unstake flows** including fee estimates and an "instant vs. best-rate" unstake option; transaction progress is modeled by the `WaitForTransaction` state and shown by `Wait.tsx`.

App navigation state (`activePage`, `activeTab`) is derived from **`location.pathname`** via a route table in `Model.ts` (`/stake/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/`, with or without a locale prefix — note `/rewards/` maps to the internal id `'reward'`). The Model syncs on the `astro:page-load` event; UI components navigate through `model.navigateToPage`/`navigateToTab`, which call Astro's `navigate()` with `model.localizedPath(...)` so the static shell swaps too. Never pass props to `AppIsland` — differing props make Astro re-hydrate the persisted island and reset the React tree. The island's locale comes from the document: `AppLayout.astro` inlines the merged app catalog as `<script type="application/json" id="i18n-app">` on non-English pages and `Model.syncLocale()` reads it on `astro:after-swap`; inside the Telegram Mini App (URL has no locale) `Model.applyTelegramLocale` fetches `/i18n/<locale>.json` instead. All user-visible strings go through `model.t(key)` (`src/i18n/<locale>/app.json`), all numbers/dates through `model.format*` — never hand-roll number formatting or parse amounts with `parseFloat`; the amount input keeps the raw text in `model.amountRaw` and the canonical value in `model.amount` (see `setAmount`).

`pollyfills.ts` installs the `Buffer` polyfill required by the TON libraries. It is the first import of **`chain.ts`** (not of the island, as it used to be) — Rollup keeps side-effectful imports in source order within a chunk, so that is what guarantees the polyfill is installed before the TON libraries evaluate. Importing it from the island again would pull `buffer` back into the eager chunk for every visitor.

## The static app shell (`src/components/app/shell/`)

`AppShell.astro` and its parts (`ShellHeader`, `ShellStakeForm`, `ShellStats`, `ShellIcon`) are hand-written Astro mirrors of the island's React markup, rendered at build time into the `[data-app-loading]` wrapper that `App.tsx` deletes the moment it hydrates. They exist so the app pages paint their chrome — and their live figures — instead of a spinner, and so crawlers see the app rather than a loading message.

The rule that makes them work: **a mirror reproduces the island's FIRST-paint state, not its eventual state** — no wallet connected, nothing read from the chain. Rendering a value the island would then blank is a worse flash than the spinner was. Chain-gated rows (`youWillReceive`, `exchangeRate`, the fee lines) are therefore rendered present-but-empty, so they hold their final height from the first paint.

The stats strip is the one exception, and the reason it works is the `#gauge-data` script tag: `AppLayout` inlines the build-time gauge payload, `ShellStats` renders figures from it via `appStats()` in `src/data/gauge.ts`, and `Model` seeds its own `gauge`/`holdersCount` from the same tag (`readInlineGauge`) so the island's first paint reproduces them exactly. `appStats()` deliberately formats differently from `gaugeValues()` — it matches Model's `statsApyFormatted` / `statsStakedCompact` / `statsHoldersFormatted`, which round differently from the landing page's copies.

`/stats/` has a second seed: `src/data/stats.ts` fetches the charts' Prometheus range at build time and keeps only the last rate value plus a first-to-last delta for staked/holders/rate, inlined as `#stats-data` on that page alone. It exists because the rate and the deltas have no gauge equivalent. `Model.seededDelta` is **range-guarded** — the card line names its window ("over 1M"), so the seed is dropped as soon as `statsRange` differs from the range it was computed for. The query string lives in `src/data/prometheus-query.ts` because the chart client, that build-time fetch and the nginx allowlist in `specs/metrics-proxy-nginx.conf` must agree on it byte-for-byte; the gauge host is behind Cloudflare, so the build-time fetch must send a `user-agent` or it gets a challenge.

Classes in the mirrors are **copied** from the React components and must stay copied; a divergence shows up as the page shifting when React mounts. `ShellIcon.astro` likewise carries lucide's icon paths and default SVG attributes by hand — re-check them against `node_modules/lucide-react/dist/esm/icons/<name>.mjs` when bumping lucide. The wrapper is `data-tma-hide`, because this is the desktop chrome and Telegram gets `TmaApp` instead. `/stake/`, `/unstake/` and `/stats/` have a body mirror; `/rewards/` and `/defi/` get the header only. `ShellStatsPage.astro` deliberately mirrors only the title block, the range pills and the four headline cards — the charts are left to the island, which has its own in-card loading state and nothing useful to draw before its history arrives.
