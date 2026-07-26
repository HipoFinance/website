# Migrate GitBook docs to hipo.finance/docs

**Status:** implemented

## Goal

Move the 38 documentation pages currently hosted by GitBook at `docs.hipo.finance` into this
repository and serve them at `https://hipo.finance/docs/`, with sidebar navigation, table of
contents and search. After this, documentation is authored as Markdown in git; GitBook is retired
and `docs.hipo.finance` 301-redirects to the new location.

## Context

**What's on GitBook today.** 38 pages, cross-checked between `docs.hipo.finance/sitemap-pages.xml`
(38 `<loc>` entries) and `docs.hipo.finance/llms.txt` (38 bullets); the only difference is `/`,
which serves the same content as `/introduction/hipo-liquid-staking-protocol`.

GitBook exposes machine-readable sources that make a scripted import viable:

- `llms.txt` lists every page as `[Title](url.md): optional description`, in sidebar order.
- Appending `.md` to any page URL returns its Markdown source.
- The rendered HTML of each page exposes real CDN image URLs.

**GitBook-specific syntax in the corpus** (counted across all 38 downloaded `.md` files) — a small,
closed set:

| Construct                                             | Count   |
| ----------------------------------------------------- | ------- |
| `{% hint style="info\|success\|warning" %}`           | 19      |
| `<figure><img src="/files/ID"><figcaption>`           | 23      |
| `{% embed url="<youtube-url>" %}` (8 distinct videos) | 8       |
| `<mark style="color:…">`                              | 14      |
| `{% file src="/files/ID" %}`                          | 2       |
| `<br>`                                                | 6       |
| Markdown pipe tables                                  | 3 pages |

Every page's `.md` begins with a GitBook-injected blockquote (`> For the complete documentation
index, see llms.txt…`) that must be stripped. No YAML frontmatter is present in any file.

**Images.** The `.md` files reference images as opaque handles `/files/<id>` (25 refs total).
Fetching `https://docs.hipo.finance/files/<id>` returns the site's HTML shell, not the image — the
handles are not directly downloadable. However, the rendered HTML of each page contains the real
URLs, and they appear in document order. Verified on `/tutorials/staking`: 5 `/files/` refs in the
Markdown ↔ 5 CDN images under `…/spaces/6FShODmB4tzwranBJihk/uploads/…` in the HTML. Site chrome
images (`/icon/`, `/socialpreview/`) are distinguishable by path and must be filtered out.

**This repo.** Astro 6.4.7, `output: 'static'`, `trailingSlash: 'always'`, `site:
'https://hipo.finance'`, integrations `react()` + `sitemap()` (`astro.config.mjs:1`). Tailwind 4 via
`@tailwindcss/vite`, theme defined in `@theme` blocks in `src/styles/global.css` — no
`tailwind.config.js`. Three hand-built sections (landing, `/app/` React island, `/hpo/`), each with
its own layout in `src/layouts/` pulling in `src/components/SEO.astro`. Deployment is GitHub Pages
via `.github/workflows/deploy.yml` on push to `main`.

**Existing links to docs.hipo.finance** that will need updating:

- `src/components/LandingFooter.astro:78`, `src/components/HpoFooter.astro:78`,
  `src/components/app/Footer.tsx:114` — "Documentation" footer links
- `src/components/Hpo.astro:152`, `src/components/Landing.astro:338` — deep links
- `public/app/tonconnect-manifest.json:5-6` — `termsOfUseUrl`, `privacyPolicyUrl`
- `public/llms.txt:9,268-278` — canonical docs URL and the technical-resources list

**Starlight compatibility** (verified against the published packages, not assumed):

- `@astrojs/starlight@0.40.0` peers `astro: ^6.4.5` — satisfied by this project's `^6.4.7`.
  `0.41.x` peers `astro: ^7.0.2` and is **not** usable until Astro is upgraded.
- `@astrojs/markdown-satteri` is listed in `peerDependenciesMeta` as **optional** — not required.
- Starlight bundles Pagefind search, Expressive Code and MDX; it adds `@astrojs/sitemap` only if the
  project doesn't already have it (this one does, so the existing sitemap config stays authoritative).
- Starlight injects two routes: `[...slug]` and `404`. The `404` injection is suppressed by
  `disable404Route: true`, which this project needs because `src/pages/404.astro` already exists.
  The `[...slug]` catch-all only generates paths present in the docs collection, so it cannot
  shadow existing pages in a static build.
- `trailingSlash` is honoured (`utils/createPathFormatter.ts`, `utils/canonical.ts`).
- `slugToParam()` maps a slug of `docs/index` to the param `docs`, i.e. the route `/docs/` — so a
  `docs/` id prefix produces exactly the desired mount point.

## Approach

**Render with Starlight, pinned to `0.40.x`, mounted at `/docs`.** For 38 pages, sidebar + TOC +
prev/next + search + dark mode are the bulk of the work, and Starlight provides all of them.
Rejected: a hand-rolled `DocsLayout.astro` — full design control, but ~400 lines of navigation
plumbing to write and maintain, plus wiring Pagefind separately.

**Mount at `/docs` via the loader's `generateId`.** Content lives at `src/content/docs/<gitbook
path>.md`, and the collection is declared with
`docsLoader({ generateId: ({ entry }) => 'docs/' + entry.replace(/\.mdx?$/, '') })`,
which yields routes under `/docs/`. Rejected: nesting the files at `src/content/docs/docs/…` —
same result with no custom code, but a confusing directory name; kept as the fallback if
`generateId` misbehaves.

**Import once with a committed script.** `scripts/import-gitbook-docs.mjs` performs the whole
migration end to end so it is reproducible and reviewable, and so it can be re-run if GitBook
content changes before cutover. After cutover the imported Markdown is the source of truth and is
edited by hand; the script is not a sync mechanism.

**Preserve GitBook URL paths.** Every page keeps its path under `/docs/`
(`/security/why-your-security-matters` → `/docs/security/why-your-security-matters/`), so the
redirect is a short ordered set of wildcard rules (see the cutover runbook below). The intro page
becomes
`src/content/docs/index.md` → `/docs/`.

**Emit plain `.md`, not `.mdx`.** The corpus contains `<https://…>` autolinks, `$info` and other
characters that MDX parses differently. YouTube embeds become plain `<iframe>` HTML with a CSS
class, which Astro's Markdown renderer passes through — this avoids MDX entirely.

**Keep `global.css` out of the docs section.** Starlight pages get `src/styles/docs.css` only.
Importing Tailwind's preflight into Starlight's own reset causes style conflicts; brand alignment is
done through Starlight's CSS custom properties instead.

### Syntax transformations

| GitBook                                                                    | Output                                                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Leading `> For the complete documentation index…` blockquote               | removed                                                                         |
| `{% hint style="info" %}…{% endhint %}`                                    | `:::note`                                                                       |
| `{% hint style="success" %}`                                               | `:::tip`                                                                        |
| `{% hint style="warning" %}`                                               | `:::caution`                                                                    |
| `<figure><img src="/files/ID" alt="A"><figcaption>C</figcaption></figure>` | same markup, `src` rewritten to the local asset path                            |
| `{% embed url="<https://youtu.be/ID>" %}caption{% endembed %}`             | `<iframe class="docs-embed" src="https://www.youtube-nocookie.com/embed/ID" …>` |
| `{% file src="/files/ID" %}`                                               | asset downloaded, replaced with a Markdown download link                        |
| `<mark style="…">text</mark>`                                              | `text` (wrapper dropped; GitBook's `$info` colour var has no equivalent)        |
| `&#x20;`                                                                   | space                                                                           |
| `](https://docs.hipo.finance/x.md)` and `](/x.md)`                         | `](/docs/x/)`                                                                   |

Three links in the source point at paths that no longer exist on GitBook and are remapped
explicitly: `/hipo-tokens/hipo-staked-ton-hton` → `/docs/hipo-tokens/hipo-staked-gram-hgram/`,
`/introduction/hpo-hipo-governance-token/hpo-tokens-distribution` →
`/docs/hipo-tokens/hipo-governance-token-hpo/hpo-tokens-distribution/`, and
`/hipo-ambassadors-program` (no `.md`) → `/docs/hipo-ambassadors-program/`.

**Amended during implementation:** two further stale links were found, both pointing into GitBook's
retired `frequently-asked-questions` section, which has no equivalent under `/docs/`:
`/frequently-asked-questions/what-is-apy` (in `tutorials/staking`) and
`/frequently-asked-questions/what-is-the-expected-timeframe-for-receiving-my-ton-after-unstaking`
(in `tutorials/unstaking`). Both are remapped to the site's own FAQ page, `/faq/`, which answers
them ("What APY does Hipo offer?", "How long does unstaking take?"). Left unrewritten they would
404 once the wildcard redirect goes live.

**Amended after migration:** every question and section on `/faq/` now carries a stable slug id
derived from its text (`src/components/FAQ.astro`), so the two links above were narrowed from the
page root to the exact answers: `/faq/#what-apy-does-hipo-offer` and
`/faq/#how-long-does-unstaking-take`. The second answer was extended with the "up to 36 hours"
figure so it corroborates the anchor text in `tutorials/unstaking`; that figure also appears in
`public/llms.txt:129` and the three should be kept in agreement.

### Image extraction

For each page the script fetches both `<url>.md` and `<url>`, extracts `~gitbook/image?url=…`
sources from the HTML in document order, double-decodes them, keeps only those whose path contains
`/spaces/…/uploads/`, and pairs them positionally with the page's `/files/<id>` references. **If the
two counts differ for any page the script aborts with that page's name** rather than emitting a
wrong mapping. Assets are written to `public/docs/images/<page-slug>-<n>.<ext>`.

### Sidebar

Declared explicitly in `astro.config.mjs` (not `autogenerate`) to reproduce GitBook's exact order
and group structure, recovered from the rendered sidebar:

Introduction (Hipo Liquid Staking Protocol, Liquid Staking → Why TON?, How Does Hipo Work? → Stake
GRAM / Get hGRAM / Unstaking / Validators, Advantages of Hipo, Hipo Rewards, Hipo Stats) · Hipo Fund
(+ 2 quarterly reports) · Security (2) · Tutorials (2) · Hipo Tokens (hGRAM → Use Cases, HPO →
Tokenomics / Distribution) · DAO · Profit Sharing · Giveaways and Prizes (6, incl. Hipo Club seasons
2–3 and Hipo Gang season 1) · Hipo Ambassadors Program · Legal Agreements (2) · Brand Kit.

Emoji prefixes from GitBook (🦛, 🚰, ⚙️, …) are preserved in `sidebar.label`.

### Redirects (outside this repo)

This spec defines the mapping and the acceptance check; **performing the DNS/Cloudflare change is a
manual step outside this repository** and is not gated on the code landing.

**Corrected during cutover planning.** The original draft of this section read the `server:
cloudflare` and `cf-ray` response headers as evidence that the hostname already passed through the
`hipo.finance` Cloudflare zone. It does not — those headers are GitBook's own Cloudflare in front of
its hosting. In the `hipo.finance` zone the record is:

```
docs  CNAME  ae2b5f05a4-hosting.gitbook.io   (DNS-only / grey cloud)
```

DNS-only means traffic never reaches the zone's edge, so **no Redirect Rule can fire until the
record is switched to Proxied**. That switch, not the rule creation, is the cutover moment.

The zone's plan does not support regex functions in rule expressions, so `regex_replace()` is
unavailable and the rules below use Cloudflare's wildcard pattern matching instead. Nested
`regex_replace()` calls are rejected outright regardless of plan.

#### Cutover runbook

1. **Create the Redirect Rules.** Dashboard → `hipo.finance` → Rules → Redirect Rules. For each:
   match type **Wildcard pattern**, status **301**, **Preserve query string** on. Order matters —
   evaluation stops at the first match.

   | #   | Name             | Request URL                                                            | Target URL                        |
   | --- | ---------------- | ---------------------------------------------------------------------- | --------------------------------- |
   | 1   | `docs intro`     | `https://docs.hipo.finance/introduction/hipo-liquid-staking-protocol*` | `https://hipo.finance/docs/`      |
   | 2   | `docs root`      | `https://docs.hipo.finance/`                                           | `https://hipo.finance/docs/`      |
   | 3   | `docs md`        | `https://docs.hipo.finance/*.md`                                       | `https://hipo.finance/docs/${1}/` |
   | 4   | `docs slash`     | `https://docs.hipo.finance/*/`                                         | `https://hipo.finance/docs/${1}/` |
   | 5   | `docs catch-all` | `https://docs.hipo.finance/*`                                          | `https://hipo.finance/docs/${1}/` |

   Rules 1–2 take a static target; 3–5 use `${1}`, the wildcard capture. Rule 1 exists because that
   page became `/docs/` itself (see "Preserve GitBook URL paths" above). Rule 3 exists because
   GitBook serves Markdown at `<url>.md` and those return 200 today. Rule 4 exists because the site
   sets `trailingSlash: 'always'`, so `/x/` would otherwise yield `/docs/x//`. Under a rule-count
   limit, drop 4 then 3 — they are the low-traffic cases.

2. **Enable Always Use HTTPS** (SSL/TLS → Edge Certificates). The patterns specify `https://`, so
   plain-HTTP requests must be upgraded before they can match.

3. **Flip the DNS record to Proxied** (orange cloud). Leave the CNAME target on GitBook for now: a
   rule miss then falls through to the still-live GitBook page instead of erroring. Do not delete
   the record — NXDOMAIN leaves nothing to redirect. Universal SSL covers `docs.hipo.finance` as a
   first-level subdomain but takes a few minutes to issue.

4. **Verify** — every path 301s and its destination resolves:

   ```bash
   for p in / /tutorials/staking /tutorials/staking/ /tutorials/staking.md \
            /introduction/hipo-liquid-staking-protocol /brand-kit; do
     printf "%-48s %s\n" "$p" \
       "$(curl -sI "https://docs.hipo.finance$p" | awk 'tolower($1)~/^(http|location:)/{print $2}' | tr '\n' ' ')"
   done
   curl -s -o /dev/null -w '%{http_code} %{url_effective}\n' -L https://docs.hipo.finance/tutorials/staking
   ```

5. **Clean up**, only once step 4 passes: unpublish the GitBook custom domain; optionally repoint
   the record to a proxied `A 192.0.2.1` (RFC 5737) now that no origin is contacted — after which a
   rule miss becomes a 522 rather than stale content; purge the cache; submit
   `https://hipo.finance/sitemap-index.xml` in Search Console. Keep the redirects for at least 12
   months, since the 301 is what carries ranking signal across.

## Changes

- `package.json` — add `@astrojs/starlight@~0.40.0` (pinned below 0.41, which requires Astro 7)
- `astro.config.mjs` — add `starlight({ … })` with `disable404Route: true`, explicit `sidebar`,
  `customCss: ['./src/styles/docs.css']`, `title`, `logo`, `favicon`, `social`, `editLink` disabled
- `src/content.config.ts` (new) — declare the `docs` collection with `docsLoader({ generateId })`
  and `docsSchema()`
- `src/content/docs/**.md` (new, 38 files) — imported and transformed documentation
- `public/docs/images/**` (new, 23 images + 2 file attachments = 25 assets) — extracted assets
- `src/styles/docs.css` (new) — Starlight CSS custom properties mapped to the Hipo palette and
  Poppins/Heebo/Eczar fonts, plus `.docs-embed` iframe styling
- `scripts/import-gitbook-docs.mjs` (new) — the one-time importer described above
- `src/components/LandingFooter.astro:78`, `src/components/HpoFooter.astro:78`,
  `src/components/app/Footer.tsx:114`, `src/components/Hpo.astro:152`,
  `src/components/Landing.astro:338` — repoint to `/docs/…`
- `public/app/tonconnect-manifest.json:5-6` — repoint terms/privacy URLs
- `public/llms.txt:9,268-278` — canonical docs URL and technical-resource links → `hipo.finance/docs/…`
- `CLAUDE.md` — document the new fourth section and its authoring workflow

## Acceptance criteria

- [x] `npm run build` completes with no errors and no new warnings — the only warning is the
      pre-existing vite chunk-size notice for `AppIsland` (1070 kB, the React dApp island); no
      Starlight chunk exceeds the limit.
- [x] `dist/docs/index.html` exists and its `<h1>` is "Hipo Liquid Staking Protocol"
- [x] `find dist/docs -name index.html | wc -l` = 38
- [x] Every one of the 38 GitBook paths from `llms.txt` has a corresponding
      `dist/docs/<path>/index.html` (checked by a script that reads `llms.txt` and asserts each file exists)
- [x] `grep -rE '\{%|\{#|<mark|&#x20;' src/content/docs/` returns no matches
- [x] `grep -rE 'src="/files/' src/content/docs/` returns no matches
- [x] `ls public/docs/images | wc -l` = 25 (23 images + 2 attachments) and every file is >0 bytes
      and identified as an image or archive by `file(1)`
- [x] `grep -rn 'docs\.hipo\.finance' src/ public/ dist/` returns no matches outside
      `scripts/import-gitbook-docs.mjs`
- [x] `dist/pagefind/pagefind-entry.json` exists, and a Pagefind query for "unstaking" run against
      `dist/` returns at least the `/docs/tutorials/unstaking/` result — a real query returned 3
      results including `/docs/tutorials/unstaking/`.
- [x] The sidebar in `dist/docs/index.html` lists the 11 top-level entries in the GitBook order
      recorded in Approach → Sidebar
- [x] Every internal link emitted into `dist/docs/**` that points at `/docs/…` ends with `/` — the
      only exceptions are the two `/docs/images/*.rar` attachment links, which are files, not routes.
- [x] `dist/404.html` still contains the marker text from `src/pages/404.astro` (Starlight's 404 did
      not take over) — "Page not found" present, zero Starlight references.
- [x] `dist/sitemap-0.xml` contains at least 38 URLs beginning `https://hipo.finance/docs/`
- [x] `dist/docs/index.html` renders with the Hipo accent colour: the Starlight CSS bundle it links
      contains the brand hex from `src/styles/docs.css`, not Starlight's default purple
- [~] Dark/light toggle is present on a docs page and switching it changes `data-theme` on `<html>` —
  **partially verified.** The toggle markup (`starlight-theme-select`) and the theme script that
  assigns `document.documentElement.dataset.theme` are both present in the built page. The click
  itself was not exercised: no browser tooling was available in this session.
- [x] The 8 YouTube embeds render as `<iframe>` elements in `dist/` (not literal `{% embed %}` text)
- [x] Footer "Documentation" links on `/`, `/hpo/` and `/app/` point to `/docs/` — the first two in
      static HTML, the third in the `AppIsland` bundle (`href:"/docs/"`), as expected for the island.
- [ ] Manual, post-DNS-change: `curl -sI https://docs.hipo.finance/tutorials/staking` returns `301`
      with `location: https://hipo.finance/docs/tutorials/staking/` — **not done.** Requires the
      Cloudflare/GitBook cutover, which is outside this repository.

### Image pairing check

The Risks section flagged that two images on one page could silently swap. Verified on
`/docs/tutorials/staking/`, the highest-risk page (5 images): the screenshots carry embedded step
badges, and images 2–5 render badges ①②③④ directly under the markdown's "Step 1: Choose Your
Platform" … "Step 4: Confirm the Transaction" respectively. The positional mapping is correct.

## Risks & rollback

- **Starlight pinned to 0.40.x blocks an Astro 7 upgrade.** Detected the next time someone runs
  `npm outdated` or tries to bump Astro. Accepted: upgrading later means bumping both together.
- **Image order-matching produces a wrong pairing.** Mitigated by the script's hard per-page count
  assertion, and by the acceptance check that all 27 assets are valid non-empty files. Residual
  risk: two images on the same page swapped — caught only by eyeballing the 6 pages with >1 image.
- **Tailwind preflight bleeding into Starlight.** Mitigated by not importing `global.css` into docs
  pages. Detected visually if docs typography looks unstyled.
- **Content drift.** GitBook stays editable until it's unpublished; edits made there between import
  and cutover are silently lost. Mitigated by re-running the import script immediately before
  cutover and diffing.
- **Redirect step is outside this repo and can't be verified by the build.** The final acceptance
  criterion is explicitly marked manual.
- **Rollback:** revert the commit — `/docs/` disappears and the site returns to its current three
  sections. Because `docs.hipo.finance` stays live until the manual Cloudflare change, rollback
  before cutover is lossless; after cutover it additionally requires reverting the redirect rule.

## Open questions

None — all three resolved as "accepted" by the user on 2026-07-25:

1. **Legal pages.** Accepted: Terms of Use and Privacy Policy are served from
   `/docs/legal-agreements/…` with normal docs chrome, and
   `public/app/tonconnect-manifest.json` points wallets there.
2. **Emoji in sidebar labels.** Accepted: GitBook's emoji prefixes are preserved in
   `sidebar.label`.
3. **`/docs/` landing page.** Accepted: `/docs/` is the imported Introduction page, mirroring
   GitBook. No net-new index page is authored.
