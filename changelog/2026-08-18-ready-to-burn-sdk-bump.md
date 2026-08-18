# 2026-08-18 — The ready_to_burn state reaches the dApp

The treasury's participation state machine gained a new state, `ready_to_burn`,
as part of the reward-ordering fix deployed to mainnet earlier today. The state
was inserted at 6 and `burning` moved from 6 to 7, so every off-chain consumer
that knows those numbers had to be updated. Most of that work happened in other
repositories; the website's share is a single dependency bump, but it fixes a
real misreading of on-chain state, so it is recorded here.

## Commits

| Commit    | Description                                              |
| --------- | -------------------------------------------------------- |
| `e044f57` | Update the SDK for the ready_to_burn participation state |

## Why a lockfile bump is a behaviour change

`Model.ts`'s `stakeRemain` getter tells a depositor when their hGRAM will
arrive. It scans participations from newest to oldest and picks the round a
deferred deposit would attach to, mirroring the contract's `holds_bills?`
predicate (`treasury.fc:163-166`):

```func
return (state > participation::open) & (state < participation::burning);
```

The dApp expresses the same bound as `state < ParticipationState.Burning`
(`src/components/app/Model.ts:824`). That line is correct as written — but only
once the enum is. On `@hipo-finance/sdk` 4.1.0 `Burning` was still `6`, so the
range evaluated to states 1–5 and skipped a round that had settled but was
still holding its bills, which is precisely the case `ready_to_burn` describes.
Updating to 4.3.0 moves `Burning` to 7, the range becomes 1–6, and the getter
matches the contract again. No source change was needed.

A cross-repo sweep suggested changing the line to
`< ParticipationState.ReadyToBurn` in the same commit. That was declined: it
mirrors `owes_reward?`, a different predicate covering states 1–5, which is the
barrier condition for burning a round rather than the condition for attaching a
deposit to one. Making that edit would have frozen the current off-by-one in
place under a correct-looking constant.

The practical impact was nil while it lasted. The whole getter is gated on
`!instantMint` (`Model.ts:814`), and `instant_mint` has been `true` on mainnet
since 2026-08-05, so `stakeRemain` returns early regardless. It matters when
deferred minting is switched back on.

## Cross-repo context

For the record, since none of these have changelogs of their own:

- `contract` — the barrier itself (`e3afdaf`), the `upgrade_data` reset after
  deployment (`f967d4b`), and the `showState` / `docs/integration.md` updates
  for the new state (`db1ce8c`).
- `sdk` — `ReadyToBurn` added to the enum, released as 4.3.0 (`cfd5a8e`), plus
  a CI release pipeline that publishes on a version tag (`4fc4dec`).
- `borrower` — the Go daemon's own copy of the enum (`db6e96b`). Needs a
  rebuild and service restart to take effect.
- `mcp` — the same SDK bump, plus a fix for the state's rendered name: the
  formatter lowercased the enum member, which turned `ReadyToBurn` into
  `readytoburn` rather than `ready_to_burn` (`1afd1a5`).

Confirmed unaffected: both `gauge` copies (they parse the 4-bit state field but
never interpret it), `dune`, `DefiLlama-Adapters`, `yield-server`,
`HipoGang/app`, and `HipoGang/webapp`.

### Verification performed

- `npm update @hipo-finance/sdk` resolved 4.1.0 → 4.3.0; the caret range
  `^4.1.0` already admitted it, so `package.json` is untouched.
- `npm run build` completed clean: 49 pages, sitemap and Pagefind index built.
- Confirmed against `treasury.fc:163-166` and the `holds_bills?` call site at
  `treasury.fc:239` that `< Burning` is the correct bound for a deposit target,
  rather than accepting the sweep's recommendation at face value.

### Follow-ups

- No deploy step is pending: pushing to `main` runs `deploy.yml`, so the
  corrected `stakeRemain` shipped with this commit. It stays dormant until
  `instant_mint` goes back to `false`.
- The orphaned-bill bug at `treasury.fc:951-953` is still open: a round whose
  loan requests are all rejected has its participation deleted outright, so any
  deposit or unstake bill already minted against it can never burn. Unlike the
  ordering bug this one is live under the current configuration, because
  deferred unstake bills do not depend on `instant_mint`.
- `sdk-example` is still pinned at `^3.0.1`. It only uses `Staked`, which did
  not move, so it was left alone.
