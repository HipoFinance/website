# A Season 5 card on the Rewards page

**Status:** implemented

Track A2 of the Hipo Club redesign plan (`docs/hipo-club-redesign/PLAN.md`). Behrang agreed to
Track A on Telegram, 2026-10-20. Depends on the club-server spec
`specs/season5-closeout-api-and-wrapup.md` (the four new fields on `/wallet-rewards`).

## Goal

A member who claimed boosted HPO this season sees on `/rewards/` that it counted for the seasonal
level-up; one who did not sees what to do before Oct 30.

## In plain terms

The Rewards page gets one new card at the top, "Season 5". It shows when the season ends (Oct 30,
09:00 UTC, shown in the reader's time zone) and how many days are left, then one of three
messages for the connected wallet: you claimed on this date and move up a level next season; no
claim recorded, claim before the end to move up; or a holding penalty is active, clear it before
the end or the upgrade will not apply. Under it, the wallet's past claims with a link to each
transaction.

The claim button's caption also changes: instead of "11.23 GRAM + 64.18 HPO" on one line it
shows the boosted HPO and the revenue-share GRAM as two labelled lines, because they are two
different claims.

The card appears only once the backend has shipped the new fields; until then the page is as
today. English first, then the eleven locales. No rewards logic changes on the site.

Risk: low. Worst case a member reads a wrong status because the backend's rule and the website
disagree, which is why the yes/no comes from the backend. No decisions needed.

## Definitions

**Concepts**

- **Claimed this season**: `claimed_this_season` from `/wallet-rewards`, decided by the backend
  for the connected wallet. The site never computes it.
- **Season**: `season {number, start, end}` from the same response, unix seconds. For Season 5
  `end` is 2026-10-30 09:00 UTC (1793350800); the end is a moment, not a day, so the card shows
  date and time.
- **Penalty**: `penalty_active` from the same response.
- **Past claims**: `hton_reward_withdrawals`, records of `request_time`, `claim_time` (the member's
  on-chain claim time, present for claims swept after the backend change of 2026-10-21; the site
  prefers it over `request_time`, as the backend's season rule does), `sent` (HPO), `fee` (GRAM),
  `tx_hash` (may be empty while unpaid).
- **Days left**: whole days from now to `season.end`, rounded up, never below 0. When less than
  24 hours remain the card shows hours left (rounded up) instead; the branch is on the remaining
  time, not on the rounded day count.

## Context

- `src/components/app/Reward.tsx` renders the page: the HPO card, the claim CTA (a link to the
  Telegram bot, `:25-39`), and the "Recent rewards" card. The same component serves the Mini App
  (`tma/TmaApp.tsx:45`), where the CTA sits above the rows.
- `Model.loadWalletRewards` (`src/components/app/Model.ts:2302-2361`) parses the response into
  `WalletRewards` (`:86-97`). `claimableRewardsFormatted` (`:1947-1965`) builds the one-line
  caption from `hpoSumRewards` (GRAM) and `htonSumRewards` (HPO).
- Strings live in `src/i18n/<locale>/app.json` under `app.reward.*`; eleven public locales
  (`src/i18n/registry.mjs:22-36`); `scripts/check-i18n.mjs` fails the build on a missing key.
- Dates go through `model.formatDate`, numbers through `model.formatNumber`, units through
  `model.withUnit`; Latin tokens in RTL copy through `model.isolate` or the `num` utility.
- Transaction links use `https://tonviewer.com/` (`Model.ts:1504`, `VerifyRoute.astro:225`).
- `/rewards/` has a header-only static shell, so no mirror changes.

## Approach

Parse the four fields as optional; a `season` getter on the Model returns `undefined` until they
arrive. A `SeasonCard` in `Reward.tsx`, rendered above the HPO card when the wallet is connected
and `season` is defined. Its status is one of `claimed`, `notClaimed`, `penalty` (penalty wins
over the other two, because the upgrade would not apply). At Level 10 the `claimed` line says the
level is the top one. The past-claims list shows every record newest first, with a tonviewer link
when `tx_hash` is set.

The caption split reuses the existing getter: it returns two strings instead of one.

Defensive parsing, after review: `season` is kept only when its three numbers are finite; a
record whose `request_time` is missing, non-numeric or 0 (the backend writes 0 when a reference
does not parse) keeps an unknown time, shown as "—" and never counted as in-season; list entries
that are not objects are dropped; the "claimed" line names the newest record inside the season,
not simply the first in the list; `claimed_this_season` absent while `season` is present hides
the card rather than showing "no claim"; a unix second beyond the Date range (microseconds, or a
server bug) in a claim or in the season bounds is treated as unknown rather than rendered, because
an invalid Date throws in the date formatter (found by the re-check of 2026-10-21). The claim hint says a claim needs 100 HPO and costs 1
GRAM, so nobody is invited to claim what cannot be claimed.

Rejected: computing "claimed" from the records on the site. The rule stays on the backend, with
the wrapup command.

## Changes

- `src/components/app/Model.ts` — `WalletRewards` gains `season?`, `penaltyActive?`,
  `claimedThisSeason?`, `claims?: Claim[]`; parsing in `loadWalletRewards`; getters
  `seasonDaysLeft`, `seasonEndFormatted`, `seasonStatus`, `lastClaimFormatted`;
  `claimableRewardsFormatted` returns `{ hpo?, gram? }`.
- `src/components/app/Reward.tsx` — `SeasonCard`; the caption renders the two lines.
- `src/i18n/en/app.json` — `app.reward.season.*` keys: title, endsOn, daysLeft, hoursLeft,
  claimed, claimedTop, notClaimed, claimHint, penalty, pastClaims, claimRow, viewTx;
  `app.reward.claimableHpo`, `app.reward.claimableGram`.
- `src/i18n/<locale>/app.json` for ar, de, es, fa, fr, id, pt, ru, tr, uk — the same keys, then
  `node scripts/check-i18n.mjs --update-hashes <locale>`.
- `CHANGELOG.md` — one entry.

## Acceptance criteria

- [x] `npm run build` passes (the i18n gate included: 620 pages, 2026-10-21, after the ten locales got
      the 14 keys) and `node --experimental-strip-types scripts/i18n-selftest.mjs` passes (18 groups).
      `npx tsc --noEmit` reports nothing in the two changed files.
- [x] With the production API (no new fields yet), `/rewards/` renders exactly as today apart from
      the caption split.
- [x] With a mocked response carrying the fields (checked in a browser through CDP, see the
      memory note on verifying client-only pages): the card shows "Season 5", the end date with
      its time (09:00 UTC in the reader's zone) and the days left, hours left under one day; `claimed_this_season: true` shows the claimed line with the last claim's date and
      amount; `false` shows the not-claimed line and the claim hint; `penalty_active: true` shows
      the penalty line whatever the other two say.
- [x] Each past claim shows its date (`claim_time` when present, else `request_time`), HPO amount and fee; a record with `tx_hash` links to
      tonviewer, one without has no link.
- [x] The caption shows "Boosted HPO ready: N HPO" and "Revenue share: N GRAM" as two lines, each
      only when above the 0.01 threshold.
- [x] At phone width and in the Mini App the card does not scroll horizontally (a tx hash wraps).
- [x] Every released locale has every new key; `check-i18n` reports no missing key (`i18n: ok`,
      2026-10-21; de, fa, ar, ru, tr, fr checked in a browser against the built site, RTL included).
- [x] `team:risk-review` has run on the diff.

## Risks & rollback

- A stale or wrong backend verdict shows a wrong status. The verdict and the wrapup share one
  function on the backend; the risk is in that spec.
- Rollback is a revert of one commit; the card hides itself when the API fields are missing.

## Open questions

None.
