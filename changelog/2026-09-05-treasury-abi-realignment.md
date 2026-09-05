# The stake and unstake forms after the borrower-fee upgrade

The treasury contract was upgraded on mainnet today (contract commit `7a11e5f`, "Charge borrowers a
fee that buys and burns HPO"), and the stake and unstake pages stopped working. The report was that
`get_treasury_state` had changed, which turned out to be right, and to be one of three wire layouts
that moved in the same upgrade.

| commit    | subject                                                |
| --------- | ------------------------------------------------------ |
| `38b7971` | Read the treasury again after the borrower-fee upgrade |

## What actually broke

`get_treasury_state` now returns 21 items instead of 20: `borrower_fee` sits between
`governance_fee` and `collection_codes`. Reading the live treasury confirms it — index 16 is
`governance_fee` (0), index 17 is now `borrower_fee` (0), and 18/19 are the two code cells.

`@hipo-finance/sdk` 4.4.0 parses that tuple positionally, so at position 17 it called
`stack.readCell()`, met an int, and threw. `Model.readTreasuryState` therefore never assigned
`treasuryState`, and every getter guarded on it — the exchange rate, `youWillReceive`, the fee
lines, `stakingInProgress*` — reported "not ready". That is the whole visible failure: the forms
paint, then never fill in.

Two further layouts moved and would have bitten as soon as the tuple was fixed, because the
participations dictionary parses them:

- `borrower_reward_share` widened from uint8 to uint16 inside every stored request, and a new
  `request_fee` uint16 was added before `new_stake_msg`.
- The sorted-bid dictionary key widened from 112 to 120 bits, since `request_sort_key` carries the
  wider share.

## The fix is in the SDK, not here

This repo consumes the published package, so there was nothing to patch locally. `sdk` 4.5.0
realigns all three layouts (`5a7d7d1`) and additionally exposes the upgrade's new `get_loan_request`
getter (`72bfb0d`). This commit is the version bump and nothing else — no code here reads
`borrowerFee` or `requestFee`.

`src/components/app/chain.ts` still names 4.4.0 in the comment explaining why the SDK is reached
past the `@ton/ton` barrel. That is left alone deliberately: it is a note about when the SDK started
peer-depending on `@ton/core`, which is still 4.4.0, not a floor that moved.

## Why `getLoanRequest` keys its not-found test on the loan amount

Worth recording because it is a trap for the next caller. The contract's new getter returns an
all-zero tuple when the borrower has no request in the round, and the comment above it says "stage
is 0 when nothing was found". But `participation::open` is _also_ 0, so a genuinely-found bid still
sitting in the open stage is indistinguishable from the not-found sentinel on `stage` alone.

`request_loan` enforces `throw_unless(err::invalid_parameters, loan_amount > 0)`, so a stored
request always has a non-zero loan amount while the sentinel never does. The SDK tests `loanAmount`
instead, and says so in its doc comment.

### Verification performed

- Read the live `get_treasury_state` tuple directly off mainnet through `TonClient4` and confirmed
  the 21-item shape and the position of `borrower_fee`, before changing anything.
- Ran the candidate 4.5.0 build against the live treasury: every field parses, `borrowerFee` is 0
  (the upgrade ships it disabled), `totalCoins` matches `gauge.hipo.finance/data` exactly, and the
  derived rate matches `currentRate`.
- `borrowerRewardShare` came back as 2056 and 1799 — exactly 8 × 257 and 7 × 257, the migrator's
  conversion of the old uint8 bids. Exact multiples of 257 are strong evidence the 16-bit read is
  right; a wrong width would give garbage.
- Compared `getLoanRequest` against the dictionary records for all seven live requests across three
  rounds: every field matches. The open-stage round exercised the ambiguous `stage: 0` case and
  returned the request rather than `undefined`; an unknown borrower and a bogus round both returned
  `undefined`.
- Re-ran the whole read through this repo's own `src/components/app/chain.ts` barrel against the
  production `v4.hipo.finance` endpoint, computing the exchange rate and a you-will-receive figure
  the way the form does.
- `npm run build` (523 pages, i18n gate passed) and `node --experimental-strip-types
scripts/i18n-selftest.mjs` (18 groups).

Not verified in a browser: the fix was confirmed at the module level rather than by loading the
hydrated island and watching the form fill in.

### Follow-ups

- The contract's `get_loan_request` would be better with an explicit found flag than with a
  `stage` whose 0 is overloaded. Worth raising in the contract repo.
- `webapp` was deliberately **not** fixed: the repo is archived, and `app.hipo.finance` now 301s to
  `hipo.finance/app/`, the legacy stub in this repo. Nothing it builds is served any more. A bump was
  prepared and then reverted — worth knowing it also wanted to rename `npm-shrinkwrap.json` to
  `package-lock.json`, which is not a change to make in an archived repo.
- `sdk-example` still floats on `^4.3.0` and was not touched.
