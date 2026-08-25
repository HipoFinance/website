# 2026-08-25 — Four GA4 events in the dApp

GA4 has been reporting page views since earlier today
(changelog 2026-08-25-google-analytics.md), but page views cannot see a stake:
the blockchain is on the other side of a wallet dialog. This adds the four
events from the spec the user forwarded, so the funnel

> sessions → `wallet_connect` → `stake_initiated` → `stake_confirmed`

can be read in GA.

## Commits

| Commit | Description                             |
| ------ | --------------------------------------- |
| (this) | Track wallet connects and stake/unstake |

## What changed

**`src/components/app/analytics.ts`** (new) — a single `track()` helper. It
resolves `window.gtag` at call time and returns silently when it is absent,
which is the normal case in dev, in `npm run preview`, and for the sizeable
share of crypto-native visitors who block analytics. It also drops `undefined`
parameters so GA never records an empty dimension, and it swallows anything
thrown: nothing in an analytics path may break a transaction.

**`src/components/app/Model.ts`** — four call sites.

| Event               | Where                                    | Parameters                    |
| ------------------- | ---------------------------------------- | ----------------------------- |
| `wallet_connect`    | `onStatusChange`, genuine connects only  | `wallet_name`                 |
| `stake_initiated`   | `send()`, before the wallet dialog opens | `amount_gram`                 |
| `stake_confirmed`   | `waitForCompletion`, on `'done'`         | `amount_gram`, `wallet_name`  |
| `unstake_confirmed` | `waitForCompletion`, on `'done'`         | `amount_gram`, `unstake_type` |

### Three things the obvious implementation gets wrong

**Connection restore is not a connect.** TonConnect replays `onStatusChange`
on every page load that restores a stored session. Firing `wallet_connect`
there would have counted returning users as new connections on every visit and
made the funnel's first step meaningless — it would routinely have exceeded the
number of sessions. The event is gated on `tonConnectUI.connectionRestored`
(available in `@tonconnect/ui` 2.4.4), which settles once the replay is over.

**`stake_initiated` fires before the wallet, not after.** Firing it on a
successful send would have made it a duplicate of `stake_confirmed` and left the
interesting number — people who opened their wallet and did not sign —
unmeasurable. The gap between the two events is the whole point of the pair.

**The amount has to be captured before the send.** `clearAmount()` runs on
completion and `unstakeOption` is a live control the user can still move while
the wallet dialog is open, so reading either at confirmation time would give the
wrong answer. `send()` now builds a small `PendingTx` descriptor and hands it to
`waitForCompletion`. That descriptor is also what keeps the old-wallet upgrade
path — the other caller of `waitForCompletion` — from emitting a stake event: it
passes nothing.

`connectedWalletName` is stored on the Model (deliberately not observable, since
no UI reads it and it would re-render on connect) so `stake_confirmed` can name
the wallet even for a session that was restored rather than freshly connected.

## Decisions

- **`unstake_type` is `instant` or `best`, not `instant` or `full`.** The spec
  said "instant / full"; the product's two options are instant and best-rate,
  and `UnstakeOption` is `'best' | 'instant'`. Sending the real value rather
  than inventing a third name.
- **`amount_gram` on an unstake is hGRAM.** An unstake burns hGRAM, so the
  figure is denominated in it. The spec asked for `amount_gram` on both events
  and one parameter name is easier to chart, so the name is kept — worth knowing
  when reading the number.
- **No `unstake_initiated`.** Not in the spec, so not added; there is therefore
  no drop-off figure for unstakes, only for stakes.
- **No amount bucketing.** The raw figure is sent. If the distribution ever
  needs to be read in a standard report rather than an exploration, a bucketed
  string parameter would be the addition.

## Verification performed

- `npm run build` — clean, 502 pages. There is no typechecker in this project
  (no `typescript` dependency, no linter, no tests), so the build is the gate.
- All four event names and all four parameter names confirmed present in the
  built `AppIsland` bundle.
- Smoke-tested the real app in a headless browser against `npm run preview`,
  where `window.gtag` is absent because the tag is host-gated to hipo.finance:
  the island hydrates, the loading placeholder is gone, the amount input and the
  connect button render, and the console is free of errors. That is the same
  code path an ad-blocked visitor takes.
- Not verifiable here: the on-chain confirmation events require a signed
  mainnet transaction. Their correctness rests on being attached to the existing
  `setWaitForTransaction('done')` branch, which is the app's own definition of
  a confirmed transaction.

## Follow-ups

- **GA console work is required before any of this appears in reports.**
  - Mark `stake_confirmed` and `wallet_connect` as key events
    (Admin → Events).
  - Register `wallet_name`, `unstake_type` and `hipo_platform` as event-scoped
    **custom dimensions**.
  - Register `amount_gram` as an event-scoped **custom metric**, not a
    dimension — it is a number, and GA will not aggregate it as a dimension.
  - None of this is retroactive.
- Treat absolute counts as a floor: analytics blocking is common among this
  audience, so the ratios between the funnel steps are the trustworthy signal,
  not the totals.
