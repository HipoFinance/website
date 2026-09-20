# 2026-09-20 — The comparison chart was drawing Hipo at the bottom

Second change to the `/vs/` chart the same day, and a design one rather than a bug. With the
Tonstakers line visible again (see `2026-09-20-vs-chart-axis-top.md`), the maintainer's next
question was whether the y-axis should be inverted: "it now shows those rivals above Hipo. A user
might think they are paying more. I'm open to push backs."

There was no push back worth making. The chart plots `stake × (growth_hipo − growth_x)` — GRAM the
stake did **not** earn at that protocol. Drawn upwards from a zero baseline, that put both
competitors above Hipo on the one page arguing Hipo pays more, and the glance reading of any chart
is "higher line, better thing". The page is written for recipients arriving from a wallet message;
a glance is most of what it gets.

| Commit         | Subject                                                  |
| -------------- | -------------------------------------------------------- |
| (this session) | Invert the /vs/ comparison chart so Hipo is the top line |

## What changed

Zero moved to the top and the lines descend: `yOf` in `src/data/lst-geometry.ts` now maps a
shortfall magnitude downwards from `MARGIN.top` instead of upwards from the bottom. Hipo is the
reference along the top edge; each protocol falls away from it by what it left on the table.

Two additions the flip required, neither optional:

- **The tick values are negated** — the axis reads 0, −500, −1,000, −1,500, −2,000. Keeping
  positive magnitudes on a downward axis would label a point at −1,685 as "1,685", and quiet
  misdirection of that kind is precisely what this page exists to call out. `axisTicks` stays a
  plain positive-magnitude helper; `chartGeometry` negates for display.
- **Hipo's line is direct-labelled.** `ValueGapChart.astro` has always carried the rule that every
  line is direct-labelled so identity never rests on colour alone — and Hipo, being the zero line
  itself, was the one line that never got a name. That unnamed reference line is what let the chart
  be read upside down. Its position does not move with the stake (zero is the top margin at every
  scale), so `vs-stake.js` leaves it alone.

## The one risk, and why it is acceptable

Inverted, the chart can be misread the other way: two lines plunging to −1,685 could suggest those
protocols _lost_ their stakers money. They did not — they earned less. The copy carries that
distinction, and the lead sentence was rewritten to make the direction explicit:

> The running total of what the same stake would have missed at each protocol. Hipo is the line
> along the top; each one falls away from it by the GRAM it left on the table.

"Left on the table" is a shortfall, not a loss, and it was already the page's phrase. The heading —
"What you would have missed, day by day" — was right for either orientation and did not move, nor
did the `aria-label`, which describes what the figure conveys rather than which way it points.

Weighed against that: the failure it replaces inverted the argument of the whole section. A reader
who mistakenly thinks a competitor lost money is wrong about a competitor; a reader who thinks the
competitors earned more is wrong about Hipo, on Hipo's own comparison page.

Considered and rejected: plotting each protocol's absolute stake value with Hipo's line on top.
That is the most literally readable arrangement and R15 forbids it — the three lines differ by
about a percentage point a year and would overlap indistinguishably unless the axis were cropped,
which is the standard trick for making a small difference look large. The gap chart exists to avoid
exactly that.

R15 itself is unaffected: the axis still includes zero and is still in absolute GRAM. Only the
direction changed. Recorded as §14 of `specs/realized-apy-comparison.md`.

### Verification performed

- `npm run build` — clean; `i18n: ok, 0 warnings` after `--update-hashes` on all nine locales.
- Built page: ticks `0 / −500 / −1,000 / −1,500 / −2,000` running top to bottom, gridlines at
  y = 16 … 306, "Hipo" at y = 20 on the zero line, Tonstakers at y = 264 and Stakee at y = 210.
- Re-ran the viewBox check over the page's own payload at ten stakes — every point and every label
  inside the frame. The line tops now read y = 15.3, which is the fortnight in late 2024 when a
  competitor was briefly ahead: correctly drawn a hair _above_ Hipo's line.
- Rasterized the built SVG in English and in Persian (the chart is `dir='ltr'` inside RTL prose) —
  both read as intended, with the locale's own digits and minus sign on the axis.
- `vs-stake.js` re-derives ticks and paths through the same `chartGeometry`, including the negative
  tick values and the zero-line stroke test (`tick.value === 0`), so the axis cannot change shape
  when the stake control is touched.

### Follow-ups

1. **The coral wash now fills the upper half of the frame** rather than hugging the baseline. It
   still means the same thing — the band between Hipo and that protocol — but it is a larger area
   than it was, and worth a look if the chart ever gains a third compared protocol.
2. Carried over from this morning: nothing guards the viewBox invariant automatically, and the two
   competitor end labels would overlap if the series ever converge at the right edge.
