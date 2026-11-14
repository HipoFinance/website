# One header across the site

**Status:** phase 1 implemented 2026-11-14 (approved by Behrang: header width 1280 px, Open question 1 option A); phases 2–4 draft

## Goal

The header looks the same and stays put across the four main menu items. Phase 1 gives every header the
same width, so the logo does not jump. Phase 2 makes `/hpo/` an app page: it gets the app's header with
Connect/Disconnect, and switching between Stake, Club, Stats and HPO no longer reloads the page. Phase 3
(the Mini App) and phase 4 (the homepage) come later, each behind its own decision.

## In plain terms

The site has two headers that look almost the same. The homepage, HPO, FAQ and blog use a plain one with
an "Open app" button. Stake, Club and Stats use the app's header, which is part of the app itself and
shows "Connect wallet", or your address once you are connected. The two differ in two ways a visitor
notices:

- **Width.** On a computer the app's header is wider, so the logo sits further left on Stake, Club and
  Stats than on the homepage and HPO. The page content below has the same width on all of them; only the
  app's header is different. Phase 1 makes the app's header as wide as the other one. It is a change of
  a few classes, and nothing else moves.
- **Reloading.** Switching between Stake, Club and Stats swaps the content in place: the header, the
  wallet connection and the app stay loaded. HPO is an ordinary page, so going to HPO, or coming back
  from it, reloads everything. The header blinks, and a connected wallet shows "Connect wallet" for a
  moment before your address comes back. Phase 2 makes HPO an app page. The HPO content stays exactly as
  it is; only the header around it becomes the app's. A connected visitor then sees their address on
  HPO too, and there is a place for buy/sell buttons later.

What it costs: the HPO page then loads the app's script (about 52 KB compressed). It does not load the
heavy blockchain and wallet code unless the visitor already has a wallet connected. The HPO page's own
scripts (live price, chart, FAQ links) were written for a page that is always freshly loaded. They have
to be reworked to start again each time the page is switched in, and to stop when it is switched out.
If that is done wrong, the price or the chart stays empty after switching tabs, or a timer keeps running
on another page. The checks below cover exactly those cases.

What stays the same: the HPO content, its address and its search listing, the footer, the FAQ, the blog
and the other content pages. The Telegram Mini App does not get an HPO tab yet: that is phase 3, with its
own spec, because the Mini App draws its own tabs and its own scrolling area. The homepage is phase 4:
it would gain the same benefit, but it is the page new visitors and search engines judge first, so it is
measured before and after, and you decide on the numbers.

Decisions needed: see Open questions. One is for Alireza, whose Club wireframe set the wider header.

## Definitions

**Concepts**

- **App page**: a page built on `AppLayout.astro` (today `/stake/`, `/unstake/`, `/rewards/`, `/club/…`,
  `/stats/`, `/defi/`). It carries the app island and the Client Router.
- **Island**: the one React app (`AppIsland`) mounted on every app page. It is kept alive
  (`transition:persist`) when the Client Router swaps one app page for another, so the header, the wallet
  connection and the timers survive.
- **Client Router**: Astro's `<ClientRouter />`. It turns a link between two pages that both carry it
  into an in-place swap instead of a page load. A swap from or to a page without it is a full page load.
- **Swap-safe script**: a page script that sets itself up on `astro:page-load` whenever its elements are
  in the new page, and removes its timers, observers and global listeners on `astro:before-swap`. With
  the Client Router a bundled `<script>` module runs only once per browser tab, not once per page view.
- **Static shell**: the Astro mirror of the island's first paint (`src/components/app/shell/`), shown
  until the island hydrates. See `.claude/rules/app.md`.
- **Wallet session**: a TonConnect session stored under the `ton-connect-storage_bridge-connection`
  localStorage key. When one is found the island loads the TonConnect and chain code at once.
- **Chain code / TonConnect code**: the two lazily loaded chunks behind `loadChain()` and
  `loadTonConnect()` in `Model.ts`.

## Context

- Header widths. `SiteHeader.astro:54`: `max-w-[1280px] … px-6 … md:px-12` (inner width 1184 px).
  `Header.tsx:96` and `ShellHeader.astro:50`: `max-w-[1440px] … md:px-10` (inner width 1360 px), set by
  `30afd10` (2026-11-08, Club wireframe; `specs/club-wireframe-match.md:57`).
- Content widths already agree at 1184 px inside: `Landing.astro:74` and `Hpo.astro:194` (`1280` minus
  2×48), `StatsPage.tsx:248` and `ClubPage.tsx:188` (`1232` minus 2×24). The footer is narrower
  (`SiteFooter.astro:53`, 1040 px inside) and is left alone here.
- `/hpo/`: `HpoRoute.astro` renders `HpoLayout` + `Banner` + `SiteHeader active='hpo'` + `Hpo.astro` +
  `SiteFooter` (with its closing call to action). `HpoLayout` has no Client Router and is used by this
  route only.
- In the app, HPO is a plain link: `Header.tsx:27` (no `appPage`), `ShellHeader.astro:44`.
- Routing: `Model.ts:336` route table; `ActivePage` at `Model.ts:32`. `App.tsx:55` picks the page body
  by `activePage`; the default body is the stake form.
- Chain loading: `Model.ts:1231` starts `ensureChain()` on every page but `/defi/`;
  `initTonConnect()` (`Model.ts:3413`) loads the wallet layer only when a wallet session is stored.
- Block polling: `scheduleNextBlockRead()` (`Model.ts:2854`) reads every `updateLastBlockDelay`, or at
  the 5-minute `updateLastBlockStatsDelay` on `/stats/`.
- `AppLayout.astro` wraps the island and shell in `<main>`; `Hpo.astro:194` is itself a `<main>`, so
  dropping it into the layout's slot would give two `main` landmarks.
- HPO scripts (all run once at module load today): `hpo-data.js` (gauge refresh, a 5-minute
  `setTimeout` chain at `:192`, an `IntersectionObserver` for the burned count), `hpo-sparkline.ts`
  (reads its elements at module top, listens on `window` for `hpo:live-price` at `:481`),
  `hpo-anchors.ts` → `installDetailsAnchors()` (`details-anchors.ts`, adds `window`/`document`
  listeners).
- Mini App: `TmaTabs.tsx` has Stake, Club/Rewards, Stats, DeFi. Nothing inside the Mini App links to
  `/hpo/`. `AppLayout`'s inline probe hides every `data-tma-hide` element in Mini App mode.
- Sitemap: `/hpo/` is in the `site` group (`astro.config.mjs:20`, `APP_SECTIONS`).

## Approach

**Phase 1: header width.** In `Header.tsx` and `ShellHeader.astro`, the header row takes
`SiteHeader`'s container classes: `max-w-[1280px]` and `md:px-12`. The logo and the right edge then line
up with the 1184 px content column on every page. Rejected: widening `SiteHeader` to 1440 px instead,
because then the logo sits 88 px outside the content column on the homepage, HPO and every content
page.

**Phase 2: HPO as an app page.**

- `/hpo/` moves to `AppLayout` with a new page id `'hpo'`. The island renders only the header for it
  (`App.tsx`: no page body), and the HPO content stays static Astro in the layout's slot, as the SEO copy
  of the other app pages already does. The static shell for `'hpo'` is the header alone, as for
  `/rewards/` and `/defi/`.
- `Model` gets a `/hpo/` route and `'hpo'` in `ActivePage`. Like `/defi/`, HPO does not start the chain
  code by itself; only a stored wallet session does (through `ensureWallet()`). With a session, block
  polling on HPO uses the 5-minute Stats delay: the header only needs the address, not a live balance.
- In `Header.tsx` and `ShellHeader.astro` HPO gets `appPage: 'hpo'`, so it navigates in place and is
  coloured as active on `/hpo/`.
- For `'hpo'`, `AppLayout` keeps what the HPO page has today below the header: the full `SiteFooter`
  with its call to action, and no row of app links. Its outer `<main>` becomes a `<div>`, so
  `Hpo.astro`'s own `<main>` stays the page's single main landmark.
- The three HPO scripts become swap-safe. Each exports or contains an `init()` that runs on
  `astro:page-load` when its root element (`#hpoSparkline`, `#hpoPrice`, the FAQ list) is present, and
  a `teardown()` on `astro:before-swap` that clears the refresh timer, disconnects the observer and
  removes the `window` listener. `installDetailsAnchors` gets a guard so its global listeners are added
  once per tab.
- `/hpo/` stays in the sitemap's `site` group, so Search Console keeps its history. Its URL, title,
  JSON-LD and content are unchanged.
- Inside the Mini App, `/hpo/` is not reachable from any tab or link. If opened by hand
  (`/hpo/?tma=1`), it shows the default stake body until phase 3. This is accepted.

**Phase 3: Mini App HPO tab.** Not built here. It needs its own spec: the Mini App renders its own tab
row and one scroller, and hides the static content, so HPO must either be shown inside `TmaApp` or be
rebuilt in React. It also needs the open choice of whether HPO takes DeFi's tab (the site's menu already
dropped DeFi) or becomes a fifth tab.

**Phase 4: homepage as an app page.** The same pattern as phase 2, with page id `'home'` on `/`:
header-only island, no chain load without a session, `landing-data.js` made swap-safe, and
`landing-menu.js` gone with `SiteHeader` on that page. It starts only after a measurement: Lighthouse on
the mobile profile against `npm run preview`, five runs each, median performance score, LCP and TBT, for
`/` today and for `/` built with the island. The numbers go in this spec, and the person decides.

No new text in any phase: the app header's labels already exist in every locale's `app.json`.

## Changes

Phase 1

- `src/components/app/Header.tsx`, `src/components/app/shell/ShellHeader.astro`: header row
  `max-w-[1440px] … md:px-10` → `max-w-[1280px] … md:px-12`.
- `specs/club-wireframe-match.md`: note that the header width was brought back to the site's 1280 px
  with a link to this spec.
- `CHANGELOG.md`: one entry.

Phase 2

- `src/components/app/Model.ts`: `'hpo'` in `ActivePage`; `/hpo/` in `routes`; the `ensureChain` autorun
  skips `'hpo'` as it skips `'defi'`; `scheduleNextBlockRead` uses the Stats delay on `'hpo'`.
- `src/components/app/App.tsx`: no page body for `'hpo'`.
- `src/components/app/Header.tsx`, `src/components/app/shell/ShellHeader.astro`: HPO item gets
  `appPage: 'hpo'`; comments that say HPO is a full page load are corrected.
- `src/components/pages/shellJsonLd.ts`: `'hpo'` in `ShellPage`.
- `src/components/app/shell/AppShell.astro`: `'hpo'` maps to the header-only shell.
- `src/layouts/AppLayout.astro`: for `'hpo'`, a `<div>` instead of `<main>`, the full `SiteFooter`, no
  app link row.
- `src/components/routes/HpoRoute.astro`: renders `AppLayout page='hpo'` with its existing JSON-LD and
  `Hpo.astro`.
- `src/layouts/HpoLayout.astro`: deleted (no other user).
- `src/components/SiteHeader.astro`: `active` no longer takes `'hpo'`.
- `src/scripts/hpo-data.js`, `src/scripts/hpo-sparkline.ts`, `src/scripts/hpo-anchors.ts`,
  `src/scripts/details-anchors.ts`: swap-safe as in Approach.
- `.claude/rules/app.md`, `AGENTS.md` ("What this is"): HPO is an app page; `/hpo/` joins the route
  list and the chain-load exception.
- `CHANGELOG.md`: one entry.

Phases 3 and 4: their own changes, after their own decisions.

## Acceptance criteria

Phase 1

- [x] At 1280, 1440 and 1920 px wide, the logo's left edge is at the same x on `/`, `/hpo/`, `/stake/`,
      `/club/` and `/stats/`. Measured in a browser with `getBoundingClientRect()`. (2026-11-14, preview
      build: x = 48 / 121 / 361 px on all five pages; the button's right edge also matches, 1217 / 1305 /
      1545 px.)
- [x] At 1024 px, in Russian and in Persian, the header stays one row with no horizontal page scroll:
      first with "Connect wallet", then with the button text replaced by a connected-length label
      (`UQAB…wxyz · ` + the locale's Disconnect). (Row height 84 px in all four cases, the same as one
      row; no horizontal scroll.)
- [x] The static shell and the island give the same header geometry: no shift of the logo or the button
      at hydration on `/stake/`. (Measured instead of screenshots: the shell with scripts off and the
      hydrated island give identical logo x, row width, row height and button edge on `/stake/` and
      `/stats/` at 1024 and 1440 px.)
- [x] `npm run build` passes. (666 pages, including the `check-i18n` gate.)

Phase 2

- [ ] `/hpo/` shows the app header, with HPO coloured as active in the top nav (≥ 1024 px) and in the
      bottom tab bar (< 1024 px).
- [ ] Stake → HPO → Stats → HPO → Stake by the header links does not reload the page. Checked by a
      `window` marker set on the first page surviving to the last one, and by the network log showing no
      document request.
- [ ] After that same route, the HPO price, sparkline, range buttons, burned count and supply bar all
      work on the second visit to HPO, and only one gauge refresh timer exists. Checked by counting
      `/data` requests over the next 5 minutes on Stake: zero.
- [ ] `/hpo/#<an HPO FAQ anchor>` opens that question both on a direct load and after an in-place
      switch from Stake.
- [ ] With no wallet session, loading `/hpo/` fetches neither the chain chunk nor the TonConnect chunk
      (network log).
- [ ] With a wallet session, `/hpo/` shows the connected address in the header, and Disconnect works.
- [ ] `/hpo/` has one `main` element, and the same title, description, canonical, `hreflang` and
      JSON-LD as before. Diff of the built `dist/hpo/index.html` `<head>` against the current build.
- [ ] The HPO footer still has its closing call to action.
- [ ] `/fa/hpo/` renders right-to-left with Persian digits in the live figures, before and after an
      in-place switch.
- [ ] `npm run build` passes, and so do `node --experimental-strip-types scripts/i18n-selftest.mjs` and
      the `check-i18n` gate.
- [ ] Behrang checks Stake ↔ HPO on his phone, with a wallet connected.

## Risks & rollback

- **An HPO script misses its teardown.** Then a timer keeps polling the gauge from other pages, or
  listeners pile up on each visit. The `/data` request count and a check after repeated visits catch
  it.
- **A script misses its re-init.** Then the HPO figures stay as built, or the chart is blank after an
  in-place switch. The second-visit check catches it.
- **The page weight on HPO grows by the eager island.** This is accepted for phase 2; phase 4 measures
  the same question for the homepage before going ahead.
- **The narrower header at 1024 px.** If a locale wraps, the fix is to shorten that locale's label,
  not to widen the header again.
- **Rollback.** Each phase is one commit; reverting it restores the previous header or layout. Nothing
  is stored, and no data or URL changes.

## Open questions

1. **Header width: is Alireza fine with 1280 px?** His Club wireframe set 1440 px with 40 px padding.
   Option A, 1280 px everywhere: the logo lines up with the content on every page. Option B, 1440 px
   everywhere: the wireframe holds, but the logo leaves the content column on all the static pages.
   Recommendation: A, after a word with Alireza, since phase 1 undoes his choice.
2. **Phase 4: what loss in page speed is acceptable on the homepage?** Recommendation: go ahead if the
   median mobile performance score drops by 3 points or less and LCP does not get worse beyond run-to-run
   noise. Otherwise keep the homepage static, with phase 1's matching header.
3. **Phase 4: what should the homepage's header button say?** It would become "Connect wallet" (or the
   address) instead of "Open app". "Open app" is the clearer invitation for a first visit, but the
   hero already has its own Stake button. Recommendation: "Connect wallet", the same as every other
   main page, so the header never changes while you move between them. Decided when phase 4 starts.
