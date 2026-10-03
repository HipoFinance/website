# 2026-09-30 — Stop the HPO card figures from breaking mid-word on phones

At phone width the market cap / 24h volume / holders row in the `/hpo/` hero card broke words in half ("3,2 M $U / S",
"Détenteur / s"). This was a follow-up from the CoinGecko-source change the same day
([report](2026-09-30-hpo-price-chart-source.md)). Spec: `specs/hpo-card-figures-wrap.md`.

| Commit         | Subject                                        |
| -------------- | ---------------------------------------------- |
| (this session) | Stack the HPO card figures as a list on phones |

## Root cause

The three columns share ~254 px at a 360 px viewport. Each is `min-w-0`, so it shrinks below its text, and the
site-wide `body { overflow-wrap: break-word }` then splits words. Measured on production, the width needed to show the
row without any break was 202 px in English and 234 px in Turkish, but 263–348 px in the other nine locales (Arabic
widest). So eight locales broke, not only the three first noticed.

## What changed

- Below `sm` (640 px) the row is a list: one line per figure, label at the start, value (`whitespace-nowrap`) at the
  end, hairline separators. The line is `flex-wrap` with `ms-auto` on the value, so when label and value don't fit side
  by side the value takes a line of its own at the end.
- From `sm` up the three-column row, value over label, is unchanged.
- The three figures are rendered from a small `figures` array; the ids `hpo-data.js` refreshes are unchanged.

## Decisions

- **The list in every locale, English included** — English fits three abreast today, but only just, and a larger
  figure ("$12.5M") would hit the same break; one layout to maintain.
- **Value drops to its own line rather than the label wrapping** — revised during implementation: German
  "Marktkapitalisierung" and Ukrainian "Капіталізація" are single words wider than the room beside their values at
  320 px, so wrapping the label at a space could not prevent the break.
- Rejected: a smaller font on phones (Arabic still needs ~300 px at 18 px), a 2-column grid (a column is narrower than
  the Arabic market cap), `flex-wrap` on the whole row (ragged, differs per locale), and `overflow-wrap: normal` alone
  (values without a space would overflow into their neighbour).

### Verification performed

- `npm run build` — i18n ok, 0 warnings; 596 pages, complete.
- Headless against the dev server and again against the production preview: all 11 locales × 320/360/390/414/640/
  1024/1280 px — no word or value spans two lines (checked per word with `Range.getClientRects()`), every value on one
  line inside the card, list below 640 px and three columns from 640 px, value at the logical end in `fa`/`ar`, no
  horizontal scroll, and `hpo-data.js` still writes all three values.

### Follow-ups

None.
