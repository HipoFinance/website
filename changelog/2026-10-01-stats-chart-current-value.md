# 2026-10-01 — Each `/stats/` chart states its current value

Requested from Telegram: "add the current value to each chart on the stats page, so the user
doesn't have to move the mouse pointer on the last point in the chart to know the answer."

The number was already being drawn. Every series rendered a dot at its last point with the
formatted value beside it — but at `fontSize={12}` in `var(--chart-ink)`, the faintest ink on the
card, inside the same 54 px right-hand band as the y-axis tick labels, which use that exact size
and fill. It was typographically indistinguishable from a tick. So this is not a missing number; it
is a number nobody could find.

| Commit         | Subject                                              |
| -------------- | ---------------------------------------------------- |
| (this session) | State each /stats/ chart's current value in its card |

## It was also clipped

The label starts at `x = width − padding.right + 6` with the default `text-anchor: start`, so it
has exactly 54 px before the SVG's edge, and SVG clips at that edge. Measured at 12 px:

| Chart              | Value             | Width    | Fits in 54 px |
| ------------------ | ----------------- | -------- | ------------- |
| TVL, liquidity     | `8.3M GRAM`       | 67 px    | no            |
| HPO price          | `$0.002083`       | 63 px    | no            |
| Active stakers     | `1.2K`            | 24 px    | yes           |
| APY                | `20.09%`          | 44 px    | yes           |
| Rate               | `1.1659`          | 39 px    | yes           |
| TVL in `fa` / `ar` | `۸٫۳ میلیون GRAM` | 88–92 px | no            |

Three of the seven charts lost the end of their own current value in English, and the GRAM charts
lost most of it in Persian and Arabic. The tick-collision logic a few lines above — which drops any
y-tick label within 14 px of a last-point label — is the tell: the two have always been competing
for one band.

## What replaced it

A **readout row** under the title: one entry per series, each carrying that series' current value at
22 px in `font-fredoka`, its colour dot and name, and its delta over the selected range.

It replaces both of the header's old variants — the single-series `delta · range` line and the
multi-series legend — so the `series.length === 1 ? … : …` fork is gone and there is one shape for
one series and for two. For a single series the title already names it, so the dot and the name are
dropped and the value stands alone. The range label stays by itself at the end of the title row.

Three deliberate details:

- **The caption sits above the readout.** Only the liquidity and price charts have one, and in both
  it qualifies how to read the number. "Cycles with each validation round: … near zero once the next
  round is funded" has to be read before the figure it explains.
- **The value is never coloured.** Instant liquidity is near zero for part of every round cycle, by
  design. A near-zero figure in neutral ink under that caption is a fact; the same figure in
  `text-accent` is an alarm. The delta keeps its green/coral, and liquidity still passes `hideDelta`.
- **A stale series shows no value.** If the last sample is older than `maxGapSeconds`, that is an
  outage, not "now" — the line already breaks at the gap, and the headline must not promote a figure
  the data cannot support. The end dot stays, because it truthfully marks where the drawn line ends.

The in-plot text is deleted; both circles stay. Deleting it also let the tick-collision hack go, so
every y-tick label renders again on every chart — two more labels on the APY chart.

## No new strings, and nothing else moved

Zero new i18n keys. The value is the chart's existing `valueFormat`, the name its existing
`app.statsPage.series*`, the delta its existing `deltaFormat`, the range its existing `rangeLabel`.
"Current" is communicated by position — the StatCards above have already taught the page that a big
number means now — and by the delta naming its window.

`StatsPage.tsx` is untouched: every prop the readout needs was already being passed. The static
shell is untouched too: `ShellStatsPage.astro` mirrors the title block, the range pills and the four
StatCards, and deliberately leaves the chart cards to the island.

Two documents were corrected in the same change:

- `specs/app-stats-charts.md` said "No absolute 'latest' number in the header: the gauge-fed cards
  above carry the current values, and two sources for one number on one page will eventually
  disagree." That rule is **superseded**, and the bullet now records why: the readout is derived
  from the chart's own series, which is the same single source the delta already came from, not from
  the gauge. The rule was right about its own case; what it cost in practice was that the current
  value lived only inside the plot, at tick size in tick ink.
- `CLAUDE.md` claimed only `/stake/` and `/unstake/` have a body mirror. `/stats/` has one.

Four charts now echo a StatCard about 200 px above them. That is accepted: the cards read the chain
and fall back to the gauge, while the readout is the last Prometheus sample, so they can differ in
the last digit — but compaction hides it on staked and stakers, and on the rate the chart will read
at or below the card because the series is older and the rate only goes up, which is what that
card's own "only goes up" caption already says. The near-duplicate was on screen before this change;
it is now legible rather than hidden.

### Verification performed

- `npm run build` passes, including the `check-i18n` prebuild gate. No catalog changed.
- The charts are `client:only` React, so the build never executes them. They were checked in a real
  browser: Chromium driven over CDP, with the Prometheus range request fulfilled locally so the
  seven charts render realistic data without the live proxy having to allow a localhost origin.
- Desktop at 1280 px: TVL reads `7.8M GRAM +5.3%`; APY reads `● 20.09% APY ● 18.4% Last round` on
  one line; liquidity reads `0 GRAM` with no delta and its caption above; active stakers reads
  `23.2K +6.4%`. Every y-tick label renders, including the ones the collision logic used to drop.
- `/fa/stats/` at 390 px: the readouts render in Persian digits and fit without wrapping, including
  the two-series APY row (`● ۲۰٫۰۹٪ APY ● ۱۸٫۴٪ دور اخیر`). No horizontal overflow.
- The error state was checked too: with history unavailable the readout collapses to a non-breaking
  space that holds the row's height, so the seven cards do not jump when data lands.

### Follow-ups

- **Hover tracking was deliberately not built.** `hoveredTs` is shared across all seven charts via
  `ChartsStore`, so hovering one would rewrite the headline on all seven at once, and a reader
  glancing at chart 5 while the pointer rests over chart 1 would read a "current" value whose only
  timestamp is elsewhere on the page. It is also tonally backwards: the request was "I shouldn't
  have to hover". It stays a clean additive follow-up — and it is the one version that would need a
  new i18n key, because a number that changes identity needs a word saying which identity it has.
- `padding.right` is a fixed 60 px tuned for English, so the compact y-tick labels can still crowd
  the edge in `fa`/`ar` on the three compact-formatted charts. Now that the collision drop is gone,
  one more tick per chart is exposed to it. Separate fix: make the right band width-aware.
- `dir='ltr'` sits on the whole card rather than on the plot, so the Persian and Arabic title,
  caption and readout all lay out LTR. Moving it onto the plot container and the tooltip is a
  two-line fix, but it flips `ms-auto` and visibly moves the range label in four locales, so it
  belongs in its own change.
