# Language preference, switcher dismissal, and the locale line-up

**Status:** implemented (Phase A and Phase B)

## Goal

Make the language switcher behave like a normal dropdown (closes when you click away or press Escape),
remember the visitor's chosen language across visits, and change the set of languages the site ships:
drop Hindi and Italian permanently, add Spanish, Ukrainian and French, move Brazilian Portuguese from
`/pt-br/` to `/pt/`, and order the dropdown
the way the user asked. Ships in **two phases**: Phase A (UX + removals) deploys on its own; Phase B
(the three new locales) follows once they are translated.

## Definitions

**Concepts**

- **Locale key / `lang`** — the URL segment (`/pt-br/`) versus the BCP-47 tag used for `<html lang>`,
  `hreflang` and `Intl` (`pt-BR`). They differ only where noted; `src/content/i18n/*.json` is keyed by
  **`lang`**, everything else by key.
- **Locale status** — `draft` (built only under `I18N_INCLUDE_DRAFTS=1`), `indexed` (built + hreflang +
  sitemap, no visible UI), `public` (also in the dropdowns). "Released" = indexed or public.
  `src/i18n/registry.mjs:1-14`.
- **The switcher** — three `<details>/<summary>` implementations plus the docs `<select>`:
  `src/components/LanguageSwitcher.astro` (site header + footer),
  `src/components/app/LanguageSwitcher.tsx` (dApp island),
  `src/components/app/shell/ShellLanguageSwitcher.astro` (the pre-hydration mirror of the island's),
  `src/components/starlight/LanguageSelect.astro` (docs, a native `<select>`).
- **The answered key** — `localStorage['hipo.locale']`, written today by every switcher pick _and_ by
  dismissing the suggestion bar. Its only meaning is "the suggestion bar has been answered, never ask
  again" (`src/scripts/banner.js:3-5`).
- **The preference key** — `localStorage['hipo.locale.pref']`, **new in this spec**: the locale the
  visitor actively chose. Written only by an explicit pick, never by a dismissal.
- **The session guard** — `sessionStorage['hipo.locale.redirected']`, **new**: set the one time the
  preference redirect fires in a browsing session.
- **The mirror rule** — `src/components/app/shell/` reproduces the island's _first-paint_ markup with
  classes copied verbatim; a divergence shows as the page shifting when React mounts.
- **Meta-refresh stub** — what Astro's `redirects:` emits on static output: an HTML page with
  `<meta http-equiv="refresh">` and `noindex`. GitHub Pages cannot serve a 301
  (`astro.config.mjs:305-321`).

Protocol terminology (GRAM, hGRAM, staking terms) is governed by `src/i18n/GLOSSARY.md`.

**Formula parameters** — None. This change computes no amounts. It does, however, add locales whose
number _formatting and parsing_ the stake/unstake amount input depends on — see Risks.

## Context

- The switchers are native `<details>`. **There is no outside-click, Escape or focus-out handling
  anywhere** — `specs/language-switcher-rollout.md:376` records it as deliberately out of scope in
  Amendment 2. An open panel stays open until the summary is clicked again or an entry is picked.
- A single document-delegated `click` listener in `src/components/LanguageSwitcher.astro:92-109` closes
  the picked panel and writes `hipo.locale`. It covers the site, footer and shell instances (they carry
  `data-locale`); the React island uses its own `onClick`
  (`src/components/app/LanguageSwitcher.tsx:70-75`) to do the same two things.
- **`hipo.locale` is never read by any switcher** — only by `banner.js:58`, to suppress the suggestion
  bar. So the choice is stored today and has no effect on a later visit. That is the gap this spec
  closes.
- The docs `<select>` (`src/components/starlight/LanguageSelect.astro:36-53`) navigates via
  `window.location.pathname = select.value` and **writes nothing** — picking a language in the docs does
  not even suppress the suggestion bar today.
- `specs/multi-language-site.md` §J says "**No automatic redirect** on the public web". This spec
  narrows that, deliberately, and records a new decision for it. Decision 1's "**No CJK**" stands:
  Chinese was considered for Phase B and dropped — see the Phase B section.
- Dropdown order is registry key order (`publicLocales()` → `Object.keys`), so the requested order is a
  registry reorder. Registry order also determines `hreflang` link order and sitemap chunk order — both
  cosmetic.
- Everything else about a locale is registry-driven: routes, hreflang, `og:locale:alternate`, sitemap
  chunks and the `indexableLocales().length × 3` sitemap-count assertion (`astro.config.mjs:44`),
  Starlight locales, all four switchers. Removing or adding a registry line propagates automatically.
- Search Console, 2026-08-21 → 2026-09-17 (analysis of the exports in `~/develop/HipoFinance/seo`):

  |                          | `/hi/` | `/it/` |
  | ------------------------ | ------ | ------ |
  | URLs with impressions    | 8      | 26     |
  | Impressions              | 20     | 77     |
  | **Clicks**               | **0**  | **2**  |
  | Average position         | 60.6   | 23.5   |
  | Never-crawled URLs freed | 9      | 10     |

  Hindi is the floor on every measure; Italian is mid-pack (15 of its URLs rank in the top 10) but
  Italian-language _demand_ is near nil — 5 Italian-string impressions and 0 clicks in the whole window,
  and about half of Italy's clicks land on English pages. Removing it is the user's call, taken
  knowingly; see Risks.

## Approach

### Phase A — switcher UX, preference memory, and the two removals

**1. Close on outside click and Escape.** Extend the one document-delegated listener in
`LanguageSwitcher.astro`'s hoisted script — it already owns every `<details data-i18n-switcher>` on the
page, the React island's included, so no new script and no React state:

- on `click`, after the existing pick handling, remove `open` from every `[data-i18n-switcher][open]`
  that does **not** contain the event target (clicking a summary is inside its own panel, so it still
  toggles normally, and clicking a second switcher closes the first);
- on `keydown` with `Escape`, close every open panel and return focus to its `<summary>`;
- on `focusin`, close every open panel that does not contain the newly focused element, so tabbing away
  closes it too.

Rejected: per-component React state (`useState` in `LanguageSwitcher.tsx`) — it would desync from the
DOM `open` attribute the existing code already manipulates, and would not cover the Astro instances.
The docs `<select>` needs nothing: it is the OS picker.

**2. Remember the language and honour it once per session.**

- Every explicit pick writes **both** keys: `hipo.locale` (unchanged meaning) and the new
  `hipo.locale.pref`. Dismissing the suggestion bar keeps writing `hipo.locale` only — so a dismissal
  never turns into a redirect. The docs `<select>` starts writing both, closing the gap above.
- A new `src/components/LocalePreference.astro` renders one small `is:inline` script into `<head>`,
  from `SEO.astro` (landing/app/HPO layouts) and from `src/components/starlight/Head.astro` (docs) —
  the same two places `FontPreload` is wired into. It runs before paint, so there is no flash.
- Logic: if the session guard is unset, a preference exists, it is a currently public locale, and it
  differs from this page's locale, set the guard and `location.replace()` the same path in the preferred
  locale, preserving query and hash. Everything is wrapped in `try/catch` (blocked storage ⇒ do
  nothing).
- **Once per tab** (`sessionStorage` is per-tab), so a deliberately opened link in another language
  stays readable after the first bounce. `location.replace` adds no history entry, so Back still leaves
  the site. Landing on a page already in the preferred language marks the tab settled too, which is what
  stops Back from bouncing forward again straight after a pick.
- The script is rendered only where localized twins exist, reusing `SEO.astro`'s `localized` prop —
  the same gate as the hreflang cluster. (That prop's comment claimed `/vs/` passes `localized={false}`;
  it does not, and `src/pages/[locale]/vs.astro` gives it twins in every locale, so `/vs/` redirects
  like any other page. No page passes `false` today. Comment corrected.) `/app/` does not use
  `SEO.astro` at all. It additionally bails inside the
  Telegram Mini App, detected with all four signals `probeTmaMode()` uses (`window.__hipoTma`,
  `sessionStorage['hipo.tma']`, `sessionStorage['__telegram__initParams']`, the `tgWebApp…` launch
  fragment), because TMA URLs carry no locale prefix and `Model.applyTelegramLocale` owns the language
  there. `__telegram__initParams` is the one that still identifies the webview on a `/docs/` or `/faq/`
  deep link, where `__hipoTma` is never set and the fragment is gone.
- The script is told the public locale keys and this page's locale via `define:vars`; it derives the
  target path by stripping a leading known key and prefixing the preferred one — the same rule as
  `localizedPath`/`stripLocale`, duplicated in the client the way `banner.js:27-51` already duplicates
  `matchLocale`. Rejected: inlining a full per-locale href map (≈700 B on every page) — the key list is
  ~60 B.
- **SEO:** crawlers never have the key, so `hreflang`, canonicals and what Googlebot sees are unchanged.
  This is a returning-visitor preference, not language detection from IP or `Accept-Language`, which is
  what Google warns about.

**3. Reorder the registry** to the requested dropdown order, with Phase B's locales slotted in at their
final positions:

`en, ru, es*, id, pt, fa, ar, tr, uk*, de, fr*` (`*` = added in Phase B; `pt` is today's `pt-br`)

Phase A therefore ships `en, ru, id, pt-br, fa, ar, tr, de`.

**4. Remove `hi` and `it` permanently.** Registry line and the locale's 131 content files must land in
the **same commit**: `src/content.config.ts:13-21` only treats a first path segment as a locale when
`isLocaleKey()` is true, so leaving `src/content/docs/hi/` behind after the registry line goes would
publish 44 untranslated-looking English pages at `/docs/hi/…`. Hindi additionally drops two font
packages, five `@font-face` blocks and 16 selftest assertions; Italian is Latin and needs no font or
test change.

**5. Redirect stubs: three for Italian, none for Hindi.** Hindi has zero clicks and no link equity — its
URLs 404, as the handoff recommends. Italian gets meta-refresh stubs for the only three URLs with
meaningful visibility, each pointing at its English equivalent:

| From                                       | To                                      |
| ------------------------------------------ | --------------------------------------- |
| `/it/docs/`                                | `/docs/`                                |
| `/it/docs/giveaways-and-prizes/hipo-club/` | `/docs/giveaways-and-prizes/hipo-club/` |
| `/it/`                                     | `/`                                     |

The other 23 Italian URLs (1–3 impressions, no clicks) 404. Stubs may only be added **after** the locale
stops building, or Astro raises a prerender conflict (`astro.config.mjs:305-312`).

### Phase B — add `es`, `uk`, `fr`, and move `pt-br` to `pt`

One batch of three, the minimum the batch rule allows (decision 14). Registry entries start at `draft`,
flip to `public` together once `check-i18n` reports 100 % for all three — straight to `public` rather
than via `indexed`, following the precedent of decision 15.

| Key  | `lang` | `dir` | Label      | `tonconnect` | Fonts                                                                                                             |
| ---- | ------ | ----- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `es` | `es`   | ltr   | Español    | `en`         | none — Heebo/Fredoka `latin` covers it                                                                            |
| `fr` | `fr`   | ltr   | Français   | `en`         | none — only `Ÿ` reaches `latin-ext`, already declared                                                             |
| `uk` | `uk`   | ltr   | Українська | `en`         | reuse `ru`'s Roboto + Nunito (Є/І/Ї/Ґ are in the base cyrillic range); clone the token block, add to `PER_LOCALE` |

- Starlight ships built-in UI strings for `es`, `fr` and `uk`
  (`node_modules/@astrojs/starlight/translations/`), so each new locale needs only the three `hipo.*`
  header keys in `src/content/i18n/<lang>.json`.
- TonConnect's UI type is `'en' | 'ru'` only (`node_modules/@tonconnect/ui/lib/index.d.ts:5`), so all
  three get the English wallet modal. `uk` is set to `en`, not `ru`, deliberately.
- **Chinese was considered and dropped** (2026-09-20), so decision 1's "No CJK" stands. Every option
  cost more than the traffic justifies: `@fontsource-variable/noto-sans-sc` is 4.31 MB of woff2 across
  101 subsets with a 99 KB stylesheet and a realistic per-page pull of a few hundred KB, against a
  stated budget of two faces and ~60 KB (`src/components/FontPreload.astro:17-20`); a system stack costs
  nothing but gives Chinese no display face; and a `pyftsubset` build step cut to our own copy would be
  small but must be regenerated whenever Chinese text changes, with any missed character rendering in a
  visibly different fallback face — a staleness `check-i18n` cannot catch. Revisit only if Chinese
  traffic appears.
- **`pt-br` becomes `pt`.** Verified, not assumed: `Intl` output for `pt` is byte-identical to `pt-BR`
  (`1.234.567,89`, `20 de setembro de 2026`) because CLDR's default for bare `pt` **is** Brazilian —
  `pt-PT` is the divergent one, grouping with U+00A0 — so nothing on the amount-input surface changes.
  Starlight ships `pt.json` and already resolves `pt-BR` to it (Portuguese UI strings are in
  `dist/pt-br/docs/` today), and `matchLocale` resolves `pt`, `pt-BR` and `pt-PT` identically under
  either key. What changes is reach: `hreflang="pt-BR"` targets Brazil alone, `hreflang="pt"` offers the
  same pages to Portugal, Angola and Mozambique. The copy stays Brazilian, so the label drops to plain
  `Português`. Done inside this batch, not as its own deploy, so Google re-evaluates the cluster once.
  The three `/pt-br/` URLs with the most visibility get meta-refresh stubs to their `/pt/` twins, the
  way Italian's did; the rest 404. `/pt-br/` has 7 impressions and **0 clicks** over 28 days, so this is
  the cheapest moment it will ever have.
- Per locale: 130 hand-authored files (9 catalogs, 76 prose, 44 docs, 1 Starlight UI file) + generated
  `meta.json`; **712 translatable items, ≈33,000 source words**. Drafted per locale against
  `src/i18n/GLOSSARY.md` (which gains a style section per new locale), then
  `node scripts/check-i18n.mjs --update-hashes <locale>`. Native review stays open and is recorded later
  with `--mark-reviewed`; unreviewed is a warning, not a build failure.
- **Number-format coverage replaces what Hindi's removal costs.** `scripts/i18n-selftest.mjs` gains
  assertions for `es`/`fr`/`uk`, and `VIABLE_SHAPES` (line 474) gains `fr` — French's `Intl` group
  separator is a **narrow no-break space (U+202F)**, which the amount input must accept and round-trip;
  Spanish groups with `.` like German. This is the one money-adjacent surface in the change.

## Changes

### Phase A

- `src/components/LanguageSwitcher.astro` — extend the delegated script: outside-click, Escape and
  focus-out closing; write `hipo.locale.pref` alongside `hipo.locale`.
- `src/components/app/LanguageSwitcher.tsx` — `rememberLocale` writes both keys.
- `src/components/starlight/LanguageSelect.astro` — the `change` handler writes both keys before
  navigating.
- `src/components/LocalePreference.astro` — **new**; the pre-paint preference redirect.
- `src/components/SEO.astro` — render `LocalePreference` when `localized`.
- `src/components/starlight/Head.astro` — render `LocalePreference`.
- `src/scripts/banner.js` — the suggestion _link_ writes `hipo.locale.pref` too; the _dismiss_ button
  does not. Comment the distinction.
- `src/i18n/registry.mjs` — delete `hi:` and `it:`; reorder the remaining entries.
- Delete `src/i18n/hi/`, `src/i18n/it/`, `src/content/prose/hi/`, `src/content/prose/it/`,
  `src/content/docs/hi/`, `src/content/docs/it/`, `src/content/i18n/hi.json`,
  `src/content/i18n/it.json` — 262 files, same commit as the registry edit.
- `scripts/i18n-selftest.mjs` — delete the 16 `'hi'` assertions (lines 135, 233–234, 292–293, 308, 379,
  384, 401, 447–452, 532) and the stale `it` comments at 177 and 472.
- `src/components/FontPreload.astro` — drop the Poppins import (line 29) and the `hi:` entry (line 44);
  fix the comments at 19 and 38.
- `src/styles/i18n-fonts.css` — delete the Devanagari `@font-face` blocks (122–172) and the
  `html[lang='hi']` token block (202–207); drop `html[lang='hi'],` from the line-height rule at 218; fix
  the comments at 8, 10, 19, 210.
- `package.json` + lockfile — drop `@fontsource/poppins` and `@fontsource-variable/baloo-2`.
- `astro.config.mjs` — add the three Italian meta-refresh stubs; fix the `fa/ru/hi` comment at 311.
- `public/llms.txt` — "ten" → "eight" (lines 284, 302), drop the Hindi and Italian bullets (292, 295).
- `src/i18n/GLOSSARY.md` — drop the `hi` column (39–125), the Hindi style section (259–265), the Italian
  style section (348–382) and the Hindi example at 14.
- `src/data/lastmod.mjs:166` — the comment's `it` example.
- `specs/multi-language-site.md` — locale table, font table, goal paragraph, and **two new decision-log
  entries**: one for removing `hi`/`it`, one reversing §J's "no automatic redirect" for an explicitly
  stored preference.
- `CLAUDE.md:98` — the locale count; and `:94`, which is stale independently of this change (it lists 7
  catalogs; there are 9 — `vs.json` is missing).
- `CHANGELOG.md` + `changelog/2026-MM-DD-<slug>.md`.

### Phase B

- `src/i18n/registry.mjs` — three entries at their ordered positions, `status: 'draft'` → `'public'`;
  the `pt-br` key becomes `pt`, its `lang` `pt-BR` becomes `pt`, its label loses `(Brasil)`.
- `git mv` for the rename: `src/i18n/pt-br/` → `src/i18n/pt/`, `src/content/prose/pt-br/` →
  `src/content/prose/pt/`, `src/content/docs/pt-br/` → `src/content/docs/pt/`,
  `src/content/i18n/pt-BR.json` → `src/content/i18n/pt.json`. `meta.json` keys are relative, so they
  survive the move untouched.
- `astro.config.mjs` — meta-refresh stubs from the three most-visible `/pt-br/` URLs to their `/pt/`
  twins, alongside `REMOVED_LOCALE_REDIRECTS`.
- `src/i18n/{es,fr,uk}/` — 9 catalogs each + generated `meta.json`.
- `src/content/prose/{es,fr,uk}/**` — 76 files each.
- `src/content/docs/{es,fr,uk}/**` — 44 files each.
- `src/content/i18n/{es,fr,uk}.json` — the three `hipo.*` header keys each.
- `src/styles/i18n-fonts.css` — `html[lang='uk']` token block (clone of `ru`'s, or a grouped selector).
  Nothing for `es`/`fr`: the Latin faces already cover them.
- `src/components/FontPreload.astro` — `uk: [nunitoCyrillic, robotoCyrillic]`; `es`/`fr` fall through to
  the Latin default.
- `scripts/i18n-selftest.mjs` — format/parse assertions for the three, `fr` added to `VIABLE_SHAPES`.
- `src/i18n/GLOSSARY.md` — a style section per new locale.
- `public/llms.txt` — eleven languages, three new bullets.
- `specs/multi-language-site.md` — table rows, font table, and a decision entry recording that Chinese
  was considered and dropped (decision 1 stands).
- `CLAUDE.md`, `CHANGELOG.md` + a changelog report.

## Acceptance criteria

### Phase A

- [x] With a switcher panel open, one click anywhere outside it closes it, on `/faq/` (site header),
      the site footer, `/stake/` hydrated, and `/stake/` with the island's JS blocked (the shell mirror).
- [x] With a panel open, Escape closes it and focus lands on its `<summary>`; Tab out of the last entry
      closes it.
- [x] Clicking a switcher's own summary still toggles it; opening a second switcher closes the first.
- [x] Picking a language writes both `hipo.locale` and `hipo.locale.pref` — verified in devtools for the
      site header, footer, dApp header, shell mirror and the docs `<select>`.
- [x] Dismissing the suggestion bar writes `hipo.locale` and **not** `hipo.locale.pref`.
- [x] With `hipo.locale.pref='ru'` and empty sessionStorage, loading `/`, `/faq/`, `/stake/` and `/docs/`
      lands on `/ru/…` with no visible English flash; `sessionStorage['hipo.locale.redirected']` is `'1'`.
- [x] A second English URL opened in the same session stays English.
- [x] With no preference stored, no navigation happens anywhere (the default visitor is unaffected).
- [x] `/app/` never redirects, with any preference set (it renders no `SEO.astro`).
- [x] `?tma=1` on `/stake/` with a preference set does not redirect.
- [x] With `localStorage` throwing (blocked storage), every page still renders and nothing navigates.
- [x] Back from a redirected page leaves the site rather than bouncing.
- [x] The dropdown lists exactly, in order: English, Русский, Bahasa Indonesia, Português (Brasil),
      فارسی, العربية, Türkçe, Deutsch.
- [x] `npm run build` completes (`check-i18n` runs as `prebuild`) and
      `node --experimental-strip-types scripts/i18n-selftest.mjs` passes.
- [x] `dist/hi/`, `dist/docs/hi/` and `dist/docs/it/` do not exist, and `dist/it/` holds nothing but the
      three stub files below. (Reworded during implementation: the original wording said `dist/it/`
      must not exist, which contradicts the stub criterion two lines down.)
- [x] `grep -r 'hreflang="hi"\|hreflang="it"' dist/` returns nothing.
- [x] `dist/sitemap-index.xml` lists **24** sitemaps and no `sitemap-hi-*` or `sitemap-it-*`.
- [x] `dist/it/docs/index.html`, `dist/it/docs/giveaways-and-prizes/hipo-club/index.html` and
      `dist/it/index.html` exist as meta-refresh stubs carrying `noindex`, and no other `/it/` path does.
- [~] Screenshots of `/`, `/faq/`, `/stake/`, `/docs/` at 375 px and 1280 px, plus the dropdown open at
  both widths, reviewed by eye: nothing shifted, the panel stays inside the viewport, eight entries.
  **Not** diffed pixel-wise against a `main` build — the only markup added is a head script and a
  `data-locale` attribute, and the dropdown is two entries shorter by design.

### Phase B

- [x] `node scripts/check-i18n.mjs` reports 100 % (712/712) for `es`, `fr` and `uk`, 0 missing,
      0 placeholder mismatches.
- [x] `npm run build` completes with all eleven locales; `dist/sitemap-index.xml` lists **33** sitemaps.
- [x] The dropdown lists exactly the eleven labels in the requested order.
- [x] `/es/`, `/fr/`, `/uk/` render with correct `<html lang>` and a hreflang cluster naming all eleven.
- [x] `/pt/` serves what `/pt-br/` served, `<html lang="pt">`, and every locale's hreflang cluster names
      `pt` and not `pt-BR`. `dist/pt-br/` holds nothing but the three stub files.
- [x] `node -e` comparison shows `Intl.NumberFormat('pt')` and `('pt-BR')` still agree on
      `1234567.89`, and `/pt/stake/` formats amounts exactly as `/pt-br/stake/` did before the move.
- [x] `node scripts/check-i18n.mjs` still reports 100 % for `pt` after the rename, with no
      `--update-hashes` run (the hashes are of English sources and the relative keys are unchanged).
- [~] `/es/docs/`, `/fr/docs/` and `/uk/docs/` show **Starlight's own** UI strings translated. The
  **Pagefind search box** is still English in ten of the eleven locales: Starlight ships the
  `pagefind.*` keys only for `es`. Pre-existing across the site (`ru`, `id`, `pt`, `fa`, `ar`, `tr`,
  `de` have had it since launch), not introduced here — see the changelog's follow-ups.
- [x] `/uk/` preloads the same two Cyrillic woff2 files `/ru/` does. Character audit of the whole `uk`
      corpus: Є/є 1,288, І/і 8,099, Ї/ї 630 occurrences — all inside `U+0400-045F`, which both faces
      declare. **Ґ/ґ, ₴ and № do not occur at all**, so nothing reaches cyrillic-ext; the apostrophe is
      U+2019 and renders from the Latin face, exactly as `ru`'s « » already do.
- [x] `i18n-selftest` passes with the new assertions; on `/fr/stake/` typing `1234567,89` and pasting
      `1 234 567,89` (narrow no-break space) both yield the same amount, and the displayed fee lines
      match `Intl` output for `fr`.
- [x] `code-reviewer` ran on the Phase B diff: no correctness, money or boundary defect. Its three
      actionable findings (a selftest comment claiming coverage it did not provide, a stale Latin-locale
      list, and a `pt-br` preference left inert by the rename) were fixed. `money-auditor` — see below.

## Risks & rollback

- **Italian is a real, if small, loss.** 2 clicks and 26 URLs with impressions over 28 days, 15 of them
  ranking in the top 10 — unlike Hindi, Google is indexing Italian successfully. Removal is permanent
  (the translations are deleted); rollback means re-translating. Detection: watch Search Console for a
  drop beyond ~2 clicks/28 days. Mitigated by the three stubs; accepted as the user's explicit decision
  to cut translation and crawl cost.
- **The `/docs/<removed>/` hazard.** If the content deletion and the registry edit ever land apart, 44
  English pages appear at `/docs/hi/…` with wrong `lang` and no noindex. Detection: the
  `dist/docs/hi/` criterion above. Same commit, always.
- **The redirect is new behaviour on every page.** A bug here sends visitors to the wrong language, or
  loops. Mitigations: it runs only when an explicit preference exists (so no visitor who never touched
  the switcher is affected), it fires at most once per session, and it uses `location.replace`.
  Rollback is deleting one component and two render sites.
- **The client-side path derivation duplicates `localizedPath`.** If either drifts, the redirect could
  target a 404. Covered by the cross-locale acceptance criteria and by a replay of the rule over every
  built page in every public locale; the duplication is bounded to stripping and adding one path segment.
- **Visitors who already picked a language are not migrated.** They have `hipo.locale` but no
  `hipo.locale.pref`, so nothing happens for them until they pick again. Deliberate and unavoidable:
  `hipo.locale` is also what a _dismissal_ wrote, so the two cannot be told apart after the fact, and
  guessing would bounce people who never chose anything.
- **Moving `/pt-br/` to `/pt/` spends crawl budget**, which is this site's binding constraint: 64 URLs
  move, and GitHub Pages cannot 301 — only meta-refresh stubs. Against that, `/pt-br/` earns 0 clicks
  and 32 of its pages have never been crawled at all, so there is very little to lose and the wider
  `hreflang="pt"` is the upside. Detected by watching `/pt/` pages enter the index over the weeks after
  the batch; reversible by renaming back, at the same cost again.
- **Italian-convention visitors move onto English number rules.** `it` used `,` as the decimal and `.`
  as the group separator; English is the reverse. With `/it/` gone, an Italian speaker reading the
  English page who types `1,500` meaning one-and-a-half gets 1500, and `1.500` meaning fifteen hundred
  gets 1.5 — a 1000× error in either direction, bounded by the wallet balance. This is not new code: it
  is the same exposure every German, Turkish, Indonesian and Brazilian visitor already has on the
  English page, and the amount field rewrites itself to the canonical form on blur
  (`Model.normalizeAmount`), before the stake button can be pressed. It is the cost of withdrawing a
  locale, and it is accepted knowingly. Italian was only in the language switcher for one day
  (2026-09-19 → 2026-09-20).
- **French/Spanish number parsing** touches the amount input, which is money-adjacent. Guarded by new
  selftest assertions and a `money-auditor` pass on the Phase B diff.
- **Reordering the registry** changes `hreflang` link order and sitemap chunk order. Both are unordered
  sets to crawlers; the diff is large but cosmetic.
- Rollback for either phase is a single `git revert`; nothing is stored server-side. Note that a
  deployed preference key persists in visitors' browsers after a revert — the reverted build simply
  never reads it.

## Open questions

None.
