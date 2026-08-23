# 2026-08-24 — Docs formatting and accessibility sweep

The last of the three English-only content batches (`specs/docs-formatting-sweep.md`, suggestion #6 of the
content review): the mechanical formatting and accessibility defects the GitBook import left across `/docs/`.
No factual copy changed — the two exceptions are named below. Also in this session, on request: deep-link
anchors for the `/hpo/` FAQ. fa/ru/hi stay `draft`; the locale sync is the next step.

## Commits

| Commit    | Description                                     |
| --------- | ----------------------------------------------- |
| `04573b5` | Sweep the docs formatting and add /hpo/ anchors |

## What changed

The ten defect classes were re-measured against the tree at `44b248e` first — several items from the review
report had already been fixed by the accuracy and docs-restructure batches and were dropped from scope.

- **Alt text** — all 22 images across 12 pages. Every image was opened and described from what it actually
  shows: the five staking-tutorial screenshots by the step they illustrate, the four unstaking ones by the
  venue (Hipo app, DeDust, STON.fi, in-wallet swap), the three phishing screenshots by the tell they
  demonstrate (impersonation DM, fake site asking for the wallet phrase, stranger promising higher returns),
  the flow diagrams by the flow.
- **Empty `<figcaption>`** — all 21 removed; `<figure>` and `width` kept, so the rendered layout is unchanged.
- **Heading hierarchy** — 30 pages re-levelled so the shallowest in-page heading is `##` (Starlight renders
  the frontmatter title as the page `h1`) with no skipped levels. `liquid-staking.md` had a `###` above a
  `##`; `phishing-awareness-and-prevention.md` ran five `####` above a `###`; `hipo-ambassadors-program.md`
  opened with a `####` status notice, which became a bold paragraph inside its caution block.
- **Bold in headings** — stripped from 14 headings, emoji kept.
- **Headings used as CTAs** — the two remaining ones (`tvl-milestone-rewards.md`, `hgram-use-cases.md`) became
  body sentences carrying the link.
- **`\ <sub>` wallet run-ons** — the six allocation paragraphs in `hpo-tokens-distribution.md` now end at
  their full stop, with the two wallets in a `Wallet | Address` table underneath. All 24 address occurrences
  are byte-identical to the previous version; the pre-existing text/href pairs that differ are
  bounceable/non-bounceable forms of the same account and were left exactly as found.
- **Stray `<br>`, escaped asterisks, generic iframe titles, a double-spaced frontmatter title** — all fixed;
  the two `title="Hipo video"` iframes now name their video.
- **`.rar` → `.zip`** — both brand kits repacked with `bsdtar` + `zip`; member lists and per-file checksums
  verified identical (15 and 9 files) before the `.rar` files were deleted. Links updated on `brand-kit.md`
  and `hipo-gang.md`.
- Also swept a pre-existing prettier drift in `legal-agreements/terms-of-use.md` (frontmatter quote style).

## HPO FAQ anchors

Requested mid-session, outside the formatting spec: `/hpo/` had no anchors at all, so neither its sections nor
its FAQ answers could be linked to — unlike `/faq/`, where every question is an id and a deep link opens the
collapsed `<details>`.

- The reveal behaviour moved out of `src/scripts/faq-anchors.ts` into `src/scripts/details-anchors.ts` as
  `installDetailsAnchors(aliases)`. `/faq/` passes `FAQ_ANCHOR_ALIASES`; the new `hpo-anchors.ts` passes
  nothing, since the HPO FAQ has never had public anchors to retire. Both pages import the same built chunk.
- Each HPO FAQ answer now carries the id `hpoFaqAnchor()` derives (`src/components/hpoFaq.ts`): the prose file
  name minus its `NN-` order prefix, so renumbering the list does not break a link. Like the `/faq/` anchors,
  these stay the English slug in every locale.
- The page's sections got ids too: `#utility`, `#tokenomics` (already there), `#scarcity`, `#investors`,
  `#watch`, `#faq`. The hero and the closing CTA were left alone — they are not destinations.
- Both FAQPage JSON-LD blocks now give each `Question` its `url` with the fragment (40 on `/faq/`, 7 on
  `/hpo/`), so a rich result can jump straight to the answer. The app shell's mini-FAQ has no anchors and was
  left unchanged.

## Decisions

Answers to the spec's five open questions: emoji kept in headings; empty figcaptions **deleted** rather than
filled (filling them would add visible copy that then needs translating, which this batch excludes); both
tutorials keep the same video; `.zip` files keep the imported basenames.

The one substantive answer was on `brand-kit.md`. Rather than assume, both archives were listed. The **Hipo
Gang** kit does ship real light/dark pairs; the **main Hipo** kit does not — it has a single dark-background
variant. The same sentence also claimed typography (there are no font files) and PNG-only (five members are
SVG). It was rewritten to what the archive contains: "…offering our logo, logotype and token marks in PNG and
SVG, including a variant for dark backgrounds."

### Verification performed

- `npm run build` — 52 pages + 4 redirect stubs, exit 0, same as before the batch; `check-i18n` `ok` with only
  the expected draft-locale warnings; selftest 15 groups; prettier clean across all of `src/content/docs`.
- A script walked every English page's heading sequence: shallowest is `##` everywhere, no skipped levels.
- Greps for all ten defect classes return nothing across the English docs.
- `dist/` spot-checked: the treasury address renders with plain `__` (prettier's `\_\_` escape is markdown,
  not output), six wallet tables present, both `.zip` links resolve to files that ship, no `alt=""` left.
- The full `git diff` was read: apart from prettier's own bullet/HR/quote normalisation, the only wording
  changes are the two CTA sentences, the two download-link texts, the escaped-asterisk line and the
  `brand-kit.md` sentence above.
- Anchors: `dist/hpo/index.html` carries the six section ids and seven `<details>` ids; every JSON-LD
  `Question.url` fragment resolves to an id on its own page (checked for `/faq/`, `/hpo/` and, in a
  drafts build, `/fa/hpo/`); `/faq/` and `/hpo/` import the same `details-anchors` chunk.
- Not done: browser click-through (Chrome still lacks the proxy flag) and the locale twins.

### Follow-ups

- **Stale imagery.** Writing the alt text surfaced that several screenshots predate the current product: the
  five staking-tutorial shots and two of the swap shots still show **TON/hTON** and the old light theme, one
  shows the retired **Hipo Gang** Mini App as a way to stake, and the STON.fi shot is pointing the wrong way
  (GRAM → hGRAM on an unstaking page). The alt text describes each honestly in current naming, but the images
  themselves need re-capturing.
- The main brand kit still contains `hTON Token Logo.png/.svg` — needs a replacement asset from the team.
- Next: the fa/ru/hi locale sync (git-mv unchanged twins, draft merged/renamed/new files, delete the four
  orphan doc twins per locale, `--update-hashes`, flip the registry back to `indexed`), then the user's commit.
