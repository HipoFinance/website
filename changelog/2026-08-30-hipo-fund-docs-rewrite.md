# Hipo Fund docs — rewritten overview and expanded August 2026 report

The Hipo Fund section of the docs was reviewed externally and came back with two
rewritten pages plus a list of implementation notes. This session applies that
work to the English pages: the overview at `/docs/hipo-fund/` and the report at
`/docs/hipo-fund/quarterly-report-august-24-2026/`, whose URLs are unchanged.
The eight other locales are deliberately untouched — they will be retranslated in
one pass once the English wording is final, so all four fund pages are now marked
stale in `meta.json` for every released locale.

The source documents were `hipo-fund-overview-CORRECTED.md` and
`hipo-fund-report-august-2026-UPDATED.md`, both outside the repo.

| Commit                             | Subject                                                          |
| ---------------------------------- | ---------------------------------------------------------------- |
| _(uncommitted at time of writing)_ | Rewrite the Hipo Fund overview and expand the August 2026 report |

## The overview page

The page was a short "what the fund is" blurb followed by the April 2025 opening
table and four management bullets. It is now a full overview: what the fund is
and why it exists, a current-status table, both wallets described properly, where
the fund's money comes from, how it is managed, and a risks section.

Three substantive corrections:

**The opening allocation table did not add up.** HPO was published at $15,000
while the four rows were supposed to sum to the stated $186,963.96 initial
capital; they summed to about $129,726. HPO is now shown at $72,238.04 — its
market value on April 18, 2025 at $0.010695 per HPO — and the hGRAM and HPO
allocation percentages move from 59.28%/38.95% to 59.59%/38.63% so the table
reconciles. No balance changed. A visible correction notice sits under the table
rather than the change being made silently.

**The secondary wallet was described as "the previous wallet (before the multisig
migration)".** It is still in use, it is a proposer on the multisig, and it is
kept deliberately because Hipo Club does not support multisig wallets, so the
fund would lose Club eligibility without it. The page now says that.

**The funding sources were not stated.** The page asserted "no allocation from
HPO tokenomics" but never said where the money did come from. It now lists the
four sources and notes which are currently live — only hGRAM staking rewards,
since Season 4 removed the seasonal claim and the 0% staking fee since June 6,
2026 removed profit sharing.

Also added: the Investment Policy Statement due September 8, 2026, a since-
inception return with a GRAM benchmark, and a note explaining that the `EQ…` and
`UQ…` forms of the multisig address are the same account — that pair has caused
confusion before.

## The August 2026 report

The report's numbers are unchanged. Every table is the same August 23 snapshot at
masterchain block 88063277; no balance, price or valuation moved. What was added
is the reasoning and the context that the first publication left out:

- **Performance since inception.** The report previously compared only against
  December 2025, which ignores the ~$37k of capital added along the way. It now
  publishes a Modified Dietz return of −58.4% against GRAM's −49.7% over the same
  window, with the Season 2 and Season 3 claim valuations and their basis stated
  explicitly (they are estimates from the neighbouring reports' implied GRAM
  prices, because the price at receipt was never recorded).
- **Why the hGRAM was converted.** The old text said only what the chain proves —
  10,000 hGRAM out, 15,695.79 USDT in. It now gives the reason: the fund's capital
  had arrived almost entirely as GRAM and was concentrated in one asset.
- **Why no profit sharing was received.** Two separate causes, now both stated:
  the December 16, 2025 move of 1.9M HPO into the multisig made it ineligible
  under Hipo Club, and the June 6, 2026 move to a 0% staking fee ended protocol
  revenue entirely.
- **A liquidity note on the HPO position.** The old page had a one-line
  blockquote; the position is ~1.16% of circulating supply against roughly
  $113,000 of total DEX liquidity, so the $22,116.74 market-price line needed more
  than a caveat.
- **Next period priorities**, including the IPS timeline (publish September 8,
  community review to September 17, DAO vote opening September 21).

An update banner at the top records that the report was expanded after
publication and that no figure changed — the report's own credibility rests on
its numbers being reproducible, so a silent edit was not an option.

## SEO and structure

- **Page titles.** All four fund pages are retitled so the title tag contains
  "Hipo Fund": `Hipo Fund — On-Chain Treasury`, and `Hipo Fund Report — August
2025 / December 2025 / August 2026`. The old report titles ("Quarterly Report:
  August 24, 2026") contained neither the fund's name nor anything a reader would
  search for. Starlight appends `| Hipo Docs`.
- **Sidebar labels** shortened to `Report: August 2025` / `December 2025` /
  `August 2026`, in `astro.config.mjs` and `src/i18n/en/docs-sidebar.json`. The
  translated sidebar keys are the page links, not the labels, so no other locale
  file needed touching.
- **Meta descriptions** added to the two older reports, which were both falling
  back to the site default — three fund pages sharing one description is a
  duplicate-description problem across the whole section.
- **The redundant H2** ("🟣 Hipo Fund – Quarterly Report") is gone from all three
  reports. Starlight renders the frontmatter title as the H1, so that line was a
  second copy of the page title.
- The word "Quarterly" is dropped from the August 2026 report, which covers eight
  months.

## Declined and deferred

**The `og:image` suggestion.** The review asked for an allocation chart on the
August 2026 report, partly so the page would have an `og:image` for Telegram and
X. The chart is worth having, but the stated reason does not hold: Starlight
~0.40 emits no `og:image` at all, and adding a body image does not create one, so
_no_ docs page currently has a share image. Adding one is a separate change to
`src/components/starlight/Head.astro`, and the chart itself needs a designed
asset to match `hipo-fund-quarterly-report-august-1-2025-1.jpg`. Neither was done
here.

**The GitBook redirect — already done, and not where the review said.** The
review flags `docs.hipo.finance` as still live, serving pre-migration wallet
information and competing with `hipo.finance/docs` in search, and calls it the
highest-value SEO fix available. It is already fixed. `docs.hipo.finance` 301s
to `hipo.finance/docs/`, path-preserving across the whole domain
(`/hipo-fund` → `/docs/hipo-fund/`, `/introduction/liquid-staking` →
`/docs/introduction/liquid-staking/`), served by Cloudflare. Nothing in the
`operation/nginx` repo has ever referenced the host — it serves only
`gauge.hipo.finance` and `stats.hipo.finance`, and `git log -S docs.hipo.finance`
there is empty. So there was nothing to add or remove; the review's item 3 is
simply out of date.

**The GRAM benchmark was off by a decimal.** The source documents stated GRAM's
fall over the period as −49.7%. From the two prices they themselves publish —
$2.994 at inception, $1.5044554 at the snapshot — the fall is 49.751%, which
rounds to **−49.8%**. Corrected in all three places. The error understated the
benchmark's decline, which made the fund look worse against it, so it was not
self-serving — but the report's whole claim is reproducibility. The Modified
Dietz figure was re-derived independently and is exactly right: −58.379% → −58.4%.

**Empty table headers.** The source documents used headerless two-column tables
(`| | |`), which render as an empty `<th></th>` row — an accessibility defect, as
a screen reader announces an empty column header. The three key/value tables were
given `Measure | Value` headers instead.

## Second pass — the review round

The corrected pages went back to the reviewer, who returned three more documents
and disagreed with two things. Both disagreements were checked and both were
upheld.

**The HPO percentage: 38.64%, not the 38.63% first applied.** $72,238.04 /
$186,963.96 = 38.6374%, which rounds to **38.64**. The 38.63 in the first pass
was chosen so the column summed to exactly 100.00%; the reviewer's objection is
that anyone recomputing from the USD column gets 38.64 and logs the difference as
another error — which is the exact failure mode this correction exists to fix. A
forced figure does not survive scrutiny; "rounded to two decimals and may not sum
to exactly 100" is what fund reports say and does. The table now reads 38.64%,
the total row reads **100%** rather than 100.00%, and both corrected tables carry
the rounding footnote.

**The August 2025 report presented contributed capital as return.** This one
nobody had flagged, and it is larger than the percentages. The report's headline
reads:

> **Growth:** **+$40,470.68** (**+21.64%**)

That $40,470.68 includes the 9,147.33 GRAM Season 2 claim — about $31,557 of
contributed capital — which the same report lists as an "Addition" two lines
above. Excluding the contribution the fund returned roughly $8,913 on $186,964,
about **4.8%**, not 21.64%. Verified independently: 9,147.33 GRAM at the $3.4499
implied by that report's own allocation table is $31,557.37, and
(227,434.64 − 186,963.96 − 31,557.37) / 186,963.96 = 4.77%.

It is the precise error the August 2026 report's move to Modified Dietz exists to
prevent, and leaving it live would put two incompatible performance claims on one
site — with +21.64% being the one likely to be quoted back in a listing
questionnaire or a screenshot. The historical figure is **not** rewritten; an
editor's note under "Fund Capital Growth" states what the number is, what it
excludes, and what the fund reports from August 2026 onward.

**The December 2025 report was checked for the same thing and is clean.** It
received the Season 3 claim, but it publishes no return or growth percentage at
all — only absolute values plus a note that the decrease is price-driven rather
than liquidation. There is no performance claim to qualify, so no note was added.

### The rest of the second pass

- **The August 2025 comparison table is corrected.** Its April 18, 2025 column
  read 59.55 / 1.77 / 38.95 / 0.01, which sums to **100.28%** and matched neither
  the old overview (59.28%) nor the corrected one. It now reads 59.59 / 1.77 /
  38.64 / 0.01 with a correction notice naming the old figures. This is not a
  restatement under a new valuation method, so it does not conflict with the
  editorial policy the August 2026 report sets out ("December's numbers have not
  been restated"); those percentages were simply arithmetically broken.
- **The overview's correction notice now names all four percentages**, not just
  hGRAM and HPO — USDT also moved, 1.76% → 1.77% — and cross-references the
  August 2025 fix so a reader following the notice does not land on stale
  numbers.
- **The hard IPS dates are gone from the docs.** September 8 / 17 / 21 are
  replaced by "in September 2026" plus the review-then-vote sequence, with exact
  days pointed to Hipo's Telegram channel and ton.vote — where a moving date is
  normal and no locale sync is required. This was the recommendation from the
  earlier discussion of those dates, adopted.
- **The report's headline paragraph no longer says "balances barely moved".**
  That claim sat two sections above a 10,000 hGRAM conversion inside the same
  period, and the rewrite had sharpened it to "a price effect, not selling". It
  now names the one transaction explicitly and scopes the unchanged balances to
  the period after it.
- **"four" restored** to the Hipo Bill NFT sentence, so "All four hold a zero
  balance" has an antecedent again.

**Not changed: "years of total market turnover".** Three translators questioned
it. The arithmetic supports the English — at $10–40/day against a $22,117
position that is 1.5 to 6 years.

## The review round's own findings

The nine translators read the second-pass English closely enough to find four
defects in it, each raised independently by more than one locale and each
verified before being acted on. All four were fixed and re-synced.

- **The 4.8% had no stated basis.** Flagged by ar, it, pt-br, id and ru. The note
  said "approximately 4.8%" and then introduced Modified Dietz one sentence
  later, which implies the figure _is_ Dietz. It is not: it is the simple return
  net of the contribution (4.77%), where Modified Dietz on the same inputs gives
  4.45-4.73% depending on when the claim landed. The note now says so, inside the
  same sentence.
- **"before March" overstated the chain.** Flagged by fa. The report's own Key
  activity section says "by March 18, 2026" and the interim table's first
  post-conversion row is March 18. Corrected first to "by mid-March", then, after
  ar and fa both showed "mid-March" reads as no later than 15 March, to **"by
  March 18"** - which matches the Key activity line exactly and removes a
  calendar trap for every non-Gregorian locale.
- **"every balance has been unchanged since"** was contradicted by the same
  report's GRAM column (39.76 to 40.30). Flagged by ru and ar; now "every balance
  except native GRAM".
- **A residual rounding error in the August 1, 2025 column**, found by ru while
  checking the April fix: from that report's own USD values hGRAM is 59.83%
  (published 59.82) and HPO 38.57% (published 38.58). Both versions summed to
  100.00, so it was cosmetic - but the new correction notice claimed recalculation
  from the USD values, which would have read as an admission that only April was
  done. Both tables in that report are corrected and the notice now covers both
  columns.

One further self-inflicted imprecision was caught by tr: the notice first said
both columns were recalculated "from the USD values **in this report**", but
April's USD values live in the overview's opening table. It now names each
column's source separately, with the overview link moved into that sentence.

**Not changed: "years of total market turnover".** Three translators questioned
it; the arithmetic supports the English - at $10-40/day against a $22,117
position that is 1.5 to 6 years.

## The locale sync

All four pages were translated into the nine released locales (fa, ru, ar, de,
hi, tr, it, id, pt-br) in the same session, one translator per locale working
from the new English plus that locale's existing translations, so established
terminology, register, date format and digit set carried over. Sidebar labels
were shortened in every locale to mirror English dropping "Quarterly". Hashes
regenerated with `--update-hashes`; every locale is back to 100% coverage with
**stale 0**.

Two conventions were settled during the sync and are worth recording:

- **Rounded figures replace nano precision.** The old translated tables carried
  the full on-chain precision (`66,157.002866`, `9,023,524.435767465`); the
  English rewrite rounds these. Every locale followed the English. Full
  precision survives only where English keeps it, in the "no HPO buybacks"
  sentence.
- **Two locales corrected their own pre-existing drift.** `fa` had USDT at
  1.76% where English said 1.77%; `hi` was using Western digit grouping and
  `अप्रैल 18, 2025` date order in these two files alone, against the Indian
  grouping and `18 अप्रैल 2025` order used by the rest of the `hi` corpus and
  mandated by the glossary. Both now follow their locale's convention.

Structural parity was verified mechanically for all nine: heading sequence and
levels, `---` counts, table row counts, `:::` aside counts, and the full
multisets of link URLs and code spans are identical to English, with no
locale-prefixed internal links anywhere.

### Verification performed

- `npm run build` — clean, 514 pages. The build initially failed on
  `src/i18n/en/docs-sidebar.json` being out of sync with `docsSidebar` after the
  label rename; fixed and rebuilt.
- `node scripts/check-i18n.mjs` (via `prebuild`) — no missing items. 18 warnings,
  all of them the expected staleness: the four fund pages now differ from their
  translations in each of the nine released locales.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 17 groups passed.
- Every published figure recomputed from the underlying balances and prices: both
  allocation tables sum to their stated totals to the cent and their percentage
  columns to 100.00%; HPO, hGRAM and GRAM valuations reproduce from the snapshot
  prices; total-in-GRAM, the period change and Modified Dietz all match. One
  discrepancy found (the GRAM benchmark, above); everything else reconciled.
- Rendered output checked in `dist/`: all four `<title>` tags, the two new meta
  descriptions, exactly one `<h1>` per page, the three `:::note` asides rendering
  with their titles, zero `<th></th>`, and all five internal links resolving to
  built pages.
- `npx prettier --write` on every changed file.
- After the locale sync: `npm run build` clean at 514 pages; `check-i18n` reports
  every locale at 100% coverage with **stale 0, missing 0**; a structural
  comparison of all nine locales against English passes; and the rendered
  `dist/` pages for all ten languages carry exactly one `<h1>`, the right number
  of asides, a non-empty meta description and zero `<th></th>`.

## The second locale pass

The eight second-pass changes were carried into all nine locales by resuming the
same nine translators, so each kept the conventions it had established rather
than re-deriving them. Hashes refreshed; every locale is back to stale 0.

Verified centrally rather than on the translators' word: structural parity for
all nine (headings, table rows, `:::` asides, link and code-span multisets), and
a financial-figure comparison that normalises digit sets (Persian, Arabic-Indic,
Devanagari) and group separators — every money figure and percentage is
identical to English in all nine locales. That second check matters because the
Arabic agent's own safety review did not run; its numbers reconcile
independently.

### Follow-ups

- **Decide the "Updated" date** in the report's banner. It says August 29, 2026,
  from the source document; if the page ships later, it should match the ship
  date. (Alireza asked for it to stay as-is for now.)
- **Decide whether docs pages should have an `og:image`**, and if so add the
  allocation chart.
- **Native review.** Every locale is at 100% coverage but 0% native-reviewed —
  that is corpus-wide and pre-existing, not introduced here.
- **Announce the IPS dates in the channels.** The docs now commit only to
  "September 2026" and to the review-then-vote sequence, and point readers at
  Hipo's Telegram channel and ton.vote for the exact days. Those announcements
  still have to happen, but a slipped date no longer means editing ten languages.
- **Two locale nuances left as the translators judged them.** `id` renders "by
  March 18" as `sebelum 18 Maret` ("before"), matching how that file already
  translates the same English preposition in its Key activity line — internally
  consistent, marginally tighter than the English. `ar` and `fa` keep an explicit
  "no later than" construction. Worth a native reviewer's eye, not a defect.
- **The December 2025 report was checked twice and left alone.** It received the
  Season 3 claim, but publishes no return or growth percentage at all — only
  absolute values plus a note that the fall is price-driven. There is no
  performance claim to qualify, so no editor's note was added. `fa` argued the
  contribution still makes the stated drop look smaller than the true investment
  loss; that is a fair reading if the policy is ever extended.
