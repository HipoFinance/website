---
paths:
  - "src/content/blog/**"
  - "src/blog/**"
  - "src/components/blog/**"
  - "src/pages/blog/**"
  - "src/layouts/BlogLayout.astro"
---

# Blog (`/blog/`)

Migrated off Medium (`medium.com/@hipofinance`) — see `specs/blog-migration.md`. Editorial policy, post priorities and SEO fields belong to the blog owner, in the owner's _Editorial Hub_, which is kept outside this public repo; the owner reviews every post before it is published, and a push to `main` is the publish.

- **Content**: one folder per post, `src/content/blog/<slug>/index.md` with its images beside it; the folder name is the slug and the URL, and is **permanent once live**. The schema in `src/content.config.ts` enforces lowercase-hyphen slugs and fails the build on any `TODO` left in a text field. A `seoTitle` of 60 characters or more, or a `description` of 155 or more, only warns in the build output (`allPosts()` in `src/blog/posts.ts`). `<title>` gets ` | Hipo Blog` only when the whole stays within 60 characters.
- **English-only**: `BlogLayout` passes `localized={false}`, so blog pages carry no hreflang, no remembered-language redirect and no language suggestion, and the language menus send other locales to their home page. There is no `[locale]` twin. The UI strings live in `src/i18n/en/blog.json`, which `check-i18n` skips for other locales (`ENGLISH_ONLY_NAMESPACES`) — translating a post later is a new spec (own URL plus hreflang).
- **Markdown plugins** `src/blog/rehype-heading-anchors.mjs` and `rehype-responsive-images.mjs` sit in the global `markdown.rehypePlugins` and return early for any file outside `src/content/blog/`, so docs and prose output stay untouched — keep that guard.
- `/blog/<slug>/og.png` crops the hero with sharp via the image's undocumented `fsPath`; the endpoint throws if it disappears, so re-check it when bumping Astro. `/blog/rss.xml` uses `@astrojs/rss`.
- **Sitemap**: one `en-blog` chunk (no other locale gets one); `noindex: true` posts are filtered out by reading their frontmatter in `astro.config.mjs`. `<lastmod>` is git-dated like every other page (`src/data/lastmod.mjs`), so an uncommitted post has none.
- **Medium copies stay live** with their canonical pointing at hipo.finance. Until Search Console shows the hipo.finance URL as canonical (about 8 weeks after launch), an edit must be made on both copies. A post later merged into another gets a meta-refresh stub in `redirects` and its Medium canonical repointed — never a deleted page.
- `scripts/import-medium-posts.mjs` is the one-time importer (per-post `META` and `ALT` maps inside). Re-running it with `--force` **overwrites hand edits** — there is one, the full-word `hGRAM` link in `hipo-gang-first-two-months`.
