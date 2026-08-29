# 2026-08-29 — Splitting the app island

Second session of the day, and step 2 of the plan set out in
`changelog/2026-08-29-bake-live-numbers.md`. The app island shipped 312 KB
gzipped on every load of `/stake/`, `/unstake/`, `/rewards/`, `/stats/` and
`/defi/`, and a sourcemap breakdown put roughly three quarters of it in two
dependency stacks that most visitors never need. Both are now behind dynamic
imports.

**AppIsland: 312 KB → 48 KB gzipped.**

## Commits

| Commit    | Description                                                 |
| --------- | ----------------------------------------------------------- |
| `5c24646` | Load the wallet layer only when a wallet is actually needed |
| (this)    | Load the chain layer only on pages that read the chain      |

## A correction to the plan

The previous entry claimed `/stats/` and `/defi/` need none of the TON stack,
on the grounds that `StatsPage.tsx` imports `Model` as a type only and reads
Prometheus over HTTPS. That was wrong about `/stats/`. The _Model_ it reads
polls the chain: `statsRateFormatted` is chain-only ("the rate card must show
the protocol rate or nothing at all"), `protocolFee` comes from
`treasuryState.governanceFee`, and `controlBackgroundJobs` deliberately resumes
the block poller when `activePage === 'stats'`. Only `/defi/` is genuinely
chain-free.

So rather than a separate wallet-free island for those two pages — which would
also have meant a second `transition:persist` element and a second home for
TonConnect's widget root — both stacks became lazy inside the one island. That
keeps the island contract in `AppLayout.astro` exactly as it was.

## The wallet layer (`5c24646`)

`@tonconnect/ui` and `@tonconnect/sdk` are ~750 KB of source. `connectWallet`
already constructed `TonConnectUI` on demand; only the module was static.

`loadTonConnect()` now fetches it on two triggers: the visitor presses Connect,
or they arrive with a stored session. The second is what `initTonConnect` used
to do eagerly for everyone — construct TonConnect so a restored session shows
the address in the header — and it is now conditional on the
`ton-connect-storage_bridge-connection` localStorage key, read synchronously.
The key was verified against the installed `@tonconnect/sdk`, not assumed.
Safari private mode falls back to in-memory storage, where there is no session
to restore anyway, so the miss is correct; a throw (storage disabled) means the
same.

`THEME`, `CHAIN` and `WalletNotConnectedError` moved onto the loaded module. A
local `NotConnectedError` stands in where there is no wallet layer yet to throw
TonConnect's own, and `isNotConnectedError()` treats the two alike, so the
"session expired" path still fires for both.

The header's Connect button dims and stops taking presses while the chunk is in
flight. Deliberately no new label: a "Loading…" string would need translating
into all ten locales to say less than the disabled state already does.

## The chain layer (this commit)

`@ton/core`, `@ton/ton`, `@ton/crypto` and `@hipo-finance/sdk`, plus the `zod`,
`axios`, `tweetnacl` and `jssha` they drag in, are about two thirds of what was
left. New `src/components/app/chain.ts` re-exports every runtime value from
them; `Model.ts` keeps only `import type` and reaches values through `chain!.X`.

`ensureChain()` runs from `init()` on every page except `/defi/`, as an autorun
on `activePage` so navigating away from `/defi/` starts it then. `ensureWallet()`
loads the chain too, because `connectWallet`'s `onStatusChange` needs
`Address.parseRaw` to read the connected account.

`isChainReady` is the observable that restarts everything when the module lands:
the `connectTonEndpoint` autorun returns early until it flips, then
`setTonClient` sets the `tonClient` observable, and the `readTimes` /
`readLastBlock` autoruns re-run off that.

**`pollyfills.ts` moved from the island's first import into `chain.ts`'s.**
Rollup keeps side-effectful imports in source order within a chunk, so that is
what guarantees `Buffer` is installed before the TON libraries evaluate.
Importing it from the island would have pulled `buffer` back into the eager
chunk for everyone.

### The money path

`amountInNano` calls `toNano` in a computed, so it cannot produce a value before
the chain layer arrives. It returns `undefined` then — no hand-rolled
decimal-to-nano conversion was written to avoid the gap.

`isAmountValid` had to be adjusted with it: left alone it would have painted the
amount field in its error colour while a chunk downloaded, which is a lie about
what the visitor typed. It now falls back to the parse flag until the chain is
ready. `isAmountPositive` stays false regardless, so the stake button remains
disabled — which is the intended gate.

In practice the gap is nearly invisible: `isWalletConnected` requires an address,
which requires `ensureWallet`, which awaits the chain. A connected visitor
therefore always has the chain ready, and an unconnected one sees a button that
reads "Connect" and is enabled anyway.

## Verification performed

Headless Chrome (`chrome-headless-shell`) against the real production build,
served by `astro preview`:

- **Per page, which chunks are actually requested** (from the netlog):
  `/defi/` fetches neither the chain nor the wallet chunk. `/stake/`,
  `/unstake/`, `/rewards/`, `/stats/` fetch the chain chunk and not the wallet
  chunk. All five mount the island and report **0 JS errors**.
- **Session restore still works**: seeding the localStorage key on the origin
  and revisiting `/stake/` with the same profile does fetch the wallet chunk;
  without it, it does not.
- **The chain really loads and renders**: `/stats/` came back with live figures
  — 7,996,339 GRAM staked (fresher than the gauge's own number, so it is the
  on-chain value), 17.34% APY, 23.4K stakers, prices and market caps — and the
  netlog shows 489 calls to `v4.hipo.finance`.
- **No rendered-output regression**: diffing the hydrated DOM text against a
  build from before this work, `/rewards/`, `/defi/` and `/stats/` are
  character-identical. `/stake/` and `/unstake/` differ only by the "Upgrade to
  Hipo version 2" block, which upstream commit `f4fc3f0` removed — not this work.
- The `—` on the hGRAM/GRAM rate card appears in the old build too, so it is
  pre-existing behaviour in that environment, not a regression.
- `npm run build` — clean, 512 pages, 23 s. There is no typechecker in this
  project (no `typescript` dependency), so the build plus the runtime checks
  above are the gate.

### Bundle, measured

| Chunk                  | raw    | gzipped | when it loads              |
| ---------------------- | ------ | ------- | -------------------------- |
| `AppIsland`            | 180 KB | 48 KB   | always                     |
| `chain`                | 496 KB | 140 KB  | every page except `/defi/` |
| wallet (`@tonconnect`) | 384 KB | 113 KB  | Connect, or stored session |

## Follow-ups

- **`@ton/crypto` + `tweetnacl` + `jssha` (~250 KB source)** are still in the
  chain chunk. The site never holds private keys, so they look purely
  transitive through `@ton/ton`; worth checking whether a narrower import drops
  them.
- `mobx` is 211 KB of source and now the largest single item in the eager
  chunk, at roughly a third of it.
- Nobody has connected a real wallet against this build yet — the verification
  above is headless and cannot drive a wallet extension. Worth a manual pass on
  connect, stake and unstake.
- `Model.ts` is past 2,400 lines. The chain split gave it a seam
  (`chain.ts`); more could follow if it keeps growing.
