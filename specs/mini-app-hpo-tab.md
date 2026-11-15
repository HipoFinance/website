# Mini App: HPO tab in place of DeFi

**Status:** approved 2026-11-14 by Behrang, with the recommended answers to both open questions (phase 3 of
`specs/one-header-across-site.md`); implemented 2026-11-14 and live (fbc5a70). Every criterion is checked, Behrang's phone check
included (2026-11-15).

## Goal

The Telegram Mini App's tab row becomes Stake, Club, Stats, HPO, the same four items as the website's
menu. DeFi leaves the tab row and stays reachable through a link on the Stake screen.

## In plain terms

Inside Telegram, Hipo opens as a Mini App with four tabs at the bottom: Stake, Club, Stats and DeFi. On
the website, DeFi left the main menu on 2026-11-14 and HPO took its place. This change does the same in
Telegram.

The Mini App has no HPO screen yet. The website's HPO page is ordinary page content, and the Mini App
hides ordinary page content: it shows only its own app, inside one scrolling area between the header
and the tab row. It is built that way so that scrolling never drags Telegram's own window around.

The plan is to show the website's HPO page itself inside that scrolling area. When the HPO tab is
open, the app moves the page's HPO content into its scrolling area. When you leave the tab, it puts the
content back. Nothing is copied or rewritten, so the Mini App shows exactly what the website shows:
price, chart, supply, tokenomics and FAQ, in the reader's language, with no new text to translate.

Four things are adjusted for Telegram:

- The two YouTube videos are hidden.
- Links into the documentation open outside the Mini App, because the docs have no tabs and no way back.
- The site footer and its "start staking" box stay hidden.
- If the language is switched just as HPO opens, the page reloads in that language. Without this, the
  text could be English while the numbers are Persian.

DeFi becomes a small "DeFi" link on the Stake screen, using the existing label. The DeFi page itself
works as before; no tab is lit while you are on it.

The alternative is a compact HPO screen written for the Mini App: price, chart and supply only. It
would fit Telegram better, but the chart (about 560 lines) and the supply bar would have to be rewritten,
and its text would need new translations in 11 languages. It is the better choice only if you want a
short screen rather than the full page.

The main risk is moving page content in and out of the app across page switches. If that goes wrong,
the HPO tab shows an empty area, or a stale copy whose price never updates. The checks below test exactly
that, by switching back and forth. Rollback is one commit.

Decisions needed: see Open questions.

## Definitions

**Concepts**

- **Mini App mode**: the island renders `TmaApp` instead of the website chrome. It is set by Telegram's
  launch parameters, or forced with `?tma=1` for testing (kept in sessionStorage `hipo.tma`).
- **Scroller**: the one `overflow-y-auto` element in `TmaApp` (`TmaApp.tsx:59`). The document itself
  does not scroll in Mini App mode (`app.css:46-51`).
- **HPO body**: the static `<main>` that `Hpo.astro` renders into `AppLayout`'s slot, inside the
  `data-tma-hide` wrapper.
- **Host**: an empty `<div>` the island renders inside the scroller on the HPO tab, which the HPO body
  is moved into.

## Context

- `TmaTabs.tsx:9-20`: tabs Stake, Club (or Rewards before `CLUB_ON`), Stats, DeFi; each calls
  `model.navigateToPage(page)`, which navigates in place to the locale's path.
- `TmaApp.tsx:43-59`: picks the body by `activePage`; `'hpo'` falls through to the stake form today.
- `app.css:40-51`: `html.tma [data-tma-hide] { display: none }`; `html` and `body` do not scroll.
- `AppLayout.astro`: the slot (HPO body, SEO copy of other pages) sits in a `data-tma-hide` wrapper.
- HPO page scripts (`hpo-data.js`, `hpo-sparkline.ts`) find their elements by id on
  `astro:page-load` and stop on `astro:before-swap`; the sparkline redraws on resize
  (ResizeObserver), so it draws once it becomes visible.
- `Model.applyTelegramLocale` (`Model.ts`, ~line 1153) sets the locale from Telegram after start-up;
  `hpo-data.js` reads `html.lang` for number formatting.
- Labels `app.nav.hpo` and `app.nav.defi` exist in every locale's `app.json`.

## Approach

- `TmaTabs.tsx`: `'defi'` → `'hpo'` (label `app.nav.hpo`, a coin-style lucide icon different from
  Stake's), `Page` type updated.
- `TmaHeader.tsx`: title `app.nav.hpo` on `'hpo'`.
- `TmaApp.tsx`: on `'hpo'`, render a host `<div>` with no React children. A layout effect on
  `activePage` and an `astro:after-swap` listener move `[data-tma-content] > main` into it. On
  `astro:before-swap` the host is emptied. This is required: the persisted island carries its DOM into
  the next document, so a stale `#hpoPrice` would otherwise sit ahead of the new one and the scripts
  would bind to the stale copy.
- `AppLayout.astro`: `data-tma-content` on the slot wrapper.
- `app.css`: in Mini App mode, hide the HPO videos (`html.tma #watch`).
- Amended during the build: in Mini App mode the videos are removed, not only hidden, because a
  `display: none` iframe still downloads. An inline script after `#watch` in `Hpo.astro` removes it on a
  full load when `html.tma` is set, and `TmaApp` removes it from `event.newDocument` on every
  `astro:before-swap`. The website's markup is unchanged. If Telegram is then not confirmed (a false
  launch-parameter match), the Model replaces `/hpo/` with a fresh copy so the website gets the videos back.
- `TmaApp.tsx`: while in Mini App mode, a click on a `/docs/` link inside the host opens it with
  `Telegram.WebApp.openLink` (or `window.open` in forced mode). Links to `/club/` and other app pages
  stay in place. Amended after review: every link that is not an app page opens outside the same way
  (other sites, and pages of this site without the app), a `t.me` link through `openTelegramLink` on
  Bot API 6.1+; modified clicks and `#anchors` are left alone.
- `Model.applyTelegramLocale`: after the locale is applied, if `activePage === 'hpo'` and the URL's
  locale differs, replace the URL with the localized `/hpo/` (`navigate(…, { history: 'replace' })`).
  Amended after review, because that raced with a tap during the launch (it aborted a tap's navigation,
  or missed an HPO page arriving after the locale): one method, `alignHpoLocale`, does it, on an English
  URL only, never while a ClientRouter navigation is in flight (`astro:before-preparation` to
  `astro:page-load`), and runs both when the locale lands and on every `astro:page-load`.
- `TmaStakeUnstake.tsx`: a text link `app.nav.defi` that calls `model.navigateToPage('defi')`.
- Rejected: letting the document scroll on HPO only. It brings back Telegram's pull-to-close, and the
  fix for that needs Bot API 7.7.

## Changes

- `src/components/app/tma/TmaTabs.tsx`, `TmaHeader.tsx`, `TmaApp.tsx`, `TmaStakeUnstake.tsx`
- `src/layouts/AppLayout.astro`, `src/styles/app.css`
- `src/components/app/Model.ts` (`applyTelegramLocale`, `alignHpoLocale`, the revoked-Telegram reload)
- `src/components/app/tma/telegram.ts` (`openOutside`), `src/components/Hpo.astro` (the inline script)
- `.claude/rules/app.md`, `specs/one-header-across-site.md` (phase 3 status), `CHANGELOG.md`

## Acceptance criteria

- [x] At 390×844 on `/hpo/?tma=1`, the tab row reads Stake, Club, Stats, HPO with HPO active, the HPO
      content is inside the scroller, the document does not scroll (`scrollHeight === innerHeight`),
      the scroller does, and the sparkline has a width above 0. (Preview build over CDP: tabs Stake, Club,
      Stats, HPO with HPO `aria-current`, header title HPO, `#hpoPrice` inside the scroller, document 844/844 and
      `scrollTo(0, 500)` leaves `scrollY` 0, scroller 7990/736 and scrolls to 500, sparkline 284 px wide
      with its path drawn, no horizontal scroll.)
- [x] HPO → Stake → HPO → Stats → HPO by the tabs: exactly one `#hpoPrice` in the document each time,
      the price and chart are filled on each visit, and no gauge requests from the HPO scripts while on
      Stake (network log, 5 minutes). (One `#hpoPrice` and one `main` on each HPO visit, none on Stake
      and Stats; each visit shows the live price `$0.004851`, not the baked `$0.004892`, after its own
      `/data` request, and the sparkline is drawn at 284 px. On Stake for 320 s: 0 gauge requests from
      the HPO scripts, 1 from the island's own gauge poll.)
- [x] No YouTube request in Mini App mode on `/hpo/`; on the website `/hpo/` still loads them. (Amended
      during the build, see Approach. Over three HPO visits under `?tma=1`: 2 requests, the two embed
      URLs on the first load, both `net::ERR_ABORTED` (canceled) before any response, 3 of 3 runs; none on
      the in-place visits; `#watch` absent on every visit. Hiding with CSS alone had let 73 through, and
      `loading="lazy"` 59. Website `/hpo/`: 22 and 24 YouTube requests at 1440 and 390 px.)
- [x] A docs link inside the HPO tab opens outside the Mini App (in forced mode: a new tab), and the
      Mini App stays on HPO. (A click on "Tokenomics docs" opened a new target at
      `/docs/hipo-tokens/hipo-governance-token-hpo/`; the Mini App stayed on `/hpo/` with HPO lit. An
      in-page link to `/stats/` still navigates in place, with Stats lit. After review, every off-app
      link: `https://x.com/hipofinance` and `https://t.me/HipoFinance` each opened a new tab with the
      Mini App left on `/hpo/`; `#tokenomics` scrolled the scroller to 2171 in place; `/club/` opened
      in place. Telegram's `openLink` and `openTelegramLink` themselves are for the phone check.)
- [x] Added after review, with a fake Telegram launch hash (Persian `language_code`, no real webview):
      an English `/hpo/` is replaced by `/fa/hpo/` (Persian `h1`, `rtl`, history length 2). A tap on
      Stake while the catalog loads, with the catalog landing mid-navigation (catalog 1.5 s, page fetch
      5 s), ends on `/stake/` with the island in Persian. A tap on HPO from `/stake/` in the same window
      ends on `/fa/hpo/` with Persian text, and Stake then goes to `/fa/stake/`. A launch hash that the
      SDK rejects (`#tgWebAppData=`) ends on the website `/hpo/` with `#watch` and its 2 iframes back.
- [x] `/fa/hpo/?tma=1` renders right-to-left with Persian digits; light and dark schemes both legible
      (screenshots). (`dir=rtl`, `lang=fa`, price `$۰.۰۰۴۸۹۲`, tabs `استیک | Club | آمار | HPO*`;
      screenshots of the top, the tokenomics and the end of the page and of Stake, en and fa, light and
      dark, looked at: legible in all eight, no horizontal scroll.)
- [x] The Stake screen has a DeFi link that opens `/defi/`, with no tab lit there. (The link sits under
      the two rate lines; it opened `/defi/` in place with header title DeFi and 0 `aria-current` tabs.
      The Connect button stays at the bottom: its bottom edge is at 752 px on both Stake and Unstake,
      and the scroller does not overflow, 736/736.)
- [x] The website's `/hpo/` outside the Mini App is unchanged: same checks as phase 2 (price, chart,
      FAQ anchor, one `main`). (At 1440 and 390 px: one `main`, live price filled, sparkline 482 and 284
      px wide and drawn, `/hpo/#how-many-hpo-exist-and-how-many-are-burned` opens that question at 24 px
      from the top, YouTube embeds requested.)
- [x] `npm run build` passes. (666 pages, including the `check-i18n` gate; the i18n selftest passes,
      19 groups.)
- [x] Behrang opens the Mini App in Telegram on his phone and checks the HPO tab, scrolling, and back to
      Stake. (2026-11-15: the HPO page shows correctly and scrolls, and the DeFi link opens from Stake.
      Outside links first failed: the app's own screens used plain new-tab links, fixed in de23f5b, and
      the bot's Main App URL was on club.hipo.finance, so Telegram dropped the page's messages; Behrang
      moved it to hipo.finance/club/ in BotFather, and links now open from every entry.)

## Risks & rollback

- **Stale or missing HPO content after switching.** Caught by the one-`#hpoPrice` check and the
  filled-price check on each visit.
- **Locale race inside Telegram.** It cannot be tested in forced mode (`applyTelegramLocale` does
  nothing there); the phone check covers it.
- **Safe areas and Telegram's own theme.** These can be checked only on a phone. The static page uses
  the same colour tokens as the other Mini App screens, which already follow the system scheme.
- **Rollback**: one commit; revert restores the DeFi tab.

## Open questions

1. **The full HPO page or a compact Mini App screen?** Full page (recommended): exactly the website's
   content, no new translations, built in a day. Its downside is a long page in a small window.
   Compact screen: price, chart and supply only, better suited to Telegram, but the chart is rewritten
   in React and new text goes to 11 languages. Recommendation: the full page now; a compact screen
   later if users find it too long.
2. **Where does DeFi go?** A link on the Stake screen (recommended), or nowhere in the Mini App (it stays
   on the website). A link keeps the swap and pool links one tap away for Telegram users.
