# Per-URL `<lastmod>` in the sitemap, from git history

The session started as a Search Console question — the Sitemaps report showed `sitemap-0.xml` last
read on 21 August even though `sitemap-index.xml` had been removed and re-submitted on the 25th — and
ended with the sitemap emitting a truthful `<lastmod>` for every URL.

The report's staleness turned out to be a non-issue, and the diagnosis is worth recording because it
will come up again. A sitemap index and the sitemaps it lists are, to Google, two independent files on
two independent schedules: re-submitting the index says "here is a list of my sitemaps" and does not
queue a fetch of any child. On top of that, the "Last read" column is a reported date from a batched
pipeline that lags reality. Removing and re-adding a sitemap — which is what prompted the question —
does not force a crawl, is not needed for discovery (`robots.txt` already carries the `Sitemap:` line),
and throws away the entry's accumulated history in the report. There is no button anywhere that forces
a sitemap fetch. What the site was actually missing was `lastmod`: all 510 URLs carried only `<loc>`
plus their `xhtml:link` alternates, so Google had no cheap way to tell which pages had changed and was
left to re-derive that by fetching and comparing.

| Commit    | Description                                                   |
| --------- | ------------------------------------------------------------- |
| `9e48ef7` | Date the sitemap's URLs from the git history of their content |
| (this)    | Record the sitemap-lastmod commit hash in the changelog       |

## What changed

`src/data/lastmod.mjs` is new. It runs one `git log` pass over `src/i18n`, `src/content/prose`,
`src/content/docs` and `src/pages`, builds a map of path → newest commit date (rolled up over ancestor
directories so a prose directory can be queried as a unit), and answers `lastmodFor(pathname)` for each
sitemap URL. `astro.config.mjs` calls it from a new `serialize` hook on the `sitemap()` integration.
`.github/workflows/deploy.yml` gains `fetch-depth: 0` on the checkout step.

### Why a wrong date is worse than no date

Google's position, stated repeatedly and unchanged as of 2026, is that trust in `lastmod` is **binary**:
it either believes a site's dates or discards them for the whole site. It verifies the obvious way — it
fetches a URL you flagged and compares against the copy it holds. So the one failure that matters is
claiming a page changed when it did not, and the obvious implementation, stamping the build time on
every URL, is precisely that failure: each of the four daily rebuilds would announce that all 510 pages
changed, Google would find them identical, and the field would be distrusted site-wide. That is strictly
worse than emitting nothing.

That asymmetry drives every decision in the module. When in doubt it emits nothing, because a missing
date costs only the status quo — Google falls back to its own per-URL change heuristics — while a wrong
one costs the signal itself.

### What counts as a page's content

A page's date is the newest commit touching its **content inputs**, and deliberately not its layout,
components or CSS:

- landing pages → `src/i18n/<locale>/landing.json`
- `/faq/` → `faq.json` + `src/content/prose/<locale>/faq/`
- `/hpo/` → `hpo.json` + `src/content/prose/<locale>/hpo-faq/`
- the five app pages → `src/content/prose/<locale>/shell/<page>/` only
- docs → the one Markdown file behind the page
- `/verify/` and `/vs/` → their own page files, since both write their copy inline

Editing `LandingLayout.astro` does re-render all 510 pages, but chrome is not the kind of change
Google's staleness model is asking about, and bumping every date on a refactor would be the
mass-false-positive problem wearing a different hat. The repo's i18n discipline is what makes catalogs
a sound proxy: every user-visible string goes through a catalog or the prose collection, so copy cannot
change without one of them changing.

`site.json`, `seo.json` and `app.json` are excluded for the same reason. `site.json` and `seo.json`
are shared by all 51 URLs of a locale, so attributing an edit in one to any single page would be a
false positive on the other 50. `app.json` is subtler and was in the first draft: it is one flat
190-key namespace shared by all five app pages, so a label changed on `/defi/` would have dated the
other four as well — code review measured that as 40 false claims across 50 URLs, roughly a tenth of
the sitemap, recurring on every app copy change. The five app pages now take their date from their own
explainer cards alone, which are genuinely per-page and exist in every locale.

The cost is a real, accepted gap: a change that only rewrites one page's `<title>`, its meta
description or an app label will not move that page's `lastmod`. Under-reporting is the safe
direction, and per-key attribution inside a shared JSON file is not worth the fragility.

Translated pages carry **their own** date, not the English source's. When the Persian catch-up lands a
week after the English edit, the later date is the truthful one for `/fa/`.

### Two things that would have quietly produced garbage

**Shallow clones.** `actions/checkout` defaults to `fetch-depth: 1`, in which `git log` returns the tip
commit's date for every file — the build-timestamp failure wearing a git costume. Hence `fetch-depth: 0`
in the workflow, and a `git rev-parse --is-shallow-repository` guard in the module that refuses to emit
any `lastmod` rather than emit 510 identical ones. A second guard catches a history the first misses
(a squashed export, say): if every tracked file shares one date, the dates carry no information and are
dropped. The visible symptom of losing the workflow line is therefore a sitemap with no dates at all,
not a poisoned one.

**Merges.** The first implementation used `--no-merges`, and verification caught it under-dating the ten
home pages by two days. Commit `fb449fc` is a merge whose conflict resolution gave nine `landing.json`
catalogs their final text — a real content change that lives only in the merge commit. The fix is
`--diff-merges=combined` (git ≥ 2.31), which lists exactly the paths differing from _every_ parent: an
ordinary merge still contributes nothing, while an edit made during a merge counts.
`--diff-merges=first-parent` would have gone the other way and credited the merge with everything the
branch brought in.

### One way this could have failed silently

Code review caught that the date parse sat outside the `try/catch`. A commit object written directly by
an importer with an out-of-range timestamp makes `git log --format=%cI` print something
`new Date().toISOString()` refuses, throwing a `RangeError` — and `@astrojs/sitemap` catches a throwing
`serialize` by logging an error and writing **no sitemap at all**, with the build still exiting 0. One
bad commit anywhere in the history of the four scanned trees would have silently shipped a site with no
sitemap. An unparseable date now degrades to "no date", which the existing null check already handles.

### Incidentally

`@astrojs/sitemap` derives the sitemap index's own `lastmod` from the newest of the child's items
(`getLatestLastmod`), so `sitemap-index.xml` gained a truthful date for free. `changefreq` and
`priority` stay unset — Google has said for years that it ignores both.

## Expectations

This is a real but modest win and should not be oversold. Crawl budget is not the bottleneck for a
512-URL site; Google's own guidance puts budget management at tens of thousands of URLs and up. What
`lastmod` changes is not how much Google crawls but **which** URLs it spends its existing budget on.
The observable effect is that edited pages should refresh in the index in days rather than drifting to
weeks. It will not speed up discovery of a new page or locale, will not rescue anything sitting in
"Crawled – currently not indexed", and will not change total crawl volume.

Also worth noting for the original question: `sitemap-0.xml`'s "Last read" date diagnoses the file, not
the indexing. Once Google has the 512 URLs it does not need to re-read the file to keep crawling them;
the Pages report and URL Inspection are where the real measurement lives.

### Verification performed

- `npm run build` — clean; 514 pages built, `prebuild` i18n gate passes (9 pre-existing
  "not yet reviewed by a native speaker" warnings, unchanged).
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 17 groups passed.
- `npx prettier --check src/data/lastmod.mjs astro.config.mjs` — clean.
- **512 of 512 URLs carry a `<lastmod>`**, and the sitemap index carries one.
- Every emitted date was checked against an independent `git log -1 --format=%cI` over the same page's
  inputs, computed by a throwaway script that re-derives the mapping from scratch: **0 mismatches**.
  This is also what caught the `--no-merges` bug, which showed as 10 mismatches on the home pages.
- The dates are genuinely distinct — 12 values spanning 2026-08-10 to 2026-08-30 — so the shallow-clone
  failure mode is demonstrably absent locally. The largest cluster (320 URLs at 2026-08-24T19:46:24Z)
  is commit `33abe5f`, "Translate the site into nine locales", which really did create all of that
  content in one commit.
- Reviewed by the code-reviewer agent, which additionally exercised the module against a `--depth 1`
  clone, a squashed single-commit repo, a non-repo directory, a crafted out-of-range commit date, and
  odd pathnames (`/FAQ/`, `/faq/?x=1`, `//faq//`, `/docs/../faq/`). Its two substantive findings — the
  `RangeError` above and `app.json`'s blast radius — are fixed; three doc/comment gaps it named are
  closed in this commit, including the `ROUTES` step now added to the "Adding a page" checklist in
  `CLAUDE.md`.
- Not verified: the CI path. `fetch-depth: 0` is unexercised until the next deploy, and the first thing
  to check afterwards is that the live `sitemap-0.xml` has varied dates rather than 512 identical ones.

### Follow-ups

- After the next deploy, confirm the live sitemap's dates vary, then submit
  `https://hipo.finance/sitemap-0.xml` as its own entry in Search Console alongside the index — the
  child gets its own row, its own "Last read" and its own error reporting, which is the visibility that
  was missing when this started. Do not remove and re-add the index again.
- A history rewrite (`filter-repo`, a full rebase) restamps every committer date with "now" and would
  date the whole site today. The uniform-date guard only catches a rewrite that finishes inside one
  second, so re-check the sitemap after one. Noted in the module header rather than coded around.
- Declined: per-key attribution of `seo.json`, `site.json` and `app.json` to individual pages. It would close the
  meta-description gap but needs per-key blame inside a JSON file, and the failure mode of getting it
  wrong is the one thing this module exists to avoid.
- Declined: frontmatter `lastUpdated` dates on the docs and prose collections. Git already records the
  same fact; hand-maintained dates across 430 doc files in ten locales would rot within a month.
- Note for future maintenance: adding a page means adding its route to `ROUTES` in
  `src/data/lastmod.mjs` as well. Forgetting to logs a `[sitemap] no content inputs mapped for …`
  warning at build time and omits that URL's date — noisy but harmless, by design.
