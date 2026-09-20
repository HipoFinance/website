# 2026-09-20 — The `/vs/` chart's axis top could sit below the data

Reported from Telegram: on the "What you would have missed, day by day" chart, the Tonstakers
label was "off the chart and invisible". It was — at `y = −15.7`, above the top edge of the
viewBox. The label was the visible half of the problem: the last stretch of the Tonstakers **line**
was drawn outside the chart too, which is why the coral series appeared to leave through the top
and never come back.

| Commit         | Subject                                       |
| -------------- | --------------------------------------------- |
| (this session) | Make the /vs/ chart's axis top clear the data |

## The bug

`axisTicks(hi)` in `src/data/lst-geometry.ts` picks a readable interval and then walks it upwards:

```ts
for (let v = 0; v <= hi + step * 0.001; v += step) {
  ticks.push(…)
}
```

That loop stops at the last tick **at or below** `hi`, so the highest tick it returns — which
`chartGeometry` takes as the axis top and scales every point against — can be lower than the data
it is supposed to contain. Nothing clips in SVG; a point above the top simply lands at a negative
`y` and is not rendered.

The doc comment said "round `hi` up to a readable axis maximum", so the intent was never in doubt.
It survived a year because the grid usually lands above the data anyway: `chartGeometry` asks for
`hi * 1.08`, and only a value that falls between the last tick and that 8 % headroom is exposed.
Today's data fell exactly there:

|                                                 |                            |
| ----------------------------------------------- | -------------------------- |
| Tonstakers peak (and final point), 100,000 GRAM | 1,684.7                    |
| passed to `axisTicks` (`× 1.08`)                | 1,819.5                    |
| interval chosen                                 | 500                        |
| top tick returned                               | **1,500** ← below the peak |
| resulting label `y`                             | −15.7                      |

It is not stake-dependent — the chart is scale-invariant, so the same thing happened at every
preset — and the arithmetic reproduces at 16.85, 168.47, 16,847 and 168,470 too. What changed was
the shape of the data: Hipo's lead widened through September until the peak crossed 1,500.

## The fix

Derive the tick count instead of walking to it:

```ts
const count = Math.max(1, Math.ceil(hi / step - 1e-9))
```

`step` is already the smallest readable interval that is at least `hi / 4`, so `count` is four or
fewer and `count * step >= hi` is now arithmetic rather than luck. Two details: the epsilon keeps
a `hi` that is already an exact multiple from adding an empty interval, and the `Math.max(1, …)`
means an all-zero series yields a non-zero top — the old loop returned `[0]` there, and `yOf`
divides by the top, so that case produced `NaN` coordinates.

The comment above the function now says why the last tick must clear `hi`, with the date and the
numbers, because the failure is silent: nothing throws, nothing warns, the build passes and the
page serves 200 with a line that walks off the top of the frame.

`src/scripts/vs-stake.js` re-derives the chart through this same function, so the fix reaches the
stake control without a second change — which is the reason that module is shared.

### Verification performed

- Reproduced against the deployed page: `data-vs-end="tonstakers"` was at `y="-15.718"` on
  https://hipo.finance/vs/, with only the Stakee label inside the box.
- `npm run build` — clean, `i18n: ok, 0 warnings`. Rebuilt page: labels at `y = 65.7`
  (Tonstakers) and `y = 119.5` (Stakee), grid `0 / 500 / 1,000 / 1,500 / 2,000`, top gridline at
  the 16 px top margin.
- Ran `chartGeometry` over the payload the page inlines at ten stakes — the four presets plus 1,
  250, 3,333, 100,000, 7.5 M and 1 G — asserting for both series that the end label and every
  drawn point stay inside the viewBox. All pass; before the fix the two 1,684.7-peak cases did not.
- Checked `axisTicks` directly at `hi` = 0, 1, 0.004, 1,000 and the five magnitudes above: the top
  tick is now `>= hi` in every case, and 0 no longer yields a zero top.
- Rasterized the built SVG with `sharp` and compared it against the live page's: the coral line
  leaves through the top edge with no label before, and both lines close inside the frame with
  both labels legible after.

### Follow-ups

1. **Nothing guards the invariant automatically.** It is structural now, but a chart drawn outside
   its viewBox is invisible to the build, to `check-i18n` and to `render-check.mjs` (which asserts
   that a page rendered, not that a figure is inside its box). If this class of bug recurs, the
   cheap guard is a build-time warning when any point's `y` falls outside `[0, height]`.
2. **The two end labels are placed independently**, so a data shape that brings the series within
   ~12 px of each other at the right edge will overlap them. 54 px apart today; not worth solving
   before it happens.
