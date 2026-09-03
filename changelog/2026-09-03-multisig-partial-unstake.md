# Multisig partial unstake

Multisig wallets can connect to the Hipo app over TonConnect but reject every `sendTransaction`, so
since `cc84d32` (2026-08-01) the app has diverted detected multisigs to the treasury's text-comment
protocol instead of issuing a doomed transaction. That protocol stakes any amount with a `d` comment,
but its `w` comment burns the sender's **entire** hGRAM balance, and a text comment has nowhere to
put an amount. A multisig holder who wanted to unstake part of a position therefore had no route
through the app at all — and the docs and FAQ said as much.

This session gave them one. The spec is `specs/multisig-partial-unstake.md`, written and reviewed
before any code.

| commit    | subject                                                         |
| --------- | --------------------------------------------------------------- |
| `26ac0c8` | Build a copyable order so a multisig can unstake a part         |
| `2199d80` | Stop telling readers a partial unstake is impossible            |
| `f96af78` | Translate the multisig raw-order copy into the released locales |

## Show the message instead of sending it

A partial unstake is nothing exotic: it is `op::unstake_tokens` (`0x595f07bc`) sent to the holder's
own hGRAM wallet contract, carrying the token amount and a mode ref. The useful discovery was that
`@hipo-finance/sdk`'s `createUnstakeMessage` already returns exactly that as
`{ address, amount, payload }`, with `payload` a base64 BoC — the very object `Model.send` hands to
TonConnect. So the multisig path needed no new message construction, only a different destination for
it: the screen rather than the wallet.

`MultisigGuidance` now renders the three values as copy fields — destination, `0.1 GRAM`, payload —
labelled `Destination Address`, `TON Amount` and `Order BOC (body cell in Base64)` to match the form
of multisig.ton.org's **"Arbitrary order"** order type, which is what makes this work at all: that
UI accepts an arbitrary destination, TON value and pasted body, so the three values go straight in.
A `ton://transfer` link carrying the same body in its `bin` parameter sits underneath.

Because the message comes from the same SDK helper the TonConnect path uses, a copied order and a
signed transaction cannot drift apart. `chain.ts` gained no exports and `Model.ts` builds no cells.

## Why the values are frozen

`openMultisigGuidance` now snapshots the amount, the rate option and a fresh query id, and every new
computed reads the snapshot rather than live state. This is the one non-obvious decision in the
change, and it is not defensiveness for its own sake: a multisig order is signed minutes or days
after it is copied, and unlike the TonConnect path there is no wallet dialog in between to catch a
mismatch. A payload that changed after the user copied it — because a 30-second poll tick recomputed
a MobX computed, or because they nudged the amount field behind the modal — would be a silent
wrong-amount burn. The snapshot also stops tab navigation behind an open dialog from rewriting the
order halfway through being copied, which the previous live `isStakeTabActive` read would have done.

`multisigComment` and `multisigTransferAmount` were moved onto the snapshot too, which changes the
stake side's behaviour as well: its amount no longer tracks the field live. That is a deliberate
consequence, recorded in the spec rather than slipped in.

## A safety property worth naming

The destination of an unstake order is owner-specific, and that turns out to be a genuine improvement
over the comment method rather than just a complication. A `w` comment sent from the wrong wallet by
mistake unstakes _that_ wallet's balance — the deep link carries no sender, so this is a real
footgun, and `1c51dc1` had already added a warning about it. A raw order sent from a non-owner simply
fails the hGRAM wallet's owner check and bounces the 0.1 GRAM back; nothing is burned. The dialog
says so, links the destination on Tonviewer, and keeps the existing selected-wallet warning.

The dialog also warns that instant-rate capacity (`maxBurnableTokens`) moves with every round, so an
order left waiting for other signatures should ask for the best rate instead.

## Copy, docs and locales

Sixteen new `app.multisig.*` keys, plus a reworded `unstakeInstructions` that no longer claims
partial unstaking is unavailable. `staking-without-the-app.md` gained an "Unstake a part — a raw
order" section, and both FAQ entries were corrected. All of it shipped in the nine `indexed` locales,
since the `check-i18n` gate fails a released locale missing a key, a prose file or a doc.

The three field labels keep the English term alongside the translation. They name fields in
multisig.ton.org's English UI, and a reader matching a translated label against that form needs to
recognise it there.

`CopyField`'s clipboard call also gained a rejection path. It previously chained `.then` with no
`catch`, so a denied or insecure-context clipboard was an unhandled promise and the check mark simply
never appeared. That was survivable for a 48-character address; it is not for a payload nobody can
retype.

### Verification performed

- `npm run build` — clean, 523 pages, `check-i18n` passing with only the expected
  not-yet-reviewed warnings.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 18 groups passed.
- Generated an unstake payload with the real SDK and decoded it back: op `0x595f07bc`, the query id,
  the token amount, `return_excess` null and mode bits 2 (best) / 1 (instant) with
  `ownership_assigned_amount` 1, value exactly 0.1 GRAM, destination the hGRAM wallet. The deep
  link's `bin` parameter round-trips unchanged through `encodeURIComponent`.
- Confirmed all fourteen `multisig*` getters are registered in `makeObservable`.
- **Not** typechecked: this repo has no `tsc` and `astro check` wants to install `@astrojs/check`,
  so both edited files were syntax-checked with esbuild and the computed registrations matched by
  hand. Type errors would surface only at runtime.

### Follow-ups

- **Tonkeeper's in-app multisig is untested against the deep link.** It is undocumented whether
  Tonkeeper builds a multisig _order_ from a `bin=` link while a multisig is the selected wallet, or
  silently falls back to the signer's personal wallet. Tonkeeper's own multisig help describes order
  creation only through its Send button and Requests tab. Requirement 15 of the spec says that if it
  falls back, the deep-link button must be hidden for detected multisigs — a link that quietly sends
  from the wrong wallet is worse than no link. The copy fields do not depend on this.
- **No end-to-end mainnet partial unstake yet.** The spec asks for one through multisig.ton.org's
  "Arbitrary order" form before merge; this shipped ahead of that, to be tested on the live site.
- The payload the decode test used happened to contain no `+`, `/` or `=`, so it did not exercise
  percent-encoding. `encodeURIComponent` is applied regardless, and a longer payload will.

### Decisions declined

- **Dropping the multisig divert**, so everyone tries TonConnect first and only falls back on
  failure. Considered and declined: `cc84d32` exists precisely because signing always fails for these
  wallets, and nothing indicates that changed. Removing the divert would return them to the generic
  "Transaction canceled" it was written to eliminate. Revisit only with hands-on evidence.
- **A jetton-transfer route.** If the treasury accepted an incoming hGRAM transfer as an unstake
  request, a multisig could use its ordinary "send jetton" form and paste nothing — clearly better
  UX. Refuted on 2026-09-03: the treasury accepts no hGRAM transfer. Off the table permanently, not
  deferred.
- **Removing the `w` comment from the dialog.** Kept as a secondary block; dropping it would strand
  holders whose multisig UI cannot paste a payload.
- **Widening `multisigCodeHashes`.** Still one hash; other multisig builds keep falling through to
  the reactive hint on a rejected send.
