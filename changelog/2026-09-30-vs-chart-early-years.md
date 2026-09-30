# 2026-09-30 — Making the `/vs/` chart readable in its early years

Reported from Telegram, about the "What you would have missed, day by day" chart: _"this chart
still isn't very good and doesn't show the difference well. And at the start it's zero."_ The brief
was to see whether it could be improved, especially on the left and near zero.

Both complaints turn out to describe the data rather than a defect in the drawing — and the
reasoning for why is recorded below, because it is the kind of conclusion that gets re-litigated.
But the chart was caught three days away from a real regression that would have made the exact
thing complained about substantially worse, and that is fixed, along with four latent defects in
the same code.

| Commit         | Subject                                                               |
| -------------- | --------------------------------------------------------------------- |
| (this session) | Make the /vs/ chart readable near zero, and clear four latent defects |

## The complaints, measured

Neither is a rendering fault.

**"At the start it's zero."** It has to be. The series are growth factors normalised to 1.0 on the
first day, and the page's premise is "if you had staked {stake} on {date}" — on the day the stake
is placed, nothing has been missed yet. Every construction that does not start at zero answers a
different question or breaks a rule, and §"Redesigns considered and declined" lists them.

**"It doesn't show the difference."** The left is flat because the first year really was a small
part of the total. On a 100,000 GRAM stake, measured off the live series:

|                                     | vs Tonstakers | vs Stakee |
| ----------------------------------- | ------------- | --------- |
| gap after year one (2025-09-11)     | 337           | 306       |
| gap today (2026-09-30)              | 1,811         | 1,406     |
| share of the gap opened in year two | 81 %          | 78 %      |

The reason is not that Hipo's edge widened fivefold; it is that the whole APY level roughly
doubled over the last five months (trailing-365d, hipo/tonstakers/stakee: 3.94/3.60/3.64 a year
ago, 9.31/7.92/8.27 now), and the absolute spread widened with it. The convex curve _is_ the
finding. Bending the axis to flatter the early years is precisely the move R15 exists to forbid.

## The axis was three days from a cliff

`axisTicks` targeted four intervals, and `chartGeometry` padded `hi` by 8 % before calling it. The
padded value is what `count = ceil(hi / step)` is computed from, so the two compounded:

| peak (`hi`)        | padded | step  | top tick  | frame used |
| ------------------ | ------ | ----- | --------- | ---------- |
| 1,811 (live today) | 1,956  | 500   | 2,000     | 91 %       |
| 1,852 (the rung)   | 2,000  | —     | —         | —          |
| 1,950              | 2,106  | 1,000 | **3,000** | **65 %**   |

The gap has been growing about 13 GRAM/day, so the crossing at 1,852 was roughly three days out.
Past it the line would have lost a third of its height and the grid would have dropped to three
labelled lines — the same failure shape as the 2026-09-20 off-chart bug, data crossing a ladder
rung, and it would have landed on a chart already criticised for looking flat.

Fixed by targeting eight intervals and dropping the padding. `count = ceil(hi / step)` already
guarantees the top tick clears the data, so the 8 % was only there to compound with the rung. At
today's data the top is unchanged at 2,000 and **no line moves by a pixel**; what changes is the
grid, from 5 lines at 500 to 9 at 250. The first year now reads against −250 and −500 instead of
floating in empty space, which is the whole of "the left and near zero". It also holds 2,000 until
the data genuinely passes it, and improves the worst case across all typed stakes from ~62 % of the
frame to ~80 %.

## The chart now carries its own number

Each line's right-end label became two rows — the protocol name, and under it that protocol's final
value (`-1,811 GRAM`, `-1,406 GRAM`). The chart was a shape with no price on it; the reader had to
look back up at the stat cards to learn what the bottom-right of the line was worth. This was the
single change that did most for "doesn't show the difference", and it costs nothing in translation:
`GRAM` is already hardcoded and untranslated throughout `/vs/`, as `Hipo` is in this component.

The value is rendered by passing `-item.endValue` through `formatNumber`, never by prefixing a
minus. The y-axis ticks already do this, and the reason is RTL: Persian builds as U+200E + U+2212 +
Persian digits, Arabic as U+061C + hyphen + Arabic-Indic digits. A hardcoded `−` gets both the
character and the bidi mark wrong.

## Four latent defects cleared

None was firing on today's data; all four were reachable.

- **The wash filled wrongly across a gap.** `area` appended one close-to-zero segment to a path that
  could contain several `M` subpaths, so only the last run was closed, and it closed back to the
  _series'_ first x — filling under the gap and under earlier runs, which rendered as slivers. Now
  each contiguous run is closed to the zero line on its own. The stroke keeps its multi-`M` form,
  which was already right. Triggered by a NaN at any sampled index: the gauge missing a day that is
  a multiple of 7 from 2024-09-12, or an R9 series that legitimately starts late.
- **Tick labels collapsed at small stakes.** The formatter was pinned at 0 fraction digits while the
  step goes sub-GRAM once the stake is small. Typing `1` gave `0, -0, -0, -0`; typing `500` labelled
  evenly spaced lines `0, -2, -4, -6`. `ChartGeometry` now exposes `tickDigits`, derived from the
  step, and both the axis and the new end values use it. `gram()` stays at 0 digits for the headline
  and the table.
- **End labels had no collision avoidance.** They sat at `endX + 10`, which is exactly the hardcoded
  x of the "Hipo" label, so a protocol ending near zero would overlap it, and two protocols ending
  close together would overlap each other (a recorded follow-up from 2026-09-20). `chartGeometry`
  now resolves a `labelY` per series. It takes two passes: one downward out of each other's way, and
  one back up from the floor — because when both lines end close together _and_ close to the bottom
  there is no room below, and clamping alone just stacks them (it left them 8.6 px apart in exactly
  that case). Today both labels resolve to their unshifted positions.
- **A trailing NaN could reach the headline.** The window end was taken from every protocol in the
  gauge tail, including `bemo` and `kton`, which are not drawn; either could push the window onto a
  day where a drawn protocol is missing, and `stakeOutcome` reads the last index unconditionally, so
  the big GRAM figures would render `NaN`. The scan is now restricted to `PROTOCOLS`, and the daily
  grid is additionally trimmed back to the last day every drawn protocol covers. Interior gaps are
  left alone — R9 wants the break drawn. Not hypothetical: 2026-09-13 is already missing from the
  grid (the baseline ends 09-12, the tail starts 09-14) and is only harmless because it is not a
  multiple of 7 from the window start.

Also deleted: a dead `growthSeries()`/`rateSeries()` pair in `lst-geometry.ts` referencing `rates`
and `STRIDE`, neither declared in that module — the live implementation is in `lst.ts`. Nothing
typechecks this repo (`prebuild` is `check-i18n` only, `@astrojs/check` is not installed), so a
future caller reaching for it from this browser-shipped module would have got a runtime
`ReferenceError`, not a compile error. Plus one unused `chartGeometry` import in `VsRoute.astro`.

## Redesigns considered and declined

Recorded so they are not re-proposed. Each was rendered from the real data before being rejected.

- **Replace it with the annualised gap** ("GRAM per year given up, trailing 365 days at each date").
  Legible across its whole width and never zero — genuinely tempting. Declined: it costs the entire
  first year of a window whose whole asset is "two years, read from the contracts"; it contradicts
  the stat cards directly above it (1,811 in the card, ~1,100 on the chart); it is a rate, not what
  the reader banked; and it does not even fix the complaint, since it still ramps left-to-right.
- **Two stacked panels.** Doubles the SVG, the client re-scaler and the axis logic, needs two
  headings and two leads across 11 locales, and lengthens a section that is read at a glance from a
  wallet message.
- **Re-anchor backwards** ("had you staked on date D and held to today"). The one honest
  construction that is large on the left. Declined because it decays to zero on the _right_, so the
  lines converge on Hipo at the newest edge — on the page arguing Hipo pays more. That is the same
  class of error as the 2026-09-20 inversion. It also collapses all three direct labels onto one
  point and contradicts the section's interactive premise.
- **Normalise by elapsed time or by the competitor's own earnings.** Produces a ratio, against the
  absolute-GRAM rule, and divides by ~0 on the left, manufacturing a spike where the data is weakest.
- **Log or sqrt y-scale.** Log cannot contain zero, so it is structurally incompatible with R15.
  Sqrt can, but it would lift year one from 19 % to ~41 % of the height purely by bending the axis,
  with labelled ticks as cover. Both rejected outright.

## The June 2026 notch is real — do not smooth it

The visible kink where the gap narrows from 767 to 481 GRAM and then widens again is not a data
artifact. Hipo's rate did not accrue at all from 2026-06-01 to 06-07 — seven consecutive days —
while both competitors kept earning ~3 bps/day. Normal Hipo cadence is accrual on roughly two days
in three, as each validation round closes, so isolated flat days are expected and seven are not.

Cause, confirmed by Behrang: TVL had fallen below the level at which the protocol can validate, so
no rounds ran. The pool went ~1,020k GRAM → ~571k across that window and recovered to ~1,900k by
late June.

It is deliberately not explained on the page: it is one notch on a 2,000-GRAM axis, it reads as
texture rather than as a claim, and a permanent sentence about a week Hipo underperformed would
cost 11 translations to give the event more prominence than it deserves. It is recorded here so
nobody later mistakes it for a backfill bug and "fixes" the dataset. The lead already says nothing
is smoothed — the notch is evidence for that claim, not against it.

### Verification performed

- `npm run build` passes, including the `check-i18n` prebuild gate. No copy changed, so no locale
  needed `--update-hashes`.
- Built `/vs/` carries 9 gridlines topping at −2,000, end labels at y 275.7/216.8 with values at
  289.7/230.8 reading `-1,811 GRAM` and `-1,406 GRAM`, and no `NaN` anywhere in the page.
- `/fa/vs/` and `/ar/vs/` render the ticks and both end values in their own digits with the correct
  sign marks (`‎−۱٬۸۱۱ GRAM`, `؜-١٬٨١١ GRAM`).
- Headline cells read 1,811 / 1,406 / 113,795, matching the figures computed independently from
  `lst-rates.json` plus the live gauge tail.
- The four defects were exercised against the real `chartGeometry` with synthetic series: an
  interior gap yields two independently closed wash subpaths each returning to its own run's start;
  `tickDigits` moves 0 → 1 → 2 as the stake falls through 500 and 100; two lines ending 0.6 px apart
  at the floor resolve to labels exactly 30 px apart instead of 8.6; a line ending on zero is pushed
  clear of the "Hipo" label. Live data leaves both labels unmoved.

### Follow-ups

- `MARGIN` in `lst-geometry.ts` is still duplicated as literals in `ValueGapChart.astro` (`x1='62'`,
  `width - 118`, `width - 108`) and `vs-stake.js`. A margin change silently desynchronises the grid
  from the plot. Export it and consume it.
- `xOf` is index-linear rather than time-linear, so a final partial stride is drawn a full stride
  wide, and the `i += 13` x-label stride can leave the right edge up to 12 samples past the last
  date label — today the line ends 2026-09-30 while the last label reads "Sep 26".
- `hi` is a max over positive values only, so an all-negative series would give `hi = 0` and put
  everything off-frame. Editorially unlikely; a clamp or a build-time warning would close it.
- The spec's §11 promised a supporting trailing-365d APY chart that was never built. The annualised
  gap series rendered during this session is that chart, and it is legitimate future work — just not
  as a replacement for this one.
