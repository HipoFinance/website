# Gas prepayment 0.1 → 0.03 GRAM for stakes and Instant unstakes

**Status:** parked — not to be built for now (Behrang, 2026-11-14)

## Decision (2026-11-14)

Parked after the spec audit. The first draft (0.03 GRAM for every stake and unstake) was found unsafe for
Full unstakes (see "Money audit" below). The safe version, which this file now describes, lowers only
stakes and Instant unstakes; Full unstakes, the default option, keep 0.1. What remains is cosmetic (a
stake shows "+0.03" instead of "+0.1"; users pay the same either way, since the excess is refunded), and
it would cost an SDK release, the website change, copy in 11 locales, a re-check of this spec, a code
audit, and a per-option fee rule that would bring the loss back if it were ever wired wrong.

To pick it up again: re-read the live minimums (`get_wallet_fees`, `get_treasury_fees`) and the measured
costs, re-check this spec against the audit's finding (a re-check, not a fresh audit), and decide whether
user feedback about the 0.1 justifies the work. The contract-side finding below stands on its own and is
worth a look whether or not this is ever built.

Measured inputs, all 2026-11-14: live minimums deposit 0.008923, unstake (wallet) 0.011853, "w" 0.014161
GRAM; real cost over 2026-11-09…14 (dApp-shaped flows): stake median 0.0025 (p90 0.0032, n=120), Instant
unstake 0.0035 (n=30), Full unstake 0.0073 (p90 0.0077, n=24, with its payout; none showed a postponement).
The auditor's sandbox tests (not in any repo): `/tmp/claude-gasaudit/gas003.spec.ts`, `diag.spec.ts`, run
from the contract repo with `npx jest --rootDir <contract> --roots /tmp/claude-gasaudit`.

## Goal

The staking app attaches 0.03 GRAM of gas to each stake and each Instant unstake instead of 0.1 GRAM.
Full unstakes, and the multisig "w" unstake-all transfer, keep 0.1 GRAM (see the spec audit below). People
pay the same, since the unused part was always refunded, but the wallet dialog shows a smaller amount
and less GRAM is needed up front.

## In plain terms

Every stake or unstake carries some GRAM to pay the network for the work the Hipo contracts do. We
send 0.1 GRAM; about 0.003–0.007 is used and the rest comes back. 0.1 was chosen long ago as a wide
safety margin. Gas has become cheap, so 0.1 now looks expensive in the wallet's confirmation screen,
even though it isn't.

The contracts check the amount before doing anything. Your hGRAM wallet refuses an unstake carrying
less than 0.01185 GRAM today, and the treasury refuses a stake carrying less than 0.0089 GRAM on top
of the amount. A refused transaction bounces back: the user loses only a little gas, and their GRAM
and hGRAM stay where they were. 0.03 is 2.5 times the unstake minimum and 3.4 times the stake minimum.

For a stake and an Instant unstake, the first contract's check is all that matters: past it, the
steps always finish in one go, and the check budgets them with room to spare. A Full unstake is
different. It becomes a "bill" that is paid when its round ends, and if the treasury has no free GRAM
then, the bill is moved to the next round, and each move is paid from the gas the user attached. When
that runs out, the next step fails and the unstaked hGRAM is destroyed. With 0.1 GRAM a bill survives
about 34 moves (about 26 days of the treasury being unable to pay); with 0.03 only about 8, and 4 if gas
prices doubled. The spec audit measured this. So Full unstakes keep 0.1, and only stakes and Instant
unstakes, which can never become a bill, drop to 0.03. Since Full is the default option, most unstakes
still show 0.1 in the wallet.

The remaining risk: TON's gas prices are set by validator vote. If they rose more than about 2.5 times,
Instant unstakes would start bouncing (safely: refused before anything changes) until we raise the
number again. Such votes are public and take weeks.

The 0.1 lives in our SDK, which other apps (Hipo Club web, the SDK example) also use. So the SDK gets
an optional "how much gas" argument that defaults to today's 0.1, and only the website passes 0.03.
Other apps change nothing until they choose to.

Decisions needed: see Open questions.

## Definitions

**Concepts**

- **Gas prepayment**: the GRAM attached to a stake or unstake message on top of the amount staked,
  to pay for the contracts' gas. Unused gas returns to the user. The SDK calls it `feeStake` /
  `feeUnstake`; the site's "Transaction cost" line shows the measured cost, not this.
- **Contract minimum**: what a contract requires the incoming value to cover before it acts.
  Stake: the treasury's `deposit_coins_fee` (`get_treasury_fees`, live 0.008923 GRAM). Unstake: the
  hGRAM wallet's `unstake_tokens_fee() + 1` (`get_wallet_fees`, live 0.011853 GRAM; compiled into each
  deployed wallet). Unstake-all by "w" comment: the treasury's `unstake_all_fee` (live 0.014161 GRAM).
- **Headroom**: prepayment ÷ contract minimum; how far gas prices can rise before the message is refused.

**Formula parameters**

| Symbol | Meaning | Unit | Rounding / range |
| --- | --- | --- | --- |
| P | low gas prepayment: stakes and Instant unstakes | nano-GRAM | 30,000,000 (0.03) |
| F | SDK default `feeStake`/`feeUnstake`, kept for Full unstakes and "w" | nano-GRAM | 100,000,000 (0.1) |
| a | stake amount | nano-GRAM | > 0, unchanged |
| v | message value | nano-GRAM | stake: `a + P`; Instant unstake: `P`; Full unstake: `F`; multisig "d": `a + P`; "w": `F` |

## Context

- SDK `sdk/src/Constants.ts:19-20`: `feeStake = feeUnstake = 100000000n`, with a comment calling them
  "recommended… intentionally above the current dynamic fees". `sdk/src/Helpers.ts:34` adds `feeStake`
  to a deposit; `:61` uses `feeUnstake` as the unstake value. Version 8.0.0.
- Website: `chain.ts:33-35` re-exports them; `Model.ts:1769` and `:1771` use them for the multisig
  transfer amounts ("d"/"w" comment path); `send` and `connectAndStake` go through the two helpers.
- Contract checks: treasury `deposit_coins` (`contract/contracts/treasury.fc:392-405`) refuses with
  `insufficient_fee` unless `incoming − deposit_fee ≥ coins`; a "d" comment stakes `incoming − fee`
  (`coins = 0` → `max_coins`). Wallet `unstake_tokens` (`wallet.fc:172-180`) refuses unless
  `incoming ≥ unstake_tokens_fee() + ownership_assigned_amount`. "w" (`treasury.fc:734-741`) refuses
  unless `incoming ≥ unstake_all_fee()`.
- Both refusals happen in the first contract, before any state change, on a bounceable message, so the
  value returns minus gas. Past that check, the unstake chain is non-bounceable and an underfunded step
  destroys hGRAM; the wallet's check budgets the whole chain plus ONE extra bill try.
- A bill the treasury cannot pay is re-minted for the next round with `send::remaining_value`
  (`treasury.fc` `burn_tokens`, after "Insufficient funds to burn tokens now"), while the round's burn is
  funded only with `burn_all_fee()` (`send_burn_all`). So each postponement is paid from the user's
  leftover prepayment, ~2.77M nano-GRAM at today's prices, with no limit on the number of moves. An
  Instant unstake never creates a bill: `reserve_tokens` rolls it back when liquidity is short. Stakes
  never postpone (`mint_tokens` always runs).
- Completion detection (`Model.ts` `outcomeOf`) classifies by op code, not by amounts.
- Measured real cost (2026-11-09…14, this repo's CHANGELOG): stake ≈ 0.0025, unstake ≤ 0.0077 GRAM.
- Other users of the helpers: `club-web/src/Model.ts:4283` (deposit), `sdk-example`. `hpo-trader` has
  its own Go constants and is not touched.
- Copy that says 0.1: `src/i18n/en/app.json` `app.multisig.stakeInstructionsNoAmount`; FAQ
  `what-is-the-minimum-amount-required-to-stake.md`, `what-does-it-cost-to-stake.md`; docs
  `fees-and-gas.md:16`, `staking-without-the-app.md:12, 28, 43`; each in 11 locales.

## Approach

1. **SDK 8.1.0** (`sdk` repo): `createDepositMessage(treasury, amountInNano, queryId = 0n, referrer?,
   fee = feeStake)` and `createUnstakeMessage(wallet, amountInNano, unstakeMode = 'auto', queryId = 0n,
   fee = feeUnstake)`. A new trailing optional argument; default unchanged, so no other caller changes.
   Tests: the default produces today's message byte for byte; a passed fee lands in `amount` and
   nowhere else in the payload. Published by a person (npm credentials).
2. **Website**: bump to `@hipo-finance/sdk@8.1.0`. One constant in `Model.ts`,
   `lowGasPrepayment = 30_000_000n`, with a comment giving the live minimums, the headroom and why Full
   keeps the default. A getter picks the fee: stake → `lowGasPrepayment`; unstake with `instant` →
   `lowGasPrepayment`; unstake with `best` → no argument (SDK default 0.1). `send`, `connectAndStake` and
   `multisigMessage` use it, reading the option from the same place they read it today (the live option
   for `send`, the frozen snapshot for the multisig order). `multisigTransferAmount`: "d" uses
   `a + lowGasPrepayment`; "w" keeps `chain!.feeUnstake` (it always goes through a bill).
3. **Copy**: the stake-side "0.1 GRAM" → "0.03 GRAM" (multisig "d" instructions, the two staking FAQ
   answers, the docs' stake transfer); the docs' "w" transfer and the multisig unstake stay 0.1; Fees &
   Gas says 0.03 to stake and for an Instant unstake, 0.1 for a Full unstake, and "a few thousandths of a
   GRAM" instead of "on the order of a hundredth". English first, then the ten locales.
4. `CHANGELOG.md` entry.

Rejected:

- **Change the SDK defaults to 0.03**: a minor release would silently change Hipo Club web and anyone
  else on `^8`, without their review.
- **Build the messages in the website**: a second copy of the payload code on the money path.
- **0.03 for every unstake** (this spec's first draft): the spec audit showed a Full unstake bill then
  survives only ~8 postponements instead of ~34 before its hGRAM is destroyed.
- **0.02 or less**: 0.01 is below the unstake minimum (every unstake bounces); 0.02 leaves 1.7× and
  1.4× on "w".
- **Read the live minimum and attach a multiple of it**: removes the gas-price cliff, but adds a read
  and a formula to the send path and to the frozen multisig order; see Open questions.

## Changes

- `sdk/src/Helpers.ts`, `sdk/test/*`, `sdk/package.json`, `sdk/CHANGELOG` — item 1.
- `website/package.json`, `package-lock.json` — SDK 8.1.0.
- `website/src/components/app/Model.ts`, `chain.ts` — item 2.
- `website/src/i18n/*/app.json`, `src/content/prose/*/faq/staking/{what-is-the-minimum-amount-required-to-stake,what-does-it-cost-to-stake}.md`,
  `src/content/docs/**/{fees-and-gas,staking-without-the-app}.md` — item 3, all 11 locales.
- `website/CHANGELOG.md`.

## Acceptance criteria

- [ ] SDK: with no `fee` argument both helpers return exactly what 8.0.0 returns (test compares the
      base64 payload and `amount`); with `fee` the `amount` is `a + fee` (deposit) or `fee` (unstake)
      and the payload is unchanged.
- [ ] Website send (browser, live reads, the multisig order built by the same path, decoded): a stake
      of 1 GRAM carries `amount = 1.03 GRAM`; an Instant unstake `0.03 GRAM`; a Full unstake `0.1 GRAM`;
      switching the option after typing switches the amount; payloads equal what 8.0.0 built.
- [ ] Multisig guidance: the "d" transfer shows `a + 0.03 GRAM`, the "w" transfer `0.1 GRAM`; a payload
      order frozen with Full carries 0.1 even if the option is switched after the dialog opened.
- [ ] A real mainnet stake and a real Instant unstake at 0.03, sent by a person from their own wallet,
      both complete, and the excess returns (checked on chain).
- [ ] Copy: stake-side and Instant texts say 0.03, Full and "w" texts say 0.1 (grep, all locales).
- [ ] `npm run build` (i18n gate) and the SDK's tests pass.

## Risks & rollback

- **Gas prices rise > 2.5×**: Instant unstakes bounce, then stakes (3.4×). No loss: refused before any
  state change. Detected by the dApp's bounced outcome and by user reports. Fix: raise
  `lowGasPrepayment` and redeploy, minutes. Full unstakes and "w" keep today's 0.1 margin.
- **Picking the wrong fee for the option** (0.03 on a Full unstake) would bring back the audit's
  finding; the acceptance criteria check the amount per option, and the code audit is told to try it.
- **A deployed wallet generation with a larger frozen minimum** than the one measured: its unstakes
  would bounce. The live parent has one wallet code (memory: generation `eb839658`); the live
  `get_wallet_fees` read above is from such a wallet.
- **Club web or other SDK users**: unaffected (default unchanged).
- Rollback: revert the website commit and push; the SDK change is additive and can stay.

## Money audit

Spec audited once (team:money-auditor, 2026-11-14), on the first draft (0.03 for everything): **fix
first**. Finding: a Full/auto unstake bill that the treasury cannot pay is moved to the next round at the
user's expense (~2.77M nano-GRAM per move), with no limit; at 0.03 only ~8 moves survive (4 at 2× gas)
before a step fails and the unstaked hGRAM is destroyed, versus ~34 at 0.1. Measured in a sandbox with the
deployed wallet code (`eb839658`) against the HEAD treasury at mainnet fee config. This draft applies the
auditor's suggested fix (0.03 for stakes and Instant only). Not re-checked: the work was parked first.

Outside this change, for the contract: the same limit exists at 0.1 (a bill postponed ~35 rounds in a row
loses its hGRAM), and `MinGas.spec.ts`'s note that "a postponement does not draw on the staker's fee"
holds only because that test funds the burn with `retry_burn_all`, not with `burn_all_fee` as production does.

## Open questions

1. **A runtime guard.** The site could read the live minimums (already in the block poll for the
   treasury; one getter per wallet) and attach `max(0.03, 2 × minimum)`, which removes the gas-price
   cliff for good. Recommendation: not now. Gas votes are rare, public and slow, the failure is a safe
   bounce, and the guard adds a formula and a read to the send path and to the frozen multisig order.
2. **The SDK's own default.** Leave `feeStake`/`feeUnstake` at 0.1 for now (recommended), and lower
   them in a 9.0.0 later, once the site has run on 0.03 for a while and Hipo Club web can opt in.
3. **The Max reserve.** Max on the stake tab keeps 0.2 GRAM back (`minimumTonBalanceReserve`). It could
   drop now that the prepayment is 0.03; recommendation: a separate change, not this one.
