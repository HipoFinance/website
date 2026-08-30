---
title: 'Hipo Fund Report — August 2026'
description: "The Hipo Fund's holdings as of August 2026, generated from an on-chain snapshot of the fund's two wallets."
---

**Published August 24, 2026 · Updated August 29, 2026**

:::note[Update, August 29, 2026]
This report has been expanded since first publication. We added performance since inception, the reasoning
behind the transactions in the period, a liquidity note on the HPO position, and next-period priorities. No
balance, price or valuation has changed — the tables are the same August 23 snapshot. The
[Hipo Fund overview page](/docs/hipo-fund/) has also been updated.
:::

---

## 📌 Overview

This report covers the period since the [December 18, 2025 report](/docs/hipo-fund/quarterly-report-december-18-2025/)
— eight months in one document. Reporting returns to a quarterly schedule from here, with the next report due
in December 2026.

Every figure below was read from a single TON masterchain block and priced at that block's timestamp. The
block number, the exchange rate, the prices and every URL used are listed under **Notes**, so anyone can
reproduce the tables.

Two things to take from this report. One transaction moved the portfolio in this period — 10,000 hGRAM
converted into stablecoins by March 18 — and every balance except native GRAM has been unchanged since, so
the 10.91% decline is almost entirely price rather than activity. And measured against all the capital ever
contributed, the fund is **down 58.4% since launch**, against GRAM's 49.8% fall over the same window. This is
the first Hipo Fund report to publish a since-inception figure and a benchmark, and both will appear in every
report from now on.

---

## 💰 Fund summary

| Measure                                   | Value                                               |
| ----------------------------------------- | --------------------------------------------------- |
| Capital in previous report (Dec 18, 2025) | $110,875.29                                         |
| **Current capital (Aug 24, 2026)**        | **$98,776.51**                                      |
| Change over the period                    | −$12,098.78 (−10.91%)                               |
| Total in GRAM                             | 65,655.99 GRAM                                      |
| Snapshot                                  | masterchain block 88063277, 2026-08-23 20:51:50 UTC |

**Wallets counted:** [hipofund.ton](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr)
(multisig, 2-of-3) and the secondary wallet
[UQBwGlrp…DdLfG](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG), which holds part of
the fund.

---

## 📈 Performance since inception

Previous reports compared each quarter to the one before it. That leaves out the capital added along the way,
so here is the full picture.

| Measure                                     | Value         |
| ------------------------------------------- | ------------- |
| Opening capital, April 18, 2025             | $186,963.96   |
| Season 2 claim (Aug 2025)                   | ~$31,557      |
| Season 3 claim (Dec 2025)                   | ~$5,535       |
| **Total capital contributed**               | **~$224,056** |
| Value today                                 | $98,776.51    |
| **Return since inception (Modified Dietz)** | **−58.4%**    |
| **GRAM over the same period**               | **−49.8%**    |

GRAM fell from $2.994 on April 18, 2025 to $1.5044 at this snapshot. For most of its first year the fund was
almost entirely GRAM-linked, so it moved with GRAM and then further, with the additional gap coming from HPO,
which fell more than GRAM did.

The shift into stablecoins that began in December 2025 is what has stabilised the fund since: two-thirds of
the portfolio is now insulated from those moves.

**A note on the claim valuations.** The exact GRAM/USD price at the moment each Hipo Club claim was received
was not recorded at the time. The figures above value each claim at the GRAM price implied by the report
published closest to it — $3.4499 for Season 2 (from the August 1, 2025 allocation table) and $1.4032 for
Season 3 (from the December 2025 table). They are close estimates. Every future inflow will be recorded with
its block and price at the moment of receipt.

**Modified Dietz** weights each contribution by how long it was in the fund, so a dollar added in December is
not treated the same as a dollar present since April 2025. It is the standard method for portfolios with
irregular cash flows and it is what Hipo Fund will use from now on.

---

## 📥 Key activity this period

**hGRAM converted to stablecoins — 10,000 hGRAM into 15,695.79 USDT.** The hGRAM balance fell from 16,000.90
to 6,000.90 and USDT rose from 50,461.21 to 66,157.00, an implied $1.5696 per hGRAM. Both changes had
happened by March 18, 2026.

The reasoning: the fund's capital had arrived almost entirely as GRAM — from the HPO ILO and from Hipo Club
season claims — leaving it concentrated in a single asset, and we expected the GRAM price to weaken.
Converting part of the position into stablecoins reduced that concentration. GRAM was around $1.57 at the
time of the conversion and $1.50 at this snapshot, having traded below $1.38 in March.

From now on, material portfolio changes like this one are announced in Hipo's official channels when they are
made, and changes to the fund's strategy go to a DAO vote.

**No HPO buybacks.** The HPO balance is unchanged to the nano-unit — 9,023,524.435767465 in December and
today.

**No profit sharing received.** On December 16, 2025 the fund moved 1.9M HPO from the secondary wallet to the
multisig. Hipo Club, which calculates and pays profit shares, does not support multisig wallets, so that HPO
was not eligible for distributions from that date.

On **June 6, 2026** the protocol staking fee was set to **0%** — stakers now keep 100% of staking rewards.
With no governance fee there is no protocol revenue, so no profit sharing is being paid to anyone. The fund's
HPO position therefore generates no income at present, and will not until the DAO decides to reinstate a
governance fee. When revenue sharing returns, the fund will move HPO to an eligible wallet ahead of the first
distribution.

**A small GRAM inflow.** Native GRAM rose by 35.996 GRAM (about $54), consistent with gas refunds or a minor
transfer. We have not identified the source and do not claim one.

**No further movement after March.** Between March 18 and this snapshot every balance is identical except
GRAM, which changed by 0.54.

---

## 🔸 Portfolio allocation — August 24, 2026

| Asset     | Amount       | Allocation  | Value (USD)    | Notes                             |
| --------- | ------------ | ----------- | -------------- | --------------------------------- |
| USDT      | 66,157.00    | 66.98%      | $66,157.00     | Capital preservation & liquidity  |
| HPO       | 9,023,524.44 | 22.39%      | $22,116.74     | Governance & profit-sharing token |
| hGRAM     | 6,000.90     | 10.57%      | $10,442.15     | Staked GRAM generating yield      |
| GRAM      | 40.30        | 0.06%       | $60.62         | Native balance, mostly gas        |
| **Total** |              | **100.00%** | **$98,776.51** | 65,655.99 GRAM                    |

---

## 💧 A note on the HPO position

The table above values HPO at its market price. That is the standard accounting convention, but it is not
what the position could be sold for, and the difference is large enough to state plainly.

- The fund holds **9.02M HPO — about 1.16% of circulating supply**
- HPO's total 24-hour trading volume across all venues is small, in the low tens of dollars
- Total HPO liquidity across all DEX pools is roughly **$113,000**, of which about half is the HPO side

At those volumes the position represents years of total market turnover. **The HPO line should be read as a
strategic holding carried at market, not as $22,116 of readily realisable value.** The fund is not planning
to sell it, and reporting it in a way that implied liquidity would be misleading.

---

## 📊 Comparison vs the December 18, 2025 report

December's figures are quoted **as published**. They are not recalculated — see _Methodology_.

| Asset | Dec 2025 amount | Dec 2025 USD | Dec %  | Aug 2026 amount | Aug 2026 USD | Aug %  |
| ----- | --------------- | ------------ | ------ | --------------- | ------------ | ------ |
| USDT  | 50,461.20       | $50,461.20   | 45.53% | 66,157.00       | $66,157.00   | 66.98% |
| HPO   | 9,023,524.43    | $36,094.09   | 32.55% | 9,023,524.44    | $22,116.74   | 22.39% |
| hGRAM | 16,000.00       | $24,320.00   | 21.92% | 6,000.90        | $10,442.15   | 10.57% |
| GRAM  | —               | —            | —      | 40.30           | $60.62       | 0.06%  |

**Total:** $110,875.29 → $98,776.51 = **−$12,098.78 (−10.91%)**

---

## 📉 Interim snapshots

The balances below were read back from the TON archive at the block covering 12:00 UTC on each date and
priced with the hourly series for the same hour. These are balance snapshots only — they are not reports
published at the time.

| Date         | Block    | USDT      | HPO          | hGRAM    | GRAM  | Total      |
| ------------ | -------- | --------- | ------------ | -------- | ----- | ---------- |
| Mar 18, 2026 | 58434457 | 66,157.00 | 9,023,524.44 | 6,000.90 | 39.76 | $96,975.94 |
| Jun 18, 2026 | 74104571 | 66,157.00 | 9,023,524.44 | 6,000.90 | 40.30 | $99,754.81 |
| Aug 24, 2026 | 88063277 | 66,157.00 | 9,023,524.44 | 6,000.90 | 40.30 | $98,776.51 |

The balances are identical across all three rows. Every movement in total value since Q1 2026 is price.

---

## 🧠 Strategic notes

- **The treasury is two-thirds stablecoins.** That was the direction set in December and it has held through
  an eight-month drawdown in GRAM and HPO. It is what has protected the fund's capital since.
- **Those stablecoins are not yet earning.** $66,157 has been held in cash since March. Putting it to work
  within a defined risk framework is the fund's most immediate opportunity, and the Investment Policy
  Statement sets out how.
- **hGRAM exposure is a third of what it was**, so less of the fund tracks GRAM — and correspondingly less of
  it earns staking yield. hGRAM currently yields around 17% APY with the protocol fee at 0%.
- **The fund's income sources are narrower than they were.** Since Season 4, HPO rewards accrue directly to
  hGRAM holders, so there are no further season claims. With protocol fees at 0% there is no profit sharing.
  **hGRAM staking rewards are currently the fund's only active income stream.** Future inflows may come from
  OTC deals with strategic investors, from HPO sales out of the liquidity allocation if market conditions
  justify it, and from profit sharing once revenue sharing returns — but none are committed, so the fund is
  being planned around the capital it already holds.

---

## 🔮 Next period priorities

1. **Publish an Investment Policy Statement in September 2026** — target allocation, concentration and
   liquidity limits, eligible assets, rebalancing rules, the treatment of HPO, custody, and reporting
   cadence. Community review follows publication, then a binding DAO vote. Exact dates are announced in
   [Hipo's Telegram channel](https://t.me/HipoFinance) and on ton.vote.
2. **Put the stablecoin position to work** within the approved policy. This is the single largest improvement
   available to the fund's return.
3. **Strengthen custody.** Set and hold a limit on the balance kept in the secondary single-signature wallet.
4. **Settle the HPO question openly.** Whether the fund continues to add to its HPO position is a policy
   decision with a real cost attached, and it belongs in the IPS and in front of HPO holders.
5. **Report on schedule.** Next report December 2026, then quarterly, each with performance since inception
   and a benchmark.

---

## 🔬 Methodology

Every figure comes from
[`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
run once against one block.

- **Scope.** The two wallets named above and four assets: USDT, HPO, hGRAM, native GRAM. Assets are included
  by explicit allowlist, never by a price heuristic, so a spam token cannot enter the table — and a genuinely
  new position cannot enter it silently either. The coverage scan under _Notes_ lists everything held but not
  valued.
- **hGRAM** is valued at the protocol redemption rate (`totalCoins / totalTokens`, read from the Hipo
  treasury at the same block) times the GRAM price. That is what the fund would receive by unstaking, rather
  than a DEX quote.
- **HPO** is valued at its market price.
- **USDT** is valued at exactly 1.0000. This is a convention rather than a fetched quote.
- **GRAM** is valued at its market price.
- Each row is rounded to cents before the total is taken, so the USD column adds to the stated total exactly.
- If any input cannot be fetched, the script exits with an error. A report is never published from a partial
  run, and no figure here is estimated, carried over or filled in by hand.

**On comparability.** The December 2025 report valued hGRAM at $1.52 per token. The protocol rate at that
block (1.083246) times the GRAM price gives $1.61. December's numbers have not been restated: the comparison
table quotes them as published, and only the current column uses the method above.

**On performance figures.** The Modified Dietz calculation and the Season 2 and Season 3 claim valuations in
"Performance since inception" are derived from previously published Hipo Fund tables, not from the snapshot
script. Their basis is stated in that section.

---

## 📎 Notes — sources for every figure

- **Masterchain block:** seqno 88063277, 2026-08-23 20:51:50 UTC (`https://mainnet-v4.tonhubapi.com/block/latest`).
  The report is dated by its publication day; the data is the state at this block. Re-run
  `node scripts/hipo-fund-snapshot.mjs --seqno 88063277` to reproduce every number.
- **Balances:** read from the TON v4 archive at that block — the native balance from
  `/block/88063277/<wallet>`, and each jetton balance from `get_wallet_data` on the jetton wallet, whose
  address is derived on-chain via `get_wallet_address` on the jetton master.
- **hGRAM exchange rate:** 1.156629 GRAM/hGRAM — `get_treasury_state` on
  [EQCLyZHP…z2eZ](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) at the same block
  (totalCoins 8,447,610.655999208 / totalTokens 7,303,644.745694234).
- **GRAM/USD:** $1.5044554222558664 at 2026-08-23 20:50:00 UTC.
- **HPO/USD:** $0.002451009455012681 at 2026-08-23 20:50:00 UTC.
- **USDT/USD:** 1.0000 exactly (methodology, not fetched).
- **Interim snapshots:** blocks 58434457 (2026-03-18 12:00 UTC) and 74104571 (2026-06-18 12:00 UTC).
  Exchange rates 1.092007 and 1.124988; GRAM $1.380123538781121 and $1.6405205620696306; HPO
  $0.002407052253654585 and $0.0024886774867728225.
- **GRAM price at inception:** $2.994, derived from the April 18, 2025 opening table (5.30 GRAM = $15.87).
- **Held but not valued.** The coverage scan found five jettons across the two wallets outside the allowlist,
  contributing $0 to the table: "GRAM Unlock at gramunlock.org" (both wallets), "GRAM AT GRAMEVENT.ORG" and
  TONRAGE (multisig), STAR (secondary wallet). All are unsolicited tokens sent to the wallets; none are fund
  positions. The secondary wallet also holds four Hipo Bill NFTs — the receipts issued when an unstake waits for a
  validation round, here for rounds between June and November 2025. All four hold a zero balance at the
  snapshot block and each settlement we traced completed within about a day. They carry no claim on the protocol and
  add nothing to the table.
