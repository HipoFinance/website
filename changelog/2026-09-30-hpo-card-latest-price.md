# 2026-09-30 — Show HPO's latest price in the hero card

The user team asked for HPO's current price on `/hpo/`: the hero card had a 30-day graph but no number saying what HPO
costs now. This session adds the latest price with its 24h change above the graph, in English first and then in all
ten other released locales. Spec: `specs/hpo-card-latest-price.md`.

| Commit         | Subject                                  |
| -------------- | ---------------------------------------- |
| (this session) | Show HPO's latest price in the hero card |

## What changed

- A price row between the card header and the graph: the price (`#hpoPrice`, Fredoka 30 px) and the 24h change
  (`#hpoChange24h`, green when up or flat, coral when down — the dApp Stats page's split) with a muted "24h" label.
- The data is the gauge's CoinGecko fields `hpo.market.current_price.usd` and `price_change_percentage_24h`, baked at
  build time through `gaugeValues()` and refreshed every 5 minutes by `hpo-data.js`, which also recolours the change.
  Missing price → "—"; missing change → the change and its label are hidden, at build time and on every refresh.
- The price format (4 significant digits below $1, cents above) moved into a shared `formatUsdPrice` in
  `src/i18n/format.ts` — the same rule as the dApp's `Model.formatUsdPrice`, so `/hpo/` and `/stats/` agree.
- New key `hpo.hero.change24h`, translated with each locale's existing "24h" wording from its volume label and a
  no-break space so the number and unit never split.

## Decisions

- **Above the graph, not after "HPO / USD"** (the user's first suggestion) — the price is the card's headline and the
  graph its history; on the title line it would be title-sized and compete with "● Live" on phones. Costs ~45 px of
  height.
- **24h change, from CoinGecko** — rejected a 30-day change (the graph already shows it) and a change computed from the
  sparkline's first/last points (a second number that disagrees with the source).

### Verification performed

- `node scripts/check-i18n.mjs` — ok, 0 warnings; i18n self-test — 18 groups passed; `npm run build` — 596 pages.
- `gaugeValues()` / `hpoChangeDirection()` exercised directly with falling, rising, zero, missing and NaN inputs, and in
  `fa`/`ar` digits.
- Every `dist/**/hpo/index.html` carries the baked price, change and colour class.
- Headless against the production preview, 11 locales × 320/360/414/1280 px (English also in light): no mid-word
  breaks, row inside the card, no horizontal scroll, row starts on the logical start side, both values rewritten by the
  refresh, and a refresh reporting a rise recolours a baked fall to green.
- Not browser-verified: that `/stats/` shows the identical string (its data does not load on localhost; guaranteed by
  the shared rule), and the page with the gauge unreachable at build time (checked at the function level only).

### Follow-ups

None.
