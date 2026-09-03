---
title: 'Staking Without the App'
description: 'Stake and unstake with Hipo using plain wallet transfers — for multisig, cold and other wallets that cannot sign dapp transactions.'
---

## When you need this

This page is for wallets that cannot sign dapp transactions — multisig wallets and some cold wallets. Everyone else should use the [Hipo app](/stake/), which is cheaper and shows the exact estimate before you confirm. When a multisig wallet connects to the Hipo app, the app shows these same instructions with the addresses and values ready to copy.

## Stake — the “d” comment

Send the GRAM you want to stake **plus 0.1 GRAM** as a gas prepayment to the Hipo treasury:

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

Set the transaction’s text comment to exactly:

```
d
```

The comment must be lowercase, plain text and unencrypted. The prepayment is generously rounded up — only a fraction is spent and the unused part is refunded (see [Fees & Gas](/docs/fees-and-gas/)). The hGRAM is sent back to the same address the transfer came from.

## Unstake everything — the “w” comment

Send 0.1 GRAM to the same treasury address with the text comment:

```
w
```

This unstakes the **entire** hGRAM balance of that wallet. To unstake only a part of it, use a raw order instead — see the next section. The unstake settles under the normal protocol rules, so the Full-unstake timing applies — see [How Unstaking Works](/docs/introduction/how-does-hipo-work/unstaking/) and [How long does unstaking take?](/faq/#how-long-does-unstaking-take)

## Unstake a part — a raw order

A text comment can only ask for everything, because it has nowhere to put an amount. A partial unstake is an ordinary message with a binary body, so it needs a wallet or multisig that can send one — multisig.ton.org calls this an “Arbitrary order”, and its form takes exactly the three values below.

Open the [Hipo app](/unstake/) with your multisig connected, type the amount you want to unstake, and press Unstake. The app builds the order and shows the three values ready to copy:

- **Destination Address** — your own hGRAM wallet contract. This is not the treasury: it is the contract that holds your hGRAM, derived from your multisig address. Verify it on Tonviewer before you sign; the app links to it.
- **TON Amount** — 0.1 GRAM, the same gas prepayment as everywhere else, refunded apart from the fraction spent.
- **Order BOC** — the message body, in base64.

Two things worth knowing. Only your own hGRAM wallet contract accepts this order, so if it is signed from a different wallet by mistake it simply bounces and nothing is burned — unlike the “w” comment, which would unstake whatever balance the sending wallet happens to hold. And if you chose the instant rate, how much can be redeemed instantly moves with every round: sign promptly, or pick the best rate for an order that has to wait for other signatures.

## Burn hGRAM via the minter

You can also redeem GRAM directly by burning hGRAM at [minter.ton.org](https://minter.ton.org/), using the hGRAM master (Parent) address:

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

After burning, you receive GRAM at the current redemption rate. The parent address can change on protocol upgrades — check [Contracts & Audits](/docs/contracts-and-audits/) first.

## Or swap on a DEX

hGRAM pools exist on DeDust, STON.fi, TONCO, GroypFi and swap.coffee — the current list is on the [DeFi page](/defi/). Swap fees and price impact apply.

## Before you send

- Verify the treasury address against [Contracts & Audits](/docs/contracts-and-audits/) — never trust an address from a forwarded message; see [Phishing Awareness](/docs/security/phishing-awareness-and-prevention/).
- The comment must be plain text, exactly `d` or `w`.
- A transfer with no comment, or the wrong comment, is not a stake or unstake request.
- For a raw order, check the destination is your own hGRAM wallet contract and not an address from somewhere else.

## More in the FAQ

- [Can I stake with a multisig or cold wallet?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Fees & Gas](/docs/fees-and-gas/)
