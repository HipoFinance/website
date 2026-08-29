# 2026-08-29 — Taking the @ton/ton barrel out of the chain chunk

Fifth session of the day, and the one that settles the follow-up
`changelog/2026-08-29-app-island-code-splitting.md` opened and
`changelog/2026-08-29-static-app-shell.md` then declared impossible from this
repository. It was — the fix had to happen in `@hipo-finance/sdk`, which Hipo
owns, and now has.

**The chain chunk drops from 143,594 to 122,067 bytes gzipped (−21.5 KB, −15%).**

## Commits

| Commit    | Repo    | Description                                        |
| --------- | ------- | -------------------------------------------------- |
| `4913097` | sdk     | Depend on @ton/core instead of the @ton/ton barrel |
| (this)    | website | Take TonClient4 off the @ton/ton barrel too        |

## What the problem actually was

`@ton/ton` is CommonJS, has no `module` field and no `exports` map, so Rollup
cannot tree-shake it: requiring its entry point pulls the whole graph — the
wallet contracts, the multisig helpers, the mnemonic tooling — and through
`@ton/crypto`, the `tweetnacl` and `jssha` that go with them.

Two importers were pulling that barrel, and **both** had to stop before anything
shrank. That is why the earlier experiment measured a 28-byte saving: fixing
only this side left `@hipo-finance/sdk`'s own `require("@ton/ton")` holding the
whole graph in place.

## The SDK side (published as 4.4.0)

Every value the SDK uses — `Address`, `beginCell`, `Cell`, `Dictionary`,
`TupleBuilder`, `SendMode` — is re-exported by `@ton/ton` from `@ton/core`, and
the rest (`Contract`, `ContractProvider`, `Sender`, `DictionaryValue`,
`Builder`, `Slice`) are types. Nothing in it ever needed the client, the wallets
or the mnemonics. All five source files now import from `@ton/core`, and the
peer dependency moved with them. No API change; the emitted `.d.ts` files name
the same types from the new package.

Published with provenance via the repo's existing tag-triggered release
workflow. Its committed `package-lock.json` had drifted (4.1.0 while
`package.json` said 4.3.0) and is now in step.

## The website side

`chain.ts` takes `Address`, `Dictionary`, `fromNano` and `toNano` from
`@ton/core` directly, and `TonClient4` from
`@ton/ton/dist/client/TonClient4.js` rather than the package entry.

**The deep path is unversioned** — `@ton/ton` publishes no `exports` map, so
nothing enforces it and nothing warns if it moves. The comment in `chain.ts`
says to re-check it when bumping `@ton/ton`; a move would surface as a
build-time resolution error, not a runtime one.

The `.js` extension is not decoration. Vite resolves the extensionless path
happily, so the build passed without it — but Node's ESM resolver does not, and
that is how the end-to-end check below found it. Writing it explicitly keeps the
import correct under both resolvers.

## Verification performed

- **A real mainnet read through exactly the changed code path**, run in Node
  (no CORS, unlike the preview server): the deep-imported `TonClient4` fetched
  block 89275005, `Treasury.getTreasuryState()` returned 7,998,306 GRAM and a
  1.1596 hGRAM/GRAM rate — matching the 1.1593 baked into the page minutes
  earlier — `governanceFee` 0 → 0.00%, `createDepositMessage` built, `feeStake`
  0.1, `toNano('1.5')`/`fromNano` correct. That covers the money path's
  construction, not just its bundling.
- All five app pages under headless Chrome: shell removed on hydration, island
  renders the same character counts as before the change, **0 JS errors**.
- `WalletContractV4`, `MultisigWallet` and `WalletContractV5` are gone from the
  chain chunk. `mnemonicToPrivateKey` still appears once, via `@ton/core`'s own
  `safeSign`/`domainSignature` reaching into `@ton/crypto` — see below.
- `npm run build` clean, 512 pages; `check-i18n` ok.

### Where the bundle stands

| Chunk       | gzipped | change              |
| ----------- | ------: | ------------------- |
| `AppIsland` |   49 KB | unchanged           |
| `chain`     |  122 KB | **−21.5 KB (−15%)** |
| wallet      |  113 KB | unchanged           |

The app island was 312 KB gzipped at the start of the day and is 49 KB now, with
the two heavy layers loaded only when a page actually needs them.

## Follow-ups

- **`@ton/crypto` is still in the chain chunk and cannot be removed from here.**
  `@ton/core`'s `wonderCalculator` needs `sha256` for cell hashing, which is
  load-bearing; `safeSign` and `domainSignature` want the signing half, and the
  CommonJS barrel brings `tweetnacl` and the mnemonic helpers along with it.
  That one is upstream in `@ton/core`, which is not ours.
- `mobx` (211 KB of source) remains the largest single item in the eager chunk.
- `/defi/` still has no body mirror in the static shell.
