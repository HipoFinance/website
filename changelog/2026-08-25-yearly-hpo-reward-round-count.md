# 2026-08-25 — "Rewards after a year" was halved by a stale round length

A user reported that the rewards page understated their yearly HPO by almost
exactly a factor of two: earning ~90.9 HPO per round with rounds arriving about
every 18 hours, they expected roughly 43.6k HPO a year and the app showed
21,816.78. Their guess in the report — that the projection still assumed the old
~36-hour reward cycle — was right, and the ratio pins it down exactly:
21,816.78 / 90.9 = 240.0.

## Commits

| Commit    | Description                                             |
| --------- | ------------------------------------------------------- |
| `e59c18e` | Derive the yearly HPO reward from the live round length |

The same one-line fix was made in the legacy `webapp` repo (`43bf74a`), which
carries a near-identical `Model.ts`, but pushing it failed: that repository is
archived on GitHub and read-only. The maintainer confirmed the archive is
correct — `webapp` is no longer used and the local clone has been deleted — so
that commit is gone and this repo's dApp is the only place the fix was needed.

## What was wrong

`profitAfterOneYear` and `profitAfterOneYearOnLastLevel` both annualized the
per-round HPO amount with a literal:

```ts
const hpo = hton * exchangeRate * rewardRate * rewardCoefficient * 20 * 12
```

`20 * 12` reads as "20 rounds a month, twelve months" — 240 rounds a year, which
is a 36.5-hour round. TON's `validators_elected_for` is 65536 seconds (~18.2 h),
so a year actually holds `365 * 24 * 3600 / 65536` ≈ 481.1 rounds. Every other
part of the expression was correct, so the error was a clean 2× across the
board, which is why the reporter could spot it from a single ratio.

The count is now derived from the live round boundaries, the same source the
neighbouring `apy` getter has always used:

```ts
get roundsPerYear() {
  const year = 365 * 24 * 60 * 60
  const times = this.times
  const duration = times != null ? Number(times.nextRoundSince - times.currentRoundSince) : 0
  return duration > 0 ? year / duration : year / 65536
}
```

`profitAfterOneYear` already returns early when `apy` is null, and `apy` itself
needs `times`, so in practice the getter always sees live boundaries; the 65536
fallback only covers `profitAfterOneYearOnLastLevel`, which has no such guard,
during the first paint.

## That the reward is per round, not per something else

Worth confirming rather than assuming, since the whole fix rests on it. In
`HipoGang/app`, `updateHpoRewards` (`game/redis/jobs.go:2495`) runs once per new
`RoundSince` in `HtonRewardsLogs`, and that sorted set is filled one entry per
treasury finish-round external message (`refreshContractRewardsHton`,
`jobs.go:2061`). The amount it credits is
`balanceHton * HtonHpoRewardRate * htonExchangeRate * rewardCoefficient` — term
for term what the frontend multiplies. So one payment per validation round, and
annualizing means multiplying by the number of rounds in a year.

## Not the first time this constant bit

`webapp` commit `cf647d5` fixed the displayed APY being halved for the mirror-image
reason: a two-round annualization window left over from the `last_staked` /
`last_recovered` era, when the rates in fact advance once per round. Two
hardcoded round assumptions, both stale, both halving a headline number. Hence
deriving rather than replacing the literal with 481 — a future change to the
network's round length now carries through on its own.

---

### Verification performed

- `npx prettier --check src/components/app/Model.ts` — clean (also clean in `webapp`).
- `webapp`: `npx tsc --noEmit -p tsconfig.json` — no output, no errors.
- `website`: `npm ci` (exit 0), then `tsc --noEmit --ignoreConfig` over `Model.ts`
  alone. `npx astro check` was not run: it wants an interactive install of
  `@astrojs/check`. The standalone run reports only the two errors that bypassing
  the Astro tsconfig always produces — `astro:transitions/client` unresolved and
  `import.meta.env` untyped — and nothing from this change.
- Arithmetic checked against the report: 90.9 × 240 = 21,816 (what was shown),
  90.9 × 481.1 ≈ 43,736 (what it now shows).
- `grep` for other hardcoded round counts across `website/src`, `webapp/src`,
  `mcp/src`, `hpo-website/src`, `sdk-example/src` and `sdk/src` — no remaining
  `20 * 12` or bare `240`.

### Follow-ups

- ~~**`webapp` cannot be pushed.**~~ Settled: the archive is deliberate,
  `webapp` is retired, and its local clone has been removed. Nothing to ship
  there.
- ~~**Not verified against a live wallet.**~~ Settled: the maintainer checked a
  connected wallet after the deploy and the figure is correct. The reasoning
  here was from the code and the reporter's numbers alone — the Hipo MCP server
  was unreachable this session (`get_round_timing` closed the socket), so the
  round length came from the protocol constant rather than a live query.
- The `mcp` package computes round duration correctly and has a test for it
  (`mcp/src/protocol.test.ts`); `Model.ts` has no tests at all.
  A test around `roundsPerYear` would be the natural place to start if that ever
  changes.
- Still open: nothing has been said back to the reporter. Worth telling them
  they were right — they diagnosed it correctly from the outside.
