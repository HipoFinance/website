# HPO card: a more compact price row

**Status:** implemented

## Goal

Make the latest-price row in the `/hpo/` hero card smaller and tighter, so it takes less height, while keeping every
element where it is and keeping the price easy to read.

## In plain terms

The price row added today ("$0.00408 −3.62% 24h", above the graph) is set in a large 30 px font with the card's usual
18 px spacing above and below it, so it costs about 80 px of card height. We'll keep the layout exactly as it is (header
with the "● Live" badge, then the price row, then the graph, then the figures) and only shrink it:

- the price drops from 30 px to **24 px**, still the largest number in the card (the figures below are 22 px);
- the change drops from 15 px to **14 px**; the "24h" label stays at 13 px;
- the row's line height tightens so the text isn't padded by empty space above and below it;
- the gap between the header and the price shrinks from 18 px to **8 px**, and between the price and the graph from
  18 px to **10 px**, so the price reads as part of the header and the graph starts right after it.

Net effect: the card is about **33 px shorter** than today (465 → ~432 px on a phone), and the price row costs ~48 px
instead of ~81 px. All other gaps in the card are unchanged. No text or translation changes. Risk: purely cosmetic, and
undone by reverting one commit.

No decisions needed.

## Definitions

**Concepts**

- **Price row** — `#hpoPrice` plus `#hpoChangeWrap` (`#hpoChange24h` and the "24h" label) in the `/hpo/` hero card,
  added by `specs/hpo-card-latest-price.md`.
- **Card gap** — the hero card's `gap-[18px]` between its blocks (header, price row, graph, figures).

**Formula parameters** — None.

## Context

Measured on https://hipo.finance/hpo/ (2026-09-30):

| width   | card height | header | header → price | price row | price → graph | graph |
| ------- | ----------- | ------ | -------------- | --------- | ------------- | ----- |
| 360 px  | 465.5       | 47.5   | 18             | 45        | 18            | 120   |
| 1280 px | 377         | 47.5   | 18             | 45        | 18            | 120   |

The 45 px row is the 30 px price on the site's default 1.5 line height. Markup: `src/components/Hpo.astro`, the price
row `div` between the header and the sparkline link, inside the card's `flex flex-col gap-[18px]`.

## Approach

- Wrap the header and the price row in one `div` with `flex flex-col gap-2` (8 px), so the header → price gap is 8 px
  while the card keeps its 18 px gap everywhere else.
- Pull the graph up with `-mt-2` on the sparkline link (18 − 8 = 10 px between the price row and the graph). The
  sparkline's own 8 px top padding inside its viewBox keeps the line clear of the price.
- Price: `text-[24px] leading-tight` (30 px line). Change: `text-[14px]`. Label: unchanged `text-[13px]`. The row keeps
  `flex-wrap items-baseline gap-x-3 gap-y-1` (the change still drops under the price if a phone is too narrow).
- Colours, ids, `hpo-data.js`, data and formatting: unchanged.

Rejected: going below 24 px for the price — at 22 px it would equal the figures below and lose its place as the card's
headline number; and removing the gap to the graph entirely — the price's descenders would touch the chart.

## Changes

- `src/components/Hpo.astro` — the wrapper, the `-mt-2`, and the three size classes.
- `CHANGELOG.md` + `changelog/2026-09-30-hpo-card-price-compact.md`.

## Acceptance criteria

- [x] At 360 and 1280 px: header → price row gap is 8 px (±1), price row → graph gap is 10 px (±1), price row height
      ≤ 31 px when on one line (English 30 px; `fa` 32.4 px from the Persian face's taller line box, accepted); every other gap in the card is still 18 px.
- [x] Card height at 360 px is ≤ 435 px in English (today 465.5).
- [x] `#hpoPrice` computes to 24 px, `#hpoChange24h` to 14 px.
- [x] 11 locales × 320/360/414/1280 px: no mid-word breaks in the price row, nothing outside the card, no horizontal
      scroll; the price row never overlaps the header or the graph.
- [x] Dark and light screenshots at 360 and 1280 px in English, plus `fa` at 360, look balanced (reviewed by you).
- [x] `npm run build` succeeds.

## Risks & rollback

A cramped look if the tighter gaps feel too tight — caught in the screenshot review. Rollback: revert the commit.

## Open questions

None.
