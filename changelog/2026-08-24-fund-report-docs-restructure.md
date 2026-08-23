# 2026-08-24 — On-chain fund report and docs restructure

Two batches in one session, both English-only per the standing decision (fa/ru/hi stay `draft` until the
post-batch locale sync): the missing Hipo Fund report was generated from on-chain data with a reproducible
script (`specs/hipo-fund-onchain-reports.md`, closing accuracy-spec open question 3), and the docs were
restructured per `specs/docs-restructure.md` — new sidebar, four merges with redirects, five new reference
pages and a rewritten `/docs/` hub (suggestions #2, #3 and #5 of the content review).

## Commits

| Commit    | Description                                                |
| --------- | ---------------------------------------------------------- |
| `3ce96d0` | Add the on-chain Hipo Fund report and restructure the docs |

## Hipo Fund on-chain report

- `scripts/hipo-fund-snapshot.mjs` — Node 22, no new dependencies; reads both fund wallets (the multisig
  `hipofund.ton` and the legacy wallet, which still holds part of the fund) at a single pinned masterchain
  block via the v4 archive API, derives jetton wallets on-chain, prices via CoinGecko, `--at/--seqno/--json/
--compare`; any unfetchable input prints `UNAVAILABLE` and exits non-zero — the script never substitutes a
  value.
- `src/content/docs/hipo-fund/quarterly-report-august-24-2026.md` — holdings at block 88063277 (2026-08-23
  20:51 UTC): USDT $66,157.00 (66.98 %), HPO 9,023,524.44 ($22,116.74, 22.39 %), hGRAM 6,000.90 ($10,442.15,
  10.57 %), GRAM 40.30 ($60.62) — total **$98,776.51** (65,655.99 GRAM) vs $110,875.29 in December (−10.91 %).
  Includes reconstructed March/June 2026 interim snapshots with a note that no report was published then, the
  period activity limited to what balances prove (10,000 hGRAM → USDT), a methodology/sources section, the
  December figures quoted as published with its hGRAM-valuation discrepancy noted once, an unattributed
  +35.99 GRAM inflow reported as such, and the four Hipo Bill NFTs verified zero-balance at the block.
- `hipo-fund.md` — the held D42 wording applied: reports are generated from on-chain snapshots with the
  script; the new report is linked as the most recent. Accuracy-spec Q3 marked answered.
- Verified: two same-seqno runs byte-identical; the December regression reproduces the published 16,000.90
  hGRAM exactly; every report figure traced to script output; totals and percentages sum; independently
  re-run by the orchestrator with identical results.

## Docs restructure

- Sidebar: 12 top-level entries / 40 pages → **9 groups / 42 pages** (Start Here · Using Hipo · Tokens &
  Governance · Security & Transparency · Developers · Hipo Fund · Archive: Past Programs · Legal · Brand
  Kit), unique emoji, "Overview" first-children, dated archive labels (Hipo Gang ended 2025, seasons with
  years, $1M and Ambassadors paused). `src/i18n/en/docs-sidebar.json` rewritten 1:1 (52 keys).
- Merges (URLs redirected via Astro static meta-refresh stubs with `noindex`): `why-ton` →
  `introduction/liquid-staking/`, `stake-gram` → `introduction/how-does-hipo-work/`, `get-hgram` deleted
  (duplicate of the hGRAM page), `tokenomics` → `hipo-tokens/hipo-governance-token-hpo/` (parent URL kept —
  it is the one `llms.txt` and the GitBook 301s point at).
- New pages: `/docs/fees-and-gas/`, `/docs/risks/` (the five llms.txt risks; "no risk-free staking"),
  `/docs/contracts-and-audits/` (treasury, parent with upgrade caveat, HPO jetton, the four audits),
  `/docs/glossary/` (20 terms; TGE dated 25 Nov 2024 after cross-checking independent announcements),
  `/docs/staking-without-the-app/` (the "d"/"w" comment flow consolidated with the minter-burn path, which
  was trimmed out of the unstaking intro page). `/docs/` (`index.md`) rewritten as a hub with the
  new-to-staking / ready-to-stake / building-on-Hipo paths and a "what Hipo does not do" line.
- Cross-links updated across docs, FAQ prose, `Hpo.astro` and `public/llms.txt` (five new Important-links
  entries; `Last reviewed` bumped).

## Decisions

Both specs approved with all defaults (fund: snapshot-day title, interim table not back-dated pages, script
not in `prebuild`, USD + one GRAM line, series slug kept, narrative limited to proven activity; docs: dated
parenthetical archive labels, Ambassadors archived not deleted, single-child Developers group, plain-Markdown
hub, fragment-free redirects, "🦛 What is Hipo?" label, glossary closes Start Here, TGE date stated without
the price). Deferred: batch 3 (formatting sweep), the locale sync (which must also move/delete the four
orphan twins per locale and consider locale-prefixed redirects), the report title following the block date
rather than the publication day.

### Verification performed

- `npm run build` — 52 pages + 4 redirect stubs, exit 0 (drafts build 514 pages); gate exit 0 with the
  expected draft-locale warnings; `withSidebarTranslations` guard passes; selftest 15 groups; `tsc` clean in
  `src/**`; prettier clean on all touched files.
- Redirect stubs verified in `dist/` (meta refresh + `noindex` + correct target); the only remaining
  references to retired paths are the redirect map itself; all links on the six new pages resolve.
- The five new pages grepped for forbidden phrasing (superlatives, hardcoded APY/price, "risk-free" as a
  promise) — clean; the fund report figures were independently re-derived.
- Not done yet: locale twins (deferred to the sync), browser click-through (Chrome proxy still pending),
  post-deploy Rich Results / Search Console steps.

### Follow-ups

- Batch 3 spec (formatting/a11y sweep), then the fa/ru/hi locale sync (`git mv` unchanged twins, draft
  merged/renamed/new files, delete the four orphan twins per locale, `--update-hashes`, flip the registry
  back to `indexed`), then the user's commit and, on their word, push.
- Future fund reports: run `node scripts/hipo-fund-snapshot.mjs`, paste the tables, record the seqno.
