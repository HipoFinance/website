# HPO card: show the latest price

**Status:** implemented

## Goal

Show HPO's current USD price, with its 24-hour change, in the `/hpo/` hero card, so visitors don't have to leave the
page (or read it off the graph) to know what HPO costs now. Requested by the user team.

## In plain terms

The HPO page's top card has a 30-day price graph, but no number anywhere says what HPO costs today. We'll add the
latest price, for example **$0.004063**, as a large figure directly above the graph, with the 24-hour change next to
it (**−4.19%** in coral when the price fell, **+3.12%** in green when it rose) and a small "24h" label.

The price comes from the same place as everything else in the card: CoinGecko, relayed by our gauge service. It is
built into the page when the site is published, so it shows instantly, and the page refreshes it every 5 minutes, as
it already does for market cap, volume and holders. If the gauge is unreachable the price shows "—" and the change is
hidden, never a made-up number. The price is shown with 4 significant digits, the same way the dApp's Stats page
shows it, so the two pages always agree.

What changes: the card gets about 45 px taller. What stays the same: the graph, the figures below it, and the
"Source: CoinGecko" note.

Why above the graph rather than right after "HPO / USD" (the placement you suggested): the price is the headline of
the card and the graph is its history, so reading top-down gives "what it costs now → how it got here". Squeezed into
the title line it would sit at title size next to the "● Live" badge, and on phones that line is already full
(French "En direct" wraps today). Open question 1 lets you pick.

## Definitions

**Concepts**

- **Gauge** — Hipo's stats service; `https://gauge.hipo.finance/data` returns CoinGecko market data per token. The
  fields used here are `hpo.market.current_price.usd` and `hpo.market.price_change_percentage_24h`.
- **Latest price** — the gauge's `current_price.usd`, i.e. CoinGecko's price as of the gauge's last CoinGecko poll
  (the gauge polls on its own, slower market interval; the page re-reads the gauge every 5 min). It is not a live
  trade price, and can lag the DEX by several minutes.
- **24h change** — CoinGecko's `price_change_percentage_24h`.

**Formula parameters**

| symbol | meaning                                  | unit                          | rounding / range                                                                           |
| ------ | ---------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| `p`    | `hpo.market.current_price.usd`           | USD per HPO                   | shown with 4 significant digits below $1, 2 fraction digits at $1 and above; must be > 0   |
| `c`    | `hpo.market.price_change_percentage_24h` | percent (−4.19 means −4.19 %) | shown as `c / 100` with `signDisplay: exceptZero`, max 2 fraction digits; any finite value |

The price format is the dApp's existing `formatUsdPrice` rule (`src/components/app/Model.ts:885`); the change format
is the existing `formatSignedPercent` (`src/i18n/format.ts:40`). Display only — nothing is computed from these
values.

## Context

- `src/components/Hpo.astro` — the hero card: header (logo, "HPO / USD", "Live market data", "● Live"), the
  sparkline link, the figures list/row, the "Source: CoinGecko" note below the card.
- `src/data/gauge.ts:29-36,240-292` — `GaugeData` (typed subset of the gauge payload) and `gaugeValues()`, which
  formats the build-time values keyed by DOM id; the HPO market fields today are `market_cap` and `total_volume`
  only.
- `src/scripts/hpo-data.js:25,115-133` — re-polls the gauge every 5 min and writes `gaugeValues()` results into the
  ids in `IDS` with `textContent`.
- `src/components/app/StatsPage.tsx:45-52` and `Model.ts:885-890,1922-1931` — the dApp's HPO section shows the same
  price and 24h change: price via `formatUsdPrice`, change coloured `text-positive` when up, `text-accent` when down.
- Gauge payload today: `current_price` 0.00406304, `price_change_percentage_24h` −4.19252.

## Approach

- **Markup** — a new row between the header and the sparkline link:
  `<div class='flex flex-wrap items-baseline gap-x-3 gap-y-1'>` holding the price
  (`#hpoPrice`, `font-fredoka num text-[30px] font-semibold`, same size as the dApp's stats figures) and the change
  (`#hpoChange24h`, `num text-[15px] font-medium`, coloured by sign) followed by a muted `text-[13px]` label from a
  new key `hpo.hero.change24h` = `"24h"`. `flex-wrap` lets the change drop under the price on a narrow phone rather
  than squeeze it.
- **Data** — extend `GaugeData.hpo.market` with `price_change_percentage_24h`, and `gaugeValues()` with `hpoPrice`
  (when `p > 0`) and `hpoChange24h` (when `c` is finite), using the formatters above. A new exported helper
  `hpoChangeDirection(data)` returns `'up' | 'down' | undefined` (`c >= 0` is up, matching the dApp).
- **Build time** — `Hpo.astro` renders both values and the colour class from the build-time payload, like the other
  figures. Missing price → "—"; missing change → the change and its label are not rendered (`hidden`).
- **Refresh** — `hpo-data.js` adds `hpoPrice` and `hpoChange24h` to `IDS`, and after each poll sets the change
  element's colour class (`text-positive` / `text-accent`) and un-hides it when a value arrives.
- **Accessibility** — the sign (+/−) is in the text, so colour is never the only cue.

Rejected: computing the change from the sparkline's first and last points — a second, slightly different number from
the one CoinGecko publishes; and a 30-day change — the graph already shows the 30-day trend, and 24h is what every
price widget shows.

## Changes

- `src/data/gauge.ts` — `GaugeData`/`GaugeValues` fields, `gaugeValues()` additions, `hpoChangeDirection()`.
- `src/components/Hpo.astro` — the price row.
- `src/scripts/hpo-data.js` — two ids, colour/visibility toggle on refresh.
- `src/i18n/en/hpo.json` — `hpo.hero.change24h`; then every released locale after the English review.
- `CHANGELOG.md` + `changelog/2026-09-30-hpo-card-latest-price.md`.

## Acceptance criteria

- [x] On `/hpo/`, the built HTML contains the price formatted with 4 significant digits (e.g. `$0.004063` for
      0.00406304) and the signed 24h change, above the graph, before any script runs.
- [x] The change is green (`text-positive`) when `c >= 0` and coral (`text-accent`) when `c < 0`, both in the built
      HTML and after a refresh.
- [x] With the gauge request failing at build time, the price shows "—" and the change + "24h" are absent; the build
      still succeeds. _(Verified at the function level only.)_
- [x] After load, `hpo-data.js` writes both values (observed as DOM mutations on `#hpoPrice` and `#hpoChange24h`).
- [x] The price on `/hpo/` and on `/stats/` (HPO section) are the same string for the same payload in English. _(By code: both use the
      same rule; `/stats/` data does not load on localhost.)_
- [x] 11 locales × 320/360/414/1280 px: no mid-word breaks in the new row, no horizontal scroll; in `fa`/`ar` the
      row starts at the right and numbers keep their order.
- [x] Dark and light schemes both legible (screenshots).
- [x] `node scripts/check-i18n.mjs`, the i18n self-test and `npm run build` pass after translation.

## Risks & rollback

- The card grows ~45 px, pushing the page content down slightly on phones. Seen in review screenshots.
- A stale price if the gauge's CoinGecko poll stalls: the page shows the gauge's last value, as it already does for
  market cap and volume. Not new risk.
- If the visitor's browser can't reach the gauge, the figures baked at the last deploy stay on screen (as market cap
  and volume already do). A refresh that arrives without a 24h change hides the old one.
- Rollback: revert the commit.

## Open questions

None. Resolved 2026-09-30: (1) a price row above the graph; (2) the 24h change is shown.
