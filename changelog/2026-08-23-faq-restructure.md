# 2026-08-23 — FAQ restructure, HPO FAQ, FAQPage JSON-LD

Third session batch of the content overhaul: the site FAQ was consolidated from 67 questions in 10 sections to
40 questions in 9 sections, the HPO page's FAQ went from 9 items to 7, and both pages now emit `FAQPage`
JSON-LD. Implemented against the approved `specs/faq-restructure.md` (all eight open questions at their
defaults). Per the standing decision, this batch changed **English only** — fa/ru/hi were flipped from
`indexed` back to `draft` in `src/i18n/registry.mjs` and will be synchronised once, after the docs batch and
the formatting batch, then flipped back.

## Commits

| Commit | Description                                                    |
| ------ | -------------------------------------------------------------- |
| _tbd_  | (pending — to be filled in after the user confirms the commit) |

## What changed

### Site FAQ (67 → 40, 10 → 9 sections)

New section order: Getting started (7) · Staking (5) · Rewards & APY (5, new) · hGRAM (4) · Unstaking (6) ·
Security & risks (4) · Validators & Staking Marketplace (3) · HPO & Hipo Club (3) · Support (3). `general`
became `getting-started`; "TON & Liquid Staking" and "Fees" were dissolved into the flows. Per file: 17 keep,
6 move (same name, new section), 2 rename, 15 merge-of (24 sources folded in), 3 cut outright. Anchors are
file names, so the three anchors deep-linked from the docs survived by keeping their names; the 30 retired
anchors are mapped in `src/components/faqAnchorAliases.ts` and rewritten client-side by
`src/scripts/faq-anchors.ts`, which also fixes the pre-existing bug that deep links scrolled to a collapsed
`<details>` (and now handles re-clicking the current hash). Answers copy the tighter app-shell mini-FAQ
wording, reuse the accuracy batch's canonical sentences, and now carry on-site links (`/stake/`, `/stats/`,
`/defi/`, docs pages) that the old FAQ almost entirely lacked.

### HPO FAQ (9 → 7)

Dropped the items duplicating sections rendered on the same page ("how to buy", the scarcity text, the
signpost item and the sell-pressure IR copy); added the three answers a buyer actually needs: the HPO jetton
address (with tonviewer link — also added to `public/llms.txt`), how profit shares are calculated and paid
(per round, paid each Hipo Club season, 1,000 HPO withdrawal threshold), and how to vote (ton.vote + DAO
docs).

### FAQPage JSON-LD

`src/components/pages/jsonLd.ts` (shared `stripMarkdown` + `faqPageJsonLd`), section list in
`src/components/faqSections.ts`, `jsonLd` prop added to `LandingLayout`/`HpoLayout` (AppLayout pattern),
`FaqRoute`/`HpoRoute` emit `@graph: [WebPage, FAQPage]` (40 and 7 items) with per-locale `inLanguage`;
`SEO.astro` now escapes `<` in serialised JSON-LD. The app shell's existing FAQPage blocks are byte-identical.

### Also in this batch

- `src/content.config.ts` now filters docs of locales not built in this run out of the Starlight collection —
  previously draft-locale docs were built as English-locale pages under `/fa/docs/` (no `lang`, no `noindex`).
- Accuracy-spec open question **Q4** answered and applied (B14): since Season 4 HPO rewards accrue directly to
  hGRAM holders, there is no claiming step — the `/hpo/` "Seasonal burns" card now describes the Season 1–3
  burns as history; B4 became moot when the duplicate FAQ item was dropped.
- Review follow-ups: CS-7 reworded site-wide — the 0.1 GRAM gas **prepayment** attached by the app is now
  distinguished from the ~hundredth-of-a-GRAM actually **spent** (the FAQ contradicted its own multisig
  answer); the non-custodial answer no longer claims unconditional exit (Full vs Instant stated); the
  "holding HPO raises your Club level" overstatement corrected in seven files (holding _keeps_ the level,
  levels rise through the instant or seasonal upgrade); the scarcity card no longer says "nothing is left
  unclaimed" (the 1,000 HPO threshold means small balances stay accrued); the risk answer trimmed to the
  spec's length; `faq.json`/`seo.json` keys updated (`seo.hpo.title` → Governance & Profit-Sharing).

## Decisions

All eight spec defaults: Fees section dissolved; "TON & Liquid Staking" retired; 40 questions; `/hpo/` keeps
the scarcity section and drops the FAQ duplicate; anchor alias script; no JSON-LD length cap; FAQPage on
`/hpo/` too; `seo.hpo.title` fixed. Standing rule recorded: batches 1–3 are English-only, one locale sync at
the end. Deferred: `seo.faq.description` superlatives (now also surfacing as the FAQ's JSON-LD
`WebPage.description` — flagged for the SEO copy decision), the FAQ side-nav scroll-spy, batches 2 and 3.

### Verification performed

- `npm run build` — 50 pages (English-only tree), exit 0; prebuild gate `i18n: ok` with the expected
  draft-locale warnings; selftest 15 groups; `tsc` clean in `src/**`; prettier clean on all touched files.
- JSON-LD extracted from `dist/faq/index.html` and `dist/hpo/index.html`, parsed: 40 / 7 `mainEntity`, every
  `name` matching a rendered summary, answers free of markup; shell pages unchanged.
- All 16 in-page anchors and 12 internal link targets resolve; the 30 retired anchors are absent from the
  built page and present in the alias map; the four inbound `/faq/#…` links all land on live anchors.
- An independent review read all 47 new answers against `public/llms.txt` and the spec; its seven findings
  were applied (see above).
- Not done yet: locale twins (deferred to the sync pass), `/fa/faq/` JSON-LD check, a browser click-through
  (Chrome still lacks the proxy flag), and the post-deploy Google Rich Results test.

### Follow-ups

- `specs/hipo-fund-onchain-reports.md` (accuracy-spec Q3) is drafted and awaiting the user's approval; D42 on
  `hipo-fund.md` stays held until the report exists.
- Batch 2 spec (docs sidebar restructure + Fees/Risks/Contracts/Glossary/hub pages), then batch 3 spec
  (formatting sweep).
- Locale sync for fa/ru/hi (git-mv unchanged twins, draft merged/renamed/new, `--update-hashes`, flip back to
  `indexed`), then commit — the user calls the commit explicitly.
