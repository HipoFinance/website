# Multisig orders go straight to the wallet app

The [earlier session today](2026-09-03-multisig-partial-unstake.md) shipped a partial unstake for
multisig holders and left one question open: whether Tonkeeper builds a multisig _order_ from a
`ton://transfer` link carrying a `bin` body, or silently falls back to the signer's personal wallet.
It was undocumented, so requirement 15 of `specs/multisig-partial-unstake.md` made it a test.

The test came back better than the fallback the spec had prepared for. Tonkeeper creates a real
multisig request from the link: the payload survives, the request sits waiting for the remaining
signers, and when another holder opens Tonkeeper and signs, it goes on-chain. That inverted the
design — the deep link was never the convenience beside the copy fields, it was the flow — and the
dialog full of base64 was, in the reporter's words, very long and frightening.

| commit    | subject                                                      |
| --------- | ------------------------------------------------------------ |
| `ab19ba2` | Hand the order to the wallet app instead of showing a dialog |
| `5cda9f0` | Lead the docs and FAQ with the wallet-app flow               |
| `a4a4f14` | Sync the released locales with the wallet-app flow           |

## The dialog is now a fallback

Pressing Stake or Unstake with a detected multisig opens the link directly, both tabs alike, with
nothing in between. `Model.send` routes to a new `sendViaWalletApp`, which captures the snapshot,
hands over the link and raises a note; `openMultisigGuidance` survives only for the reactive path,
where a wallet we could not identify as a multisig rejected the transaction.

What remains in the dialog is what a user needs when something already went wrong: a retry button,
the three order fields, and the `d`/`w` comment protocol for wallets that neither handle a `ton://`
link nor accept a pasted payload. The comment protocol is no longer the primary instruction for
either tab — it survives here and on `/docs/staking-without-the-app/`, whose whole subject is
staking without the app.

## Knowing that nothing opened

Handing over a deep link reports nothing back, which is the one hard part of this design. There is no
success callback and no error; a browser with no `ton://` handler simply does nothing. The signal we
do have is the page itself: still visible and still focused a moment later means nothing took the
link. That is what raises the fallback, 2.5 seconds after the hand-off, gated on both
`document.visibilityState` and `document.hasFocus()` so that returning from a wallet app does not
trip it.

The snapshot is deliberately **not** recaptured for the fallback. The order it displays has to be the
order the link carried, down to the query id, or a user who copies fields after a failed hand-off
would be signing something subtly different from what they just tried to send. `Model.pause` clears
the watchdog with the other timers, so it cannot fire into a paused island.

## The wrong-wallet defect, now load-bearing

Tonkeeper does not preselect the connected multisig, and `ton://transfer` has no sender parameter
that could make it. This was a footnote when the dialog carried a warning the user read before doing
anything; it is the main risk now that the link is the flow, and the two directions are not
symmetric:

- A wrong-wallet **unstake** is harmless. The order is accepted only by the hGRAM wallet it was built
  for, so sent from anything else it bounces and nothing is burned.
- A wrong-wallet **stake** succeeds, and the hGRAM lands in the wallet that paid — the signer's
  personal wallet rather than the multisig. Payer and receiver still match, so nothing is
  misdirected; the position is simply held by the wrong account of the same party.

So the app raises a dismissible note naming the connected multisig immediately after the hand-off,
and repeats the warning under the fallback's retry button. `app.multisig.transferNote` was reused
unchanged for both: written for `1c51dc1`, it already said exactly the right thing.

There is no protocol-level fix to reach for: the sender is the owner by design, and that is the
behaviour we want. The note is the mitigation.

## Copy

Twelve keys the revision left unreferenced were deleted rather than left dangling — `check-i18n`
reports an unused locale key as `extra`, so a locale keeping them would fail the gate. Two were
added (`titleFallback`, `introFallback`), leaving 25. The docs page and both FAQ entries now lead
with the wallet-app request; all of it shipped in the nine `indexed` locales.

## Polling every 10s

Unrelated to the multisig work but reported in the same session: the app felt slow to refresh. The
block poller was on a 30s cycle, and it now runs every 10s. The multisig flow makes that more
visible than it was — a request lands whenever its last signature does, with no `waitForCompletion`
watching for it, so the poll is the only thing that will notice.

It was not lowered to the 5s that was also on the table, for two reasons worth writing down since
the next person to touch this will have the same instinct. The gateway allows **120 r/m per IP**
(`rate=120r/m` in the nginx repo's `nginx.conf`) and a tick fans out five or six reads, which
`limit_req` counts _before_ `proxy_cache` — cache hits buy no headroom. That puts 10s at ~36 r/m,
which survives a second tab; 5s would put two open tabs over the limit, and three consecutive 429s
is exactly what trips the failover to the public endpoint. Separately, `/block/latest` carries a
1-5s micro-cache upstream, so a sub-5s poll would partly re-read what it had just been given.

Block time is _not_ a reason, though this session first wrote it down as one. TON produces blocks in
roughly 400ms now, far below any interval worth polling at — `waitForCompletionDelay = 250` in
`Model.ts` had that right all along, fifteen lines from where the wrong figure was added.

The constant carries that reasoning, and both the `ton-v4-read-endpoint` spec and the nginx config
comment cite the polling figure — the spec is updated here; see the follow-up for the other.

### Verification performed

- `npm run build` — clean, 523 pages, `check-i18n` passing.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 18 groups passed.
- **The flow itself was verified on mainnet by the reporter**, on the previous deploy: Tonkeeper
  created the multisig request, a second holder signed it, and the operation reached the chain. This
  is the requirement-15 test, and it passed apart from wallet selection.
- Both edited files syntax-checked with esbuild; this repo still has no typechecker.

### Follow-ups

- ~~Pin the deposit `owner` to the connected multisig.~~ **Withdrawn — the premise was wrong.**
  `createDepositMessage` stores a null owner, which the treasury reads as "the sender", so whoever
  pays the GRAM receives the hGRAM. That is the intended behaviour and what the docs already say.
  Pinning the owner would have _created_ a payer-receiver split instead of closing one: a signer's
  personal wallet paying while the multisig received. The wrong-wallet case is a stake from the
  wrong account, not a misdirection of funds — payer and receiver are the same party throughout.
  Nothing to fix.
- **The nginx repo's comment still says 30s.** `config/v4.hipo.finance.conf` explains its
  `limit_req` sizing with "The island polls every 30s"; the rate limit itself still holds at 10s
  (~36 r/m against 120 r/m), so nothing needs reconfiguring, but that comment and this repo's
  `specs/ton-v4-nginx.conf` copy are now stale and should be corrected together, since the two are
  meant to stay in sync.
- **The 2.5 s watchdog is a guess.** No wallet reports back, so the delay is tuned to feel prompt on
  desktop without tripping on a slow app launch. If reports come in of the fallback appearing after
  Tonkeeper opened, raise it or add a `visibilitychange` listener that cancels the timer outright.
- The fallback path itself — a browser with no `ton://` handler reaching the dialog, and
  multisig.ton.org's "Arbitrary order" form accepting the three values — has still not been walked
  end to end on mainnet.

### Decisions declined

- **Removing `d` and `w` outright.** Asked for, then qualified in the same message by asking what
  happens for someone not using Tonkeeper. Read as a revision rather than a contradiction: they are
  gone from every primary path and from both FAQ leads, and survive only in the fallback dialog and
  the app-less docs page. Easy to strip fully if that reading was wrong.
- **Keeping the old dialog as an intermediate step**, with the deep link as a button inside it. That
  is what the previous session shipped, and it is the thing that was too long.
