# Multisig partial unstake (and a better multisig stake)

## Summary

Holders whose hGRAM sits in a multisig wallet can connect to the Hipo dApp over TonConnect, but the
wallet rejects every `sendTransaction` request — the reason `Model.send` short-circuits detected
multisig accounts into `MultisigGuidance` instead of issuing a doomed transaction (commit `cc84d32`,
2026-08-01). That guidance offers the treasury's text-comment protocol: `d` to stake any amount, `w`
to unstake — but `w` burns the **entire** hGRAM balance of the sender, and no text comment can carry
a partial amount. A multisig holder who wants to unstake part of their position currently has no
route through the app at all.

This spec closes that gap. A partial unstake is an ordinary `op::unstake_tokens` message to the
holder's own hGRAM wallet contract, and `@hipo-finance/sdk`'s `createUnstakeMessage` already returns
that message as `{ address, amount, payload }` with `payload` as a base64 BoC — the very object the
app hands TonConnect. So the multisig path becomes "show the message instead of sending it": the
modal renders the destination, the exact TON value and the copyable payload, plus a `ton://transfer`
deep link carrying the same body, so the holder can reproduce it as a multisig order. The stake side
gets the same treatment as an alternative to the `d` comment, and the docs and FAQ — which currently
state that partial unstake is impossible — are corrected across all released locales.

## Revision — 2026-09-03, after hands-on verification

Requirement 15 was answered by testing against a real multisig in Tonkeeper, and the answer inverted
the design. Tonkeeper **does** build a multisig request from a `ton://transfer` link with a `bin`
body: it preserves the payload, holds the request for the remaining signers, and executes on-chain
once they sign. So the deep link is not a convenience beside the copy fields — it is the flow, and
the dialog full of fields was a long and frightening thing to put in front of it.

The requirements below are revised accordingly: pressing Stake or Unstake hands the order to the
wallet app with no dialog at all, and the copy fields plus the `d`/`w` comment protocol become the
fallback for when nothing opens. One defect remains: Tonkeeper does not preselect the connected
multisig, so the selected-wallet warning is now load-bearing rather than a footnote.

Requirements 1–3, 5–8 and 12–14 stand as written; 4, 9, 10 and 11 are replaced; 15–18 and 20 are
new; and 19 is the verification that prompted all of it.

## Requirements

1. The multisig guidance modal MUST offer a **partial unstake** for any valid amount the user has
   entered on `/unstake/`, not only a whole-balance burn.
2. The instructions MUST be derived from the same `chain.createUnstakeMessage(walletAddress,
amountInNano, unstakeOption, queryId)` call the TonConnect path uses, so the two can never
   disagree. No hand-built cells, and no new exports from `src/components/app/chain.ts`.
3. The modal MUST present three copyable fields for a partial unstake:
   - **Destination** — the user's own hGRAM wallet contract (`Model.walletAddress`), not the treasury.
   - **Amount** — exactly `feeUnstake` (0.1 GRAM), rendered with `formatAsciiNano` so it can be
     retyped into a multisig UI that accepts nothing else.
   - **Payload** — the message body as a standard-base64 BoC string, copyable in one press.

   These three map one-to-one onto multisig.ton.org's **"Arbitrary order"** order type, whose form
   takes exactly `Destination Address`, `TON Amount` and `Order BOC (body cell in Base64)`
   (`src/index.ts` in `ton-blockchain/multisig`). The copy SHOULD name those field labels, so the
   holder can see which box each value goes in.

4. **(revised)** Pressing the main button with a detected multisig MUST hand the `ton://transfer/`
   deep link to the wallet app immediately, with no dialog in between — for stake and unstake alike.
   `bin` is a documented parameter of the scheme (docs.ton.org: "a URL-encoded base64 BoC which will
   be attached as a body to internal message"), `amount` is mandatory alongside it, and Tonkeeper is
   verified to turn such a link into a multisig request that keeps the payload and waits for the
   remaining signatures.
5. The `unstakeOption` currently selected on screen (`best` / `instant`) MUST be encoded into the
   generated payload, matching the TonConnect path's behaviour.
6. The amount, the unstake mode and the `queryId` MUST be **snapshotted when the modal opens** and
   held stable while it is open. A payload that changes under the user after they have copied it —
   because a poll tick recomputed a MobX computed, or because they nudged the amount field behind the
   modal — is a silent wrong-amount bug. The snapshot is what is displayed and what every field and
   the deep link encode.
7. The modal MUST explain that the destination is the user's **own hGRAM wallet contract**, derived
   from their multisig address, and MUST show a link to it on tonviewer so the holder can verify it
   before signing. This is a new, unusual-looking destination and the copy must account for that.
8. The existing selected-wallet warning (`app.multisig.transferNote`, added in `1c51dc1`) MUST be
   retained wherever a deep link is offered: `ton://transfer` carries no sender, so the wallet app
   sends from whichever account is selected.
9. **(revised)** The `d`/`w` comment protocol MUST survive only inside the fallback dialog, for
   wallets that neither handle a `ton://` link nor accept a pasted payload. It MUST NOT be the
   primary instruction for either tab any more.
10. **(revised)** The fallback dialog MUST be short. It is what a user sees when something already
    went wrong, so it carries the retry button, the three order fields and the comment protocol —
    and nothing that merely explains the situation at length.
11. **(revised)** Stake MUST use the same deep-link mechanism as unstake, built from
    `createDepositMessage`. The two tabs differ only in the message, not in the flow.
12. The pre-emptive divert at `Model.ts:2265` (`if (this.isMultisig) { openMultisigGuidance() }`)
    MUST stay. Multisig signing has not been shown to work, and removing the divert would regress
    these users to the generic "Transaction canceled" that `cc84d32` was written to eliminate.
13. The reactive fallback MUST stay too: a rejected `sendTransaction` from an undetected wallet still
    raises the hint that opens the same modal.
14. `src/content/docs/staking-without-the-app.md`, the FAQ entry
    `src/content/prose/en/faq/staking/can-i-stake-with-a-multisig-or-cold-wallet.md` and
    `src/content/prose/en/faq/getting-started/which-wallets-are-supported.md` MUST be corrected — all
    three currently tell readers that unstaking a part of the balance is not possible — **and the
    matching change MUST ship in all nine `indexed` locales**, or `scripts/check-i18n.mjs` fails the
    build.
15. Because handing over a deep link reports nothing back, the app MUST detect that no wallet took
    it and raise the fallback dialog then. The snapshot MUST NOT be recaptured for it, so the order
    shown is the one the link carried, query id included.
16. After a link is handed over, the app MUST raise the selected-wallet warning as a dismissible
    note, not a dialog: Tonkeeper does not preselect the connected multisig, and the user needs to
    read this while switching to an app that is already opening. What is at stake is which account
    the position ends up in — payer and receiver stay the same party either way (requirement 20's
    note explains why).
17. Catalog keys left unreferenced by the revision MUST be deleted from English and from all nine
    released locales, not left dangling — `check-i18n` reports an unused locale key as `extra`.
18. The deep-link watchdog timer MUST be cleared by `Model.pause`, alongside the other timers, so it
    cannot fire into a paused island, and any listener it installed MUST be removed with it.
19. Once a wallet app has taken the link, the amount field MUST be cleared, matching what the
    TonConnect path does on completion; a multisig request can wait days for its remaining
    signatures, so there is nothing to wait on first. It MUST NOT be cleared when nothing took the
    link — the user is not finished with it then. Detecting which happened MUST NOT rely on sampling
    visibility once when the timer fires: a hidden page's timers can be deferred until it is
    foregrounded, and that single late sample would read as "nothing opened".

20. ~~Before merge~~ **(done, 2026-09-03)** One real partial unstake MUST be executed by hand on mainnet through
    **multisig.ton.org**'s "Arbitrary order" form, confirming the three copied values are accepted
    verbatim and that the order executes. Separately, **Tonkeeper's in-app multisig** MUST be tested
    against the deep link: it is undocumented whether Tonkeeper builds a multisig order from a `bin=`
    link while a multisig is the selected wallet, or silently falls back to the signer's personal
    wallet. If it falls back, the deep-link button MUST be hidden for detected multisigs — a link
    that quietly sends from the wrong wallet is worse than no link.

## Out of scope

- Removing or weakening the multisig divert, or any attempt to make TonConnect signing work for
  multisig wallets. Requirement 12.
- A read-only / watch-address mode for wallets that cannot connect at all. Detection continues to
  rely on the connected account's code hash, which the holder confirmed does work.
- Widening multisig detection beyond the single `multisig-contract-v2` code hash in
  `multisigCodeHashes`. Other multisig builds keep relying on the reactive hint.
- Any change to the treasury's text-comment protocol, or a new on-chain op for partial unstake by
  comment. This is a dApp-side workaround only; no contract change.
- Transaction progress tracking for the manual path. A multisig order may be signed hours or days
  later, so `Wait.tsx` / `waitForCompletion` deliberately do not run for it.
- Telegram Mini App parity (`TmaApp`) beyond whatever the shared modal already gives.
- Turning the `hi`/`ar`/other locales `public`, or any rollout-status change.

## UX / behavior

### Entry points (unchanged)

- **Detected multisig** — pressing Stake/Unstake opens the modal directly; no wallet dialog appears.
- **Undetected wallet** — the send is attempted, is rejected, and the 15-second hint appears offering
  "Show instructions", which opens the same modal.

### Unstake, amount entered

The modal is titled as today (`app.multisig.titleUnstake`) and reads, in order:

1. A short intro: multisig wallets can't sign dApp transactions, but this order reproduces the same
   message. It names the snapshotted amount and the selected rate option.
2. A **verify** line: the destination is _your own hGRAM wallet contract_, derived from your multisig
   address — with the address and a tonviewer link.
3. The three copy fields of requirement 3: destination, `0.1 GRAM`, payload.
4. The deep-link button (`app.multisig.openInWallet`), with the retained selected-wallet warning.
5. A secondary, visually quieter line: _or unstake your whole balance_ — the existing `w`-comment
   method, with the treasury address and comment fields, for UIs that can't take a payload.
6. Close.

### Unstake, no amount entered

Steps 2–4 are replaced by a prompt to enter the amount to unstake first; the whole-balance method
stays visible as the one thing that works without an amount.

### Stake

Unchanged in substance: the `d` comment, the amount-plus-0.1-GRAM value, the treasury address, the
deep link, the selected-wallet warning. The deposit payload is added as an alternative under the same
"or use a raw payload" framing as the unstake fallback, so the two tabs read consistently.

### States and presentation

- **Chain not ready** — `treasuryAddressFormatted` and `walletAddress` come from the guarded getters,
  which report empty until `isChainReady`. The modal must render present-but-empty fields rather than
  a wrong value, the same rule the static shell follows; the deep link stays hidden while its
  destination is unknown.
- **Copy feedback** — the existing `CopyField` check-mark-for-2s behaviour, reused as-is for the new
  payload field.
- The payload is long; it renders in the existing `break-all` `num` style and must not widen the
  modal. Mobile is the constraining case.
- Styling uses the app's semantic tokens only, and both schemes come free from them — there is no
  `dark:` variant to add. RTL: logical utilities only; the address, amount and payload are Latin and
  go inside `num` / `model.isolate`.

## Technical approach

**`src/components/app/Model.ts`**

- Add a snapshot holder — an observable set when `openMultisigGuidance` runs, cleared on close and in
  the disconnect reset at `:1708` — carrying `{ amountInNano, unstakeOption, queryId }`. The queryId
  comes from the same `generateRandomQueryId()` the send path uses.
- Add computeds derived from that snapshot, not from live state: the unstake message (via
  `chain!.createUnstakeMessage`), and from it the destination string, the ASCII-formatted value and
  the base64 payload. Each must read `isChainReady` so it recomputes when the chain chunk lands,
  matching the existing guarded-getter convention.
- Generalise `multisigDeepLink` into two: the existing comment link (treasury + `text=`) and a new
  payload link (`ton://transfer/<destination>?amount=<nano>&bin=<percent-encoded base64 payload>`).
  The alphabet is **standard base64, percent-encoded** — not base64url: docs.ton.org's own worked
  example carries literal `/` characters and `=` padding. So the SDK's `payload` string goes into
  both the copy field and the link unchanged, the link needing only `encodeURIComponent`. Note the
  existing `multisigDeepLink` interpolates `text=` with no encoding, which is harmless for a
  one-character `d`/`w` comment but must not be the pattern the payload link copies. Register every new member in the `makeObservable` block.
- No new static imports. `createUnstakeMessage` and `createDepositMessage` are already re-exported
  through `chain.ts`, and `chain.ts` must not grow exports for this.

**`src/components/app/MultisigGuidance.tsx`**

- Restructure into the ordered sections above. `CopyField` is reused unchanged for the payload.
- Add the tonviewer verify link and the secondary whole-balance block.
- The modal keeps its own focus handling and `autoFocus` close button; the new content must not break
  the Escape-to-close behaviour already wired to that button.

**i18n**

- New and reworded keys under `app.multisig.*` in `src/i18n/en/app.json`, plus all nine `indexed`
  locales. `app.json` is a shared catalog, so per CLAUDE.md it deliberately does **not** move any
  page's sitemap `lastmod`.
- Docs: `src/content/docs/staking-without-the-app.md` and its nine translations under
  `src/content/docs/<locale>/`. The page gains a partial-unstake section and loses the "there is no
  partial amount" claim.
- FAQ prose: the two entries named in requirement 14, in all ten locales.
- Run `node scripts/check-i18n.mjs` (the `prebuild` gate) and then
  `--update-hashes <locale>` for each locale touched.
- No `src/data/lastmod.mjs` `ROUTES` change: docs pages are dated by path, and the FAQ entries are
  existing prose whose dates move on their own.

**Verification and record**

- `node --experimental-strip-types scripts/i18n-selftest.mjs` and a full `npm run build`.
- Hands-on mainnet check per requirement 15, including one real partial unstake.
- A `changelog/2026-XX-XX-multisig-partial-unstake.md` report plus its 3–5 line `CHANGELOG.md` entry,
  recording the declined options below.

## Edge cases & error handling

- **Wrong sending wallet.** This is where the payload method is _safer_ than the comment method and
  the copy should say so. A `w` comment sent from the signer's personal wallet by mistake unstakes
  that wallet's balance — a real footgun. A payload sent to the multisig's hGRAM wallet contract from
  a non-owner fails the contract's owner check and bounces the 0.1 GRAM back; nothing is burned.
- **Stale order.** A multisig order may be signed long after it is built. `instant` mode depends on
  `maxBurnableTokens`, which moves with the round, so an instant-mode order signed later can exceed
  capacity. The modal must warn that an instant unstake should be signed promptly, and that a
  best-rate order is the safe choice for an order that will sit awaiting signatures.
- **Amount exceeding the balance** at signing time (the holder moved hGRAM meanwhile): the contract
  rejects and the fee bounces. Worth a line in the docs, not a dApp guard — the dApp cannot know.
- **hGRAM wallet not yet deployed** — `walletState` is undefined, so the holder has no hGRAM and
  nothing to unstake. The unstake tab already handles a zero balance; the modal must not offer a
  destination derived from a non-existent contract.
- **Amount edited behind the open modal** — prevented by the requirement-6 snapshot. Worth an explicit
  test: open the modal, change the field behind it, confirm every displayed value holds.
- **`isChainReady` false** — empty fields, no deep link, no fabricated address.
- **Clipboard unavailable** (`navigator.clipboard` rejects on an insecure context or a denied
  permission): today's `CopyField` chains `.then` with no `catch`, so a rejection is an unhandled
  promise and the check-mark never appears. With a payload too long to retype by hand, this stops
  mattering silently — add a rejection path that at least leaves the text selectable.
- **Deep link unsupported** by the holder's wallet: the copy fields are the primary mechanism and the
  link is the convenience, so the modal must remain fully usable if the link does nothing.

## Open questions & assumptions

- **Confirmed: the payload route works for multisig.ton.org.** Its order-type list includes an
  "Arbitrary order" taking a destination address, a TON amount and an `Order BOC (body cell in
Base64)` — precisely the three values requirement 3 produces. This is what de-risks the approach;
  it is no longer a bet.
- **Confirmed: `bin` is a real deep-link parameter**, documented by docs.ton.org, Tonkeeper and
  Tonhub, carrying standard base64 that is then percent-encoded, with `amount` required alongside
  it. Tonkeeper and Tonhub both implement it. MyTonWallet's support is described only in secondary
  sources (its documentation URL currently 404s) and Telegram Wallet's is undocumented entirely —
  neither is a target here, but neither should be promised in the copy.
- **Answered: Tonkeeper builds a real multisig request from a `bin=` link.** Verified by hand on
  2026-09-03: the payload survives, the request waits for the other signers, and signing sends it
  on-chain. This is what promoted the deep link from convenience to primary flow.
- **Still open: Tonkeeper does not preselect the connected multisig.** `ton://transfer` has no
  sender parameter, so the user must switch wallets themselves. Requirement 17 warns them. A real
  fix would pin the recipient inside the message rather than rely on the sender — see the follow-up
  below — but the SDK exposes no builder for it.
- **Refuted: pinning the deposit `owner`.** Raised as a follow-up, and wrong. `createDepositMessage`
  stores a null owner, which the treasury reads as "the sender" — so whoever pays the GRAM receives
  the hGRAM, which is both the intended behaviour and what `/docs/staking-without-the-app/` already
  documents ("The hGRAM is sent back to the same address the transfer came from"). Pinning the owner
  to the connected multisig would _introduce_ a payer-receiver split rather than close one: a
  signer's personal wallet would pay and the multisig would receive. The wrong-wallet case is
  therefore not a misdirection of funds, only a stake made from the wrong account of the same party.
  No change.
- **Refuted: a jetton-transfer route.** Sending hGRAM to the treasury as a standard jetton transfer
  would have let a multisig use its ordinary "send jetton" form with no payload paste at all. The
  protocol owner confirmed on 2026-09-03 that the treasury does not accept any incoming hGRAM
  transfer, so this is off the table permanently — not deferred. The payload route is the only one.
- **Deferred: widening multisig detection.** `multisigCodeHashes` holds one hash; other multisig
  builds fall through to the reactive hint. Left alone.
- The changelog date is left as `2026-XX-XX` until the implementing session.
