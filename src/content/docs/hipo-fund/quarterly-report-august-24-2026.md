---
title: 'Quarterly Report: August 24, 2026'
description: "The Hipo Fund's holdings as of August 2026, generated from an on-chain snapshot of the fund's two wallets."
---

### 🟣 Hipo Fund – Quarterly Report

**August 24, 2026**

---

#### 📌 Overview

**No report was published in March or June 2026.** This report covers the whole period since the
[December 18, 2025 report](/docs/hipo-fund/quarterly-report-december-18-2025/) — eight months in one
document — and it is the first one generated directly from the chain rather than assembled by hand.

Every figure below was read from a single TON masterchain block and priced at that block's timestamp. The
block number, the exchange rate, the prices and every URL used are listed under **Notes**, so any reader can
reproduce the tables rather than take our word for them. Where the on-chain record does not tell us something
— above all _why_ a position changed — this report says so instead of filling the gap.

The fund's total value is down 10.91% since December, while its balances barely moved. The decline is a
price effect on the HPO and hGRAM held, partly offset by the larger stablecoin base established in Q1.

---

#### 💰 Fund Summary

- **Capital in Previous Report (December 18, 2025):** $110,875.29
- **Current Capital (August 24, 2026):** $98,776.51
- **Change:** −$12,098.78 (−10.91%)
- **Total in GRAM:** 65,655.99 GRAM
- **Snapshot:** masterchain block 88063277, 2026-08-23 20:51:50 UTC
- **Wallets counted:** [hipofund.ton](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr)
  (multisig) and the pre-migration wallet
  [UQBwGlrp…DdLfG](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG), which still holds
  part of the fund

---

#### 📥 Key Activity This Period

Reconstructed from balance changes between the two blocks. These are the movements the chain proves; we have
not attributed them to specific transactions.

- **hGRAM converted to stablecoins:** hGRAM fell by exactly **10,000.000000000** (16,000.902364275 →
  6,000.902364275) while USDT rose by **15,695.794729** (50,461.208137 → 66,157.002866). That is an implied
  **$1.5696 per hGRAM**. Both changes had already happened by 18 March 2026.
- **No HPO buyback and no HPO profit-sharing receipt.** The HPO balance is unchanged to the nano-unit —
  9,023,524.435767465 in December and today.
- **A small GRAM inflow:** the fund's native GRAM rose by **35.995650594 GRAM** (≈ $54). The amount is
  consistent with gas refunds or a minor transfer; we have not identified its source and do not claim one.
- **Nothing moved after March.** Between 18 March and this snapshot every balance is identical except GRAM,
  which changed by 0.54 GRAM.

---

#### 🔸 Portfolio Allocation (as of August 24, 2026)

| Asset | Amount              | Allocation | Value (USD) | Notes                                      |
| ----- | ------------------- | ---------- | ----------- | ------------------------------------------ |
| USDT  | 66,157.002866       | 66.98%     | $66,157.00  | Capital preservation & liquidity buffer    |
| HPO   | 9,023,524.435767465 | 22.39%     | $22,116.74  | Governance & profit-sharing token          |
| hGRAM | 6,000.902364275     | 10.57%     | $10,442.15  | Staked GRAM generating yield               |
| GRAM  | 40.2953863          | 0.06%      | $60.62      | Native balance, mostly gas for the wallets |

**Total Fund Value: $98,776.51** — equal to **65,655.99 GRAM** at the same block.

> The HPO position is large relative to HPO's on-market liquidity. Its value here is the market price times
> the balance; it is not a claim that the whole position could be sold at that price.

---

#### 📊 Comparison vs the December 18, 2025 report

December's figures are quoted **as published**. They are not recalculated — see _Methodology_ for why.

| Asset | Dec 18, 2025 amount | Dec 18, 2025 USD | Dec %  | Aug 24, 2026 amount | Aug 24, 2026 USD | Aug %  |
| ----- | ------------------- | ---------------- | ------ | ------------------- | ---------------- | ------ |
| USDT  | 50,461.20           | $50,461.20       | 45.53% | 66,157.002866       | $66,157.00       | 66.98% |
| HPO   | 9,023,524.43        | $36,094.09       | 32.55% | 9,023,524.435767465 | $22,116.74       | 22.39% |
| hGRAM | 16,000              | $24,320.00       | 21.92% | 6,000.902364275     | $10,442.15       | 10.57% |
| GRAM  | —                   | —                | —      | 40.2953863          | $60.62           | 0.06%  |

**Total:** $110,875.29 → $98,776.51 = **−$12,098.78 (−10.91%)**

---

#### 📉 Interim snapshots (reconstructed)

No report was published in March or June 2026. The balances below were read back from the TON archive at the
masterchain block covering 12:00 UTC on each date and priced with the hourly price series for the same hour.
**They are balance snapshots only** — we did not reconstruct an activity narrative for those periods, and
these rows should not be read as reports we published at the time.

| Date         | Block    | USDT          | HPO                 | hGRAM           | GRAM         | Total (USD) |
| ------------ | -------- | ------------- | ------------------- | --------------- | ------------ | ----------- |
| Mar 18, 2026 | 58434457 | 66,157.002866 | 9,023,524.435767465 | 6,000.902364275 | 39.759286624 | $96,975.94  |
| Jun 18, 2026 | 74104571 | 66,157.002866 | 9,023,524.435767465 | 6,000.902364275 | 40.29845511  | $99,754.81  |
| Aug 24, 2026 | 88063277 | 66,157.002866 | 9,023,524.435767465 | 6,000.902364275 | 40.2953863   | $98,776.51  |

The three rows carry the same balances: the fund has been static since Q1 2026, and the movement in total
value is entirely price.

---

#### 🧠 Strategic Notes

- The treasury is now **two-thirds stablecoins**. That was the intent stated in the December report, and it
  has held through an eight-month drawdown in GRAM and HPO.
- **hGRAM exposure is one third of what it was** in December, so less of the fund tracks the GRAM price — and
  correspondingly less of it earns staking yield.
- **No buybacks were executed this period.** The December report described buybacks as selective; none met
  that bar.

---

#### 🔬 Methodology

Every figure comes from `scripts/hipo-fund-snapshot.mjs` in the website repository, run once against one
block. Its rules:

- **Scope.** The two wallets named above, and four assets: USDT, HPO, hGRAM and native GRAM. Assets are
  included by an explicit allowlist, never by a price heuristic, so a spam token cannot enter the table — and
  a genuinely new position cannot enter it silently either (see the coverage scan under _Notes_).
- **hGRAM** is valued at the **protocol redemption rate** — `totalCoins / totalTokens` read from the Hipo
  treasury at the same block — times the GRAM price. That is what the fund would receive by unstaking, not a
  DEX quote.
- **HPO** is valued at its market price.
- **USDT** is valued at exactly 1.0000 USD. It is a convention, not a fetched quote.
- **GRAM** is valued at the GRAM market price.
- Each row is rounded to cents before the total is taken, so the USD column adds up to the stated total
  exactly.
- If any input cannot be fetched, the script prints `UNAVAILABLE` and exits with an error. A report is never
  published from a partial run, and no figure here is estimated, carried over or filled in by hand.

**A note on comparability.** The December 18, 2025 report valued hGRAM at $1.52 per token. The protocol rate
at that block (1.083246) times the GRAM price gives $1.61. We have **not** restated December's numbers: the
comparison table quotes them exactly as published, and only the current column uses the method above.

---

#### 📎 Notes — sources for every figure

- **Masterchain block:** seqno 88063277, 2026-08-23 20:51:50 UTC (`https://mainnet-v4.tonhubapi.com/block/latest`).
  The report is dated by its publication day; the data is the state at this block. Re-run
  `node scripts/hipo-fund-snapshot.mjs --seqno 88063277` to reproduce every number below.
- **Balances:** read from the TON v4 archive at that block — the native balance from
  `/block/88063277/<wallet>`, and each jetton balance from `get_wallet_data` on the jetton wallet, whose
  address is itself derived on-chain via `get_wallet_address` on the jetton master.
- **hGRAM exchange rate:** 1.156629 GRAM/hGRAM — `get_treasury_state` on
  [EQCLyZHP…z2eZ](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) at the same block
  (totalCoins 8,447,610.655999208 / totalTokens 7,303,644.745694234).
- **GRAM/USD:** $1.5044554222558664 at 2026-08-23 20:50:00 UTC.
- **HPO/USD:** $0.002451009455012681 at 2026-08-23 20:50:00 UTC.
- **USDT/USD:** 1.0000 exactly (methodology, not fetched).
- **Interim snapshots:** blocks 58434457 (2026-03-18 12:00 UTC) and 74104571 (2026-06-18 12:00 UTC).
  Exchange rates 1.092007 and 1.124988; GRAM $1.380123538781121 and $1.6405205620696306; HPO
  $0.002407052253654585 and $0.0024886774867728225.
- **Held but not valued.** The coverage scan found five jettons in the two wallets that are outside the
  allowlist and therefore contribute $0 to the table: "GRAM Unlock at gramunlock.org" (both wallets),
  "GRAM AT GRAMEVENT.ORG" and TONRAGE (multisig), STAR (legacy wallet). All are unsolicited tokens sent to
  the wallets; none are fund positions. The legacy wallet also holds four **Hipo Bill** NFTs — the receipts
  issued when an unstake has to wait for a validation round, here for rounds between June and November 2025.
  All four hold a zero balance at the snapshot block, and each settlement we traced completed within about a
  day of the bill being issued. They are spent receipts: they carry no claim on the protocol and add nothing
  to the table above.
