# The wireframe's design values as the site's base

**Status:** implemented; team review approved (2026-11-08)

## Goal

Make the design values of the "Hipo Club Wireframe v1" canvas (colours, fonts, text sizes, corner
radii) the site's own named tokens, on every page, so that a future board drawn on the same canvas
can be built exactly, with no translation by eye. The team reviews the result before it ships.

## In plain terms

Today the site and the wireframe speak two slightly different languages. The wireframe writes raw
colour codes and pixel sizes; the site has its own named colours that are close but not equal
(its card colour is a shade off, its grey text a shade lighter), uses other fonts (Fredoka for
headings and Heebo for text, where the wireframe uses Nunito and IBM Plex Sans), and has no names
at all for text sizes or corner roundness. So every board is matched by eye, and two builders can
pick differently, as happened on the Club pages.

The change turns the wireframe's values into the site's dictionary:

- **Colours.** The site's dark-scheme colours take the wireframe's exact values. Most moves are
  barely visible (one shade), and faint text gets a little brighter, which reads better.
  The wireframe draws only the dark scheme; the light scheme keeps the site's own light colours,
  adjusted only where a new name needs a light partner.
- **Fonts.** Headings and big numbers switch from Fredoka to Nunito, body text from Heebo to IBM
  Plex Sans, on every page in the Latin and Cyrillic languages. Arabic and Persian keep their own
  fonts, because neither wireframe font has those scripts. This is the most visible part of the
  change: the site's headings get a rounder, heavier look.
- **Names for sizes and corners.** The text sizes and corner radii the wireframe uses get names
  (for example "card corner, 20px"; "label, 13px"), and the site's hand-typed values that equal
  one of them are switched to the name.
- **The same dictionary on the canvas.** The token list is written into the repo's styling notes
  and also published as a design system the canvas installs, so the designer draws with the names
  the code uses.

What stays the same: page layouts, text, behaviour, the logo mascot, every language.

Risks: the font change shifts text widths everywhere, so some lines wrap differently and a few
buttons or tabs may need a touch; every page must be checked in both schemes and at phone width.
Fonts load a little more on the first visit (about 60 KB for the two Latin faces, within today's
budget). If the team dislikes the result, nothing has shipped: it stays off `main` until they agree.

Decisions needed are in Open questions: the coral, the "Hipo" wordmark font, how the team reviews,
and whether the docs are in this round.

## Definitions

**Concepts**

- **Token:** a named design value defined once in CSS (a colour, font, text size or radius) that
  markup uses by name, e.g. `bg-surface`, `rounded-card`.
- **The wireframe:** the claude.ai Design canvas "Hipo Club Wireframe v1"; its boards are `.dc.html`
  files whose inline styles carry exact values.
- **Token list:** the table that maps each wireframe value to one token, with its light-scheme value.
- **Design system (canvas):** a `tokens.json` the canvas installs (`project/ds/<folder>/`) so its
  boards offer the same token names in their Theme menu.
- **Dark / light scheme:** the two palettes picked by the visitor's device (`prefers-color-scheme`).
  The site's base palette is the dark one.
- **Wordmark:** the word "Hipo" next to the mascot in the header, set as live text in Fredoka.

## Context

- Site tokens: `src/styles/global.css:10-82` (dark) and `:99-146` (light); the dApp's separate
  compilation `src/styles/app.css:69-123`; Starlight `src/styles/docs.css:26-121`, kept in sync by
  hand (`docs.css:13-15`).
- Fonts: Fredoka and Heebo imported in `global.css:1-5` and `docs.css:18-22`; per-script faces and
  `html[lang]` swaps in `src/styles/i18n-fonts.css` (fa: Vazirmatn/Lalezar, ar: Cairo, ru/uk:
  Roboto/Nunito); preloads in `src/components/FontPreload.astro:38-45`, budget two faces, ~60 KB.
  `@fontsource-variable/nunito` is already a dependency (Cyrillic only today).
- No named text-size, radius or spacing tokens exist: 338 `text-[Npx]` and 101 `rounded-[…]`
  values are hand-typed across `src/components`.
- Hand copies of colours outside the token files: TonConnect `colorsSet` (`src/components/app/Model.ts:3435-3495`),
  the Mini App bar colours (`src/components/app/tma/telegram.ts:199-200`), `theme-color`
  (`src/components/SEO.astro:87-88`), `::selection` (`app.css:22-25`), and 18 raw coral
  `rgba(255,126,115,…)` washes (Landing, 404, Verify, Vs, Footer, Hpo, StatsPage, ValueGapChart).
- Brand: the brand kit (`scripts/build-brand-kit.mjs:35-48`, `brand/README.md:59-77`) states coral
  #ff7e73 and "display type in Fredoka, body in Heebo"; the horizontal lockup's wordmark is outlined
  coral paths.
- Wireframe values (all boards): background #1f1b1a, card #2a2523, border #3a322e, strong border
  #433a36, control border #6b5f58, raised tile #322b28, text #f3ede8, secondary #d9cfc8, muted
  #b8ada6, faint #9c918a, coral #f0857a, on-coral #2b1410, success #8fd6a5, warn #f2bf67; Nunito
  700/800 and IBM Plex Sans 400/500/600; text 12/13/14/15/17/20/22/26/28/44/48px; radii
  999/20/18/16/14/10/3px.

## Approach

1. **Token list first.** Write the table (wireframe value → token → dark → light) into
   `.claude/rules/styling.md`. Each wireframe value maps to exactly one token. Where a wireframe value
   has no token, the nearest token takes it or a new one is added (e.g. secondary text, already added).
2. **Colours.** Set the dark values of the existing tokens to the wireframe's (`global.css`,
   `app.css`, `docs.css`), keeping the light values unless the token is new. Move the hand copies
   (TonConnect, Mini App, `theme-color`, `::selection`, coral washes) onto the tokens or update them
   from the list, so nothing is left behind.
3. **Fonts.** Latin and Cyrillic: Nunito Variable for display (`--font-fredoka` renamed to
   `--font-display`, with a one-release alias), IBM Plex Sans 400/500/600 for body. ru/uk drop Roboto
   for IBM Plex Sans (it has Cyrillic). ar/fa unchanged. Update `FontPreload.astro` to the new faces
   within the budget.
4. **Size and radius names.** Add `--radius-*` and `--text-*` tokens in `@theme` from the wireframe
   (e.g. `rounded-card` 20px, `rounded-control` 14px, `rounded-tile` 16px, `text-label` 13px,
   `text-body` 15px), then replace hand-typed values that equal one of them. Values that equal none
   stay as they are and are listed, not redesigned.
5. **Canvas design system.** Publish the token list as a "Design System" artifact with a
   `tokens.json`, and install it on the wireframe canvas (a new `designSystems` entry), so new boards
   use the names.
6. **Review before shipping.** Build it off `main` (see Open questions 3) and publish a private
   before/after screenshot page for the team: every page, dark and light, desktop and phone,
   English plus one Cyrillic and one RTL locale.

Rejected: redrawing landing/HPO pages to wireframe layouts (no boards exist for them); changing
spacing values (the wireframe's spacing is per element, not a scale, so naming it would not help).

## Changes

- `src/styles/global.css`, `src/styles/app.css`, `src/styles/docs.css` — dark colour values from the
  list; new `--radius-*`, `--text-*`, `--font-display` tokens; font imports.
- `src/styles/i18n-fonts.css`, `src/components/FontPreload.astro`, `package.json` — Nunito (Latin) and
  `@fontsource/ibm-plex-sans`; drop Heebo/Roboto/Fredoka imports where no longer used (Fredoka stays if
  the wordmark keeps it).
- `src/components/**` — `font-fredoka` → `font-display`; hand-typed sizes/radii equal to a token → the
  token; the 18 coral washes → a token.
- `src/components/app/Model.ts`, `src/components/app/tma/telegram.ts`, `src/components/SEO.astro` —
  hand copies updated from the list.
- `.claude/rules/styling.md` — the token list and the rule "a new design value is a token first".
- `scripts/build-brand-kit.mjs`, `brand/README.md` — only if Open question 1 or 2 changes the brand.
- The wireframe canvas — a design-system artifact and its install record.
- `CHANGELOG.md` — one entry.

## Acceptance criteria

- [ ] `styling.md` has the token list; every colour, font, text size and radius that appears in the
      wireframe's boards maps to exactly one token (checked by a script over the `.dc.html` files).
- [ ] Computed styles match: on `/club/` (mock state B, dark) the card background, border, muted
      and faint text, coral button, card radius, body and heading font families equal the wireframe
      values (Playwright `getComputedStyle`).
- [ ] No raw coral `rgba(255,126,115…)` or token hex copy is left outside the token files, except the
      ones the list names as deliberate copies (TonConnect, Mini App, `theme-color`), which equal the list.
- [ ] Latin pages use Nunito and IBM Plex Sans; ru/uk use them too; ar/fa unchanged (computed
      `font-family` on one page per locale group).
- [ ] FontPreload preloads at most two faces per locale, total ≤ 60 KB; each face is emitted to
      `dist/_astro/` once.
- [ ] No horizontal scroll at 390px on every page group (landing, FAQ, HPO, app pages, Club, docs if
      in scope, blog), dark and light.
- [ ] Light-scheme text contrast ≥ 4.5:1 for text tokens on their backgrounds (computed).
- [ ] `npm run build` and the i18n selftest pass.
- [ ] The team's review page is published and the team has said yes before anything reaches `main`.
- [ ] The canvas lists the design system, and a new board can pick the tokens from its Theme menu.

## Risks & rollback

- Text reflow from the font change: caught by the screenshot review; fixed per spot.
- Font weight look-alikes: Nunito 800 is heavier than Fredoka 600; headings may feel louder. Review.
- CLS regressions from new preloads: check Lighthouse on `/` and `/stake/` before and after.
- Brand drift between site and brand kit if coral or the wordmark change (Open questions 1–2).
- Rollback: one revert of the merge commit; no data or storage involved.

## Decisions (2026-11-08)

1. Coral stays #ff7e73 on the site; the canvas design system uses #ff7e73.
2. The "Hipo" wordmark stays Fredoka; all other display text is Nunito.
3. Built on branch `design-tokens`; the team reviews a private before/after screenshot page; nothing reaches `main` before their yes.
4. The docs (Starlight) are in this round.
5. The design system is installed on the "Hipo Club Wireframe v1" canvas.

## Open questions (as asked)

1. **The coral.** The wireframe's coral is #f0857a; the brand coral (logo kit, listings) is #ff7e73,
   a little brighter. Options: (a) keep #ff7e73 on the site and set the canvas design system to
   #ff7e73, so wireframe and site still match exactly; (b) move the site to #f0857a and rebuild the
   brand kit; (c) both corals, site UI vs brand. **Recommend (a):** the difference is barely visible,
   and the brand colour is on partner sites we don't control.
2. **The "Hipo" wordmark.** It is live text in Fredoka, the brand's logotype face. Options: keep
   Fredoka for the wordmark only, or set it in Nunito like the other headings. **Recommend keeping
   Fredoka for the wordmark:** it is the logo, and the brand kit's lockup is drawn in it.
3. **How the team reviews.** `main` deploys at once, so the work must live elsewhere until the team
   agrees. Options: (a) a branch `design-tokens` plus a private before/after screenshot page shared
   with the team; (b) uncommitted on this machine with a local preview over SSH; (c) a separate
   preview site. **Recommend (a):** the team needs no access to this machine; the branch keeps it safe
   from `main`. This needs your OK to create a branch.
4. **The docs (Starlight).** They have their own colour file and the longest texts, so the font change
   shows most there. Options: include them now, or in a second round. **Recommend now:** otherwise the
   docs look like a different site from the rest during the gap.
5. **The design system on the canvas.** The canvas is your artifact, shared by link, so installing
   the design system changes what everyone with the link sees (a new Theme entry; the boards
   themselves are untouched). Options: install it on this canvas, or only publish the design system
   and use it for new canvases. **Recommend installing it on this canvas:** it is where the next
   boards will be drawn. Either way the repo's token list stays the source.
