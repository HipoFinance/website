---
paths:
  - "src/content/docs/**"
  - "src/styles/docs.css"
  - "src/components/starlight/**"
  - "src/i18n/*/docs-sidebar.json"
  - "src/i18n/remark-localize-links.mjs"
---

# Documentation (`/docs/`)

Migrated off GitBook (`docs.hipo.finance`) — see `specs/gitbook-docs-migration.md`. Markdown in this repo is now the source of truth; edit `src/content/docs/**.md` directly.

- Rendered by **`@astrojs/starlight`, pinned to `~0.40.0`** — `0.41+` requires Astro 7. Bump both together or the build breaks.
- English content lives at `src/content/docs/<path>.md`, translations at `src/content/docs/<locale>/<path>.md` (same relative path), all served under `/docs/` resp. `/<locale>/docs/`: `src/content.config.ts` builds locale-first ids (`fa/docs/x`) via `docsLoader({ generateId })`. `index.md` → `/docs/`.
- The sidebar is declared **explicitly** in `astro.config.mjs` (not `autogenerate`) to preserve GitBook's order and emoji labels; its labels are translated through `src/i18n/<locale>/docs-sidebar.json` (`group:<English label>` keys for groups). Adding a page means adding a sidebar entry, a translated label, and the translated page in every released locale (the build fails otherwise).
- Starlight's `locales` are generated from the registry (English = root locale) and it owns Astro's i18n config — never add `i18n` to `astro.config.mjs` or import `astro:i18n`. Root-relative links in translated docs are prefixed by `src/i18n/remark-localize-links.mjs`.
- `disable404Route: true` keeps `src/pages/404.astro` as the site-wide 404.
- Images and attachments are plain files in `public/docs/images/`, referenced by absolute path.
- `src/styles/docs.css` themes Starlight through its CSS custom properties. It deliberately does **not** import `global.css` — Tailwind's preflight conflicts with Starlight's reset.
- Search is Pagefind, bundled with Starlight and built automatically at the end of `npm run build`.
- `scripts/import-gitbook-docs.mjs` is the one-time importer, kept for reference. Re-running it **wipes and regenerates** `src/content/docs/` and `public/docs/images/`, discarding hand edits.
