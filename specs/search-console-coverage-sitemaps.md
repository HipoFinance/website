# Split the sitemap by locale and section, and give /vs/ static links

**Status:** implemented

## Goal

Search Console can't tell us which sections and locales Google has indexed. The export lists only
URLs that are _not_ indexed, and there is no URL list for indexed pages. This change splits the
single sitemap into one sitemap per locale and section, so the Page indexing report, filtered by
sitemap, answers that directly from now on. It also gives `/vs/` its first links that exist in the
static HTML; today the page is linked from nowhere except the sitemap.

## Definitions

**Concepts**

- **Segment**: one locale plus one group, e.g. `fa-app`. Each segment is one sitemap file.
- **Group**: which part of the site a URL belongs to, decided by the first path segment after the locale:
  - `app`: `stake`, `unstake`, `rewards`, `stats`, `defi`, the five dApp shell pages.
  - `docs`: everything under `docs/`.
  - `site`: everything else (home, `faq`, `hpo`, `verify`, `vs`, and any future top-level page).
- **Chunk**: what `@astrojs/sitemap` calls a named sub-sitemap. A chunk named `k` is written as
  `sitemap-k-0.xml`, and the plugin puts any URL that matches no chunk into a catch-all
  `sitemap-pages-0.xml`.
- **Canonical (URL)**: the one address Google should index for a piece of content, when several
  URLs serve the same content (`/?_needChain=ton` and `/index.html` both serve `/`). Each page
  declares its canonical with `<link rel="canonical">` (`src/components/SEO.astro:52`; Starlight emits
  its own on `/docs/`), and each locale page is its own canonical. It is a strong hint, not a
  command: Google can pick a different canonical based on redirects, internal links and the sitemap.
  Search Console's _Alternate page with proper canonical tag_ means Google followed ours;
  _Duplicate, Google chose different canonical than user_ means it picked another URL. This change
  alters no canonical.
- **hreflang**: `<link rel="alternate" hreflang="…">` tags, also listed as `xhtml:link` in the
  sitemap. They connect the language versions of one page. They are not duplicates of each other,
  so hreflang doesn't change any page's canonical.
- **Static link**: an `<a href>` present in the built HTML. A link rendered only by the React
  island (e.g. `src/components/app/StatsPage.tsx:373`) is not one.
- **The export**: the Search Console files in `~/develop/HipoFinance/seo/2026-09-15/`: the coverage
  totals plus one URL list per not-indexed reason. Its last snapshot is **2026-09-04**, and it
  covers the Domain property, so every `*.hipo.finance` host is included.
- Search Console reason names (_Discovered – currently not indexed_, etc.) are used exactly as they
  appear in the export.

**Formula parameters**

None.

## Context

### What the export shows

**Totals.** 412 indexed and 197 not indexed.

**87 of the 197 are not on `hipo.finance` at all.** They are old `docs.hipo.finance` GitBook URLs,
the `http://` and `www.` hosts, and the `app.`, `hpo.`, `v4.`, `mcp.`, `gauge.` and `sdk-example.`
subdomains. I fetched every one on 2026-09-15:

- They now redirect, carry `noindex`, or return 404 as intended.
- The 404s are a handful of `.md` exports and GitBook slugs that are years old. 404 is the correct
  answer for those.
- Two subdomain responses are wrong, but neither is in this repo (see Out of scope).

**110 are on `hipo.finance`.** 106 are sitemap URLs: 103 _Discovered_ (none ever crawled, "last
crawled" 1970-01-01) and 3 _Crawled_ (`/de/hpo/`, `/ru/hpo/`, `/tr/docs/security/phishing-awareness-and-prevention/`).
The other 4 are all fine:

| URL                | Reason in export      | Why it's fine           |
| ------------------ | --------------------- | ----------------------- |
| `/app/`            | noindex               | Legacy stub             |
| `/faq`             | Redirect error        | Now 301 → `/faq/` 200   |
| `/?_needChain=ton` | Alternate canonical   | Canonical points to `/` |
| `/llms.txt`        | Crawled – not indexed | Not a web page          |

**Sitemap URLs not indexed, by section.** Denominators come from the live sitemap (54 URLs per locale):

| Section       | Not indexed       | Where                                                                                 |
| ------------- | ----------------- | ------------------------------------------------------------------------------------- |
| home          | 0 / 10            |                                                                                       |
| **app pages** | **36 / 50 (72%)** | stake 7, unstake 5, rewards 7, stats 8, defi 9                                        |
| faq           | 7 / 10            |                                                                                       |
| hpo           | 5 / 10            |                                                                                       |
| docs          | 57 / 440 (13%)    | pt-br 25, tr 11, others 1–4 each                                                      |
| verify, vs    | 1 / 10, 0 / 10    | Mostly published after the last snapshot, so "absent" here means unknown, not indexed |

**English pages still waiting.** `/defi/`, `/rewards/`, `/stats/`, `/unstake/`, `/verify/`,
`/docs/glossary/`, `/docs/risks/` and `/docs/staking-without-the-app/`. The _Discovered_ count was
5 from the 2026-08-11 snapshot, so English app pages have likely waited more than three weeks.
The jump to 103 came in the 2026-08-29 snapshot, right after the six-locale launch on 2026-08-24.

### Internal links

Measured on the build of 2026-09-12:

- Every localized page links to pages in its own locale.
- No page links to a redirect page or to a URL without its trailing slash.
- Static inbound links per English page: `/stake/` 55, `/stats/`, `/faq/` and `/verify/` 54,
  `/defi/` 20, `/rewards/` 15, `/hpo/` 12, `/unstake/` 10, **`/vs/` 0**.

Link counts don't explain the section gap. `/stats/` and `/faq/` get the same site-wide header
links as `/verify/`, yet are unindexed in 8 and 7 of 10 locales. For "Discovered, never crawled",
the levers are time, crawl demand and manual indexing requests, not anything on the page.

### Current code

- **Sitemap.** One sitemap, `sitemap-0.xml`, generated by `@astrojs/sitemap` 3.7.3 in
  `astro.config.mjs:287-314`. It uses `filter` to drop `/app/` and draft locales, `i18n` for the
  alternates, and `serialize` for `lastmod` (`src/data/lastmod.mjs:199`). `public/robots.txt`
  points to `sitemap-index.xml`.
- **Plugin chunks.** The plugin supports `chunks` (`node_modules/@astrojs/sitemap/dist/index.js:126-165`).
  Each chunk callback runs over every URL, so two callbacks that both match a URL write it twice.
  URLs that match none go to the `pages` chunk. Each chunk's index `lastmod` is the newest `lastmod`
  inside it (`write-sitemap-chunk.js:50`).
- **Site footer.** `src/components/SiteFooter.astro:25-36` is the footer on home, FAQ, HPO, verify,
  vs and the app pages. Its Docs column has GitHub, Documentation, About HPO, Stats, FAQ, Verify and
  Help.
- **Docs footer.** Docs pages use `src/components/starlight/Footer.astro`, which adds only the
  `/verify/` link. The docs header (`src/components/starlight/Header.astro:33-35`) links FAQ, Stats
  and Stake.
- **Stats card.** `src/content/prose/en/shell/stats/cards/04-deeper-data.md` links the external
  dashboard and the docs, but not `/vs/`.
- **Docs pages missing app links.** `src/content/docs/introduction/hipo-stats.md` describes the
  external `stats.hipo.finance` dashboard and never links `/stats/`.
  `src/content/docs/introduction/how-does-hipo-work/unstaking.md` never links `/unstake/`.

## Approach

### A. One sitemap per segment

**What gets generated.** Replace the single sitemap with chunks keyed `<locale>-<group>`, generated
from `indexableLocales()` × `['site', 'app', 'docs']`. That is 30 files today, and a newly released
locale gets its three files automatically.

**No URL in two files.** One pure function, `sitemapSegment(url)`, returns a URL's segment key. Each
chunk callback keeps a URL only when `sitemapSegment(item.url) === key`. Every URL that passes
`filter` then lands in exactly one chunk, and the `pages` catch-all stays empty.

**Everything else stays the same.** `filter`, `i18n` and `serialize` are unchanged, so each `<url>`
entry is byte-identical to today's. `robots.txt` and the index URL are unchanged too.

**Rejected alternatives:**

- _Per locale only (10 files):_ hides the app-vs-docs split, which is the main finding.
- _Per section only (3 files):_ hides how far each locale batch has progressed.
- _Overlapping sitemaps (one set per locale plus one per section):_ the plugin can't do it, and a
  hand-written generator would duplicate the `i18n`/`serialize` logic.

### B. Static links to `/vs/`, and two missing contextual links

**`/vs/`** gets static links from:

- the Docs column of `SiteFooter`, through a new catalog key,
- the docs footer override, next to Verify, so it appears on all docs pages (81% of URLs),
- `introduction/advantages-of-hipo.md`, in context,
- the stats card `04-deeper-data.md`, in context.

**Contextual app links:**

- `hipo-stats.md` links to `/stats/` as the on-site page.
- `how-does-hipo-work/unstaking.md` links to `/unstake/`.

**Rejected:** a new footer column linking all five app pages. `/stats/` already has that exposure
and is still unindexed in 8 of 10 locales, so the data doesn't support it.

### Workflow

**English first,** per the project rule:

- The new catalog key and the two docs edits are English-only for review.
- Locales follow after approval.
- Links inside translated docs are localized by `src/i18n/remark-localize-links.mjs`, but the link
  still has to be added to each translated file.

## Changes

- **`astro.config.mjs`**: add `sitemapSegment(url)` and a `chunks` object built from
  `indexableLocales()` × groups. Leave `filter`, `i18n` and `serialize` as they are, and update the
  comment block.
- **`astro.config.mjs`, amendment approved 2026-09-15**: an `assertSitemapWritten()` integration,
  listed right after `sitemap()`. Its `astro:build:done` hook throws when `sitemap-index.xml` is
  missing, lists a number of sitemaps other than locales × groups, or lists a file that wasn't
  written. This restores the build failure that the chunked path swallows.
- **`src/components/SiteFooter.astro`**: add `{ href: localizedPath('/vs/', locale), label: t('site.footer.compare') }`
  to `docsLinks`, after Stats.
- **`src/components/starlight/Footer.astro`**: add the same `/vs/` link beside the Verify link.
- **`src/i18n/en/site.json`**: add `site.footer.compare` = "Fees compared". Locales come after approval.
- **`src/content/docs/introduction/advantages-of-hipo.md`**: one sentence linking `/vs/` where the page
  discusses fees or rewards.
- **`src/content/prose/en/shell/stats/cards/04-deeper-data.md`**: add a link to `/vs/`.
- **`src/content/docs/introduction/hipo-stats.md`**: link `/stats/` as the on-site stats page.
- **`src/content/docs/introduction/how-does-hipo-work/unstaking.md`**: link `/unstake/`.
- **Locale step, after approval**: translate the key and the four prose edits into all nine
  released locales, then run `check-i18n --update-hashes`.
- **`CLAUDE.md`**: one line in "Other notes" saying the sitemap is split per locale and group, and why.
- **`CHANGELOG.md`** plus a report in `changelog/`.

## Acceptance criteria

**Checking the sitemap:**

- Build before and after from a full clone. This checkout is shallow, and a shallow clone emits no
  `lastmod`, so run `git fetch --unshallow` first.
- Compare the two builds with a script in the scratchpad.

**Sitemap criteria:**

- [x] `dist/sitemap-index.xml` lists exactly 30 sitemaps, `sitemap-<locale>-<group>-0.xml` for the 10
      released locales × `site|app|docs`. `dist/` contains no `sitemap-0.xml` and no `sitemap-pages-*.xml`.
- [x] The set of `<loc>` values across the 30 files equals the set in the pre-change `sitemap-0.xml`,
      with each URL appearing exactly once.
- [x] Every URL is in the file named by its locale and group, by the rule in Definitions. Each
      `*-app-0.xml` holds exactly the 5 app pages.
- [x] Every `<url>` element is byte-identical to its pre-change counterpart, including `<lastmod>` and
      all `xhtml:link` alternates.
- [x] Each sitemap's `<lastmod>` in the index equals the newest `<lastmod>` inside that file.
- [x] A build with `I18N_INCLUDE_DRAFTS=1` and a draft locale present produces no sitemap file for it.
- [x] If a chunk callback throws (a temporary edit, reverted afterwards), `npm run build` exits non-zero
      with the `assertSitemapWritten` error. The unmodified build still exits 0.

**Link and footer criteria:**

- [x] The built English pages contain a static `<a href="/vs/">` on every page that renders
      `SiteFooter` or the Starlight footer. A script over `dist/` reports the count, and it matches the
      number of non-redirect English pages.
- [x] `/docs/introduction/advantages-of-hipo/` and `/stats/` contain a contextual static link to `/vs/`.
      `/docs/introduction/hipo-stats/` links `/stats/`.
      `/docs/introduction/how-does-hipo-work/unstaking/` links `/unstake/`.
- [x] Headless screenshots of the footer (home at 390 px and 1280 px, one docs page at 390 px, dark and
      light) show no horizontal scroll and no wrapped column labels.

**Locale step:**

- [x] `npm run build` passes `check-i18n` with no missing keys, and `/fa/` pages carry
      `<a href="/fa/vs/">` in both footers.

## Risks & rollback

- **An old sitemap URL stops working.** `changelog/2026-08-30-sitemap-lastmod.md` asked for
  `sitemap-0.xml` to be submitted as its own Search Console entry, so it very likely was. After
  deploy it returns 404 and shows "Couldn't fetch". Remove that entry in Search Console. The index URL
  is unchanged, so crawling is unaffected.
- **A sitemap failure no longer fails the build.** With `chunks` set, `@astrojs/sitemap` catches any
  error while writing the chunks, logs it, and returns
  (`node_modules/@astrojs/sitemap/dist/index.js:165-169`). The unchunked path rethrows instead. The
  build would then pass and deploy with no `sitemap-index.xml`. Found in code review; see Open
  questions.
- **A URL could appear twice.** If a future edit makes two chunk callbacks match one URL, it is
  written twice. The single classifier prevents that, and the "exactly once" criterion catches it.
- **Search Console may not list child sitemaps.** It might not show sitemaps from a submitted index in
  the Page indexing filter. If so, submit the 30 files individually; it's a one-time manual task.
- **Rollback:** revert the commit. The next deploy restores `sitemap-0.xml`, and the index URL never
  changed.

## Out of scope: follow-ups that don't need this repo

**Search Console, by hand after deploy:**

- Remove the old `sitemap-0.xml` entry.
- Confirm the 30 child sitemaps are read.
- Use URL Inspection → _Request indexing_ on English `/unstake/`, `/rewards/`, `/stats/`, `/defi/`,
  `/verify/` and `/vs/`, then each locale's `/stake/` and `/faq/` (about 10 a day).
- Leave the running 404 validation alone. The GitBook URLs that remain 404 are correct answers, not
  errors.

**nginx or infra:**

- `v4.hipo.finance/`: the API root is reported as _Soft 404_. Send `X-Robots-Tag: noindex`.
- `gauge.hipo.finance/data`: JSON reported as _Crawled – not indexed_. Send `X-Robots-Tag: noindex`.
- Legacy GitBook 404s: no redirect work. They were last crawled between 2024 and March 2026 and carry
  no visible value.

**Deferred content work:** more unique static copy on the app pages. Today they have 332–475 visible
words, about half shared with other pages, against 81–91% unique text on faq, hpo and vs. That can't
cause _Discovered – never crawled_, so it is deferred. Re-evaluate about four weeks after deploy
using the per-segment sitemaps. If the `*-app` sitemaps are still below 50% indexed while `*-docs`
are above 85%, write that spec.

## Open questions

- ~~**Footer label for `/vs/`.**~~ Resolved 2026-09-15: "Fees compared".
- ~~**Deferred content work.**~~ Resolved 2026-09-15: wait about four weeks after deploy, then decide
  from the per-segment numbers, using the threshold in "Out of scope".

- ~~**Build check for the sitemap.**~~ Approved 2026-09-15 as an amendment. It is now in Changes and
  Acceptance criteria.

None open.
