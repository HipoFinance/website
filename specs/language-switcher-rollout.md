# Language switcher rollout — expose the nine translated locales

**Status:** approved (2026-09-19) and implemented; Amendments 1, 2 and 3 approved and implemented (see end of file)

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
  edge that costs nothing. What the `<select>` omits is only the _direct_ English-docs → translated-docs
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
  gains `sm:hidden`. _(Superseded by Amendment 1 A3: bar instance at every width, menu copy removed.)_
- `src/layouts/AppLayout.astro` — _(added during implementation, review finding)_ drop the footer-nav
  `LanguageSwitcher`: app pages also render `SiteFooter`, which carries its own, so the flip would have
  shown two dropdowns at the bottom of every app page. The delegated click listener still reaches app
  pages through `SiteFooter`'s instance.
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

## Amendment 1 — header fit (2026-09-19, approved)

**Why.** Browser verification of the implemented spec found the flip crowds the headers in the longer
locales (all measured headless on the dev server):

- **1024–1100 px:** `/ru/stake/` scrolls horizontally by 44 px with Connect clipped; on `/ru/faq/` (1024 and 1100) the nav overlaps the "Hipo" wordmark; on `/pt-br/*` "Português (Brasil)" and the CTA wrap to two
  lines. `it`, `tr` fit.
- **Footer:** the `<details>` fills its column, so the `end-0` panel opens ~180 px away from the globe.
- **Phones:** the switcher is only reachable through the hamburger menu, which hides it from the visitors
  this change is for. Measured: a globe + two-letter code (~55–61 px) fits the **site** bar in all ten
  locales down to 320 px (≥ 77 px spare). It does **not** fit the **dApp** bar in any locale — short by
  48–116 px at 375 px, and even a 44 px globe-only button is short in 9 of 10 — because Connect already
  fills it ("Подключить кошелёк" is 124 px).

**Decided with the user:** (1) globe-only between `lg` and `xl`; (2) `w-fit` on the footer switcher;
(3) globe + code in both top bars on phones, replacing the menu copies; (4) on dApp pages below `sm`,
Connect/Disconnect moves to a **second row of the header**, not into the hamburger menu (rejected by the
user), so the first row has room for the globe.

### A1. Globe-only between 1024 and 1279 px _(superseded by Amendment 2 item 4)_

In the three **bar** instances (site header, island header, shell header), the visible language name is
`sr-only` at `lg:max-xl` — still announced, not painted — leaving globe + chevron. Footer and docs
instances are unaffected. The site header's logo link gets `flex-none` (the dApp's already has it) so the
nav can no longer squeeze it, and the "Open app" CTA and Connect get `whitespace-nowrap` so a long label
overflows the measurement rather than wrapping silently. If a locale still does not fit at 1024 px after
this, that is a verification failure to report, not something to paper over with `overflow-x: hidden`.

### A2. Footer panel under its button

`SiteFooter.astro`'s switcher gets `w-fit`, so the `<details>` is as wide as its summary and the `end-0`
panel opens under the globe.

### A3. Globe + code in the top bar on phones

- Below `sm` the bar instances show globe + **upper-case code** + chevron. The code is the locale key's
  first segment, upper-cased — `EN FA RU AR DE HI TR IT ID PT` (so `pt-br` → `PT`). It is derived, not
  a new catalog string, so `check-i18n.mjs` is unaffected. The code span is `aria-hidden`; the full name
  stays in the DOM as `sr-only` below `sm`, so screen readers read "Language: Русский", never "RU".
- The bar instances lose `max-sm:hidden` and are shown at every width.
- The in-menu copies are removed: `SiteHeader.astro`'s `inline` switcher in `#mobile-menu`, and
  `Header.tsx`'s `sm:hidden` copy in the open mobile menu. The switcher then appears **once** in each
  header at every width.
- Same markup in the shell mirror (`ShellLanguageSwitcher.astro`), classes copied.

### A4. dApp header: Connect/Disconnect on a second row below `sm`

- Below `sm` (< 640 px) the dApp header has two rows. Row 1: logo · switcher · hamburger. Row 2:
  Connect (disconnected) or Disconnect (connected) as a **normal-sized pill aligned to the inline end** (user
  choice over full width, which would stack a second coral bar above the form's own Connect), same pill classes and
  labels as today. No new string. The Disconnect button keeps hiding the short address below `sm`, as it
  does now. _(Address part superseded by Amendment 2 item 2; end-aligned pill by item 1.)_
- From `sm` up nothing changes: one row, Connect in the right-hand group.
- The hamburger menu's contents are unchanged. The Telegram Mini App header (`tma/TmaHeader.tsx`) is
  untouched.
- The shell mirror (`ShellHeader.astro`) reproduces the two-row first-paint layout exactly (disconnected
  state, button `disabled` as today), so the header height and the stake form's position do not move when
  React mounts.
- Cost, accepted by the user: the dApp content starts ~56 px lower on phones.

### Amendment changes

- `src/components/LanguageSwitcher.astro` — a `bar` prop (header instance): code span + responsive
  name classes. No change for `inline` / footer use.
- `src/components/app/LanguageSwitcher.tsx`, `src/components/app/shell/ShellLanguageSwitcher.astro` —
  the same code span + responsive name classes (both are only used as bar instances after A3).
- `src/components/SiteHeader.astro` — bar switcher at all widths with `bar`; menu copy removed; logo
  `flex-none`; CTA `whitespace-nowrap`.
- `src/components/app/Header.tsx`, `src/components/app/shell/ShellHeader.astro` — two-row layout below
  `sm`; menu copy of the switcher removed (island only); Connect/Disconnect `whitespace-nowrap`.
- `src/components/SiteFooter.astro` — `w-fit`.

### Amendment acceptance criteria

- [ ] All ten locales, `/faq/` and `/stake/` (hydrated), at **320, 360, 375, 640, 768, 1024, 1100, 1280**:
      `scrollWidth === clientWidth`; the header's first row is one line (no wrapped label, no overlap
      with the logo); the switcher appears exactly once in the header and not in any menu.
- [ ] Below `sm`: the bar shows globe + code; the code matches the page's locale (`PT` on `/pt-br/`).
      At 1024 and 1100: globe + chevron only. At 1280: globe + full name. _(Superseded by Amendment 2 item 4: full name from `sm` up.)_
- [ ] Screen-reader name: the summary's accessible text contains the full language name at every width
      (checked via the accessibility snapshot at 375 and 1024).
- [ ] `/stake/` below `sm`: Connect is on row 2, end-aligned at its natural width; row 1 fits. Shell vs hydrated at **375** and
      **1280**: header height and the positions of row 1's controls and Connect are identical (0 px).
- [ ] Footer panel's inline-start edge is within the summary's horizontal extent at 375 and 1280 (opens
      under the globe), LTR and on `/fa/`.
- [ ] The original spec's criteria still pass (re-run the browser check).
- [ ] **Manual, needs a wallet:** at a phone width on `/stake/`, Connect on row 2 opens the TonConnect
      modal; after connecting, row 2 shows Disconnect and it disconnects.

**Implementation note (Amendment 1).** The footer panel is anchored `start-0` (not `end-0`): with `w-fit`
the `end-0` panel hung from the summary's end toward the inline start and ran 51 px off-screen at 375 px.
Verified after the fix: the panel starts under the globe at 375 (LTR and `/fa/`) and 1280 px. Open at the
time of writing: the 1024–1279 px band still overflows in `ru` (−94 px on `/ru/stake/`, −77 px on
`/ru/faq/` at 1024) and `it` (`/it/stake/`, −42 px, inside the padding) — a decision for the user.

## Amendment 2 — row-2 button, address on phones, close on pick, inline nav from xl (2026-09-19, approved)

Requested by the user after reviewing Amendment 1 on the dev server.

1. **Full-width Connect/Disconnect on row 2.** Reverses Amendment 1's end-aligned pill: below `sm` the
   button takes the full width of row 2 (`max-sm:w-full`), in `Header.tsx` (both the Connect and the
   Disconnect button) and in `ShellHeader.astro` (Connect only — the shell is always the disconnected
   state). Classes otherwise unchanged; the wrapper keeps `basis-full`.
2. **Connected address on phones.** The Disconnect button's `<bdi>{connectedAddressShort}</bdi> ·` prefix
   loses `max-sm:hidden`, so phones show "UQAb…xyz1 · Disconnect" as wider screens already do. No shell
   change (the shell never renders the connected state), no new string, no change to how the address is
   derived or shortened.
3. **Close the dropdown when a language is picked.** Clicking an entry closes its `<details>` before the
   navigation happens. Needed because the app island persists across ClientRouter swaps (`transition:persist`),
   so the React switcher otherwise arrives on the new page still open; closing the static instances too
   keeps all three consistent. Implemented in the React `onClick` (`LanguageSwitcher.tsx`) and in the
   existing document-delegated listener in `LanguageSwitcher.astro`, which already covers the site and
   shell instances. Picking the current language closes the panel as well. Out of scope: closing on
   outside click or Escape.

4. **Inline nav from `xl`, not `lg` (user chose option 1 for the 1024–1279 px overflow).** In both
   headers and the shell, the inline site nav, the site's "Open app" CTA and the hamburger/menu switch at
   `xl` instead of `lg`, so 1024–1279 px gets the same bar as tablets (logo · switcher · hamburger, plus
   Connect on dApp pages; the site CTA stays in the menu below `xl`). With the room that frees, Amendment 1's globe-only band (`lg:max-xl:sr-only`) is dropped —
   the full name shows from `sm` up. The dApp's bottom tab bar stays `lg:hidden` (unchanged): between
   `lg` and `xl` the menu carries the same links. Cost, accepted: every locale, English included, gets the
   hamburger at 1024–1279 px.

### Amendment 2 acceptance criteria

- [ ] All ten locales × `/faq/`, `/stake/` × 320/360/375/640/768/1024/1100/1280: no document overflow, one
      header switcher, no wrapped label, the first row's last item inside the content box.

- [ ] `/stake/` at 375 and 320 px (en, ru, fa): the row-2 Connect spans the header's content box
      (left/right edges equal the row's content edges); shell vs hydrated still 0 px at 375.
- [ ] ≥ 640 px: Connect/Disconnect unchanged (natural width, single row).
- [ ] After picking a language in each switcher (site header, dApp header hydrated, shell with island JS
      blocked, footer), the destination page shows the switcher closed; picking the current language closes
      the panel without navigating anywhere new.
- [ ] **Manual, needs a wallet:** at 375 px on `/stake/`, after connecting, row 2 shows the short address +
      "Disconnect" on one line, full width, and it disconnects.

## Amendment 3 — docs on phones (2026-09-19, approved)

Reported by the user after reviewing Amendment 2: on `/docs/` at phone widths the language select is still
in the hamburger menu (Starlight's `MobileMenuFooter`), and choosing a language there does nothing.

### Root cause of "does nothing"

`src/components/starlight/LanguageSelect.astro` is rendered twice per docs page — in our `Header.astro`
(inside `nav.sl-hidden md:sl-flex`, so hidden on phones) and in Starlight's `MobileMenuFooter`, which
imports the same virtual component. Each copy carries an inline `<script>` that defines the
`starlight-lang-select` custom element once, and the element wires its `<select>` in the **constructor**.
The header copy comes first: its script runs after its own `<select>` is parsed, and `define()` upgrades
it — it works (desktop). The menu copy is parsed _after_ the element is defined, so the parser runs its
constructor as soon as it creates the tag, **before its children exist**; `querySelector('select')` returns
`null` and no `change` listener is attached. Starlight's original avoids this because its script is a
deferred module. Only the phone copy is affected, which is why desktop tested fine.

### Fix

1. **Wire the select by delegation, not in the constructor.** The inline script (still emitted only when
   the select is shown) installs, once per document, a `change` listener on `document` for
   `starlight-lang-select select` that sets `location.pathname` to the chosen value, and a `pageshow`
   handler that resets every such select's index on a bfcache restore. No custom-element constructor
   remains to run before its children exist.
2. **Phones: move the select out of the menu into the header bar**, matching the site and dApp headers.
   - `LanguageSelect.astro` renders only when our `Header.astro` passes a `placement` prop, so the
     `MobileMenuFooter` instance (which passes none) renders nothing — the menu keeps its theme/social
     row as today.
   - `Header.astro` renders two placements: `placement='bar'` in the existing `md:` nav (desktop,
     unchanged: 7em Starlight `Select` with full names), and `placement='phone'` between the title and
     search, visible below `md` only.
   - The phone placement is a **compact trigger**: globe icon + upper-case code (`localeCode()`, `PT` for
     `pt-br`) + chevron, painted as a label, with the real native `<select>` laid transparently over it
     (same size, `opacity: 0`). Tapping opens the OS picker with the **full language names**; the select
     keeps Starlight's accessible label and its selected option is the full name, so screen readers never
     hear only "RU". Styled with Starlight's tokens in the component (docs.css has no Tailwind).
   - Fit, measured before the change (free space between title and search): 73 px at 320, 113 at 360,
     128 at 375. The trigger is ~60–68 px plus the header's gaps, so it fits from 360 px; at 320 px it is
     to be measured, and if it does not fit, the chevron is dropped below 360 px — never an overflow, never
     clipping the "Hipo Docs" title.

### Amendment 3 acceptance criteria

- [ ] `/docs/`, `/ru/docs/`, `/fa/docs/`, `/pt-br/docs/` and one deep page (e.g. `/docs/<a tutorial>/`)
      at 320, 360, 375 and 768 px: the compact trigger is in the header bar, shows the right code, no
      overlap with title/search/menu, no document overflow; at ≥ `md` (800 px) the desktop select is
      unchanged and the compact one is hidden.
- [ ] Opening the hamburger menu at 375 px: no language select inside it.
- [ ] Choosing a language in the phone trigger (driven via `selectOption` on the real `<select>`)
      navigates to the same docs page in that locale — tested from `/docs/` → `/ru/docs/` and from a deep
      page, and in `/fa/docs/` → `/docs/`. Same for the desktop select at 1280 px (regression).
- [ ] Back after switching (bfcache): the select shows the page's own language again.
- [ ] Accessibility snapshot at 375: the control is a combobox named with Starlight's language label,
      value = full language name.

**Implementation notes (Amendment 3).** The phone trigger uses Starlight's `translate` icon rather than a
globe, matching the docs' own desktop select. The caret is dropped below 360 px: with it the trigger
(~52 px) clipped the title to "Hipo Doc" at 320 px; without it (~31–36 px) the full title shows. Verified
on the dev server at 320/340/359/360/375/768/800/1280 px in en, ru, fa, pt-br, id: the phone trigger is in
the bar with ≥ 12 px between items, no overflow, no select in the menu, and the desktop select alone at
≥ 800 px. Choosing a language navigated `/docs/` → `/ru/docs/`, `/docs/introduction/liquid-staking/` →
`/de/…` (phone) and `/it/…` (desktop), `/fa/docs/` → `/docs/`; after Back the select showed English
again; the accessibility tree has a combobox named "Выберите язык" with "Русский" selected.

**Follow-up (user request, same day): one look for every language control.** Both docs placements now
paint the site/app switchers' globe and chevron SVGs (not Starlight's `translate` icon), and the desktop
placement is the same painted-label-over-native-`<select>` trigger as the phone one: globe + full name +
chevron, with the two-letter code instead of the name below 900 px (at 800 px `ru`, `id` and `pt-br`
otherwise wrapped "Open app"), and the docs header links are `white-space: nowrap`. Verified on a
production build (`astro preview`) for all ten locales at 320–1280 px: no wrapped link, nothing past the
header edge, no document overflow; choosing a language navigates on phone and desktop.
