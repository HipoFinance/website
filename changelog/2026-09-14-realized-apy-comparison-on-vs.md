# What stakers actually earned: a measured comparison on /vs/

`/vs/` now carries a comparison of what a stake actually earned at Hipo against the two other large
TON liquid-staking protocols, drawn from two years of daily exchange rates read off each protocol's
own contracts at historical blocks. The comparison is denominated in GRAM rather than in
percentage points, and `/vs/` — English-only since it was written — is translated into all nine
released locales in the same change.

The feature was specified first, in `specs/realized-apy-comparison.md`, and the spec was written
against measurements rather than assumptions: the central claim, that a two-year backfill is
possible at all, was verified by live request before a line of it was written. Two of the spec's own
rules turned out to be wrong once the backfill ran, and both corrections are recorded there.

## The measurement

Every one of these protocols is rate-based: one liquid token redeems for a growing quantity of
GRAM, and that ratio is readable from a contract at any past block. Dividing today's ratio by an
earlier one gives what a holder who did nothing actually received — the same definition for every
protocol, taken without anyone's cooperation and reproducible by anyone.

`scripts/backfill-lst-rates.mjs` samples each protocol at 00:00 UTC for 731 consecutive days,
resolving each timestamp to a masterchain seqno and running the protocol's getter at that block
against the free public v4 archive. The result is `src/data/lst-rates.json`: 731 samples per
protocol, each storing the two raw chain integers as decimal strings rather than their ratio, so
the window definition can change without re-reading the chain.

Three protocols are drawn: Hipo, Tonstakers and Stakee. The exclusions are deliberate and each has
a reason recorded in the spec — KTON did not exist when the measured window opens, bemo's readable
pool has drained to 9% of its own peak while the pool its users moved to exposes no field that
tracks rewards, and TON Whales is not liquid staking.

## Reading a contract you do not control

Three defences in the backfill script exist because the failure mode here is not an error, it is a
plausible wrong number.

The Whales-family pool that Tonstakers, Stakee and KTON all run ships two stack layouts: 30 fields
with the jetton supply at index 13, and 34 fields with it at 17. Index 13 in the 34-field layout is
`accrued_governance_fee` — reading it as supply returns a number that looks fine and is not. The
script branches on stack length and refuses a length it does not recognise. This was confirmed
against the contract source, not inferred from position: 30 fields is upstream
`ton-blockchain/liquid-staking-contract` `main`, 34 is its `v2` branch, and `total_balance / supply`
is the ratio the contract itself converts at.

Hipo's own tuple was the harder case, and it is where the spec was wrong. The spec said to read it
through `@hipo-finance/sdk` rather than by index — but the SDK's parser tracks today's tuple and
throws on the 20-field state that covers most of the window. A versioned client library is right for
current state and useless for history. The script reads indices 0 and 1, which sit ahead of every
insertion the tuple has taken, behind a minimum-arity assertion. Over the window the tuple was
observed at 20 fields for 723 days and then at 21, 24 and 26 across two days in September — several
deployments, not one migration — and the ratio stays smooth across all of them, which is the
evidence the read is right.

## The framing changed after review

The first chart plotted trailing-365-day realized APY as a percentage. Reviewed, it failed at its
actual job: a potential staker reads "8.56% versus 7.46%", concludes they are barely behind, and
does not move. The same fact in GRAM is a quantity they can weigh, so the page now leads with a
stake amount and shows the running total of extra GRAM.

What that reframing can and cannot do is worth stating plainly, because it constrains the design.
Against Tonstakers over two years the gap is 1.50 percentage points cumulative: 15 GRAM on a
1,000-GRAM stake, 1,496 on 100,000. **The framing helps a large staker and cannot help a small
one.** That is a property of the data. The obvious way to make it look larger — plotting three
stake-value lines on a y-axis cropped to their range — would let a 1.5% difference fill the frame,
and the spec forbids it in as many words. This page's whole claim is that every figure on it is
measured; a cropped axis trades the claim for an impression.

A liveness chart showing each pool against its own two-year peak was built and then dropped. The
rule it visualised still runs and is what excludes bemo; the chart went because pool trajectories
are not what a staker came to find out, and because Hipo is the one included protocol not currently
at its own peak, so it cost more than it explained.

## One thing the page had to admit about itself

The gauge reports Hipo's current APY as 33.70%, and `/vs/` has always printed that in its hero. The
new section says a Hipo staker realized 8.56% over the last year. Both are true — one is an
instantaneous rate from the most recent validation rounds, the other is a year's outcome — but a
page printing both without reconciling them commits exactly the advertised-versus-realized
confusion this feature exists to expose, against itself. A line between them now says which is
which.

## Why the geometry lives in its own module

`src/data/lst-geometry.ts` holds the chart's arithmetic and carries no import of the dataset;
`src/data/lst.ts` reads the dataset and carries no geometry. The split is not tidiness. The stake
control runs in the browser, and had the geometry stayed beside the import, Vite would have followed
it and bundled 169 KB of backfill into a client script. Split, the script is 3.7 KB and the page
inlines 4.6 KB of sampled growth factors.

Both halves call the same `chartGeometry()` — the Astro component at build time, the script on the
client — for the reason `src/data/gauge.ts` gives for the same pattern: a second copy of the math is
how a chart comes to jump the first time a visitor touches it.

## `/vs/` is a translated route now

It was the last page in the `ENGLISH_ONLY` map in `src/data/lastmod.mjs`, which is now empty. The
page gained a `[locale]` twin through a shared `VsRoute.astro`, and its entire copy — hero, both
reward tables, the exit section, the trust cards, not just the new chart — moved into
`src/i18n/<locale>/vs.json` and was translated into all nine released locales, 62 keys each, plus
four `seo.vs.*` keys.

`ROUTES` gained a `files` input so a page can be dated by a dataset it quotes as well as by its
catalogs. `/vs/` needs it: a refreshed measurement genuinely changes what the page claims, in every
locale at once.

The page also reverses an editorial rule it used to carry in its own frontmatter — _"Hipo's own
numbers only — no claims about anyone else's product."_ The comment is rewritten rather than left to
contradict the file it sits in. The rule now is narrower: no claims about anyone else's marketing,
and measurements of anyone's contracts provided the method is published on the page. A "How this is
measured" block names all three contracts and their getters so a reader can repeat the measurement.

### Verification performed

- **The backfill agrees with our own telemetry.** Hipo's backfilled rate was compared against
  `hipo_treasury_hton_rate` from Prometheus over the 309 days the two overlap: mean relative
  difference 1 part in 10⁶. Shifting the comparison by a day moves the error by ±0.025%, exactly one
  day's accrual at ~9%/yr, which is what shows the series are aligned rather than merely close.
- **The archive genuinely serves historical state.** `get_treasury_state` returns `exitCode 0` at
  seqno 45,630,316 (two years back) and `-256` at 32,664,898, where the treasury was not yet
  deployed — a current-state replay could not produce that.
- **Layout history matches the source verification.** Tonstakers and Stakee returned 30 fields on
  all 731 days, KTON `-256` for 191 days then 34, bemo 15 throughout, Hipo 20 then 21, 24 and 26.
- **Continuity across Hipo's arity changes**: 1.16265 → 1.16304 → 1.16340 → 1.16416 → 1.16440.
- **Plausibility**: largest single-day rate move ≤0.08% for Hipo, Tonstakers and Stakee.
- **The client script does not carry the dataset**: 3,716 bytes built, containing the geometry and
  no backfill.
- **Both colour schemes validated** for the two new series tokens — lightness band, chroma floor,
  colour-vision separation and contrast against each scheme's own surface, rather than chosen by
  eye. Every line is also direct-labelled, so identity never rests on colour alone.
- `npm run build` clean, 542 pages; `check-i18n` at full coverage for all ten locales.

### Follow-ups

- The gauge collector and its `/lst-rates` endpoint are **not** built. The page ships against the
  committed baseline, so its figures only move when someone re-runs the backfill and commits.
- The `/docs/` methodology page the spec asks for (R8) is not built; the on-page "How this is
  measured" block stands in for it.
- `/stats/` has no comparison chart yet.
- The nine translations are machine-translated and unreviewed, as this site's locales have shipped
  before.
- Hipo's 33.70% current APY is far above every realized figure on the page. The reconciling line
  explains the difference in kind, but whether that gauge number is itself sound is worth a look.
