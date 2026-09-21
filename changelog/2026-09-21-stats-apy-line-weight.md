# 2026-09-21 — The per-round APY line was drawn over the headline one

Reported from Telegram: on `/stats/`, "the mid round APY line is more visible than the 2-round
average. Maybe using a lighter color or transparency, or moving it below the 2-round average
improves it." Both halves of that suggestion turned out to name a real cause — the line had the
strongest colour on the page _and_ it was painted last.

| Commit         | Subject                                            |
| -------------- | -------------------------------------------------- |
| (this session) | Let the published APY sit above its per-round line |

## Two causes, and the comment that asserted the opposite

`StatsPage.tsx` already carried the intent, in a comment above the series it builds:

> The per-round line is muted and second, so the smoothed one still reads as the headline.

Neither clause held.

- **It was not muted.** The series was given `inkColor` — `var(--color-text)`, which is `#f5efe8`
  on the dark ground and `#291f20` on cream: the highest-contrast colour the page has, in both
  schemes. Its partner, the published average, is `var(--color-positive)`. Near-white at 2.5 px
  beats a mid-green at 2.5 px every time.
- **"Second" meant in front, not behind.** `LineChart` drew `series.map(…)` in array order, and in
  SVG the last thing painted is the thing on top. Adding the per-round line second put it _over_
  the line it was meant to sit under.

That second one is not specific to this chart. `series[0]` is the primary series everywhere else
in the component — the accessible summary, the delta line, the area fill and keyboard navigation
all read it — and it was the one series any later line could hide.

## The fix

- **`LineChart` paints back to front.** One `painted = [...series].reverse()`, used by the path
  pass and the end-dot pass, so `series[0]` is drawn last and nothing covers it. Order in the array
  stays meaning-order; only paint order is reversed. The price chart benefits by the same rule —
  hGRAM is its primary series and was previously under both GRAM and HPO.
- **The per-round series is `var(--color-text-faint)`.** The one text token that keeps its value
  (`#8d7f76`) across both schemes, and the same warm grey the chart already uses for its own axis
  labels via `--chart-ink`, so a subordinate line reads as subordinate on either ground.

The comment was rewritten too: it now says what the colours and the order actually do, because the
old one would have been read as a guarantee by the next person to touch it.

Not done: thinning the secondary stroke. Colour and order were enough — see below — and a
per-series width would be new API on a component five charts share. It is the next lever if the
line still competes.

### Verification performed

- `npm run build` — clean, `i18n: ok, 0 warnings`.
- Read it back out of the built island chunk: `key:"apy"` → `var(--color-positive)`,
  `key:"latestApy"` → `var(--color-text-faint)`, and `[...e].reverse()` present in `LineChart`.
- No browser on this machine (`render-check.mjs` finds no Chrome, and there is no jsdom), so the
  React chart could not be screenshotted directly. Instead drew a **mock** of the two lines — same
  colours, stroke width and paint order as the component — over the real Prometheus series for the
  last 30 days, before and after. The published APY reads as the headline in the second panel and
  did not in the first.
- Confirmed the shorter per-round line is the collector's history, not a gap: 145 points against
  the average's 360 over the same window, so it starts partway across the chart. Unchanged by this.

### Follow-ups

1. **The end-value figures are all drawn in `--chart-ink`**, whatever the series colour, so on a
   chart whose lines converge at the right edge the two figures can overlap. Not what was reported
   and not visible today, but the APY pair ends within 0.15 points of itself.
2. **A per-series stroke width** would let a secondary line be quieter still. Worth it only if
   colour and order prove insufficient on a real screen.
