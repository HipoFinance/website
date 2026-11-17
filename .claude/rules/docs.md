---
paths:
  - 'src/content/docs/**'
  - 'src/styles/docs.css'
  - 'src/components/starlight/**'
  - 'src/i18n/*/docs-sidebar.json'
  - 'src/i18n/remark-localize-links.mjs'
---

# Documentation (`/docs/`)

Migrated off GitBook (`docs.hipo.finance`) — see `specs/gitbook-docs-migration.md`. Markdown in this repo is now the source of truth; edit `src/content/docs/**.md` directly.

- Rendered by **`@astrojs/starlight`, pinned to `~0.40.0`** — `0.41+` requires Astro 7. Bump both together or the build breaks.
- English content lives at `src/content/docs/<path>.md`, translations at `src/content/docs/<locale>/<path>.md` (same relative path), all served under `/docs/` resp. `/<locale>/docs/`: `src/content.config.ts` builds locale-first ids (`fa/docs/x`) via `docsLoader({ generateId })`. `index.md` → `/docs/`.
- The sidebar is declared **explicitly** in `astro.config.mjs` (not `autogenerate`) to preserve GitBook's order (the GitBook emoji in the labels were removed 2026-11-17); its labels are translated through `src/i18n/<locale>/docs-sidebar.json` (`group:<English label>` keys for groups). Adding a page means adding a sidebar entry, a translated label, and the translated page in every released locale (the build fails otherwise).
- Starlight's `locales` are generated from the registry (English = root locale) and it owns Astro's i18n config — never add `i18n` to `astro.config.mjs` or import `astro:i18n`. Root-relative links in translated docs are prefixed by `src/i18n/remark-localize-links.mjs`.
- `disable404Route: true` keeps `src/pages/404.astro` as the site-wide 404.
- Images and attachments are plain files in `public/docs/images/`, referenced by absolute path.
- `src/styles/docs.css` maps Starlight's `--sl-*` variables to the site's `--color-*` tokens (no palette of its own). It imports `tailwindcss/theme.css`, `tokens.css` and `tailwindcss/utilities.css`, deliberately **not** `global.css` or preflight, which conflicts with Starlight's reset. Its own rules live in `@layer starlight`, so Tailwind utilities win.
- **The frame** (`specs/docs-site-chrome.md`): docs pages wear the site's Banner, SiteHeader and SiteFooter through the `PageFrame.astro` override. `TwoColumnContent.astro` lays out the article and "On this page"; `Header.astro` is the docs bar (Documentation link, search, phone "Contents" button); `MobileMenuFooter.astro` renders nothing. The site chrome sits outside `<main data-pagefind-body>`, so search never indexes it. `localeOf()` falls back to Starlight's route locale on docs routes. `--sl-nav-height` is `0rem` (keep the unit), and keep `id="starlight__sidebar"` (Starlight persists the sidebar state by it). These lean on Starlight 0.40 internals: the 0.41 / Astro 7 bump must re-check them.
- **The docs home** (`specs/docs-home-landing.md`): every locale's `index.md` is a Starlight splash page (`template: splash`, `next: false`) whose intro paragraph and video live in its `hero` frontmatter (`tagline`, `image.html`), drawn by our `Hero.astro` override with its two buttons. `src/i18n/rehype-docs-home-cards.mjs` turns each `##` section into a card and splits each list item at its `—` into link and summary; it fails the build on a docs home with no `##` or a list item without a link, so keep that shape when editing the page in any locale.
- Search is Pagefind, bundled with Starlight and built automatically at the end of `npm run build`.
- `scripts/import-gitbook-docs.mjs` is the one-time importer, kept for reference. Re-running it **wipes and regenerates** `src/content/docs/` and `public/docs/images/`, discarding hand edits.
