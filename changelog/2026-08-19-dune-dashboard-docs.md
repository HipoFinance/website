# 2026-08-19 — Dune dashboard docs page

Added a documentation page for Hipo's public Dune dashboard
(https://dune.com/hipofinance/stake-gram-on-ton-with-hipo-liquid-staking-with-top-apy),
positioning it as a complement to the Grafana-based Hipo Stats dashboard
(https://stats.hipo.finance/), not a replacement. The page is written for an
audience with lower-to-mid crypto/blockchain knowledge, per the request.

## Commits

| Commit | Description                                        |
| ------ | -------------------------------------------------- |
| (this) | Add the Hipo on Dune docs page and cross-links     |

## What changed

- **`src/content/docs/introduction/hipo-on-dune.md`** (new) — the page itself,
  with three sections: what the Dune dashboard is (including a plain-language
  explanation of what Dune does with public blockchain data), why it exists in
  addition to Hipo Stats (quick everyday numbers vs. blockchain-native
  analytics: protocol activity, wallet/holder trends, token flows, DeFi
  metrics, ecosystem comparisons, and independently verifiable transparency),
  and how it can be shared or forked on Dune. The sharing section also links
  the open-source [HipoFinance/dune](https://github.com/HipoFinance/dune)
  repository that holds the dashboard's queries. External links (dashboard,
  repo) are raw `<a target="_blank" rel="noopener">` so they open in a new
  tab.
- **`astro.config.mjs`** — sidebar entry `📊 Hipo on Dune` added to the
  Introduction group, directly after `📈 Hipo Stats` (the sidebar is explicit,
  so every new page needs an entry).
- **`src/content/docs/introduction/hipo-stats.md`** — a one-line cross-link to
  the new page, so readers of the stats docs discover the Dune dashboard.
- **`public/llms.txt`** — added the new docs URL next to the existing Grafana
  and Dune dashboard links (the Dune dashboard URL itself was already listed).

## Decisions

- Placed the page under Introduction as a sibling of Hipo Stats rather than
  nesting it, matching how the two dashboards relate (peers, not parent/child).
- A "What Can You Find There?" section listing insight categories (staking
  activity, holders, token flows, protocol growth) was drafted but removed at
  the user's request; the page points readers at the dashboard itself instead
  of enumerating its content. (Dune also blocks server-side fetching, so the
  exact widget list couldn't be verified live anyway.)

## Verification performed

- `npm run build` completes; 50 pages built (up from 49), including
  `dist/docs/introduction/hipo-on-dune/index.html`.
- The built Hipo Stats page references the new URL (sidebar, cross-link, and
  prev/next navigation).
- All touched files formatted with Prettier.
- An initial build failure (`@fontsource-variable/fredoka` unresolved) was a
  stale `node_modules`, fixed by `npm install` — unrelated to this change.

## Follow-ups

- Once the dashboard's chart set stabilizes, consider adding a screenshot to
  `public/docs/images/` and, optionally, naming the headline charts.
- The list-item text on the page could be reviewed by marketing for tone.
