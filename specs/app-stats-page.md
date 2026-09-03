# Stats page in the app navigation

**Status:** implemented

## Goal

Give the Hipo statistics their own page in the dApp, reachable from the header
navigation between **Reward** and **DeFi**, so the nav reads
`Stake | Reward | Stats | DeFi`. Figures come from `gauge.hipo.finance/data`,
which the app already fetches and almost entirely discards, falling back to the
contract values the app reads anyway when the gauge does not apply — on testnet
or when it cannot be reached.

## Context

Navigation is a single MobX value, not a router — `type ActivePage = 'stake' | 'reward' | 'defi'`
(`src/components/app/Model.ts:22`), defaulting to `'stake'` (`Model.ts:72`).
`App.tsx:33-47` picks the page component from it: the stake group is the
fallback, `'defi'` and `'reward'` are explicit branches.

The state round-trips through the URL hash. `readFragmentState` whitelists the
accepted page values (`Model.ts:1334-1338`) and `writeFragmentState` emits
`#/page=<name>/`, omitting the default (`Model.ts:1349-1362`).

**The component already exists.** `src/components/app/Stats.tsx` renders APY,
Staked and Holders plus links to `stats.hipo.finance` and the TON explorer. It
is rendered unconditionally as part of the stake group (`App.tsx:39`), so it is
visible below the Stake/Unstake form and nowhere else.

Each header nav entry is an `<li>` in the nav `<ul>` (`Header.tsx:54-151`)
carrying **four icon variants** — `public/images/app/page-<name>-{brown,white,orange,black}.svg` —
switched by breakpoint and dark mode. `page-stats-*.svg` does not exist.

`loadHipoGauge` (`Model.ts:1364-1381`) fetches `gauge.hipo.finance/data` and
keeps **only** `result.hton.holders_count`. It is called once from `init` and
reschedules itself only on failure, so on the success path the data is fetched
once per page load and never refreshed. For comparison, the HPO landing page
polls the same endpoint every 300s (`src/scripts/hpo-data.js:14`).

The endpoint returns `treasury` (`current_tvl` in nano, `current_apy`), and a
`market` block for each of `ton`, `hton`, `hpo` and `btc` with `current_price`,
`market_cap`, `total_volume`, `total_supply`, `circulating_supply`,
`market_cap_rank` and `price_change_percentage_{24h,7d,14d,30d,60d,200d,1y}`,
plus `holders_count` on `hton` and `hpo`. **Its keys still use the pre-rename
names**: `hton` is hGRAM and `ton` is GRAM. It takes no network parameter and
serves mainnet figures only.

Today the panel's APY and Staked are contract-derived: `model.apy` from
`treasuryState.previousRate`/`currentRate` and `times` (`Model.ts:596-608`),
`model.currentlyStaked` from `treasuryState.totalCoins` (`Model.ts:623-631`).
`treasuryState` is referenced 33 times across the model — it drives the
exchange rate, fee estimates and unstake options — so it is read from the chain
every 10s on the stake form whether or not the Stats page uses it. (Since 2026-09-03 the Stats page polls at
5min rather than 10s — `Model.scheduleNextBlockRead` — matching the gauge, since only
`statsRateFormatted` and `protocolFee` on that page come off the block poller at all.)

Page components follow a shared shape: a `max-w-5xl p-4 pb-32` wrapper, a
centred `text-3xl font-bold` title and a one-line subtitle (`Reward.tsx:10-12`,
`Defi.tsx:10-13`).

## Approach

Add `'stats'` as a fourth `ActivePage`, and make the gauge endpoint the primary
source for every figure the statistics show.

`Stats.tsx` keeps its current markup and its current place under the Stake
form — the inline block stays, since APY is what a user wants while deciding
how much to stake. The new page renders that same component at the top,
followed by market sections, so the two can never drift.

### Source selection

The gauge is the source whenever it can be, with the contract as fallback. One
predicate decides it:

```
useGauge = isMainnet && gauge != null
```

- **Testnet** → contract. The endpoint takes no network parameter and serves
  mainnet figures, so gauge values would contradict the testnet badge.
- **Gauge unavailable** → contract. Covers both a failed first load and a
  persistent outage.
- **A refresh that fails after a success keeps the last good gauge values**
  rather than flipping the panel to contract values mid-session. The two agree
  closely, so switching back and forth would look like noise. `gauge` is only
  ever replaced by a successful response, never cleared on failure.

**Holders has no contract fallback.** The treasury exposes only `getTimes`,
`getTreasuryState` and `getMaxBurnableTokens`, and `TreasuryConfig` carries no
holder field — a holder count means indexing every jetton wallet, which is why
the gauge supplies it. So when `useGauge` is false the Holders row cannot fall
back: it is **hidden on testnet**, where a mainnet holder count would be
misleading, and shows a `—` placeholder on mainnet while the gauge has not
loaded, where it is expected to arrive shortly.

The market sections have no contract equivalent either, and are mainnet
figures. On testnet the page shows the Protocol group only, with a line noting
that market data is mainnet-only.

The nav entry is a copy of the existing DeFi `<li>` with the name swapped,
inserted before it. This is deliberate duplication: the four entries are
already near-identical markup, and factoring them into a `<NavItem>` component
is a larger refactor than this change justifies. Rejected alternatives: a
router (the app has none by design, per `CLAUDE.md`), and making Stats a tab on
the Stake page (the maintainer specified a sibling page).

Icons ship as **placeholders at the final paths**, so replacing them later is a
file swap with no code change.

`loadHipoGauge` is widened to keep the whole response behind a typed shape, and
given a success-path refresh so the figures do not go stale.

A **refresh button** on the Stats page fetches immediately and restarts the
300s countdown, so a user who has just refreshed does not get another request
seconds later. This falls out of the existing shape rather than needing new
scheduling logic: `loadHipoGauge` already calls `clearTimeout` on entry
(`Model.ts:1365`), so once the success path reschedules, calling it again
cancels the pending timer and starts a fresh interval. The button is therefore
a direct call to `loadHipoGauge`, guarded against double-firing.

`model.apy` and `model.currentlyStaked` are left in place — `apy` also feeds
the reward projection at `Model.ts:336-360` — they simply stop being what the
statistics render.

### Page content

Everything is read-only; nothing here needs a connected wallet.

| Group        | Figures                                                                      | Gauge source                        | Fallback when `useGauge` is false |
| ------------ | ---------------------------------------------------------------------------- | ----------------------------------- | --------------------------------- |
| **Protocol** | APY                                                                          | `treasury.current_apy`              | `model.apyFormatted`              |
| **Protocol** | Staked                                                                       | `treasury.current_tvl` (nano)       | `model.currentlyStaked`           |
| **Protocol** | Holders                                                                      | `hton.holders_count`                | none — hidden or `—`              |
| **hGRAM**    | Price (USD), 24h change, market cap, 24h volume, circulating supply, holders | `hton.market`, `hton.holders_count` | none — section hidden             |
| **HPO**      | Price (USD), 24h change, market cap, 24h volume, holders                     | `hpo.market`, `hpo.holders_count`   | none — section hidden             |
| **GRAM**     | Price (USD), 24h change                                                      | `ton.market`                        | none — section hidden             |

`btc` is fetched but not shown — it is not a Hipo figure.

## Changes

- `src/components/app/Model.ts`
  - add `'stats'` to the `ActivePage` union (line 22) and to the `page`
    whitelist in `readFragmentState` (line 1335)
  - add a `HipoGauge` interface for the response, replacing the inline
    single-field type at line 1368
  - store the parsed response on a new `gauge?: HipoGauge` observable, keeping
    `holdersCount` as-is so nothing existing changes
  - reschedule `loadHipoGauge` on success at the same 300s cadence as
    `hpo-data.js`, not only in `catch`
  - add an `isGaugeRefreshing` observable, set while a fetch is in flight and
    cleared in both the success and failure paths, so the button can show
    progress and refuse to fire twice
  - add a `useGauge` computed — `isMainnet && gauge != null` — and never clear
    `gauge` in the failure path, so a failed refresh keeps the last good values
  - add `computed` formatters for every figure in the table above, reusing the
    existing `formatCompact1Fraction` helper; `current_tvl` is in nano and needs
    dividing by 1e9, matching `currentlyStaked`. The APY and Staked formatters
    return the gauge value when `useGauge`, else delegate to the existing
    `apyFormatted` and `currentlyStaked` rather than duplicating their logic
- `src/components/app/App.tsx` — add an
  `else if (model.activePage === 'stats')` branch rendering the new page. Leave
  `<Stats model={model} />` in the stake group untouched.
- `src/components/app/Header.tsx` — insert a fourth `<li>` between the Reward
  and DeFi entries, copying the DeFi entry with `'defi'` → `'stats'` and the
  label `Stats`.
- `src/components/app/Stats.tsx` — point APY and Staked at the new
  source-selecting computeds instead of `model.apyFormatted` and
  `model.currentlyStaked` directly, and make the Holders row conditional: hidden
  on testnet, `—` on mainnet while the gauge has not loaded.
- `src/components/app/StatsPage.tsx` — new. Standard page wrapper, title and
  subtitle, `<Stats model={model} />`, then the hGRAM / HPO / GRAM sections.
  Carries the refresh button, placed beside the page title, disabled while
  `model.isGaugeRefreshing` is set. Uses the `RefreshCw` icon from
  `lucide-react`, already a dependency and already used in
  `StakeUnstake.tsx:4`, so no new asset is needed.
- `public/images/app/page-stats-{brown,white,orange,black}.svg` — new
  placeholder assets at the final paths, sized to match the existing `page-*`
  icons, to be replaced with the designed versions later.

## Acceptance criteria

- [x] The app header shows four entries in the order `Stake`, `Reward`,
      `Stats`, `DeFi`.
- [x] Clicking `Stats` renders the statistics page and no Stake/Unstake form.
- [x] Clicking `Stats` changes the URL to `https://hipo.finance/app/#/page=stats/`.
- [x] Loading `/app/#/page=stats/` directly opens the Stats page with the
      `Stats` nav entry highlighted.
- [x] An unrecognised value such as `/app/#/page=bogus/` still falls back to the
      Stake page rather than rendering blank.
- [x] The `Stats` entry shows its active state — orange underline on desktop,
      orange icon on mobile — only when it is the active page, matching the
      other three.
- [x] The statistics panel still renders below the Stake/Unstake form, as it
      does today.
- [x] The existing links `/app/#/page=reward/` and `/app/#/page=defi/`, used
      from `introduction/hipo-rewards.md:25` and
      `hipo-tokens/hipo-staked-gram-hgram.md:13`, still open their pages.
- [x] APY, Staked and Holders match `result.treasury.current_apy`,
      `result.treasury.current_tvl` and `result.hton.holders_count` from a
      concurrent `curl https://gauge.hipo.finance/data`.
- [x] The hGRAM price, market cap, volume, supply and holders match
      `result.hton` from the same response.
- [x] The HPO price, market cap, volume and holders match `result.hpo`, and the
      GRAM price and 24h change match `result.ton`.
- [x] Only one request to `gauge.hipo.finance/data` is issued per page load,
      visible in the network panel.
- [x] After the gauge refresh interval elapses, a second request is issued
      without reloading the page.
- [x] Clicking the refresh button issues exactly one new request.
- [x] Clicking refresh restarts the countdown: after the click, no automatic
      request is issued until a further 300s have passed, verified by watching
      the network panel across that window.
- [x] The refresh button is disabled and shows progress while a fetch is in
      flight; clicking it repeatedly during that time issues no extra requests.
- [x] With `gauge.hipo.finance` blocked in devtools from first load, APY and
      Staked still render, matching the values shown before this change, and the
      market sections are hidden rather than blank.
- [x] In that state the Holders row shows `—` on mainnet, and the button
      returns to its enabled state with no error overlay or blank screen.
- [x] Blocking the endpoint _after_ a successful load and clicking refresh
      leaves the previously loaded gauge figures on screen — the panel does not
      switch to contract values mid-session.
- [x] On `/app/#/page=stats/network=testnet/`, APY and Staked come from the
      testnet contract and differ from the mainnet gauge values; the Holders row
      and the hGRAM, HPO and GRAM sections are hidden, with a note that market
      data is mainnet-only.
- [x] The Stake/Unstake form still works with the gauge endpoint blocked —
      balances, exchange rate and the submit button are unaffected.
- [x] `npm run build` completes with no TypeScript errors.

### Verification status

Driven against a real browser and the dev server. The Claude Chrome extension
would not connect, so the checks run through Playwright against the installed
Chrome, from a scratchpad outside this repo — no test dependency was added to
the project, which has none by design.

41 automated assertions across three scripts, all passing: navigation and routing,
every displayed figure compared against a concurrent
`curl https://gauge.hipo.finance/data`, the refresh button, the in-flight guard,
gauge blocked from first load, gauge blocked mid-session, testnet, the stake
form with the gauge blocked, and the mobile nav at 360px.

The two timer criteria were measured over real wall clock rather than reasoned
about: one request on load, a manual refresh at t+150s, **no** automatic request
at t+300s — proving the click restarted the countdown rather than the original
timer surviving — and the automatic refresh landing 300s after the click.

Two findings came out of running it rather than reading it:

1. **A hydration-breaking import.** `StatsPage.tsx` imported `TokenStats` — an
   interface — as a value. `npm run build` passed, but Vite's dev ESM has no
   runtime binding for a type, so the island died with
   `does not provide an export named 'TokenStats'` and the app rendered nothing.
   Fixed with a type-only import. The production build never caught it.
2. **`text-green` is not a class in this theme.** `global.css` defines no
   `green`; `Reward.tsx:109` uses `text-green-600`. Changed to match.

Caveats on what "passing" covers: the active-state check asserts the desktop
underline, not the mobile icon swap, which is driven by the same `activePage`
condition. The testnet APY assertion checks that the testnet figure differs from
mainnet (9,219.72% vs 15.39% — testnet contract data is meaningless, which is
the point) rather than checking a specific value.

One false alarm worth recording, because it would otherwise look like a bug in
the history: the first timer run reported gauge requests at +20s and +49s and
failed all three assertions. It was the dev server, not the code — the run
started moments after a Vite cache clear, and a dependency re-optimisation
reloads the island, which re-runs `init()` and refetches. Adding
`framenavigated` logging to the test distinguishes the two; the clean re-run
shows a single navigation and exact 300s spacing.

## Risks & rollback

**Two sources for the same figure can disagree.** APY and Staked now have a
gauge value and a contract value, and which one shows depends on network and
fetch state. They are spot-checked as identical — during this session
`current_apy` and `current_tvl` matched the contract getters exactly — so a
visible jump when the source switches would signal gauge lag rather than a bug.
The mid-session criterion pins the one case where a switch would be jarring:
after a successful load, a later failure keeps the gauge values rather than
flipping.

**Holders can vanish.** It is the only figure with no fallback, so it is absent
on testnet and shows `—` on mainnet until the gauge responds. A row that
disappears entirely on testnet is a layout change, not just a value change, and
needs checking at mobile width alongside the 360px criterion.

**`useGauge` is a two-term predicate that gates a lot.** If `gauge` is
accidentally cleared in the failure path, every mainnet user silently falls back
to contract values and loses the market sections — with no error, since that is
a legitimate state. Covered by the mid-session criterion.

**This does not reduce network traffic.** `treasuryState` is read regardless,
because the exchange rate, fee estimates and unstake options depend on it. The
change consolidates where the _statistics_ come from; it does not remove a
fetch. (As of 2026-09-03 that read repeats every 10s only on the stake form; the
Stats page takes it every 5min, matching the gauge.)

**Gauge lag.** The gauge mirrors the contract. Spot-checked during this
session, `current_apy` and `current_tvl` matched the contract getters exactly,
so it is a faithful mirror — but it is a mirror, and it can lag by a round.

**Widening `loadHipoGauge` can break the holders count.** It currently guards on
`res.result.hton.holders_count >= 0` and throws otherwise. A stricter parse
across more fields could reject responses it accepts today. Mitigation: keep the
existing guard exactly as-is, treat every new field as optional, and never throw
on a missing market field.

**Gauge keys use the old names.** `hton` is hGRAM and `ton` is GRAM. Mapping
them the wrong way round would put GRAM's price under an hGRAM label — a
plausible mistake that no type checker catches. Covered by the value-matching
criteria.

**A failed manual refresh must not strand the button.** The existing `catch`
reschedules a retry after 5s but has no notion of a UI state to clear. If
`isGaugeRefreshing` is set on click and cleared only on success, a failed fetch
leaves the button spinning forever. It must be cleared in both paths.

**Mobile nav crowding.** The bottom bar gives each entry `flex-1`
(`Header.tsx:54`); a fourth entry narrows all of them. If it overflows, shorten
the label or drop the icon on mobile.

Rollback is a single revert: no data, no persisted state, and an unknown
`page=` value already degrades to the Stake page, so a stale `#page=stats`
bookmark stays harmless after a revert.

## Open questions

None. One point is decided rather than open, and recorded here because the
request assumed otherwise: **Holders has no contract fallback.** The treasury
has no getter for it and no field carrying it, so under the two fallback
conditions the row is hidden on testnet and shows `—` on mainnet, instead of
falling back. APY and Staked fall back as asked.
