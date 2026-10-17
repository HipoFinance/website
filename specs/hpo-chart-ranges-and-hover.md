# The HPO price chart gets the Stats page's ranges and hover readout

**Status:** implemented

Approved in chat on 2026-10-17 (Behrang: "The stats page has 24H, 1W, 1M, 3M, and 1Y. Can we have
that on the HPO page too? Can the chart also show the price and date similar to the stats page too?
If yes, please add them both and push.").

## Goal

The hero chart on `/hpo/` gets the five range pills of the Stats page (24H, 1W, 1M, 3M, 1Y) and, on
hover, touch or keyboard, shows the price and the date of the point under the pointer, the way the
Stats charts do.

## In plain terms

Today the chart is a fixed 30-day line with no labels: a reader cannot tell what the price was on a
given day or look at a week or a year. Now a row of five pills under the chart picks the window,
the same five as the Stats page, with the month selected at first. Moving the pointer over the
chart draws a thin vertical line and a dot on the nearest point, and the card's price swaps to the
price at that point with its date beside it; leaving the chart puts the live price back. On a phone
a sideways drag does the same and the page still scrolls up and down. The line's colour follows
the chosen window (green when it ends at or above where it started, coral otherwise).

The chart used to be one big link to CoinGecko; a chart one interacts with cannot be a link, so the
CoinGecko link moves to the sentence under the card. Two pills show a step on 2026-10-17, when the
price moved from CoinGecko's figure to the pools': 3M and 1Y show the history as it was published,
which is honest, and the 24h change on the card returns by itself once the gauge publishes it
again (the gauge change is `gauge/specs/hpo-24h-change.md`). Risk: low, a marketing card; a
failed fetch shows "Couldn't load history" in the chart's place. No decisions needed.

## Definitions

**Concepts**

- **Range**: one of the Stats page's `StatsRange` values (`24h`, `7d`, `30d`, `90d`, `1y`), each
  with its fixed step in `prometheus.ts`.
- **Gap**: two points more than 2.5 steps apart; the line breaks there, as on the Stats page.
- **Inspecting**: a point is picked by pointer, touch or keyboard; the card shows that point's
  price and time instead of the live price and the 24h change.

## Context

- `src/scripts/hpo-sparkline.ts` draws a fixed 30d polyline into `#hpoSparkline` (viewBox
  `0 0 400 120`, `preserveAspectRatio='none'`), coloured by first vs last.
- `src/components/Hpo.astro:212-224` wraps the SVG in an `<a>` to CoinGecko; `:190-209` the price
  row with `#hpoPrice`, `#hpoChangeWrap`, `#hpoChange24h`.
- `src/components/app/charts/RangeSelector.tsx`, `LineChart.tsx` (hover, touch, keyboard, gap
  rule), `StatsPage.tsx:393-416` (time formats per range), `prometheus.ts` (`queryRange`,
  `STATS_RANGES`, `RANGE_LABEL_KEYS`, `stepFor`).
- `src/i18n/en/app.json` has `app.chart.range*`, `app.chart.rangeGroup`, `app.chart.loadError`,
  `app.chart.noData`, `app.chart.ariaSummary`, `app.chart.ariaNoData` in every released locale.
- `src/scripts/hpo-data.js` writes `#hpoPrice` on every refresh.

## Approach

- `Hpo.astro` takes the `app` namespace too (`getT(locale, ['hpo', 'app'])`) and reuses those keys,
  so the pills and the two messages need no new translation. The chart block is `dir='ltr'`
  (SVG coordinates are physical, as on the Stats page). The SVG is sized by its container (the
  script sets the viewBox to the measured width × 120 and redraws on resize), so the hover dot is
  round and the stroke is 2.5px; `preserveAspectRatio` goes. It is focusable (`tabindex='0'`,
  `role='img'`) with an `aria-label` the script fills from the baked `ariaSummary` template.
  Strings the script needs ride as `data-*` on the SVG: `data-error`, `data-empty`, `data-aria`,
  `data-aria-empty`, `data-title`. A `<p id='hpoSparklineNote' hidden>` over the SVG shows the
  error or empty text.
- Under the SVG: `#hpoRange`, `role='group'`, five `<button data-range aria-pressed>` in a
  `bg-surface-deep` pill track, `30d` pressed; the script toggles `aria-pressed` and fetches.
  While a range loads the SVG is at 60% opacity; the old line stays until the new one lands; a
  failed fetch clears the line and shows the error text; fewer than two points shows the empty
  text.
- The price row: `#hpoChangeWrap` and a new `#hpoHoverTime` share one grid cell. Inspecting puts
  the point's price in `#hpoPrice` (saving the live text in `data-live`) and its time in
  `#hpoHoverTime`, and makes the change wrap `invisible`; leaving restores. `hpo-data.js` writes a
  refreshed price to `data-live` instead of the text while `data-inspecting` is set.
- Time format per range as `StatsPage.tsx`'s `formatHoverTime`: `1y` → year, short month, day;
  else short month, day, hour, minute (24h). Price via `formatUsdPrice`. Both through the page's
  locale (`<html lang>` → registry key, as `hpo-data.js` does).
- Pointer: nearest point by time; hairline from top to bottom in `--color-text-faint`, dot in the
  line colour with a surface ring. Touch: horizontal drag scrubs, vertical scrolls (`touch-pan-y`,
  the Stats chart's 6px decision), lift clears after 2s. Keyboard: Home/End/arrows, blur clears.
- The CoinGecko link moves to the footnote: new keys `hpo.hero.compare` ("For comparison, {link}.")
  and `hpo.hero.compareLink` ("the HPO chart on CoinGecko"); `hpo.hero.chartLink` is removed.
- Rejected: axes and gridlines on the hero chart (it is a sparkline in a card; the readout carries
  the numbers). Rejected: a data table under it. Rejected: remembering the chosen range.

## Changes

- `src/components/Hpo.astro` — chart block, pills, price row, footnote; `app` namespace.
- `src/scripts/hpo-sparkline.ts` — rewritten: ranges, resize, hover/touch/keyboard, readout.
- `src/scripts/hpo-data.js` — `data-live` while inspecting.
- `src/i18n/*/hpo.json` — `hpo.hero.compare`, `hpo.hero.compareLink` added; `hpo.hero.chartLink`
  removed; eleven locales, hashes updated.
- `src/styles/global.css` — the `--color-hpo` comment no longer mentions the sparkline's history.
- `CHANGELOG.md` — one entry.

## Acceptance criteria

- [x] `node scripts/check-i18n.mjs` reports nothing missing; `npm run build` passes.
- [x] Built `dist/hpo/index.html` has five `data-range` buttons with the labels 24H 1W 1M 3M 1Y,
      no `<a` around `#hpoSparkline`, and the CoinGecko href in the footnote.
- [x] In a headless browser on the local preview: clicking `1W` sends one `query_range` request
      with `step=1800` and the pill becomes `aria-pressed="true"`; a pointer move over the chart
      sets `#hpoHoverTime` to a date and `#hpoPrice` to a `$` price, and leaving restores the
      live price text exactly.
- [x] Screenshots at 1280 and 390 wide in both schemes: the pills fit on one row at 390 and
      nothing scrolls horizontally; `/fa/hpo/` renders with native digits in the readout.
- [x] `team:risk-review` run; receipt written.

## Risks & rollback

A chart glitch shows on one card; the price figures still come from the gauge. The Prometheus proxy
allowlist already permits the five steps (the Stats page sends them). Rollback is one revert.

## Open questions

None.
