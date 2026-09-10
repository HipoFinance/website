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

| Commit    | Description                                                |
| --------- | ---------------------------------------------------------- |
| `21fed22` | Ask the wallet once: fold the deposit into the connect URL |

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

## Verification performed

- `npm run build` — clean, 523 pages, prebuild i18n gate at 0 warnings.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 18 groups passed.
- `tsc --noEmit` against the project tsconfig: the four pre-existing errors in
  `Model.ts` (two `any[]` inferences, two `typeof this.x` annotations on arrow
  properties) and no new ones. There is no TypeScript in the devDependencies and
  the build strips types without checking them, so this was run from a
  throwaway install.
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
