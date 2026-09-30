# 2026-09-30 — Credit CoinGecko for the HPO price chart

The 30-day price graph in the `/hpo/` hero card had no attribution. The gauge takes HPO's price from CoinGecko
(coin id `hipo-governance-token`) and the page draws the graph from the gauge's stored history, so the source is
CoinGecko. This session adds a "Source: CoinGecko" note and makes the graph open CoinGecko's HPO page, in English
first and then in all ten other released locales. Spec: `specs/hpo-price-chart-source.md`.

| Commit         | Subject                                               |
| -------------- | ----------------------------------------------------- |
| (this session) | Credit CoinGecko as the source of the HPO price chart |

## What changed

- The sparkline is wrapped in a link to `https://www.coingecko.com/en/coins/hipo-governance-token` (new tab,
  `rel="noopener noreferrer"`), with a focus ring and an accessible name from the new key `hpo.hero.chartLink`.
- A muted "Source: CoinGecko" line sits **below** the hero card, at its logical end, and links to the same page.
  "CoinGecko" is passed into the `hpo.hero.chartSource` string as an untranslated brand name inside a `num` span, so
  it keeps its order in `fa`/`ar`.
- Both strings translated into ru, es, id, pt, fa, ar, tr, uk, de and fr; hashes updated.

## Decisions

- **"Source:" rather than "Powered by"** — "Powered by" reads as a sponsorship and is less accurate, since the gauge
  relays CoinGecko's data rather than CoinGecko serving the chart.
- **English CoinGecko page in every locale** — one URL to maintain; CoinGecko has its own language switch.
- **Caption placement** — first drafted inside the card under the graph; moved below the card after the English
  review.
- **Two links, not one** — the graph and the caption are separate links once the caption left the card.

### Verification performed

- `node scripts/check-i18n.mjs` — ok, 0 warnings; `scripts/i18n-selftest.mjs` — 18 groups passed.
- `npm run build` — 596 pages, complete; every `dist/**/hpo/index.html` has both links.
- Headless (chrome-headless-shell) against the preview, all 11 locales: caption text and `aria-label` correct, graph
  drawn, no horizontal scroll; dark/light and 360 px checked; clicking the graph and the caption each opened the
  CoinGecko page in a new tab; caption turns accent on hover. The gauge's Prometheus endpoint only allows the
  `https://hipo.finance` origin, so on localhost the graph stays empty; the checks served its real response to the page
  through a request intercept.

### Follow-ups

- At phone width the hero card's figures break mid-word in fr, fa and ar (e.g. "3,2 M $U / S", "Détenteur / s").
  Present on production before this change.
- A dev-only proxy for the gauge would let the HPO sparkline and `/stats/` charts render on a local preview; not done.
- Playwright's full Chromium on the dev box lacks `libcups.so.2`; the MCP browser can't start until it is installed.
