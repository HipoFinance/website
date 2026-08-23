# Docs formatting and accessibility sweep

**Status:** implemented

## Goal

Clean up the mechanical formatting and accessibility defects the GitBook import left in `/docs/` — empty
image `alt` text, inconsistent heading levels, bold inside headings, headings used as buttons, `\ <sub>`
run-ons, stray `<br>`, escaped asterisks, generic video titles and `.rar` downloads — so every docs page reads
and announces correctly. **No factual copy changes**: this is suggestion #6 of the content review, the last
English-only batch before the fa/ru/hi sync.

## Context

42 English docs pages under `src/content/docs/` (locale twins excluded — they stay untouched until the sync
pass, see the standing decision in the changelog for 2026-08-23). Starlight renders the frontmatter `title` as
the page `<h1>`; no page contains an in-page `# ` heading (verified), so the correct first in-page level is
`##`. `src/styles/docs.css:192` already hides `figcaption:empty`, so empty captions are invisible but remain
dead markup.

Current defect counts, re-measured against the tree at `44b248e` (several items from the review report were
already fixed by the accuracy and docs-restructure batches and are **not** in scope below):

| #   | Class                                                 | Count                   | Where                                                                                                                                                                                                                                                                                                |
| --- | ----------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `alt=""` on images                                    | 22 images in 12 files   | `tutorials/staking.md` (5), `tutorials/unstaking.md` (4), `security/phishing-awareness-and-prevention.md` (3), `introduction/how-does-hipo-work.md` (2), + 8 files with 1 each                                                                                                                       |
| 1b  | `<figcaption></figcaption>` empty                     | 21                      | same files                                                                                                                                                                                                                                                                                           |
| 2   | First in-page heading is `###`/`####`, or levels skip | 30 files                | e.g. `dao.md` (`###` only), `hipo-ambassadors-program.md` (`####` then `###`), `security/phishing-awareness-and-prevention.md` (`####`×5 then `###`), `introduction/liquid-staking.md` (`###` then `##`)                                                                                             |
| 3   | `**bold**` inside a heading                           | 14                      | `tvl-milestone-rewards.md:15,26`, `hipo-incentive-programs.md:29,46,66`, `hipo-gang.md:9`, `hipo-club-season-2.md:5`, `-season-3.md:5`, `hipo-gang-season-1.md:9`, `hipo-ambassadors-program.md:7`, `dao.md:5`, `quarterly-report-december-18-2025.md:21,44`, `quarterly-report-august-1-2025.md:65` |
| 4   | Heading used as a link/CTA                            | 2                       | `tvl-milestone-rewards.md:24`, `hgram-use-cases.md:13`                                                                                                                                                                                                                                               |
| 5   | `\ <sub>…</sub>` wallet run-ons                       | 6 blocks                | `hpo-tokens-distribution.md:17,21,25,29,41,45`                                                                                                                                                                                                                                                       |
| 6   | Stray `<br>`                                          | 3 standalone + 4 inline | `hipo-on-dune.md:28`, `hipo-stats.md:28`, `hipo-mcp-server.md:152`; inline at the end of four `hpo-tokens-distribution.md` paragraphs                                                                                                                                                                |
| 7   | Escaped-asterisk bold renders literally               | 2                       | `hipo-incentive-programs.md:13,14` (`– \*\***Completed!\*\*`)                                                                                                                                                                                                                                        |
| 8   | Generic `title="Hipo video"` on iframes               | 2                       | `security/phishing-awareness-and-prevention.md:13`, `introduction/liquid-staking.md:15`                                                                                                                                                                                                              |
| 9   | `.rar` downloads                                      | 2                       | `brand-kit.md:7`, `giveaways-and-prizes/hipo-gang.md:52` → `public/docs/images/*.rar`                                                                                                                                                                                                                |
| 10  | Double space in frontmatter `title`                   | 1                       | `quarterly-report-december-18-2025.md:2`                                                                                                                                                                                                                                                             |

Already fixed by earlier batches, dropped from scope: the glued `privacy-policy.md` heading, the bolded
pseudo-headings on seven pages, the `tvl-milestone-rewards.md` escaped asterisks, the broken ordered list in
`hipo-club.md`, the `1-`/`2-` numbering in `tutorials/unstaking.md`, the `\ <sub>` block in `hipo-fund.md`,
the `<br>` in `hipo-governance-token-hpo.md`, and the stale `hipo-fund.md` description.

`src/content/prose/en/**` was scanned for all ten classes and is clean — this batch touches docs only.

## Approach

One mechanical pass, class by class, with the two judgement-heavy classes (alt text, heading levels) done
per file rather than by regex.

**Alt text (1).** Every image is opened and described before its `alt` is written. Rules: alt states what the
image _shows in context_, not "image of"; screenshots that carry an instruction get the instruction ("The
Hipo app's stake tab with the amount field filled and the Stake button highlighted"); the phishing
screenshots name the tell they illustrate; diagrams summarise the flow in one sentence. Empty
`<figcaption></figcaption>` is deleted (not filled) — every one of these figures already has the caption text
in the surrounding paragraph, and Starlight hides empty captions anyway. `<figure>`/`width` attributes stay,
so nothing about the rendered layout changes.

**Heading levels (2).** Per page: the shallowest in-page heading becomes `##` and every deeper level shifts
by the same delta, so relative structure is preserved and no level is skipped. `liquid-staking.md` (which has
a `###` above a `##`) and `hipo-ambassadors-program.md` / `phishing-awareness-and-prevention.md` (which run
`####` above `###`) are re-levelled by reading the page, not by shifting. Rejected: leaving levels alone and
only fixing the `####`-above-`###` inversions — the sidebar's on-page "On this page" nav is built from
heading levels, so a page whose only headings are `###` gets a needlessly indented ToC.

**Headings as CTAs (4).** `### [Start Earning Staking Rewards](/stake/)` becomes a body sentence with the
link; `#### Check out hGRAM use cases on [Hipo DeFi section](/defi/).` likewise. A link is not a section.

**`\ <sub>` run-ons (5).** The six allocation paragraphs in `hpo-tokens-distribution.md` each end with a
`\ <sub>New Multisig Wallet:</sub> [<sub>EQ…</sub>](…)\ <sub>Old Wallet:</sub> …` tail. The prose stays as
prose; the two addresses move into a two-column Markdown table (`Wallet` / `Address`) under the paragraph,
with the address as a `tonviewer.com` link. Addresses are copied verbatim — note that four of the existing
link _targets_ differ from their link _text_ (e.g. `:17` text `UQAKcMr…-hZC` → href `EQAKcMr…-kuH`); these
are the same account in different address forms, so the text is kept and the href kept, unchanged. Any
mismatch that is **not** a bounceable/non-bounceable pair of the same account is reported, not silently
"fixed".

**`.rar` → `.zip` (9).** `bsdtar` on this machine reads both archives (verified: `brand-kit-file-1.rar`
contains `Docs/Hipo Logo*.png|svg`, 507 KB; the Hipo Gang kit is 2.6 MB). Each is extracted to a temp dir and
repacked with `zip -r` at the same top-level structure, written to
`public/docs/images/<same-basename>.zip`; the `.rar` files are deleted and the two links updated. No asset is
re-authored — byte-identical members, new container.

Everything else (3, 6, 7, 8, 10) is a literal edit.

## Changes

- `src/content/docs/**.md` (English only, ~32 files) — alt text + figcaption removal, heading re-levelling,
  bold stripped from headings (emoji kept), CTA headings converted to sentences, `<br>` removed, escaped
  asterisks fixed, two iframe `title`s made descriptive ("How to spot a phishing attempt", "What is liquid
  staking?"), December report title double space removed.
- `src/content/docs/hipo-tokens/hipo-governance-token-hpo/hpo-tokens-distribution.md` — six wallet tables.
- `public/docs/images/brand-kit-file-1.zip`, `public/docs/images/giveaways-and-prizes-hipo-gang-file-1.zip` —
  added; the two `.rar` files removed.
- `src/content/docs/brand-kit.md`, `src/content/docs/giveaways-and-prizes/hipo-gang.md` — download links point
  at the `.zip`, link text says "Brand Kit (ZIP)"; `brand-kit.md`'s opening sentence corrected to the
  archive's actual contents (see open question 3).
- No changes to `astro.config.mjs`, the sidebar, `src/i18n/**`, `public/llms.txt`, or any locale twin.

## Acceptance criteria

- [x] `grep -rn 'alt=""' src/content/docs --exclude-dir={fa,ru,hi}` returns nothing; each of the 22 images has
      alt text that names what is visible in that image (spot-checkable against the file).
- [x] `grep -rn '<figcaption></figcaption>' src/content/docs --exclude-dir={fa,ru,hi}` returns nothing.
- [x] For every English docs page, the shallowest in-page heading is `##` and no heading is more than one
      level deeper than the previous heading (checked by a script that walks each file's heading sequence).
- [x] `grep -rnE '^#{1,6} .*\*\*' src/content/docs --exclude-dir={fa,ru,hi}` returns nothing.
- [x] `grep -rnE '^#{1,6} .*\]\(' src/content/docs --exclude-dir={fa,ru,hi}` returns nothing.
- [x] `grep -rnE '<br ?/?>|<sub>|\\\*' src/content/docs --exclude-dir={fa,ru,hi}` returns nothing.
- [x] `grep -rn 'title="Hipo video"' src/content/docs` returns nothing; all 8 iframes have a title naming
      their specific video.
- [x] No `.rar` remains in `public/docs/` or in any docs link; both `.zip` files exist, and
      `unzip -l` lists the same member names as `bsdtar -tf` did for the corresponding `.rar`.
- [x] `npm run build` exits 0 with the same page count as before the batch (52 pages + 4 redirect stubs) and
      the i18n gate reports only the expected draft-locale warnings.
- [x] `npx prettier --check` passes on every touched file.
- [x] `git diff` contains no change to any sentence's wording except the two CTA headings, the two link texts,
      the escaped-asterisk line and the `brand-kit.md` sentence sanctioned by open question 3 — verified by
      reading the diff in full. All 24 wallet-address occurrences in `hpo-tokens-distribution.md` are
      byte-identical to `HEAD` after unescaping.

## Risks & rollback

- **Wrong alt text** is worse than none for a screen-reader user. Mitigation: every image is viewed, and the
  alt is written from the image plus its surrounding paragraph; anything genuinely decorative gets `alt=""`
  _and_ `role="presentation"` rather than an invented description (expected: none of the 22).
- **Re-levelling headings changes anchor ids?** No — Starlight derives slugs from heading text, not level, so
  in-page anchors and the four inbound `/docs/…#…` links are unaffected. Re-checked by the acceptance build.
- **Zip repack could lose a file** (e.g. a rar with unsupported compression). Mitigation: member lists are
  compared before/after and the `.rar` is only deleted once the `.zip` verifies; if `bsdtar` fails on either
  archive, that half of class 9 is reported as blocked and the `.rar` stays.
- Rollback is `git revert` of the single commit plus restoring the two `.rar` files from it.

## Open questions

All answered by the user on 2026-08-24; recorded here as decisions.

1. **Emoji in headings** — keep the emoji, strip only the `**`. _Answered: default._
2. **Empty figcaptions** — **delete** the 21 empty `<figcaption></figcaption>` tags rather than writing
   visible captions. The rendered pages are unchanged (the CSS already hides empty captions) and no new
   translatable copy enters the batch. `alt` text is a separate, invisible attribute and is filled for all 22
   images regardless. _Answered: delete._
3. **`brand-kit.md:5`** — reviewed the contents of both archives rather than assuming. The **Hipo Gang** kit
   does ship real light/dark pairs (`Light Logotype.png`, `Dark Logotype.png`, plus light/dark lockups). The
   **main Hipo** kit does not: one dark-background variant (`Hipo Logo on Dark BG.png`) and no light/dark pair
   for the logotype or the token marks. The same sentence is wrong on two further counts — it claims
   **typography** (no font files are in the archive) and says everything is **PNG** (five members are SVG).
   The sentence is therefore rewritten to what the archive actually contains: "…offering our logo, logotype
   and token marks in PNG and SVG, including a variant for dark backgrounds." _Answered: review both versions
   → corrected._
4. **Both tutorials embed the same YouTube id** (`X2efM5RuDow`) — left as is; the accuracy batch already
   confirmed no separate unstaking video exists and both use the same combined title. _Answered: default._
5. **`.zip` naming** — keep the imported basenames (`brand-kit-file-1.zip`,
   `giveaways-and-prizes-hipo-gang-file-1.zip`). _Answered: default._

Out of scope, recorded as a follow-up: the main brand kit contains `hTON Token Logo.png/.svg`, which predates
the hGRAM rename. Replacing it needs a new asset from the team — this batch does not re-author assets.
