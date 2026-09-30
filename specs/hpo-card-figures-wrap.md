# HPO card figures: no mid-word wrapping on phones

**Status:** implemented

## Goal

Stop the market cap / volume / holders figures in the `/hpo/` hero card from breaking inside words on phones
("3,2 M $U / S", "Détenteur / s") in every locale.

## In plain terms

Under the HPO price graph there is a row of three figures (market cap, 24-hour volume, holders), each with a small
label under it. On a phone the three columns share about 250 pixels. In English that is just enough, but most other
languages write these figures and labels longer ("3,2 млн $", "Capitalização de mercado", "٣٫٢ مليون US$"), and the
browser then chops words in half to make them fit. That looks broken.

The fix: on phone-sized screens (narrower than 640 px), show the three figures as a short list instead of side by
side — one line each, label at the start and the number at the end, like a receipt. Each number always stays on one
line; when a label and its number don't fit side by side, the number moves to a line of its own, and words are
never cut in half. On tablets and desktops the card
keeps today's three-column row unchanged, because there is plenty of room there.

What changes for users: on phones the card gets roughly 40 px taller and reads as a list, in every language, English
included. Nothing else on the page moves, and the numbers themselves and how often they update are unchanged. Risk is
cosmetic only; undone by reverting one commit.

No decisions needed.

## Definitions

**Concepts**

- **Figures row** — the three-column block in the `/hpo/` hero card holding `#hpoMarketCap`, `#hpoVolume` and
  `#hpoHolders`, each with its label; the values are rendered at build time and refreshed by `src/scripts/hpo-data.js`,
  which looks them up by id.
- **Mid-word break** — a single word (or a value such as `US$532,2`) drawn across two lines.
- **Phone width** — below Tailwind's `sm` breakpoint (640 px).

**Formula parameters** — None.

## Context

- `src/components/Hpo.astro:144-161` — the figures row: `flex justify-between gap-3`, three `min-w-0` children, each a
  `font-fredoka text-[22px]` value over a `text-[13px]` label.
- `src/styles/global.css:162` — `body { overflow-wrap: break-word }`. With `min-w-0` the columns shrink below their text,
  and `break-word` then splits words.
- Measured on https://hipo.finance/hpo/ at 360 px wide: the row is **254 px**. Width needed to show all three
  columns without any break (longest of value and label per column, plus gaps):

  | en  | tr  | de  | ru  | id  | fr  | es  | uk  | pt  | fa  | ar  |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | 202 | 234 | 263 | 270 | 277 | 278 | 280 | 322 | 331 | 334 | 348 |

  The widest single pieces are the Arabic market cap (134 px) and the Portuguese label "Capitalização de mercado"
  (146 px).

## Approach

Below `sm`, the figures row becomes a vertical list: each figure is one `flex items-baseline justify-between gap-3`
line, label (`min-w-0`, wraps at spaces only) at the start, value (`shrink-0 whitespace-nowrap`) at the end, lines
separated by a hairline `border-border` top border. From `sm` up, the current markup and look are kept: three columns,
value over label. Implemented with responsive classes on the same elements (the label moves visually with `order-*`,
no duplicated markup), so the ids `hpo-data.js` writes to stay unique and unchanged. All spacing uses logical
utilities, so `fa`/`ar` mirror correctly.

The line is `flex-wrap`, with `ms-auto` on the value: when a label and its value don't fit side by side, the value
takes a line of its own at the end. (Revised during implementation, 2026-09-30: the draft had the label wrap at a
space, but at 320 px German "Marktkapitalisierung" (116 px) and Ukrainian "Капіталізація" (82 px) are single words
wider than the room left beside their values, so they still broke mid-word.)

Rejected:

- Smaller font on phones — at 18 px the Arabic row still needs ~300 px; it doesn't fit.
- A 2-column grid on phones — each column is ~125 px, narrower than the Arabic market cap.
- Letting the row wrap (`flex-wrap`) — ragged layout that differs per language and per number.
- `overflow-wrap: normal` only — values without a space (`US$532,2`) would overflow their column and overlap.

## Changes

- `src/components/Hpo.astro` — responsive classes on the figures row and its children, as above. No copy change, so
  no translation.
- `CHANGELOG.md` + `changelog/2026-09-30-hpo-card-figures-wrap.md`.

## Acceptance criteria

- [x] At 320, 360, 390 and 414 px wide, in all 11 locales, no word or value in the figures row is drawn across two
      lines (checked headless: every whitespace-separated word's range has exactly one client rect).
- [x] At those widths every value is on one line and fully inside the card (value box within the card's box).
- [x] At ≥ 640 px (checked at 640, 1024, 1280) the figures row renders as three columns, value over label, as today.
- [x] No horizontal page scroll at any width checked.
- [x] `hpo-data.js` still updates the three values (ids unchanged; values refresh after load).
- [x] `fa`/`ar`: label at the right, value at the left on phones.
- [x] `npm run build` succeeds.

## Risks & rollback

Cosmetic: a taller card on phones; a misaligned list in RTL. Seen in the review screenshots. Rollback: revert the
commit.

## Open questions

None. Resolved 2026-09-30: the list is used on phones in every locale, English included.
