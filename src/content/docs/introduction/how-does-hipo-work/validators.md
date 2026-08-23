---
title: 'Validators'
---

## Lending GRAM Tokens to Validators

1. **Permissionless Validator Model**: Hipo lends staked GRAM to validators through an open model — any validator can bid, with no approval from Hipo.
2. **Validator Auction Model**: in each validation round validators bid to borrow staked GRAM by submitting the reward rate they will pay. Hipo's contracts pick the best bids automatically, so stakers get the best rate available that round.
3. **Secure Process**: All processes, including borrowing staked GRAM and distribution of rewards, are safely executed through Hipo's smart contracts. The protocol has undergone [security audits](https://github.com/HipoFinance/audits) to ensure the integrity and safety of user funds.
4. **Validator Collateral**: a borrowing validator must lock GRAM of its own covering the maximum slashing penalty for the round plus the reward it promised. A penalty is taken from that collateral, not from staked GRAM.

<figure><img src="/docs/images/introduction-how-does-hipo-work-validators-1.jpg" alt="Diagram: the Hipo protocol lends GRAM to a validator, which validates on TON and returns the GRAM plus staking rewards."></figure>
