# 2026-07-25 — GitBook docs migration

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. Moved
all 38 documentation pages off GitBook (`docs.hipo.finance`) into this
repository, served at `https://hipo.finance/docs/` by Starlight. Markdown in
`src/content/docs/` is now the source of truth. Written with the `/spec` command
added earlier the same day; the spec is `specs/gitbook-docs-migration.md`.
(Written retrospectively from the commit record and that spec.)

| Commit    | Summary                                   |
| --------- | ----------------------------------------- |
| `a513fdb` | Migrate GitBook docs to hipo.finance/docs |

---

### Rendering

- **Added `@astrojs/starlight`, pinned to `~0.40.0`.** `0.41+` peers Astro 7
  while this project is on Astro 6, so the two must be bumped together — pinning
  makes that coupling explicit rather than a broken build later.
- **Mounted the docs at `/docs/` via the loader**, prefixing every collection
  entry id in `src/content.config.ts`. Files therefore keep a clean tree at
  `src/content/docs/<gitbook path>.md` while serving from `/docs/`, and
  `index.md` resolves to `/docs/` itself.
- **Declared the sidebar explicitly** in `astro.config.mjs` rather than using
  `autogenerate`, which preserves GitBook's exact order and its emoji labels.
  The cost is that adding a page now means adding a sidebar entry.
- **`disable404Route: true`** so Starlight's injected 404 does not displace the
  site-wide `src/pages/404.astro`.
- **Themed through Starlight's CSS custom properties** in `src/styles/docs.css`,
  which deliberately does _not_ import `global.css` — Tailwind's preflight
  conflicts with Starlight's own reset.

### Import

- **Committed `scripts/import-gitbook-docs.mjs`**, the one-time importer, kept
  for reference rather than as a sync mechanism. Re-running it wipes and
  regenerates `src/content/docs/` and `public/docs/images/`, discarding hand
  edits.
- It pulled each page's Markdown, recovered **23 images and 2 attachments** from
  the rendered pages (GitBook's `/files/<id>` handles are not directly
  downloadable; the real CDN URLs had to be paired positionally from the HTML),
  and converted hints, embeds, marks and internal links. It **aborts rather than
  guess** if a page's image count fails to reconcile.

### Links

- **Repointed every in-repo link** off `docs.hipo.finance`: the footers on the
  landing, HPO and app sections, deep links in `Hpo.astro` and `Landing.astro`,
  the `tonconnect-manifest.json` terms/privacy URLs, and `public/llms.txt`.
- Five links in the imported content pointed at GitBook paths that no longer
  exist and were remapped explicitly; two of those went to the retired
  `frequently-asked-questions` section and were sent to the site's own `/faq/`.

---

### Verification performed

Recorded as acceptance criteria in `specs/gitbook-docs-migration.md`, checked at
implementation time — every one of the 38 GitBook paths has a corresponding
`dist/docs/<path>/index.html`, and `dist/sitemap-0.xml` contains at least 38
URLs beginning `https://hipo.finance/docs/`.

### Follow-ups

- **The `docs.hipo.finance` redirect was not performed** — it is a manual
  Cloudflare/DNS change outside this repository, and the corresponding
  acceptance criterion is still unticked. The original plan for it in the spec
  rested on a wrong premise, corrected in the 2026-07-26 session, which added a
  cutover runbook.
- GitBook stays live and serving until that cutover, so rollback before it is
  lossless.
