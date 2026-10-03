# Blog migration: Medium → hipo.finance/blog/

**Status:** implemented; launched 2026-10-03 (see the 2026-10-03 amendment; approved 2026-09-29; revised 2026-09-29 after review; original draft 2026-09-28 by @Paul)

Editorial policy, post priorities and dates come from the *Editorial Hub* (kept by the blog owner outside this public repo: main tab, Post inventory, Ready-to-paste fixes, Roadmap, Voice & SEO rules, Search Console baseline). This spec is the technical side of its priority 2. Where the two overlap, the Hub decides editorial matters (what a post says, when it is published) and this spec decides how the site does it.

## Goal

Move the Hipo blog from medium.com/@hipofinance to **hipo.finance/blog/**, so search ranking and links build on Hipo's own domain. All 22 existing posts move 1:1 at launch, plus the 3rd anniversary report, which is published on Medium on 30 Oct. Target: live by ~10 Nov, before the Q3 2026 benchmark (mid-November), so the benchmark is the first new post published on hipo.finance. After launch, every new post is published on hipo.finance first.

## In plain terms

Today Hipo's articles live on Medium. Any search traffic or links they earn benefit medium.com, not hipo.finance. We will copy the articles onto our own site under /blog/ and make our copy the "original".

Normally you move a page by redirecting the old address to the new one. Medium does not allow that for posts on a personal profile, so we use the next-best signal: on each Medium post we tell search engines "the original of this text lives at hipo.finance/blog/…" (a *canonical link*), and we add a short note at the top pointing readers there. The Medium copies stay online, so nobody who follows an old link hits a dead end. Google treats the canonical link as a strong hint, not an order, and only follows it when the two copies say substantially the same thing, so the text must match closely for the first couple of months.

Our own site also cannot issue real redirects: it is hosted on GitHub Pages, which only serves files. When one of our own blog addresses has to change later, we leave a tiny page at the old address that forwards the browser instantly (a *meta refresh*). Google treats that almost like a real redirect. Real redirects are possible later by routing the site through Cloudflare, but that is a separate change to the whole site.

The blog launches in English only. Its pages will not pretend to have Russian, Persian, etc. versions: the language menu on a blog page takes you to that language's home page instead of a missing page.

What stays the same: the rest of the site, all 11 languages, and every Medium post (none is deleted). What's at risk: a few weeks of lower search visibility while Google moves rankings from Medium to us. With about 7,000 lifetime views across all posts, there is little to lose.

A few posts will later be folded into newer ones, e.g. *Could TON Be the Future Bitcoin?* into a planned *TON or GRAM?* explainer. They still move now. When one is folded in, its old blog address forwards to the post that absorbed it. The blog owner has already corrected the posts' text on Medium, following the Editorial Hub. We copy that corrected text, so the two copies match from day one. Each migrated post is also reviewed by the blog owner before it goes live, because the Hub's rule is that nothing is published without that review.

Decisions needed: one small confirmation is still open (Open question 4); the rest were decided on 2026-09-29.

## Definitions

**Concepts**

- **Canonical link** — `<link rel="canonical" href="…">` in a page's head, naming the URL search engines should treat as the original. *Self-canonical*: a page naming itself. *Cross-domain canonical*: the Medium copy naming the hipo.finance URL.
- **Meta-refresh stub** — a generated HTML page at an old path that immediately forwards to a new one. This is what Astro's `redirects` config produces on a static host. It is the only redirect this site can issue today.
- **301** — a server-side permanent redirect. Not available on GitHub Pages (see Context).
- **Migrated post** — one of the 23 posts in the mapping table, first published on Medium.
- **Switch-over** — the moment a Medium post's canonical link is pointed at hipo.finance.
- **Editorial Hub** — the blog owner's policy document, one file per tab, kept outside this public repo.
- **Credibility fixes** — the Hub's text corrections (Terra/LUNA, "risk-free", impermanent loss, "reduces risk", superlatives, stale figures). The blog owner has applied them to Medium (2026-09-29). **Fix 5j** corrects Fix 5b on post #9 (*The Hipo Governance Token, $HPO*): the fee is 0% since June 2026, and the borrower-fee HPO buy-and-burn runs since 13 Sep 2026. It was written on 29 Sep, and whether it's live on Medium is still to be confirmed.
- **Blog owner** — the person who owns blog content and gives each post its final review (the Hub's author). Nothing reaches production without their review.
- **Anniversary report** — *Hipo at Three: 3rd Anniversary Report*, due on Medium on 30 Oct (Hub priority 3). Row 23 below.
- **English-only page** — a page with no `/<locale>/` twin. `SEO.astro`'s `localized={false}` prop marks one.
- **Row 22** — *Could TON Be the Future Bitcoin?*, migrated now and retired later into Roadmap #11 (*TON or GRAM?*) per the Post inventory.
- Product names (GRAM, hGRAM, HPO): see `src/i18n/GLOSSARY.md`.

**Formula parameters**

None.

## Context

- **Hosting.** GitHub Pages, deployed on every push to `main` (`.github/workflows/deploy.yml`). Responses carry `server: GitHub.com`. GitHub Pages already answers `/docs` with a 301 to `/docs/`, and will do the same for `/blog/<slug>`. It cannot issue any other redirect. The site's existing redirects are meta-refresh stubs from Astro's `redirects` (`astro.config.mjs:299-310`, `:340`). DNS is on Cloudflare, but in DNS-only mode: the A records are GitHub's IPs, so Cloudflare's redirect rules don't apply today.
- **No staging.** Pushing to `main` deploys to production. Review happens on local `npm run dev` / `npm run preview`.
- **Existing Medium links on the site.** `src/components/SiteFooter.astro:22` (the footer's "Blog" link) and `src/components/routes/VerifyRoute.astro:93`, which lists Medium among Hipo's official channels. No docs page and no sidebar entry links to Medium.
- **Head tags.** `src/components/SEO.astro` already has `publishedTime`, `author`, `image`, `jsonLd` and `localized` props (`:13-27`). `og:type` is hard-coded to `website` (`:73`). No `twitter:site` or `article:modified_time` tag is emitted. The default OG image is `public/og/default.png`, and a square logo exists at `public/images/logo-512.png`.
- **English-only pages.** `localized={false}` drops hreflang and the remembered-language redirect (`SEO.astro:20-24`, `:36`, `:53`). `LandingLayout.astro` passes it through (`:11`, `:46`). No page uses it today. Two things ignore it: the header language menu (`LanguageSwitcher.astro:25-31`) and the suggestion banner (`Banner.astro:30`). Both link to `localizedPath(path, locale)`, which on a blog page would be a 404.
- **Translation gate.** `scripts/check-i18n.mjs` treats every `src/i18n/<locale>/*.json` as a catalog that every released locale must carry (`:39`, `:122`). A new English-only catalog would fail the build.
- **Sitemap.** `sitemapSegment()` (`astro.config.mjs:20-24`) knows only the groups `site`, `app` and `docs`. The chunks are `locale × group` (`:396-402`). `<lastmod>` comes from `src/data/lastmod.mjs`, which uses git commit dates of a page's content files. It returns nothing for a two-segment non-docs path such as `/blog/<slug>/` (`:179-181`).
- **Content collections.** `src/content.config.ts` defines `docs`, `i18n` and `prose` (glob loader, `:70-71`). The global `markdown.remarkPlugins` (`astro.config.mjs:353-355`) applies to every collection.
- **Analytics.** Google Analytics 4 via `src/components/Analytics.astro`, rendered by `SEO.astro`, sending only from host `hipo.finance`. `window.gtag` exists there and nowhere else.
- **`robots.txt`** allows everything and references `sitemap-index.xml`, so it needs no change.

## Approach

### URLs

- Index `/blog/`, posts `/blog/<slug>/` (lowercase, hyphens, trailing slash, no dates or IDs), feed `/blog/rss.xml`.
- **No pagination at launch.** 23 posts fit on one index page. Add `/blog/page/N/` (each self-canonical) once the index passes ~30 posts.
- No tag pages until ~50 posts.
- **Slugs are permanent once live.** A retired or renamed slug gets a meta-refresh stub in `astro.config.mjs` `redirects`, not a 301 (see Context). Real 301s would need the Cloudflare proxy turned on for hipo.finance, which is a separate spec (see Follow-ups).

### Mapping (23 posts; Medium paths without the `https://medium.com/@hipofinance/` prefix)

| # | Post | Current Medium path | New path |
| --- | --- | --- | --- |
| 1 | Comparing GRAM Staking Performance: Q2 2026 | `comparing-gram-staking-performance-45-day-on-chain-benchmark-q2-2026-432479caec00` | `/blog/gram-staking-benchmark-q2-2026/` |
| 2 | Hipo Renames hTON to hGRAM | `hipo-renames-hton-to-hgram-a-new-chapter-for-gram-staking-on-ton-7a021b9dd178` | `/blog/hton-renamed-to-hgram/` |
| 3 | Benchmarking GRAM Staking Yields (Q1 2026) | `benchmarking-ton-staking-yields-a-real-world-comparison-42e497afaab4` | `/blog/gram-staking-benchmark-q1-2026/` |
| 4 | Hipo 2nd Anniversary Report | `hipo-2nd-anniversary-report-building-sustainable-community-driven-defi-1abae215391c` | `/blog/hipo-2nd-anniversary-report/` |
| 5 | How TON Can Grow | `how-ton-can-grow-the-obstacles-that-need-to-be-removed-b221f834b0d6` | `/blog/how-ton-can-grow/` |
| 6 | Why We Launched HPO and Hipo Fund | `why-we-launched-hpo-and-hipo-fund-aee9a5e05d53` | `/blog/why-we-launched-hpo-and-hipo-fund/` |
| 7 | Why We Launched Hipo Club | `why-we-launched-hipo-club-what-we-learned-from-hipo-gang-and-hpo-99f3ba2f8261` | `/blog/why-we-launched-hipo-club/` |
| 8 | Hipo at Token2049 Dubai | `hipo-at-token2049-dubai-conversations-concerns-and-commitments-to-the-ton-ecosystem-79a214ae8fb7` | `/blog/hipo-at-token2049-dubai-2025/` |
| 9 | The Hipo Governance Token, $HPO | `the-hipo-governance-token-hpo-your-key-to-community-and-growth-eb091be85b2f` | `/blog/hpo-governance-token/` |
| 10 | Hipo Annual Report (year 1) | `hipo-annual-report-a-year-of-growth-and-innovation-on-ton-blockchain-3399169667ed` | `/blog/hipo-1st-anniversary-report/` |
| 11 | TON Validator Penalties | `ton-validator-penalties-are-coming-what-it-means-for-hipo-stakers-3a1213ec5095` | `/blog/ton-validator-penalties/` |
| 12 | What is Hipo Gang? | `what-is-hipo-gang-and-why-is-it-different-from-other-t2e-games-a39361102f71` | `/blog/what-is-hipo-gang/` |
| 13 | TON Blockchain: Features, Services, Earning | `ton-blockchain-features-services-and-earning-opportunities-a9559f2cdb07` | `/blog/ton-blockchain-features/` |
| 14 | Staking on TON Blockchain | `staking-on-ton-blockchain-maximize-your-earnings-by-hipo-4a7613e472a3` | `/blog/staking-on-ton/` |
| 15 | Hipo Ambassador Program | `hipo-ambassador-program-what-is-it-how-you-can-participate-01259b8e286c` | `/blog/hipo-ambassador-program/` |
| 16 | hGRAM vs GRAM in Liquidity Pools | `why-should-you-choose-hton-over-ton-to-create-liquidity-pools-2546d93f31c4` | `/blog/hgram-vs-gram-liquidity-pools/` |
| 17 | Liquid Staking: Definition and Guide | `liquid-staking-definition-and-guide-to-get-started-a5a4d6244a68` | `/blog/what-is-liquid-staking/` |
| 18 | What is Staking and How Does it Work? | `cryptocurrency-staking-what-is-it-and-how-does-it-work-54c0e9f21d80` | `/blog/what-is-staking/` |
| 19 | Liquid Staking Token (LST) | `liquid-staking-token-lst-what-is-it-and-how-does-it-work-20fcf72f1a8d` | `/blog/liquid-staking-token/` |
| 20 | Blockchain Validators | `blockchain-validators-definition-roles-and-selection-factors-641f7404144d` | `/blog/blockchain-validators/` |
| 21 | Hipo Gang: A Two-Month Journey of Explosive Growth | `hipo-gang-a-two-month-journey-of-explosive-growth-4023e82cfbac` | `/blog/hipo-gang-first-two-months/` |
| 22 | Could TON Be the Future Bitcoin? (to be retired into Roadmap #11) | `could-ton-be-the-future-bitcoin-12-compelling-reasons-why-523e12d39ad6` | `/blog/ton-vs-bitcoin/` |
| 23 | Hipo at Three: 3rd Anniversary Report (Medium, 30 Oct) | known after publishing | `/blog/hipo-3rd-anniversary-report/` |

Row 23 follows rows 4 and 10 (`hipo-<n>-anniversary-report`). It is imported on its own once it is live on Medium, and its Medium copy switches canonical with the rest at launch (see Open question 5 for publishing it on hipo.finance first instead).

The new slugs and our own frontmatter also fix the leftover hTON names the Hub found in Medium's slugs, OG titles and share cards (e.g. row 16's *"Choose hTON over TON"* card). Titles and descriptions come from the Hub (see Content migration), never scraped from Medium's page metadata.

**Posts to be retired later** (Post inventory): #22 → Roadmap #11 *TON or GRAM?* (Q1 2027); #14 → the pillar guide *How to Stake GRAM* (late Nov); possibly #20 → a validator-protection explainer. They migrate like any other post. When the absorbing post goes live, the retired slug gets a meta-refresh stub to it in `astro.config.mjs` `redirects`, and its Medium copy's canonical moves to the absorbing post too, so Medium never points at a stub. That repointing is part of that later post's work, not this spec's.

### Content model

A new `blog` collection in `src/content.config.ts`: `glob({ base: './src/content/blog', pattern: '*/index.md' })`, one folder per slug with its images alongside. Frontmatter:

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | The page's only `<h1>`. |
| `seoTitle` | no | Overrides `<title>`; < 60 chars. |
| `description` | yes | Meta and OG description; < 155 chars. Written by the blog owner, never derived from the post body. |
| `subtitle` | no | Shown under the H1. Written by the blog owner. |
| `publishedAt` | yes | The **original Medium date** for migrated posts. |
| `updatedAt` | no | Set only on a real content change; shown as "Updated …". |
| `author` | yes | Default "Hipo Team". |
| `hero` + `heroAlt` | yes | Astro `image()` schema helper. Also the source of the OG image. |
| `related` | no | Up to 3 slugs; falls back to the latest posts. |
| `mediumUrl` | migrated posts | For our records; never rendered. |
| `noindex` | no | Default false. |

The slug is the folder name, not a frontmatter field, so it can't disagree with the path.

### Pages and head

- `src/layouts/BlogLayout.astro` is modelled on `LandingLayout` (same header and footer). It passes `localized={false}` and the article props through to `SEO.astro`.
- `SEO.astro` gains an optional `type: 'website' | 'article'` prop (default `website`), plus `modifiedTime`. It always emits `twitter:site` `@hipofinance`, and `article:modified_time` when a modified time is given. These are additive changes, and existing pages render as before.
- Per post: `<title>{seoTitle ?? title} | Hipo Blog</title>`, with the suffix dropped when the whole would exceed 60 characters (decided 2026-09-29), a self-canonical absolute URL, `og:type=article`, `og:image` `/blog/<slug>/og.png`, the published and modified times, and `<link rel="alternate" type="application/rss+xml">`. No hreflang.
- JSON-LD: `BlogPosting` + `BreadcrumbList` (Home › Blog › Post) on each post. The publisher logo is `https://hipo.finance/images/logo-512.png`. The index page gets `Blog`. **No `FAQPage`** — Google limited FAQ rich results to government and health sites in 2023, so it would only add upkeep.
- Layout: `<article>`, one H1, headings from H2 without skipping, and a byline (author · `<time>` published · "Updated" date if set · reading time). At the end, a "Stake GRAM on Hipo" call to action → `/stake/`, then up to 3 related posts. Styles for code, tables, `<figure>`/`<figcaption>` images and blockquotes.
- **Heading anchors**: a small in-repo rehype plugin, `src/blog/rehype-heading-anchors.mjs`. It returns early unless the file path is under `src/content/blog/`, because `markdown` config is global and must not change the `prose` pages.
- `/blog/<slug>/og.png`: a static endpoint that crops the hero to 1200×630 with `sharp`, which is already a devDependency.
- `/blog/rss.xml`: an endpoint built with `@astrojs/rss` (one new dependency, official).
- Images go through `astro:assets` (AVIF/WebP, width and height set, lazy loading except the hero).

### Language handling (English-only)

- No `src/pages/[locale]/blog/` twin.
- `LanguageSwitcher.astro` and `Banner.astro` get told when a page is English-only (a `localized` prop from the layout). On those pages every locale entry links to `localizedPath('/', l)` instead of the same path. On localized pages nothing changes.
- The blog's own UI strings (byline labels, "Updated", reading time, call to action, "Related posts") go in `src/i18n/en/blog.json`. `check-i18n.mjs` gets a short list of **English-only namespaces** (`blog`) that it skips for other locales (see Open question 2).
- The footer "Blog" link on localized pages points to `/blog/` (English), with `hreflang="en"`.
- The language-suggestion banner shows no suggestion on English-only pages; its "Read this page in …?" wording would be false there (decided 2026-09-29).
- Post pages hide the footer's closing "Start Staking GRAM" card, because the post's own call to action comes right before it (decided 2026-09-29). The blog index keeps it.

### Sitemap

- Add a `blog` group. `sitemapSegment()` classifies `/blog/…` as `blog`, and a chunk is created only for `en-blog`, giving `sitemap-en-blog-0.xml` in `sitemap-index.xml`. It holds the index and every post; `noindex` posts are excluded.
- `<lastmod>` comes from **git**, like every other page (see Open question 3). For a post it's the newest commit touching `src/content/blog/<slug>/`, and for `/blog/` the newest commit touching `src/content/blog/`. This is added to `lastmod.mjs` next to the existing docs branch. `ROUTES` gets `blog`.

### Analytics (GA4)

The events go through `window.gtag` when it exists (production host only):

- `blog_cta_click` — the call to action, or any in-text link to `/stake/` or `/defi/`. Parameters: `post_slug`, `link_target`.
- `blog_scroll_75` — the reader has seen 75% of the `<article>` (IntersectionObserver on a sentinel). Parameter: `post_slug`.
- `blog_outbound_click` — links to other domains. Parameters: `post_slug`, `destination_domain`.

Page views are already covered by `Analytics.astro`. UTMs are only for links posted in Telegram and X, never on internal links.

### Content migration

- Source: Medium's "Download your information" export (HTML). The credibility fixes are already applied, so the export is taken now; row 23 is imported separately after 30 Oct. The owner provides the zip. A one-time `scripts/import-medium-posts.mjs` (`turndown`, added as a devDependency) writes `src/content/blog/<slug>/index.md` and downloads every `miro.medium.com` / `cdn-images-1.medium.com` image next to it. Like `import-gitbook-docs.mjs`, it is kept for reference and not re-run after hand edits.
- Cleanup: remove Medium chrome ("click to view image in full size", subscribe box, clap/bookmark links, the duplicated title). Medium's large heading becomes `##` and the small one `###`. Captions become `<figcaption>`, and missing alt text is written by hand. The Medium author bio is dropped. The per-post "About Hipo" footer is **kept**: Fix 5g rewrote it and it is part of the corrected text. Its benchmark link is rewritten like any other internal link.
- **`title`, `seoTitle`, `description` and `subtitle` come from the Hub**, never from the post's first heading. Where a fix gives an SEO title, SEO description or subtitle (1e, 2g, 4a, 4b, 5i, …), that text is used as-is. For the other posts, the blog owner supplies them. That is how Medium ended up with *"…Real-World Comparison Summary"* and *"…(Q2 2026) Introduction"* as the benchmarks' subtitles (Hub, *What is hurting SEO*). The limits (< 60 / < 155 characters) are checked against the Hub's *Voice & SEO rules*.
- Links: Hipo Medium posts → the new `/blog/<slug>/` paths; `docs.hipo.finance/…` → `/docs/…`; `app.hipo.finance` → `/stake/` etc.; `t.me/…` unchanged.
- **Body text stays identical to the corrected Medium text.** That includes the hTON → hGRAM rename the Medium text already carries; post #2 keeps its historical names. If Fix 5j lands on Medium after the export, it is made on both copies (see Open question 4).

### Medium side (manual, blog owner; we prepare the per-post checklist)

Per migrated post, after its hipo.finance URL returns 200 in production:

1. ⋯ → More settings → Advanced settings → *Customize canonical link* → the hipo.finance URL. Then check that the page source shows it.
2. Add the notice at the top: *"This article now lives on the Hipo blog: [hipo.finance/blog/<slug>/](…). New posts are published there first."*
3. Repoint links to other Hipo Medium posts at their hipo.finance versions.
4. For 8 weeks after the switch, any edit is made in both places. That includes Fix 5j and the Hub's later updates of stale figures.

No Medium post is deleted or unpublished. From now on, new posts go on hipo.finance first; cross-posting to Medium via *Import a story* is optional.

### Publishing a new post (after launch)

The Hub's rule is that the blog owner reviews every article before it is published, and a push to `main` is the publish. So: the owner delivers the final Markdown and metadata; we add `src/content/blog/<slug>/`; the owner reviews it on a local-preview screenshot or port-forward; the commit is pushed only after they approve. The Q3 2026 benchmark (mid-Nov) and the pillar guide *How to Stake GRAM on TON* (late Nov) are the first two posts to go through this.

### Launch sequence

1. Done or in progress: the credibility fixes are on Medium; the baseline is the Hub's one-time Search Console export plus the Medium stats already received. The owner provides the Medium export zip and the metadata sheet.
2. Build and import locally; review English on `npm run dev` per the project workflow; run the QA below on `npm run preview`. **The blog owner reviews every migrated post** in the preview.
2a. After 30 Oct: import row 23, and the owner reviews it.
3. Push (deploy) by ~10 Nov. Submit `sitemap-index.xml` and request indexing for `/blog/` and the 5 key posts (#17, #1, #3, #5, #16). From then on, the Hub's monthly Search Console export is also filtered to /blog/; the `sitemap-en-blog-0.xml` chunk makes /blog/ selectable in the Page indexing report.
4. **The same day**, switch the Medium canonicals and notices, most-trafficked first. Waiting would leave two self-declared originals online, and Google might pick Medium.
5. Point the footer link at `/blog/`, in the same deploy as step 3.
6. Mid-Nov: the Q3 benchmark is the first new post (see *Publishing a new post*).
7. Weekly for 8 weeks: check in Search Console that the Google-selected canonical is hipo.finance; watch "Duplicate, Google chose different canonical" on /blog/ URLs; track impressions, clicks, and `blog_cta_click`.

### Amendment (2026-10-03): launch moved up to 3 October

The blog owner agreed to launch on 2026-10-03 instead of ~10 Nov. This supersedes the dates above and the plan for row 23:

- **22 posts at launch**, not 23. Where the acceptance criteria say 23 slugs and 24 sitemap URLs, read 22 and 23.
- **The 3rd anniversary report (row 23) is no longer migrated.** It is published on hipo.finance first on 30 Oct through *Publishing a new post*, at `/blog/hipo-3rd-anniversary-report/`, and may be cross-posted to Medium afterwards with *Import a story*, which sets the canonical itself. This reverses Open question 5. The importer's row 23 entry stays, unused.
- The Medium canonicals and notices switch on 2026-10-03, so the 8-week both-copies window runs to about 28 Nov.
- Lighthouse, the Rich Results Test and the RSS validator run against the live URLs after launch.

### Amendment (2026-09-30): forwarding pages for two renamed docs URLs

`docs.hipo.finance` 301s every old path to the same path under `hipo.finance/docs/`, so two GitBook-era pages renamed since then land on a 404: `/docs/hipo-tokens/hipo-staked-ton-hton` and `/docs/hipo-tokens/hpo`. Three Medium posts linked to them (fixed on Medium on 2026-09-30); other sites may still. Add two English-only meta-refresh stubs to `astro.config.mjs` `redirects`, next to the existing docs redirect maps:

- `/docs/hipo-tokens/hipo-staked-ton-hton/` → `/docs/hipo-tokens/hipo-staked-gram-hgram/`
- `/docs/hipo-tokens/hpo/` → `/docs/hipo-tokens/hipo-governance-token-hpo/`

English-only because the old docs domain only ever served English. The old no-slash URLs reach the stubs through GitHub Pages' own slash redirect.

### Rejected

- Building the blog inside Starlight — its layout, sidebar and head are made for docs, and it would put posts under `/docs/`.
- Frontmatter dates for `<lastmod>` — a hand-kept date that someone forgets to bump is a false claim, and Google then ignores lastmod for the whole site (see CLAUDE.md, sitemap note).
- A staging deploy with `noindex` — there is no staging environment, and local preview covers the same checks.

## Changes

- `src/content.config.ts` — add the `blog` collection and its schema.
- `src/content/blog/<slug>/index.md` + images — the 23 posts.
- `scripts/import-medium-posts.mjs` — new, the one-time importer.
- `src/layouts/BlogLayout.astro` — new.
- `src/pages/blog/index.astro`, `src/pages/blog/[slug]/index.astro`, `src/pages/blog/[slug]/og.png.ts`, `src/pages/blog/rss.xml.ts` — new.
- `src/components/blog/*` — byline, call to action, related posts, scroll/click tracking script.
- `src/blog/rehype-heading-anchors.mjs` — new. Registered in `astro.config.mjs` `markdown.rehypePlugins`.
- `src/components/SEO.astro` — `type` and `modifiedTime` props; `twitter:site`.
- `src/components/LanguageSwitcher.astro`, `src/components/SiteHeader.astro`, `src/components/Banner.astro` — the English-only link target.
- `src/components/SiteFooter.astro:22` — Blog link → `/blog/`. (`VerifyRoute.astro:93` is unchanged: Medium stays an official channel.)
- `src/i18n/en/blog.json` — new. `scripts/check-i18n.mjs` — English-only namespace list.
- `astro.config.mjs` — `sitemapSegment()` `blog` group and the `en-blog` chunk.
- `src/data/lastmod.mjs` — the blog branch and a `ROUTES` entry.
- `package.json` — add `@astrojs/rss`, and `turndown` (dev).
- `public/llms.txt` — mention the blog. `CLAUDE.md` — a short "Blog" section. `CHANGELOG.md` + `changelog/` report.

## Acceptance criteria

- [x] The blog owner has approved every migrated post in the local preview (recorded in the changelog report). *Met with a change: the owner delegated the review to Alireza (2026-09-30), who reviewed with a screenshot check of all 22 posts.*
- [x] Every post has an owner-written `description` (< 155 chars) and, where set, `seoTitle` (< 60); the build fails otherwise (schema check). The two benchmarks' subtitles don't end in *Summary* or *Introduction*.
- [ ] No post's visible text, `<title>` or OG tags say *hTON* except post #2. *Not met as worded: historical mentions remain, as on Medium — "(prev. hTON)" notes in four posts, two DEX URLs, and hTON shown inside old images. Titles and OG tags are clean.*
- [x] `npm run build` succeeds, and `node scripts/check-i18n.mjs` passes with `blog.json` present only in `en/`.
- [x] `dist/blog/<slug>/index.html` exists for all 23 slugs in the mapping table. *(22 after the 2026-10-03 amendment.)*
- [x] Each post's HTML has exactly one `<h1>`, has no heading level skipped, and has `<link rel="canonical" href="https://hipo.finance/blog/<slug>/">`.
- [x] No blog page contains a `<link rel="alternate" hreflang>` or `x-default`, a `noindex`, or the `LocalePreference` script. (The language menus' `<a hreflang>` attributes are expected, as on every page.)
- [x] Each post's `article:published_time` date equals the original Medium publish date, checked against Medium for all 23. *(22.)*
- [x] No page in `dist/` contains `miro.medium.com` or `cdn-images-1.medium.com`.
- [x] `grep -r "medium.com/@hipofinance" dist/` matches only the /verify/ pages.
- [x] On a blog page, every entry in the language menu and the suggestion banner links to `/<locale>/` (the locale's home). On `/stake/`, the entries still link to `/<locale>/stake/`. *Menus met; the suggestion banner is hidden on blog pages instead (decided 2026-09-29).*
- [x] `/fa/` and `/` render byte-identically to before, apart from the footer Blog link and the `twitter:site` tag.
- [x] `dist/sitemap-index.xml` lists `sitemap-en-blog-0.xml`, which has 24 URLs (index + 23), each with a `<lastmod>`. No other sitemap contains `/blog/`. *(23 URLs: index + 22.)*
- [x] `dist/blog/rss.xml` validates at validator.w3.org/feed (paste mode). *Validated against the live feed: 0 errors, 0 warnings.*
- [x] `dist/blog/<slug>/og.png` is 1200×630 for every post.
- [ ] JSON-LD for 3 sample posts passes the Rich Results Test (code-paste mode). *Couldn't verify with Google's tool (no way to run it from the build box). The schema.org validator reports 0 errors and 0 warnings on 3 live posts and the index.*
- [ ] Lighthouse mobile on 3 posts (local preview): Performance ≥ 90, SEO = 100, CLS < 0.1. *Run on the live pages. Performance 95–98 and CLS ≤ 0.015 on all; SEO 100 on two posts and the index, 92 on the 2nd anniversary report (one link reads "here", as on Medium).*
- [x] Heading anchors appear on blog headings, and the FAQ and HPO prose pages render unchanged.
- [x] With `gtag` stubbed in the browser, the call-to-action click, the 75% scroll and outbound clicks each fire once with the listed parameters.
- [x] `dist/docs/hipo-tokens/hipo-staked-ton-hton/index.html` and `dist/docs/hipo-tokens/hpo/index.html` are stubs forwarding to the hGRAM and HPO docs pages; after deploy, `https://docs.hipo.finance/hipo-tokens/hipo-staked-ton-hton` and `…/hipo-tokens/hpo` end on those pages instead of a 404.
- [ ] After deploy: `/blog/staking-on-ton` returns a 301 to the slash URL; all 23 posts return 200; a Telegram paste of one post shows its OG card. *301 and 200s met for all 22. The Telegram card was not checked.*

## Risks & rollback

- **Google keeps Medium as canonical.** Detected via "Google chose different canonical" in Search Console; the usual cause is text that differs. The fix is to bring the texts back in line.
- **The language-switcher change leaks to localized pages.** Covered by the `/stake/` criterion and the byte-identical check on `/` and `/fa/`.
- **The global rehype plugin touches other Markdown.** The path guard handles it, and the criterion covers it.
- **Rollback.** Revert the commits and redeploy. Medium posts are untouched apart from their canonical and notice, and both are reversible in the Medium editor. If the blog is rolled back, revert the Medium canonicals the same day, so they don't point at 404s.

## Open questions

1. **When to switch the Medium canonicals.** *Decided 2026-09-29:* the same day as the deploy.
2. **Where the blog's UI strings live.** *Decided 2026-09-29:* an English-only `blog.json` catalog, with the translation gate taught to skip it.
3. **Sitemap `<lastmod>` source.** *Decided 2026-09-29:* git dates.
4. **Fix 5j (HPO post, #9) on Medium.** *Mostly resolved 2026-09-29:* the team answered the profit-sharing question, and the Hub turned the answer into Fix 5j. What's left is confirming it's live on Medium before the export. If it isn't, #9 migrates on schedule and the fix is made on both copies.
5. **Where the 3rd anniversary report is published first.** *Decided 2026-09-29:* on Medium on 30 Oct, then migrated as row 23 at launch.
6. **Row 22 and the other planned merges.** *Decided 2026-09-29:* follow the Post inventory. Every post migrates now, row 22 at `/blog/ton-vs-bitcoin/`, and merged posts are retired later with a stub.

## Follow-ups (not in this spec)

- Retiring #22, #14 (and maybe #20) when their absorbing posts go live: stub + Medium canonical repoint.
- Real 301s: turn on Cloudflare's proxy for hipo.finance (SSL mode, GitHub Pages certificate renewal, caching). With it, a Medium custom-domain move could also get the old Medium URLs 301'd, but that's unproven — test on one post first.
- Owner review: whether the Hipo Gang and ambassador posts are still accurate, or need an "archived" note (Hub Post inventory).
- Pagination and tag pages once post counts justify them.
