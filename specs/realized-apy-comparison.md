# Realized APY comparison across TON liquid-staking protocols

**Status:** **Phase 1 complete, awaiting the review gate.** The dataset exists
(`src/data/lst-rates.json`, 731 daily samples per protocol), every rate index is
source-verified, and the example chart is published for review. Nothing has been
built for the site yet, and phases 2–3 do not start until the gate passes.
§10 records what Phase 1 found, including two places where this spec was wrong.

## 1. Summary

Every TON liquid-staking protocol advertises an APY, and none of those numbers
are comparable to each other: they differ in compounding assumption, in whether
the fee is taken before or after, and in the window they average over. But all
of these protocols are rate-based — one LST redeems for a growing quantity of
GRAM — and that rate is readable from the chain at any past block. Dividing the
rate today by the rate 365 days ago gives what a holder who did nothing for a
year actually earned, on the same definition for every protocol, with no
cooperation from any of them.

This feature backfills two years of daily exchange rates for the measurable TON
LSTs, derives a trailing-365-day realized APY series from them, and draws one
chart comparing the protocols — on a new public page and as a chart on `/stats/`.
The measurement is published with its addresses and get-methods so that anyone
can reproduce it.

The reason two years of rates produce only one year of chart is the definition:
a point at date `D` needs the rate at `D` and at `D − 365d`.

```
APY(D) = rate(D) / rate(D − 365d) − 1

2024-09 ─────────────── 2025-09 ─────────────── 2026-09
[   backfill only    ][    the visible chart window    ]
```

## 2. What was verified before this spec was written

This section exists because the spec's central claim — that a two-year backfill
is possible at all — is an empirical one, and because two independent research
passes disagreed on one protocol. Provenance is marked so the implementer knows
what to re-check rather than trust.

**Verified directly, by live request:**

- `https://mainnet-v4.tonhubapi.com` executes get-methods against historical
  state, keyless and free. `GET /block/utime/{unix_ts}` returns the masterchain
  seqno for a time; `GET /block/{seqno}/{address}/run/{method}` runs the method
  at that block and returns `exitCode` plus a stack.
- Hipo's `get_treasury_state` answered `exitCode: 0` at seqno 51,886,137
  (2025-09-12) and 45,630,316 (2024-09-12), and `exitCode: -256` at 32,664,898
  (2023-09-13) — the treasury was not yet deployed there. That `-256` is the
  useful part: it proves the endpoint executes against historical state rather
  than replaying today's.
- bemo v2 (`EQCSxGZP…`) is **not** a rebasing token, and its `[1]/[0]` is **not**
  its yield. Supply across three samples ran 399,083.9 → 286,841.5 → 315,209.5
  GRAM — non-monotonic, which rebasing cannot produce — while `[1]/[0]` moved
  only 1.000000 → 1.005645 over a year. A 0.56% annual ratio on a 315k-GRAM pool
  is not a staking return, so index `[1]` does not capture that pool's rewards.
  This is the case that motivates requirement R4.

**Cross-checked between two independent research passes** (they agreed to five
significant figures on every rate, which is the main evidence the indices are
right): the addresses, methods and stack indices in §5.1, and the current /
1y-ago / 2y-ago rates.

**Single-sourced, to re-verify during implementation:** archive depth back to
seqno 2,000,000 (2020-02-05); Hipo's v1→v2 address change around 2024-03-17;
a `deficit` field inserted at Hipo stack index 5 on 2026-09-06; bemo v1's
drain from 12.2M to 1.17M GRAM.

## 3. Requirements

1. **R1 — Trailing-365-day realized APY.** For each protocol and each day `D`
   in the visible window, the plotted value is `rate(D) / rate(D − 365d) − 1`,
   expressed as a percentage. No annualization of a shorter window, no
   smoothing, no compounding adjustment.
2. **R2 — Two years of daily rates, backfilled once.** A script samples each
   protocol's rate at 00:00 UTC for every day from `today − 730d` to today,
   by resolving that timestamp to a masterchain seqno and running the
   protocol's rate get-method at that block.
3. **R3 — The series is kept current.** After backfill, one new sample per
   protocol per day is appended, without re-reading history.
4. **R4 — Source-verified index, and a plausibility gate.** A protocol's line
   is drawn only when (a) the stack field read as its rate has been confirmed
   against the contract's source, not inferred from stack position, and (b) the
   computed series passes the sanity checks in §7. A protocol failing either is
   withheld from the chart and named in the methodology as unmeasured, never
   silently omitted.
5. **R5 — Hipo's series is cross-checked against our own metric.** The
   backfilled Hipo rate must agree with `hipo_treasury_hton_rate` from
   Prometheus over the year the two overlap. A disagreement beyond rounding is
   a bug in the backfill and blocks the ship.
6. **R6 — The page is baked into the HTML, and the control is an enhancement.**
   The chart, the headline GRAM figures and the table all render at build time
   for the default stake, per the rule `src/pages/vs.astro` already follows.
   The stake input (R14) then re-scales them client-side. A visitor with no JS,
   and every crawler, still gets a complete, correct page for the default
   stake — the control may never be the only way to see a number.
7. **R7 — The same dataset drives both surfaces.** The `/stats/` chart and the
   public page derive from one dataset and one APY computation, so the two can
   never disagree.
8. **R8 — Reproducible by a reader.** A methodology page under `/docs/` lists,
   per protocol, the contract address, the get-method, which field is read, and
   the formula — enough for a reader to recompute any point on the chart.
9. **R9 — Honest about coverage.** Each series is drawn only where a full
   365-day window of rates exists for that protocol. A series that starts later
   starts later on the chart; it is never back-extended, interpolated across a
   gap, or measured off a partial window.
10. **R10 — Translated everywhere, which means promoting `/vs/`.** The chart's
    home is the existing `/vs/` page, which is English-only today. Shipping this
    means moving `vs` out of the `ENGLISH_ONLY` map in `src/data/lastmod.mjs`
    into `ROUTES`, adding a `src/pages/[locale]/vs.astro` twin, dropping
    `localized={false}`, and translating the whole page — not just the chart —
    into every released locale, along with the docs methodology page and its
    sidebar label. The `prebuild` gate must pass.
11. **R11 — No new Prometheus surface.** This feature adds no metric to the
    exporter, does not change `PROM_QUERY`, and does not touch the nginx query
    allowlist. (§4 explains why Prometheus cannot hold this data.)
12. **R12 — Live, material protocols only.** The chart is a decision aid for
    someone choosing where to stake today, so it carries only protocols that are
    live and of a size worth choosing. A protocol is drawn only if, measured from
    the dataset itself: its pool holds at least 1M GRAM today; its pool is not
    down more than 50% from its own two-year peak; and its rate has risen within
    the last 90 days. A protocol failing any of these is **not drawn and not
    named on the page** — an abandoned project does not get free exposure on our
    site. It is named, with the reason, only on the methodology page, so the
    field is auditable without being advertised.

    **R12 is an inclusion rule and is never itself charted.** An earlier draft
    visualised pool size as a share of each protocol's own peak. That is dropped:
    pool trajectories are not what a staker came to find out, and Hipo is the one
    included protocol not currently at its own peak (82%), so the chart cost more
    than it explained. The rule still runs — it is what excludes bemo v1 — it
    just runs behind the page rather than on it.

13. **R13 — Samples store the two raw integers, not the ratio.** Each sample
    records total staked and LST supply as read from the chain; rate and pool
    size are both derived. R12's liveness tests need the pool size over history,
    and a stored ratio cannot produce it.
14. **R14 — The headline unit is GRAM, not percent.** A percentage gap of about
    one point does not read as a reason to move a stake; the same gap in GRAM
    does. The page leads with: pick a stake, and see the extra GRAM a Hipo staker
    earned on it over the measured window, with a USD equivalent. The APY series
    stays on the page as the supporting evidence beneath it, never as the
    headline. Requirements R1–R9 are unchanged — this is a presentation layer
    over the same measurement, and no number on the page may come from anywhere
    but the measured rates.
15. **R15 — The comparison chart is zero-baselined and in absolute units.** It
    plots the running total of extra GRAM (`stake × (growth_hipo − growth_x)`),
    starting at zero on the day the stake is placed. It must not plot each
    protocol's stake value on a truncated axis: three near-identical growth lines
    with a cropped y-axis is the standard way to make a small difference look
    large, and it would undermine the one thing this page has — that every figure
    on it is measured.

## 4. Why not Prometheus

The obvious home for a rate time-series is the Prometheus that already holds
`hipo_treasury_hton_rate`. It does not work, for four independent reasons, and
the spec records them so this is not re-proposed later:

- **Retention is one year.** `operation/stack/monitor.yaml` runs both collectors
  with `--storage.tsdb.retention.time=1y`, unchanged since the first monitoring
  commit. A trailing-365d chart over a one-year window needs two years of rates.
  The data would roll off the left edge exactly as fast as the chart needs it.
- **There is no backfill path.** No remote-write receiver, and
  `--web.enable-admin-api` is commented out on both services. Importing history
  would mean stopping two independent Prometheus instances on two hosts
  (`hf-main`, `hf-back`) and writing blocks into each host's data dir by hand.
- **The public read path is a byte-exact allowlist.** `nginx/nginx.conf:178`
  matches one percent-encoded query string and five allowed steps. Every new
  metric means an nginx change deployed in the same window.
- **The shape is wrong.** This is ~6 values per day, forever. Prometheus is
  built for a scrape every 15s with a year's horizon; this is the opposite.

A few tens of KB of JSON is the right size of hammer.

## 5. Data

### 5.1 Protocols in scope

Rates below are GRAM per 1 LST, as measured during research. "now" is
2026-09-12.

| Protocol   | LST   | Address                                            | Rate                                             | now      | 1y ago   | 2y ago       |
| ---------- | ----- | -------------------------------------------------- | ------------------------------------------------ | -------- | -------- | ------------ |
| Hipo       | hGRAM | `EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ` | `get_treasury_state`, total_coins / total_tokens | 1.166292 | 1.074153 | 1.033382     |
| Tonstakers | tsTON | `EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR` | `get_pool_full_data`, `[2]/[13]`                 | 1.155602 | 1.075229 | 1.037757     |
| Stakee     | —     | `EQD2_4d91M4TVbEBVyBF8J1UwpMJc361LKVCz6bBlffMW05o` | `get_pool_full_data`, `[2]/[13]`                 | 1.150903 | 1.067859 | 1.030359     |
| KTON       | KTON  | `EQA9HwEZD_tONfVz6lJS0PVKR5viEiEGyj9AuQewGQVnXPg0` | `get_pool_full_data`, `[2]/[17]`                 | 1.066662 | 0.989625 | not deployed |
| bemo v1    | stTON | `EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k` | `get_full_data`, `[1]/[0]`                       | 1.169537 | 1.084670 | 1.044913     |

Implied trailing-365d APY at the right edge: Hipo 8.5%, bemo v1 7.8%, Stakee
7.7%, Tonstakers 7.4%, KTON 7.8% (off a sub-parity base — see §7).

That table is the list of protocols whose rate is _measurable_. Which of them
are actually _drawn_ is a separate question, decided by R12.

#### Who gets a line

The chart answers "where should I stake", so it carries the live field, not the
archaeology. Fewer lines is also simply easier to read.

- **Core — Hipo, Tonstakers, Stakee.** The three large, live, rate-readable
  pools. This is the comparison that matters, and the chart is built around it.
- **KTON — conditional.** Passes or fails R12 on size; also has the sub-parity
  launch problem (§7) and an index not yet source-verified. Decided at the
  review gate.
- **bemo v1 — expected to fail R12.** Its pool has drained from 12.2M to 1.17M
  GRAM, roughly −90% from its own peak, because its users left for v2. A pool
  that is being abandoned is not a place to send a reader, whatever its rate is
  still doing. Confirm against the measured dataset rather than these figures,
  then drop it.
- **bemo v2 — excluded.** The field believed to be its rate does not track its
  rewards (§2), so it cannot be measured at all. Since v1 is also out, bemo
  disappears from the chart entirely. The methodology page must say so
  explicitly: bemo is absent because its live pool is unreadable and its
  readable pool is dead, not because it performed badly.

Excluded outright — named on the methodology page, and nowhere else:

- **TON Whales** — not liquid staking. Its minter is a plain TEP-74 jetton and
  its admin contract answers `exit code 11, method not found` to every
  rate-bearing method tried, which is consistent with that reading.
- **uTONic (uTON)** — index frozen since 2025-01, ~0% accrual. Nothing to plot,
  and an abandoned protocol either way.
- **Island Stake (iTON)** — $32 TVL, 1 holder, blacklisted by tonapi.
- **Aqua, Tonhedge, Utyab, JVault** — not liquid staking (stablecoin, options,
  DEX/jetton staking, NFT vaults respectively).

The asymmetry in R12 is deliberate and worth stating: a protocol is dropped for
being dead or tiny, never for a low APY. A live competitor that beats Hipo stays
on the chart.

### 5.2 Reading a rate, safely

- **Hipo** is read as `stack[0] / stack[1]` behind a **minimum-arity assertion**,
  not through `@hipo-finance/sdk`. This reverses what this spec originally said,
  and Phase 1 is why: the SDK's parser tracks today's tuple and throws
  "Not a number" on the 20-field state that covers most of the window. The SDK is
  right for reading _current_ state (which is why
  `dune/exporter/export-rates.mjs` uses it) and useless for reading _history_.
  Reading by index is safe here only because `total_coins` and `total_tokens` are
  `[0]` and `[1]` and sit ahead of every insertion, including the `deficit` field
  added at index 5. Anything past index 5 must never be read by position. Assert
  a minimum arity rather than an allowlist of lengths, the way gauge's own
  exporter does — the tuple was observed at 20, 21, 24 and 26 fields, the last
  three all within 2026-09-06/07.
- **Whales-family pools** (Tonstakers, Stakee, KTON) share a contract with two
  stack layouts: 30 items with supply at `[13]`, and 34 items with supply at
  `[17]`. Total balance is at `[2]` in both. **Branch on `stack.length`; never
  hard-code the supply index.** Reading `[13]` from a 34-item stack silently
  returns `accruedGovernanceFee` — a wrong number, not an error.
- **Timestamps resolve to seqnos via `/block/utime/{ts}`, never by
  extrapolation.** Masterchain block cadence changed from roughly 0.4/s to
  2.2/s during the window; linear extrapolation lands months away. For "now",
  use `/block/latest` — `/block/utime/{now}` answers `exist: true` with empty
  shards.

### 5.3 Storage

Two stores, with a rule that makes disagreement structurally impossible:
**the committed file is authoritative for every date it contains, and gauge
supplies only dates after the file's last one.**

1. **Baseline, committed to this repo.** `src/data/lst-rates.json`, written by
   `scripts/backfill-lst-rates.mjs`. Fixed `start` date and, per protocol, two
   arrays of daily integers — total staked and LST supply (R13) — so re-cutting
   it appends rather than rewrites and the diff stays reviewable. `null` marks a
   day with no sample. Measured size at 731 days × 5 protocols: **169 KB**, well
   above the "few tens of KB" this spec first guessed — raw integers as decimal
   strings are what cost it, and they are not optional (Tonstakers' staked total
   is ~4.5e16 nanotons, past `Number.MAX_SAFE_INTEGER`, so a JSON number would
   silently lose its low digits). It compresses to a fraction of that over the
   wire; if the committed size becomes a problem, drop the oldest year once the
   trailing window no longer needs it rather than lowering the precision.
2. **Live tail, served by gauge.** A new actor samples the same contracts once
   a day (gauge already has `robfig/cron`) and stores the daily series — a new
   shape for gauge's Redis, which today holds only latest values, no history.
   Served as `GET /lst-rates` alongside `/data`, which needs a `location` block
   in `nginx/config/gauge.hipo.finance.conf` mirroring `/data`.

Periodically the baseline is re-cut from gauge and committed, which trims the
tail the site depends on at build time.

The site's build merges the two (§6.1) and emits the computed APY series as a
**same-origin static asset**, `/lst-apy.json`, from an Astro endpoint. The
`/stats/` island fetches that — not gauge — so this feature adds no CORS
surface, no proxy allowlist entry, and no cross-origin dependency to the dApp.

## 6. Technical approach

### 6.1 Build-time data path

- `scripts/backfill-lst-rates.mjs` — one-time (and re-runnable) backfill. Node,
  `@ton/ton`'s `TonClient4` plus `@hipo-finance/sdk` for Hipo. Writes
  `src/data/lst-rates.json`. Measured throughput during research was ~0.6s per
  daily sample across all protocols, so a two-year backfill is a few minutes.
- `src/data/lst.ts` — the module the pages use, in the shape of the existing
  `src/data/gauge.ts` and `src/data/stats.ts`: one build-time fetch shared by
  every prerendered page, a 10s timeout, a `user-agent` header (the gauge host
  is behind Cloudflare and challenges a bare Node fetch), and **it never fails
  the build**. On a gauge failure the chart falls back to the committed baseline
  alone — correct, just ending at the baseline's last date.
- `src/pages/lst-apy.json.ts` — static endpoint emitting the merged, computed
  APY series for the island.

### 6.2 The page: `/vs/`, promoted

The chart's home is the **existing `/vs/` page**, not a new route. That decision
carries three consequences worth naming, because none of them is free:

- **`/vs/`'s stated editorial rule is reversed, in writing.** Its frontmatter
  comment today reads _"Hipo's own numbers only — no claims about anyone else's
  product."_ That comment must be rewritten in the same commit, to say what the
  new rule is: no claims about anyone else's _marketing_, and measurements of
  anyone's _contracts_ provided the method is published and reproducible. Leaving
  a comment in the file that the file contradicts is worse than never having
  written it.
- **`/vs/` becomes a translated route** (R10): out of `ENGLISH_ONLY` in
  `src/data/lastmod.mjs` and into `ROUTES`, a `src/pages/[locale]/vs.astro` twin
  through a shared route component, `localized={false}` dropped, and the page's
  entire existing copy — hero, both reward tables, the HPO section — translated
  into every released locale, not just the new chart. This is the largest single
  piece of work in phase 3 and it is mostly not about the chart.
- **The page keeps its build-time character.** Every figure on `/vs/` is baked
  today, and the chart is too: an inline SVG generated at build time by a
  component under `src/components/charts/`, rendered for the default stake.

The stake control is a progressive enhancement in `src/scripts/` over that static
SVG — the same pattern as `landing-data.js` and `hpo-data.js`. It rescales the
headline figures, the chart's y-axis and the table by reading the growth series
from an inlined `<script type="application/json">` payload. Only the two growth
factors per protocol per day are needed for that, which is a fraction of the full
dataset. With JS off, the page is complete for the default stake (R6).

The cost of building the chart at build time is a second renderer: this SVG
component and `LineChart.tsx` draw from the same dataset and the same derivation
(R7) but not the same drawing code. That is a deliberate trade — a React island
here would leave crawlers and link-preview bots with an empty page, and `/vs/`
exists precisely because recipients arrive through link-preview crawlers.

### 6.3 The `/stats/` chart

A sixth chart in `StatsPage.tsx`, reusing `LineChart.tsx` — which already
handles multiple series, as the hGRAM & GRAM price chart shows. Its data comes
from a fetch of `/lst-apy.json`, not from `ChartsStore`'s Prometheus query, so
`PROM_QUERY` and the nginx allowlist are untouched (R11). Because the underlying
series is daily and slow, it does not join the 5-minute auto-refresh.

The existing range selector does not apply: this chart is a fixed one-year
window. It renders with its own range label rather than following
`model.statsRange`.

### 6.4 Styling and accessibility

Five to six series need a categorical palette, which the site does not have. Add
tokens in `src/styles/global.css` and `src/styles/app.css` — declared for both
schemes in the `prefers-color-scheme: light` block, never as `dark:` variants.
Hipo takes `--color-accent`; the others take muted, distinguishable hues.

Lines are **direct-labelled at their right edge**, not distinguished by colour
alone. Latin tickers and numbers inside RTL copy go through the `num` utility or
`model.isolate`. The new SVG renderer is the second allow-listed exception to
the logical-utilities rule, alongside `LineChart.tsx`, and should say so in a
comment. The chart lives inside its own `overflow-x: auto` box on narrow
screens; the document never scrolls horizontally.

### 6.5 Internationalization

R10 makes this a real share of the work: a `compare.json` catalog per locale,
prose for the explanatory copy, the `[locale]` twin route, the docs methodology
page in `src/content/docs/<locale>/`, a sidebar entry in `astro.config.mjs` and
a translated label in each `docs-sidebar.json`, plus `app.json` keys for the
`/stats/` chart title and legend. The `prebuild` gate fails until every released
locale has all of it, so it lands in one commit. Protocol names are proper nouns
and stay untranslated.

## 7. Edge cases and error handling

- **Protocol not yet deployed** — `exitCode: -256`. Record `null`, draw nothing.
  Distinguish it from a transport failure, which is retried.
- **No full 365-day window** — no point, per R9. KTON's first clean window opens
  roughly a year after its launch, so it enters the chart mid-window.
- **KTON launched below parity** (0.9896 a year ago, crossing 1.0 around
  2026-02). Its trailing APY is therefore measured partly off recovery to par
  rather than yield. A naive "reject rate < 1" filter would silently discard its
  first nine months — do not add one. Either annotate the series or hold it
  until its window is clean; decide at the review gate.
- **Stakee's bootstrap period** read 0.609 in late 2023. Outside the two-year
  window, but gate on minimum pool size rather than on the rate, so a future
  bootstrap does not produce a 40% "loss" line.
- **bemo v1 is draining** (12.2M → 1.17M GRAM). Its rate is live and accruing,
  but a near-dead pool's APY is not what a new staker would get. This is what
  R12 exists to catch, and the expected outcome is that the series is dropped
  rather than annotated.
- **Plausibility gate (R4b)** — a computed trailing APY outside roughly 0–20%,
  or a single-day rate drop beyond ~1%, is treated as a wiring error: the series
  is withheld and logged, not drawn. A real slashing event would trip this, and
  that is the correct outcome — it should be a human decision to plot it.
- **A missing day** is drawn as a gap, never interpolated — the same rule
  `ChartsStore.maxGapSeconds` already applies.
- **Gauge unreachable at build** — baseline only, chart ends earlier, build
  succeeds, warning logged. Matches `src/data/stats.ts`.
- **A contract upgrade changing the stack** is the silent failure mode of this
  whole feature. The stack-length branch (§5.2) plus the plausibility gate are
  the defences; the daily collector must log a stack whose length it does not
  recognise rather than guess.

## 8. Phasing, and the review gate

**Phase 1 — data only.** Backfill script, `src/data/lst-rates.json`, source
verification of every rate index, the Hipo/Prometheus cross-check (R5),
evaluation of R12's liveness tests against the measured pool sizes, and a
throwaway example chart rendered locally.

**→ Review gate.** Look at the real numbers before anything is built for the
site. Decisions taken here: which protocols clear R12, how KTON is handled, and
whether the chart is worth publishing at all. Nothing in phases
2–3 starts until this passes.

**Phase 2 — keep it current.** The gauge actor, its Redis shape, the
`/lst-rates` endpoint, the nginx location.

**Phase 3 — ship.** Public page, `/stats/` chart, docs methodology page,
palette tokens, and the full translation set.

## 9. Open questions and assumptions

**Open:**

1. ~~The page's URL and name.~~ **Resolved:** it goes on `/vs/`, which is
   translated as part of shipping it. See §6.2 for what that pulls in.
2. **KTON's index 17** is verified by value but not by source — its semantics
   were inferred from a field map. R4 requires source confirmation before it
   ships.
3. **KTON's inclusion** — whether it clears R12 on size, and whether its
   sub-parity launch can be presented honestly. Settled at the review gate with
   the real chart in hand. bemo v1 is expected to fail R12 outright; confirm
   against the measured dataset and drop it.
4. ~~The default stake.~~ **Resolved: 100,000 GRAM**, with presets at 1k, 10k,
   100k, 1M and 10M. Two years pays 1,496 extra GRAM ($2,019) on the default.
   One consequence to keep in view: 10M GRAM is larger than Hipo's entire pool
   (7.0M on the last sampled day), and 1M is a seventh of it — at those sizes the
   figure is arithmetic on past rates rather than an achievable outcome, since
   the deposit would itself move the rate it is measured against. The page says
   so from 1M upward; that note must survive into the real implementation.
5. **A forward projection is available and not recommended.** Compounding widens
   the gap over five years and would look better than the measured two. It is
   also a projection, which is the advertised-number thinking this page exists to
   replace — recommended against unless clearly labelled as illustration.
6. **Whether the `/stats/` chart earns its place** given the page already
   carries five charts, and whether it shows the GRAM framing or the APY series
   (the dApp already knows the visitor's balance, which would make the stake
   control unnecessary there).

**Assumed, decided here:**

- Daily sampling at 00:00 UTC. A realized-APY series moves very little day to
  day; daily is already finer than the signal.
- The dataset stores **rates**, not APYs. APY is derived at build time, so the
  window definition can change without re-reading the chain.
- The island fetches a same-origin `/lst-apy.json` rather than calling gauge, to
  avoid adding CORS and proxy-allowlist surface to the dApp.
- Free public archive access (`mainnet-v4.tonhubapi.com`) is sufficient; no paid
  provider is in the design. The backfill is a few minutes of requests and the
  ongoing cost is a handful of calls a day.
- Protocol names are rendered untranslated in every locale.

## 10. Phase 1 results

Run on 2026-09-12. Dataset: `src/data/lst-rates.json`, 2024-09-12 → 2026-09-12,
731 daily samples at 00:00 UTC. Built by `scripts/backfill-lst-rates.mjs` against
`mainnet-v4.tonhubapi.com` in about four minutes; 3,656 of 3,655 possible samples
landed (KTON accounts for the 191 legitimately absent days).

Example chart for the gate:
<https://claude.ai/code/artifact/b354f3dd-011a-4026-9eb4-938819b536ba>

### Trailing-365d realized APY, at the right edge

| Protocol   | APY now   | Min over the window | Points | Series starts |
| ---------- | --------- | ------------------- | ------ | ------------- |
| Hipo       | **8.56%** | 3.53%               | 366    | 2025-09-12    |
| bemo v1    | 7.83%     | 3.30%               | 366    | 2025-09-12    |
| Stakee     | 7.76%     | 3.36%               | 366    | 2025-09-12    |
| KTON       | 7.73%     | 0.56%               | 175    | 2026-03-22    |
| Tonstakers | 7.46%     | 3.18%               | 366    | 2025-09-12    |

Hipo leads the live field. Two things in that table need a decision rather than
a celebration, and they are the substance of the gate:

- **Every protocol's realized APY roughly doubled over the window** — the field
  sat near 3.2–3.5% for the year ending September 2025 and near 7.5–8.6% for the
  year ending September 2026. The left edge of the chart is therefore a much
  worse-looking year for everyone, Hipo included, than the right edge.
- **Hipo's own left edge is about 3.5%**, below what was advertised at the time.
  The chart is honest in both directions or it is worth nothing, but that is a
  thing to ship deliberately, not to discover after publishing.

### R12, evaluated against the measured data

| Protocol   | Pool now     | Own 2y peak | Of peak | Rate rose 90d | Verdict  |
| ---------- | ------------ | ----------- | ------- | ------------- | -------- |
| Tonstakers | 131.28M GRAM | 131.28M     | 100%    | yes           | include  |
| Stakee     | 18.31M GRAM  | 18.31M      | 100%    | yes           | include  |
| Hipo       | 7.01M GRAM   | 8.52M       | 82%     | yes           | include  |
| KTON       | 1.75M GRAM   | 1.76M       | 100%    | yes           | include  |
| bemo v1    | 1.37M GRAM   | 15.74M      | **9%**  | yes           | **drop** |

R12 did the job it was written for: bemo v1's rate is still rising, and the
liveness test drops it anyway. Two notes for the gate:

- The 1M-GRAM floor is very low next to Tonstakers' 131M. Everything alive
  clears it, so it is not currently doing any work — consider whether the floor
  should instead be relative (a share of the largest pool).
- **Hipo is the only included protocol not at its own peak** (82%). Worth
  knowing before the second chart is published anywhere public, since that chart
  exists precisely to show pool trajectories.

### Verification

- **R5 — Hipo vs `hipo_treasury_hton_rate`: PASS.** 309 overlapping days; mean
  relative difference 1 part in 10⁶. The error grows by ±0.025% per day of
  deliberate shift — exactly one day's accrual at ~9%/yr — which is the proof
  that the two series are aligned rather than merely close. The worst single
  point, 0.03%, is Prometheus's step-picked sample landing a few hours off
  00:00 UTC. Note Prometheus only reaches back to 2025-10-31: the one-year
  retention of §4, visible in practice.
- **R4 — rate indices source-verified: PASS for all three Whales-family pools.**
  30-field layout is upstream `ton-blockchain/liquid-staking-contract` `main`
  (supply at `[13]`); 34-field is its `v2` branch (supply at `[17]`, where
  `[13]` is `accrued_governance_fee`). Tonstakers and Stakee have identical code
  hashes; KTON's deployed code is byte-identical to `v2` HEAD, not a fork.
  `total_balance / supply` is the ratio the contract itself converts at
  (`muldiv(jetton_amount, total_balance, supply)`), it excludes accrued
  governance fees rather than double-counting them, and pending deposits and
  withdrawals sit on both sides simultaneously — so never add
  `requested_for_deposit` to the numerator.
- **Layout history is clean and matches that verification.** Tonstakers and
  Stakee returned 30 fields on all 731 days; KTON `-256` for 191 days then 34
  fields for 540; bemo 15 fields throughout; Hipo 20 fields for 723 days, then
  21, 24 and 26 across its final two days.
- **Continuity across Hipo's arity changes: PASS.** 1.16265 → 1.16304 →
  1.16340 → 1.16416 → 1.16440 over 2026-09-05…09. A smooth ratio across three
  tuple changes is the evidence that `[0]/[1]` is the right read.
- **Plausibility: PASS.** Largest single-day rate move is ≤0.08% for Hipo,
  Tonstakers, Stakee and bemo. KTON moved −1.58% on 2025-03-23, within days of
  launch — consistent with its sub-parity bootstrap, and the one series where
  the gate should stay armed.

### Two corrections to this spec, found by building it

1. **§5.2's Hipo rule was wrong** — "read through the SDK" cannot read history
   at all. Corrected in place above. The general lesson: a versioned client
   library tracks current state, and a backfill needs a version-tolerant read.
2. **A one-time backfill is not purely one-time.** Three seqnos answered HTTP 500
   for the treasury no matter how often they were retried, so the script now
   falls back to a later block the same day (+1h, +2h, +6h). That is a real chain
   read, not interpolation, and a rate series does not move perceptibly within a
   day — but the daily collector in Phase 2 needs the same fallback.

### Follow-ups for Phase 2

- The gauge collector must carry the same three defences as the script: minimum
  arity for Hipo, stack-length branching for the Whales family, and the seqno
  fallback. A layout it does not recognise must be logged and refused, never
  guessed.
- gauge's Redis holds only latest values today, so the daily series is a new
  storage shape there — decide between a date-keyed hash and a JSON blob before
  writing the actor.

## 11. Review round 1 — what changed

The example chart was reviewed on 2026-09-13. Three changes came out of it.

### The liveness chart is gone

Pool size as a share of each protocol's own peak is no longer shown anywhere.
The rule stays and still excludes bemo v1; only the visualisation is dropped. Two
reasons, and the second is the honest one: a staker choosing where to stake does
not need pool trajectories, and Hipo is the only included protocol not at its own
peak, so the chart cost Hipo more than it explained. Recorded plainly because a
future reader will otherwise re-propose it. Absolute TVL is not shown either.

### The chart moves to `/vs/`

Rather than a new `/compare/` route. `/vs/` is translated as part of shipping —
the whole page, not just the chart. See §6.2, including the editorial comment in
`vs.astro` that has to be rewritten rather than quietly contradicted.

### The unit changes from percent to GRAM

This is the substantive change, and it came from the right observation: a
potential staker who reads "8.56% vs 7.46%" concludes they are barely behind and
does not move. The same fact in GRAM is a quantity they can weigh.

What the framing can and cannot do, measured at $1.35/GRAM over the full two
years, versus Tonstakers:

| Stake   | Extra GRAM with Hipo | USD    |
| ------- | -------------------- | ------ |
| 1,000   | 15.0                 | $20    |
| 10,000  | 149.6                | $202   |
| 100,000 | 1,495.8              | $2,019 |

The gap is 1.50 pp cumulative over two years against Tonstakers and 1.16 pp
against Stakee. **The framing helps a large staker and cannot help a small one.**
That is a property of the data, not of the presentation, and it is the reason
R15 forbids the obvious trick: plotting three stake-value lines on a y-axis
cropped to their range would make a 1.5% difference fill the chart. Every figure
on this page is measured, and that is the page's entire claim — a cropped axis
would trade the claim for the impression.

What is drawn instead is the running total of extra GRAM, zero-baselined, one
line per competitor, with Hipo as the zero line. It starts at nothing and grows
to the full figure, in the unit the reader banks.

Two consequences for the data:

- **The money chart needs a common start date**, since it answers "if you had
  staked on day X". T0 is the start of the window, so KTON — which did not exist
  then — cannot appear on it. It stays on the supporting APY chart, where its
  series legitimately begins in March 2026. That leaves Hipo, Tonstakers and
  Stakee on the money chart, which is exactly the core set.
- **The page needs a live GRAM price** for the USD line. `/vs/` already fetches
  the gauge at build time for exactly this (`gauge?.ton?.market?.current_price`),
  so there is no new dependency — but the USD figures date with the build, and
  the page should say so rather than imply they are live.

## 12. Implementation notes (2026-09-14)

Phases 2 and 3 were not built in the order this spec lays out. The gauge collector
(phase 2) is **not** implemented: the page ships against the committed baseline
alone, so its figures are as fresh as the last commit of
`src/data/lst-rates.json`. Re-running the backfill script and committing is the
whole update procedure until the gauge actor exists. §5.3 still describes the
intended end state.

### What shipped

| Piece                 | File                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Backfill script       | `scripts/backfill-lst-rates.mjs`                                                             |
| Dataset               | `src/data/lst-rates.json`                                                                    |
| Build-side loader     | `src/data/lst.ts`                                                                            |
| Geometry + arithmetic | `src/data/lst-geometry.ts`                                                                   |
| Build-time chart      | `src/components/charts/ValueGapChart.astro`                                                  |
| Stake control         | `src/scripts/vs-stake.js`                                                                    |
| The page              | `src/components/routes/VsRoute.astro` + `src/pages/vs.astro` + `src/pages/[locale]/vs.astro` |
| Copy                  | `src/i18n/<locale>/vs.json`, 62 keys × 10 locales, plus 4 `seo.vs.*` keys                    |

### The one structural decision

`lst-geometry.ts` exists only because `src/scripts/vs-stake.js` runs in the
browser. Had the geometry stayed in `lst.ts`, Vite would have followed that
module's `import rates from './lst-rates.json'` and bundled **169 KB of backfill
into a client script**. Split, the script is 3.7 KB and the page inlines 4.6 KB
of sampled growth factors. The rule to keep: nothing importable by
`src/scripts/` may import the dataset.

The two halves share `chartGeometry()` and `stakeOutcome()` rather than
reimplementing them, for the reason `src/data/gauge.ts` gives for the same
pattern — a second copy of the math is how the chart comes to jump the first time
a visitor touches it.

### Deviations from the spec, and why

- **R8's docs methodology page was not built.** The page carries a "How this is
  measured" block instead, naming all three contracts, their getters and the
  ratio, so the measurement is still reproducible by a reader — which is the
  requirement R8 exists to serve. A `/docs/` page would have needed its own
  translation into nine locales and a sidebar label in each; it is a follow-up,
  not a silent drop.
- **`vs.compare.vsCurrent` is a new key that the spec did not anticipate**, and
  it is worth understanding why it had to exist. The gauge reports Hipo's current
  APY as **33.70%**, and `/vs/` has always printed that in its hero. The section
  below now says a Hipo staker realized 8.56% over the last year. Both are true —
  one is an instantaneous rate from the most recent validation rounds, the other
  is a year's outcome — but a page that prints both without reconciling them is
  committing exactly the advertised-versus-realized confusion this feature was
  built to expose, against itself. The new line says which is which.
- **`ENGLISH_ONLY` in `src/data/lastmod.mjs` is now empty**, `/vs/` having been
  the last entry. `ROUTES` gained a `files` input so a page can be dated by a
  dataset it quotes as well as by its catalogs, which is what `/vs/` needs: a
  refreshed measurement genuinely changes what the page claims, in every locale
  at once.
- **`NAMESPACES` in `src/i18n/t.ts` gained `vs`.** It is a fixed list, so a new
  catalog is invisible to `getT` until it is added there — worth knowing before
  the next namespace.

### Follow-ups

1. The gauge collector, its Redis shape and the `/lst-rates` endpoint (phase 2).
   Until then the dataset only moves when someone re-runs the backfill.
2. The `/docs/` methodology page (R8), with its nine translations.
3. `/stats/` still has no comparison chart; §9 question 6 is still open.
4. Native review of the nine translations — they are machine-translated, in line
   with how this site has shipped locales before.
