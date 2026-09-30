# 2026-09-29 — Move the blog from Medium to hipo.finance/blog/

Hipo's 22 blog posts lived on medium.com/@hipofinance, so every link and ranking they earned went to Medium. This
session reviews the migration spec the blog owner's side drafted, aligns it with their Editorial Hub
(kept outside this public repo), and builds an English-only blog at `/blog/` with all 22 posts imported from the owner's
Medium export. It is not live yet: launch is planned for about 10 November, when the Medium copies get their canonical
links pointed here on the same day.

| Commit         | Subject                                         |
| -------------- | ----------------------------------------------- |
| (this session) | Move the blog from Medium to hipo.finance/blog/ |

## Spec review

The draft (`specs/blog-migration.md`) was sound SEO practice, but several assumptions didn't match this site:

- **No 301s.** GitHub Pages serves files only; a retired or merged post gets a meta-refresh stub in `redirects`, like
  `/pt-br/`. Real 301s would need the Cloudflare proxy turned on (DNS is on Cloudflare, but DNS-only), which is a
  separate change.
- **No staging.** A push to `main` is production, so QA ran on the local dev server and production build.
- **The translation gate** would have failed on an English-only catalog, and the language menu and suggestion banner
  would have linked to `/<locale>/blog/…` 404s.
- **Sitemap and lastmod** had no blog group, and `lastmod.mjs` returned nothing for `/blog/<slug>/`.
- **Medium edits** are manual work for the blog owner; they can't be done from here.

The revised spec was then aligned with the Editorial Hub: its dates (live by ~10 Nov, before the Q3 benchmark), its
credibility fixes (already applied on Medium before the export), SEO titles and descriptions from its fixes, and its
Post inventory, which says every post migrates now and merged posts retire later.

## The blog

- **Content**: a `blog` collection, one folder per post with its images. The schema enforces the slug pattern, the
  title and description limits, and rejects leftover `TODO` placeholders.
- **Pages**: an index, post pages (byline, reading time, end-of-post "Stake GRAM" call to action, related posts),
  `og.png` per post (hero cropped to 1200×630), and an RSS feed. `BlogPosting`, `BreadcrumbList` and `Blog` JSON-LD.
- **English-only handling**: `localized={false}` means no hreflang, no remembered-language redirect and no language
  suggestion; the language menus send other locales to their home page. UI strings are in an English-only `blog.json`
  that `check-i18n` skips for other locales.
- **SEO.astro** gained an article mode (`og:type`, `article:modified_time`), a page-title override, and `twitter:site`
  on every page.
- **Heading anchors and responsive body images** come from two rehype plugins that only touch `src/content/blog/`.
- **Sitemap**: a single `sitemap-en-blog-0.xml`; `<lastmod>` is git-dated like every other page.
- **GA4 events**: `blog_cta_click`, `blog_scroll_75`, `blog_outbound_click`, only when `gtag` exists.
- **Site-wide**: the footer's Blog link now points to `/blog/` instead of Medium. `/verify/` still lists Medium as an
  official channel, because the account stays live.

## Import

`scripts/import-medium-posts.mjs` converts the owner's Medium export (HTML) to Markdown, downloads every image, rewrites
links (Hipo Medium posts → `/blog/…`, `docs.hipo.finance` → the current docs page, checked to exist, old app and HPO
subdomains → the current pages) and writes per-post metadata from maps inside the script. The first real run showed
where the export differs from what was assumed (subtitles only in the summary section, extension-less image IDs, a
hidden first divider, YouTube iframes), and the importer was fixed for each. One hand edit remains: the `hGRAM` link in
the Hipo Gang growth report, which Medium's markup cut to "hG".

## Owner review (2026-09-30)

- The blog owner's side made five edits on Medium, and they were mirrored here: Terra removed from the Liquid Staking
  Token post (and "Ethereum 2.0" renamed "Ethereum"), a bold run and an app-link label fixed, the paused ambassador
  program's form link removed, and three dead `docs.hipo.finance` links repointed.
- Five subtitles that overclaimed or read like ads were replaced or dropped (HPO, validator penalties, what is staking,
  TON vs Bitcoin, TON features).
- **Forwarding pages** for the two GitBook-era docs URLs that 404 through `docs.hipo.finance`'s path-preserving 301
  (`/docs/hipo-tokens/hipo-staked-ton-hton/`, `/docs/hipo-tokens/hpo/`), English-only — a spec amendment.
- A screenshot check of all 22 posts (desktop dark, phone light) found one conversion bug — italics directly after an
  emoji printed literal underscores in the Hipo Gang growth report; the importer now uses `*` for emphasis — and a few
  layouts copied faithfully from Medium that read badly on our page (flat headings, glued paragraphs, a one-item
  footnote list, a list typed as a paragraph, bare YouTube links). All were fixed as markup only; a before/after
  comparison of each post's visible text confirmed no wording changed.

## Decisions

- **Row 22 migrates now** at `/blog/ton-vs-bitcoin/`, following the Post inventory, rather than being deferred until
  the _TON or GRAM?_ explainer exists. Migrating it under the explainer's future slug was rejected: the topics differ.
- **Canonicals switch on launch day**, not 3–7 days later, so two self-declared originals are never online at once.
- **Git dates for `<lastmod>`**, not frontmatter dates, per the site's rule that a wrong date is worse than none.
- **No pagination and no `FAQPage` markup** at launch; FAQ rich results are limited to government and health sites.
- **Browser-tab titles** get ` | Hipo Blog` only when the whole stays within 60 characters.
- **No language suggestion on blog pages** (its "Read this page in …?" would be false), **no footer CTA card on post
  pages** (the post's own call to action comes right before it), **no Blog link in the header**.
- **Subtitles** keep the author's real Medium subtitles, drop Medium's automatic excerpts, and omit three that are out
  of date (Hipo Gang, the ambassador program, the LP post) — pending the owner's confirmation.
- **Declined**: building the blog inside Starlight (docs-shaped layout, would put posts under `/docs/`); a Medium
  custom-domain move to get real 301s from old Medium URLs (unproven, and low value at ~7,000 lifetime views).

### Verification performed

- `npm run build` passes; `check-i18n` reports ok, 0 warnings; `scripts/i18n-selftest.mjs` passes.
- All 22 posts build, each with one `<h1>`, no skipped heading level and a self canonical; every `publishedAt` equals
  the export's date; every `og.png` is 1200×630; no page loads an image from Medium; `medium.com/@hipofinance`
  appears only on the `/verify/` pages; `sitemap-en-blog-0.xml` lists `/blog/` and the 22 posts.
- Against a build made before the change, `/`, `/fa/`, `/stake/`, `/faq/` and the docs differ only by the
  `twitter:site` tag, the footer Blog link, asset hashes and live gauge figures; docs pages are byte-identical.
- Headless screenshots at 375 px and 1280 px, dark and light: no horizontal scroll. With `gtag` stubbed, each GA4 event
  fires once with its parameters.
- The two docs forwarding stubs forward to the hGRAM and HPO pages, are English-only, and are not in the sitemap.
- A code review found real importer bugs (body truncated at the first section break, image filename collisions,
  unescaped link targets and captions); all were fixed and re-tested before the real import.

### Follow-ups

- The blog owner's answers and review: the Terra section still in the LST post (#19), the missing "About Hipo"
  footer (Fix 5g), subtitles, an old "#1 Most Profitable" screenshot in the 2nd anniversary report, and small Medium
  formatting fixes. Any change on Medium is mirrored here before launch.
- Launch (~10 Nov): commit and push, switch each Medium canonical and add the notice the same day, submit the
  sitemap, then check Search Console weekly for 8 weeks.
- Row 23 (the 3rd anniversary report, 30 Oct): import with `--only hipo-3rd-anniversary-report` once it is on Medium.
- Lighthouse, the Rich Results Test and the RSS validator still need running (an online tool or a person).
- Separate tasks from the Editorial Hub's Search Console baseline: the 25 pages returning 404, single-hop redirects
  from the old subdomains, whether `sdk-example.hipo.finance` should be indexed, and a one-line profit-sharing note on
  the HPO and profit-sharing docs pages (Fix 5j).
