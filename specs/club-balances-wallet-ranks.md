# Club Overview: hGRAM and HPO wallet ranks in the Balances card

**Status:** approved

## Goal

Match the Balances card on the Overview tab to the latest wireframe (`Main.dc.html`, 2026-11-15
copy). Under each balance group, a line shows the Club wallet's rank among all holders: "hGRAM rank
· #139 of 23,194 holders" and "HPO rank · #23 of 7,158 holders". The subtitle gains "· ranks among
all holders".

## In plain terms

The Balances card shows how much hGRAM and HPO the member's Club wallet holds, in the wallet and in
liquidity pools. It will also show where that wallet stands among every holder of each token: "#139
of 23,194 holders".

The Club server already works out these rankings every cycle for the old HipoGang app. It counts
hGRAM held in pools too, the same total the rewards pay on. It also stores the total number of
holders. The Club server will now send the wallet's two ranks with the rest of the Overview data,
and the website will show them. Nothing is computed anew and nothing is written, so it can't change
any amount.

If the wallet isn't in a ranking, for example a wallet that just started holding and hasn't been
ranked yet, that line is left out. If the website ships before the server, the rank lines simply
don't appear yet.

Decisions: see Open questions (one, with a recommendation).

## Definitions

**Concepts**

- **hGRAM rank**: the wallet's place in `holders:{hton}`, a sorted set of hGRAM holders scored by
  their wallet balance plus their hGRAM in allowlisted LP positions. It is rebuilt each cycle by
  `updateHtonWalletsRanking` (`club-server/game/redis/jobs.go`). Rank 1 is the largest holder.
- **HPO rank**: the same, from `holders:{hpo}` (`updateHpoWalletsRanking`).
- **Holders**: `holders:{hton}:count` and `holders:{hpo}:count`, the token's holder count as last
  stored by the ranking job.
- **Club wallet**: the one wallet of the account that earns boosted HPO (`club_wallet`). It is the
  wallet the Balances card describes.

## Context

- `club-server/game/redis/status.go:69-95` already reads these four values for the old app's
  `status` route: `ZRevRank` on each holders set for the user's `current_wallet` (−1 when absent),
  and the two counts (0 when absent).
- `cluboverview` (`clubread.go:898`) returns `split` (`ClubWalletSplit`, `clubread.go:712`), the
  Club wallet's balances, which the website's `Balances` (`src/components/app/club/Overview.tsx:603`)
  renders as two groups: hGRAM and HPO, each with a total, the wallet amount and the pools.
- The holders sets' members are the holder addresses as tonapi returns them (`holder.Owner.Address`).
  `club_wallet` is stored by the link flow. The build must confirm the two use the same address form,
  and convert if they don't.

## Approach

**Server:** `ClubWalletSplit` gains `hton_rank`, `hton_holders`, `hpo_rank` and `hpo_holders`
(integers, `omitempty`). A rank is 1-based (`ZRevRank` + 1) and left out when the wallet isn't in the
set. The reads run in one pipeline beside the split's existing reads. A read error leaves the four
out, logged, and the reply stays ok, because a rank is decoration and must not break the Overview.

**Website:** `api.ts` parses the four values into `split`. `Balances` adds, as the last row of each
group (in the HPO group, before the pool note), a row with a top border: muted label "hGRAM rank" /
"HPO rank", and the value "#139 of 23,194 holders" in semibold. The value has a count-less form,
"#139", for when the holder count is missing. The subtitle strings gain "· ranks among all holders".
The ranks go through `club.amount(n, 0)` for locale digits.

Rejected: computing ranks in the browser from the public `status` route, because that route belongs
to the old app's session and reads `current_wallet`, not the Club wallet.

## Changes

- `club-server/game/redis/clubread.go`: the four fields and their reads in `clubOverview`, plus a test
  in `clubread_test.go`.
- `website/src/components/app/club/api.ts`: parse the four fields.
- `website/src/components/app/club/Overview.tsx`: the two rank rows in `Balances`.
- `website/src/components/app/club/mock.ts`: mock ranks.
- `website/src/i18n/en/club.json`: `club.balances.htonRank` "hGRAM rank", `club.balances.hpoRank`
  "HPO rank", `club.balances.rankOf` "#{rank} of {holders} holders", `club.balances.rankOnly`
  "#{rank}", and the subtitle strings updated. Other locales after English approval.
- Both changelogs.

## Acceptance criteria

- [ ] `cluboverview` returns `hton_rank`/`hpo_rank` 1-based for a Club wallet in the holders sets,
      with the stored holder counts, and leaves a rank out for a wallet that isn't in a set (test).
- [ ] The test uses the same address form the ranking job writes, and passes the Club wallet in the
      form the link flow stores.
- [ ] A failing rank read leaves the Overview reply ok, without the rank fields (test, or reasoning
      shown in the code if a Redis failure can't be staged).
- [ ] `go build ./...` and the overview tests pass.
- [ ] Website, mock mode: both groups end with their rank row as in the wireframe, in dark, light and
      phone width, with no horizontal page scroll (screenshots).
- [ ] With the ranks absent, the card looks as it does today, apart from the subtitle.
- [ ] `npm run build` passes once the locales are in.

## Risks & rollback

- An address-form mismatch would make every rank absent. The card would look as it does today, so
  this fails safe. The test against the stored forms catches it.
- The holders sets are rebuilt by rename each cycle, so a read never sees a half-built set.
- Rollback: revert either side on its own.

## Decisions

- Q1 (2026-11-15, Alireza): a wallet that isn't ranked gets no rank line.

## Open questions

None.
