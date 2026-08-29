# 2026-08-29 — Baking the live numbers into the HTML

The landing and HPO pages shipped every live figure as an em dash and only
filled it in after a client-side fetch. Crawlers therefore indexed "—" where
the APY, TVL and holder counts should be, and the first paint carried no data
either. This bakes those numbers in at build time and adds a scheduled rebuild
so they stay fresh, while keeping the browser refresh that was already there.

This is step 1 of a three-step plan that came out of a review of a proposal to
rewrite the site as a server-rendered app. That proposal was **declined** — see
"Why not SSR" below.

## Commits

| Commit | Description                                        |
| ------ | -------------------------------------------------- |
| (this) | Bake the gauge numbers into the HTML at build time |

## What changed

**New `src/data/gauge.ts`, the single source of truth for these numbers.** It
holds both halves of the pipeline deliberately:

- `fetchGauge()` runs at build time from Astro frontmatter. One module-level
  promise serves all 512 prerendered pages, so a build makes exactly one request
  to `gauge.hipo.finance/data`.
- `gaugeValues(locale, data)` turns a payload into the formatted strings the
  markup shows, keyed by the DOM id that carries each one.

**Both client scripts now call that same `gaugeValues()`.** `landing-data.js`
and `hpo-data.js` previously each carried their own copy of the formatting
rules. They no longer do. This is what guarantees the value the browser writes a
moment after load is character-identical to the baked one — nothing visibly
flips, and a future change to a rounding rule cannot land on one side only. Both
scripts got smaller; the landing chunk went from 782 B to 487 B gzipped.

**A missing field is now skipped rather than written.** `gaugeValues` returns
`undefined` for anything the gauge omits, and `SetText`/`SetTitle` ignore
`undefined`. Previously a partial payload simply left the dash in place; now it
must not blank out a good baked value, which is the stronger requirement.

**`Landing.astro` and `Hpo.astro` render the baked values**, each falling back to
exactly the placeholder it used to always ship — the em dash, or for the hero
lead's holder count the "thousands of" phrase from the catalog. The plain value
elements use `set:text` rather than an interpolated child so no indentation
whitespace ends up inside them; with a child expression Astro emitted
`> $10.9M ` and the client's `textContent` write would have silently trimmed it.

**A scheduled rebuild** in `deploy.yml`: `cron: "17 */6 * * *"`, four times a
day, so a baked figure is never more than ~6 hours stale. A full build is 23
seconds, so this is cheap.

## What was deliberately left alone

**`#hpoBurned` stays purely client-side.** It comes from a TON v4
`get_jetton_data` run rather than the gauge, and its count-up animation starts
at zero — baking the final figure would make it visibly reset on load.

**The dApp pages** (`/stake/`, `/stats/`, …) are untouched. They already carry
static SEO prose; their live numbers come from the island, which is step 2/3 of
the plan.

## Why not SSR

The proposal was to rewrite the site as a server-rendered app so crawlers would
see live data and mobile performance would improve. Measurements said otherwise:

- The site is already Astro 6 with islands. The landing page ships 8.2 KB
  gzipped HTML and 859 B of JS — there is nothing to make faster there.
- The app pages already carry indexable prose: 1,607 characters on `/stake/`,
  961 on `/stats/`. What crawlers miss is the live widget, which no rendering
  strategy makes indexable.
- The mobile weight is `AppIsland`: 1.1 MB raw, 312 KB gzipped. A sourcemap
  breakdown attributes ~77% of it to the TON/wallet stack — `@tonconnect/ui`
  (21%), `@ton/core` (11%), `@tonconnect/sdk` (10%), `@ton/ton` (9%),
  `@ton/crypto` (7%), plus their `zod`/`axios`/`ua-parser-js` dependencies.
  Every byte of that has to run in the browser to connect a wallet and sign.
  SSR ships the same bytes and adds a server.
- Staying on GitHub Pages keeps a free global CDN and avoids making a DeFi
  frontend depend on our own uptime.

So the missing numbers were never a rendering-strategy problem — they were a
"we never asked for them at build time" problem, which is what this session
fixed. The mobile weight is a code-splitting problem, which is steps 2 and 3.

## Verification performed

- `npx astro build` — clean, 512 pages in 23 s, no gauge warning.
- Baked values confirmed in the built HTML across locales: `en` `17.34%` /
  `23,376` / `$10.9M`; `fa` `۱۷٫۳۴٪` / `۲۳٬۳۷۶` with Persian digits; `ar`
  `١٧٫٣٤٪؜`; `de` `17,34 %` / `10,9 Mio. $`; `ru` `23 376` with NBSP grouping.
  The `title` tooltip carries the exact amount (`7,996,353 GRAM`).
- **Gauge outage simulated** by pointing `GAUGE_URL` at an unresolvable host:
  build still exits 0, logs the warning exactly once (confirming the shared
  promise), and every figure falls back — dashes, and "thousands of" in the hero
  lead. The `title` attribute is correctly omitted.
- `node scripts/check-i18n.mjs` — ok, only the pre-existing "unreviewed"
  warnings; no new keys were added, so no locale work was needed.
- Confirmed `fetchGauge` is tree-shaken out of the client bundles: the landing
  chunk contains the client fetch URL but neither `AbortSignal` nor the build
  warning string.
- `#hpoBurned` confirmed still rendering `—` in the built HPO page.

## Follow-ups

- **Step 2** — a wallet-free island for `/stats/` and `/defi/`. `StatsPage.tsx`
  already imports `Model` as a type only and reads from Prometheus over HTTPS;
  `Defi.tsx` is a static link list. Grepping found that of the components
  importing `Model` as a value, only `App.tsx` actually calls `new Model()` —
  the rest use it purely as a Props type. So those two pages need none of the
  1.38 MB TON stack they currently download.
- **Step 3** — lazy-load `@tonconnect/ui` (31% of the island) behind the Connect
  click, restoring eagerly only when a saved session exists.
- **Step 4** — investigate dropping `@ton/crypto` + `tweetnacl` + `jssha`
  (~250 KB): the site never holds private keys, so these look purely transitive.
- GitHub disables scheduled workflows in a repository with no activity for 60
  days. It emails maintainers first; the "Enable workflow" button restores it.
- HPO's 24-hour volume is currently a genuine $4.10, so the landing page now
  shows `$4.1` to crawlers where it previously showed a dash until JS ran. Same
  number the client always displayed — only now it is indexable.
