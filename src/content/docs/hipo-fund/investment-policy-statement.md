---
title: 'Hipo Fund Investment Policy Statement'
description: "How Hipo Fund is invested: target allocation, risk and concentration limits, custody, liquidity, and how a share of the fund's growth returns to HPO holders."
---

:::caution

**This is a draft under community review. It is not yet in force.**

:::

**Draft v1.5 · For community review and DAO ratification**

---

## At a glance

_The full policy follows. Where the two differ, the numbered sections govern._

**Target allocation.** HPO sits outside the allocation. Everything else:

| Sleeve                                                           | Target | Band   |
| ---------------------------------------------------------------- | ------ | ------ |
| Stablecoin yield, deployed                                       | 45%    | 35–55% |
| Opportunity Reserve — deploys only on a Bitcoin drawdown trigger | 10%    | 5–15%  |
| Bitcoin, held natively                                           | 30%    | 20–35% |
| hGRAM                                                            | 12%    | 8–18%  |
| Operating cash and gas                                           | 3%     | 2–6%   |

**Key limits.**

|                                           |               |
| ----------------------------------------- | ------------- |
| TON ecosystem assets (HPO + hGRAM + GRAM) | ≤ 45% of fund |
| Assets no issuer can freeze               | ≥ 20% of fund |
| Any single protocol, or any single issuer | ≤ 30% of fund |
| Assets outside multisig custody           | 0%            |
| Leverage                                  | Zero, always  |

**What HPO holders get.**

| Channel           | How it works                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Value return**  | Above its high-water mark, the fund returns up to half its accumulated growth to HPO holders, paced at up to 2% of fund value a year. Growth held back by the pacing cap is queued, not forfeited. Paid through Hipo Club revenue sharing or by buying HPO and burning it — the DAO votes the form, not the amount. |
| **Asset backing** | The fund's value as a share of HPO's market cap is published every quarter.                                                                                                                                                                                                                                         |
| **Governance**    | HPO holders vote this policy, every amendment to it, and any sale of the fund's HPO.                                                                                                                                                                                                                                |

**Ten rules.**

1. **No leverage, no derivatives, no market-making.** At any size, ever.
2. **The fund does not buy HPO to hold.** It may buy HPO to burn, funded only from gains — see Sections 2.2 and 8.
3. **The fund is not a source of HPO market liquidity or of operating funds.**
4. **All assets in 2-of-3 multisigs** — one on TON, one on EVM, one on Bitcoin.
5. **Every position must be withdrawable directly from its contract,** without permission from any operator or front
   end.
6. **No market timing.** Rebalancing bands do the buying low and selling high, mechanically.
7. **The Opportunity Reserve deploys only on a trigger** — Bitcoin 40%, 55% and 70% below its trailing 12-month high, in
   thirds.
8. **Nobody is paid to manage this fund.** No management fee, no performance fee.
9. **A report every quarter,** from a single on-chain block, with performance since inception and every limit's current
   value.
10. **The DAO sets the framework; the signers execute inside it.**

**One thing to be clear about.** At this allocation the fund earns roughly 2% a year. Its high-water mark is the capital
contributed to it, approximately $224,056, and no value return is payable until the fund is above that mark. This policy
is built to compound steadily and survive full market cycles, not to recover quickly.

---

## 1. Purpose and origin

Hipo Fund was created in April 2025 from the proceeds of the HPO initial offering, together with HPO claims from Hipo
Club seasons. That capital was not allocated to the team and was not absorbed into Hipo's operating budget. It was
placed in a separate, publicly visible treasury and set aside to work for the Hipo ecosystem and for HPO holders over a
horizon measured in years.

This document sets out how that capital is invested: what the fund may hold, how much of anything it may hold, who
decides what, how value flows back to HPO holders, and how it all gets reported.

A written policy makes decisions repeatable, so the fund's behaviour does not depend on who is paying attention that
month. It makes them reviewable, so the community can judge the process and not only the outcome. And it puts limits in
place before they are needed, when they are easy to agree on.

Once ratified by DAO vote, this policy is binding on the fund's signers.

---

## 2. Mandate and objectives

Hipo Fund is a long-term investment treasury. Its objectives, in priority order:

1. **Preserve capital** across full market cycles.
2. **Grow the fund's real value** over a horizon measured in years.
3. **Return a share of that growth to HPO holders**, sustainably and without consuming principal.

### What Hipo Fund is not

- **Not a trading account.** It does not take short-term positions or attempt to time markets.
- **Not a source of HPO market liquidity.** Providing liquidity for the HPO market is a tokenomics decision funded from
  HPO's treasury and marketing allocations.
- **Not a source of operating funds.** The fund is separate from Hipo's operating budget and cannot be drawn on for
  expenses.

### 2.1 How Hipo Fund returns value to HPO holders

Hipo returns value to HPO holders from its revenue streams, in two established ways: through Hipo Club revenue sharing,
and by buying HPO on the market and burning it. Hipo Fund is intended to become another of those streams.

When the fund grows beyond its high-water mark, a share of that growth is allocated to HPO holders each year under the
rule in Section 2.2. The form it takes — revenue sharing or buy-and-burn — is chosen when a distribution falls due,
using the infrastructure Hipo already operates.

Both forms return real value; they do it differently, and the choice should reflect conditions at the time:

- **Buy-and-burn** permanently reduces HPO supply and benefits every holder without anyone needing to claim. It creates
  the most value when HPO trades below what the fund's assets and the protocol's fundamentals support, since a burn is
  only accretive if tokens are bought below their worth. Its cost is market impact: in a thin market, a portion of the
  spend moves the price rather than buying supply.
- **Revenue sharing** puts every dollar into holders' hands pro rata with no market impact, and is the more efficient
  route whenever HPO is not clearly cheap.

Alongside this, the fund's value as a percentage of HPO's circulating market capitalisation is published in every
quarterly report. It is the share of HPO's valuation backed by assets held outside the token itself, and it is reported
whether it rises or falls.

**A note on scale.** At the fund's current size a value return would be modest, and none is payable while the fund sits
below its high-water mark. The rule matters for what it commits to: it gives HPO holders a defined, published claim on
the fund's growth that scales as the fund grows, and that cannot be changed without a DAO vote.

### 2.2 The value-return rule

**High-water mark.** The total capital contributed to the fund, plus everything the fund has already returned to HPO
holders. It currently stands at approximately **$224,056**. It rises when new capital is contributed, and by the amount
of each value return. It never falls.

**Below the high-water mark, nothing is returned.** Capital is rebuilt first. Paying out below the mark is paying out of
principal.

**Above it**, in each financial year the fund allocates to HPO value return the **lower** of:

- **50% of the fund's value above the high-water mark**, and
- **2% of the fund's total value** at the start of the year

#### Why there are two limits

The two limbs do different jobs.

**The 50% limb decides whether there is anything to return.** It measures the fund against everything ever put into it
or paid out of it, so a year in which the fund does not grow produces nothing — and in no case is more than half of the
fund's accumulated growth paid out. The other half stays invested and keeps working.

**The annual cap decides how fast it is paid.** In most years the cap is the limb that governs; the 50% limb only
applies in the narrow band just above the high-water mark. This is deliberate. A fund that pays out heavily after one
strong year and nothing for the next three serves holders worse than one that pays steadily, and a treasury this size
needs its compounding more than it needs a single large payment.

**The cap paces the payout. It does not cancel it.** Because the high-water mark rises only by what is actually
returned, growth held back by the cap stays above the mark and remains distributable in later years. Nothing that
qualifies is forfeited — it is queued.

_Worked example._ Suppose the fund reaches $300,000 against a high-water mark of $224,056. The growth above the mark is
$75,944, so the 50% limb permits $37,972 — but the cap limits the year's return to $6,000. The high-water mark rises to
$230,056. If the fund's value is unchanged the following year, growth above the mark is $69,944, the cap again permits
$6,000, and it is paid. The capped amount is not lost; it is returned over subsequent years.

#### The amount is not a decision

When the fund is above its high-water mark, the allocation is a calculation performed at the quarterly report, not a
proposal. Once calculated it is set aside for HPO holders, reported as a committed amount until it is paid, and cannot
be reabsorbed into the fund.

**Only the form is voted on.** The signers propose revenue sharing, buy-and-burn, or a split, with reasoning, and the
DAO ratifies the form. A proposal that is not ratified is revised and brought back — the allocation itself does not
lapse. If no form has been ratified within 90 days of the report that triggered it, the allocation is executed as a
buy-and-burn, which needs no external infrastructure and cannot be blocked.

**The formula can only be changed by DAO vote.** The signers can execute a value return within this rule; they cannot
alter, defer or waive it.

#### Conditions

- The fund remains within every limit in Section 7 after the return
- It is funded from income and from proceeds already realised through ordinary rebalancing — never by selling Bitcoin
  below its band, drawing the Opportunity Reserve, selling the fund's HPO, or liquidating a position solely to create a
  payable amount
- If paying the full allocation would move any sleeve outside its band, as much is paid as the bands allow and the
  remainder carries forward to the following year, with the high-water mark rising only by the amount actually paid
- The full calculation is published in the quarterly report, including the high-water mark before and after

---

## 3. Governance and decision rights

| Decision                                               | Who decides                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Amending this policy                                   | **DAO vote** (binding)                                                                                        |
| Changing the value-return formula                      | **DAO vote** (binding)                                                                                        |
| Reducing the HPO position                              | **DAO vote** (binding)                                                                                        |
| Adding an asset class not listed in Section 5          | **DAO vote** (binding)                                                                                        |
| Introducing any manager compensation                   | **DAO vote** (binding) — Section 14                                                                           |
| The form a value return takes                          | Signers propose, DAO ratifies. The **amount** is a calculation under Section 2.2 and is not subject to a vote |
| Adding a new protocol within an approved asset class   | Signers, announced within 7 days                                                                              |
| Deploying the Opportunity Reserve once a trigger fires | Signers, announced within 7 days                                                                              |
| Rebalancing within the bands in Section 6              | Signers, reported quarterly                                                                                   |
| Execution venue, timing and route                      | Signers                                                                                                       |

The DAO sets the framework and the limits; the signers execute inside them. Individual trades are not voted on — a
treasury that needs a vote to rebalance cannot rebalance.

**Announcement.** Any single transaction above **$10,000**, and any change moving a sleeve outside its band, is
announced in Hipo's official channels within 7 days.

---

## 4. Custody

All fund assets are held in multisig wallets. There are three, each with one job.

| Wallet                      | Holds                             | Signing |
| --------------------------- | --------------------------------- | ------- |
| TON multisig `hipofund.ton` | hGRAM, HPO, GRAM for gas          | 2 of 3  |
| EVM Safe multisig           | Stablecoins and lending positions | 2 of 3  |
| Bitcoin multisig            | BTC                               | 2 of 3  |

- All three use the same three signers, all Hipo team members.
- **No fund assets are held in a single-signature wallet.**
- **The fund does not move assets out of multisig to satisfy an eligibility requirement.** If a Hipo system does not
  support multisig wallets, the system is changed rather than the custody arrangement. Multisig support is a
  prerequisite before the fund participates in any distribution mechanism.
- No fund assets are held on a centralised exchange, with a custodian, or in any account controlled by one person,
  except in transit under Section 4.1.
- Bitcoin is held natively, not wrapped. Every wrapper reintroduces a custodian, and this sleeve has no need to be
  productive.

### 4.1 Moving assets between chains

Cross-chain transfers use an on-chain bridge with a verified live route, executed in tranches rather than as a single
transaction.

Where no reliable on-chain route exists, a transfer may pass through an exchange account belonging to a signer, subject
to all of:

- No more than **15% of the fund** in transit at once
- Completed within **72 hours**
- Both legs published in the next quarterly report with transaction hashes on each chain
- Agreed by at least two signers before it starts

This is a fallback, not a default. During transit the assets sit outside multisig control and outside the on-chain
record the fund's transparency depends on. The limits are what make that window narrow enough to accept.

---

## 5. Eligible assets

The fund may hold only the following. Anything else requires a DAO vote.

**Permitted**

- **Bitcoin**, held natively
- **Fiat-backed stablecoins** from issuers publishing reserve attestations — currently USDT, USDC, USDS
- **hGRAM**
- **HPO**, at the existing balance only — Section 8
- **Deposits in blue-chip lending protocols** meeting all of: at least $1B TVL, three or more independent audits, 24+
  months live with no unrecovered loss of user funds, and direct withdrawal per Section 5.2
- **Native gas balances** in operationally necessary amounts

**Not permitted**

- Leverage, borrowing, margin, or any position that can be liquidated
- Perpetual futures, options, or any derivative
- Market-making, liquidity provision, or vaults taking the other side of traders' positions
- **Synthetic dollars whose backing is a derivatives position.** Ethena's USDe was assessed and excluded: its yield
  comes from perpetual funding rates rather than reserves, its short legs sit on centralised exchanges, its reserve fund
  is roughly 1% of supply, and its 7-day unstaking cooldown conflicts with Section 9. It offered no yield premium over
  blue-chip stablecoin lending at the time of assessment. It is a basis trade, not a capital-preservation asset, and
  classifying it as one would misstate the fund's risk.
- Any token with less than $10M of 24-hour trading volume, other than the existing HPO position
- Purchases of HPO to hold — Section 8

### 5.1 Freeze risk, and the floor that manages it

Most of what this fund holds is a claim on a company, and stablecoin and tokenized-asset issuers can freeze a specific
wallet. This is not a reason to avoid such assets — there is no permissionless alternative at scale for stable
purchasing power — but it has to be sized rather than ignored.

- **No single freezable issuer may exceed 30% of the fund.**
- **At least 20% of the fund is held in assets that no issuer, custodian or authority can freeze by unilateral action.**
  Bitcoin is currently the only holding that meets this test.

### 5.2 Direct withdrawal

Every position must be withdrawable directly from the smart contract, without permission from any operator, interface or
intermediary. Before capital is deployed to a new protocol, the signers verify that withdrawal works through direct
contract interaction, independent of the protocol's front end.

A protocol that can gate, pause or condition withdrawal at an operator's discretion is not eligible, regardless of
yield. For a fund with no committed source of new capital, capital that cannot be retrieved is a permanent loss.

### 5.3 Expanding the universe as the fund grows

The list above is narrow because the fund is small: each additional position costs the same setup, monitoring and
reporting effort as a large one while contributing a return too small to matter. That changes as the fund grows.

| Fund size, sustained over two consecutive reports | What becomes available                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Under $250,000                                    | The list above                                                                  |
| $250,000+                                         | The DAO may add **one** further asset class, capped at 10% of the fund          |
| $500,000+                                         | An opportunistic sleeve of up to 10% of the fund, within the prohibitions above |

Each expansion requires a DAO vote. Reaching a threshold makes an addition possible, not automatic.

---

## 6. Target allocation

The HPO position sits outside the target allocation. It cannot be added to and cannot be traded at size, so including it
would force every other sleeve to rebalance around a number the fund cannot act on.

**Non-discretionary holding**

|     |                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------- |
| HPO | 9,023,524.44, held. No purchases to hold. Reductions only under Section 8. **Reference cap 25% of fund.** |

**Discretionary portfolio** — everything else:

| Sleeve                     | Target | Band   | Purpose                                                               |
| -------------------------- | ------ | ------ | --------------------------------------------------------------------- |
| Stablecoin yield, deployed | 45%    | 35–55% | Capital preservation and the fund's income                            |
| **Opportunity Reserve**    | 10%    | 5–15%  | Undeployed capital for major drawdowns — Section 6.1                  |
| Bitcoin                    | 30%    | 20–35% | Long-term store of value; the fund's unfreezable, non-ecosystem asset |
| hGRAM                      | 12%    | 8–18%  | Alignment with Hipo, plus staking yield                               |
| Operating cash and gas     | 3%     | 2–6%   | Transaction costs, buffer                                             |

**On hGRAM.** Its yield is denominated in GRAM, so the position is a directional GRAM holding with a yield attached
rather than an income asset. Part of the reason for holding it is alignment with the protocol the fund belongs to, which
is a legitimate reason. Presenting it as income would not be.

**On Bitcoin.** No return is assumed and none should be. It is sized so that a 70% decline — which Bitcoin has
experienced before — costs the fund roughly 16% of its value. Sized on drawdown tolerance, not conviction.

**Entry.** New Bitcoin positions are built in equal weekly tranches over no fewer than eight weeks. A rule, not a market
view.

### 6.1 The Opportunity Reserve

The fund holds 10% of its discretionary portfolio in stablecoins, undeployed or in same-day-liquid yield, to buy into
severe drawdowns. It deploys **only on an objective trigger**, in thirds, into assets already on the eligible list:

| Trigger                                      | Deploys     |
| -------------------------------------------- | ----------- |
| Bitcoin 40% below its trailing 12-month high | One third   |
| Bitcoin 55% below its trailing 12-month high | One third   |
| Bitcoin 70% below its trailing 12-month high | Final third |

The trailing high uses the daily close series of the fund's published price source. Once deployed, the Reserve is
rebuilt from the stablecoin sleeve over the following four quarters.

**No discretionary deployment.** If the trigger has not fired, the capital stays where it is. The point of a written
trigger is to make the decision in advance, when it is easy, rather than during the conditions that make it hard.

---

## 7. Concentration and risk limits

Measured against total fund value, checked at each quarterly report.

| Limit                                            | Threshold                                   |
| ------------------------------------------------ | ------------------------------------------- |
| Any single protocol                              | ≤ 30% of fund                               |
| Any single stablecoin issuer                     | ≤ 30% of fund                               |
| Any single freezable issuer, all assets combined | ≤ 30% of fund                               |
| Assets no issuer can freeze                      | **≥ 20% of fund**                           |
| Any single non-HPO position                      | ≤ 35% of fund                               |
| HPO                                              | ≤ 25% of fund (reference — Section 8)       |
| Assets outside multisig custody                  | **0%**, except in transit under Section 4.1 |
| TON ecosystem assets (HPO + hGRAM + GRAM)        | ≤ 45% of fund                               |
| Leverage                                         | Zero, at all times                          |

The TON limit is the most important line in this document. The fund's income comes from Hipo, its funding comes from
Hipo, and part of its assets are Hipo's own tokens. A treasury concentrated in its own ecosystem does not buffer a
difficult year for that ecosystem — it amplifies one. The limit keeps the fund useful precisely when it is most needed.

If a limit is breached by market movement rather than by a transaction, the fund has one quarter to bring it back
inside, and the breach is disclosed in that quarter's report.

---

## 8. HPO policy

**The fund does not buy HPO to hold.** The fund's position is already large relative to HPO's market liquidity, and
adding to it converts liquid capital into a holding the fund cannot exit at anything near its marked value. The fund's
job is to grow assets that can be deployed, not to accumulate its own token.

**Buying HPO to burn is a different action and is permitted.** Under Section 2.2 the fund may buy HPO on the market and
destroy it as one of the two forms of returning value to holders. The tokens leave circulation rather than joining the
fund's balance sheet, and it is funded only from gains above the high-water mark — never from capital.

**Reducing the existing position.** The fund's HPO is held. It is the fund's stake in its own protocol, and there is no
way to exit it at size on the open market.

If it is ever reduced, it happens only through an OTC sale to a strategic buyer or a structured sale approved by DAO
vote. **The fund does not sell HPO on the open market, at any size.** Either route requires all of:

- **A DAO vote** approving the sale before execution
- **The use of proceeds stated in the proposal** — holders vote on what happens to the money, not only on whether the
  tokens are sold
- **Full disclosure on completion**, including size, price and any terms attached to the sale

Holders funded the capital that bought this position. The vote and the disclosure requirements are what ensure any sale
happens on terms they have seen and approved in advance.

The 25% cap in Section 7 is a reference level, not a forced sale. If HPO appreciates past it, the fund reports the
breach and the DAO decides whether to act.

---

## 9. Liquidity

- At least **35% of the fund** redeemable to stablecoins within 7 days without material loss
- No more than **10% of the fund** in positions with a lockup longer than 7 days
- No position the fund could not exit within 30 days, other than HPO, disclosed as illiquid in every report

---

## 10. Rebalancing

- **Reviewed quarterly**, alongside the report
- Rebalanced when a sleeve moves **outside its band**, not on a calendar — transaction costs are real against a fund
  this size
- Rebalanced back to the target midpoint, executed over a period where size warrants
- Any rebalancing trade above $10,000 announced within 7 days

**Rebalancing is how this fund buys low and sells high.** When Bitcoin falls below its band, the rule requires buying.
When it rises above, the rule requires trimming. The decision is made in advance and executed mechanically.

**The fund does not attempt to identify market tops or bottoms.** No position is opened, closed or resized on a forecast
or on sentiment. Acting on a market call requires being right twice — on the exit and the re-entry — with a 2-of-3
signing process that cannot move at that speed. The bands and the Opportunity Reserve capture the same intent through
rules that can actually be executed.

---

## 11. Reporting

- A **full report every quarter**, generated from a single on-chain block by
  [`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
  listing the block, exchange rates and every price used, so any reader can reproduce it
- Every report includes: allocation against the Section 6 targets, every Section 7 limit with its current value,
  **performance since inception by Modified Dietz**, a benchmark, the fund's value as a share of HPO's market cap, and
  every transaction above $10,000
- Contributions recorded with the block and price at the moment of receipt
- Limit breaches disclosed whether or not they have been corrected
- Reports published on schedule regardless of what the numbers say

**Pricing.** GRAM and Bitcoin at market price from a published aggregator. hGRAM at the protocol redemption rate — what
the fund would receive by unstaking. HPO at CoinGecko, cross-checked against Hipo's published market cap; thin-pool DEX
quotes are excluded. Stablecoins at 1.0000 by convention.

---

## 12. Review and amendment

- Reviewed **annually**, or sooner on a material change — a large inflow, a new revenue stream, or a limit breach that
  cannot be corrected within one quarter
- Amendments require a **DAO vote**
- Every version published; superseded versions stay online with their dates

---

## 13. Known open items

- **The fund has no committed source of new capital.** hGRAM staking rewards are currently its only active income
  stream. OTC deals and restored protocol revenue are both possible; this policy assumes neither.
- **The HPO position's value is a mark, not a price.** Every report says so and will continue to.
- **The fund's HPO generates no income** while the protocol staking fee is 0%. Reinstating a fee is a separate decision,
  but the two interact: it would give the fund's largest holding a yield while reducing the yield on its hGRAM.

---

## 14. Manager compensation

**Nobody is paid anything for managing Hipo Fund. There is no management fee and no performance fee.**

This is published rather than left unstated, because the absence of a fee is itself a policy, and pre-committing the
conditions for reopening the question prevents an unstructured proposal arriving later.

Norges Bank Investment Management, which manages the sovereign wealth fund Hipo Fund is modelled on, is paid a cost
budget reimbursed up to an annual limit set by the Ministry of Finance — not a share of gains. Its management costs were
0.034% of assets in 2024. Performance-based fees there apply to external managers, not to the manager of the fund
itself.

Two things also argue against one here. A performance fee gives the manager the upside without the downside, which is
the wrong incentive for a small fund with a capital-preservation mandate. And the alignment already exists in a better
form: the signers hold HPO, so if the fund compounds, HPO's backing strengthens — exposure to the whole outcome,
including the downside.

**If the question is reopened**, it requires a DAO vote and may only be proposed when the fund is above **$500,000**,
above its high-water mark, and has held both across **two consecutive quarterly reports**. Any proposal must include: a
performance fee only and no management fee; a hard high-water mark; a hurdle rate above a stablecoin-yield benchmark;
payment in HPO locked for at least 12 months; and an annual cap as a percentage of assets.

**If managing the fund ever requires paid time**, it is paid from Hipo's operating budget as a defined role with a fixed
cost — not from the fund, and not as a share of returns. That keeps compensation separate from investment outcomes,
which is what a capital-preservation mandate requires.
