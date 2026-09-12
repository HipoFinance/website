# Publishing the Hipo Fund Investment Policy Statement

Hipo Fund's Investment Policy Statement — draft v1.5, previously circulating as a plain Markdown file
outside the repo — is now a documentation page at `/docs/hipo-fund/investment-policy-statement/`, in all
ten locales, carrying a visible notice that it is a draft under community review and not yet in force.

The source file arrived with a publication note addressed to the maintainer, specifying the URL, the
sidebar position, the exact title tag, a unique meta description, a review banner, and a rule against hard
dates. That note was instructions about publication, not part of the policy, so it was stripped before
anything was written into `src/content/docs/`.

| commit    | subject                                                          |
| --------- | ---------------------------------------------------------------- |
| `f5adcf0` | Publish the Hipo Fund Investment Policy Statement as a docs page |

## What the note asked for, and what each requirement became

| Requirement                                                    | How it was met                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Publish at `/docs/hipo-fund/investment-policy-statement/`      | `src/content/docs/hipo-fund/investment-policy-statement.md`               |
| Sidebar label `Investment Policy Statement`, under `Overview`  | `astro.config.mjs`, inserted between `Overview` and `Report: August 2025` |
| Title tag `Hipo Fund Investment Policy Statement \| Hipo Docs` | frontmatter `title`; Starlight appends `\| Hipo Docs` itself              |
| Unique meta description, not the site default                  | frontmatter `description`                                                 |
| No hard dates                                                  | `September 2026` removed from the subtitle                                |
| A review banner, removed when the vote passes                  | a `:::caution` aside at the top of the page                               |

### The title needed no special handling

Starlight composes `<title>` as `` `${frontmatter.title} ${titleDelimiter} ${siteTitle}` ``. `titleDelimiter`
is unset repo-wide, so it is the default `|`, and `starlight().title` is `Hipo Docs`. A frontmatter title of
`Hipo Fund Investment Policy Statement` therefore produces the required string exactly, with no `head:`
override. `src/components/starlight/Head.astro` does not touch the title, so nothing there interferes.

The sidebar label and the page title differ on purpose — the sidebar carries the short
`Investment Policy Statement`, the title tag the long form — which is why the label lives in
`astro.config.mjs` rather than in frontmatter `sidebar.label`.

### The description matters more than it looks

`astro.config.mjs` sets a site-wide docs `description`, and 300 of the 430 docs pages inherit it. It is
English-only, so an inheriting page serves English metadata under `/fa/`, `/ar/` and the rest. Every
hipo-fund page already carries its own; this one does too, translated per locale.

### A `:::caution`, not Starlight's `banner:`

The note said "banner". Starlight has a `banner` frontmatter field that would match that word literally,
and it was deliberately not used. Nothing in this repo uses it — zero occurrences across 430 docs files and
none in the `starlight()` config — and `src/styles/docs.css` themes Starlight through custom properties
without ever declaring the banner's. A `banner:` would have rendered in stock Starlight colors against the
Warm Dark palette.

`:::caution` is the established pattern for exactly this notice. `hipo-ambassadors-program.md` uses a bare
`:::caution` with a bold one-liner to say the program is paused; this page says it is not yet in force the
same way. Removing it when the vote passes is deleting four lines.

### Which dates are "hard dates"

The note's rule was aimed at scheduling: review-period and vote dates belong in the announcements and on
ton.vote, not in a document that outlives them. Only one date fell under it — the `September 2026` stamp in
the subtitle, now `**Draft v1.5 · For community review and DAO ratification**`.

Two dates were kept. Section 1 dates the fund's creation to April 2025, and Section 14 cites Norges Bank
Investment Management's 2024 management costs. Both are historical facts the argument rests on, not
commitments that can go stale, and removing them would have damaged the document.

## The Overview page contradicted the page it links to

`src/content/docs/hipo-fund.md` announced the IPS as something "we are publishing in September 2026". With
the policy live and linked directly above the reports, that paragraph was both stale and a hard date. It now
links the draft and names no date; the paragraph immediately after it already points readers to Telegram and
ton.vote for the real schedule, which is where the note wanted those dates to live.

This was outside what the note asked for. It was done because the alternative was shipping a sidebar entry
whose parent page says the thing does not exist yet.

## Ten locales, because the gate has no soft option

All nine non-English locales are `indexed`, and `scripts/check-i18n.mjs` treats `indexed` exactly as strictly
as `public`: a released locale missing a docs page **or** its sidebar label is an error, and the script runs
as `prebuild`. Publishing the English page alone would have failed `npm run build` outright.

So the change is 31 files: the English page, nine translations, ten `docs-sidebar.json` labels, ten
`hipo-fund.md` paragraphs, and `astro.config.mjs`. Each locale was translated against `src/i18n/GLOSSARY.md`
and its own existing hipo-fund pages, which are the authority for that locale's digit convention — Persian
and Arabic-Indic digits for `fa` and `ar`, Indian lakh grouping for `hi`, period-thousands for `de`, `it`,
`id` and `pt-br`, spaced thousands for `ru`, `%`-before-number for `tr`.

Structure was held identical rather than trusted: every locale has the same 15 `##`, 8 `###` and 3 `####`
headings, the same 17 `---` separators, the same 67 table rows, the same `:::caution`, and the same eight `≤`
and two `≥` symbols as the English source.

### Two corrections during review

- **`de`** — the replaced Overview paragraph was the only place in that file glossing the English term as
  "(Anlagerichtlinie)". Four later mentions depended on it, so the gloss was restored.
- **`hi`** — `2-of-3` had been carried across as a literal token, against the sibling report's
  `3 में से 2`. The instruction to preserve figures exactly had been over-applied to a phrase. Fixed in all
  five places. `id`, `tr` and `pt-br` had already matched their own house forms without prompting.

## Notes for whoever reviews the translations

Every locale flagged the same shortage: this is the first document on the site to use fund-management
vocabulary, so "high-water mark", "sleeve", "band", "Opportunity Reserve", "buy-and-burn", "basis trade" and
"drawdown" had no existing rendering to reuse. Each translator chose one and applied it consistently, which
makes a change cheap — one term, one sweep — but none of these are house terms yet. They are the obvious
candidates for `GLOSSARY.md` rows once a native speaker settles them.

`ar` additionally flagged the `≤` and `≥` symbols for an eyeball in RTL: they are kept in their ASCII form,
followed by a space, as in English.

### Verification performed

- `node scripts/check-i18n.mjs --update-hashes` — every locale reported `2 added, 1 refreshed, 0 dropped`,
  matching the change exactly: the new page, its sidebar label, and the reworded Overview paragraph.
- `node scripts/check-i18n.mjs` — exit 0, all nine locales at 100.0% coverage, 0 missing, 0 stale, 0
  untracked, 0 extra. The `unreviewed` warnings are the pre-existing whole-corpus state, not new.
- `npm run build` — 533 pages, no errors. All ten IPS pages built.
- Built HTML: `<title>Hipo Fund Investment Policy Statement | Hipo Docs</title>` byte-exact; `description`
  is the page's own, not the site default; `starlight-aside--caution` renders with the notice text.
- Sidebar order in the built page: Overview → Investment Policy Statement → August 2025 → December 2025 →
  August 2026.
- `npx prettier --check` clean on every touched file.
- Structural and symbol parity across all ten locales, as above.

### Follow-ups

- **A visual check was not done.** The Chrome extension was not connected this session, so the rendered page
  was verified at the HTML level only. The RTL pass for `fa` and `ar` — the `≤`/`≥` symbols, the tables, the
  Latin tokens in Arabic script — is still outstanding.
- **Native review.** All 627 items per locale sit at `reviewed: false`; the new ones are no different.
  `--mark-reviewed <locale> docs/hipo-fund/` marks just this subtree once a speaker has read it.
- **Remove the `:::caution` when the DAO vote passes**, in all ten locales, and drop "Draft v1.5" from the
  subtitle at the same time.
- **`lastmod`** needs these files committed. Docs are dated by path from the newest commit touching them, so
  the page has no `<lastmod>` until then.
- The `shallow git clone: omitting <lastmod>` line in the local build is expected — CI checks out with
  `fetch-depth: 0`.
