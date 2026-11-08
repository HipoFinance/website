---
paths:
  - 'src/styles/**'
  - '**/*.astro'
  - '**/*.tsx'
---

# Styling

Tailwind CSS 4 via the `@tailwindcss/vite` plugin — there is **no `tailwind.config.js`**; the theme is defined in CSS `@theme` blocks in `src/styles/global.css`. New markup uses the semantic tokens (`bg-bg`, `bg-surface`, `bg-surface-deep`, `border-border`, `text-text`/`-muted`/`-faint`, `text-accent`, `bg-accent-fill`, `text-positive`, …) and the faces `font-body` (IBM Plex Sans), `font-display` (Nunito; `font-fredoka` is its alias for one release, from 2026-11-08) and `font-wordmark` (Fredoka, for the word "Hipo" beside the mascot only) — never a raw hex. The values come from the token list below. `src/styles/app.css` is a **separate Tailwind compilation** for the dApp (own `@theme`; duplicates the font tokens deliberately). The design source of truth is the handoff bundle recreated in `specs`/changelog 2026-08-11; primary CTA style is the coral pill with the hard offset shadow `shadow-[0_6px_0_var(--color-accent-shadow)]`. `global.css`, `app.css` and `docs.css` all import `src/styles/i18n-fonts.css`, which declares the per-script font subsets (`unicode-range`) and swaps the font tokens under `html[lang=…]`. `src/components/FontPreload.astro` preloads the one or two woff2 faces that paint the **first screen** for the page's locale — rendered from `SEO.astro` and from the Starlight `Head.astro` override, above the stylesheet links, because the shift when a swapped-in face lands is what Search Console scores as CLS. Its `?url` imports must name the same files as the `@font-face` `src`s in `i18n-fonts.css` or in the fontsource package CSS that `global.css` imports; when you change a locale's family, change both, and re-check that each face is still emitted to `dist/_astro/` exactly once (a mismatch downloads the font twice instead of preloading it). Budget is two faces and ~60 KB per locale — a preload that outweighs the stylesheet it precedes is a regression.

## Token list (the Club wireframe → the site)

The canvas "Hipo Club Wireframe v1" writes raw values; each one maps to **one** token here, so a board is built by name, not by eye (`specs/wireframe-design-tokens.md`). The wireframe draws only the dark scheme; the light column is the site's own. Colour tokens live in `global.css` `@theme` (dark) and its light block, the Club ones in `app.css`; `docs.css` mirrors them as `--hipo-*` by hand.

| Wireframe                                | Token                                                                                                                  | Dark                     | Light                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------- |
| `#1f1b1a`                                | `bg`                                                                                                                   | `#1f1b1a`                | `#faf6ef`             |
| `#2a2523`                                | `surface`                                                                                                              | `#2a2523`                | `#ffffff`             |
| `#322b28`                                | `surface-raised`                                                                                                       | `#322b28`                | `#f5efe6`             |
| `#3a322e`                                | `border`                                                                                                               | `#3a322e`                | `#e7dccf`             |
| `#362f2b` (page-header rule)             | `border` (nearest)                                                                                                     | `#3a322e`                | `#e7dccf`             |
| `#433a36`                                | `border-strong`                                                                                                        | `#433a36`                | `#dbcdb9`             |
| `#6b5f58`                                | `border-control`                                                                                                       | `#6b5f58`                | `#bba791`             |
| `#f3ede8`                                | `text`                                                                                                                 | `#f3ede8`                | `#291f20`             |
| `#d9cfc8`                                | `text-secondary` (docs `--hipo-body`, whose light value stays `#3f342f`)                                               | `#d9cfc8`                | `#4d3f3a`             |
| `#b8ada6`                                | `text-muted` (`tone-neutral-fg` is an alias of it)                                                                     | `#b8ada6`                | `#6f6058`             |
| `#8fb8f0` (info strip icon)              | `tone-info-fg` (app.css; light value 5.5:1 on `tone-info-bg`)                                                          | `#8fb8f0`                | `#2563b8`             |
| `#9c918a`                                | `text-faint` (also the chart labels, `--chart-ink`)                                                                    | `#9c918a`                | `#776a62`             |
| `#8f847d` (not-linked dot)               | `text-faint` (nearest)                                                                                                 | `#9c918a`                | `#776a62`             |
| `#f0857a`                                | `accent` / `accent-fill` — the site keeps the brand `#ff7e73` and the canvas design system uses `#ff7e73` (decision 1) | `#ff7e73`                | `#e0574b` / `#ff7e73` |
| `#2b1410`                                | `on-accent` (both schemes; 7.0:1 on `#ff7e73`)                                                                         | `#2b1410`                | `#2b1410`             |
| `#3a2724`                                | `row-self`                                                                                                             | `#3a2724`                | `#fde9e5`             |
| `#8fd6a5`                                | `tone-success-fg`                                                                                                      | `#8fd6a5`                | `#1d7a3c`             |
| `#1f2a23`                                | `tone-success-bg`                                                                                                      | `#1f2a23`                | `#eef7f0`             |
| `#3f6b4c`                                | `tone-success-border`                                                                                                  | `#3f6b4c`                | `#9fd0ad`             |
| `#f2bf67`                                | `tone-warn-fg`                                                                                                         | `#f2bf67`                | `#8a5a00`             |
| `#2e2519`                                | `tone-warn-bg`                                                                                                         | `#2e2519`                | `#fdf4e3`             |
| `#7a5a26`                                | `tone-warn-border`                                                                                                     | `#7a5a26`                | `#e2bd72`             |
| `#26211f`                                | `tone-info-bg` (`tone-neutral-bg` has the same dark value)                                                             | `#26211f`                | `#fbf7f1`             |
| `rgba(15, 12, 11, 0.78)` / `0.8`         | `scrim` (behind modals)                                                                                                | `rgba(15, 12, 11, 0.78)` | `rgba(0, 0, 0, 0.6)`  |
| `#6d3fc4` (Rewards section dot, Boosted) | `club-boosted` (app.css; decorative, same in both schemes)                                                             | `#6d3fc4`                | `#6d3fc4`             |
| `#3d8fe0` (Rewards section dot, Base)    | `club-base` (app.css; decorative, same in both schemes)                                                                | `#3d8fe0`                | `#3d8fe0`             |
| Nunito 800                               | `font-display` + `font-heading` (`--font-weight-heading`: 800, 600 in ar/fa); Club: `font-extrabold`                   | Nunito Variable          |                       |
| IBM Plex Sans 400/500/600                | `font-body` + `font-normal`/`-medium`/`-semibold`                                                                      | IBM Plex Sans            |                       |

Radii and text sizes are `--radius-*` / `--text-*` in the `@theme` of both `global.css` and `app.css` (separate compilations, kept equal), and `--hipo-radius-*` / `--hipo-text-*` in `docs.css` where Starlight needs one. The text sizes set font-size only — no paired line-height — so an element keeps the line-height it inherits; add `leading-*` where a board pairs one (the wireframe's 44px title uses 1.1, its 48px figure 1).

| Wireframe                    | Token                                                    | Where the wireframe uses it                         |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| radius `999px`               | `rounded-full` (built-in)                                | pills: chips, tabs, badges                          |
| radius `24px`                | `rounded-sheet`                                          | modal dialogs                                       |
| radius `20px`                | `rounded-card`                                           | page cards                                          |
| radius `18px`                | `rounded-mini`                                           | Mini App cards, option cards (IA, community model)  |
| radius `16px`                | `rounded-tile`                                           | raised tiles inside a card (`bg-surface-raised`)    |
| radius `14px`                | `rounded-control`                                        | buttons, inner panels                               |
| radius `12px`                | `rounded-input`                                          | inputs, the Copy button, small notes                |
| radius `10px`                | `rounded-chip`                                           | header nav items, search field                      |
| radius `8px`                 | `rounded-lg` (built-in)                                  | highlighted rows, Telegram buttons                  |
| radius `3px`                 | `rounded-bar`                                            | progress bars                                       |
| radius `2px` / `4px` / `50%` | `rounded-xs` / `rounded-sm` / `rounded-full` (built-ins) | dots, small marks                                   |
| text `12px`                  | `text-caption`                                           | uppercase strip labels                              |
| text `13px`                  | `text-label`                                             | uppercase labels, small links, chip text            |
| text `14px`                  | `text-small`                                             | secondary lines in cards                            |
| text `15px`                  | `text-body`                                              | body copy (line-height 1.5)                         |
| text `17px`                  | `text-lead`                                              | lead paragraphs, `summary` rows                     |
| text `20px`                  | `text-title-sm`                                          | card headings (`h2`)                                |
| text `22px`                  | `text-title`                                             | section headings (`h2`)                             |
| text `26px`                  | `text-section`                                           | dialog titles                                       |
| text `28px`                  | `text-stat`                                              | stat figures in cards                               |
| text `30px`                  | `text-display-sm`                                        | the phone page title, Mini App figures              |
| text `44px`                  | `text-display`                                           | the page title (`h1`, line-height 1.1), hero figure |
| text `48px`                  | `text-display-lg`                                        | the big level / count figure (line-height 1)        |

No token (rare in the wireframe, used once or twice): text 11px (board captions), 16px (nav, notes), 18px (IA board labels), 19px (strip titles), 24px (the "Hipo" wordmark), 32px and 40px (IA boards, "Level 7"). The site's own hand-typed values that equal no token stay arbitrary until a board needs them: text 19, 40, 32, 12.5, 36, 11.5, 34, 18, 16, 11, 38, 64, 60, 54, 24, 21px and radius 28px.

Not mapped: the wireframe's own banner (`#3a2f12`, `#f2d58a`) and its Telegram chat mock (`#17212b`, `#232e3c`, `#2b3a4a`, `#36475a`, `#8fa3b8`, `#24402f`), which are not site UI. The coral washes are `--accent-wash` / `--accent-wash-clear` / `--accent-wash-faint` in `global.css` `:root`. Hand copies that cannot read CSS — TonConnect `colorsSet` (`Model.ts`), the Mini App bars (`tma/telegram.ts`), `theme-color` (`SEO.astro`) — must equal this list. Display weight: every `font-display` element takes `font-heading` (`--font-weight-heading`, 800; `--hipo-font-weight-display` in docs.css, and `var(--font-weight-heading, 800)` in blog prose), which `i18n-fonts.css` sets to 600 for ar and fa so their heavy faces look as before; never pair `font-display` with a fixed weight class. The Club pages keep `font-extrabold`, a fixed 800 in every locale (also in ar, where Cairo shows the difference). Arabic and Persian keep their own faces (`i18n-fonts.css`).

**A new design value is a token first.** A colour, face, text size or radius that a board introduces is added to this list and to the token files, then used by name; a raw hex in markup is a bug.

**Two schemes, no toggle.** Warm Dark (the 2026-08-11 redesign) is the authored base; a light palette was added 2026-08-22 and is selected by **`prefers-color-scheme` alone** — there is no switcher, no `localStorage`, and no `.dark` class. Every scheme-dependent value is a custom property re-declared in a `@media (prefers-color-scheme: light)` block: `src/styles/global.css` for the site, `src/styles/app.css` for the chart gridlines, `src/styles/docs.css` for Starlight (keyed on `data-theme`, which `src/components/starlight/ThemeProvider.astro` sets from the same media query; `ThemeSelect.astro` still renders nothing). To theme something new, add a token — do not add a `dark:` variant.

Two details that bite:

- **Coral has two tokens.** `--color-accent` is coral as a _foreground_ (links, the hero highlight, the APY stat) and darkens to `#e0574b` on cream so it keeps its contrast. `--color-accent-fill` is coral as a _solid fill_ under `text-on-accent` (buttons, the banner, `::selection`) and is the brand `#ff7e73` in both schemes. Using `bg-accent` is a bug: it compiles (both tokens live in the same `@theme` block) and silently paints the foreground coral as a fill, which is the contrast regression the split exists to prevent.
- **The logo is two files.** `hipo.svg` (cream body) for dark, `hipo-light.svg` (warm-dark line art, transparent body) for light. Both `<img>`s are in the markup at every logo site and `.logo-on-dark` / `.logo-on-light` in `global.css` pick one; Starlight does the same through `logo: { light, dark }` in `astro.config.mjs`.

**The page must never scroll horizontally.** A horizontal scrollbar on a phone is always a bug, and on this site the cause is always the same shape: a TON address, a transaction hash or a bare URL is one unbreakable 48-character "word", and the browser widens the document rather than break it (that is what happened to `/hpo/`, 2026-09-06). `global.css` carries the site-wide defence — `body { overflow-wrap: break-word }` plus `overflow-wrap: anywhere` on inline `code`, which is how addresses are marked up — and Starlight ships its own copies for `/docs/`, so new prose is covered by default. A long token in something other than a `code` opts in with Tailwind's `wrap-anywhere` or `break-all`, not a new rule in `global.css`. What is _not_ covered, and what to check when you add markup: a long token inside a **flex or grid child** still needs `min-w-0` on that child before it will shrink (`break-word` does not lower min-content width, which is why `anywhere` exists), `whitespace-nowrap` and fixed `w-[…px]` defeat wrapping entirely, and a `-mx-*` bleed needs an ancestor that actually clips or scrolls. Render an address with `break-all` + `min-w-0` the way `/verify/` does, never bare. Anything deliberately wider than the viewport (the landing page's card rail, docs tables) scrolls **inside its own `overflow-x: auto` box** — never let the document be the scroller, and never paper over a bleed with `overflow-x: hidden` on `html`.

Colors that live outside CSS need the media query read in JS: the TonConnect modal's `colorsSet` (`Model.ts`, both themes supplied, kept in sync by `syncTonConnectTheme`) and the Telegram Mini App chrome (`tma/telegram.ts`, read once at startup).

RTL is supported: use **logical utilities only** (`ms-/me-/ps-/pe-/start-/end-/text-start/text-end`, `rtl:` variants) — never `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right` (the one allow-listed exception is the SVG chart code in `LineChart.tsx`). Wrap Latin tickers/numbers inside RTL copy with the `num` utility or `model.isolate`.
