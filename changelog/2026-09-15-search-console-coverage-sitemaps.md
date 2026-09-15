# Search Console coverage review, sitemaps split per locale and section

This session reviewed Google Search Console's Page indexing export for 2026-09-15, plus one URL list per
not-indexed reason. The export's last snapshot is 2026-09-04. The site lacked two things the findings pointed
to:

- **A way to see indexing per locale or section.** Search Console never lists indexed URLs, and it can only
  break the Page indexing report down by sitemap.
- **Any static link to `/vs/`.** Before this change, the only link to it was drawn by the React island.

Spec: [`specs/search-console-coverage-sitemaps.md`](../specs/search-console-coverage-sitemaps.md). The
exports are in `~/develop/HipoFinance/seo/2026-09-15/`, outside the repo.

| Commit    | Summary                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------ |
| `0cbd2a9` | Split the sitemap per locale × group, guard it, and link `/vs/` from both footers and in context |

## What the export showed

The property is a **Domain property**, so the 197 not-indexed URLs mix the website with every
`*.hipo.finance` host.

- **87 are old hosts or subdomains.** These are `docs.hipo.finance` GitBook URLs, `http`/`www`, and the
  `app.`, `hpo.`, `v4.`, `mcp.`, `gauge.` and `sdk-example.` subdomains.
  - Fetched on 2026-09-15, they now redirect, send `noindex`, or return 404 as intended.
  - The 404s are years-old GitBook slugs and `.md` exports.
  - Two responses are wrong, both outside this repo (see Follow-ups).
- **106 are sitemap URLs on `hipo.finance`.** 103 are _Discovered – currently not indexed_, and none of those
  was ever crawled. The other 3 are _Crawled – currently not indexed_.
- **The gap is by section.** App pages: 36 of 50 not indexed. docs: 57 of 440 (pt-br 25 and tr 11, the newest
  locale batch). home: 0 of 10.
- **English pages still waiting:** `/defi/`, `/rewards/`, `/stats/`, `/unstake/`, `/verify/` and three newer
  docs pages. Most likely, the English app pages had been waiting more than three weeks.
- **Static inbound links per English page:** `/stake/` 55, `/stats/`, `/faq/` and `/verify/` 54, `/defi/` 20,
  `/rewards/` 15, `/hpo/` 12, `/unstake/` 10, `/vs/` 0.

Link counts don't explain the section gap: `/stats/` and `/faq/` carry the same site-wide header links as
`/verify/` and are still unindexed in most locales. For a page Google has discovered but never crawled, the
levers are time, crawl demand and manual indexing requests, not its content.

## What changed

- **Sitemap split.** `astro.config.mjs` passes `chunks` to `@astrojs/sitemap`.
  - It writes 30 files, `sitemap-<locale>-<site|app|docs>-0.xml`, listed by `sitemap-index.xml`.
  - Every chunk callback defers to one classifier, `sitemapSegment()`, because the plugin writes a URL into
    every chunk whose callback keeps it.
  - `filter`, `i18n` and `serialize` are unchanged, so each `<url>` entry is byte-identical to before.
- **Sitemap build guard.** The code review found that the plugin, once chunking is on, catches its own errors,
  logs them and returns. The unchunked path used to rethrow. So a broken sitemap would have built and deployed
  green, with `robots.txt` pointing at a 404.
  - `assertSitemapWritten()` runs after `sitemap()` and throws if the index is missing, lists a number of files
    other than locales × groups, or names a file that wasn't written.
  - This was approved as an amendment to the spec.
- **`/vs/` links.**
  - A "Fees compared" link (`site.footer.compare`) in the site footer's Docs column and in the Starlight docs
    footer next to Verify.
  - Contextual links in `advantages-of-hipo.md` and in the `/stats/` "Deeper data" card.
  - The docs footer class was renamed `hipo-verify` → `hipo-footer-links`. Its separator now uses the links'
    faint color, with spacing that keeps the two small targets apart.
- **Contextual app links.** `hipo-stats.md` now links `/stats/`; before, it only linked the external dashboard.
  `how-does-hipo-work/unstaking.md` links `/unstake/`.
- **Translations and docs.** All of the above is translated into the nine released locales, with hashes
  refreshed. `CLAUDE.md` documents the split and adds `APP_SECTIONS` to the "Adding a page" checklist.

## Declined or deferred

- **A new footer column linking all five app pages.** `/stats/` already has site-wide header links and is
  still unindexed in 8 of 10 locales, so the data doesn't support it.
- **More unique copy on the app pages.** Today they have 332–475 visible words, about half shared chrome.
  Deferred, because thin text can't cause _Discovered – never crawled_. Re-evaluate about four weeks after
  deploy from the per-segment sitemaps; the trigger is `*-app` below 50% indexed while `*-docs` is above 85%.
- **Redirects for the remaining GitBook 404s.** They were last crawled between 2024 and March 2026, and a 404
  is the correct answer for them.
- **Overlapping sitemaps (one per locale plus one per section).** The plugin can't do it, and a hand-written
  generator would duplicate the `i18n`/`serialize` logic.

### Verification performed

**Sitemap, against a baseline.** The baseline was a full-history `npm run build` of `88f38a1`: 540 URLs, all
with `lastmod`. The local clone had been shallow, which emits no dates, so `git fetch --unshallow` came first.
A script in the scratchpad compared the new build to it:

- the index lists exactly the 30 expected files, and no `sitemap-0.xml` or `sitemap-pages-*.xml` exists;
- the URL set is equal (540), each URL once, each in its locale-group file;
- every `*-app` file holds exactly the five app pages;
- every `<url>` entry is byte-identical to the baseline, including `lastmod` and hreflang;
- each index `<lastmod>` equals the newest `<lastmod>` in its file.

The script passed all 18 checks, again after the translations landed and again after the guard test.

**Draft locales.** With `id` temporarily set to `draft` and `I18N_INCLUDE_DRAFTS=1`, `id` pages were built,
but no `sitemap-id-*` file was written and no `/id/` URL appeared (27 files). The registry was reverted.

**Guard.** A chunk callback was made to throw temporarily. `npm run build` then exited 1 with
`sitemap-index.xml was not written`, after the plugin's own `Error chunking sitemaps` log. After the revert,
the build exits 0.

**Links, over `dist/`.**

- All 540 pages in the sitemap (54 per locale) carry an `href` to their own locale's `/vs/`.
- In every locale, `advantages-of-hipo` and `/stats/` carry two `/vs/` links, `hipo-stats` links `/stats/`,
  and `unstaking` links `/unstake/`.

**Rendering.** Headless screenshots of the footers:

- English: home at 1280 and 390 px, `/stats/` at 390 px, a docs page at 390 and 1280 px, each in dark and
  light.
- RTL: `/fa/` at 390 px, `/ar/stats/` at 1280 px, the `/fa/` docs footer, and the `/fa/stats/` card.

None scrolls horizontally, and the RTL layout mirrors correctly.

**Other checks.** `check-i18n`: ok, 0 warnings. `i18n-selftest`: 18 groups passed. Prettier is clean.

**Translation diffs.** Each locale changed exactly its five target lines, and the only text removed was
re-added inside the new link or the extended sentence.

**Browser setup.** The Playwright MCP server was re-registered with `--proxy-bypass localhost,127.0.0.1`.
Playwright turns off Chrome's implicit loopback bypass whenever a proxy is set, so local previews went
through the proxy and failed with a 504 until then.

### Follow-ups

- **Search Console, after deploy:**
  - Remove the `sitemap-0.xml` entry, which `changelog/2026-08-30-sitemap-lastmod.md` asked to be submitted.
  - Confirm the 30 child sitemaps are read, and that the Page indexing filter lists them. If it doesn't,
    submit them individually.
  - Request indexing for English `/unstake/`, `/rewards/`, `/stats/`, `/defi/`, `/verify/` and `/vs/`, then
    each locale's `/stake/` and `/faq/`.
- **nginx or infra:**
  - `v4.hipo.finance/` is reported as a _Soft 404_.
  - `gauge.hipo.finance/data` is reported as _Crawled – not indexed_.
  - Both should send `X-Robots-Tag: noindex`.
- **About four weeks after deploy:** read the per-segment indexing numbers, and decide on the app-page copy
  spec.
- **pt-br "protocol fee".** The glossary said "taxa do protocolo", while the `/vs/` copy (`vs.json`, `seo.json`)
  said "taxa de protocolo". The glossary now uses "taxa de protocolo", and so does the new stats-card sentence.
  - **Why:** it is the category term, parallel to the glossary's own "taxa de staking" and "taxa de rede". It
    also avoids "taxa do protocolo de 0 % do Hipo".
  - **Not changed:** existing "do protocolo" wording in `vs.hero.statFee`, `fees-and-gas.md`,
    `quarterly-report-august-24-2026.md` and `faq/hgram/can-i-sell-hgram.md`. It reads there as "the protocol's
    fee" and stays correct.
