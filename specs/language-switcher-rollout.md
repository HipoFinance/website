# Language switcher rollout — expose the nine translated locales

**Status:** draft

## Goal

Make the nine translated locales reachable from the interface. Today they exist at `/fa/…`, `/ru/…` and so
on, are crawled and are in the sitemap, but nothing a visitor can see links to them — a Persian speaker who
lands on `https://hipo.finance/stake/` has no way to discover the Persian page. This change flips all nine
from `indexed` to `public`, which lights up the language dropdown that already ships dormant in the site
header, the site footer, the dApp header and the docs header, plus the one-time "Read this page in فارسی?"
suggestion bar. It also closes the two gaps that the flip would otherwise expose.

## Definitions

**Concepts**

- **Locale status** — the `status` field in `src/i18n/registry.mjs`, the whole rollout mechanism.
  `'draft'` = built only under `I18N_INCLUDE_DRAFTS=1`, never linked or indexed. `'indexed'` = built,
  `hreflang`, sitemap, **no visible language UI**. `'public'` = also listed in the language dropdown.
- **Released** — status `indexed` or `public`. Unchanged by this spec: all nine are already released, so
  nothing about which pages are built, crawled or in the sitemap changes.
- **The switcher** — the `<details>/<summary>` dropdown of real `<a href>` links, one per public locale,
  pointing at the same path in that locale. Three implementations exist and stay separate:
  `src/components/LanguageSwitcher.astro` (site pages, flat text style), `src/components/app/LanguageSwitcher.tsx`
  (dApp island, pill style), `src/components/starlight/LanguageSelect.astro` (docs, a `<select>`).
- **The shell** — `src/components/app/shell/`, the hand-written Astro mirror of the dApp island's markup
  rendered at build time and deleted by `App.tsx` on hydration. Its rule: a mirror reproduces the island's
  **first-paint** state, and every class is copied from the React source and must stay copied.
- **The suggestion bar** — `#lang-suggest` in `src/components/Banner.astro`, driven by
  `src/scripts/banner.js`. Shown on English pages only, once, when `navigator.languages` prefers a public
  locale; the answer is remembered in `localStorage['hipo.locale']` and it suppresses the promo banner while
  shown.
- **The batch rule** (spec decision 14) — locales are exposed in groups of ≥3 so Google re-evaluates a
  stable `hreflang` cluster. Nine at once satisfies it.

Terminology for the protocol itself (GRAM, hGRAM, staking terms) is governed by `src/i18n/GLOSSARY.md`.

**Formula parameters** — None. This change computes no amounts.

## Context

- `src/i18n/registry.mjs:22-33` — `en` is `'public'`; `fa, ru, ar, de, hi, tr, it, id, pt-br` are all
  `'indexed'`. `publicLocales()` (`registry.mjs:109-112`) therefore returns `['en']`.
- Every language UI gates on that list being at least two long, and so renders **nothing** today:
  `LanguageSwitcher.astro:18-19`, `app/LanguageSwitcher.tsx:27-29`, `starlight/LanguageSelect.astro:13,42`,
  a redundant second gate at `starlight/Header.astro:22,36`, and `Banner.astro:15-16`
  (`locale === 'en' && suggestLocales.length >= 2`).
- This is by design. `specs/multi-language-site.md` §J: the switcher "ships in phase 2 behind that rule so
  turning it on is a registry edit, not a code change." §L step 4 is exactly this change.
- The switchers are mounted in all the right places already: `SiteHeader.astro:50` (desktop nav) and `:92`
  (`inline`, in `#mobile-menu`), `SiteFooter.astro:77`, `AppLayout.astro:204` (app footer nav),
  `app/Header.tsx:76` (`max-sm:hidden`, top bar) and `:139` (`sm:hidden`, open mobile menu), and
  `astro.config.mjs:402` wires the Starlight `LanguageSelect` override.
- All strings are already translated in all ten locales: `site.switcher.label`, `site.langSuggest.text`,
  `site.langSuggest.dismiss` (`src/i18n/<locale>/site.json:47,53,54`) and `app.header.language`
  (`app.json:43`). **No new strings are needed**, so `check-i18n.mjs` cannot be tripped by this change.
- `node scripts/check-i18n.mjs` today: every locale 100.0 % (712/712), 0 missing, 0 stale, 0 warnings.
- `hreflang` already covers all ten locales (`SEO.astro:34,53-54` over `indexableLocales()`), as does the
  sitemap (`astro.config.mjs:346-350`). Those are driven by `indexableLocales()`, not `publicLocales()`, so
  **this change does not alter a single `<head>` tag or sitemap entry.**
- `src/components/LanguageSwitcher.astro:83-98` is a document-delegated click listener on
  `[data-i18n-switcher] a[data-locale]` that writes `localStorage['hipo.locale']`. It is hoisted and already
  present on app pages (AppLayout renders the footer switcher), so any markup carrying those two attributes
  is covered without a new script.

Two gaps the flip would expose:

1. **`src/components/app/shell/ShellHeader.astro:68-98` has no switcher.** The island's `Header.tsx:76`
   renders `<LanguageSwitcher className='max-sm:hidden'/>` as the first child of the right-hand `div`,
   before the Connect button. The shell's matching `div` has only Connect and the hamburger. The moment a
   second locale is public the shell and the island's first paint differ, and the app header shifts sideways
   when React mounts — the exact failure the copy-the-classes rule exists to prevent.
2. **The dropdown panel was designed when it held two entries.** `LanguageSwitcher.astro:55-59` and
   `LanguageSwitcher.tsx:55` give the `<ul>` `min-w-40` and no height cap. With ten entries it becomes a
   ~370 px column; in the site footer it opens downward at the bottom of the page.

## Approach

**Flip the registry, mirror the switcher into the shell, cap the panel.** Three small changes; no new
component, no new string, no new route.

1. Change `status: 'indexed'` → `status: 'public'` for all nine non-English locales. This is the entire
   user-facing feature: four UIs and the suggestion bar switch on at once.
2. Add `src/components/app/shell/ShellLanguageSwitcher.astro` — a static mirror of
   `app/LanguageSwitcher.tsx`'s first-paint markup (classes copied, pill chrome, globe + label + chevron) —
   and render it in `ShellHeader.astro` at the island's position with `class='max-sm:hidden'`. Unlike the
   shell's Connect button and hamburger it is **not** disabled: `<details>` and `<a href>` need no
   JavaScript, so the shell's switcher is fully functional before hydration. Its links carry `data-locale`
   so the existing delegated listener remembers the choice. The island's mobile-menu copy (`Header.tsx:139`)
   is **not** mirrored — the shell renders the menu closed, which is the first-paint state.
3. Give the panel `max-h-[min(60vh,22rem)] overflow-y-auto` in all three switchers (site, island, shell) so
   ten entries scroll inside the panel instead of growing the page.
4. **Align the site header with the dApp header.** Move `SiteHeader.astro`'s desktop switcher out of the
   `hidden … lg:flex` nav and into the right-hand action `div` with `class='max-sm:hidden'`, and change the
   mobile-menu copy to `sm:hidden`. This is exactly `Header.tsx:75-76` + `:139`, so the two headers become
   structurally identical: the switcher sits in the action group beside the primary CTA, visible from `sm`
   up, with the `inline` copy in the menu only below `sm`.

   The reason is the goal of this change. Today the site's switcher is inside a nav that is `hidden` below
   `lg`, so between 640 px and 1024 px — tablets, split-screen, small laptops — the only way to find another
   language is to open a hamburger menu, while the dApp shows a globe in the bar at those same widths. A
   control nobody opens a menu to look for does not aid discovery. Below `lg` that bar currently holds the
   logo and the hamburger and nothing else (`SiteHeader.astro:51-58`, the CTA is `hidden lg:inline-block`),
   so the space is already there.

Rejected alternatives:

- _Expose only fa/ru/hi first, per §L step 4's "after traffic" wording._ Rejected: all nine are at 100 %
  coverage and have been indexed since 2026-08-24; a visitor who reads Turkish gains nothing from us
  withholding the Turkish link, and staging the flip means three more review cycles for no benefit.
- _Give `Banner.astro` a separate gate so the suggestion bar stays off._ Rejected: it is already built,
  translated, dismissible and remembered, and it is the only mechanism that reaches a visitor who cannot
  read the English header well enough to look for a globe icon.
- _Add a `variant` prop to `LanguageSwitcher.astro` and reuse it in the shell._ Rejected: the shell's
  contract is to copy `Header.tsx`, not to share code with the site header — a shared component would drift
  against the React source silently, which is the failure mode the shell directory is organised to prevent.
- _Make the docs switcher a set of links rather than a `<select>`._ Rejected. Starlight's `LanguageSelect`
  is a `<select>` whose `<option value>`s are not crawlable links, so docs pages gain no visible
  cross-language `<a>` from this change. Replacing it means reimplementing Starlight's `Select.astro` in its
  design language and re-wiring the untouched `MobileMenuFooter` that also renders it — real scope for an
  edge that costs nothing. What the `<select>` omits is only the *direct* English-docs → translated-docs
  link; it omits no discovery path. After this change every translated docs page is reachable by ordinary
  `<a href>` as `/` →(switcher)→ `/fa/` →(nav)→ `/fa/docs/` →(Starlight sidebar)→ `/fa/docs/**`, all three
  hops verified against the deployed site on 2026-09-19. `hreflang` (`starlight/Head.astro`, drafts filtered)
  and the per-locale `sitemap-<locale>-docs-0.xml` with `xhtml:link` alternates cover the English↔translated
  relationship independently. Assume Google extracts nothing from `<option value>` — that assumption costs
  us nothing here. Keep as a monitoring trigger only, not an expected outcome: if Search Console shows the
  docs locales lagging the site locales in coverage, revisit — though the likelier cause of such a gap
  would be index selection over unreviewed machine translation, which a switcher link would not fix.
- _Keep the site switcher inside the nav and leave the two headers different (the conservative option)._
  Rejected: see point 4 above. It is one moved line and it is the difference between the switcher being
  visible and being behind a menu on every tablet-width screen.

## Changes

- `src/i18n/registry.mjs` — nine `status: 'indexed'` → `'public'`. Comments that describe the current
  rollout state, if any, updated.
- `src/components/app/shell/ShellLanguageSwitcher.astro` — **new**; static mirror of
  `app/LanguageSwitcher.tsx`, with the header comment naming that file as its source of truth (same
  convention as `ShellHeader.astro`/`ShellIcon.astro`).
- `src/components/app/shell/ShellHeader.astro` — render it as the first child of the right-hand `div`
  (before the Connect button), `class='max-sm:hidden'`, matching `Header.tsx:75-76`.
- `src/components/LanguageSwitcher.astro`, `src/components/app/LanguageSwitcher.tsx` — height cap on the
  `<ul>`.
- `src/components/SiteHeader.astro` — move the switcher from the `lg:flex` nav (`:50`) into the right-hand
  action `div` (`:51`) as `class='max-sm:hidden'`, before the "Open app" CTA; the mobile-menu copy (`:92`)
  gains `sm:hidden`.
- `specs/multi-language-site.md` — tick the §L step-4 milestone and record in the Decisions log that the
  nine went public in one batch, with the date.
- `CHANGELOG.md` + `changelog/2026-09-19-language-switcher-rollout.md` — per the changelog convention.

Explicitly **not** changed: any `src/i18n/<locale>/*.json` catalog, any `meta.json`, `SEO.astro`, the
sitemap config, the route tables, `check-i18n.mjs`.

## Acceptance criteria

- [ ] `node scripts/check-i18n.mjs` exits 0 and reports every locale at 100.0 %, 0 missing, 0 stale,
      0 warnings — same as before the change (the ≥3 batch warning does not fire).
- [ ] `npm run build` succeeds.
- [ ] `grep -c 'hreflang' dist/stake/index.html` and the full `<head>` of `dist/stake/index.html` are
      byte-identical to the pre-change build except for the switcher/banner markup in `<body>` — i.e.
      `diff` of the two builds shows **no** change to any `<link rel="alternate">`, `og:locale`, JSON-LD or
      `sitemap-*.xml` file.
- [ ] `dist/index.html`, `dist/faq/index.html`, `dist/hpo/index.html` and `dist/stake/index.html` each
      contain a real `<a href="/fa/…">` (and one per other locale) in the static HTML — the crawlable
      cross-links the goal asks for. `dist/stake/index.html` gets them from the shell mirror as well as the
      footer.
- [ ] `dist/fa/stake/index.html` links back to `/stake/` and to `/ru/stake/`, i.e. the dropdown round-trips
      the prefix on every locale, not just English.
- [ ] The dropdown lists exactly ten entries in registry order, the current locale marked
      `aria-current="page"`, on: the site header, the site mobile menu, the site footer, the dApp
      header, the dApp mobile menu, and the docs header (as ten `<option>`s).
- [ ] At **768 px** (between `sm` and `lg`) the switcher is visible in the top bar without opening a menu,
      on both a site page (`/faq/`) and a dApp page (`/stake/`) — screenshot each. At **375 px** it is absent
      from both bars and present inside both open menus, exactly once. At **1280 px** it is in both bars and
      in neither menu. No width shows it twice.
- [ ] On `/stake/` at 1280 px, a screenshot taken immediately before hydration and one after show the
      header's right-hand group at the **same x-position** — no shift when React mounts. (Checked by
      comparing the shell's rendered header against the island's, e.g. by throttling or by diffing
      `dist/stake/index.html`'s shell markup against `Header.tsx`'s first render.)
- [ ] Opening the dropdown at 375 px on `/`, `/fa/`, `/stake/` and `/docs/` produces **no horizontal
      document scrollbar** (`document.documentElement.scrollWidth === clientWidth`), and the panel scrolls
      internally rather than running past the viewport.
- [ ] On `/fa/` the dropdown opens on the correct side under `dir="rtl"` (panel aligned to the inline end,
      not overflowing the start edge) — screenshot at 375 px and 1280 px.
- [ ] With `navigator.languages = ['fa-IR','en']` on `https://hipo.finance/` (local preview), the
      suggestion bar appears in Persian, its link goes to `/fa/`, the promo banner is suppressed, dismissing
      it hides it, and after a reload it does not reappear. With `['en-US','fa']` it never appears.
- [ ] Clicking a locale in any switcher writes that key to `localStorage['hipo.locale']` (verify for the
      shell mirror specifically, which relies on the delegated listener rather than its own handler).
- [ ] **Manual, not verifiable headless:** on `/fa/stake/` with a wallet connected, switching to English via
      the switcher and back leaves the wallet connected with no reconnect prompt, flips every string and
      `dir`, and logs no console error. This ticks the corresponding open box in
      `specs/multi-language-site.md`.

## Risks & rollback

- **Rollback is one line each.** Setting a locale back to `'indexed'` removes it from every switcher and the
  suggestion bar with no other effect; setting all nine back restores today's site exactly. Because
  `hreflang` and the sitemap key off `indexableLocales()`, a rollback does **not** disturb the `hreflang`
  cluster Google has already crawled — the pages stay indexed either way.
- **SEO.** Adding visible reciprocal links between locales is what Google recommends alongside `hreflang`;
  the risk is the opposite one, of thin or machine-sounding translations now getting traffic. All nine are
  machine-translated and marked `unreviewed` (712 items each) in `meta.json`. This change does not make them
  more indexable than they already are — they have been crawlable since 2026-08-24 — it only makes them
  reachable by humans. Native review stays a separate, open task.
- **The suggestion bar is an interstitial-shaped element.** It is a one-line bar in the existing banner slot,
  dismissible, shown once, and suppresses the promo banner rather than stacking with it — so it is not a
  Google "intrusive interstitial". Detection is `navigator.languages`, never IP, and there is no redirect,
  so shared deep links and crawlers are unaffected.
- **Header shift on app pages** is the main regression risk; criterion 7 is the check. If the mirror proves
  hard to keep pixel-identical, the fallback is to render the switcher in the shell with `invisible` — it
  then holds the exact width without painting — rather than to omit it.
- **Panel height on short screens** — criterion 8. The footer instance is the one to watch in screenshots;
  if it still looks wrong, switching that one instance to `inline` is a one-word change.
- **The site header move is the only change with a visible desktop effect**: at ≥`lg` the globe leaves the
  end of the nav row and reappears beside the "Open app" CTA. That is a deliberate design call, not a
  side-effect, and the 1280 px screenshots are where to reject it. Reverting is moving one line back into
  the nav.

## Open questions

None. The two questions raised in the first draft are now decided in **Approach** — the site header is
aligned to the dApp header (point 4), and Starlight's `<select>` is kept as-is (fourth rejected
alternative, with the Search Console trigger that would reopen it).

## Handoff (session of 2026-09-19)

**State:** draft, awaiting approval. Nothing implemented — the working tree carries this file and nothing
else. Resume by re-reading this spec from disk, then either approving it or editing it.

**Decided this session** (both of the first draft's open questions are closed):

1. All nine locales go `public` in one batch, not a staged subset — all are at 100 % coverage and have been
   `indexed` since 2026-08-24, and the ≥3 batch rule is satisfied.
2. The suggestion bar ships on rather than being held back behind a new gate.
3. The site header is aligned to the dApp header (Approach point 4) rather than left hamburger-only below
   `lg`.
4. Starlight's `<select>` is kept (fourth rejected alternative) — monitoring trigger only.

**Already verified, do not re-derive:**

- `node scripts/check-i18n.mjs` → every locale 100.0 % (712/712), 0 missing, 0 stale, 0 warnings.
- `publicLocales()` returns `['en']` today, which is why all four language UIs emit zero markup.
- `hreflang`/`og:locale:alternate`/sitemap key off `indexableLocales()`, not `publicLocales()` — this change
  cannot alter them.
- No new catalog strings are needed; all four keys exist in all ten locales.
- The crawl path `/` → `/fa/` → `/fa/docs/` → `/fa/docs/**` is real `<a href>` at every hop (checked against
  the deployed site).
- `LanguageSwitcher.astro:83-98`'s delegated listener matches `[data-i18n-switcher] a[data-locale]` and is
  already present on app pages, so the shell mirror needs no script of its own.

**Not yet done, in order:** approval → implement the Changes list → `npm run build` → English-only local
review with screenshots at 375/768/1280 px per the project workflow → then the locale/upstream decision.
No `CHANGELOG.md` entry exists yet: this session produced no site change, and the spec schedules its own
changelog entry as part of implementation.
