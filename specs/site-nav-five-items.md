# Site menu: five items, bottom tabs on every page

**Status:** implemented (approved 2026-11-02 by Behrang: HPO moved last, HPO logo as its icon)

## Goal

The main menu shows the five places a visitor actually goes: Stake, Club, Stats, DeFi and HPO. Stake, the
core of the business, comes first. The same
five items appear as bottom tabs on phones, on every site page and not only in the app. Docs, FAQ and Blog
move to the hamburger menu and the footer, and Home is reached through the logo.

## In plain terms

Today the menu at the top of the site has eight items: Home, HPO, Docs, FAQ, Stake, Club, Stats and
DeFi. That is so many that the menu only fits on wide screens (1280px and up). Anything narrower,
including many laptops, gets a hamburger button instead. On phones, the app pages
(Stake, Club, Stats, DeFi) also show a row of tabs at the bottom of the screen, but the home, HPO and
FAQ pages don't. Moving between the site and the app therefore feels like moving between two sites.

After the change there is one menu of five: **Stake, Club, Stats, DeFi, HPO**. On a computer it sits in
the top bar. On a phone the same five sit at the bottom of the screen, within thumb's reach, on every
page: home, HPO, FAQ, blog, the compare and verify pages, and the app.

- **Home** leaves the menu. The Hipo logo at the top left already goes home on every page, as on most
  sites, and Home is the page people land on rather than one they switch back to.
- **Docs, FAQ and Blog** leave the main menu but stay one tap away in the hamburger menu, under the five
  main items. They are also still in the footer, where Docs and FAQ already are.
- **The docs section** (`/docs/`) keeps its own header and menu; it is a separate system and does not
  get the bottom tabs.
- **The Telegram mini app** is not touched; it has its own tabs.

The main risk is small and visible: a label that doesn't fit, or the fixed tab bar covering the end
of a page. Both are checked on screenshots in the longest languages before anything ships. Nothing here
touches money, wallets or data. Undoing it is one revert.

Everything was agreed in the chat on 2026-11-02.

## Definitions

**Concepts**

- **Main items**: the five menu entries Stake, Club slot, Stats, DeFi, HPO, in that order.
- **Secondary links**: Docs, FAQ, Blog. Shown in the hamburger menu, under the main items.
- **Bottom tabs**: the bar fixed to the bottom of the screen below the `lg` breakpoint (1024px), today
  rendered on the app pages only (`Header.tsx`'s `pages`, mirrored in `ShellHeader.astro`'s `tabs`).
- **Inline nav**: the links in the top bar, today shown from the `xl` breakpoint (1280px).
- **The three copies**: the menu exists in `SiteHeader.astro` (static pages), `app/Header.tsx` (the app
  island) and `app/shell/ShellHeader.astro` (the app's static first paint). They must stay identical.
- **Club slot**: the second app item is Club when `CLUB_ON` / `clubBuilt()` is true, Rewards otherwise;
  that switch stays as it is.

## Context

- `src/components/SiteHeader.astro:23-35`: the static pages' eight items. The inline nav shows from `xl`
  (`:48`), because "eight items plus the language switcher need room (Russian overflows at 1024 px)"
  (`:6-7`). Below `xl` a hamburger opens `#mobile-menu` (`:81`), driven by `src/scripts/landing-menu.js`.
  `active` is `'home' | 'hpo' | 'faq'` (`:14`). Used by HomeRoute, HpoRoute, FaqRoute, VsRoute, VerifyRoute
  and BlogLayout.
- `src/components/app/Header.tsx:15-23`: the app's four bottom tabs (Stake, Club, Stats, DeFi) with
  lucide icons Coins, Gift, ChartLine, ArrowLeftRight; `:29-40` the same eight inline items as
  SiteHeader; the tab bar is `fixed … bottom-0 … lg:hidden` (`:165-168`) and its tabs are `<button>`s
  that call `model.navigateToPage`.
- `src/components/app/shell/ShellHeader.astro:29-50`: the static mirror of both lists; its tabs are real
  links with icons from `ShellIcon.astro`.
- `src/components/SiteFooter.astro:54`: the footer adds `pb-20 lg:pb-0` only when `app` is set, to clear
  the tab bar. Its "Docs" column already links Documentation and FAQ (`:38-45`); Blog is in the social
  column (`:31`).
- `src/components/starlight/Header.astro:40-45`: the docs header has its own links (FAQ, Stats, Open app).
- `src/components/app/tma/TmaTabs.tsx`: the mini app's own tabs, separate from all of the above.
- Catalog keys: `site.nav.*` (`src/i18n/<locale>/site.json`) and `app.nav.*` (`app.json`) hold every
  label except Blog in the app catalog. The longest Stats labels are "Estatísticas" (pt) and
  "İstatistikler" (tr).

## Approach

1. **One list of main items** in each of the three copies: Stake, Club slot, Stats, DeFi, HPO (`/hpo/`).
   The inline nav and the bottom tabs both render it.
2. **Bottom tabs on the static pages.** `SiteHeader.astro` renders the same fixed bar as `ShellHeader`
   (same classes, copied, plain `<a>` links, `ShellIcon` icons), below `lg`. HPO is marked active on
   `/hpo/`. In the app, the HPO tab is a plain link (a full page load, as the inline HPO link is today),
   and the four app tabs keep `navigateToPage`.
3. **Footer clearance on every page.** `SiteFooter` applies `pb-20 lg:pb-0` always, not only with `app`.
4. **Hamburger menu**: Docs, FAQ, Blog, then (static pages) the existing "Open app" button. Since the
   inline nav moved to `lg` (point 5), the hamburger only exists below `lg`, where the tabs show the main
   items, so it holds the secondary links only.
5. **Inline nav from `lg`.** The rule was: move it from `xl` to `lg` only if it fits at 1024px in all
   eleven locales in both headers, including the app header with a connected wallet. Measured 2026-11-02:
   it fits (the widest, Russian with Open app, leaves about 80px), so it is `lg`.
6. **HPO icon**: the HPO coin (`public/images/hpo.svg`) as a one-colour icon in `currentColor`: the coin
   disc filled, the hippo face cut out of it through an SVG mask, the face's features drawn back. It follows
   the tabs' grey/coral colouring like the line icons. The full-colour violet coin was shown as the
   alternative and is a one-line swap; it was not the default because it would out-shout Stake.

Rejected: **six tabs including Home.** At 360px each tab gets 60px, and the pt/tr/ru Stats labels don't
fit. **Docs and FAQ in the footer only.** That makes them two screens of scrolling away on a phone; the
hamburger keeps them one tap away at no cost to the main row.

## Changes

- `src/components/SiteHeader.astro`: five main items; secondary links in the mobile menu; the fixed bottom
  tab bar; `active` becomes `'hpo' | 'faq'` (FAQ is marked in the secondary list); inline nav breakpoint per
  Approach 5; header comment updated.
- `src/components/app/Header.tsx`: `siteLinks` → five main items plus secondary links; `pages` → five tabs
  with HPO as a plain link; hamburger as in Approach 4; breakpoint per Approach 5.
- `src/components/app/shell/ShellHeader.astro`: mirror of `Header.tsx`, classes copied.
- `src/components/app/HpoIcon.tsx` (new) and `src/components/app/shell/ShellIcon.astro`: the one-colour HPO
  coin, the same SVG in both.
- `src/components/SiteFooter.astro`: tab-bar clearance on every page.
- `src/components/routes/HomeRoute.astro` (and any other caller passing `active='home'`): drop the prop.
- `src/i18n/<locale>/app.json`: new `app.nav.blog`. `src/i18n/<locale>/site.json`: new
  `site.header.mainNav` (the bottom bar's `aria-label` on static pages). English first; the other ten locales
  after approval, through the `locales` skill. Unused keys (`site.nav.home`, `app.nav.home`) are removed if
  `check-i18n` allows it.
- `CHANGELOG.md`: one entry.

## Acceptance criteria

- [x] On `/`, `/hpo/`, `/faq/`, `/blog/`, `/vs/`, `/verify/`, `/stake/`, `/club/`, `/stats/` and `/defi/` at
      1280px, the inline nav reads exactly Stake, Club, Stats, DeFi, HPO (Rewards in place of Club when
      the flag is off), and the logo links to the locale's home.
- [x] At 390px on the same pages, a bottom bar shows the same five items with icons, and the current page's
      item is coral (HPO on `/hpo/`, none on `/`, `/faq/`, `/blog/`, `/vs/` and `/verify/`).
- [x] In the app at 390px, tapping Stake, Club, Stats or DeFi switches page without a full reload (the island
      is not re-created, wallet stays connected); tapping HPO loads `/hpo/`. Verified by Behrang on his phone on
      2026-11-02 (the wallet stays connected); headless runs could not connect a wallet.
- [x] At 360px, every tab label fits on one line without clipping in en, de, ru, pt, tr, fa and ar, light
      and dark (screenshots).
- [x] At 390px, the hamburger shows Docs, FAQ, Blog (and Open app on static pages) and no main items; from
      1024px there is no hamburger.
- [x] The end of the footer is fully visible above the tab bar when scrolled to the bottom at 390px on every
      page in the first criterion.
- [x] The inline nav breakpoint is `lg` only if a 1024px screenshot of the static and the app header (wallet
      connected) shows no wrap or overlap in all eleven locales; otherwise `xl`, and the report says which.
- [x] The app's first paint (`ShellHeader`) and its hydrated header produce no visible shift of the header or
      tab bar (screenshot before and after hydration on `/stake/`).
- [x] No horizontal page scroll at 360px on any page in the first criterion.
- [x] `/docs/` and the Telegram mini app look as they did before.
- [x] `npm run build` passes (including `check-i18n`) and `node --experimental-strip-types scripts/i18n-selftest.mjs`
      passes.

## Risks & rollback

- **The tab bar covers content** at the end of a static page, or something fixed already sits at the
  bottom. Caught by the footer criterion; the fix is padding.
- **Labels clip** in a long locale. Caught by the 360px screenshots; fallback is 11px labels, or the tab
  shows its icon with the label under it truncated, decided on the screenshot.
- **The three copies drift**, and the app header jumps on hydration. Caught by the before/after
  screenshot.
- **Fewer clicks reach Docs/FAQ.** Measurable in analytics after launch; easy to bring a link back.
- Rollback: revert the commit; no data, URLs or state are involved.

## Open questions

None. The HPO icon was settled on 2026-11-02 (the HPO coin; see Approach 6).
