# 2026-09-08 — An SDK value import broke every app page

`hipo.finance/stats/` stopped loading, and so did `/stake/`, `/unstake/`,
`/rewards/` and `/defi/`. The pages served HTTP 200 and rendered their static
shell; the island never hydrated. Self-inflicted, earlier the same day, and
undone within the hour.

## Commits

| Commit    | Description                                                    |
| --------- | -------------------------------------------------------------- |
| `96fea3d` | Annualise by the rate window, and stop deriving a round length  |
| `33698b5` | Take the APY from the SDK instead of computing it here — **the regression** |
| `2ca9e14` | Stop importing an SDK value into the eager island chunk         |

## What happened

SDK 6.1.0 added `computeApy(state)`, because the same formula was reimplemented
in six places across the fleet and one of them had it wrong — `dune` divided the
year by a round length, which roughly squares the result, so a ~17% pool would
have been published as ~37%. Collapsing those copies onto one implementation was
the right move everywhere except here.

`33698b5` changed this file's import from

```ts
import type { Treasury, TreasuryConfig, Wallet, WalletState } from '@hipo-finance/sdk'
```

to that plus a **value** import of `computeApy`. That single line pulled the
package's barrel — and `@ton/core` with it — into the eagerly-loaded `AppIsland`
chunk.

`changelog/2026-08-29-app-island-code-splitting.md` is exactly about why that
breaks. The TON stack lives behind `loadChain()`, and the Buffer polyfill is a
static import at the top of `chain.ts` precisely so it runs before those
libraries evaluate. Hoisted into the eager chunk, they evaluate with no
`window.Buffer`, throw, and take the island down with them.

## Measured, not guessed

|                                  | with the import | without |
| -------------------------------- | --------------- | ------- |
| `AppIsland` chunk                | 472 KB          | 186 KB  |
| TON module code in `AppIsland`   | present         | absent  |
| `Buffer` references in it        | 2               | 1       |
| Buffer polyfill in it            | no              | no      |

The one remaining reference is a `Buffer.from` inside a function that runs after
`loadChain()`, which is the pre-existing and safe pattern. The two before it
included module-evaluation-time library code, which is not.

Verified on the deployed site after the fix: `/stats/` serves
`AppIsland.Cnvsfxym.js`, 184 KB, with no TON module code — the same hash the
local build produces.

## The lesson, which is not "be careful"

The comment added alongside the bad import said computeApy was safe to pull
eagerly *because it is a pure function with no chain access*. That is true and
irrelevant. Purity of the function says nothing about what its **entry point**
evaluates: the SDK barrel re-exports `Treasury`, which imports `@ton/core`, and
importing one name from a barrel evaluates the whole module graph.

So the rule for `Model.ts` is not "prefer type imports where convenient" — it is
that **no value may be imported from `@ton/*`, `@tonconnect/ui` or
`@hipo-finance/sdk` here at all**, regardless of what that value does. Every one
of them comes through `chain.ts`. That is now written above the `apy` getter,
where the next person will be standing when they have the same good idea.

`showState.ts` in the contract repo also keeps its own copy of this formula, for
an unrelated reason worth not confusing with this one: the SDK is derived *from*
that repository, so depending on it there would point the dependency backwards.
