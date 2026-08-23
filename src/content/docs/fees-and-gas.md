---
title: 'Fees & Gas'
description: 'What staking and unstaking with Hipo actually cost: no protocol cut of your stake, a governance fee currently at 0%, and a gas prepayment whose unused part is refunded.'
---

## Hipo takes no cut of your stake

Hipo takes no protocol fee from the GRAM you stake. The only protocol-level fee is the governance fee described below; everything else attached to a staking or unstaking transaction is network gas paid to TON, not Hipo revenue.

## The governance fee

The protocol has a governance fee on validation rewards, set by the [Hipo DAO](/docs/dao/), currently 0%. It applies to validation rewards only, never to your staked GRAM, and while it stays at 0% rewards pass through to hGRAM holders in full. Any change would go through a DAO vote and is visible on-chain — see [Does Hipo take a cut of my rewards?](/faq/#does-hipo-take-a-cut-of-my-rewards)

## Gas prepayments and refunds

When you stake or unstake, a small gas prepayment is attached on top (currently 0.1 GRAM); only a fraction — on the order of a hundredth of a GRAM — is spent and the rest is refunded. The two flows differ in when the refund arrives:

- **Deposit**: the prepayment rides on top of the staked amount, and the unused part returns to your wallet shortly after, as a separate excess transfer.
- **Unstake**: the prepayment rides with the token burn, and little or none returns at request time — the unused remainder is paid out together with the final GRAM withdrawal.

## Reading your own numbers

Because the unstake refund arrives with the withdrawal, a raw withdrawal payout slightly overstates the pure staking reward — it carries the returned gas. To measure a wallet’s real staking return, net all flows per cycle: (deposits sent − deposit refunds) versus (request-time refunds + withdrawal payout). The [Rewards page](/rewards/) tracks your rewards for you.

## Where the current amounts come from

Gas prices are set by the TON network and move with it, so no fixed figure quoted in a document stays accurate. The [Hipo app](/stake/) shows the exact prepayment before you confirm. The authoritative source is the treasury’s `get_treasury_fees` getter, also exposed as the `get_fees` tool of the [Hipo MCP Server](/docs/hipo-mcp-server/).

## Costs outside Hipo

Swapping hGRAM on a DEX replaces Hipo’s gas with the pool’s swap fee plus price impact, and the rate comes from the pool, not the protocol. The current list of pools is on the [DeFi page](/defi/); the trade-offs are covered in [Risks](/docs/risks/).

## More in the FAQ

- [What does it cost to stake?](/faq/#what-does-it-cost-to-stake)
- [Are there any unstaking fees?](/faq/#are-there-any-unstaking-fees)
