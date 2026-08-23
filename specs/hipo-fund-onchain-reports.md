# Hipo Fund reports from on-chain data

**Status:** approved (2026-08-24; all six open questions at their defaults)

## Goal

Restart the Hipo Fund's lapsed reporting with a report that is _generated_, not hand-assembled: publish one
"as of" report for the period since December 18, 2025, produced by a script that reads the fund's balances and
the valuation inputs from the chain and from public price APIs, so every future report is one command plus a
short narrative. Resolve open question 3 of `specs/content-accuracy-fixes.md` and apply the held D42 wording on
`hipo-fund.md`.

## Context

### What the existing reports contain

`src/content/docs/hipo-fund/quarterly-report-august-1-2025.md` and `quarterly-report-december-18-2025.md` share
one shape:

1. **Overview** — 2–3 paragraphs of narrative for the period.
2. **Fund Summary** — capital in the previous report, capital now, and the period's flows (HPO purchased and
   what was paid for it, HPO earned from profit sharing, GRAM added by a Hipo Club season claim).
3. **Key Activity This Period** — bulleted, one bullet per flow, with amounts.
4. **Portfolio Allocation (as of <date>)** — a table `Asset | Amount | Allocation | Value (USD) | Notes`, plus a
   stated total.
5. **Comparison** — August only: allocation percentages side by side, previous report vs this one; plus a "Fund
   Capital Growth" block with the absolute and percentage change.
6. **Strategic Notes / Next Quarter Priorities** — forward-looking bullets.

The August report also embeds a chart image; December does not. December is the better model — the content
review (`content-review-2026-08-23.md`, §D.5) verified its arithmetic and lists it under "OK / strong".

### The cadence promise

`src/content/docs/hipo-fund.md:46-47` says "**Quarterly Reporting** — We will publish a full, transparent report
every season". The last report is dated December 18, 2025; today is 2026-08-23. Two seasons' worth of reports
(≈ March 2026 and ≈ June 2026) were never produced. `specs/content-accuracy-fixes.md` row D42 rewords that
bullet but is held pending open question 3 ("Missing fund reports — we cannot write them").

### What is on-chain now

Fetched **2026-08-23, 16:15–16:40 UTC**, from `https://tonapi.io/v2/accounts/<addr>/jettons`,
`https://mainnet-v4.tonhubapi.com` (TON v4 archive) and CoinGecko.

**The fund is two wallets, and the published reports already aggregate both.** The multisig
`EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr` (`hipofund.ton`, `multisig_v2`, last activity 2026-06-26)
holds most of it; the pre-migration wallet `UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG` (`wallet_v5r1`,
last activity 2026-06-29) was never emptied and still holds USDT and HPO. Proof that the reports aggregate:
9,000,000.000000 HPO (multisig) + 23,524.435767 HPO (old wallet) = **9,023,524.435767**, which is the December
report's "9,023,524.43" to the cent. Any script that reads only the multisig would understate the fund.

| Asset | Multisig         | Old wallet    | Total            |
| ----- | ---------------- | ------------- | ---------------- |
| USDT  | 48,304.140199    | 17,852.862667 | 66,157.002866    |
| HPO   | 9,000,000.000000 | 23,524.435767 | 9,023,524.435767 |
| hGRAM | 6,000.902364     | 0             | 6,000.902364     |
| GRAM  | 2.779273         | 37.516114     | 40.295386        |

Valued with the protocol exchange rate 1.156629 GRAM/hGRAM (`get_treasury_state` on
`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`, masterchain seqno 88022479), GRAM $1.512834 and HPO
$0.002456041 (CoinGecko), USDT $1.0000:

| Asset | Amount           | Allocation | Value (USD) |
| ----- | ---------------- | ---------- | ----------- |
| USDT  | 66,157.002866    | 66.91%     | $66,157.00  |
| HPO   | 9,023,524.435767 | 22.41%     | $22,162.15  |
| hGRAM | 6,000.902364     | 10.62%     | $10,500.31  |
| GRAM  | 40.295386        | 0.06%      | $60.96      |

**Total $98,880.42**, against $110,875.29 on December 18, 2025 — **−$11,994.87 (−10.82%)**.

The period's activity is derivable from balances alone, without reading the event stream: hGRAM fell 16,000.90 →
6,000.90 (exactly 10,000 hGRAM), USDT rose 50,461.20 → 66,157.00 (+$15,695.80), HPO is unchanged to the
nano-unit. That is one de-risking swap of 10,000 hGRAM into stablecoins at roughly $1.57/hGRAM, no HPO buyback
and no profit-sharing receipt this period.

Both wallets also hold worthless jettons pushed by spam senders — "LOCKED GRAM", "GRAM AIRDROP" (both
`verification: blacklist`), TONRAGE and STAR (`verification: none`, score 0) — and NFTs: one unnamed item on the
multisig and five on the old wallet, four of them **Hipo Bill** unstake receipts. None of these carry value, but
the script must exclude them by an explicit asset allowlist, never by a price heuristic.

### What the probes established about reconstructing the past

- `https://mainnet-v4.tonhubapi.com` is a **full archive**: `/block/utime/<unix>` resolves a masterchain seqno
  for any past date, `/block/<seqno>/<addr>` returns the native balance at that block, and
  `/block/<seqno>/<jettonWallet>/run/get_wallet_data` returns the jetton balance. Verified against the December
  report: at seqno 55142138 (2025-12-18 12:00 UTC) the multisig's hGRAM wallet returns 16,000.902364275, and the
  report says "16,000". `get_treasury_state` also runs at historical seqnos, so the hGRAM exchange rate is
  recoverable for any date (1.083246 on 2025-12-18 vs 1.156629 today).
- `https://v4.hipo.finance` — the app's primary endpoint — returns `500` for `/block/utime/…`. It is **not**
  archive-capable; historical runs must use the public endpoint.
- **CoinGecko has hourly history for all three priced assets**: `the-open-network` (GRAM), `hipo-governance-token`
  (HPO) and `hipo-staked-ton` (hGRAM), via `/coins/<id>/market_chart/range`. It answered for 2025-12-18 on the
  free tier.
- `https://gauge.hipo.finance/prometheus/api/v1/query_range` returns **403** to any non-browser caller, with and
  without the production `Origin`/`Referer`. It is not usable as a script data source.
- `tonapi.io` free tier rate-limits hard (429 after a handful of calls) and its `/events` endpoint was
  unavailable throughout. It is fine for a one-off "which jettons does this wallet hold" check, but must not be
  on the script's critical path.

So: **balances and the hGRAM exchange rate are exactly reconstructible for any past date; prices are
reconstructible to within the usual index-vs-DEX spread; period narrative is not** — that needs the event
stream, which we could not read reliably.

## Approach

### 1. One generated "as of" report, not three

Publish a single report dated the day the snapshot is taken, covering **December 18, 2025 → snapshot date** as
one period. Its allocation table is the live snapshot; its comparison table is against the December report,
which we have in the repo. Everything in it is verifiable at a URL.

The report keeps the December report's structure, with two changes:

- The **Overview** opens by naming the gap: no report was published in March or June 2026. It does not pretend
  the cadence held.
- The comparison table carries both amount and USD columns (December's table dropped the side-by-side; August's
  had percentages only). Dual denomination — GRAM/USD — stays out of the main table; see open question 4.

The narrative is limited to what the balance deltas prove (the 10,000 hGRAM → USDT swap, HPO unchanged).
**No flow that cannot be evidenced is described.** If the team knows of a Season 4/5 claim or a profit-sharing
receipt in the period, it can be added by hand with its transaction link; the script will not invent one.

### 2. The missed dates: reconstructed snapshots, clearly labelled — not back-dated reports

Writing March-2026 and June-2026 "quarterly reports" now would mean fabricating the narrative sections, which is
exactly the failure mode `public/llms.txt` forbids. But the balance tables for those dates _are_ exact, and
publishing them costs one extra script run each.

Recommendation: **do not create back-dated report pages.** Instead, add one section to the new report:

> #### 📉 Interim snapshots (reconstructed)
>
> No report was published in March or June 2026. The balances below were read back from the TON archive at the
> masterchain block closest to 12:00 UTC on each date and priced with CoinGecko's hourly series for the same
> hour. They are balance snapshots only — we did not reconstruct the activity narrative for those periods.

with a compact `Date | USDT | HPO | hGRAM | GRAM | Total (USD)` table for 2026-03-18, 2026-06-18 and the
snapshot date. That is transparent about both what we have and what we don't.

### 3. The script — `scripts/hipo-fund-snapshot.mjs`

Plain Node ≥ 22 ESM, **no new dependencies** (global `fetch`, no `@ton/ton` needed — the v4 REST API is enough).
Sits beside `scripts/check-i18n.mjs` and `scripts/i18n-selftest.mjs`; it is a reporting tool, not part of the
build, and is never wired into `prebuild`.

```
node scripts/hipo-fund-snapshot.mjs                    # now
node scripts/hipo-fund-snapshot.mjs --at 2026-03-18    # 12:00 UTC that day
node scripts/hipo-fund-snapshot.mjs --json             # machine-readable, for diffing
node scripts/hipo-fund-snapshot.mjs --compare 2025-12-18   # emits the comparison table too
```

Constants at the top of the file, each with a comment naming what it is:

| Constant      | Value                                              |
| ------------- | -------------------------------------------------- |
| Multisig      | `EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr` |
| Legacy wallet | `UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG` |
| hGRAM master  | `EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w` |
| HPO master    | `EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM` |
| USDT master   | `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs` |
| Treasury      | `EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ` |
| v4 archive    | `https://mainnet-v4.tonhubapi.com`                 |

Steps:

1. Resolve the masterchain seqno — `/block/latest`, or `/block/utime/<unix>` for `--at`. Record the seqno and
   the block's UTC time; every subsequent read is pinned to it, so the whole snapshot is internally consistent
   even if a transfer lands mid-run.
2. For each of the two wallets, read the native GRAM balance from `/block/<seqno>/<addr>`.
3. For each `(wallet, jetton master)` pair, derive the jetton wallet address on-chain — `run/get_wallet_address`
   on the master with the owner as argument — then read `run/get_wallet_data` on it. Deriving rather than
   hard-coding keeps the script correct if the fund ever moves to a third wallet, and removes tonapi from the
   critical path. A jetton wallet that does not exist at that seqno (non-zero exit code) counts as balance 0.
4. Read `run/get_treasury_state` on the treasury at the same seqno; the hGRAM rate is `totalCoins / totalTokens`
   (fields 0 and 1).
5. Fetch prices: CoinGecko `market_chart/range` for `the-open-network` and `hipo-governance-token` over a
   ±3-hour window around the block time, taking the point nearest the block time. USDT is fixed at exactly
   1.0000 (documented, not fetched).
6. Print the allocation table, the totals, the optional comparison table, and a **Sources** block listing every
   URL called with the value it returned and the block seqno/time — that block is pasted verbatim into the
   report's Notes.

Failure rule, non-negotiable: **if any input cannot be fetched, the script prints `UNAVAILABLE` in that cell and
exits non-zero.** It never substitutes a stale, cached or approximate value, and the report is not published
with an `UNAVAILABLE` in it.

### 4. Valuation methodology (stated in the report itself)

- **hGRAM** — `balance × (treasury.totalCoins / treasury.totalTokens) × GRAM/USD`. The protocol redemption rate,
  not a DEX quote: it is what the fund would receive by unstaking, and it is read from the same block as the
  balance. (At the snapshot this gives $1.7498 vs CoinGecko's market $1.73 — the DEX discount, ~1%.)
- **HPO** — `balance × HPO/USD` from CoinGecko `hipo-governance-token`, which is DEX-derived. HPO has thin
  liquidity; the report says so in a note rather than implying the full holding is realisable at that price.
- **USDT** — exactly 1.0000 USD per unit, by convention, stated as such.
- **GRAM** — `balance × GRAM/USD` from CoinGecko `the-open-network`.
- **Excluded** — every jetton and NFT outside the four-asset allowlist, listed by name in the report's Notes so
  the exclusion is visible rather than silent. The Hipo Bill NFTs on the legacy wallet are named explicitly:
  they are unstake receipts, and if any is still pending it represents a claim the table does not show.

The older reports' USD figures are **not** exactly reproducible by this method — December valued hGRAM at
$1.5200 where rate × GRAM price gives $1.5937 for that block. The new report does not restate or "correct" the
December figures; it compares against them as published and notes the methodology change once.

## Changes

1. **`scripts/hipo-fund-snapshot.mjs`** (new) — as specified above. Header comment covering the two-wallet fact,
   why the archive endpoint is the public one and not `v4.hipo.finance`, and the never-invent-a-number rule.
2. **`src/content/docs/hipo-fund/quarterly-report-<month>-<day>-2026.md`** (new) — the report, English only.
   Structure per §1, `title: 'Quarterly Report: <Month D, YYYY>'` matching the existing two. Ends with a
   **Notes** section carrying the script's Sources block: block seqno, block UTC time, every source URL, the
   exchange rate used, the three prices with their fetch timestamps, and the excluded-assets list.
3. **`astro.config.mjs`** — sidebar entry in the `💰 Hipo Fund` group, after the December report.
4. **`src/i18n/en/docs-sidebar.json`** — the matching label. Translated labels for fa/ru/hi are **not** added;
   those locales are `draft`, so the gate only warns. (Per the standing decision, content batches stay
   English-only until the locale sync.)
5. **`src/content/docs/hipo-fund.md`** — apply D42 with the report now existing, replacing the "will publish …
   every season" bullet:

   > - **Regular Reporting**\
   >   We publish a full report on the fund's holdings and performance. The most recent is the
   >   [\<Month D, YYYY\> report](/docs/hipo-fund/quarterly-report-<month>-<day>-2026/). Every report is
   >   generated from an on-chain snapshot of the fund's wallets — the balances, the hGRAM exchange rate and the
   >   block they were read at are listed in each report's Notes.

   The two-wallet fact also belongs on this page: the "Previous wallet" line at `:23` currently reads as
   historical, but that wallet still holds assets and is counted in the totals. Reword to say so.

6. **`specs/content-accuracy-fixes.md`** — record open question 3 as answered and D42 as applied. (Edit deferred
   to the implementing session; not part of this spec's own changes.)

## Acceptance criteria

1. `node scripts/hipo-fund-snapshot.mjs` completes against a live network and prints a table plus a Sources
   block; exit code 0.
2. Re-running it with `--at <the report's snapshot date>` reproduces every figure in the published report's
   allocation table within rounding (amounts to 6 dp, USD to the cent, percentages to 0.01pp). Price columns may
   differ only if CoinGecko revises history — a difference there is a re-publish, not an accepted drift.
3. `node scripts/hipo-fund-snapshot.mjs --at 2025-12-18` returns hGRAM 16,000.902364275 and HPO
   9,023,524.435767465 — the regression check that the two-wallet aggregation and the archive reads are right.
4. Every figure in the report is traceable to a source URL and a timestamp recorded in its Notes. No figure
   appears that the script did not produce, except hand-added flows that carry a transaction link.
5. The allocation table's USD column sums to the stated total (to the cent); percentages sum to 100 ± 0.1.
6. The comparison against December 18, 2025 uses the figures as published in
   `quarterly-report-december-18-2025.md` — $110,875.29 total, USDT 50,461.20, HPO 9,023,524.43, hGRAM 16,000 —
   and the stated change equals the arithmetic difference.
7. The report names, in prose, that no report was published in March or June 2026.
8. `npm run build` passes (the i18n gate must not fail — verify the new sidebar key does not break a released
   locale) and `npx prettier --write` leaves the new files unchanged.
9. The new page renders in the `💰 Hipo Fund` sidebar group and its link resolves in `dist/`.

## Risks

- **Price-source outage.** CoinGecko free tier rate-limits and can 429. The script must fail loudly, not fall
  back to tonapi silently — a mixed-source table would be untraceable. If CoinGecko is down at report time, wait;
  a report is not urgent.
- **Positions the script cannot see.** The allowlist covers the four assets the fund holds today. If the
  treasury ever deploys into an LP position, an EVAA lending position, a vesting contract or a staking NFT, the
  script under-reports and gives no warning. Mitigation: the script prints _every_ jetton the wallets hold
  (allowlisted or not, from a single tonapi call) as an unvalued "seen also" list, so a new position shows up as
  an unexplained line rather than as silence. The report states its coverage explicitly: "these two wallets,
  these four assets, at this block".
- **Legacy wallet forgotten.** The single largest correctness risk. Encoded as acceptance criterion 3.
- **Hipo Bill NFTs.** Four on the legacy wallet. If any represents a pending unstake, the fund holds a claim on
  GRAM that the table omits. Check their state before publishing; if any is live, add the amount as a separate
  line rather than folding it into hGRAM.
- **Invented numbers.** The standing rule: if a value cannot be obtained, the report says it cannot be obtained.
  This applies to the narrative too — no buyback, claim or profit-share is described without a transaction link.
- **Stale-as-live cadence claim.** If the next report also slips, D42's wording still holds (it promises "a full
  report", not a season), but the report list will again look abandoned. Consider a standing calendar reminder;
  the script makes the cost of a report roughly one hour.

## Decisions (2026-08-24)

All six open questions at their defaults: report date = the snapshot day; Mar/Jun 2026 as a clearly-labelled
reconstructed-snapshot table inside the new report (no back-dated pages); `scripts/hipo-fund-snapshot.mjs`,
not wired into `prebuild`; USD table plus one GRAM total line; keep the `quarterly-report-<date>` slug and
title with the Overview stating the gap; the period narrative limited to what balances prove.

## Open questions

1. **Report date.** _Default:_ the day the snapshot is taken, and the file/title use that date — no back-dating
   to a season boundary. If the team prefers alignment with a Hipo Club season boundary, name the date.
2. **March and June 2026 reconstructions.** _Default:_ no back-dated report pages; one clearly-labelled "interim
   snapshots (reconstructed)" table inside the new report, balances only (§2). Alternative, if the team wants
   the series to look complete: two thin pages carrying only the balance table and the same label — the spec
   recommends against it, because a page titled "Quarterly Report" with no activity section invites the reader
   to assume there was no activity.
3. **Script location and naming.** _Default:_ `scripts/hipo-fund-snapshot.mjs`, alongside the other one-off
   scripts, not wired into any npm script (so `prebuild` never depends on the network). Add an
   `npm run fund-snapshot` alias only if the team will run it regularly.
4. **Dual denomination.** The December report is USD-only; the April table on `hipo-fund.md` is too. _Default:_
   keep the main allocation table USD-only and add a single line stating the total in GRAM as well, since GRAM
   is the protocol's unit of account and the fund's USD swings are mostly GRAM price. A full GRAM column can be
   added later without changing the script.
5. **Series title.** The cadence lapsed, so "Quarterly Report" is now inaccurate for this one. _Default:_ keep
   the established `quarterly-report-<month>-<day>-<year>` slug and "Quarterly Report:" title for series
   consistency, and let the Overview state the gap. Renaming the series to "Fund Report" would need the two
   existing pages renamed and redirected — out of scope here.
6. **Period narrative.** The balance deltas evidence one swap and nothing else. _Default:_ report only that. If
   the team can point at Season 4/5 claim or profit-sharing transactions in the period, they go in with links.
