# 2026-08-23 — Content review and accuracy fixes (FAQ, HPO page, docs)

Second session of the day, after the i18n commit. It had two halves: a
read-only editorial review of the English FAQ (`/faq/`), the HPO page FAQ
(`/hpo/`) and the 40 Starlight docs pages, plus a dead-link audit over all of
them; and then, once the review was discussed, a spec'd batch that applies the
**accuracy** findings only — factual errors, cross-page contradictions, stale
"live" claims about retired programmes, violations of the site's own
`public/llms.txt` rules, meaning-changing typos and the pre-rename `hTON` DEX
links — in English and in the three released locales (fa, ru, hi). Structure,
cuts and formatting stay for a later spec. The review itself lives in the
session scratchpad (`content-review-2026-08-23.md`); the applied change list
is `specs/content-accuracy-fixes.md`.

## Commits

| Commit    | Description                                            |
| --------- | ------------------------------------------------------ |
| `9455eee` | Fix content accuracy across the FAQ, HPO page and docs |

## What changed

### The review (read-only)

Three parallel reviewers (site FAQ + HPO FAQ; docs; link checker) read the
105 English prose files, the 40 English docs and the `en` catalogs, and pulled
live protocol values through the Hipo MCP server (round ≈ 18 h, freeze ≈ 9 h,
governance fee 0 %, deposit/unstake gas ≈ 0.009 / 0.014 GRAM, TVL ≈ 8.4 M
GRAM, recent APY ≈ 16 %). Headline findings:

- **Contradictions** — the minimum stake answered four ways ("as little as
  1 GRAM" vs "even less than 1 GRAM" vs "any amount"); two audits in the FAQ vs
  four on the landing page, with the March-2024 report credited to "Ender
  Ting" on one and ProgramCrafter on the other; three incompatible reward
  cadences across `hipo-rewards.md`, `profit-sharing.md` and `hipo-club.md`;
  HPO described as "decision-making", "revenue-sharing" or "governance and
  profit-sharing" depending on the page.
- **Retired programmes presented as live** — `/hpo/` recruiting for Hipo Gang
  (ended 2025-02-25); `hipo-club.md` teaching the pre-Season-4 model (6 levels,
  claim discounts, sell allowance, 72-hour window) and retracting it in a
  footnote; TVL milestones "upcoming" at 2M–5M GRAM with TVL past 8M; the $1M
  programme "on pause" and "will continue" on the same page, linking to a
  reward calculator that does not exist.
- **`llms.txt` rule violations** — "the highest staking rewards in the TON
  ecosystem", "Unstake Anytime … at any time", hardcoded "~20 % APY in TON" and
  "up to 43.7 % total APY", "capitalize on price movements … maximize returns",
  "Start Your Investment Now".
- **Wrong facts** — "TON is backed by Telegram Messenger"; "extensive testing
  on a dedicated testnet"; Hipo Fund's April table not summing to its stated
  total; Season 3's 85/15 split computed on an unstated pool.
- **Structure / cuts (deferred)** — 67 FAQ questions with ~40 % restatement
  and one internal link; four of nine HPO FAQ items duplicating sections on the
  same page; tutorials at sidebar positions 20–21 behind Hipo Fund; nine of 40
  docs pages are dead or paused programmes without dates; missing Fees, Risks,
  Contracts & Audits and Glossary pages; 26 images with empty `alt`.
- **Dead links** — none of 119 unique URLs (52 internal, 67 external) is dead;
  all anchors and the fa/ru/hi docs links resolve. Suspects: the
  `tutorials/unstaking.md` DEX links using the pre-rename `hTON` symbol (STON.fi
  no longer lists it), `claude.com/claude-code` 301-ing, and ton.vote returning
  HTTP 404 for deep routes although the DAO and proposals exist (SPA fallback).

### The accuracy batch (`specs/content-accuracy-fixes.md`)

Eight canonical sentences were fixed once and reused everywhere they apply:

- **CS-1 minimum stake** — "There is no minimum. You can stake any amount of
  GRAM, even a fraction of one …" (FAQ, both docs; the app-shell copy was
  already right and was the source).
- **CS-2 audits** — four: Quantstamp (Apr 2025) and ProgramCrafter (Mar 2024)
  on v2, TonTech and Daniil Sedov (Oct 2023) on v1; `Landing.astro` renames
  "Ender Ting" → ProgramCrafter (its href already anchored the ProgramCrafter
  report); `llms.txt` gains the audit sentence.
- **CS-3 Hipo Gang is retired** — ended 2025-02-25, replaced by Hipo Club;
  removed from the HPO page utility section and FAQ item 7, past tense on the
  Gang pages, "Hipo Cub" → Club.
- **CS-4 three reward streams, three clocks** — base rewards per validation
  round into the exchange rate; Hipo Club HPO per round, withdrawable past
  1,000 HPO; profit shares per season — stated in full on `hipo-rewards.md`
  (replacing the hardcoded APY bullets) and deferred to from every other page.
- **CS-5 naming** — GRAM / TON / hGRAM / STON.fi sweep ("GRAMs", "GRAM coins",
  "native Grams", "Ston.fi", "Stonfi").
- **CS-6** — "HPO is Hipo's governance and profit-sharing token" (FAQ, HPO
  FAQ, `hpo.json` hero, docs, and `landing.hpo.body` — the last found during
  implementation and added as E7).
- **CS-7 / CS-8** — gas "on the order of a hundredth of a GRAM" (never a
  figure); "a governance fee on validation rewards, set by the Hipo DAO,
  currently 0 %".

By surface: **A** site FAQ (11 answers), **B** HPO FAQ + `hpo.json` (13
applied; two key renames `hpo.utility.gang.*` → `earn.*`, `offers.*` →
`level.*` with `Hpo.astro` updated), **C** one app-shell card, **D** docs (46
rows across 28 pages — among them the Hipo Club page rewritten to the
Season-4 model with the old model as a dated note, the TVL programme archived,
Season 3's pool stated as 3,774,659.24 HPO with the 20/80 burn/return of the
1,900,901 unclaimed, vesting "24 → 48 months" in the body instead of only the
note, the Why-TON page corrected, the testnet bullet replaced by the real
Blueprint test suite, the privacy-policy heading unglued), **E** landing,
catalogs, `llms.txt` (7), **F** links (5): tutorial DEX links → `/defi/`, the
shared staking/unstaking video's two `title` attributes (the id is one video
covering both — not a duplication bug), the `claude.com` redirect, and **F5**
the app's own swap links in `Model.ts` — both DEX APIs now list the jetton as
`hGRAM` and STON.fi's asset list contains look-alike jettons whose symbol is
`TON`, so `dedustSwapUrl`, `stonSwapUrl` and `toncoSwapUrl` became
address-based (`EQDPdq8x…h76w` → native). Two additions made during the batch:
**D47** the Hipo Club "How to Earn XP" section reworded to active tasks (daily
reward, quizzes, YouTube videos, referrals) per the user; **D48** the
`hipo-rewards.md` diagram dropped because the image itself carries "~20 % APY
in TON / 43.7 %", "TON/hTON" and "36 hours" (the file stays in
`public/docs/images/` unreferenced until a corrected diagram exists).

**Held, not applied** (open questions 3 and 4 still with the user): **D42**
the Hipo Fund "report every season" promise (last report December 2025),
**B4/B14** the evergreen "part of each season's unclaimed rewards is burned"
sentences on the HPO page (20/80 is documented for Season 3 only; whether it
is standing policy is unanswered). D32 (Season 3's own recorded figures) and
B7 (which keeps the existing claim) went ahead.

**Translations** — for exactly the touched English files, the fa, ru and hi
twins were updated (11 FAQ + 6 HPO-FAQ + 1 shell prose, 28 docs, `hpo.json`
and `landing.json` incl. the key renames, 48–49 files per locale), removals
mirrored (figure, calculator section, `hTON` links), then
`node scripts/check-i18n.mjs --update-hashes <locale>` (5 added, 52
refreshed, 5 orphaned keys dropped per locale).

## Decisions

Answers to the spec's open questions:

1. Audit scope labels — default: Quantstamp + ProgramCrafter = v2, TonTech +
   Sedov = v1.
2. Hipo Fund April table — **leave the numbers**, add only the "as reported on
   April 18, 2025" footnote (not the recomputed residual the spec proposed).
3. Missing March/June 2026 fund reports — **pending**; D42 held.
4. Seasonal burn share policy — **pending**; B4/B14 held.
5. "Exclusive offers" — cut, replaced by the documented Club-level benefit.
6. Unstaking video — confirmed no separate video exists; keep the shared id,
   fix both titles.
7. XP section — keep, reword to active participation (D47).
8. DEX swap URLs — verified by the user; address-based URLs applied (F5).
9. `HIPO_NETWORK` mainnet/testnet row in the MCP docs — kept (still
   documented upstream).
10. Hipo Club Seasons 4 and 5 (Season 5 is the current one) undocumented — deferred to the docs restructuring.
11. Terms (2023-08-17) / Privacy (2023-06-28) and the arbitration clause —
    deferred to legal; only the glued heading fixed.

Declined or deferred from the review, deliberately: the FAQ consolidation
(67 → ~38) and HPO FAQ rewrite (9 → 7); the docs sidebar re-grouping and
emoji pass; merges/deletions (`get-hgram.md` ≡ hGRAM page, the two-sentence
HPO page); the new Fees / Risks / Contracts & Audits / Glossary / "Staking
Without the App" pages; cuts of filler; the formatting sweep (alt text,
heading levels, stray `<br>`, `\ <sub>` run-ons, `.rar` → `.zip`, headings
used as CTAs); `FAQPage` JSON-LD and the FAQ scroll-spy; replacing the
hipo-rewards diagram image; Hipo Club Seasons 4 and 5 (current: 5).

## Dead-link audit

119 unique links from the FAQ/HPO/shell prose, the English docs, the `en`
catalogs, `FAQ.astro` and `Hpo.astro`: 52 internal (all present in `dist/`,
200 on the preview server, 4 anchors resolve, slash-less page URLs 404 on the
preview but every link already carries the trailing slash), 67 external (all
alive; 8 verified through a secondary channel — ton.vote via `api.ton.vote`,
npmjs and dune.com roots bot-protected for curl, the MCP endpoint answering
405 to GET as expected, flaky t.me/tonviewer on retry). **0 dead.** Fixed in
this batch: the `hTON` DEX links (now `/defi/`, whose URLs are address-based)
and the `claude.com/claude-code` redirect. Old domains checked for
completeness: `docs.hipo.finance/*` → `hipo.finance/docs/*` (path preserved),
`app.hipo.finance` → `hipo.finance/app/`.

## Verification performed

- `node scripts/check-i18n.mjs` — `i18n: ok`; fa, ru, hi each
  `coverage 100.0% (611/611), missing 0, stale 0, extra 0` (only the expected
  "not yet reviewed by a native speaker" warnings).
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 15 groups
  passed.
- `npm run build` — 194 pages, ~6 s; `npx -p typescript@5 tsc --noEmit` clean
  in `src/**`.
- `npx prettier --check` on all 203 changed files — clean.
- Acceptance greps (all 0): `Hipo Gang` in HPO prose/catalog; `hTON` in docs
  and `Model.ts`; `Hipo Cub|Powerd|burne&#x64;`; `20% APY|43.7%`;
  `dedicated testnet`; `Ender Ting`; `as low as 1 GRAM|as little as 1 GRAM`;
  `exclusive offers`; `Ston.fi|Stonfi`; `GRAMs|GRAM coins|native Grams`;
  `Start Your Investment Now`; `Upcoming Milestones`; `revenue-sharing` — in
  English and in all three locales.
- Implementation agents re-opened every `file:line` the spec cites before
  editing; the translation agents diffed each English file and mirrored the
  change, and each reported its locale's gate line.
- A spec-compliance / translation-mirroring review of the whole diff found
  every applicable spec row applied and the fa/ru/hi twins mirrored 1:1 (same
  removals, numbers, dates, links, key order), the held rows untouched, and
  raised ten small items; the nine actionable ones were applied in the same
  batch as rows A12, D49–D55, E8–E9 (landing/SEO HPO wording, the paused
  Ambassadors CTA, pool-vs-swap venues, past tense and superlatives on the
  archived programme pages, "strict" security standards, "staking rewards on
  TON"). Left deliberately: the landing hero / SEO "most profitable" positioning
  (pre-existing, governed by the `llms.txt` live-data rule, not a spec row).
- Not done: a browser check of the three new swap links (the user reports them
  verified; Chrome is still running without the proxy flag), Lighthouse, and a
  visual pass over the rewritten Hipo Club page in RTL.

## Follow-ups

- Answer open questions 3 and 4, then apply D42 and B4/B14 (and their fa/ru/hi
  twins, `--update-hashes` again).
- Native review of fa/ru/hi for the 52 changed items (`--mark-reviewed`).
- Replace `public/docs/images/introduction-hipo-rewards-1.jpg` with a diagram
  that matches the three-streams wording, then restore the `<figure>` in
  `introduction/hipo-rewards.md` (all locales).
- Open the three `Model.ts` swap links in the proxied Chrome and screenshot
  each landing with hGRAM → GRAM/TON preselected.
- Spec the deferred restructuring: FAQ consolidation, HPO FAQ rewrite, docs
  sidebar regrouping, new pages, formatting sweep, `FAQPage` JSON-LD.
- `introduction/hipo-stats.md:17` "Hipo Staked GRAM tokens" — consider "hGRAM"
  in the naming sweep; `hpo-tokens-distribution.md` still has pre-existing
  `\ <sub>` run-ons outside the two lines this batch touched.
- Legal review of Terms of Use and Privacy Policy.
- Record the commit hash in the table above once the batch is committed.
