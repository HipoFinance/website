---
title: 'Hipo Fund — On-Chain Treasury'
description: 'The Hipo Fund — an on-chain treasury backing the HPO token.'
---

<figure><img src="/docs/images/hipo-fund-1.jpg" alt="Promotional banner reading 'HipoFund.ton', with a money bag surrounded by Bitcoin, Tether, HPO and TON icons and an upward growth chart."></figure>

## 📌 What Hipo Fund is

Hipo Fund is Hipo's long-term investment treasury. It holds the proceeds from HPO token sales and Hipo Club
season claims, and it is kept separate from Hipo's operating budget.

The idea is borrowed from Norway's oil fund: instead of spending revenue as it arrives, set a portion aside
and manage it for the long term. Hipo Fund exists to build durable value behind HPO, not to cover day-to-day
costs.

Every asset it holds sits on-chain and can be checked by anyone.

---

## 📊 Current status

| Measure                                     | Value                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| **Opening capital (April 18, 2025)**        | $186,963.96                                                            |
| **Capital contributed since**               | ~$37,092 (Season 2 and Season 3 claims)                                |
| **Latest reported value (August 24, 2026)** | $98,776.51                                                             |
| **Return since inception (Modified Dietz)** | −58.4%                                                                 |
| **GRAM over the same period**               | −49.8%                                                                 |
| **Latest report**                           | [August 2026 report](/docs/hipo-fund/quarterly-report-august-24-2026/) |

The fund is below its opening capital, driven mainly by the fall in the GRAM price across a portfolio that
was heavily GRAM-linked in its first year. The full accounting is in the August 2026 report.

We are publishing an **Investment Policy Statement in September 2026**, setting out target allocations, risk
limits, liquidity requirements and rebalancing rules. It goes to the community for review and then to a
binding DAO vote. It is the framework Hipo Fund will be managed under from here.

Exact dates are announced in [Hipo's Telegram channel](https://t.me/HipoFinance) and on
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv).

---

## 🏦 Wallets

Hipo Fund holds assets in two wallets. Both are counted in every report.

**Main wallet — multisig**\
`EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr`
([hipofund.ton](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr))

- Requires **2 of 3 signatures** to move funds
- Signers: two Hipo co-founders and one team member
- Holds the majority of the fund

**Secondary wallet — single-signature**\
`UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG`
([view](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG))

- The fund's original wallet, kept in use after the multisig migration and still holding part of the fund
- Also a proposer on the multisig
- Some Hipo systems, including Hipo Club, do not support multisig wallets, so this wallet is kept for
  eligibility purposes. The Investment Policy Statement sets a limit on how much is held here

:::note[A note on address formats]
TON shows the same wallet in two forms — bounceable (`EQ…`) and non-bounceable (`UQ…`). The last four
characters differ but the account is identical. You may see `UQDa2GcC…_GQu` and `EQDa2GcC…_Dnr` used for the
multisig; they are the same wallet.
:::

---

## 💵 How Hipo Fund is funded

Hipo Fund has never received an allocation from HPO tokenomics. Its capital comes from:

- **HPO token sale proceeds**, including the ILO and OTC deals with strategic investors
- **Hipo Club season claims** (Seasons 2 and 3). Since Season 4, HPO rewards accrue directly to hGRAM
  holders, so there is no seasonal claim window and no further claims of this type
- **hGRAM staking rewards** — currently the fund's only active income stream
- **Profit sharing on the HPO the fund holds**, when protocol revenue sharing is active. The staking fee has
  been 0% since June 6, 2026, so no distributions are currently being made

All HPO held by the fund was bought on the open market.

---

## 💰 Opening report — April 18, 2025

- **Initial capital:** $186,963.96
- **Start of reporting:** April 18, 2025

### 🔸 Initial portfolio allocation

| Asset              | Amount       | Allocation | Value (USD)     | Notes                             |
| ------------------ | ------------ | ---------- | --------------- | --------------------------------- |
| hGRAM              | 34,955.22    | 59.59%     | $111,405.91     | Staked GRAM                       |
| HPO                | 6,754,307.59 | 38.64%     | $72,238.04      | Governance & profit-sharing token |
| Stablecoins (USDT) | 3,304.14     | 1.77%      | $3,304.14       | Capital preservation & dry powder |
| GRAM               | 5.30         | 0.01%      | $15.87          | Direct GRAM exposure              |
| **Total**          |              | **100%**   | **$186,963.96** |                                   |

_Percentages are rounded to two decimals and may not sum to exactly 100._

:::note[Correction, August 29, 2026]
The HPO valuation in this table was previously published as $15,000, which was an error — the four rows did
not sum to the stated initial capital. HPO is now shown at $72,238.04, its market value on April 18, 2025
($0.010695 per HPO), and all four allocation percentages have been recalculated from the USD values so the
table reconciles to $186,963.96. Previously published percentages were 59.28% (hGRAM), 1.76% (USDT), 38.95%
(HPO) and 0.01% (GRAM). The comparison table in the
[August 2025 report](/docs/hipo-fund/quarterly-report-august-1-2025/) has been corrected to match. No
balances changed.
:::

---

## 🔒 How the fund is managed

**Fully on-chain and verifiable**\
Every asset is held in the two wallets above and can be checked by anyone at any time. The fund only holds
assets that can be transparently monitored on-chain.

**Snapshot-based reporting**\
Reports from August 2026 onward are generated by
[`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
which reads every balance from a single TON masterchain block and lists that block, the hGRAM exchange rate
and each price used in the report's Notes. Any reader can re-run the script and reproduce the tables.

The [August 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) and
[December 2025](/docs/hipo-fund/quarterly-report-december-18-2025/) reports predate the script and were
assembled by hand. Their balances have since been checked against the chain and reconcile; their valuations
used different pricing conventions, which is noted in the August 2026 report.

**Regular reporting**\
Hipo Fund publishes a report every quarter. Every report includes performance since inception and a
benchmark. The next report is due in **December 2026**.

**Announced decisions**\
Material portfolio changes are announced in Hipo's official channels, and changes to the fund's strategy go
to a DAO vote.

**Risk-controlled growth**\
The fund is managed for long-term capital preservation and sustainable growth. Target allocations,
concentration limits, liquidity requirements and rebalancing rules are set out in the Investment Policy
Statement.

**Governance**\
HPO holders vote on Hipo Fund's direction through the [Hipo DAO](/docs/dao/) on
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv). The Investment Policy
Statement is the first Hipo Fund policy going to a binding vote. Execution within an approved policy is
handled by the multisig signers; changes to the policy go to the DAO.

---

## ⚠️ Risks

Hipo Fund is a crypto treasury and its value moves with the market. The main risks:

- **Market risk.** The fund's non-stablecoin holdings are exposed to the GRAM and HPO prices.
- **Concentration risk.** The fund's assets are concentrated in the TON ecosystem and in Hipo's own token.
- **Liquidity risk.** The HPO position is large relative to HPO's on-market liquidity. Its reported value is
  the market price times the balance; it is not a claim that the whole position could be sold at that price.
- **Custody risk.** Part of the fund sits in a single-signature wallet.
- **Smart contract risk.** Assets held in DeFi protocols, including hGRAM, carry the risk of a contract
  failure.

These risks are managed, not eliminated. The Investment Policy Statement sets limits on each of them.

---

## 💜 For the Hipo community

Hipo Fund belongs to the community. Its growth supports the value and sustainability of HPO and every HPO
holder. We are committed to regular, transparent reporting and open governance.

Want to suggest strategies, DeFi tools or TON projects for the fund? Join the conversation in
[@hipo_chat on Telegram](https://t.me/hipo_chat).
