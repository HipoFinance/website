---
order: 5
section: 'staking'
question: 'Can I stake with a multisig or cold wallet?'
---

Yes. Wallets that can’t sign dapp transactions, such as multisig wallets, stake with a plain transfer: send the GRAM you want to stake, plus 0.1 GRAM as a fee prepayment, to the Hipo treasury with the text comment “d”. The prepayment is generously rounded up — the unused part is refunded, and hGRAM is sent back to the same address.

To unstake everything, send 0.1 GRAM to the treasury with the text comment “w”. To unstake only a part of your balance, connect the multisig to the Hipo app, type the amount and press Unstake: the app builds a raw order — a destination address, a TON amount and a base64 body — that you copy into your multisig, which is what multisig.ton.org calls an “Arbitrary order”. The full procedure, including the treasury address, is in [Staking Without the App](/docs/staking-without-the-app/).
