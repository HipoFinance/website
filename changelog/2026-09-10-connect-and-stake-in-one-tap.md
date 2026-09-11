# 2026-09-10 — Connect and stake in one wallet round-trip

Staking from a fresh browser has always cost two trips into the wallet app: one
to approve the connection, one to approve the deposit. TonConnect's
`EmbeddedRequest` feature removes the first of the two by folding the deposit
into the connect URL itself, so the wallet asks once. This session upgraded
`@tonconnect/ui` to the major that carries it and put `/stake/` on the new path.

No shipped wallet advertises the feature yet, so nothing changes for anyone
today. That is the deliberate shape of the change: every path that cannot fold
the request falls through to exactly the behaviour that was there before, and
the flow turns itself on the day a wallet in the registry says it can.

## Commits

| Commit    | Description                                                   |
| --------- | ------------------------------------------------------------- |
| `21fed22` | Ask the wallet once: fold the deposit into the connect URL    |
| `00aad1c` | Don't offer to connect over a session that is still restoring |
| `488c470` | Stop waiting on a head block that is twelve seconds old       |
| `c14051d` | Stop calling a queued unstake a completed one                 |
| `77bf60e` | Read a bounce for what it is, not as a missing transaction    |
| _pending_ | Let the wait bar say "working", not "one sixth done"          |

## What the feature actually is

TonConnect 3.0 added an `e` query parameter to the connect deeplink. It carries
a base64url-encoded `sendTransaction` / `signData` / `signMessage` request, and
a wallet that understands it shows the connection and the action on one screen,
returning the signed result inside `ConnectEventSuccess.response`.

`@tonconnect/ui` exposes it as a flag on the existing call:

```ts
const result = await tonConnectUI.sendTransaction(tx, { enableEmbeddedRequest: true })
// { hasResponse: true,  response }                       — signed
// { hasResponse: false, connectResult: { dispatched } }  — connected only
```

The SDK folds the request in only when four things hold at once: no wallet is
connected, the flag is set, the chosen wallet advertises `EmbeddedRequest` in
the wallets registry, and the encoded URL stays within 1024 characters. It is
also http-bridge only — injected browser extensions and WalletConnect never take
this path, so this is a phone-and-QR improvement and nothing else.

## Why stake and not unstake

The request has to be built before there is a connected account, which means
every field in it must be knowable in advance. A deposit is:

```ts
createDepositMessage(treasury.address, amountInNano, queryId)
```

— addressed to the fixed treasury, with an amount the visitor typed. Nothing in
it depends on who is about to connect, so it qualifies.

An unstake is `createUnstakeMessage(wallet.address, …)`, addressed to the
visitor's **own hGRAM wallet**, whose address is derived from the owner. There
is no owner until the connect half finishes, so the message cannot exist yet.
This is the exact case TON's own documentation names as out of scope ("actions
whose payload depends on post-connect data"), and no amount of restructuring
changes it — the address is a function of the answer we are still waiting for.
`/unstake/` is therefore untouched, and its button still reads Connect Wallet
whether or not an amount is in the field.

The size budget was measured rather than assumed: a deposit request serialises
to 208 characters of JSON, 278 base64url, against a 1024 limit that also has to
hold the universal link, the manifest URL and the session id. Comfortable, and
the wire encoding TonConnect uses is more compact still.

## The three outcomes, and why `dispatched` is cheap here

`hasResponse: false, dispatched: true` is the dangerous one: the deposit went
into the connect URL, the wallet may have signed and submitted it, and the
response simply never came back. The documentation is emphatic that a dApp must
not silently retry there, because retrying stakes twice.

Hipo is unusually well placed for that, because `waitForCompletion` already
ignores the `SendTransactionResponse` entirely — it decides success by polling
the account's transactions for the `queryId` it generated. So the ambiguous case
is handed to the same watcher the normal path uses: if the wallet did submit,
the queryId shows up and the dialog says staked; if it did not, the watcher
times out into the dialog that is already written for that. Nothing resends.

`dispatched: false` means the wallet never saw the deposit — an ordinary
connect. The button becomes a plain Stake and the visitor presses once more,
which is the flow as it stands today.

## What the press does now

`Model.canConnectAndStake` is true only when no wallet is connected, the stake
tab is active, and a valid positive amount is in the field. The submit button
reads Connect Wallet until then, so the connect-first route — connect, see a
balance, use Max, then decide an amount — is still there and still the default
for anyone who has not typed anything.

`connectAndStake()` loads the wallet layer, builds the deposit with no `from`
field (there is no account yet to name), and sends it with the flag. Two things
it has to handle that `send()` does not:

- **A dismissed picker.** This press covers the connect step too, so closing the
  wallet list rejects here. `send()` responds to a rejection by offering the
  multisig hint, which is right when a transaction was handed over and never came
  back and wrong when nothing was ever signed. The hint is gated on an address
  having actually arrived.
- **A multisig account.** `send()` routes multisig wallets to
  `sendViaWalletApp()` before touching TonConnect, using a flag read from the
  connected account's code hash. That flag does not exist before connecting. So
  on the embedded path, when no signed result comes back, the model waits for the
  first account read to settle — `tonBalance` and `isMultisig` land in the same
  action — and shows the multisig guidance instead of sitting in a five-minute
  on-chain wait that was never going to resolve.

Both waits are bounded (`when(…, { timeout })`) and fall through to the normal
behaviour rather than hanging if a read is slow.

`stake_initiated` moved from before the call to after it, and fires only once
the deposit actually reached the wallet. On the connected path a press always
reaches the wallet dialog, so firing early was accurate; here a press can end in
a bare connect, and counting that would double up against the Stake press that
follows it.

## The upgrade

`@tonconnect/ui` 2.4.4 → 3.0.2. The public export surface was diffed first:
nothing was removed, four types were added
(`EmbeddedTResponse` and its three aliases). The DOM hooks that
`keepRuntimeStyles` and `trackInputModality` depend on — `tc-root`,
`tc-widget-root`, the goober `<style id="_goober">`, the `data-tc-*`
attributes — are identical between the two versions, which is what made the
ClientRouter survival hacks worth trusting through a major bump. They were then
tested rather than trusted; see below.

`guardedSendTransaction` was split so both call paths share one session guard.
The five-minute `StaleSessionError` race, the disconnect and the "session
expired" message all still wrap the embedded call unchanged.

## Wallet support today

The registry the SDK actually reads, `config.ton.org/wallets-v2.json`, lists 37
wallets on the day of this change. All 37 advertise `SendTransaction`, 12 add
`SignData`, and **none** advertise `EmbeddedRequest`. Tonkeeper carries it in
the staging registry, so it is in the pipeline rather than hypothetical.

This was the one real argument against shipping now, and it was weighed
explicitly: the happy path cannot be exercised against a real wallet yet. What
tipped it is that the fallback is not a new code path to be trusted — it is the
old behaviour, reached whenever the fold does not happen, which today is always.
The change is inert until the registry entry promotes, and then it is live
without another deploy.

## The restore window, found in testing

`21fed22` shipped with a race, reported from a browser that was already
connected: the wallet opened and showed nothing to approve, and only a manual
disconnect and reconnect put it right.

The first suspicion was that a session persisted by the old SDK was unreadable
by the new one. It was not, and this is worth recording because it is the
expensive thing to go looking for: `BridgeConnectionStorage` diffs to zero lines
between `@tonconnect/sdk` 3.4.1 and 4.0.2 — same key, same record shape, no
version marker in either direction — `BridgeProvider.restoreConnection` is
identical, `PROTOCOL_VERSION` is 2 in both, and the protocol package's bump to
3.0.0 is purely additive. There is nothing to migrate.

The actual cause is a window this feature opened. `isWalletConnected` is
`address != null`, and the address is set by `onStatusChange`, which only fires
once TonConnect has finished restoring the stored session. Restoring cannot
begin until the ~750 KB wallet chunk has downloaded. Between those two moments
the model reports "not connected" about a visitor who is, in fact, connected —
and until this feature, that was harmless, because the only thing the button
offered then was a Connect the visitor would have to mean.

Now it offered a Stake. And the path it takes is destructive:
`sendTransaction` on a connector whose `connected` is still false takes the
connect branch, `TonConnect.connect()` aborts the restore in flight and
`BridgeProvider.connect()` writes a pending record straight over the stored
session. The visitor is signed out, the wallet opens holding a bare connect
request, and the deposit is dropped — `hasResponse: false`, `dispatched: false`,
which the model correctly reads as "nothing was sent" and silently returns from.

The fix is to stop treating "TonConnectUI exists" as "the wallet layer is
ready". `loadWallet` now awaits `connectionRestored` when a stored session is
present, so `isWalletLoading` covers the whole window; `canConnectAndStake`
requires `!isWalletLoading`, so the label cannot flip under a finger; and both
`connect()` and `connectAndStake()` re-check for a connection after their await,
because the restore can land between the press and the handler. A press that
arrives during the window is queued rather than lost — `connectAndStake` waits
for the first account read and then goes through the ordinary `send()`.

`ensureWallet` also had to check `walletPending` before `tonConnectUI`: the
field is assigned part-way through `loadWallet`, and the rest of it is now
exactly the part a second caller must not skip.

The cost is that a **dead** stored record — a session the bridge no longer
honours — holds the button at Connect Wallet for TonConnect's full 12-second
restore deadline. Measured at 12.4 s in a browser seeded with a bogus record;
a live session settles in well under a second. A press in that window is not
dropped, only queued. That is the right side of the trade: the alternative is
signing out a visitor whose session was fine.

## An upstream gap worth knowing about

TonConnect's desktop and Telegram connect flows check
`checkRequiredWalletFeatures(wallet.features, { embeddedRequest: {} })` before
folding a request into the connect URL. Its multi-wallet **mobile** universal
link does not — it cannot know which wallet will answer, so it attaches the
request regardless and marks it consumed. The dApp would then be told
`dispatched: true` for a deposit no wallet could read, and would sit through a
five-minute on-chain wait for it.

So `dispatched` is now believed only when the wallet that actually connected
advertises `EmbeddedRequest` in `device.features`. A wallet without it cannot
have parsed the `e=` parameter, so there is nothing to lose by disbelieving it.

## Thirty seconds to confirm a stake, and where they went

Also reported: the wait dialog took about 30 seconds. TON produces a block every
400 ms, so the expectation of one or two was reasonable. Almost none of it was
the protocol.

The deposit pipeline is four hops — user wallet → treasury (`op::deposit_coins`)
→ parent (`op::proxy_tokens_minted`) → the visitor's hGRAM wallet
(`op::tokens_minted`) → back to the visitor (`op::transfer_notification`), the
queryId riding all four. `waitForCompletion` matches that last one, so "done"
is an honest claim: the hGRAM exists by hop three. Across 112 real mainnet
deposits from the last twelve days, all four hops completed **in the same
masterchain block** in 109 of them, and within two seconds in the other three.
Basechain is unsplit, so the collator runs the whole cascade in one block. Hop
count costs nothing.

What costs is the read path, and it is ours. `/block/latest` is the one mutable
resource on the v4 gateway, and it is cached like the immutable ones: nginx
`proxy_cache_use_stale updating` with `background_update`, plus
`Cache-Control: public, must-revalidate, max-age=5` on the way out. With the app
polling every 10 s the entry is always expired on arrival, so every requester is
handed the stale copy while the refresh happens behind them, and the browser then
holds that already-old copy for another five seconds. Every read in the wait loop
is pinned to whatever seqno that returns, so the entire wait inherits the lag.

Measured against `v4.hipo.finance`, polling the way the app does and comparing
each answer to the same URL with a cache-buster:

```
t=0s   plain 91832148  busted 91832211   63 blocks behind
t=10s  plain 91832226  busted 91832236   10
t=20s  plain 91832226  busted 91832260   34
t=30s  plain 91832260  busted 91832287   27
t=40s  plain 91832287  busted 91832310   23
t=50s  plain 91832310  busted 91832337   27
```

Average 30.7 blocks, which at the observed 2.5 blocks/s is **12.3 seconds of
staleness** — and the busted responses came back faster too (~130 ms against
190–630 ms). That is the thirty seconds.

Three changes here, none of which touch what "done" means:

- The loop asks for the head by a URL neither cache has seen, and falls back to
  `TonClient4` if that fetch fails for any reason — the client owns endpoint
  failover, so it stays the authority, just not the default.
- It skips the rest of an iteration when the head has not moved. The account
  cannot have changed, and the two reads below it are the expensive half; roughly
  nine iterations in ten were rescanning a block already scanned.
- `waitForCompletionDelay` goes from 250 ms to 1 s. Block time was never the
  constraint — the upstream indexer's own ~1 s cache is — and at 250 ms the loop
  ran at ~4.7 req/s against the gateway's 120 r/m allowance, so a wait longer
  than ~25 s started drawing 429s and retrying.

And the success message no longer waits on the balance refresh behind it:
`setWaitForTransaction('done')` moved above `readLastBlock()`, which is four
contract reads worth half a second to two seconds.

Two options were measured and rejected. Closing the dialog on the visitor's own
outgoing message saves **nothing** — that transaction and the notification are
on the same account in the same block in 109 cases out of 112, so one scan
returns both — and it would claim success before the treasury had seen the
deposit, which is flatly wrong on the bill path where hGRAM only appears at
settlement. Watching the hGRAM wallet or the treasury instead reads through the
identical stale head, so it is one more address to poll for zero gain.

The real fix is one repository over: `/block/latest` should not be served with
`use_stale updating` and a five-second browser max-age. That is an nginx change
and is not in this commit; the client-side work above recovers the same time
without waiting for it, and the gateway change would additionally fix the
balances and rate on `/stake/`, which are currently up to 16 s behind.

## "Successfully unstaked", for an unstake that had not happened

Chasing something much smaller turned this up. The wait's progress bar sits at
one sixth for the whole wait and then jumps to the success screen, so the plan
was to make its middle state (`'sent'`) real. Two things came out of tracing the
contracts first, and the small one was wrong.

`'sent'` is **not** dead code — it fires routinely, and deleting it would have
been a mistake. But the state it precedes was making a claim it had not earned.

`waitForCompletion` matched on `query_id` alone: it skipped straight past the op
(`inPayload.skip(32)`) and treated _any_ message coming back with that queryId
as success. What actually arrives depends entirely on which branch the treasury
took:

| path                                            | message back to the visitor's own wallet                     | the dialog said         |
| ----------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| Instant, liquidity available                    | `withdrawal_notification`, carrying the GRAM                 | Successfully unstaked ✓ |
| **Full**, or instant with a round holding bills | `ownership_assigned` — **one nanoton**, a receipt for a bill | Successfully unstaked ✗ |
| Instant, liquidity short                        | `gas_excess` — the rollback                                  | Successfully unstaked ✗ |

The middle row is the default. `treasury.fc` takes the instant-payout branch
only when `mode <= instant || round_since == 0`, and `round_since` is non-zero
whenever any round holds bills — which is nearly always on a live pool. So a Full
unstake is answered by a bill, the visitor is told "Successfully unstaked" about
three seconds later, and the GRAM arrives when the round settles, hours away.

This was confirmed on chain rather than argued from the source. A real mainnet
unstake from earlier the same day, traced end to end:

```
unstake_tokens → reserve_tokens → mint_bill → assign_bill → ownership_assigned  value=1
```

One nanoton, and the whole trace spans **0 seconds** — every hop in the same
block, which is why the false success arrives so promptly. Across the last 60
treasury transactions the split was 7 instant payouts (`reserve_tokens →
proxy_tokens_burned`) to 1 bill (`reserve_tokens → mint_bill`), so neither
outcome is rare.

The wait now reads the op alongside the queryId and says which of the three
happened:

- `withdrawal_notification` / `transfer_notification` → `'done'`, as before.
- `ownership_assigned` → a new `'queued'` state: "Unstake queued — your hGRAM is
  reserved. Your GRAM arrives when the current round settles." This is a success
  screen, not a warning: it is what the Full option asks for. A deposit can land
  here too, though only if `instant_mint` is ever turned off — it is `true`
  today, which is the only reason the stake side was honest.
- `gas_excess` on an unstake → a new `'rejected'` state: nothing moved, the
  hGRAM balance is unchanged. On a _deposit_ the same op is just change coming
  back and says nothing, so it is not treated as an answer there.

Three details worth keeping:

- A batch is read whole before deciding, rather than trusting whichever message
  the endpoint returned first. Transactions come back newest-first and one batch
  can carry several messages from the same queryId, so the outcomes are ranked —
  value in hand beats a promise, a promise beats a rollback.
- The op is read against the _request's_ kind, not the active tab, because the
  tab is a live control the visitor can still move while the dialog is open.
  `waitKind` is captured when the wait starts, and the dialog's titles now come
  from it rather than from `isStakeTabActive`.
- `stake_confirmed`/`unstake_confirmed` gain a `settlement` field, `'instant'` or
  `'queued'`. Until now every bill counted as a completed unstake in that funnel,
  and a rollback counted as one too; a rollback now sends no event at all.

## A bounce read as a missing transaction

The last path still lying about an outcome, and the cheapest to fix once the op
was already being read.

If the receiving contract refuses the message — `unstake_tokens` with a fee or
an amount it will not take — it bounces straight back to the sender. A bounce
body is `0xFFFFFFFF` followed by the first 256 bits of the message that was
refused, so the fields sit one slot further in than usual. The old parse skipped
32 bits and read the next 64 as the queryId, which on a bounce means reading the
_original op_ glued to the top half of the real queryId. Verified against
constructed cells rather than assumed:

```
bounce body, OLD parse:  0x595f07bc01234567   matches queryId? false
bounce body, NEW parse:  0x123456789abcdef    matches queryId? true
```

`0x595f07bc` is `op::unstake_tokens`. It can never match, so the wait ran to the
end of its `validUntil` window and then said "Cannot find your transaction"
about a request that had failed in the same second — five minutes of spinner for
an instant, knowable failure.

Bounces are now detected from `info.bounced` (the flag, not a `0xFFFFFFFF`
sniff) and parsed at the right offset, and get a `'bounced'` state of their own:
"Unstake not accepted — the contract returned your transaction, so nothing was
unstaked." Kept separate from `'rejected'` because that one blames instant
liquidity and this one cannot; nothing about the pool was the problem. On the
stake side it adds that the GRAM came back less the network fee, which is what a
bounce does with the value.

The analytics guard flipped from excluding `'rejected'` to naming the two
outcomes that count, so the next state added to this enum cannot silently start
reporting itself as a confirmed stake.

## The progress bar, finally

The thing this last stretch set out to do, arrived at last.

The bar was designed to advance a notch as the deposit's messages moved from
contract to contract — a real design, for a chain where those hops were
observable moments apart. TON is no longer that chain: with sharding low, all
four hops land in the same block, on 109 of the 112 mainnet deposits sampled.
There are no intermediate moments left to draw. What the visitor actually saw
was a bar frozen at one sixth for the whole wait, then a success screen — which
reads as stuck, and is worse than no bar at all.

So it is indeterminate now: a segment that travels the track on a loop, saying
the only thing that is true, which is "working, and we cannot say for how long".
The `'signed'` / `'sent'` split no longer changes what is drawn — both mean in
flight to anyone watching, and the protocol no longer leaves a gap between them
worth a distinct picture. `'sent'` stays in the model, because it is still the
honest state for the rare transaction that does straddle blocks.

Two details. The travel is animated on `inset-inline-start` rather than a
transform, so it follows the writing direction with no RTL special case — the
segment runs right-to-left on `/fa/` without a line of extra code. And an
animation that never stops is exactly what `prefers-reduced-motion` is about, so
under that setting the bar holds still as a full-width, dimmed track rather than
disappearing.

## Verification performed

- `npm run build` — clean, 523 pages, prebuild i18n gate at 0 warnings.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 18 groups passed.
- `tsc --noEmit` against the project tsconfig: the four pre-existing errors in
  `Model.ts` (two `any[]` inferences, two `typeof this.x` annotations on arrow
  properties) and no new ones. There is no TypeScript in the devDependencies and
  the build strips types without checking them, so this was run from a
  throwaway install.
- Headless Chromium against `npm run preview`, for the restore-window fix: with
  no stored session the button reads Connect & Stake as soon as an amount is
  typed; with a seeded stored session it holds at Connect Wallet and only flips
  once the restore settles (12.4 s for a deliberately dead record).
- Headless Chromium against `npm run preview`:
  - `/stake/` — static shell removed on hydration, button reads Connect Wallet
    with an empty field and Connect & Stake once an amount is typed, the picker
    opens with 12 wallets, one `<style id="_goober">`, no console errors.
  - `/unstake/` — Connect Wallet both empty and with an amount, i.e. unchanged.
  - `/fa/stake/` — Connect & Stake renders as اتصال و استیک, so the new key
    reaches the island through the inlined catalog.
  - Open the picker, dismiss it, navigate `/stake/` → `/stats/` through the
    ClientRouter, then press the header's Connect: the modal re-opens fully
    styled, still one goober tag, `#ton-connect-widget-root` intact. This is the
    check CLAUDE.md asks for on a TonConnect bump.
- The indeterminate bar measured in a browser in three modes, by sampling the
  fill's x position over time: LTR travels 13 → 351 px, RTL travels 292 → −46 px
  (direction follows the writing mode), and with `prefers-reduced-motion: reduce`
  it does not move at all and fills the track. `role="progressbar"` with
  `aria-busy` and no `aria-valuenow`, which is how indeterminate is spelled.
- The bounce offsets checked against constructed cells: a normal body still
  yields its op and queryId, a bounce body yields the queryId only under the new
  parse, and the body is exactly the 128 bits the length guard requires.
- All four outcomes rendered in a browser, in `en`, `de`, `fa` and `ru`, by driving
  the model into each state through a temporary debug hook (added, screenshotted,
  reverted; the shipped bundle was then checked to confirm it contains no
  `__hipoModel`). Sixteen combinations, no overflow in any of them — the long
  German title fits on one line, the RTL layout keeps `hGRAM` in Latin, and the
  `/ru/stake/` pass confirms the copy follows `waitKind` rather than the tab.
- Head-block staleness measured directly against `v4.hipo.finance`, plain URL
  versus cache-busted, six samples at the app's own 10 s cadence: 30.7 blocks
  behind on average, ~12.3 s. Numbers above.
- Eager island chunk measured against a build of `HEAD`: 51,700 → 52,329 bytes
  gzipped, +629 for this change. `@tonconnect/ui` stays out of it — the bump
  lands entirely in the lazily-fetched chunk.

## Follow-ups

- Watch for `EmbeddedRequest` appearing on Tonkeeper in
  `config.ton.org/wallets-v2.json`. That is the moment this becomes visible, and
  the moment the happy path becomes testable on a real device. Worth a manual
  pass then: one embedded stake, and one deliberately abandoned at the wallet
  screen to confirm the timeout dialog rather than a duplicate.
- CLAUDE.md still describes the eager island as "~48 KB gzipped". It measured
  51.7 KB before this session's change, so the figure has drifted for reasons
  predating it; left alone here rather than folded into an unrelated commit.
- The nine translations of `app.model.buttonConnectAndStake` are machine-made
  and unreviewed, like the rest of the catalogs. `--update-hashes` was run;
  `--mark-reviewed` deliberately was not.
- If the feature turns out to convert well, `signData` takes the same flag —
  nothing on the site needs it today.
