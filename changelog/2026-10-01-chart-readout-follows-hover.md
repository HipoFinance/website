# 2026-10-01 — The chart readout follows the hover, and the tooltip goes

Requested from Telegram, after the readout row shipped earlier the same day: "remove that tooltip
and instead use the readout, just somehow highlight it so that user understands that it's because of
the hover. Also find a way to show the date value."

| Commit         | Subject                                         |
| -------------- | ----------------------------------------------- |
| (this session) | Make the /stats/ chart readout follow the hover |

## What happens now

While a point is hovered, three things change together on **every** chart card:

1. each series' readout shows the **hovered sample's** value instead of the latest one;
2. the card's top-right slot shows the **hovered timestamp** in place of the range label;
3. the readout row takes a `bg-surface-deep` **plate**, which is the "this came from your pointer"
   signal the request asked for.

The tooltip is deleted.

## Why all seven cards, not just the hovered one

`hoveredTs` is a single observable on `ChartsStore`, so the hairline was _already_ synced across all
seven charts. Scoping the readout to the hovered card would have left six charts drawing a hairline
at a time whose value could not be read — the old behaviour minus the tooltip. The payoff of syncing
a hairline is cross-metric comparison: at one moment, TVL _and_ APY _and_ liquidity.

The real risk of syncing is not the motion, it is **a historical value being misread as the current
one**. That is exactly what the timestamp fixes, and it is why the timestamp goes on every card
rather than only the hovered one: a card whose slot reads "Sep 16, 18:13" cannot be mistaken for
live, and seven slots flipping at once reads as one coordinated mode change rather than seven
independent anomalies.

## Three details that carry weight

**Nothing moves.** The timestamp and the range label occupy the same single grid cell, so the slot is
always as wide as the wider of the two and the title's wrapping never changes when a pointer enters.
The plate's padding is cancelled by equal negative margins, so only a colour appears. Verified by
diffing the rendered page hovered against not-hovered: of 460 scanlines, 22 differ, all of them in
the title and readout rows — the plot area, the x-axis labels and the "Show table" row have
identical ink in both states.

**The delta hides while hovering.** A delta is first-to-last across the whole range, and the only
thing on the card that said so — the range label — has just been replaced by a timestamp. Left
visible it would read as the change at the hovered point. It is hidden with `invisible` rather than
unmounted, so the two-series card cannot reflow mid-scrub and the text leaves the accessibility tree.

**A gap reads `—`.** If no sample sits within `maxGapSeconds` of the hovered time, the readout shows
a dash — the same fact the missing hover dot shows, by the same test. Never the last known value,
which is the lie the existing freshness check exists to prevent, and not a blank, which reads as
loading and flickers while scrubbing across a hole.

## The date's precision follows the range

`tooltipTimeFormat` was renamed `tableTimeFormat` — with the tooltip gone, only the `<details>` data
table uses it, and the old name was a lie. A new `hoverTimeFormat` prints `12 Aug 2025` at the 1y
range and `Sep 16, 18:13` everywhere else: a 1y chart samples once a day, so printing `00:00` would
claim a resolution the data does not have, while a 24h window crosses midnight, so the day can never
be dropped. The existing `xTickFormat` was not reused for this — `14:00` has no day, and `Aug` names
a month for a daily sample.

## Deleted, and what had to stay

Gone with the tooltip: the `pointerKind`, `pointerPos` and `focused` state and every setter, the
`onFocus` handler, and the absolutely-positioned tooltip itself.

Kept, and now load-bearing in a way they were not before:

- `onBlur={() => onHover(null)}` — without it a keyboard user who arrows to a point and tabs away
  leaves all seven readouts frozen on a historical value with no pointer anywhere on screen.
- the ~2s touch-dismiss timer, for the same reason on touch.
- the touch-vs-scroll dx/dy disambiguation and its conditional `preventDefault`, which has nothing to
  do with the tooltip — it is what lets the page scroll over a 200px plot.

Keyboard scrubbing now feeds the readout for free, because `handleKeyDown` already called `onHover`.
That is a strict improvement: the value is in normal document flow instead of inside a
`pointer-events-none` absolutely-positioned div. No `aria-live` was added — it would fire on every
mouse pixel; the static `aria-label` summary and the `<details>` table remain the non-visual path.

## No new strings

Zero new or changed English copy, so the `prebuild` gate and all eleven locales are untouched. The
value is the chart's existing `valueFormat`, the date goes through `model.formatDate`, and `—` is
already what the data table and the stat cards print for a missing figure.

### Verification performed

- `npm run build` passes; `node scripts/check-i18n.mjs` reports 0 warnings, nothing to re-hash.
- Driven in a real browser over CDP with the Prometheus range request fulfilled locally. Hovering
  chart one put the plate on **all** cards, showed `Sep 16, 18:13` in every top-right slot, and gave
  each card its own hovered value — `7.6M GRAM`, `18.09%` / `16.57%`, `1.1M GRAM`, `22.6K` — against
  latest values of `7.8M GRAM` and `20.09%`.
- Hovered vs not-hovered renders diffed scanline by scanline: no vertical shift (see above).
- 390px: the title and timestamp share one line on the TVL card and the plate renders correctly.

### Follow-ups

- At ≤~420px the liquidity card's title (`Available for instant unstaking`) plus a reserved
  timestamp slot will not fit on one line, so that title renders on two lines permanently. A
  permanent two-line title on one card is better than a 26px shift on hover, but the clean fix is
  shorter copy for `app.statsPage.chartLiquidity` — an eleven-locale change, so it is the owner's
  call.
- If the plate reads as too subtle for "somehow highlight it", the next step up at zero layout cost
  is `bg-surface-deep` plus `ring-1 ring-border`, since a ring draws outside the box model.
