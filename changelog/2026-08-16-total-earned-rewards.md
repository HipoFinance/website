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
| `96c46f8` | Show a Total HPO earned figure on the rewards page                                |
| `b835c85` | (HipoGang/app) Accumulate lifetime stake rewards per wallet and expose them in wallet-rewards |
| `071fb6f` | (HipoGang/app) Track lifetime HPO earned per wallet and expose it in wallet-rewards |
| `e6efde1` | Rename the mobile rewards tab to Rewards                                          |
| `15c279b` | Polish the rewards page and keep it hydrated across TonConnect re-emits           |

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

## Follow-on in the same session: lifetime HPO counter

After verifying the GRAM total live, Behrang asked for the HPO twin. Same
design, one counter: the per-wallet lifetime `hton_total_rewards` field
(reusing the name of the existing user-level lifetime counter for the same
quantity — HPO earned for holding hGRAM, reward coefficient applied), seeded
from the stored history's `hpo_reward` entries and incremented with the exact
expression the history rows are built from. Seeding gates on the field's own
absence, not `stake_rewards_since`, since wallets may already be stake-seeded
by the time this deploys — a wallet in fallback briefly reports an HPO total
covering the rolling 10-round window while its stake total covers more; they
converge once seeded (≤ one round cycle). Frontend adds a "Total HPO earned"
row sharing the "Since <date>" caption, which now shows when either total is
visible. Unlike `hton_sum_rewards` (claimable, reset on claim), this counter
never resets.

## Third round: display polish and the un-hydration bug

Behrang's feedback after using the live feature, plus one bug he observed.

Display changes: the total rows now render from first paint with the card's
existing loading idiom (`Row` shows an em dash for undefined) instead of
popping in when the API responds; they sit indented under a shared muted
"Earned since <date>" caption; labels pair as "Total GRAM earned" / "Total
HPO earned"; the claim CTA is a static "Claim Rewards" button with the
claimable amounts moved to a muted caption above it (the old
`claimWalletRewardsLabel` filled the button on mobile — replaced by
`claimableRewardsFormatted`); the mobile tab bar says "Rewards" (fixed in
`Header.tsx` and the duplicate array in `tma/TmaTabs.tsx`). Review caught
that `stake_rewards_since: 0` (no history) would have rendered as "Earned
since January 01" 1970 once the caption stopped being gated on the totals —
0 is now treated as "no date".

The bug ("values load, then disappear and the page reverts to init"): root
cause is that TonConnect re-emits `onStatusChange` for the **same** account
on connection restore, bridge reconnect, or wallet unlock — typically while
the tab is hidden because the user switched to their wallet app — and
`Model.setAddress` treated every emission as a wallet change, wiping all
wallet-derived state (balances, `walletAddress`, `walletRewards`). Recovery
was fragile: on `/rewards/` block polling is paused so `walletAddress` was
never re-derived, one failed refetch parked `walletRewardsFetchState` in a
terminal `error`, and the error message was nested inside the
`rewards != null` block so it could never render without data. Fixes:
`setAddress` early-returns on an unchanged address (connects, disconnects,
and real switches still wipe); a failed fetch retries after 5 s via
`timeoutWalletRewards` (mirroring `loadHipoGauge`'s pattern; last-good data
stays on screen since the catch never cleared it); and a standalone error
card renders when the first fetch fails with no data.

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
- After the first backend deploy: live-probed `/wallet-rewards` and confirmed
  the fallback total equals the history-array sum to the last digit, `since`
  equals the oldest entry, and the array is newest-first (validating the
  oldest-is-last assumption in both seed paths). Behrang confirmed the row
  renders in the app. For the HPO twin, verified the HMGET field indexes on
  both call sites and coefficient consistency across history rows, seed, and
  increment.

### Follow-ups

- Deploy HipoGang `jobs` + `api` (single-binary
  stack, `operation/stack/hipogang.yaml`). Frontend can ship first — the row
  hides itself until the API serves the fields.
- Within ~18h of the backend deploy every active wallet gets seeded by the
  jobs process; before that the API fallback covers reads.
- Decide whether a bounded per-user chart (monthly rollups) is worth the
  extra ~12 floats/wallet/year.
- Latent weakness (out of the critical path since the `setAddress` fix):
  `readLastBlock`/`readTimes` bail on `document.hidden` without re-arming
  their timers, and on `/rewards/`/`/defi/` `controlBackgroundJobs` only
  ever pauses — once broken there, the poll chain never restarts until the
  user visits `/stake/` or `/stats/` or reloads.
- `public/llms.txt` untouched — no protocol-level facts changed.
