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

## Community points

The Club's [Community tab](/club/community/) rewards taking part in [Hipo Chat](https://t.me/hipo_chat), our Telegram group. Each week, from Monday to Sunday (UTC), you earn points for being helpful and appreciated there. The activity comes from Limzo, the bot that keeps Hipo Chat's statistics.

### What the tab shows

- **This week:** your points so far, updated every hour, and your place among the members who earn ("#3 of 25").
- **The three parts** of your points as bars, each with a line saying what counted, for example "8 reactions from 4 members".
- **This week's contributors:** the top 5 by Telegram name, and your own place.
- **Weekly history:** each past week with its points and status: _In review_, _Final_, or _No activity_. If the team changed a week, it shows as adjusted, with the reason.
- **Your Hipo Chat profile** from Limzo: level, streak and badges.

If you can't earn yet, the tab says why: Telegram is not linked, you joined Hipo Chat less than 7 days ago, or your week is not counted (it then still shows your activity, greyed, as "Would count if eligible").

### Who earns

You earn in a week when all of these are true:

- You have a Club account: you logged in to the Club with Telegram.
- You were in Hipo Chat for at least **7 days** before the week started.
- You had no mute or ban in Hipo Chat that week, unless an admin undid it.
- You are not on the team: admins and team accounts don't earn.

### How points are counted

Your week has three parts, up to **120 points** in all:

| Part            | What counts                                                     | Full marks at | Max points |
| --------------- | --------------------------------------------------------------- | ------------- | ---------- |
| Appreciation    | Positive reactions to your messages from other members who earn | 20 reactions  | 60         |
| Helpful replies | Your replies to others that got an answer                       | 10 replies    | 42         |
| Showing up      | Days you wrote something (sticker-only days don't count)        | 7 days        | 18         |

- **The first ones count most.** Each part grows with the square root of what you did, so your first few reactions and replies add the most.
- **At most 3 per person.** From any one member, at most 3 reactions and 3 answered replies count each week, so points come from many people, not from one friend.
- **Showing up needs the other two.** Days count only in a week where you also got some appreciation or helpful replies.
- **Small circles count less.** When most of your reactions come from 3 or more people you also react to, those reactions count at half.

Some values for each part:

| Appreciation | Points | Helpful replies | Points | Showing up | Points |
| ------------ | ------ | --------------- | ------ | ---------- | ------ |
| 5 reactions  | 30     | 1 reply         | 13     | 1 day      | 6      |
| 10 reactions | 42     | 3 replies       | 23     | 3 days     | 11     |
| 20 reactions | 60     | 10 replies      | 42     | 7 days     | 18     |

### Examples

- **A helpful week.** You answer a few questions, and 4 members react to your answers, 2 reactions each: 8 reactions. 3 of your replies get an answer back, and you write on 4 days. That is 37 + 23 + 13 = **73 points**.
- **One fan is not enough.** One friend reacts to 10 of your messages and nobody else does. Only 3 of those reactions count: **23 points** for appreciation. With 1 answered reply and 2 days that adds 13 + 9, so **45 points** in all.
- **Only stickers.** You post stickers every day but nobody reacts and no reply gets an answer: **0 points**. Showing up counts only alongside the other two parts.
- **A full week.** 20 reactions from at least 7 members, 10 answered replies and all 7 days: the **120 points** maximum.

### When a week becomes final

- **Monday to Sunday:** the tab shows your points as they grow, updated every hour.
- **Monday after the week:** your points for the week are counted and the week is _In review_. The team checks for misuse and can correct or void a member's week, always with a reason.
- **Thursday after the week:** the week is counted once more, with any late changes from Limzo, and becomes _Final_.

If the team changes your week, you get a Telegram message with the reason, and the reason shows in your weekly history.

## Seasons

**Season 6** started on **31 October 2026**, and its planned end is **31 December 2026**; the Club shows the date and a countdown. At the end of a season the seasonal upgrades are applied. A suspension that is still running carries its remaining days into the next season.

Profit sharing for HPO holders is a separate stream, paused while the protocol fee is 0%; see [Profit Sharing](/docs/profit-sharing/).

:::note

## What changed in Season 6

Until Season 5 the Club counted every connected wallet together, levels rose through XP from the bot's tasks, quizzes and daily rewards, and selling rewarded HPO reset you to Level 1. From **Season 6** there is one Club wallet per Telegram account, the boost is the level number, and the only rule is the Level minimum. XP, tasks and quizzes ended with Season 5; XP already earned is kept but no longer counts.

Seasons 1–3 ran on an older model with 6 levels, discounted claims at the end of each season and a per-level sell allowance: see [Season 2](/docs/giveaways-and-prizes/hipo-club/hipo-club-season-2/) and [Season 3](/docs/giveaways-and-prizes/hipo-club/hipo-club-season-3/).
:::
