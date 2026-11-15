# Club Friends tab: a Status column and a "Has earned" filter

**Status:** approved

## Goal

Match the Friends list to the wireframe (`docs/hipo-club-redesign/wireframes/Friends.dc.html`): a
**Status** column that shows a green "Earning" for each friend who earned the member referral HPO in
the last round, and the "Earning" filter renamed to **"Has earned"**: every friend who has earned the
member referral HPO in at least one round.

## In plain terms

The Friends tab lists the people a member invited, with how much boosted HPO each one has earned and
the member's 1% of it. Two things change:

- **A Status column.** Next to each friend's name, a green "Earning" appears when that friend earned
  the member some referral HPO in the most recent reward round (rounds run about every 18 hours). A
  friend who earned nothing for the member in that round gets an empty cell. So "Earning" means
  "earning for you right now", not "has ever earned".
- **The filter "Earning" becomes "Has earned".** That filter already shows every friend who has earned
  the member at least something, ever. Only its name changes, so it no longer clashes with the new
  "Earning" status.

The website can't work out the status by itself, so the Club server adds a yes/no to each friend row
it sends. It gets this by reading data it already keeps about the latest finished round: which
friends' wallets produced a 1% credit for this member. Nothing is written and no amount changes, so
it can't affect anyone's rewards. The worst case is a wrong or missing status label. For example,
right after a new round finishes but before the member's credits have landed, a friend shows empty
for a few minutes.

The website and the server go out separately. If the website ships first, the Status column is just
empty until the server catches up. Nothing breaks.

Decisions: see Open questions (two, both with a recommendation).

## Definitions

**Concepts**

- **Round**: one reward round, about every 18 hours. Each round credits staking HPO to members and 1%
  of a friend's boosted HPO to the friend's inviter.
- **Last round**: the newest round whose payout is finished (state `paid`). A round still paying
  doesn't count, so a half-landed round never shows.
- **Earning (status)**: the friend's wallet produced a referral credit above 0 for this member in the
  last round. A dust wallet whose 1% floors to 0 still gets a credit guard, so the guard alone is not
  enough (Decisions, Q3).
- **Has earned (filter)**: the friend's lifetime credit to this member is above zero (`your_hpo > 0`).
  This is what the server's existing `earning` filter already returns.
- **Filter value**: `has_earned` on the wire (Decisions, Q1); the server still accepts the old
  `earning` as the same filter. The word "Earning" on screen means the status only.
- **Credit guard**: the member `<round>:<wallet>` in `user:{id}:reward_credits`. It is written when
  the credit for that wallet in that round lands with this user. The inviter's set holds one guard
  per paying friend wallet.
- **Figures**: `reward:round:{R}:figures`, wallet → the round's frozen figure, including that
  wallet's `user_id` and `inviter`. Kept until two rounds later (`rewardround.go` `prune`, "R−1 and
  R−2 are kept").

## Context

- Website: `src/components/app/club/FriendsTab.tsx` renders the filters `all` / `earning` /
  `not_staking` and a three-column table (Friend, Their boosted HPO, Your 1%). `api.ts:432-456`
  defines `FriendsFilter` and parses `ClubFriendRow { name, friendHpo, yourHpo }`. Strings are in
  `src/i18n/<locale>/club.json` (`club.friends.filterEarning` = "Earning"). Mock data is in
  `src/components/app/club/mock.ts`.
- Server: `club-server/game/redis/clubread.go:1264-1385` `clubFriends`. The `earning` filter is a
  `ZRANGE` of `user:{id}:invitees_hton_rewards` by score `(0 +inf`, i.e. a lifetime credit above
  zero. Rows carry `name`, `friend_hpo`, `your_hpo`.
- The inviter's 1% is credited in `rewardround.go` `creditInviter` with the guard
  `rewardCreditMember(round, wallet)` = `"<round>:<wallet>"` added to the inviter's
  `UserRewardCredits`. The round's figures and the guards are pruned only two rounds later.
- No per-friend "last round" record exists anywhere today.

## Approach

**Server (club-server, read-only):** in `clubFriends`, after reading the page of rows:

1. Find the last round R: the newest round in `HpoRewardsLogs` whose `reward:round:{R}` state is
   `paid`.
2. `SMEMBERS user:{me}:reward_credits` and keep the guards with prefix `R:`. That set holds at most
   about three rounds of the member's own and their friends' wallets.
3. `HMGET reward:round:{R}:figures <those wallets>`. Keep the figures whose `inviter` is the member,
   whose `user_id` is not the member, and whose 1% is above 0: `inviterShare(htonReward(...))`, the
   payout's own functions, on R's frozen reward rate, `total_coins`, `total_tokens` and the figure's
   hGRAM and `k`. Their `user_id`s are the friends earning in R. A paid R with no frozen rate gives
   no flags. Nothing is read from the chain: the figure holds the balance the round job read at its
   block.
4. Each row gets `earning_last_round: true` when its friend id is in that set. Cache the set for
   10 minutes per account (like `clubReferralTotal`), since it changes only once per round.
5. The reply gains `has_earned_count` (`ZCOUNT invitees (0 +inf`) and `not_staking_count`
   (`ZCOUNT invitees 0 0`), read beside the existing `count`.

A failure in steps 1 to 3 is logged and leaves every flag `false`. The list still loads.

**Website:** a Status column between Friend and Their boosted HPO, showing "Earning" in the success
green token when `earningLastRound` is true and an empty cell otherwise. The filter button label
becomes "Has earned · N", and "Not staking yet" becomes "Not staking yet · N", from the new counts
(like "All · N" today); without a count from an older server the label shows no number. The filter
is sent as `has_earned` (Decisions, Q1 and Q1b).

Rejected: writing a "last earned round" marker per friend in the reward job. It is accurate from the
first round, but it is a write in the reward path, which is money code and needs an audit. The
read-side way gives the same answer from data that is already kept.

## Changes

- `club-server/game/redis/clubread.go`: `ClubFriendRow.EarningLastRound bool \`json:"earning_last_round"\``,
  `ClubFriendsResponse.HasEarnedCount` / `NotStakingCount`, the steps above, and a small cache key in `game/common/key/keys.go`. A test in `clubread_test.go`.
- `website/src/components/app/club/api.ts`: parse `earning_last_round` into `earningLastRound?: boolean`,
  and `has_earned_count` / `not_staking_count` into the friends meta.
- `website/src/components/app/club/FriendsTab.tsx`: the Status column and the filter label key.
- `website/src/components/app/club/mock.ts`: some mock rows earning, some not.
- `website/src/i18n/en/club.json`: `club.friends.colStatus` "Status", `club.friends.statusEarning`
  "Earning", and `club.friends.filterEarning` renamed to `club.friends.filterHasEarned`
  "Has earned · {count}", and `club.friends.filterNotStaking` "Not staking yet · {count}" (plus a
  count-less form for an older server). The other ten locales follow after English approval (`locales` skill).
- `website/CHANGELOG.md` and the club-server changelog: one entry each.

## Acceptance criteria

- [ ] `clubfriends` returns `earning_last_round` on every row. A test with a seeded paid round R
      shows `true` exactly for a friend whose wallet has a guard `R:<wallet>` in the member's credits
      and a figure with `inviter` = the member, and `false` for a friend credited only in R−1, a
      friend never credited, and the member's own wallet.
- [ ] A round still paying is not used as R (test).
- [ ] A friend with a guard in R whose 1% floors to 0 is `false` (test, which fails without the
      check).
- [ ] When the figures of R are missing, the reply is still `ok` with all flags `false` (test).
- [ ] `go build ./...` and `go test ./game/redis/ -run ClubFriends` pass in club-server.
- [ ] Website, mock mode: the table shows four columns in the wireframe order, with a green
      "Earning" on the flagged rows and empty cells on the others, in dark and light mode and at
      phone width (screenshots).
- [ ] `clubfriends` returns `has_earned_count` and `not_staking_count`, equal to the number of rows
      the `earning` and `not_staking` filters return in full (test).
- [ ] The filter buttons read "All · N", "Has earned · N", "Not staking yet · N". "Has earned" lists
      the same friends the old "Earning" filter did.
- [ ] `npm run build` passes, including the i18n gate.

## Risks & rollback

- Extra Redis reads per `clubfriends` call (one SMEMBERS, one HMGET and one round lookup), with the
  result cached for 10 minutes. Small next to the existing per-row HMGETs.
- If the figures shape is misread, the status is wrong, but amounts and the list are not affected.
  It is caught by the tests and by comparing with `club_referral_rounds` on the dev box.
- Deploy order: club-server first. An old server refuses `has_earned` as a bad request, and on the
  new website that leaves the "Has earned" pill doing nothing; the rest of the tab works.
- Rollback: the website can be reverted on its own. The server can be reverted on its own only
  while the old website is live, for the same reason.

## Decisions

- Q1 (2026-11-15, Alireza): first kept as `earning`; changed the same day: the wire value becomes
  `has_earned`, so the server's code matches the screen. The server accepts both `has_earned` and
  `earning` (the live website sends `earning`), so **club-server deploys before the website**.
- Q1b (2026-11-15, Alireza): the label "Activated" became "Has earned", and the wire value
  `has_earned` with it (`activated` was never deployed, so it is not accepted).
- Q2 (2026-11-15, Alireza): the filter buttons show counts, as in the wireframe.
- Q3 (2026-11-15, Alireza): a dust friend whose 1% floors to 0 is not "Earning". Fixed by working
  out the 1% from Redis with the payout's own functions, not by accepting it. Such a friend can still
  count under "Not staking yet", which reads the lifetime total; left as is. Also left as is: a
  wallet paid late by the operator's `reward-round --unread` gets its guard but no figure in R, so
  that friend shows empty for the round although the member was credited (rare, display only).

## Open questions

None.
