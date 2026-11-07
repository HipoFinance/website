---
title: 'Hipo Club'
description: 'Boosted HPO for stakers who hold'
---

Hipo Club adds boosted HPO on top of your staking rewards. Your level sets the boost, from 1× at Level 1 to 10× at Level 10, and the Club rewards members who keep the HPO it pays them.

The Club is at [hipo.finance/club/](/club/), and in Telegram it is the Club tab of the official [@HipoApp](https://t.me/HipoApp) bot.

## How it works

The hGRAM you hold earns HPO every validation round, roughly every 18 hours. The amount is the GRAM value of your hGRAM, times the HPO reward rate, times your level's boost. hGRAM counts both in your wallet and in [supported liquidity pools](/defi/). The rates and what they work out to are in [Hipo Rewards](/docs/introduction/hipo-rewards/).

There are **10 levels**, and the boost is the level number:

| Level | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Boost | 1×  | 2×  | 3×  | 4×  | 5×  | 6×  | 7×  | 8×  | 9×  | 10× |

## Your account and your Club wallet

Your level belongs to your **Telegram account**, together with your Level minimum, your unclaimed HPO and your invited friends. One wallet at a time, your **Club wallet**, earns at your level's boost and receives your claims.

- **Linking.** Log in with Telegram and sign a free proof in your wallet. Telegram is needed to claim, upgrade, change wallets and invite friends.
- **Changing your Club wallet.** You can switch to another wallet whenever you like; you sign with the new wallet and confirm. Your level and unclaimed HPO stay with your account. Claiming is off for a couple of minutes after a change. A wallet that is already another account's Club wallet, or an exchange or pool address, cannot be linked.
- **Other wallets.** A wallet that is not your Club wallet earns at 1×, once it is registered by opening the Club with it connected. If it later becomes your Club wallet, what it earned joins your account. See [Using Multiple Wallets](/docs/wallets-and-rewards/).
- **A different wallet connected on the Stake page.** The Club never switches by itself. It asks whether to switch, reconnect your Club wallet or decide later. Until you choose, your Club wallet keeps earning, and claims and upgrades are paused.

## Claiming

You can claim your boosted HPO once you have **100 HPO**, for a **1 GRAM** fee. A claim takes your whole balance and pays it to your Club wallet. There is no claiming window and no discount: rewards accrue every round and can be claimed whenever you are over 100 HPO.

## Your Level minimum

Everything you claim adds to your **Level minimum**. To keep your level, keep at least that much HPO in your Club wallet and its supported liquidity pools. HPO in your other wallets does not count.

- **24 hours of grace.** If you drop below the minimum, you have 24 hours to get back above it. Your level is safe and you keep earning at your full boost.
- **Up to 7 days suspended.** After the grace, your level is suspended: you keep it, but earn at 1×. Hold the minimum again within 7 days and your level returns at once.
- **Back to Level 1.** If the 7 days pass, you move to Level 1 and your old minimum is cleared.

Selling HPO is not penalised by itself. What matters is only whether your Club wallet holds your minimum. The Club sends you a Telegram alert when you drop below it.

## Moving up a level

There are two ways to move up, and they stack, up to Level 10:

- **Seasonal upgrade (free).** Claim at least once during a season and be above your Level minimum when it ends, and you move up one level when the next season starts.
- **Instant upgrade.** Pay a fee in GRAM from your Club wallet to hipo.ton and move up one level straight away. The new boost applies from the next round. You can upgrade while suspended.

| Upgrade to level | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10    |
| ---------------- | --- | --- | --- | --- | --- | --- | --- | --- | ----- |
| Fee (GRAM)       | 20  | 40  | 60  | 100 | 160 | 260 | 420 | 680 | 1,100 |

## Inviting friends

When friends you invite earn boosted HPO, you earn **1%** of it, added to your claimable balance. Once claimed, it adds to your Level minimum like any other claim.

## Seasons

**Season 6** started on **31 October 2026**, and its planned end is **31 December 2026**; the Club shows the date and a countdown. At the end of a season the seasonal upgrades are applied. A suspension that is still running carries its remaining days into the next season.

Profit sharing for HPO holders is a separate stream, paused while the protocol fee is 0%; see [Profit Sharing](/docs/profit-sharing/).

:::note

## What changed in Season 6

Until Season 5 the Club counted every connected wallet together, levels rose through XP from the bot's tasks, quizzes and daily rewards, and selling rewarded HPO reset you to Level 1. From **Season 6** there is one Club wallet per Telegram account, the boost is the level number, and the only rule is the Level minimum. XP, tasks and quizzes ended with Season 5; XP already earned is kept but no longer counts.

Seasons 1–3 ran on an older model with 6 levels, discounted claims at the end of each season and a per-level sell allowance: see [Season 2](/docs/giveaways-and-prizes/hipo-club/hipo-club-season-2/) and [Season 3](/docs/giveaways-and-prizes/hipo-club/hipo-club-season-3/).
:::
