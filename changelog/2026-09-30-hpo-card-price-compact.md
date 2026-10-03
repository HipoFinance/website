# 2026-09-30 — A more compact HPO price row

Follow-up to the same day's [latest-price change](2026-09-30-hpo-card-latest-price.md): the price row above the
`/hpo/` graph took ~81 px of card height (a 30 px price on the site's 1.5 line height, with 18 px gaps above and below).
This session shrinks it without moving anything. Spec: `specs/hpo-card-price-compact.md`.

| Commit         | Subject                                    |
| -------------- | ------------------------------------------ |
| (this session) | Make the HPO card's price row more compact |

## What changed

- Price 30 → 24 px with `leading-tight` (row 45 → 30 px); change 15 → 14 px; "24h" unchanged at 13 px.
- The header and the price row share a wrapper with an 8 px gap (was the card's 18 px); the graph link is pulled up
  with `-mt-2` so it sits 10 px under the price. Every other card gap stays 18 px.
- Card height at 360 px: 465.5 → 432.5 px; at 1280 px: 377 → 344 px.

## Decisions

- **24 px, not smaller** — it keeps the price above the 22 px figures as the card's headline number.
- **Declined: price on the "HPO / USD" line and the change on the "Live market data" line.** Measured at phone width,
  the room beside the logo is 158–252 px (320–414 px viewports) before placing the "● Live" badge; line 1 needs
  172–245 px and line 2 needs 175–333 px (the Russian subtitle alone is 247 px), so most locales would wrap at 360 px.
  A hybrid (that layout from 640 px up, this row on phones) would also have needed the badge moved and still wrapped
  Russian at 1024 px; kept the single compact row instead.

### Verification performed

- `npm run build` — i18n ok, 0 warnings; 596 pages.
- Headless, dev server and production preview: gaps 8 / 10 px, row 30 px, fonts 24 / 14 px, other gap 18 px, card
  heights as above; 11 locales × 320/360/414/1280 px with no mid-word breaks, nothing outside the card, no horizontal
  scroll. In `fa` the row is 32.4 px (the Persian face's taller line box), accepted.

### Follow-ups

None.
