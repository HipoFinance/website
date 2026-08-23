# Multi-language support for hipo.finance (LTR + RTL)

**Status:** implemented (2026-08-23; fa, ru, hi translated to 100 % and flipped to `indexed` pending native review; browser/RTL acceptance criteria still to be run — see the unticked boxes and `changelog/2026-08-22-multi-language-site.md`)

## Goal

Serve every section of the site — landing (`/`, `/faq/`), the staking dApp (`/stake/` … `/defi/`), the HPO
page and the docs — in ten languages (English plus Persian, Russian, German, Hindi, Turkish, Italian,
Indonesian, Brazilian Portuguese, Arabic), including the two right-to-left ones, without changing a single
existing English URL. English stays the source of truth; adding a language must be mostly a translation
task, not an engineering one.

## Context

Everything below was read from the repo on 2026-08-22 (Astro 6.4.8, Starlight 0.40.0, Tailwind 4.3.1,
`@tonconnect/ui` 2.4.4, GitHub Pages hosting — pure static, no server redirects or `Accept-Language`).

**No i18n exists today.**

- `<html lang='en'>` is hardcoded in `src/layouts/LandingLayout.astro:30`, `HpoLayout.astro:30`,
  `AppLayout.astro:38`, `src/pages/404.astro:6`, `src/pages/app/index.astro:11`. No `dir` attribute, no
  `hreflang`, no `og:locale`, no `inLanguage` in JSON-LD (`src/components/SEO.astro`). `astro.config.mjs`
  has no `i18n` block and the sitemap has no `i18n` option.
- Copy volume (English): `Landing.astro` ~335 words; `FAQ.astro` 67 `<details>` Q&As in 10 sections,
  ~3,260 words, each with a hardcoded English anchor id (`id='what-is-hipo'`); `Hpo.astro` ~890 words incl.
  9 numbered FAQ items; the five app-shell pages `src/pages/{stake,unstake,rewards,stats,defi}/index.astro`
  ~100–220 words each in 3–5 explainer cards plus `FAQPage` JSON-LD with hardcoded Q&As and absolute
  `https://hipo.finance/<page>/` URLs; `SiteHeader`/`SiteFooter`/`Banner`/`AppLayout` ~40 nav/label strings
  with hardcoded root-relative hrefs.
- The dApp island (`src/components/app/`) has ~30 user-facing strings in `Model.ts` (errors, button
  labels, composed strings such as `'1 hGRAM = ~ ' + rate + ' GRAM'` at `Model.ts:782`) and ~250 across the
  `.tsx` files (`Header` ~22, `StakeUnstake` ~33, `Reward` ~27, `StatsPage` ~35, `tma/*` ~33, charts ~18 …).
  No plural forms anywhere. `AppIsland` takes no props and must stay that way (`transition:persist`).
- Route table: `Model.ts:171-177` matches the five absolute paths exactly; `navigateToPath`
  (`Model.ts:1184`) calls Astro `navigate()`; state syncs on `astro:page-load` (`Model.ts:482`).
- Number formatting is a mix of `toLocaleString(undefined | navigator.language | 'en' | 'en-US', …)`
  (`Model.ts:1934-2032`, `StatsPage.tsx:91-123`, `Reward.tsx:153`, `landing-data.js`, `hpo-data.js`).
  **This is a live bug:** a visitor with a `fa-IR` browser already sees `۱٬۰۵۰٫۵` on the English site while
  the input field and the English copy use `1,050.5`. Amount inputs do `value.replace(/,/g, '.')` →
  `toNano()` (`StakeUnstake.tsx:121`, `tma/TmaStakeUnstake.tsx:74`), which accepts ASCII digits and `.` only.
  A locale-aware `NumberParser` built on `Intl.NumberFormat().formatToParts` already exists, commented out,
  at `Model.ts:1910-1932`.
- `TonConnectUI` is constructed without `language` (`Model.ts:1821-1868`); the SDK supports only
  `'en' | 'ru'`. Its modal is rendered with goober styles and would inherit `dir` from `<html>`.
- Directional CSS: no logical utilities anywhere. Physical ones: ~27 `ml-auto` label/value rows in the
  island, `pl-3`, `pr-4`×4, `mr-auto`, `text-left` (chart table), two fixed toasts pinned to opposite edges
  (`ErrorDisplay.tsx:12` `left-6`, `LoadingIndicator.tsx:12` `right-5`), a tooltip
  `left-1/3 -translate-x-1/4` (`StakeUnstake.tsx:273`), and 13 hits outside the island (`FAQ.astro` `pl-6`×3,
  `Hpo.astro` `ml-auto`×2, `Landing.astro` `lg:text-left`×2, `Banner.astro` `right-3`, two `pl-5` lists).
  `charts/LineChart.tsx` positions its tooltip with `left: clamp(pointerPos.x …)` from `e.clientX` (`:286`,
  `:610`) — physical on purpose. Direction-meaningful glyphs: lucide `ArrowRight` (`StakeUnstake.tsx:252`),
  text `→` in `Stats.tsx:55` and `StatsPage.tsx:316-327`.
- Fonts: Heebo (subsets hebrew, latin, latin-ext, math, symbols) and Fredoka Variable (hebrew, latin,
  latin-ext). Latin-ext covers German, Turkish, Italian, Indonesian and Portuguese. **Neither face has
  Arabic/Persian, Cyrillic or Devanagari glyphs.** Tokens are declared three times: `src/styles/global.css:8-13`,
  `app.css:47-52`, `docs.css:41` (`--sl-font`). Verified on npm (all 5.3.0): `@fontsource-variable/vazirmatn`,
  `@fontsource-variable/rubik`, `@fontsource-variable/comfortaa`, `@fontsource-variable/baloo-2`,
  `@fontsource-variable/baloo-bhaijaan-2`, `@fontsource/hind`, `@fontsource/lalezar`,
  `@fontsource-variable/noto-sans-devanagari`.
- Docs: 40 Markdown pages (~10.7k words) under `src/content/docs/`; `src/content.config.ts:10` prefixes
  every entry id with `docs/`. Starlight detects a locale from the **first** id segment
  (`node_modules/@astrojs/starlight/integrations/shared/slugToLocale.ts:14`), so `src/content/docs/fa/x.md`
  would today become `/docs/fa/x/` and _not_ be recognised as Persian. Starlight ships complete UI
  translations for 34 languages incl. `ar`, `de`, `fa`, `hi`, `id`, `it`, `pt`, `ru`, `tr` (no `pt-BR` —
  verify it falls back to `pt`), sets `<html lang dir>` itself, uses logical CSS throughout, localises
  sidebar `link:` values automatically (`utils/navigation.ts:121-127`), emits its own `hreflang`/`og:locale`,
  and synthesises an English **fallback page for every untranslated doc in every locale** with no opt-out
  (`utils/routing/index.ts:52-78`). Starlight throws if both Astro `i18n` and Starlight `locales` are
  configured (`utils/i18n.ts:33-37`); when only Starlight `locales` is set it generates Astro's `i18n`
  config (`prefixDefaultLocale: false`, `fallbackType: 'redirect'`). Our
  `src/components/starlight/Header.astro` override hardcodes `/faq/`, `/stats/`, `/stake/` and dropped
  Starlight's `LanguageSelect` from the desktop bar. `scripts/import-gitbook-docs.mjs` `rm -rf`s
  `src/content/docs` when run.
- Verified by a throw-away build spike during this investigation: `src/pages/[locale]/**` routes coexist
  with Starlight's root `[...slug]` route (Astro ranks a plain dynamic segment above a rest segment);
  `/fa/` can never be claimed by Starlight because no entry id can be exactly `fa` under the new
  `generateId`; `@astrojs/sitemap`'s `i18n` option groups `/x/` with `/fa/x/` correctly when `en` is listed
  as a key even though `/en/` never exists; Tailwind 4 provides `ms-/me-/ps-/pe-/start-/end-/text-start`
  and the `rtl:` variant (`&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)`); `space-x-*`/`divide-x` already
  use `margin-inline`/`border-inline` in v4. `astro:i18n` helpers throw on import when no `i18n` config
  exists, so the site must not depend on them. Astro's `ClientRouter` re-applies all `<html>` attributes
  from the incoming document on swap, so a server-rendered `lang`/`dir` survives view transitions. Today's
  build: 6.7 s, 50 pages, 14 MB.

## Approach

### A. URL scheme and the locale registry

- English stays unprefixed (`/`, `/faq/`, `/stake/`, `/docs/…`). Every other locale is a path prefix for the
  **whole** site: `/fa/`, `/fa/faq/`, `/fa/stake/`, `/fa/docs/tutorials/staking/`. No `/en/` is ever built.
  _Rejected: prefixing English too (`/en/…`) — breaks every existing URL, backlink and wallet listing._
- One registry, `src/i18n/registry.mjs` (`.mjs` so `astro.config.mjs`, scripts and TS all import it). The
  key is the URL segment; `lang` is the BCP-47 tag used for `<html lang>`, `hreflang` and `Intl`:

  | key     | lang    | dir | label              | tonconnect | status at v1 |
  | ------- | ------- | --- | ------------------ | ---------- | ------------ |
  | `en`    | `en`    | ltr | English            | en         | public       |
  | `fa`    | `fa`    | rtl | فارسی              | en         | first batch  |
  | `ru`    | `ru`    | ltr | Русский            | ru         | first batch  |
  | `ar`    | `ar`    | rtl | العربية            | en         | second batch |
  | `de`    | `de`    | ltr | Deutsch            | en         | draft        |
  | `hi`    | `hi`    | ltr | हिन्दी             | en         | first batch  |
  | `tr`    | `tr`    | ltr | Türkçe             | en         | draft        |
  | `it`    | `it`    | ltr | Italiano           | en         | draft        |
  | `id`    | `id`    | ltr | Bahasa Indonesia   | en         | draft        |
  | `pt-br` | `pt-BR` | ltr | Português (Brasil) | en         | draft        |

  `status` is one of `'draft'` (built only when `I18N_INCLUDE_DRAFTS=1`, local preview, so half-finished
  translations can land on `main` safely), `'indexed'` (built, linked for crawlers only — `hreflang`,
  sitemap — with **no visible language UI**) and `'public'` (also listed in the language dropdown). "Released"
  below means `indexed` or `public`; the dropdown renders only when at least one locale is `public`
  (decision 13, §L). A registry key may never equal
  a top-level route segment (`docs faq stake unstake rewards stats defi hpo app og images pagefind _astro`)
  — asserted at import time.

- Helpers in `src/i18n/locale.ts`: `localeOf(Astro)` (= `Astro.params.locale ?? 'en'`),
  `localizedPath(path, locale)`, `stripLocale(pathname)`, `localeParams()` (for `getStaticPaths`, released +
  optional drafts, never `en`). The site never relies on `Astro.currentLocale` or `astro:i18n`, so it
  behaves identically before and after Starlight's locale config is switched on (phase 4).

### B. Per-locale routes for Astro pages

- Each page's body moves into a shared component (`src/components/pages/StakePage.astro` etc.; `Landing`,
  `FAQ`, `Hpo` already are). Thin route files: the existing `src/pages/<page>/index.astro` (English) and a
  new `src/pages/[locale]/<page>/index.astro` with `export const getStaticPaths = localeParams` — nine
  files of ~6 lines. Layouts read the locale via `localeOf(Astro)` and set `<html lang={…} dir={…}>`.
  _Rejected: a single `src/pages/[...locale]/<page>.astro` per page (works except for `/`, where it collides
  with `index.astro`; less explicit); duplicating page directories per locale (drift)._
- **No fallback pages anywhere in production.** A locale is released only when its UI catalogs, prose
  collection and docs are 100% translated (decision 4); the check script (§I) fails the build otherwise.

### C. Where strings live

Two mechanisms, chosen by shape of the text:

1. **JSON catalogs + `t()`** for everything that is a label, heading, sentence or short paragraph inside
   designed markup: navigation, buttons, aria-labels, errors, the entire island, landing sections, the HPO
   page's hero/cards/tokenomics labels, SEO titles/descriptions.
   `src/i18n/<locale>/{site,landing,hpo,seo,app}.json`, flat dotted keys (`landing.how.step1.title`).
   `src/i18n/t.ts` exports `getT(locale)`: missing keys fall back to English (never a raw key); `{name}`
   interpolation; keys are typed from the English catalog for autocomplete. Values may contain a restricted
   inline-HTML subset (`a strong em code br`) rendered through `tHtml()`, which also prefixes root-relative
   `href="/…"` with the locale. No plural machinery — there are no plural strings today; add
   `Intl.PluralRules` the day one appears. _Rejected: i18next/react-i18next (runtime dependency in the
   island for features we don't use); putting long prose in JSON (translators editing escaped HTML)._
2. **A Markdown `prose` content collection for all long-form copy** (decision 7):
   `src/content/prose/<locale>/faq/<section>/<anchor-id>.md` (67 entries, frontmatter
   `{ section, order, question }`, answer as body), `…/hpo-faq/<n>-<slug>.md` (9 entries),
   `…/shell/<page>/cards/<n>-<slug>.md` (explainer cards, frontmatter `{ order, title }`) and
   `…/shell/<page>/faq/<n>-<slug>.md` (the Q&As that feed `FAQPage` JSON-LD — generated from these entries
   instead of being hand-written per locale). Anchor ids stay the English slugs in every locale (stable
   deep links). Internal links are locale-prefixed by the same remark plugin used for the docs (§G).
   English moves into the collection first so there is one rendering path; `/faq/`, `/hpo/` and the five
   shell pages are rebuilt from it.

### D. The persisted React island

- `AppIsland` still takes no props. `AppLayout.astro` inlines the page's app catalog as
  `<script type="application/json" id="i18n-app">` (≈4–5 KB gzip, omitted for English). Because that tag
  lives in the static shell that `ClientRouter` swaps, a `/stake/` → `/fa/stake/` transition delivers the
  new catalog to the persisted island with no request and no bundle growth per locale. English is bundled
  in the island as the compile-time fallback.
- `Model.ts` gains `@observable locale` and `@observable.ref catalog`, read from
  `document.documentElement.lang` + the JSON tag in `init()` and on **`astro:after-swap`** (before paint —
  `astro:page-load` would show one frame in the old language), plus `t(key, params)` and
  `localizedPath()`. Every `mobx-react-lite` observer re-renders on locale change for free. The route table
  strips a leading registry key before matching; `navigateToPath` prefixes `model.locale`.
- TonConnect: `tonConnectUI.uiOptions = { language: registry[locale].tonconnect }` (`'ru'` for `ru`, else
  `'en'` — the SDK has nothing else). The widget root and the two body-level portals that
  `keepRuntimeStyles` already tracks get `direction: ltr` so the modal never mirrors. `manifestUrl` stays the
  unprefixed `https://hipo.finance/tonconnect-manifest.json`.
- Telegram Mini App: the static shell is hidden in TMA mode and the URL is fixed by BotFather, so the
  island may override `locale` from `WebApp.initDataUnsafe.user.language_code` (if it is a released
  locale) without navigating. Phase 5.

### E. Numbers, dates, durations — native conventions per locale (decision 2)

- **Every displayed number follows the locale's own `Intl` conventions: digits, grouping and decimal
  symbols, percent and currency placement, compact notation** — `Intl.NumberFormat(lang, …)` in one module,
  `src/i18n/format.ts`, replacing the current mix in `Model.ts`, `StatsPage.tsx`, `Reward.tsx`,
  `landing-data.js`, `hpo-data.js`. Persian therefore shows `۱٬۲۳۴٫۵ GRAM`, `۳٫۲٪`, `۱٫۲ میلیون`; Russian
  `1 234,5`; German `1.234,5`; Hindi `12,34,567` (lakh grouping, Latin digits); Arabic follows `ar`
  defaults (Arabic-Indic digits, decision 10). USD prices use `style: 'currency'` so the sign
  lands where the locale puts it. Units (`GRAM`, `hGRAM`, `HPO`, `TON`) stay Latin.
  _Trade-off accepted: wallets and explorers show ASCII digits, so a Persian user compares `۱٬۲۳۴٫۵` on
  our page with `1,234.5` in Tonkeeper. Addresses and tx hashes are never transformed._
- **Inputs** accept both native and ASCII digits and any separator the locale uses: the commented-out
  `NumberParser` (`Model.ts:1910`) is revived — it learns the locale's group/decimal symbols from
  `formatToParts` and maps U+0660–0669 / U+06F0–06F9 digits, `٫`, `٬`, `،`, NBSP/NNBSP and bidi marks to
  an ASCII `1234.5` that `toNano()` accepts. The field displays the locale's digits (controlled input:
  model keeps the ASCII string, the view renders it through `formatInput(locale)`); "Max" writes a localized
  string into the field. Inputs get `dir="ltr"` with `text-align: start`.
- **Dates** use `Intl.DateTimeFormat(lang, …)` with the locale's default calendar and numbering system.
  For `fa` that means the **Jalali calendar with Persian digits** (e.g. ۳۱ مرداد ۱۴۰۵), including on-chain
  timestamps (decision 9). Chart time axes and tooltips follow the same rule.
- **Durations/countdowns** come from catalog templates (`format.duration.hm = "{h}h {m}m"`, Persian
  `"{h} س {m} د"`), with numbers formatted by `format.ts`; no `Intl.DurationFormat` (unsafe in old Android
  WebViews inside Telegram).
- Static numbers in copy (`1,000,000,000 HPO`, step numbers, dates like "Apr 2025") are translated by hand
  inside the catalog/prose, where translators apply the same conventions.

### F. RTL layout, bidi, fonts

- `dir` is server-rendered on `<html>` by every layout from the registry; `ClientRouter` re-applies it on
  swap (the `tma` class re-add in `tma/telegram.ts:92` is the existing precedent for client-added attrs).
- Sweep physical → logical utilities: `ml-auto`→`ms-auto`, `pl-*`→`ps-*`, `pr-*`→`pe-*`,
  `text-left`→`text-start`, toasts `left-6`→`start-6` / `right-5`→`end-5`, banner `right-3`→`end-3`, tooltip
  `left-1/3 -translate-x-1/4` gains `rtl:translate-x-1/4`. Leave `space-x-*`/`divide-x` alone (already
  logical). Mirror with `rtl:-scale-x-100`: lucide `ArrowRight`, text `→`, disclosure chevrons. Do not mirror
  `▲ ▼ ✓ % $`, token icons, the mascot.
- **Charts are direction-neutral islands**: `dir="ltr"` on the chart wrapper; the SVG, right-side y-axis and
  the physically-positioned tooltip in `LineChart.tsx` are **not** converted (they are correct as-is);
  tick text, legend, tooltip labels, range labels (`24H 1W 1M 3M 1Y`) and the data table are translated and
  number-formatted per locale, with numeric table cells isolated.
- **Bidi isolation** (the #1 visible RTL defect class, still needed with native digits because units, `%`,
  `$`, `≈`, `~`, `+/−`, `▲▼` and Latin tickers are bidi-neutral or LTR): a Tailwind `@utility num
{ unicode-bidi: isolate; font-variant-numeric: tabular-nums }` (or `<bdi>`) wraps every formatted value in
  JSX; Model-composed plain strings wrap interpolated values in U+2068 FSI … U+2069 PDI (e.g.
  `'≈ ⁨' + amount + '⁩ GRAM'`). Known offenders: `±3.2%`, `▲ 3.2% over 1W`, `$1.2M`,
  `1 hGRAM = ~ 1.05 GRAM`, `Max Instant: …`, `3h 20m`, addresses, tx hashes.
- **Fonts — a dedicated body + playful display face per script** (decision 3). Proposed pairing, to be
  adopted (decision 11); swapping a family later is a package swap plus one line in `i18n-fonts.css`:

  | script                    | locales              | body                                                  | display (Fredoka role)                                                            |
  | ------------------------- | -------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
  | Latin / Latin-ext         | en de tr it id pt-br | Heebo (existing)                                      | Fredoka Variable (existing)                                                       |
  | Arabic (Persian + Arabic) | fa ar                | Vazirmatn Variable (`@fontsource-variable/vazirmatn`) | Baloo Bhaijaan 2 Variable (`@fontsource-variable/baloo-bhaijaan-2`; alt. Lalezar) |
  | Cyrillic                  | ru                   | Rubik Variable (`@fontsource-variable/rubik`)         | Comfortaa Variable (`@fontsource-variable/comfortaa`)                             |
  | Devanagari                | hi                   | Hind (`@fontsource/hind`; alt. Noto Sans Devanagari)  | Baloo 2 Variable (`@fontsource-variable/baloo-2`)                                 |

  Loading: import each family's **script subset** CSS globally in all three stylesheets — `unicode-range`
  means English visitors download zero extra font bytes (only ~300 B of CSS per family). Family order is
  swapped per locale in one place, `src/styles/i18n-fonts.css` (imported by `global.css`, `app.css`,
  `docs.css`): `html[lang="fa"], html[lang="ar"] { --font-body: 'Vazirmatn Variable', 'Heebo', …;
--font-fredoka: 'Baloo Bhaijaan 2 Variable', …; --sl-font: … }` etc. Per-script heading size/weight/
  line-height tweaks live next to it (Arabic and Devanagari need more line-height than Latin). Weights
  actually used (Heebo 300/400/500/700, Fredoka 400–700) are mirrored for each new family. No CJK in the
  locale set → no CJK plan.

### G. Docs (Starlight) — last phase, same URL scheme

- `src/content.config.ts` `generateId`: `fa/x.md` → `fa/docs/x`, `x.md` → `docs/x`, so Persian docs render
  at `/fa/docs/x/` and Starlight recognises the locale.
- `astro.config.mjs`: `starlight({ defaultLocale: 'root', locales: { root: { label: 'English', lang: 'en' },
fa: { label: 'فارسی', lang: 'fa', dir: 'rtl' }, … } })`, generated from the registry (released + drafts
  when previewing). This is the **only** i18n block in the config (Starlight generates Astro's). Our pages
  are unaffected (§A).
- Sidebar: keep the tree, add `translations: { fa: '…', ru: '…', … }` per entry, merged at config time from
  `src/i18n/<locale>/docs-sidebar.json` keyed by `link`. Links are localised by Starlight automatically.
- `src/components/starlight/Header.astro`: localise its three hrefs via `localizedPath`, labels via
  `Astro.locals.t` backed by a new `i18n` data collection (`src/content/i18n/<lang>.json`). Starlight's
  `LanguageSelect` is overridden to render nothing until a locale is `public` (it would otherwise appear in
  the docs mobile menu as soon as `locales` is configured, violating §L step 2); once switched on it is
  restored in the desktop bar and lists `public` locales only. Starlight's own UI strings for all nine languages are built in
  (`pt-BR` → verify fallback to `pt`, otherwise supply them in the `i18n` collection).
- **Fallback pages never reach production** (decision 4): a released locale must have every docs page
  translated, enforced by the check script. Starlight's fallback synthesis therefore only appears in local
  draft previews, and the earlier `noindex`/Pagefind-ignore/sitemap-exclusion mitigations are dropped.
  Translated pages are Pagefind-indexed per language automatically via `<html lang>`.
- A ~30-line local remark plugin prefixes root-relative internal links (`/docs/…`, `/stake/`, `/faq/`) in
  Markdown with the entry's locale (skips external and already-prefixed links). Shared with the `prose`
  collection.
- Screenshots in `public/docs/images/` (English UI, some with stale `TON/hTON` branding) are reused as-is
  in all locales; localized screenshots are a follow-up.
- `scripts/import-gitbook-docs.mjs` refuses to run if any locale directory exists under `src/content/docs/`.

### H. SEO

- `SEO.astro` gains: `<link rel="alternate" hreflang>` for every released locale + `x-default` → English
  (for the five shell pages, landing, FAQ, HPO); `og:locale` (bare `lang`, matching what Starlight emits)
  and `og:locale:alternate`; `inLanguage` in JSON-LD; translated `<title>`/description from `seo.json`;
  canonical stays self-referential per locale. Fix the pre-existing `name: { title }` shorthand-object bug
  in `LandingLayout`/`HpoLayout` JSON-LD while there. Shell-page JSON-LD URLs are built from the locale
  instead of hardcoded strings; `FAQPage` Q&As come from the `prose` collection.
- `@astrojs/sitemap` gets `i18n: { defaultLocale: 'en', locales: { en: 'en', fa: 'fa', 'pt-br': 'pt-BR', … } }`
  (it emits no `x-default`, hence `SEO.astro` must). `/app/` stays excluded.
- `src/pages/404.astro` stays a single file (GitHub Pages serves only `/404.html`): English by default, with
  ~15 inline lines that swap `lang`/`dir` and the six strings when the path starts with a registry key.
- The OG image (`public/og/default.png`) and `public/llms.txt` are shared by all locales unchanged
  (decision 8); `og:image` is the same URL on every page.

### I. Translation workflow (decisions 5, 6)

- English is the source of truth. Translations are produced **LLM-assisted in a Claude Code session** from
  the English source + `src/i18n/GLOSSARY.md`, then reviewed by a native speaker per locale (Persian
  in-house; others as reviewers are found). Review state and freshness are tracked per key in a sidecar
  `src/i18n/<locale>/meta.json`: `{ "<key or prose path>": { "sourceHash": "<sha1 of English value>",
"reviewed": true|false, "reviewedAt": "YYYY-MM-DD" } }`, maintained by the check script
  (`--update-hashes` after a translation pass; `--mark-reviewed <locale> <prefix>` after review).
- `scripts/check-i18n.mjs` (no deps; `prebuild`, therefore CI): per locale, diffs key sets against English
  (catalogs, `prose` entries, docs pages, `docs-sidebar.json`), checks `{placeholder}` parity and the
  allowed HTML subset, compares each `sourceHash` with the current English value. **Released locale:
  missing → build fails; stale hash → warning listed in the build log; unreviewed → warning with count.
  Draft locale: everything is a warning**, plus a coverage percentage so the team can see when a locale is
  ready to flip to `released`.
- Trade-off accepted (decision 12): because released locales must stay 100% covered, an English-only
  change to copy or docs cannot deploy until at least a (draft, unreviewed) translation exists for every
  released locale. LLM drafting makes that a same-PR step; native review may lag and is surfaced as a
  warning, never a block.
- `src/i18n/GLOSSARY.md`: do-not-translate list (Hipo, GRAM, hGRAM, HPO, TON, TVL, APY, DeFi, DAO,
  TonConnect, wallet names) and agreed renderings per locale of "liquid staking", "stake/unstake", "round",
  "validator", "instant/best-rate".
- Order of shipping: **build for all ten, ship `fa` first** (RTL, native digits, Jalali, fonts — the hardest
  axis, with an in-house reviewer), then `ru` (Cyrillic, TonConnect `ru`), then the rest as reviewers
  become available. Each further locale is a registry entry + catalogs + prose + docs + sidebar labels.

### J. Language switcher and detection (switched on per locale, after traffic — §L)

- A real-link switcher (`<a href>` per locale, `hreflang` attribute, current locale marked, a dropdown
  rather than a row of links) in `SiteHeader`, the island `Header.tsx`, the app footer nav and the
  Starlight header, all built from `localizedPath(currentPath, locale)` so it round-trips
  `/fa/docs/x/` ↔ `/docs/x/`. It lists `public` locales only and is not rendered at all while every
  non-English locale is `indexed` or `draft`. The component ships in phase 2 behind that rule so turning it
  on is a registry edit, not a code change.
- **No hidden links.** While a locale is `indexed`, the only cross-language links in the HTML are the
  `<link rel="alternate" hreflang>` tags in `<head>` and the sitemap alternates — exactly what Google
  documents for discovering translations. No `display:none` anchors: hidden links are treated as
  deceptive and are not needed.
- **No automatic redirect** on the public web (breaks shared deep links, confuses crawlers, CLS on every
  page). Later, together with the dropdown: remember the choice in `localStorage['hipo.locale']`, show a
  one-time dismissible "Read this in فارسی?" suggestion in the existing `Banner` slot when
  `navigator.languages` prefers a `public` locale, and the TMA override from §D.
- `/app/` legacy stub stays English-only and maps to root-locale URLs.

### L. Rollout strategy per locale (decision 13)

Every locale goes through the same four steps; `fa` is translated first. Step 2 onwards is done **in
batches of at least three locales** (decision 14): translated locales wait at `draft` until three are at
100 %, then the batch is flipped to `indexed` in one deploy and submitted to Search Console together. The
first batch is `fa`, `ru` and `hi` (Hindi) — one RTL, one Cyrillic, one Devanagari locale, so the first
launch exercises all three non-Latin font and layout paths; `ar` follows in the second batch. Rationale: Google re-evaluates the hreflang cluster on each change, so shipping translations in
batches gives it a stable set of alternates, and the manual Search Console work is done once per batch.

1. **Translate** — catalogs, prose, docs and sidebar labels to 100 % (LLM draft + native review, §I);
   `status: 'draft'` meanwhile, previewed locally.
2. **Crawler-only launch** — once the batch of ≥3 locales is complete, flip them to `status: 'indexed'`
   and deploy. The pages exist at `/fa/…`, every
   English page points at them with `hreflang` and they point back, the sitemap lists them with alternates,
   but nothing in the visible interface links to them (no dropdown, no banner, Starlight language select
   suppressed). Users only reach them through search or shared links.
3. **Sitemap + reindex** — in Google Search Console: resubmit `https://hipo.finance/sitemap-index.xml`
   (the sitemap now carries `xhtml:link` alternates), then use URL Inspection → _Request indexing_ on the
   locale's top URLs: `/fa/`, `/fa/stake/`, `/fa/unstake/`, `/fa/rewards/`, `/fa/faq/`, `/fa/hpo/`,
   `/fa/docs/` and the two tutorials. `scripts/check-i18n.mjs --top-urls <locale>` prints that list.
   Same for Bing Webmaster Tools if the team uses it. Watch _Indexing → Pages_ and the _International
   Targeting_/`hreflang` report for errors over the following two weeks.
4. **Expose after traffic** — once GSC/analytics show the locale receiving real visits, flip to
   `status: 'public'`: the language dropdown appears site-wide (listing all `public` locales), the Starlight
   language select is restored, and the detection banner/preference from §J can be enabled. Each further
   locale repeats steps 1–4 independently; the dropdown grows as locales become `public`.

Manual Search Console actions are recorded in the session changelog entry so the launch is traceable.

### K. Phasing

1. **Foundations (invisible):** registry, `t()`, `format.ts` + locale-aware `NumberParser`, extract English
   strings, `prose` collection (English), logical-utility sweep, bidi wrappers, check script + `meta.json`.
   English `dist/` unchanged except number-format fixes.
2. **Route plumbing:** `[locale]` routes, layouts `lang`/`dir`, `SEO.astro` hreflang/og/JSON-LD, sitemap
   `i18n`, 404, the dropdown component (dormant until a locale is `public`). Registry still English-only →
   zero new pages.
3. **Island:** observable locale + inlined catalog, route table, TonConnect containment, chart `dir=ltr`,
   localized input.
4. **Docs:** `generateId`, Starlight `locales`, sidebar translations, Header override, remark plugin,
   importer guard.
5. **First batch through §L:** translate `fa`, `ru` and `hi` (fonts, RTL QA on `fa`) →
   one `indexed` deploy → GSC sitemap + reindex → `public` with dropdown and detection once traffic
   arrives; then the remaining locales in batches of ≥3 through the same four steps.

## Changes

- `src/i18n/registry.mjs`, `locale.ts`, `t.ts`, `format.ts`, `GLOSSARY.md`, `<locale>/*.json`,
  `<locale>/docs-sidebar.json`, `<locale>/meta.json` — new.
- `src/content.config.ts` — `prose` collection, `i18n` data collection, locale-first `generateId` for docs.
- `src/content/prose/<locale>/{faq,hpo-faq,shell}/**/*.md` — long-form copy moved out of `FAQ.astro`,
  `Hpo.astro` and `src/pages/*/index.astro` (English first).
- `src/pages/[locale]/{index,faq,hpo/index,stake/index,unstake/index,rewards/index,stats/index,defi/index}.astro`
  — thin routes with `getStaticPaths = localeParams`.
- `src/components/pages/*.astro` — shell-page bodies extracted from `src/pages/*/index.astro`, cards and
  FAQ JSON-LD rendered from the `prose` collection.
- `src/layouts/*.astro` — `lang`/`dir` from registry, locale-aware nav hrefs, inlined `#i18n-app` JSON in
  `AppLayout`.
- `src/components/{SEO,SiteHeader,SiteFooter,Banner,Landing,Hpo,FAQ}.astro` — strings via `t()`, prose via
  the collection, hrefs via `localizedPath`, switcher dropdown, hreflang/og/JSON-LD additions, JSON-LD bug
  fix.
- `src/components/app/Model.ts` — `locale`/`catalog` observables, `t()`, locale-aware routes, `format.ts`,
  revived locale-aware `NumberParser`, FSI/PDI isolation in composed strings, TonConnect `language` +
  `dir=ltr` containment, `astro:after-swap` sync.
- `src/components/app/**/*.tsx` — strings via `model.t`, `num` utility / `<bdi>` on values, logical
  utilities, `rtl:-scale-x-100` on `ArrowRight`, `dir="ltr"` chart wrapper, localized controlled amount
  inputs.
- `src/scripts/{landing-data,hpo-data}.js` — use `format.ts`.
- `src/styles/i18n-fonts.css` — new: subset imports for Vazirmatn, Baloo Bhaijaan 2, Rubik, Comfortaa,
  Hind, Baloo 2; per-`lang` token overrides and heading metrics. `src/styles/{global,app,docs}.css` — import
  it, `num` utility, TonConnect portal `direction: ltr`.
- `src/components/starlight/{Header,LanguageSelect}.astro` — localised header; language select suppressed
  until a locale is `public`.
- `src/pages/404.astro` — inline locale swap. `src/pages/app/index.astro` — unchanged.
- `astro.config.mjs` — Starlight `locales` + sidebar `translations` from the registry, sitemap `i18n`,
  remark plugin.
- `scripts/check-i18n.mjs` — new; `package.json` `prebuild`; `scripts/import-gitbook-docs.mjs` — guard.
- `package.json` — the six font packages above.
- `CLAUDE.md`, `changelog/`, `CHANGELOG.md` — document the i18n layout and rules.

## Acceptance criteria

- [x] After phases 1–3 with English as the only released locale, `npm run build` succeeds and a diff of
      `dist/` against the pre-change build shows only: number-format fixes, new `hreflang`/`og:locale`/
      `inLanguage` tags, logical-property CSS, and sitemap `xmlns:xhtml`. No new HTML files.
- [x] `scripts/check-i18n.mjs` prints a warning when the number of non-English locales at
      `indexed`/`public` is between 1 and 2 (batch rule, decision 14); zero or ≥3 is silent.
- [x] With `fa` at `status: 'indexed'`: no built HTML file contains a visible language control (no
      `data-i18n-switcher` element, no Starlight `starlight-lang-select`), no `<a href="/fa/…">` exists on
      any English page, yet every English page's `<head>` carries `hreflang="fa"` and `sitemap-0.xml`
      lists the `/fa/` URLs with alternates. `scripts/check-i18n.mjs --top-urls fa` prints the nine URLs.
- [x] Flipping `fa` to `status: 'public'` and rebuilding adds the dropdown to `SiteHeader`, the island
      header, the app footer and the docs header, listing English and Persian only (other locales still
      `draft`/`indexed`), with no other diff in `/fa/` page content.
- [x] With `fa` released: `dist/fa/{index,faq,hpo,stake,unstake,rewards,stats,defi}/index.html` and
      `dist/fa/docs/**` (one file per English doc) exist, each with `<html lang="fa" dir="rtl">` and a
      Persian `<title>`; no file under `dist/en/`; no page contains the Starlight fallback notice.
- [x] Every English page and its `/fa/` twin carry reciprocal `<link rel="alternate" hreflang="en|fa">` plus
      `x-default` → the English URL; `sitemap-0.xml` lists both with `xhtml:link` alternates.
- [x] `grep -rn "lang='en'" src/layouts src/pages` returns nothing; no page source contains a raw catalog key
      (`grep -rE '\b(site|app|seo|landing|hpo)\.[a-z0-9.-]+\b' dist/**/*.html` is empty).
- [x] `scripts/check-i18n.mjs` exits non-zero when a key is removed from `src/i18n/fa/app.json` or a file from
      `src/content/docs/fa/` while `fa` is released; exits zero but prints a "stale" warning when an English
      value changes without `--update-hashes`; exits zero with coverage % for a draft locale.
- [x] `grep -rnE '\b(ml|mr|pl|pr)-[0-9a-z/]+|\bleft-|\bright-|\btext-left|\btext-right' src/components
src/layouts src/pages` matches only the allow-listed chart tooltip/SVG lines in `LineChart.tsx`.
- [ ] On `/fa/stake/` with a connected wallet, switching to English via the switcher and back keeps the wallet
      connected (no reconnect prompt), flips every visible string and `dir`, logs no console error, and the
      TonConnect modal opens un-mirrored (LTR) on the Persian page.
- [ ] On `/fa/stake/`, balances and rates render with Persian digits and `٫`/`٬` (e.g. `۱٬۲۳۴٫۵ GRAM`);
      typing `۱۲۳۴٫۵`, `1234.5` or `1234,5` into the amount input all yield the same `amountInNano`; "Max"
      fills the field with Persian digits; `+۳٫۲٪`, `$` prices, `1 hGRAM = ~ … GRAM` and the countdown
      render in reading order under RTL (screenshot review at 375 px and 1280 px). On `/ru/stake/` the same
      values render as `1 234,5` and `1234,5` parses correctly.
- [ ] Dates on `/fa/rewards/` and `/fa/stats/` render in the locale's default calendar and digits; the chart
      time axis still flows left→right and the y-axis stays on the right.
- [ ] Network panel on `/` and `/stake/` shows no Vazirmatn/Baloo/Rubik/Comfortaa/Hind `.woff2` request;
      `/fa/` loads Vazirmatn and Baloo Bhaijaan 2 only; headings on `/fa/` use Baloo Bhaijaan 2.
- [ ] `/fa/docs/` renders `<html lang="fa" dir="rtl">`, its sidebar labels are Persian and its links all
      start with `/fa/docs/`, the language select round-trips `/fa/docs/x/` ↔ `/docs/x/`, and a Pagefind
      search on `/fa/docs/` returns Persian results only.
- [ ] `/fa/nonexistent/` shows the 404 page in Persian with `dir="rtl"`; `/nonexistent/` in English.
- [ ] `npx prettier --check` passes on touched files; Lighthouse on `/` is within ±2 points of today;
      full ten-locale build completes in under 2 minutes on the GitHub runner.

## Risks & rollback

- **Native digits vs. wallets** — Persian/Arabic users compare our `۱٬۲۳۴٫۵` with a wallet's `1,234.5`
  (accepted, decision 2). Detected via support feedback; reversible per locale by overriding
  `numberingSystem: 'latn'` in `format.ts` for that `lang`.
- **Jalali dates** for on-chain timestamps may confuse cross-referencing with explorers (accepted,
  decision 9); reversible per locale with `-u-ca-gregory`.
- **Strict 100% gate** for released locales couples English content changes to translation drafts (§I,
  decision 12). If it proves too heavy later, the escape hatch is a `warn`-only mode for docs with the
  dropped fallback mitigations (`noindex` + Pagefind-ignore) reinstated.
- **Starlight owns Astro's i18n config** — never use `i18n.fallback`, `redirectToDefaultLocale`,
  `routing: 'manual'` or `astro:i18n`; Starlight 0.41 needs Astro 7 (bump together).
- **TonConnect under RTL** is the biggest visual unknown; test the containment on day one of RTL work.
- **Island locale staleness** if any code captures `locale` at construction instead of reading the
  observable — covered by the switch-back acceptance test.
- **Font rendering quality** of the proposed display faces for Arabic/Devanagari/Cyrillic is a design
  judgement; swapping a family is a one-line change in `i18n-fonts.css`.
- **Build time/size** grow roughly linearly: ~50 → ~500 pages, Pagefind over ten languages; estimated well
  under a minute, verified by the last acceptance criterion.
- **Rollback**: phases 1–3 are inert while only English is released (rollback = revert the commit range);
  a bad locale is un-shipped by flipping its registry `status` to `draft` (its pages disappear from the
  next build; English URLs never change).

## Decisions log (2026-08-22)

1. Locales: fa, ru, de, hi, tr, it, id, pt-BR, ar (plus en). No CJK.
2. Persian uses native digits for all purposes → generalised to "every locale follows its own `Intl`
   conventions" (§E).
3. Dedicated playful display face per script (§F table, proposal pending design confirmation).
4. A locale ships only when all pages — including docs — are translated; no fallback pages in production.
5. LLM-assisted drafts + native reviewer per locale; Russian and other reviewers to be found later.
6. Per-key source hash for stale-translation detection (`meta.json`).
7. All long-form prose (FAQ, HPO FAQ, app-shell cards and their JSON-LD Q&As) lives in the Markdown `prose`
   collection.
8. One OG image and one English `public/llms.txt` for all languages — neither is localized.
9. Persian dates use the Jalali calendar (the `fa` default), on-chain timestamps included.
10. Arabic uses Arabic-Indic digits (the `ar` default).
11. Font pairs as proposed in §F; changeable later per locale without touching markup.
12. Strict release gate: once a locale is released, any PR changing English copy or docs must include
    (draft) translations for every released locale, or the build fails; review lag is a warning only.
13. Rollout strategy per locale (§L): translate → crawler-only launch (`hreflang` + sitemap in HTML, no
    visible language UI, no hidden links) → resubmit sitemap and request indexing of top URLs in Google
    Search Console → add the language dropdown only after the locale receives traffic.
14. Locales are submitted for indexing in batches of at least three fully translated locales, not one at
    a time (first batch: `fa`, `ru`, `hi`).

## Open questions

None — all fourteen decisions are recorded in the log above.
