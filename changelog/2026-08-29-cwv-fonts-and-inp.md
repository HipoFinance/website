# 2026-08-29 — The landing page's fonts, and a first pass at INP

Search Console is flagging three Core Web Vitals issues on mobile: LCP over 2.5 s, CLS over 0.1,
and INP over 200 ms. The first two name exactly one URL — `https://hipo.finance/` — and the third
names none.

That reassigns the problem. The [static app shell](2026-08-29-static-app-shell.md) and the
[island code-splitting](2026-08-29-app-island-code-splitting.md) earlier today were aimed at the
five dApp pages, which the [banner-CLS session](2026-08-25-banner-cls.md) had guessed were the
flagged URLs. They are not. `/` ships 1.6 KB of JavaScript and renders entirely from static HTML,
so none of that work touched the page Google is actually complaining about — and none of it was
aimed at INP, which had never been diagnosed here at all.

What is left on `/`, once the banner shift is gone, is fonts.

## Commits

| Commit | Description                                                            |
| ------ | ---------------------------------------------------------------------- |
| (this) | Preload the first screen's fonts and stop mobile fetching the hero art |

## LCP and CLS on `/`: the font chain

The mobile LCP element on `/` is the hero `<h1>` — the art beside it sits in a `hidden lg:flex`
wrapper and never renders on a phone. That heading is `font-fredoka`, three lines at 36 px on a
360 px screen.

Nothing was preloaded. Confirmed against the live site: `curl https://hipo.finance/` returned no
`preload`, `preconnect` or `dns-prefetch` link at all. So the critical path was

    HTML → global.css (65 KB, 11.7 KB gzipped) → fredoka-latin-wght-normal.woff2 (29.7 KB)

with `font-display: swap` on all 35 `@font-face` rules and no metric-matched fallback anywhere
(`ascent-override` appears zero times in the built CSS; the only `size-adjust` is the inert
`100%`). The first paint therefore drew the h1 in `ui-sans-serif`, and the page reflowed when
Fredoka landed a round trip later. A line-count change in a three-line 36 px heading moves the
entire document below it, which is the shape CLS scores worst.

**`src/components/FontPreload.astro`** (new) emits `<link rel="preload" as="font" crossorigin>` for
the faces that paint the first screen, chosen per locale. It is rendered from `SEO.astro` — above
the stylesheet links Astro injects, so the fonts download _alongside_ the CSS rather than after it
— and from `src/components/starlight/Head.astro`, which Starlight uses instead of `SEO.astro`.

The paths are `?url` imports of the fontsource woff2 files, which puts them through the same Vite
asset pipeline the `@font-face` `src`s already use. Verified that this dedupes rather than
duplicating: each of the seven preloaded faces is emitted exactly once into `dist/_astro/`, and
every preload `href` is byte-identical to the URL the built CSS references. A hash mismatch here
would have doubled the download instead of halving the wait.

Two faces per locale at most, and never more than ~60 KB, since this is meant to arrive with the
render-blocking stylesheet and not compete with it:

| Locale               | Preloaded                                             |
| -------------------- | ----------------------------------------------------- |
| en de tr it id pt-br | Fredoka latin (29.7 KB) + Heebo latin 400 (12.0 KB)   |
| ar                   | Cairo arabic (30.9 KB) — one file covers both roles   |
| ru                   | Nunito cyrillic (20.8 KB) + Roboto cyrillic (23.7 KB) |
| fa                   | Vazirmatn arabic (46 KB) — body only                  |
| hi                   | Poppins devanagari 400 (39.7 KB) — body only          |

Persian and Hindi get the body face alone because their display faces (Lalezar 52 KB, Baloo 2
115 KB) do not fit the budget beside it. Their headings still swap as they do today.

### The hero art

`images/hipo-bank.webp` is 107 KB and its wrapper is `hidden lg:flex`, so it never appears on a
phone — but the preload scanner runs before any CSS is parsed and fetched it anyway, against the
same connection as the LCP paint. It is now a `<picture>` with `<source media="(min-width: 1024px)">`;
the scanner honours `media` on a `<source>`, so a narrow viewport resolves to a 1×1 data URI and
requests nothing, while desktop still gets the webp eagerly at the same priority as before. The
`<img>` also gained the intrinsic `width="800" height="800"` it never had.

### Measured and rejected

The 35 `@font-face` blocks are 20 KB of the 65 KB `global.css`, and an English page uses two of
them. Stripping every one of them from the built file saves **2.7 KB gzipped** — 11.7 KB → 9.1 KB.
Splitting `i18n-fonts.css` per locale would mean a stylesheet compilation per locale across
`global.css`, `app.css` and `docs.css`, for two packets. Not worth it; recorded here so it is not
re-proposed.

## INP: three causes, none previously looked at

Search Console names no URL, so this is a first pass at the mechanisms rather than a fix for a
known page.

**Prefetch never ran on a phone.** Starlight sets `prefetch: { prefetchAll: true }` for the whole
site when the config does not
(`node_modules/@astrojs/starlight/index.ts:184`), which leaves Astro's default strategy of
`hover` — and Astro's hover listener is `mouseenter`/`focusin` only
(`node_modules/astro/dist/prefetch/index.js`, where `touchstart`/`mousedown` belong to `tap`
instead). So on a touchscreen nothing was ever prefetched: every tap on the dApp's bottom tab bar
was a cold document fetch, with `ClientRouter` holding the paint through the view transition, and
that whole round trip lands in the tap's INP. `astro.config.mjs` now sets
`defaultStrategy: 'viewport'`. It is self-limiting where it would hurt: `canPrefetchUrl` refuses on
a slow connection or offline, and `elMatchesStrategy` switches to `tap` automatically there, so a
3G visitor gets a touchstart head start rather than a sidebar of speculative requests. Confirmed
baked into the bundle as `let f=!0,h="viewport"`.

**Two inert buttons in the static shell.** `ShellHeader.astro` mirrors Header.tsx's Connect button
and mobile menu toggle as real `<button>` elements with nothing behind them. The amount input in
`ShellStakeForm.astro` was already `disabled`; these were not. A tap did nothing, so the visitor
tapped again — into a main thread busy hydrating React and pulling `chain.ts` (416 KB raw). Both
are now `disabled`, deliberately without Header.tsx's `disabled:cursor-progress disabled:opacity-70`:
there those fire only while the wallet chunk is in flight, here the button is disabled for its
whole life, so copying them would dim a button the island then paints at full opacity. That is the
one place this file's copy-the-classes rule is broken on purpose, and the comment says so.

Worth stating plainly: the static shell shipped this morning makes the page _look_ ready sooner,
which makes an early tap more likely. Part of that LCP win may have been paid for in INP.

## CLS on the dApp pages: a latent double-paint

Not what Search Console flagged, but found while reading the shell and fixed here.

`App.tsx` removed `[data-app-loading]` from a `useEffect`. React flushes passive effects _after_
the browser paints, so there was a frame in which the island's tree and the shell were both laid
out — the island renders into `<astro-island>`, which precedes `[data-app-loading]` in
`AppLayout.astro`. On `/rewards/` and `/defi/`, whose shell is a header inside `min-h-screen`,
removing it a frame later pulls the content up by about a viewport. It is a `useLayoutEffect` now,
which runs before that paint.

## Verification performed

- `npm run build` — clean, 514 pages, no new warnings (the nine i18n notices are the standing
  native-review ones).
- Preload `href`s on `/` are `fredoka-latin-wght-normal.DM6njrJ3.woff2` and
  `heebo-latin-400-normal.BGyEuwIV.woff2`, matching the URLs in the built `global.css` exactly.
  One emitted copy of each; same check passed for all seven faces across the five locale groups.
- Preload sits at byte 585 of `dist/index.html`, the first stylesheet link at byte 7150 — the
  fonts are requested first.
- Per-locale routing spot-checked on `/fa/`, `/ru/`, `/ar/`, `/hi/`, `/de/`, `/docs/` and
  `/ru/docs/`; Starlight pages resolve through the Head override to the same faces.
- `dist/index.html` carries the `<picture>` with the `media` source and `width`/`height`;
  `hipo-bank.webp` appears only inside the `srcset`.
- Prefetch strategy confirmed in the emitted chunk.
- `/stake/` ships both header buttons with `disabled`.
- `npx prettier --check` clean on every touched file.

## Follow-ups

- **Nothing here is measured in a browser.** This machine has no Chrome, Chromium, Playwright or
  Lighthouse, and the keyless PageSpeed Insights quota was exhausted, so the CLS claim rests on
  reading the critical path rather than on a trace. Run PSI or a local Lighthouse against `/`
  before and after this deploys.
- **Eyeball the hero art on a desktop viewport.** The `<picture>` rewrite is the only change with a
  visual surface, and it was verified as markup, not as pixels.
- **`font-display: optional` is the zero-CLS option if preloading is not enough.** With a preload
  in front of it the font almost always wins the 100 ms block period, and when it does not the
  page simply never swaps — no shift at all. It is a deliberate trade (a first-time visitor on a
  slow link sees the fallback face for that whole page load), so it is a design call, not a perf
  one.
- **The dApp's INP is still unmeasured.** Prefetch and the two buttons are the cheap mechanisms;
  the expensive one — `ensureChain()` pulling 416 KB raw from `init()` on every page but `/defi/`,
  parsing on the main thread right when the shell invites a tap — is untouched.
- **Do not click "Validate Fix" yet.** Search Console reads CrUX field data on a 28-day rolling
  p75. The banner CLS fix has four days in that window, everything else has none.
