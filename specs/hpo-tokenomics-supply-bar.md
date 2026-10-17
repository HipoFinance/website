# The tokenomics card shows where the 1B HPO are today

**Status:** approved

Approved in chat on 2026-10-17 (Behrang: "Ok do it please and publish it in all locales. Also
please move burned figure from client-side v4 to gauge"), after a mockup of the card in both
colour schemes.

## Goal

The tokenomics card on `/hpo/` keeps the donut of the planned allocation and gains a supply bar
under it: how much of the 1B minted is burned, how much is in circulation and how much Hipo still
holds. The burned figure comes from the gauge's total supply instead of a TON v4 run in the browser.

## In plain terms

The donut shows how the 1,000,000,000 HPO were split when they were minted: community 30%, liquidity
20% and so on. It cannot show two things a buyer wants to know: how many HPO have been burned (about
23 million, 2.3%) and how many are actually in the market (about 46 million, 4.6%). Both are too
small to see on a ring; the burn arc inside the donut is a dot. Other projects stop trying to draw
these on a pie and put them in a labelled bar with the numbers next to it.

So the card gets a second part, "Where the 1B HPO are today": one bar with three segments, burned in
ember, in circulation in the HPO purple, held by Hipo in grey, and under it the three figures with
their percentages and a short line each. The donut's centre says "1,000,000,000 HPO minted once"
instead of the burned count, and the burned count-up animation moves to the burned figure under the
bar. The bar is honest about the 93% Hipo holds: that is the small float the "built to get scarcer"
section already talks about.

The burned figure used to be read in the browser from a TON node (the v4 endpoint). The gauge already
publishes the total supply, and burned is the 1B minted minus that, so the page now takes it from
the gauge like every other figure: baked in at build time, refreshed every five minutes with the rest.
One fewer request, one fewer dependency, and the number cannot disagree with the circulating supply
beside it. Nothing changes in the gauge.

Risk: low. A wrong figure would show on one marketing card; the numbers come from the same gauge
payload the hero card already trusts. No decisions needed.

## Definitions

**Concepts**

- **Minted**: the 1,000,000,000 HPO created once at launch; the constant `HPO_MINTED`.
- **Total supply**: the HPO jetton master's current supply, `hpo.market.total_supply` in the gauge
  payload. It only falls, with burns.
- **Burned**: minted − total supply.
- **Circulating**: `hpo.market.circulating_supply` from the gauge: total supply minus the eight
  project wallets (gauge's `specs/hpo-price-from-pools.md`).
- **Held by Hipo**: total supply − circulating; what the six tokenomics multisigs and two old wallets
  hold.
- **Share**: each of the three as a percentage of the minted 1B, so the three sum to 100%.

## Context

- `src/components/Hpo.astro:40-60` builds the donut; lines 259-297 render it with an inner
  `#hpoBurnArc` circle and `#hpoBurned` count in the hole; lines 485-495 style the arc.
- `src/scripts/hpo-data.js:36-123` reads the burned figure from `v4.hipo.finance` (fallback
  `mainnet-v4.tonhubapi.com`) with `get_jetton_data`, and animates arc and count on scroll.
- `src/data/gauge.ts:259-325` formats the gauge payload for the page; `hpo.market.total_supply` is
  in the payload (977,074,768.65 on 2026-10-17) but not in the `GaugeData` interface.
- `src/i18n/<locale>/hpo.json` holds the strings; `hpo.tokenomics.burned` is "HPO burned so far".

## Approach

- `gauge.ts` gets `total_supply` in `GaugeData` and a new `hpoSupply(locale, data)` that returns the
  three amounts (compact, one decimal), the three percentages (one decimal), the three shares as
  numbers for the bar widths, and the exact burned count for the animation. It returns `undefined`
  unless total and circulating are both present, `0 < circulating ≤ total ≤ minted`.
- `Hpo.astro` bakes the hole text and the bar from it, with `data-share` on each segment and the
  baked figures in place, so a reader without JavaScript and a crawler see the final numbers. With
  no gauge data at build time the figures are em dashes and the bar is empty (the `0 100` dasharray
  equivalent: segments of width 0).
- `hpo-data.js` drops the v4 code. On load it blanks the burned figure to the locale's zero (the
  section is below the fold, so the baked figure is never seen first; with no baked figure the em
  dash stays), and when the figure itself scrolls fully into view counts up to the current figure;
  each 5-minute refresh updates the figures and the bar widths like the other ids. Reduced motion:
  the final figure at once, as today. Review findings fixed before the push (2026-10-17): the
  blanking call ran before `SetText` was defined and killed the whole refresh script; the observer
  watched the donut, so the count ran off screen; a gauge outage showed "0" instead of the dash; the
  three one-decimal percentages could sum to 100.1 (the large one now takes the remainder).
- The burn count-up keeps its ember glow on the burned segment; the inner arc and its CSS go.
- Rejected: a released-per-allocation bar on each legend row (needs per-wallet balances from the
  gauge and a footnote on the team row; later). Rejected: adding a `burned` field to the gauge (the
  minted constant already lives on the website, and total − minted is one subtraction).

## Changes

- `src/data/gauge.ts` — `total_supply` in `GaugeData`; `HpoSupply` interface and `hpoSupply()`.
- `src/components/Hpo.astro` — hole text; supply bar and figures under the legend; the live
  sentence before the existing body; remove `#hpoBurnArc` and its style; update the comments.
- `src/scripts/hpo-data.js` — remove the v4 reader; animate and refresh from `hpoSupply()`.
- `src/i18n/*/hpo.json` — new keys `hpo.tokenomics.minted`, `.supplyTitle`, `.supplyLabel`,
  `.burnedNote`, `.circulating`, `.circulatingNote`, `.held`, `.heldNote`, `.live`; `.burned`
  reworded to "Burned". All eleven locales.
- `CHANGELOG.md` — one entry.

## Acceptance criteria

- [ ] `node scripts/check-i18n.mjs` reports nothing missing; `npm run build` passes.
- [ ] Built `dist/hpo/index.html` contains no `v4.hipo.finance` and no `hpoBurnArc`; it contains
      the baked burned, circulating and held figures that sum to the minted 1B (22,925,231 +
      45.6M + 931.4M on 2026-10-17, the compact ones rounded) and the three percentages summing
      to 100.
- [ ] `hpoSupply()` returns `undefined` for a payload missing `total_supply`, for
      `circulating > total`, and for `total > 1e9`.
- [ ] In a headless browser on the live page, the burned figure under the bar reads the exact count
      (1B − total supply from `gauge.hipo.finance/data`) after the card scrolls into view, and no
      request goes to a v4 host.
- [ ] Screenshots at 1280 and 390 wide in both schemes: the bar and figures fit without horizontal
      scroll; `/fa/hpo/` renders the bar right-to-left.
- [ ] `team:risk-review` run; receipt written.

## Risks & rollback

The bar misreads if the gauge's `total_supply` and `circulating_supply` come from different cycles;
they are written together by one derive, so they agree. A gauge outage leaves the baked figures and
the page retries, as for every other figure. Rollback is one revert of the website commit; the gauge
is untouched.

## Open questions

None.
