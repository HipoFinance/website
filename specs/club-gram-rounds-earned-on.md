# Club Rewards: "Earned on" in the GRAM-per-round table

**Status:** implemented (approved Alireza 2026-11-10; audit once)

## Goal

In the Base staking section of the Club Rewards page, the "GRAM earned per round" table gets a middle
column, "Earned on": the hGRAM each round's GRAM was earned on. A first row shows the round now
running: when it ends, the hGRAM it counts and the GRAM it should bring. Asked by Alireza on 2026-11-10,
item 1c of the wireframe.

## In plain terms

Today the table has two columns: the round's date and the GRAM it earned. After the change it has three:

| Round | Earned on | GRAM |
|---|---|---|
| 🕒 Next round · ends in ~6 h 12 m (Nov 10, 18:40 UTC) | 1,234.56 hGRAM | ≈ +0.2841 |
| Nov 10, 00:30 | 1,234.56 hGRAM | +0.2836 |
| Nov 9, 06:15 | — | +0.2829 |

**The first row** is the round now running, and it moves on its own: the countdown ticks every minute.
"Earned on" is the hGRAM the next reward counts (wallet + LP pools, the same figure the HPO "per round"
card uses). The GRAM is an estimate: that hGRAM times the last round's rise in the exchange rate, which
is the same sum the server makes once the round is paid, with last round's rise standing in for this
round's. It is marked "≈" and shown in grey, not green, because it is not earned yet.

**The other rows** are paid rounds, as today. Their "Earned on" needs a number the server does not keep
today: it works out each wallet's hGRAM for the round, multiplies it by the rate rise, and stores only
the result. So the server starts storing the hGRAM too. Rows from before that show "—"; the table keeps
the last ten rounds, so the dashes are gone about eight days after the server change is live.

Nothing else on the page changes. The GRAM figure is shown only; nobody is paid from it.

**Risk.** The server change writes one more field into the record it already writes for each wallet
each round. A mistake there could break that write, and the same write records the wallet's GRAM
total. So it is a money-audit candidate (see the end of this spec).

No decisions needed beyond approval; one small choice is in Open questions.

## Definitions

**Concepts**

- **Round** — one validation round of the treasury, about 18.2 hours. A Club reward round is paid once
  per round.
- **F_hton** — the wallet's hGRAM the server counts for a round: wallet plus allowlisted LP pools, at the
  round's pinned block. `club-server/specs/club-rules-and-money.md`.
- **stake reward `s`** — display-only GRAM figure per wallet and round, `floor(F_hton × (CR − PR))`
  (`club-server game/redis/rewardround.go:297`).
- **earned-rewards record** — the per-wallet list of the last ten rounds (`round_since`, `time`,
  `stake_reward`, `ton_reward`, `hpo_reward`) that the Club Rewards reply and `/wallet-rewards` return.
- **next reward time** — `Model.nextRewardAt`: the stake-release time of the oldest treasury round that
  still holds stakes; the rate rises soon after it.

**Formula parameters**

| Symbol | Meaning | Unit | Rounding / range |
|---|---|---|---|
| F_hton | the round's hGRAM of the wallet | nano hGRAM | exact integer ≥ 0 |
| CR, PR | the exchange rate after and before the round | GRAM per hGRAM | exact decimals |
| H_now | hGRAM the next reward counts (`eligibleHgram`) | hGRAM | display, 2 dp |
| ΔR_last | last round's rate rise, `currentRate − midRate` of the treasury | GRAM per hGRAM | ≥ 0; below 0 → no estimate |
| est | the first row's GRAM, `H_now × ΔR_last` | GRAM | display, 4 dp like the other rows |

## Context

- Table: `src/components/app/club/RewardsTab.tsx:363-382` (`BaseGram`), columns `club.rewards.colRound`
  and "GRAM"; rows from `club.rewards.rounds` (Club reply) or `walletRewards.earnedRewards`.
- Round reply: `club-server game/redis/clubread.go:1100` (`ClubRound`); per-wallet record written in
  `rewardround.go:4482` (`earnedRewards`), type `HpoEarnedReward` in `jobs.go:183`; `s` computed at
  `rewardround.go:4288` and `:5608`.
- `Model.nextRewardAt` (`src/components/app/Model.ts:1376`) and the treasury rates used by `Model.apy`
  (`:1811`). `eligibleHgram` (`RewardsTab.tsx:81`).

## Approach

1. **club-server.** Add `Hton string json:"hton,omitempty"` to `HpoEarnedReward`, filled with
   `nanoDecimal(F_hton)` where the record is built (both paths that compute `s`). Add `Hton` to
   `ClubRound` and copy it in the Club rewards read. Old records have no field; the reply omits it.
2. **Website data.** `api.ts` reads `rounds[].hton`; `Model.ts` reads `earned_rewards[].hton`.
3. **Website table.** Three columns: `club.rewards.colRound` ("Round"), new `club.rewards.colEarnedOn`
   ("Earned on"), "GRAM" as is. Past rows: date as today; `{amount} hGRAM` at 2 dp or "—"; GRAM as today.
   The first row, shown when `nextRewardAt` is known and in the future (or under 1 min past, shown as
   "ends in < 1 m"): a clock icon, `club.rewards.nextRound` "Next round · ends in {left} ({at})", where
   `left` is "~6 h 12 m" from a one-minute tick and `at` is the date and time in UTC; `H_now`; and
   "≈ +est" in muted text, left out (shown "—") when the treasury is not read or ΔR_last < 0.
4. **Mock.** The preview's rounds carry `hton`, so the column can be seen locally.

Rejected: working out a past round's hGRAM in the browser as `s ÷ (CR − PR)` — the browser does not
have each past round's rates, and the division would not give back the exact figure.

## Changes

- `club-server game/redis/jobs.go`, `rewardround.go`, `clubread.go` — the field; a test that a written
  record carries `hton` equal to F_hton and that `stake_reward` is unchanged. `CHANGELOG.md`.
- `website src/components/app/club/api.ts`, `src/components/app/Model.ts`, `RewardsTab.tsx`, `mock.ts`.
- `src/i18n/en/club.json` — `colEarnedOn`, `nextRound`, and the duration keys if none fit; other locales
  after English approval. `CHANGELOG.md`.

## Acceptance criteria

- [x] club-server tests pass; the new test shows `hton` = F_hton and `stake_reward` byte-equal to before.
- [x] Club rewards reply on a local Redis with one old and one new record: `hton` present on the new
      one only.
- [x] English preview (mock): headers Round · Earned on · GRAM; the first row reads "Next round · ends in
      ~H h M m (Mon D, HH:MM UTC)", its countdown changes after a minute, its GRAM is "≈ +…" in grey;
      an old row shows "—"; screenshots at phone and desktop width, light and dark, and fa (RTL).
- [x] No first row when the wallet is not connected or `nextRewardAt` is unknown.
- [x] `npm run build` and the i18n selftest pass.

Added on 2026-11-10 with Alireza's go (a plan in the chat, not this spec): the third Base staking card
became "Expected per year" (see `CHANGELOG.md`); the table's header is "Round" (`colRoundGram`), and on
phones the next-round label takes its own line.

## Risks & rollback

- The server write: a bad field breaks the record. Covered by the test and, on a go, the audit.
  Rollback: revert the commit; extra fields in old records are ignored by both readers.
- The estimate can be off when a round returns less (as on 2026-09-07). It is marked "≈"; the paid row
  replaces it.
- Deploy order: website first is safe (the column shows "—" until the server sends `hton`).

## Open questions

None. The first row's hGRAM is the HPO card's (`eligibleHgram`): with an LP figure older than an hour it
counts the wallet alone (Alireza, 2026-11-10).

Money-audit candidate: club-server writes a new field into the per-wallet earned-rewards record, in the
same write that records the GRAM total (`rewardround.go`). Alireza chose "audit" (once).
