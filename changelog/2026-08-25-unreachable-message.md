# 2026-08-25 — Telling "we can't look" apart from "it didn't happen"

Follow-up to changelog 2026-08-25-retry-backoff.md, which stopped a brief read
failure from ending the transaction wait but left both outcomes sharing one
message. A visitor whose stake had landed could still be told "Cannot find your
transaction". This separates them, and makes the wait ride out read failures for
the whole time the signature is valid.

## Commits

| Commit | Description                                          |
| ------ | ---------------------------------------------------- |
| (this) | Separate "cannot reach the network" from "not found" |

## What changed

**A fifth wait state.** `WaitForTransaction` gains `'unreachable'` beside
`'timeout'`:

- `'timeout'` — the chain was answering, the `validUntil` window passed, the
  transaction never appeared. It really is not there.
- `'unreachable'` — we never managed to read the chain, so nothing is known
  either way. The transaction may well have gone through.

**The poll loop no longer gives up on a failed read.** Each iteration's three
reads are wrapped, and a failure `continue`s to the next iteration instead of
propagating to the function's `catch`. The loop is bounded by the same
`validUntil` deadline as before, so a wait now keeps trying for the full five
minutes the signature is valid, however many individual reads fail on the way.

An `everRead` flag records whether the chain answered even once; at the deadline
that picks between the two states.

**`Wait.tsx`** renders both from one branch — same warning artwork and Okay
button, different heading and message.

**New strings, in all ten locales.** `app.wait.unreachableTitle` and
`app.wait.unreachableMessage`. English:

> **Cannot reach the network**
> Your transaction may still have gone through. Check your wallet before trying
> again.

The second sentence is the whole point: it sends the visitor to the one place
that actually knows.

## Decisions

- **Loop-level resilience rather than a bigger retry budget.** The request was
  to raise the retry count so a wait keeps trying while the signature is valid.
  Making the _loop_ tolerate failures reaches that goal exactly — it is bounded
  by `validUntil` itself rather than by an attempt count chosen to approximate
  it — and avoids the cost of the alternative: `retry` is shared by all fifteen
  read call sites, and a 300-attempt default would also mean `readLastBlock`
  taking five minutes to report a failure, and endpoint failover
  (`endpointFailureThreshold` = 3 consecutive failures) taking fifteen. The
  per-attempt settings from the previous change (30 attempts, 1s apart) are
  unchanged.
- **`tonClient == null` now reports `'unreachable'`, not `'timeout'`.** If the
  client was never ready, no lookup happened at all — the same distinction.
- **Translations are machine-drafted and flagged unreviewed.** That is the
  repo's documented process (`GLOSSARY.md`: drafted LLM-assisted from the
  English source plus the glossary, then reviewed by a native speaker), and
  `--update-hashes` recorded both keys as `reviewed: false` in each locale's
  `meta.json`. Terminology follows the glossary rows for _transaction_,
  _wallet_, _network_ and _try again_, and each locale's existing register was
  matched from its neighbouring `app.wait.*` strings — Sie in German, tu in
  Italian, Anda in Indonesian, and so on. They still want a native pass.

## Verification performed

- `node scripts/check-i18n.mjs` — all nine released locales at 100% coverage,
  0 missing, 0 stale, 0 extra. Only the pre-existing "not yet reviewed"
  warnings, which apply to all 590 items in every locale and are not new here.
- `npm run build` — clean, 512 pages (`check-i18n` runs as `prebuild`, so a
  missing translation would have failed it).
- Confirmed the translated strings ship: the keys are in the `AppIsland` bundle
  and the values in the per-locale `dist/i18n/<locale>.json` catalogs, spot
  checked for fa, de, tr, pt-br and ar.
- Smoke-tested `/stake/` and `/fa/stake/` headlessly: both hydrate, both read
  the chain (APY renders, in Persian digits on the Persian page), no console
  errors.
- Not reproducible here: the `'unreachable'` screen itself needs a real read
  failure during a real transaction. Its wiring is covered by the two states
  being the only paths out of the loop.

## Follow-ups

- Native review of the two new strings in all nine locales.
- The old-wallet upgrade path (`upgradeOldWallet`) shares `waitForCompletion`
  and therefore inherits both the resilience and the new state — worth a look
  if that flow ever gets its own copy.
