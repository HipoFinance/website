# Hipo Club redesign: the plan

**Status:** agreed by Behrang on Telegram, 2026-10-20: Track A go; decisions 1, 3, 4, 5 and 6 as
recommended; Community (B5) after the Club tab is live. Season 5 ends 2026-10-30 09:00 UTC and
Season 6 starts at once. Nothing is committed or pushed.

Sources: mili's handoff bundle v6 (`SPEC.md`, the wireframes, the canvas notes) and a read of the
three repos as they are today: `club-server` (5cd5997), `club-web` (7d500aa), `website` (90b86fe).

## The answer first

Two tracks, because Season 5 ends on Oct 30 and the redesign cannot land by then.

- **Track A, this week:** a small Season 5 close-out. The current Rewards page tells each member
  whether their claim counted for next season, shows the countdown, and says that XP ends with the
  season. One read-only field on the server, one card on the website, one banner in the Mini App,
  and the season-5 wrapup command ready for Oct 30.
- **Track B, Season 6:** the Club section on hipo.finance, built from the spec, phase by phase,
  each phase with its own spec and review. The Mini App is retired in favour of the website's
  existing Telegram mode, which is what Behrang asked for.

Before either track, seven places where the spec and the live code disagree need a decision. They
are listed first because some of them change what Track A should say to members.

## What exists today

- **club-server** (Go, Redis). One binary, three processes: `api` (a WebSocket authenticated by
  Telegram Mini App initData, plus the public `GET /wallet-rewards` the website reads, no auth),
  `jobs` (reward rounds, LP positions, payouts; it holds the `hipo.ton` seed and pays claims),
  `bot` (welcome card, admin commands, operator alerts). Deployed as an image pinned in the
  operation repo; a person deploys.
- **club-web** (Vite, React, MobX, Tailwind 3). The Mini App at club.hipo.finance. Talks only to the
  WebSocket. No i18n, one 5,300-line model, and XP, tasks, quiz, daily rewards and tug-of-war still
  in it. Published through the public `club-web-build` repo.
- **website** (Astro, 11 locales). `/rewards/` is a React island page reading `/wallet-rewards`.
  Its Claim button is a link to the Telegram bot, not a transaction. The island already has a
  Telegram Mini App mode (`TmaApp`, bottom tabs), which Track B reuses.

## Where the spec and the live code disagree

Each needs a decision. My recommendation is in bold.

1. **Instant upgrade fees.** Spec table: 20, 40, 60, 100, 160, 260, 420, 680, 1,100 GRAM. Live
   table in `game/clublevels.go`: 0, 20, 40, 60, 80, 100, 150, 200, 250, 300. The jobs process
   accepts only the exact live amount, so "200 for 7 to 8" is correct today and the Mini App shows
   what the server sends; nothing is wrong on the client. **Change the table at the Season 6
   start, not mid-season, and say so in the docs.** It is a one-table edit on the server.
2. **Claim minimum.** Resolved: it is 100 HPO on `main` (commit 9fa4197) and in the deployed image
   (the operation pin is 42f1dbb, the current head). The first draft of this plan said 1,000 because
   it was read from a local clone 11 commits behind; corrected 2026-10-20. A fee paid with less than
   100 HPO accrued is still lost after the 24-hour hold-back, so Track A's card says so.
3. **Telegram for claiming.** Spec: Telegram is required to claim. Live: a claim is a 1 GRAM message
   from the wallet to `hipo.ton`; no Telegram, no account needed, the wallet is paid. **Keep the
   claim wallet-only.** It works from the website through TonConnect with no new auth, so the
   claim flow is not blocked on Telegram Login. The seasonal level effect is shown only when the
   wallet maps to an account. This is mili's open question 3; it needs her yes.
4. **Level minimum.** Spec: cumulative claimed HPO. Live: `airdrop_to_retain`, a bar that payouts
   raise, the 1 %/day ratchet raises, and a penalty clear rewrites. The two differ, which is the
   1,590 % versus 150 % holding ratio. **At migration, set each account's minimum to the sum of its
   past payouts** (`hton_reward_withdrawals.sent` over the account's wallets). Referral and
   community HPO count from then on.
5. **One wallet per account.** Live: up to 6 wallets; unclaimed boosted HPO accrues per wallet,
   not per account; the holding check sums every wallet the account owns. **At migration the
   `current_wallet` becomes the account's wallet. The other wallets keep accruing at 1.0× as
   wallet-only members, claimable from that wallet on chain as today.** No balance moves in the
   migration. Moving accrual to the account (the spec's "unclaimed HPO belongs to the account") is
   a payout-path change and gets its own spec and two audits.
6. **Referral 1 %.** Live: each round credits the inviter's 1 % to a user-level field
   (`user:{id}.hton_sum_rewards`). Both payout sweeps read wallet-level fields only. I found no path
   that pays the user-level field out, so referral HPO may never have been paid. **Check against
   production data (read-only) before the Friends tab promises "Referral HPO earned", and decide
   whether to pay the backlog.**
7. **Seasons.** Live: no season record, no end date on the server (club-web hard-codes Oct 30; the
   `claimableseason` message still says 2025-11-27), no rollover job; each season was closed with a
   one-off command, season 4's rule being "+1 level for a claim since the season start".
   **Add a season record and a rollover job in Track B; close Season 5 with a `wrapup-season5`
   command in Track A.** Season 6 dates are mili's.

Two more facts for the spec's author, no decision needed:

- `HPOrewardRate` is not 0.0021902 and not a constant. It is an admin setting in Redis, bounded,
  set by the bot's `/rewardrate`, and `/wallet-rewards` already returns it. The UI reads it from
  there.
- The 1 %/day penalty sets the coefficient to 1.0× and blocks upgrades, but never lowers
  `club_level`. So "level stays, earn at 1.0×" is already what suspension looks like; only the
  timing (grace, 7-day window, reset) is new.

## Track A: Season 5 close-out

Goal: a member who claimed sees that it counted. Everyone sees the end date and that XP ends.
Ships within the week if the decisions above do not block it.

- **A1, club-server, read-only API field.** `GET /wallet-rewards` adds `hton_reward_withdrawals`
  (already stored per wallet: request time, amount, fee, tx hash), `season` (number 5, start
  2026-06-09 12:00 UTC, end 2026-10-30 09:00 UTC), and `penalty_active`. No money path. One day with tests, then image,
  pin, deploy by a person.
- **A2, website, a Season 5 card on `/rewards/`.** Countdown to Oct 30. One of: "Claimed this
  season on Oct 3, 1,204 HPO. You move to Level 8 next season" / "No claim recorded this season.
  Claim before Oct 30 to move up" / "A holding penalty is active. Clear it before Oct 30 or the
  upgrade does not apply". Past claims with tx links. The claim caption split into its two streams
  (spec bug 3). English first, then the 11 locales. Two to three days.
- **A3, club-web, one banner.** "Season 5 ends Oct 30. XP ends with it. From Season 6, Hipo Club
  lives on hipo.finance." Half a day. Optional.
- **A4, club-server, `wrapup-season5`.** Season 4's rule plus "no active penalty at rollover" if
  mili confirms the new condition applies to Season 5, plus the XP reset. Run by a person after
  Oct 30. One day.
- No money path changes in Track A.

## Track B: the redesign, for Season 6

Sizes are rough, for one developer with the agent team.

- **B1, club-server, account model and rules engine. Large, 2 to 3 weeks.** Season record and
  rollover job. Level minimum as cumulative claimed, with the migration from payout history.
  Holding state machine replacing `hporetention`: 24 h grace, 7-day suspension at 1.0×, restore,
  expiry to Level 1 with the minimum cleared; carried across rollover. The six Telegram alerts
  through the existing notifier. One wallet per account, the change-wallet flow and the conflict
  rule. Referral and community streams as claimable streams. Fee table per decision 1. All behind flags, with the Redis test harness the repo already has.
  Account-level accrual (decision 5) is its own spec with two audits.
- **B2, club-server, website auth and a JSON API. Medium, 1 to 2 weeks.** Telegram Login Widget
  verification (a different HMAC from initData), a session token, the existing `ton_proof` link
  (already allowed for `hipo.finance`), the conflict response. JSON endpoints for the Club: overview
  with every state A to G computed server-side (including "Buy X HPO to reach #N"), rewards history,
  friends, leaderboard with the privacy rules, claim preview, revenue-share withdraw, alerts and
  hide-name settings. REST with a bearer token rather than the WebSocket, because the island already
  polls REST and the WebSocket protocol is shaped for the Mini App.
- **B3, website, the `/club/` section. Large, 3 weeks English plus 1 week locales.** Routes
  `/club/`, `/club/rewards/`, `/club/friends/`, `/club/community/` in 11 locales, static shell, SEO,
  sitemap, nav in its five places, `/rewards/` redirect. Overview states A to G and the modals,
  Rewards tab with the base GRAM history ported, Friends, Leaderboard. Claim and instant upgrade are
  on-chain messages sent through TonConnect, revenue-share withdraw is an API call; every amount and
  fee comes from the API. New send functions go on the money map. Can start against a mocked API
  while B1 and B2 are built.
- **B4, Mini App. Medium, 1 week.** Retire `club-web`: point the bot's WebApp button at
  `hipo.finance/club/` in the website's Telegram mode, which already exists, with initData auth,
  which the server already has. Keep club.hipo.finance as a redirect for a while. The alternative,
  rebuilding club-web on the new design, doubles the UI work and has no i18n; not recommended.
- **B5, Community and Limzo. Medium to large, in parallel, gated on Limzo.** One adapter interface
  with a fake adapter for tests, the weekly points job with every number as an admin setting in
  Redis (the pattern the reward rate uses), the admin tool as bot commands (the admin bot exists),
  the points-only switch and the `club.community` flag. I can draft the Limzo data request from
  spec section 9 on Behrang's go.
- **B6, cleanup. Small.** Remove XP, tasks, quiz, tug-of-war and daily rewards from the server and
  bot; archive `club-web` and `club-web-build`; the docs list for Alireza; `llms.txt`, the FAQ prose,
  the money map.

Order: A now. Then B1 and B2 on the server while B3 starts on the website against the wireframe
states. B4 after B3. B6 last. B5 (Community, Limzo) after the Club tab is live, per Behrang on
2026-10-20. Roughly 8 to 10 weeks of build time in total (not a season length), so Season 6
cannot start with all of it. Recommended Season 6 launch set: B1 rules, B3 Overview and Rewards, B4.
Friends, Leaderboard and Community follow during the season. If B1 is not ready at the rollover,
Season 6 starts on today's rules and the new holding rules switch on at a dated, announced moment.

## Process

- Each phase gets its own spec with `/team:spec` in its repo. The fee table, account-level
  accrual and the payout destination on a wallet change are money paths: two audits each, without
  asking.
- Before reading a repo for a plan or a change, fetch and compare with `origin/main`. The first
  draft of this plan was wrong about the claim minimum for that reason.
- The handoff bundle goes to `docs/hipo-club-redesign/` in the website repo with the `CLAUDE.md`
  snippet, as mili asked. That is a commit, so on Behrang's word.
- Nothing is pushed without Behrang's word. Every deploy is a person's.

## Decisions taken

- 2026-10-20, Behrang: fee table changes at the Season 6 start, no price change mid-season.
- 2026-10-20, Behrang: claiming stays wallet-only; which Telegram users claimed is derived from
  the wallet's `user_id`, as the season-4 wrapup already does.
- 2026-10-20, Behrang: level minimum migrates from payout history; multi-wallet accounts keep the
  current wallet, no balances move.
- 2026-10-20, Behrang: Community and Limzo come after the Club tab is live.
- 2026-10-20, production check by Behrang (read-only): 890 users hold an unpaid referral balance,
  1,953.41 HPO in total; the largest five are 507.6, 285.7, 158.7, 146.9 and 127.4 HPO. The field is
  never zeroed, so this is everything credited since 2025-11-15.
- 2026-10-20, Behrang: decision 6, the referral backlog is paid through B1, when referral becomes
  a claimable account stream. No one-off payout, nothing written off. B1's spec carries the
  migration of `user:{id}.hton_sum_rewards` into that stream.
- 2026-10-20, Behrang: Season 5 ends 2026-10-30 at 09:00 UTC; Season 6 starts immediately after.
  The start is 2026-06-09 12:00 UTC (Behrang, 2026-10-21: the Mini App's constant; the sweep job was off
  from Jun 2 to Jun 9 ~11:00 UTC, so no claim sits near the boundary).
- 2026-10-20, session's call (Behrang left it open): the "no active penalty at rollover"
  condition applies to the Season 5 wrapup, with a flag to drop it on the day.
