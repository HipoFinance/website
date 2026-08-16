# 2026-08-16 — "Total earned" on the rewards page (cross-repo with HipoGang/app)

User feedback: hGRAM holders want to see how much they have earned, even when
their balance changed over time (stake, partial unstake, DEX buys). This
session designed and implemented that as a "Total earned" figure on
`/rewards/`, backed by a new O(1)-per-wallet accumulator in the HipoGang
rewards indexer. The backend half lives in `~/Code/HipoGang/app` (Go); this
report covers both halves since the design only makes sense as a whole.

## Commits

| Commit    | Description                                                                       |
| --------- | --------------------------------------------------------------------------------- |
| `2fb417a` | Show a Total earned figure on the rewards page (+ `hpo_sum_rewars` typo fix)      |
| `b835c85` | (HipoGang/app) Accumulate lifetime stake rewards per wallet and expose them in wallet-rewards |

## The options considered

The core question: computing per-user earnings needs balance history, and
ordinary liteservers only serve recent state. Options evaluated (with live
probes, not just on paper):

- **Client-side via toncenter/tonapi jetton feeds — rejected, verified
  broken.** Staking mints hGRAM, and neither indexer exposes mints in its
  jetton-history feeds (probed with a real whale wallet: toncenter's transfer
  feed returned empty; tonapi returned a single burn). A balance timeline
  built this way would show near-zero earnings for pure stakers.
- **Hybrid (backend rate series + client-fetched transfers) — rejected**, same
  defect, and the rate series already exists twice (Prometheus
  `hipo_treasury_hton_rate`, and archival `get_treasury_state`).
- **Client-side exact reconstruction via an archival v4 node — viable
  fallback.** `mainnet-v4.tonhubapi.com` is archival (verified at 365/730
  days back; our own `v4.hipo.finance` is not — 500s on old blocks). Exact but
  M–L effort, ~2N+1 requests per user, third-party dependency.
- **Extend the existing hipogang indexer — chosen.** The jobs process already
  computes `stake_reward = balance_hton × (currentRate − previousRate)` per
  wallet per round (`jobs.go` `updateHpoRewards`); it was only stored in the
  10-entry `hpo_earned_rewards` blob and never summed.

Definition chosen: **staking yield** (Σ balance × Δrate), not P&L. It needs no
price data for DEX trades, cannot go negative in a GRAM drawdown, and is
exactly "what the protocol produced for you". Behrang's constraint: per-wallet
Redis storage must stay bounded — no unlimited per-round history. Hence an
accumulator, not a table; a true all-time backfill is impossible from this
pipeline anyway (tx scans floor at 2025-07-25), so the figure is honestly
labeled "Since <date>".

## Backend (`~/Code/HipoGang/app`, working tree)

Two new `wallet:{addr}` hash fields (~30 bytes/wallet, O(1)):

- `stake_sum_rewards` — lifetime GRAM yield counter, `HIncrByFloat`-ed per
  round alongside the existing `hpo_sum_rewards`/`hton_sum_rewards` writes in
  `updateHpoRewards`. Unlike `hton_sum_rewards` it is a display counter and is
  **never** reset on withdrawal.
- `stake_rewards_since` — unix seconds of the earliest round covered.

First time a wallet is processed after deploy, the accumulator is seeded from
the sum of its already-stored `hpo_earned_rewards` entries (oldest entry's
time becomes `since`), so nobody starts at zero. `/wallet-rewards` returns
both fields; if the jobs process hasn't seeded a wallet yet, the handler
computes the same sum read-only from the stored array, so the API is correct
from the moment it deploys. Idempotency rides the existing per-wallet
`hpo_rewards_last_round_since` guard; the crash-window characteristics match
the neighboring accumulators (sequential commands, no transaction — kept
deliberately consistent).

## Frontend (this repo)

- `Model.ts`: `WalletRewards` gains optional `stakeSumRewards` /
  `stakeRewardsSince`; new computeds `totalEarnedFormatted` (via
  `formatCompact2Fraction`, hidden under 0.01 GRAM) and
  `totalEarnedSinceFormatted` (same visible date format as the per-round
  rows). Wire values are whole GRAM (backend converts via `tlb.FromNanoTON`
  before storing balances), so no nano scaling — cross-checked against the
  backend diff.
- `Reward.tsx`: "Total earned" `Row` above "Rewards after a year", with a
  muted "Since <date>" caption (`text-text-faint text-[12.5px]`, the existing
  idiom). Both render only when the API provides the data, so the frontend can
  deploy before the backend.
- **Bug fix**: `Model.ts` parsed `rewards.hpo_sum_rewars` — a typo'd key that
  the live API never serves (verified by probing `/wallet-rewards`; the wire
  key is `hpo_sum_rewards`). `hpoSumRewards` was therefore always `NaN` and
  the "Claim N HPO / M GRAM" label variants could never render. Fixed to the
  real key.

## Declined / deferred

- **Full historical backfill** (archival reconstruction per wallet) —
  deferred; the pipeline can't see rounds before 2025-07-25, and the seeded
  "since"-labeled counter satisfies the feedback at O(1) cost.
- **Per-user cumulative chart** — deferred; with only 10 retained rounds it
  would cover ~a week. Bounded monthly rollups (~12 floats/wallet/year) are
  the plausible design if wanted later.
- **Canonical `gram_reward` field** server-side (to delete the `1781256166`
  cutoff hack in `Reward.tsx`) — noted, not done; changes the semantics of
  stored rows.

### Verification performed

- Live-probed `/wallet-rewards` to confirm the real wire keys
  (`hpo_sum_rewards`, correctly spelled) before fixing the frontend typo.
- Cross-checked the GRAM unit convention end-to-end: backend stores balances
  via `tlb.FromNanoTON(...).String()`, so `stake_reward` and the new sum are
  whole GRAM; frontend applies no nano scaling, matching the existing
  `*_sum_rewards` handling.
- `go build ./...` and `go vet ./...` clean in HipoGang/app (one pre-existing
  unrelated vet failure in `newquizlist.go`, confirmed present on `main`).
- `npm run build` clean (49 pages, Pagefind index built); `prettier` reports
  both touched files conformant.

### Follow-ups

- Deploy HipoGang `jobs` + `api` (single-binary
  stack, `operation/stack/hipogang.yaml`). Frontend can ship first — the row
  hides itself until the API serves the fields.
- Within ~18h of the backend deploy every active wallet gets seeded by the
  jobs process; before that the API fallback covers reads.
- Decide whether a bounded per-user chart (monthly rollups) is worth the
  extra ~12 floats/wallet/year.
- `public/llms.txt` untouched — no protocol-level facts changed.
