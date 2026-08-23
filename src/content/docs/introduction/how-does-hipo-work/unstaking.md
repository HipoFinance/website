---
title: 'Unstaking'
---

### Unstaking GRAM Tokens on Hipo

1. **Unstake When You Want**: you can request an unstake at any time; how quickly it settles depends on whether you choose Full or Instant (step 3).
2. **Initiate Unstaking**: Simply go to the Hipo App and enter the amount of Hipo Staked GRAM (hGRAM) you want to unstake.
3. **Choose Full or Instant**: Decide how the unstake is processed. **Full** is settled after the current validation round ends and gives you the better exchange rate, since your GRAM keeps earning until then. **Instant** is processed straight away at a slightly lower rate, and succeeds as long as Hipo holds enough free GRAM to cover it. The app shows the largest amount you can unstake instantly.
4. **Confirm Transaction**: Confirm the transaction on your wallet, and you'll receive your unstaked GRAM and any accrued rewards.

<figure><img src="/docs/images/introduction-how-does-hipo-work-unstaking-1.jpg" alt=""><figcaption></figcaption></figure>

### Unstaking hGRAM (Without Using the Hipo App)

If you want to unstake your hGRAM without using the Hipo app, you can use one of the following methods:

#### 1. Swap on **TON** DEXs

You can simply swap your hGRAM on major TON decentralized exchanges such as:

- STON.fi
- DeDust

This is the easiest option for immediate liquidity, but swap fees will apply.

---

#### 2. Treasury “w” Command (Unstake Entire Balance)

You can unstake your full hGRAM balance by sending a small amount of GRAM (e.g. 0.1 GRAM) from the wallet holding your hGRAM to the Hipo treasury address:

**Treasury Address:**

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

**Important:**

- In the transaction comment, write exactly:

```
w
```

Once processed, all hGRAM from that wallet will be unstaked and returned according to the protocol rules.

---

#### 3. Burn hGRAM via Minter

You can also burn your hGRAM to redeem your underlying GRAM directly using the TON minter:

<https://minter.ton.org/>

Use the hGRAM master address:

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

After burning your tokens, you will receive your GRAM back according to the redemption rate.
