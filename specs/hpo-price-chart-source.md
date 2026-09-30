# HPO price chart: source note and link

**Status:** implemented

## Goal

Say where the HPO price graph on `/hpo/` comes from, and let a visitor click the graph to open that source
(CoinGecko's HPO page) in a new tab.

## In plain terms

The HPO page has a card near the top with a small line graph of HPO's price over the last 30 days. Today
nothing says where those numbers come from. The price is actually CoinGecko's: our own statistics service
(the "gauge") asks CoinGecko for HPO's price every few minutes, stores it, and the page draws the graph from
that stored history.

The change adds a small, muted line under the card — "Source: CoinGecko" — and makes the graph itself (and
that line) a link. Clicking either opens CoinGecko's HPO page in a new browser tab, where the visitor can see
the full chart, exchanges and history. The pointer turns into a hand over the graph so it's clear it can be
clicked, and keyboard users can reach it with Tab.

What stays the same: the graph looks and loads exactly as before, the market cap / volume / holders figures
below it are untouched, and nothing else on the page moves. The only risk is cosmetic — the new line adds
about 28 px below the card — and it's undone by reverting one commit.

No decisions needed.

## Definitions

**Concepts**

- **Sparkline** — the small 30-day HPO price line in the `/hpo/` hero card (`<svg id="hpoSparkline">`).
- **Gauge** — Hipo's stats service (`gauge.hipo.finance`); it polls CoinGecko and exports the price to
  Prometheus as `hipo_hpo_current_price`, which the sparkline reads.
- **CoinGecko HPO page** — `https://www.coingecko.com/en/coins/hipo-governance-token`, the page for CoinGecko
  coin id `hipo-governance-token`, the same id the gauge queries.

**Formula parameters** — None.

## Context

- `src/components/Hpo.astro:127-131` — the sparkline `<svg>` sits alone between the card header ("HPO / USD",
  "Live market data") and the three figures row; no attribution anywhere in the card.
- `src/scripts/hpo-sparkline.ts` — fills the SVG from `queryRange('30d')`, series `hipo_hpo_current_price`;
  draws nothing until data arrives (height is reserved by the class).
- `../gauge/interface/coingecko/coingecko.go:13,19` — the gauge's HPO price is CoinGecko's
  `api.coingecko.com/api/v3/coins/hipo-governance-token`.
- `src/i18n/en/hpo.json:2-11` — the `hpo.hero.*` keys for the card.

## Approach

Two links to the CoinGecko HPO page, both `target="_blank" rel="noopener noreferrer"`:

- **The graph** — the sparkline `<svg>` is wrapped in a block `<a>` inside the card, with `cursor-pointer`, a
  visible focus ring (`focus-visible:outline-2 outline-accent rounded-[12px]`) and an `aria-label` from a new
  key `hpo.hero.chartLink` = `"HPO price chart on CoinGecko (opens in a new tab)"`. The SVG keeps its id,
  classes and size, so `hpo-sparkline.ts` needs no change.
- **The caption** — below the card, outside its border, aligned to the logical end: `text-text-faint
text-[12px]`, turning `text-accent` on hover. Text from a new key `hpo.hero.chartSource` =
  `"Source: {source}"`, with `CoinGecko` passed in as a brand name (never translated) inside a `num` span so
  it keeps its order in RTL locales. Card and caption share a new wrapper column. (Revised 2026-09-30 after
  the English review: the caption first sat inside the card, under the graph.)
- URL is the English CoinGecko page for every locale, held in one constant in `Hpo.astro`.

Rejected: making only the caption a link — the user asked for the graph itself to be clickable.
Rejected: an overlay "View on CoinGecko ↗" button on the graph — clutters a 120 px chart.

## Changes

- `src/components/Hpo.astro` — wrap the sparkline in the link, add the caption line.
- `src/i18n/en/hpo.json` — add `hpo.hero.chartSource` and `hpo.hero.chartLink`.
- `src/i18n/<locale>/hpo.json` + `meta.json` for every released locale — after the English review, per the
  project's English-first workflow.
- `CHANGELOG.md` + `changelog/2026-09-30-hpo-price-chart-source.md`.

## Acceptance criteria

- [x] On `/hpo/`, a line reading "Source: CoinGecko" appears below the hero card, outside its border.
- [x] Clicking the graph opens `https://www.coingecko.com/en/coins/hipo-governance-token` in a new tab (link
      has `target="_blank"` and `rel="noopener noreferrer"`); clicking the caption does the same.
- [x] The pointer is a hand over the graph and the caption; the caption turns accent-coloured on hover.
- [x] Tabbing reaches the graph link with a visible focus ring; its accessible name is the `chartLink` text.
- [x] The sparkline still draws (the SVG keeps `id="hpoSparkline"`), in both colour schemes.
- [x] No horizontal scroll at 360 px width; the caption doesn't wrap at 360 px.
- [x] In `fa`/`ar` the caption sits at the logical end and "CoinGecko" isn't reordered.
- [x] After translation, `node scripts/check-i18n.mjs` passes and `npm run build` succeeds.

## Risks & rollback

Cosmetic only: ~28 px taller hero column; a mis-styled link (underline, colour change on the SVG). Seen in the
review screenshots. Rollback: revert the commit.

## Open questions

None. Resolved 2026-09-30: the caption reads "Source: CoinGecko"; every locale links to CoinGecko's English
page.
