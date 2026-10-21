# The supply bar shows what each project wallet holds

**Status:** implemented

Behrang asked for it on Telegram, 2026-10-21: the grey "held by Hipo" block on the tokenomics
card is about 90% and frightens readers; split it into community, liquidity, team, marketing,
treasury and advisers, each visibly different. Companion spec in the gauge repo:
`specs/hpo-locked-wallet-balances.md` (the gauge publishes the per-wallet balances).

## Goal

A reader of `/hpo/` sees that the HPO Hipo holds sit in six named wallets, each with its real
balance today, instead of one grey block, and still sees the honest total.

## In plain terms

The tokenomics card shows a bar with three parts: burned, in circulation, and held by Hipo. The
held part is 906 million of the 1 billion minted, nine tenths of the bar in grey, and it reads as
"one party holds everything". Those tokens actually sit in six multisig wallets, one per
allocation (community, liquidity, team, marketing, treasury, advisers), and two small old wallets.

The change splits the grey block into six blocks in the colours the donut above already uses for
the same six allocations, drawn with diagonal hatching so they read as "allocated and held, not
in the market". Each block is the wallet's real balance, read from the chain by the gauge every
five minutes like every other figure on the page, not the planned percentage from the donut. Today
that is community 262.1M, liquidity 192.2M, team 154.2M, marketing 148.0M, treasury 130.0M,
advisers 20.0M. The two old wallets' remainders (0.7M and 1.0M) fold into community and liquidity.

Under the bar the three figures stay (burned, in circulation, held by Hipo with its total), and
under them a short list names the six wallets with their amounts and shares. The held total stays
visible: the point is to make the 90% legible, not to hide it. The gauge gains one field with the
eight balances by label; the website draws whatever it sends. Until the gauge ships, or if the
field is missing, the bar is exactly today's three-segment bar.

Risk: low. A wrong figure shows on one marketing card, and the sum of the six must equal the held
total the gauge already publishes, which the website checks before drawing them. Decisions
needed: three small ones under Open questions.

## Definitions

**Concepts**

- **Held by Hipo**: total supply − circulating, as today; what the eight locked wallets hold.
- **Section**: the HPO held under one allocation label: the new multisig's balance plus any old
  wallet of the same label. Six labels, the donut's: `community`, `liquidity`, `team`,
  `marketing`, `treasury`, `advisers`.
- **Locked supply by label**: the new gauge field `hpo.market.locked_supply`, a map from label to
  whole HPO, summing the configured wallets per label. Whole HPO, one decimal shown.
- **Share**: a section's percentage of the 1B minted, one decimal. The six printed shares and the
  burned and circulating shares sum to 100: all but the largest section are rounded to the decimal
  and the largest takes the remainder (the rule the bar already applies to its three figures).
- **Hatching**: a repeating 135° stripe of the section's colour over a faint tint of it, in CSS,
  so a section is told apart from the solid in-circulation purple without a legend.

## Context

- `src/components/Hpo.astro:28-31` reads `hpoSupply(locale, gaugeData)`; `:52-70` the donut's six
  labels and colours; `:76-116` the three bar figures and the aria label; `:391-437` the bar, the
  three figures and the fully diluted sentence.
- `src/data/gauge.ts:36-60` the `GaugeData` type; `hpoSupply` (`:~262-300`) the three amounts,
  percentages and shares with the remainder rule.
- `src/scripts/hpo-data.js:93-135` refreshes the figures, percentages and segment widths by id
  every five minutes.
- `src/i18n/en/hpo.json:36-54` the labels; `hpo.tokenomics.supplyLabel` is the bar's aria text.
- The gauge reads the eight wallets one by one (`gauge/actor/token.go:348-376`, `readHpoSupply`)
  and sums them; the list is `HPO_LOCKED_WALLETS` in `operation/stack/gauge.yaml:67`, in the order
  community, liquidity, team, marketing, treasury, advisers, old community, old liquidity (labels
  from `src/content/docs/hipo-tokens/hipo-governance-token-hpo/hpo-tokens-distribution.md`).
- Figures on 2026-10-21 (gauge payload and tonapi, which agree): total 954.5M, circulating 48.1M,
  held 906.4M; burned 45.5M (4.5%), circulating 4.8%, held 90.6%.

## Approach

The gauge publishes `hpo.market.locked_supply: { community: 262088883, liquidity: 192185238,
team: 154166667, marketing: 148007873, treasury: 130000000, advisers: 20000000 }` (whole HPO,
labels from the config; the companion spec). The website:

- `GaugeData.hpo.market.locked_supply?: Record<string, number>`. `hpoSupply` gains `sections`: the
  six known labels in donut order that are present and positive, each with amount (compact), share
  and percentage, plus an `other` section when the map carries a label the site does not know or
  when the known sections sum to less than the held total by more than one HPO (nothing is
  hidden). `sections` is `undefined` when the field is absent, or when the sections sum to more
  than the held total, and the bar then draws the single grey segment as today.
- `Hpo.astro`: the bar renders burned, circulating, then one hatched segment per section, each
  with `id="hpoHeld<Label>Bar"`, in the donut's colour for that label (`other` in the grey the
  held segment uses today). The three figures stay; the held figure's swatch becomes a hatched
  grey. Under the figures a list of the sections, swatch, label, amount and share, three columns
  on desktop and one on a phone, ids `hpoHeld<Label>` and `hpoHeld<Label>Pct`. The aria label
  names the sections. With no sections the list is absent and the single held segment is drawn.
- Colour: the six allocation colours become tokens in `global.css`, `--color-alloc-community`
  … `--color-alloc-advisers`, one value per scheme, and the donut, its legend, the bar and the
  section list all read them (the donut's hex literals go). Values, measured with
  `.claude/skills/visual-design/palette-check.py` (every pair at least 17 CIELAB units apart in
  the dark scheme and 15 in the light one under deuteranopia, protanopia and tritanopia; every
  fill at least 3:1 on its surface): dark `#ff7e73 #2fb5a8 #9fd0f5 #c04fa8 #3f8f4a #f3dcc0`, light
  `#e0574b #27a39b #2f6fc4 #8e1f72 #3f7a26 #5c3d0c` (community, liquidity, team, marketing,
  treasury, advisers). Today's six fall to about 2:1 on white, team blue and marketing purple are
  3 units apart for red-green colour-blind readers, marketing purple sits 7 units from the
  circulating purple, and advisers grey is the faint-text colour. Polish, optional: a light-scheme
  ember `#cf7f00` (3.1:1 on white; today's `#ffb03a` is 1.8:1 there), keeping the dark one.
- Hatching in `global.css` as one utility (`hatch`, colour from a custom property), tinted so it
  holds contrast on both surfaces; the swatches reuse it.
- `hpo-data.js` refreshes the eight widths and the section figures with the same id convention; a
  payload that loses the field falls back to the single segment and hides the list.
- Strings: `hpo.tokenomics.heldNote` becomes "six project wallets, released on a schedule";
  `hpo.tokenomics.supplyLabel` gains the sections; new `hpo.tokenomics.heldOther` ("Other project
  wallets") and `hpo.tokenomics.sectionItem` ("{label} {amount} · {pct}"). The six labels exist.
- Deploy order: gauge first (an absent field is today's bar), website after.

Rejected: reading the eight wallets in the browser from the v4 node (moved off it on 2026-10-17).
Rejected: counting community, liquidity or marketing as circulating (declined in the gauge spec).

## Changes

- `src/data/gauge.ts` — the field on `GaugeData`; `sections` on `HpoSupply` with the remainder rule
  across all printed shares.
- `src/components/Hpo.astro` — the segments, the hatched held swatch, the section list, the aria
  label.
- `src/styles/global.css` — the six `--color-alloc-*` tokens in both schemes, the `hatch` utility,
  and the light ember if accepted.
- `src/scripts/hpo-data.js` — refresh of the sections.
- `src/i18n/en/hpo.json` then the ten locales — the three strings.
- `CHANGELOG.md` — one entry.

## Acceptance criteria

- [x] (mocked payload on the dev server, 2026-10-21) With a payload carrying `locked_supply` (the live gauge after its deploy, or a saved one), the
      bar shows eight segments whose widths are the shares, and the six section amounts under the
      bar sum to the held figure; the eight printed percentages sum to 100.0.
- [x] With a payload without the field, the card is byte-identical to today's (three segments, no
      list).
- [x] A payload whose sections sum to more than the held total draws the single segment and logs
      nothing visible; one with an unknown label shows it under "Other project wallets".
- [x] `palette-check.py` passes for each scheme's eight bar colours (no pair under 15, no fill
      under 3:1); the donut and the bar use the same tokens.
- [x] Each section's colour is the donut's for that label, hatched, in both colour schemes; the
      three figures keep their swatches, the held one hatched grey.
- [x] At 390px the list is one column and the page does not scroll horizontally; under RTL the bar
      and list mirror (`fa`, `ar`).
- [x] The five-minute refresh changes the widths and figures without a reload (checked with a
      mocked second payload in the browser).
- [x] `npm run build` passes with every locale (620 pages, 2026-10-21); `check-i18n` reports no missing key.
- [x] `team:risk-review` has run on the diff (tier 2, one code review: five findings fixed and
      closed on re-check, the visible one being zero-width segments still taking flex gaps).

## Risks & rollback

- The gauge's per-label sums must match its circulating figure; the website refuses to draw
  sections that exceed the held total and falls back to today's bar, so a gauge bug cannot show a
  bar that sums above 100%.
- Rollback: revert the website commit; or roll the gauge back, which hides the sections on the
  live site within five minutes with no website change.

## Open questions

1. **Where the labels come from.** The gauge config today is a plain list of addresses. Options:
   (a) `label=address` entries in `HPO_LOCKED_WALLETS` (an entry without a label still counts
   toward circulating and is published under `other`); (b) a second variable with the labels in
   the same order. Recommendation: (a), because one list cannot go out of step with itself.
2. **Keep the held total.** Show the three figures as today plus the six-section list
   (recommended: the total stays honest and the sections explain it), or replace the held figure
   with the six. Recommendation: keep it.
3. **The two old wallets.** Fold each into its category (recommended: they are the same
   allocation's remainder, 1.7M in all), or show "Other project wallets". Recommendation: fold.

Behrang, 2026-10-21: the three recommendations stand, the ember change on light is accepted,
"go" at 07:33 UTC. The colours were checked with the new `visual-design` skill (above).

4. **The light-scheme ember.** Keep `#ffb03a` on white (1.8:1, it has a glow and the figure beside
   it carries the identity) or deepen it to `#cf7f00` (3.1:1) in the light scheme only.
   Recommendation: deepen; the burned segment is the one figure the card wants noticed.

Money-audit candidate: `src/data/gauge.ts` is on the money map (display conversions); this change adds the per-wallet HPO shares, display only. Not money-audited.
