---
title: 'Risks'
description: 'The risks of staking GRAM with Hipo — smart contract, validator, liquidity, reward variability and phishing — and what the protocol does about each.'
---

Staking and DeFi always involve risk, and Hipo does not guarantee returns. This page lists the risks of staking GRAM with Hipo, what the protocol does about each, and what you can do yourself.

## Smart contract risk

Bugs or vulnerabilities in smart contracts may affect funds. Hipo’s contracts are open source and have been through four independent audits — Quantstamp (April 2025) and ProgramCrafter (March 2024) on the v2 contracts, TonTech and Daniil Sedov (October 2023) on v1 — and are written in FunC with Blueprint, with a public test suite. Verify the addresses you interact with yourself against [Contracts & Audits](/docs/contracts-and-audits/).

## Validator and staking risk

Staking rewards depend on validators participating correctly in TON validation rounds. Before a validator can borrow staked GRAM, it must lock collateral covering the maximum slashing penalty for the round plus the reward it promised, so a penalty comes out of that collateral, not out of staked GRAM. Underperformance can still show up as a lower reward for that round — see [Validators & the Marketplace](/docs/introduction/how-does-hipo-work/validators/) and [What happens if a validator underperforms?](/faq/#what-happens-if-a-validator-underperforms)

## Liquidity risk

An Instant unstake succeeds only when the protocol is holding enough free GRAM to cover it; the [app](/unstake/) shows the maximum currently available. A Full unstake always goes through but settles after the current validation round — in the worst case the wait can reach about 36 hours. Exiting through a [DEX](/defi/) instead depends on pool liquidity and carries price impact — see [Why is Instant unstaking sometimes unavailable?](/faq/#why-is-instant-unstaking-sometimes-unavailable)

## Reward variability

The reward rate changes over time with validator bids and network conditions, and no fixed return is promised. Live and historical figures are on the [Stats page](/stats/), never in this page.

## Phishing risk

Use only official Hipo links, and verify every wallet prompt before signing. The official channels and contract addresses are listed on [Phishing Awareness](/docs/security/phishing-awareness-and-prevention/) and [Contracts & Audits](/docs/contracts-and-audits/).

## What Hipo does not promise

- No fixed returns — rewards vary with each validation round.
- No risk-free staking — the risks above always apply.
- No instant native withdrawal in every case — Instant is conditional on protocol liquidity.

## More in the FAQ

- [Can I lose my funds?](/faq/#can-i-lose-my-funds)
- [Is Hipo safe?](/faq/#is-hipo-safe)
