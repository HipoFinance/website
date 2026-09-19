# 2026-09-19 — The nine translated locales become reachable from the interface

All nine translated locales (fa, ru, ar, de, hi, tr, it, id, pt-br) had been built, crawled and in the
sitemap since 2026-08-24 as `indexed`, but nothing a visitor could see linked to them. This session
flipped them to `public` in one batch, which switched on the language dropdowns that had shipped dormant
in every header and footer, plus the one-time "Read this page in …?" suggestion bar. Most of the work was
what the flip exposed: header rows that no longer fit in the longer locales, a dApp header with no room
for the switcher on phones, and a docs language select that had never worked on phones. Spec:
`specs/language-switcher-rollout.md` (approved, then three amendments made during review on the dev server).

| Commit         | Subject                                                             |
| -------------- | ------------------------------------------------------------------- |
| (this session) | Make the nine translated locales public and fit the headers to them |

## What changed

- **Registry.** `status: 'indexed'` → `'public'` for all nine. `hreflang`, `og:locale` and the sitemap key
  off `indexableLocales()`, so none of them changed — checked by diffing the `<head>` of four pages and all
  31 sitemap files against a build of the previous commit (identical).
- **One switcher per header, always in the bar.** The site header, the dApp header (React island) and the
  dApp's static pre-hydration shell show the dropdown in the top bar at every width and never inside a
  hamburger menu: the full language name from 640 px up, globe + two-letter code (`localeCode()` in
  `src/i18n/locale.ts`, `PT` for `pt-br`) below it. The full name stays in the accessibility tree.
- **Inline nav from 1280 px (`xl`) instead of 1024 px (`lg`)** in both headers. With the switcher in the
  row, Russian overflowed at 1024 px (Connect 94 px past the edge on `/ru/stake/`, the nav over the logo on
  `/ru/faq/`); hiding the name at 1024–1279 px was tried first and was not enough. The dApp's bottom tab bar
  still stops at 1024 px.
- **dApp header on phones: two rows.** Row 1 is logo · switcher · menu; row 2 is Connect/Disconnect at full
  width, now showing the short wallet address on phones too. Connect alone already filled the phone bar in
  every locale (measured 48–116 px short with the switcher added), and moving it into the menu was rejected.
  The shell mirrors the layout; the header does not move when React mounts (0 px, measured).
- **Picking a language closes the dropdown** — needed because the island persists across ClientRouter
  swaps, so its dropdown otherwise arrived on the new page still open.
- **Docs.** The Starlight language select was dead on phones: it was rendered twice per page and its
  custom-element constructor wired the `<select>`, which for the second (mobile-menu) copy ran before its
  children were parsed. It is now wired by one delegated listener, rendered only where our docs header
  places it (in the bar, not the menu), and drawn with the same globe and chevron as the other switchers
  over a transparent native `<select>` — code below 900 px, full name above.
- **Smaller fixes.** Dropdown panels are capped (`max-h-[min(60vh,22rem)]`) and scroll inside; the footer
  switcher is `w-fit` and its panel opens under the globe; the duplicate footer switcher on app pages is
  gone; the site header gained `gap-4`, a non-shrinking logo and non-wrapping CTA/Connect labels.

Declined: making the docs switcher a list of real links (a `<select>` offers no crawlable cross-links, but
every translated docs page is reachable by `<a href>` through `/<locale>/` and `hreflang` covers the rest);
staging the release per locale; a separate gate keeping the suggestion bar off.

### Verification performed

- `node scripts/check-i18n.mjs`: every locale 100 %, 0 warnings (no new strings); i18n selftest passes;
  `npm run build` passes.
- Headless Playwright on the dev server and on `astro preview`: all ten locales × `/faq/`, `/stake/` × 320,
  360, 375, 640, 768, 1024, 1100, 1280 px — no document overflow caused by the header, one switcher per
  header, no wrapped labels; docs × ten locales × 320–1280 px likewise; shell vs hydrated header identical at
  375/1024/1280 px; suggestion bar with `navigator.languages = ['fa-IR','en']` shows once, suppresses the
  promo, is remembered; language choice remembered in `localStorage['hipo.locale']`; the connected
  Disconnect button (address + label) fits from 640 px up in every locale (simulated).
- Reviewed by the user on the dev server; wallet connect/disconnect from the phone header's second row is
  the user's manual check (no wallet in the headless browser).
- Code review ×2 (no correctness findings; stale comments and a dead prop fixed).

### Follow-ups

- **FAQ pages scroll sideways on phones in some locales** (`/ru/faq/` up to 25 px, `hi`, `tr`, `fa`): the
  invisible "copied" tooltip of `src/components/AnchorLink.astro` sticks out past the right edge next to
  headings near it. Already on `main` before this session; not fixed here.
- The dev server kept serving a stale stylesheet for `starlight/LanguageSelect.astro` after edits — restart
  it when docs styles look wrong.
- All nine locales remain machine-translated and unreviewed (712 items each); native review is still open.
- Watch Search Console for the docs locales lagging the site locales (the trigger recorded in the spec for
  revisiting the `<select>`).
