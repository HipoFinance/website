# The docs wear the site's header and footer

**Status:** implemented

## Goal

`/docs/` should look and move like the rest of hipo.finance: the same header (nav, Open app,
language menu, phone tab bar), the same footer, the same centred page width and type. Search and the
docs menu stay, but as part of the page content, below the header.

## In plain terms

Today the documentation is a separate product glued onto the site. It was moved from GitBook to
Starlight (a ready-made docs framework) in August, and Starlight brings its own frame: its own top bar
with "Hipo Docs" in coral, three underlined text links, a search box in the middle, a long emoji list
down the left edge, and almost no footer, just one small line with two links. On a phone there is no
bottom tab bar and the menu button opens Starlight's own full-screen list. A reader who comes from the
home page or the FAQ lands in a place with different navigation, a different width, a different
heading font and blue "Note" boxes that use none of the site's colours.

The plan keeps Starlight for what it is good at: search, the sidebar and its translations, the "On
this page" list, previous/next links and the eleven languages. What changes is the frame around the
article. Starlight lets us replace its parts one by one; we replace the part that draws the frame, so a
docs page becomes:

1. the site's own header, the same component the home page and the FAQ use;
2. a docs bar at the top of the content: the word "Documentation", the search field, and on phones a
   "Contents" button that opens the docs menu;
3. a centred area, as wide as the rest of the site, with the docs menu on the left, the article in the
   middle and "On this page" on the right on wide screens;
4. the site's own footer.

The header and footer are the very same components, not look-alikes, so a change to the site menu
reaches the docs by itself. To make that possible the docs stylesheet will load the site's colour and
size tokens and the utility classes the header and footer use, but not Tailwind's reset, which fights
Starlight's (that conflict is why the docs were kept apart in the first place). The hand-copied palette
in the docs stylesheet then goes away: one palette for the whole site.

Inside the article we also close the visible gaps: the page title in the site's heading face, no
hairlines across the page, links and coloured boxes in the site's colours, and the menu restyled like
the FAQ's "Sections" list.

What stays the same: every docs URL, the content, search results, the languages, the redirects from
the old docs.hipo.finance, and SEO (titles, descriptions, hreflang, sitemap).

The main risk is look, not data: the header and footer could render slightly differently inside the
docs because a different CSS reset sits under them, and the bigger stylesheet makes docs pages a
little heavier. Both are measured before the change is called done. Nothing touches money or the app.
If something goes wrong it is one commit to revert.

Decisions needed: four, in Open questions (emoji in the menu, the promo banner, the footer's
"Start staking" card, and whether the docs home page gets its own layout now).

## Definitions

**Concepts**

- **Starlight**: `@astrojs/starlight`, the docs framework that renders `/docs/`, pinned to `~0.40.0`.
- **Override**: a file in `src/components/starlight/` that Starlight renders in place of one of its own
  parts, wired in `astro.config.mjs` under `components`.
- **Page frame**: Starlight's `PageFrame` part, which today places its fixed top bar, the left sidebar
  and the main area. The override of it is the heart of this change.
- **Site chrome**: the header (`SiteHeader.astro`, with the phone tab bar), the promo banner
  (`Banner.astro`) and the footer (`SiteFooter.astro`) shared by the landing pages, FAQ, HPO and blog.
- **Docs bar**: the new strip at the top of the docs content, holding the label, search and the phone
  "Contents" button. It is Starlight's `Header` part, overridden.
- **Preflight**: Tailwind's CSS reset. The site uses it; Starlight has its own reset and the two clash.
- **Tokens**: the site's named colours, sizes and radii in `src/styles/global.css` (`--color-*`,
  `--text-*`, `--radius-*`); listed in `.claude/rules/styling.md`.

## Context

- Starlight config and the six overrides: `astro.config.mjs:485-525`; `src/components/starlight/`
  holds `Header`, `Footer`, `Head`, `LanguageSelect`, `ThemeProvider`, `ThemeSelect`.
- The docs header (`src/components/starlight/Header.astro:24-46`) is Starlight's title, search, and three
  links (FAQ, Stats, Open app) with labels from `src/content/i18n/<lang>.json` (`hipo.header.*`).
  It has no Stake/Club/HPO items and no phone tab bar. A 2026-11 decision declined adding HPO to it
  because ru/uk ran out of room at 800–900 px (`CHANGELOG.md:189`).
- The docs footer (`src/components/starlight/Footer.astro`) adds one line, "Verify · Fees compared",
  under Starlight's own footer. The site footer is not rendered anywhere under `/docs/`.
- Starlight's frame (`node_modules/@astrojs/starlight/components/PageFrame.astro`) is a fixed full-width
  top bar of height `--sl-nav-height`, a fixed full-height sidebar from 50rem, and a main area pushed
  right by `--sl-content-inline-start`. `Page.astro:47` puts `data-pagefind-body` on `<main>` only, and
  Starlight's `Footer` is rendered inside `<main>`, so anything placed in the Footer override is indexed
  by search.
- `src/styles/docs.css` keeps a hand copy of the palette (`docs.css:38-138`) because it must not import
  `global.css`, whose `@import 'tailwindcss'` brings preflight (`global.css:10`).
- `SiteHeader`, `SiteFooter` and `Banner` find their locale with `localeOf(Astro)`
  (`src/i18n/locale.ts:11`), which reads `Astro.params.locale`. Starlight's route has no `locale`
  param, so as they are they would render English on every docs locale.
- `SiteHeader.astro:20` accepts `active?: 'faq'` only; Docs sits in the phone hamburger (`:39`).
- `LanguageSwitcher.astro` links to the same path in each public locale through `localizedPath`; every
  docs page exists in every built locale (the build fails otherwise, `.claude/rules/docs.md`).
- The page title is outside `.sl-markdown-content`, so it stays in the body face
  (`docs.css:165-169`, and "Left open" at `CHANGELOG.md:276`).
- Sidebar labels carry GitBook's emoji in every locale (`src/i18n/en/docs-sidebar.json`, e.g.
  `"🦛 What is Hipo?"`). The FAQ's section list (`/faq/`) has none.
- Blog articles style links and headings in `src/components/blog/Prose.astro` (coral, underlined with
  a 2 px offset; display face for h2–h6).
- Measured on the live site (2026-11-17, headless Chromium, 1440 and 390 px): the differences listed in
  the first two paragraphs of "In plain terms", plus Starlight's blue "Note" aside and the hairlines
  under the title bar and between the three rails.

## Approach

**Keep Starlight; replace its frame.**

1. **One token file, two entry points.** Move everything in `global.css` that is not a reset or a base
   element rule (font faces, `@theme`, the two palettes, `.logo-on-*`, `.banner-off #site-banner`,
   `html.menu-open`, the `@utility` rules) into a new `src/styles/tokens.css`. `global.css` becomes
   `@import 'tailwindcss'` + `tokens.css` + its base rules, unchanged in effect. `docs.css` declares
   the layer order `@layer base, starlight, theme, components, utilities;` (Starlight's documented
   Tailwind setup; `Page.astro:2` loads our CSS first so this order holds) and imports
   `tailwindcss/theme.css layer(theme)`, `tokens.css` and `tailwindcss/utilities.css layer(utilities)`,
   without preflight. Its `--sl-*` mapping then points at the site's `--color-*` tokens and its
   hand-copied palette is deleted; the five docs colours with no site token (nav background, the
   light-scheme body text, accent-high, accent tint, overlay) become named tokens in `tokens.css`.
   - docs.css's own rules go inside `@layer starlight { … }`: still above Starlight's `starlight.*`
     sublayers, but below the utilities. Left unlayered they would beat every utility; its
     `a:hover { color: accent }` alone would paint the "Open app" pill's text coral on coral.
   - A small reset scoped to the chrome wrapper stands in for the missing preflight: `a` (colour
     inherited, no underline), `button` (no browser chrome), lists, and the site's line-height (1.5;
     1.7 for fa/ar). Starlight's reset covers none of these.
2. **A `PageFrame` override** renders, in a `flex min-h-screen flex-col` root (the footer's `mt-auto`
   needs it): `Banner` (see Open question 2), `SiteHeader`, a centred container
   (`max-w-[1280px] px-6 md:px-12`, as the header) holding the docs bar (the `header` slot) and a grid
   of the sidebar (`sidebar` slot) beside the default slot (article and "On this page"), then
   `SiteFooter`. The footer sits outside `<main data-pagefind-body>`, so search never indexes it.
   Header, docs bar, sidebar and footer are `print:hidden`.
   - From `lg` (1024 px, where the site header switches to its desktop nav) the sidebar is an inline,
     sticky column (240 px) with its own scroll. Below `lg` it is a panel closed by default, opened by
     the docs bar's "Contents" button (its own small script for `aria-expanded`/`aria-controls`, since
     Starlight's menu toggle is gone), pushing the article down rather than covering it. The scrolling
     box keeps `id="starlight__sidebar"`: Starlight restores open groups and scroll position by that id.
   - From 72rem (1152 px, Starlight's own ToC breakpoint, fixed in its `PageSidebar` and `props.css`)
     "On this page" is a right column (200 px), sticky. Below, Starlight's "On this page" dropdown above
     the article, sticky at the top of the viewport. Both are `position: fixed` in Starlight today
     (`TwoColumnContent.astro:31-36`, `MobileTableOfContents.astro:33-34`) and would cover the site
     header, so `TwoColumnContent` is overridden with a plain grid, and the dropdown's container is
     made sticky at `top: 0` with the nav inside it static.
   - `--sl-nav-height` is set to `0rem` (with the unit: a bare `0` makes Starlight's
     `calc(1.5rem + var(--sl-nav-height) + …)` invalid and the scroll padding silently drops).
3. **The `Header` override becomes the docs bar**, a `<div>` (a second `<header>` would make two banner
   landmarks): "Documentation" (`site.footer.documentation`, an existing string) and one Starlight
   `Search`, restyled as a field at every width (its label is hidden below 50rem by default); on phones
   also the "Contents" button. The FAQ/Stats/Open app links and the language select leave it: the site
   header carries both.
4. **Site chrome finds the docs locale itself.** `localeOf()` in `src/i18n/locale.ts` falls back to
   `Astro.locals.starlightRoute.locale` (`undefined` for English, `'fa'` etc., the registry's keys)
   before English. That covers `SiteHeader`, `SiteFooter`, `Banner` and the `LanguageSwitcher` inside
   the header without new props. `SiteHeader`'s `active` also accepts `'docs'`, which colours Docs in
   the phone menu.
5. **The article catches up with the site**: page title in the display face and weight; no title
   hairline or rail borders; prose links and headings as `Prose.astro` has them; Starlight's four
   asides (note, tip, caution, danger) re-coloured from site tokens; sidebar styled like the FAQ's
   section list (plain labels, active item a coral tint pill, collapsible groups kept).
6. **Clean-up**: override `MobileMenuFooter` to render nothing (`Sidebar.astro:12` mounts it, with
   Starlight's social icons and language select); delete the `LanguageSelect` override, which nothing
   renders then; drop the Footer override's "Verify · Fees compared" line (the site footer links both);
   remove the `hipo.header.*` strings from `src/content/i18n/*.json`.

Rejected:

- **Drop Starlight and render the docs with our own layout.** Full control, but we would rebuild
  search, the translated sidebar, the locale routing, the ToC and prev/next — weeks of work for the
  same look. Worth revisiting only if the Starlight 0.41/Astro 7 bump turns out to break the overrides.
- **Restyle Starlight's header to look like ours.** It would be a fourth copy of the header to keep in
  sync (the site, the React app and the static app shell are already three), and the phone tab bar and
  footer would still be missing.

## Changes

- `src/styles/tokens.css` (new) — the shared, reset-free half of `global.css`.
- `src/styles/global.css` — imports `tailwindcss` and `tokens.css`; keeps its base rules.
- `src/styles/docs.css` — layer order, Tailwind theme and utilities, `tokens.css`; own rules inside
  `@layer starlight`; `--sl-*` mapped to site tokens; hand palette, header-search and sidebar rules
  rewritten; title, prose, aside rules; the scoped chrome reset.
- `src/components/starlight/PageFrame.astro` (new) — the frame above.
- `src/components/starlight/TwoColumnContent.astro` (new) — article and sticky ToC as a grid.
- `src/components/starlight/MobileMenuFooter.astro` (new) — renders nothing.
- `src/components/starlight/Header.astro` — rewritten as the docs bar.
- `src/components/starlight/Footer.astro` — deleted (Starlight's default returns).
- `src/components/starlight/LanguageSelect.astro` — deleted.
- `src/i18n/locale.ts` — `localeOf` falls back to Starlight's route locale.
- `src/components/SiteHeader.astro` — `active` accepts `'docs'`.
- `astro.config.mjs` — wire `PageFrame`, `TwoColumnContent`, `MobileMenuFooter`; drop the
  `LanguageSelect` and `Footer` entries; update the comments.
- `src/content/i18n/*.json` — remove `hipo.header.*`; add the "Contents" label (English first, then the
  released locales, per the `locales` skill), unless an existing string fits.
- `src/i18n/*/docs-sidebar.json` — emoji removed from every label, all locales (if Open question 1 is
  yes).
- `.claude/rules/docs.md`, `.claude/rules/styling.md`, `AGENTS.md` (the "first three sections each have
  their own layout" paragraph), `CHANGELOG.md` — record the new arrangement.

## Acceptance criteria

Screens are checked at 320, 390, 1024 and 1440 px, dark and light scheme, in `en` and `fa` (RTL), on
`/docs/`, `/docs/introduction/how-does-hipo-work/` and one deep page, from `npm run build` +
`npm run preview` (on a free port, not 4330 or 4323).

- [x] The `<header>` element of a built docs page is the same markup as `/faq/`'s, apart from the
      `active` item: same four nav items, Open app pill, language menu, and the phone tab bar below
      1024 px. _Diffed in `dist/`: the only differences are the language links (each points at the same
      docs page in that locale) and Docs marked current in the ☰ menu._
- [x] The site `<footer>` of a built docs page (the one outside `<main>`; Starlight keeps its own
      small footer inside the article) equals `/faq/`'s byte for byte in `en`, and in `fa` is the
      Persian footer. _Byte-identical in both._
- [x] The page has one banner landmark: exactly one `<header>` outside `<main>`. _Also checked over
      all 484 built docs pages by the code review: one `<main>`, `<header>`, `<h1>` each, no duplicate ids._
- [x] `/fa/docs/…/` shows the header, footer and docs bar in Persian with `dir="rtl"`, menu on the
      right; the language menu on a docs page links to the same docs page in each public locale.
      _Screenshot at 1440 px; links checked in all 11 locales._
- [x] Side by side at 1440 px, the docs header and footer line up with `/faq/`'s to the pixel (same
      x of the logo, nav and pill; same height), checked on screenshots.
- [x] In the built HTML the site header and footer are outside the element carrying
      `data-pagefind-body`; searching "Help & Support" in the docs returns no docs page. _0 results._
- [x] Search opens from the docs bar by click and by Ctrl/⌘ K, and returns results in `en` and `fa`.
      _Amended: the draft also named `/`, but Starlight 0.40 binds only Ctrl/⌘ K (`Search.astro:120`),
      before and after this change._
- [x] From 1024 px the docs menu is a column beside the article, stays in view while the article
      scrolls, and marks the current page; below 1024 px it is closed on load and the "Contents"
      button opens and closes it, keyboard included. _Sticky with its own scroll (768 px at a 800 px
      window); on a short page it leaves with the end of the article, as a sticky column does._
- [x] Closing the promo banner on a docs page keeps it closed on the next docs page and on `/faq/`.
- [x] A sidebar group the reader closes stays closed on the next docs page. _Amended from "reloading
      keeps … scroll position": checked by a real click on a group; Starlight's own persistence, by the
      kept `#starlight__sidebar` id._
- [x] From 1152 px "On this page" is a right column that never overlaps the header or footer;
      below, the dropdown above the article works, and never both or neither show at any width.
      _1151 px: dropdown only; 1152 px: column only; the open dropdown floats over the article._
- [x] At 390 px, opening `/docs/introduction/how-does-hipo-work/#staking-step-by-step` lands with
      the heading visible below the sticky "On this page" bar. _Heading at 72 px, bar ends at 48 px._
- [x] The page title's computed `font-family` starts with the display face of the locale (Nunito for
      `en`), and no horizontal hairline crosses the page under it. _Nunito 800 in `en`, Lalezar 600 in
      `fa`; panel borders 0._
- [x] Note, tip, caution and danger asides use only site colours, and each holds 4.5:1 text contrast
      in both schemes. _Measured in the browser: titles 4.92–8.91:1, text 11.6–15.0:1. Danger's title
      first measured 2.5:1 in light and was moved to the darker accent; no page uses danger today._
- [x] No horizontal page scroll at 320 px on any docs page, in every built locale. _599 pages, 0 wider
      than the viewport._
- [x] `src/styles/docs.css` holds no hex colour value; every colour comes from `tokens.css`.
- [x] Every non-docs page builds to the same HTML as before. _185 of 185 identical apart from the CSS
      file name. Screenshots of `/`, `/faq/`, `/hpo/`, `/blog/` (1440 light, 390 dark) are byte-identical
      before and after; `/stake/`, `/club/`, `/stats/` match by eye (their live parts animate). Amended:
      the CSS is not only reordered — `global.css` now also carries the four status tones, +0.3 KB
      gzipped on `/faq/`; `/stake/` is 0.1 KB smaller._
- [x] The docs CSS sent to a browser grows by no more than 25 KB gzipped. _15.7 → 26.4 KB, +10.8 KB._
- [x] Printing a docs page shows the article only, without header, tab bar or footer.
- [x] `npm run build`, `node scripts/check-i18n.mjs` and
      `node --experimental-strip-types scripts/i18n-selftest.mjs` pass.
- [x] No sidebar label in any locale starts with an emoji. _All 11 catalogs compared with the old ones
      by the code review: same 54 keys, values equal to the old ones without the emoji._

### Deviations from the approach

- No new colour tokens were needed: the docs read the site's tokens directly, the article text is
  `text-muted` as in the blog, and Starlight's accent tint and high accent are `color-mix()` of site
  tokens. The four status tones (`tone-info/success/warn/neutral`) moved from `app.css` to `tokens.css`
  so the asides can use them; the app sees the same values.
- The current menu item is a surface pill, as in the FAQ's section list, not a coral tint.
- The docs menu's landmark is named "Documentation" (translated), not Starlight's "Main", which sat
  too close to the tab bar's "Main sections".
- Starlight's site `title` and `logo` options are no longer drawn; they stay in the config (`title`
  still feeds the `<title>` suffix).

## Risks & rollback

- **The chrome looks slightly off in the docs**, because Starlight's reset sits under it instead of
  Tailwind's. The scoped reset (Approach 1) covers the gaps found by reading both resets; the
  pixel-alignment criterion catches the rest.
- **Tailwind utilities hitting Starlight's markup.** Utilities are generated only for class names in
  our sources; Starlight's markup uses `sl-`-prefixed helpers. Checked against the built utility set,
  only `sr-only` and `print:hidden` overlap, both with the same meaning.
- **Heavier docs CSS.** The site's whole `global.css` is 13.7 KB gzipped today, so about +11 KB is
  expected, under the 25 KB criterion. If needed, `source(none)` plus `@source` on the chrome
  components cuts it further.
- **Starlight upgrade.** `PageFrame` and `--sl-nav-height` are Starlight internals; the bump to 0.41
  with Astro 7 must re-check this frame. Noted in `.claude/rules/docs.md`.
- **A push to `main` deploys at once.** Commit and push only on Behrang's word, after the English
  review.
- Rollback: revert the one commit; nothing outside the repo changes, and no URL moves.

## Open questions

Decided by Behrang on 2026-11-17, all four as recommended:

1. The emoji are removed from the docs menu, in every locale (the group keys of every
   `docs-sidebar.json` change with the English labels, so this is a key rename, not a translation).
2. The promo banner shows on docs pages.
3. The footer's "Start staking" card shows on docs pages.
4. `/docs/` stays an ordinary article; a landing layout for it would be a follow-up spec.

The one new string, the "Contents" button, lives in the Starlight i18n collection
(`src/content/i18n/<lang>.json`, `hipo.docs.contents`). English was reviewed first; the ten other
locales were translated after Behrang's approval on 2026-11-17.
