---
title: 'Contracts & Audits'
description: 'Hipo’s mainnet contract addresses, the four independent security audits, and where to read the source.'
---

## Mainnet addresses

| Contract                                                                   | Address                                                                                                                      |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Treasury (main protocol contract, receives deposits and holds staked GRAM) | [`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`](https://tonviewer.com/EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ) |
| Parent / jetton master (hGRAM)                                             | [`EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`](https://tonviewer.com/EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w) |
| HPO jetton                                                                 | [`EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`](https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM) |

:::caution
The parent address can change on protocol upgrades — the [contract repository README](https://github.com/HipoFinance/contract) is the source of truth. Always verify an address against official Hipo sources before sending anything to it.
:::

## Audits

Hipo’s smart contracts have been through four independent audits: Quantstamp (April 2025) and ProgramCrafter (March 2024) on the v2 contracts, and TonTech and Daniil Sedov (October 2023) on v1. Every report is published in full at [github.com/HipoFinance/audits](https://github.com/HipoFinance/audits).

## Source code

- **Contracts**: [github.com/HipoFinance/contract](https://github.com/HipoFinance/contract) — written in FunC with the Blueprint toolset; the public test suite is runnable from that repository.
- **MCP server**: [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp) — npm package `@hipo-finance/mcp`, MIT licensed.

## What each contract does

- **Treasury** — the main protocol contract: holds deposited GRAM and loans it to borrowers / validators.
- **Parent** — the jetton master (minter) through which wallets and the treasury communicate.
- **Wallet** — the per-user jetton wallet implementation.
- **Loan** — used for validation loans to borrowers.
- **Bill** — a non-transferable NFT (SBT) issued when an operation cannot complete instantly, such as an unstake while funds are in a validation round.
- **Collection** — the NFT collection the bills belong to.
- **Librarian** — a helper for contract deployment and storage using TON library features.
- **Borrower application** — helps validators borrow from the protocol for validation.
- **Webapp** — helps users stake and unstake.

## Technical documents

- [Architecture](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/architecture.md) — the validation-round state machine and protocol invariants.
- [Integration guide](https://raw.githubusercontent.com/HipoFinance/contract/main/docs/integration.md) — message schemas for wallets and protocols.
- [`schema.tlb`](https://raw.githubusercontent.com/HipoFinance/contract/main/contracts/schema.tlb) — the full TL-B message schemas.
- [Message-flow diagrams](https://github.com/HipoFinance/contract/tree/main/graphs/img) — one image per protocol flow.

For reading live protocol state — exchange rate, fees, round timing — use the [Hipo MCP Server](/docs/hipo-mcp-server/).

## More in the FAQ

- [Has Hipo been audited?](/faq/#has-hipo-been-audited)
- [Where can I verify Hipo transactions?](/faq/#where-can-i-verify-hipo-transactions)
- [Risks](/docs/risks/)
