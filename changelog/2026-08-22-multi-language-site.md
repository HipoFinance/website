# 2026-08-22 — Multi-language site (i18n) with first batch fa/ru/hi

Implemented the approved spec `specs/multi-language-site.md`: the whole site
— landing pages, FAQ, HPO page, the staking dApp island and the Starlight docs
— can now be served in any locale listed in `src/i18n/registry.mjs`, LTR or
RTL, with English staying at the root URLs and every other locale under a
path prefix (`/fa/…`, `/ru/…`, `/hi/…`). Three locales were fully translated in
this session (Persian, Russian, Hindi — 611 items each: catalogs, prose, docs
and sidebar labels) and flipped to `status: 'indexed'` for the crawler-only
launch described in spec §L. No visible language UI ships yet; the dropdown,
the Starlight language select and the language-suggestion banner are all
dormant until a second locale becomes `public`. The session spanned two days
(2026-08-22 spec + implementation, 2026-08-23 translation finishing, review
fixes and verification).

## Commits

| Commit | Description                                                    |
| ------ | -------------------------------------------------------------- |
| _tbd_  | (pending — to be filled in after the user confirms the commit) |

## What changed

### Architecture

- **Locale registry** — `src/i18n/registry.mjs` is the single source of truth:
  `LOCALES` keyed by URL segment (`pt-br` → `lang: 'pt-BR'`), each with `lang`,
  `dir`, `label`, TonConnect language, optional `intl` tag (`ar` uses
  `ar-u-nu-arab`) and a `status` that drives the rollout: `draft` (built only
  with `I18N_INCLUDE_DRAFTS=1`, local preview), `indexed` (built, with
  `hreflang` and sitemap entries, no visible UI) and `public` (also listed in
  the language dropdowns). Helpers: `builtLocales()`, `releasedLocales()`,
  `indexableLocales()`, `publicLocales()`, `isReleased`, `isLocaleKey`,
  `RESERVED_SEGMENTS`. English must stay `public`.
- **URL scheme** — English unprefixed, everything else `/<locale>/…`.
  `src/pages/[locale]/**` mirrors the English routes and both call the same
  route components (`src/components/routes/{Home,Faq,Hpo,Shell}Route.astro`)
  with `getStaticPaths = localeParams`. `src/i18n/locale.ts` holds
  `localeOf(Astro)`, `localizedPath`, `stripLocale`, `matchLocale`, `langOf`,
  `dirOf`, `intlOf`. `astro:i18n` is deliberately **not** used — Starlight
  generates Astro's i18n config from its own `locales`, and ours is derived
  from the registry in `astro.config.mjs`.
- **Catalogs** — flat dotted-key JSON per namespace in
  `src/i18n/<locale>/{site,landing,hpo,faq,seo,app}.json`, loaded by
  `src/i18n/t.ts` (`getT`, `getAppCatalog`) on top of the glob-free
  `make-t.ts` (`makeT`, `interpolate`, `localizeHrefs`). Long-form prose (FAQ
  answers, HPO FAQ, app-shell cards and their JSON-LD Q&As) moved out of
  components into the Markdown **`prose` content collection**
  (`src/content/prose/<locale>/…`, 105 entries per locale, read by
  `src/i18n/prose.ts`). Docs translations live at
  `src/content/docs/<locale>/**` with English at the top level; Starlight
  sidebar labels are translated via `src/i18n/<locale>/docs-sidebar.json`
  (`group:<English label>` keys for groups) and the header strings via
  `src/content/i18n/<lang>.json`. Terminology is fixed in
  `src/i18n/GLOSSARY.md` (83 terms).
- **Starlight wiring** — `locales` built from the registry (root = English),
  `generateId` makes ids locale-first (`fa/docs/x`), sidebar `translations`
  injected from the JSON files, the remark plugin
  `src/i18n/remark-localize-links.mjs` prefixes root-relative links in
  translated docs (skipping assets, `/app/` and `/i18n/`), a `Head` override
  trims `hreflang` to indexable locales and `noindex`es draft pages, and the
  `LanguageSelect` override only renders when ≥2 locales are `public`.
  `Header.astro` keeps the forced-dark overrides.
- **The island** — `AppLayout.astro` inlines the merged app catalog as
  `<script type="application/json" id="i18n-app">` on non-English pages;
  `Model.ts` reads it in `syncLocale()` (on `astro:after-swap`) and exposes
  `model.locale`, `model.t`, `model.localizedPath`, the `format*` helpers,
  `model.isolate`, `model.withUnit`. `AppIsland` stays prop-less. Inside the
  Telegram Mini App, whose URL carries no locale, `Model.applyTelegramLocale`
  picks the user's `language_code`, fetches the static
  `/i18n/<locale>.json` endpoint (`src/pages/i18n/[locale].json.ts`) and
  switches the island — now also setting `<html lang dir>` and a
  `data-locale-override` marker that `keepRuntimeStyles` carries across
  ClientRouter swaps. TonConnect's `language` follows via `uiOptions`, its
  portals are pinned `direction: ltr`.
- **Formatting** — `src/i18n/format.ts` is Intl-only: the `format*` family
  (`Number`, `Nano`, `Percent`, `SignedPercent`, `Compact`, `Usd`, `Rate`,
  `Date`, `Duration`), `formatInput`,
  `parseNumberInput` (native digits of any script, locale decimal/group
  separators with strict grouping, whitespace groups), `formatAsciiNano` for
  amounts a user must retype elsewhere (multisig), and `isolate` (FSI/PDI)
  for Latin tickers inside RTL text. Persian gets Persian digits and the
  Jalali calendar by default; Arabic gets Arabic-Indic digits; Russian
  `1 234,5`; Hindi Indian grouping.
- **Fonts and RTL** — `src/styles/i18n-fonts.css` (imported by `global.css`,
  `app.css` and `docs.css`) declares per-script `@font-face` subsets with
  `unicode-range` (Vazirmatn + Baloo Bhaijaan 2 for fa/ar, Rubik + Comfortaa
  for ru, Hind + Baloo 2 for hi) and swaps the `--font-body` /
  `--font-fredoka` / `--sl-font` tokens under `html[lang=…]`, so English
  pages fetch nothing new. All markup uses logical Tailwind utilities
  (`ms-/me-/ps-/pe-/start-/end-/text-start`, `rtl:` variants) and a `num`
  utility (`unicode-bidi: isolate; tabular-nums`). `SEO.astro` emits
  reciprocal `hreflang` + `x-default`, `og:locale(:alternate)` and
  `inLanguage`; `@astrojs/sitemap` gets the `i18n` map.
- **Dormant UI** — `src/components/LanguageSwitcher.astro` (site header,
  footer, app footer), `src/components/app/LanguageSwitcher.tsx` (island
  header), the Starlight `LanguageSelect` override and the
  language-suggestion banner in `Banner.astro`/`banner.js` ("Read this page
  in فارسی?", per-target text, remembered in `localStorage['hipo.locale']`)
  all render nothing until ≥2 locales are `public`.
- **Gate and tooling** — `scripts/check-i18n.mjs` runs as `prebuild`:
  compares every non-English locale against English (catalog keys incl.
  placeholder parity and an allow-listed HTML subset with attribute/href
  checks, prose files, docs files, sidebar labels), keeps per-item source
  hashes and review flags in `src/i18n/<locale>/meta.json`
  (`--update-hashes`, `--mark-reviewed`), prints `--top-urls <locale>` for
  Search Console, warns on the batch rule (1–2 released locales), and fails
  the build when a released locale misses anything.
  `scripts/i18n-selftest.mjs` (run with `node --experimental-strip-types`)
  covers `locale.ts`, `format.ts` and keystroke sequences through
  `parseNumberInput` (15 groups).
- **Translations** — fa, ru, hi drafted with LLM agents against the glossary
  (catalogs, 105 prose files, 40 docs and 54 sidebar labels each), then a
  per-locale consistency pass (sidebar vs. titles, UI labels quoted in
  tutorials vs. `app.json`, glossary variants, digits/orthography) that made
  4 (fa), 4 (ru) and 8 (hi) small fixes. Hashes recorded; all three at
  100 %, flipped to `indexed` in the registry.
- **Legacy stub / 404** — `/app/` stays English-only; `src/pages/404.astro`
  is one English file whose inline script localizes title, strings, `lang`
  and `dir` from the first path segment (own-property guarded).

### Code review findings and fixes

The mandatory review of the money path found two must-fix issues, both
fixed and re-reviewed:

1. **Thousands separator typed → 1000× too small** — the amount input was
   re-rendered from the canonical value on each keystroke, so fa `۱٬۰۰۰` or
   en `1,000` became `1.000` (1 GRAM instead of 1000) while pasting parsed
   correctly. `Model.ts` now keeps `amountRaw` (verbatim text), `amount`
   (canonical ASCII) and `amountInvalid`; only Max, clear and a locale
   switch rewrite the text; `parseNumberInput` treats the locale's group
   symbol strictly as a group (unfinished groups are invalid, never a
   decimal) and any other single separator as the decimal. Behaviour
   change: en `1,5` and de `1.5` now show as invalid until corrected instead
   of being silently reinterpreted.
2. **TMA locale override never set `<html lang dir>`** — Persian in Telegram
   rendered LTR in Heebo (no Arabic glyphs); fixed as described above.

Lower-risk fixes from the same review: multisig manual amounts in ASCII
digits; 404 prototype-key guard; `check-i18n` rejects `on*` attributes and
non-`/ # https:// http:// mailto:` hrefs in catalog HTML; remark localizer
skips `/app/` and `/i18n/`. A follow-up review of the rewritten parser
found one more money-path case — a _foreign_ separator (neither the locale's
group nor its decimal) in thousands position, e.g. `1,500` typed on `/fa/`
or `۱٬۵۰۰` pasted on the English page, was read as a decimal (1.5 instead
of 1500). Now U+066C `٬` is a group in every locale and an ambiguous foreign
separator with exactly three trailing digits is invalid; fractions longer
than nine digits are invalid at parse time (so `amountInvalid` agrees with
`toNano`); a locale switch re-parses rather than rewrites text that is
invalid or being typed; and the dormant island `LanguageSwitcher` derives
its hrefs from `model.activePath` (it read `location.pathname` in render and
would have gone stale after in-app navigation) and both switchers remember
the choice in `localStorage['hipo.locale']`. Side effect: ru `1.500` (ASCII
dot in group position) is also invalid now. A second pass hardened
draft-preview builds:
draft-locale pages get `noindex, nofollow`, are dropped from the sitemap and
from every page's `hreflang`/`og:locale:alternate` list.

## Decisions

Recorded in the spec's decisions log (14 items), in brief: locales fa, ru,
de, hi, tr, it, id, pt-BR, ar (+ en), no CJK; every locale follows its own
`Intl` conventions (Persian digits everywhere, Arabic-Indic for `ar`, Jalali
calendar for `fa`); a playful display face per script, swappable later; a
locale ships only at 100 % incl. docs — no fallback pages; LLM drafts +
native reviewer; per-key source hashes; all long prose in the `prose`
collection; one OG image and one English `llms.txt`; strict release gate
(build fails when a released locale is incomplete, review lag is a warning);
rollout translate → crawler-only launch → Search Console → dropdown after
traffic; batches of ≥3 locales, first batch fa/ru/hi, `ar` in the second.

Declined or deferred:

- `x-default` in the sitemap — `@astrojs/sitemap` does not emit it; the
  `<head>` carries it, which is what the spec requires.
- `og:locale:alternate` and JSON-LD on docs pages — Starlight owns that
  `<head>`; only `og:locale` is present there.
- `/app/` stays English-only (legacy redirect stub, `noindex`).
- Native review has **not** happened: fa/ru/hi are flipped to `indexed`
  locally for the batch launch, but every item is still `reviewed: false`
  (611 warnings per locale). Whether to deploy before review is the user's
  call; `status: 'draft'` is a one-line rollback per locale.
- Per-locale OG images, localized `llms.txt`, and fallback pages were ruled
  out by the decisions above.
- `LanguageSwitcher` does not yet record `hipo.locale` when used (spec §J
  nice-to-have).

## Verification performed

- `npm run build`: 194 pages (49 English incl. `/app/` and 404, 48 × fa/ru/hi)
  in ~5–7 s; `I18N_INCLUDE_DRAFTS=1 npm run build`: 482 pages in ~8 s.
  `dist/` contains no `en/`, no Starlight fallback notice, `<html lang dir>`
  correct on all 144 localized pages, `dist/i18n/{fa,ru,hi}.json` valid
  (193 keys), Pagefind indexes en/fa/ru/hi separately.
- `node scripts/check-i18n.mjs`: fa/ru/hi 100 % (611/611), 0 missing, 0
  stale; only "not yet reviewed" warnings. Negative tests: removing a key
  from `fa/app.json` or a file from `docs/fa/` → exit 1 with the item named;
  changing an English value → exit 0 with a stale warning; batch-rule warning
  appears with one released locale.
- `node --experimental-strip-types scripts/i18n-selftest.mjs`: 15 groups
  passed (incl. keystroke sequences for en/de/fa/ru/hi ending at the same
  nano).
- Public-flip test: with `fa` temporarily `public`, the dropdown appears in
  `SiteHeader` (desktop, mobile, footer), the island header, the app footer
  and the docs header, listing exactly English and فارسی, and the suggestion
  banner markup appears on English pages; `/fa/` page content is otherwise
  unchanged. Registry restored and rebuilt: markup gone.
- Crawler-only state: no `data-i18n-switcher` / `starlight-lang-select` /
  `#lang-suggest` anywhere; no `<a href="/fa|ru|hi/…">` on English pages;
  48/49 English pages and all localized pages carry reciprocal `hreflang` +
  `x-default`; `sitemap-0.xml` lists 192 URLs with 4 `xhtml:link` alternates
  each, no draft locales, no `/i18n/*.json`; `--top-urls fa` prints the nine
  URLs.
- Reviewer's English byte-equivalence check: normalized text of `/`, `/faq/`,
  `/hpo/`, the five app pages, `/docs/`, a tutorial, 404 and `/app/` identical
  to a from-scratch build of `HEAD`.
- `npx -p typescript@5 tsc --noEmit -p .`: no errors in `src/**` (only the
  pre-existing Starlight typing noise). `npx prettier --check` clean on all
  663 changed/untracked files. No physical-direction utilities outside the
  allow-listed `LineChart.tsx` comment; `grep "lang='en'" src/layouts src/pages`
  empty.
- **Not done** (needs the proxy-launched Chrome, which was not running with
  `--proxy-server`): browser RTL QA at 375/1280 px, wallet-connected locale
  switch, TonConnect modal under RTL, digit entry in the live input, Jalali
  dates on `/fa/rewards/`, network-panel font check, runtime `/fa/nonexistent/`
  404, Lighthouse delta. The corresponding acceptance boxes in the spec are
  left unticked.

## Follow-ups

- Relaunch Chrome via `~/.claude/chrome-proxy.sh` and run the browser
  acceptance criteria above; tick the remaining spec boxes.
- Find native reviewers for fa/ru/hi; after review run
  `node scripts/check-i18n.mjs --mark-reviewed <locale> all` (or a prefix such
  as `docs/`). The translator notes flagged for review are in the agents'
  reports (Jalali month mapping of audit dates, a few untabled terms such as
  «اگریگیتور», «غیرامانی (non-custodial)», ru "Фишинг: распознавание и защита",
  hi `Hipo Staked GRAM` kept as a product name).
- After the commit lands and deploys: Search Console — resubmit
  `https://hipo.finance/sitemap-index.xml`, then URL Inspection → Request
  indexing for `node scripts/check-i18n.mjs --top-urls fa` (and `ru`, `hi`);
  watch the hreflang / Pages reports for two weeks (spec §L step 3).
- Flip a locale to `public` once it receives traffic; the dropdown and the
  suggestion banner light up from the registry alone.
- Second batch: `ar` (plus two more of de/tr/it/id/pt-BR) — drafts via the
  same agent workflow, then the consistency pass, `--update-hashes`, flip.
- Fill in the commit hash in the table above once committed.
- Make the `LanguageSwitcher`s write `hipo.locale` on use so the suggestion
  banner never contradicts an explicit choice.
- Consider a `warn`-only docs mode (spec §Risks) if the strict gate proves
  heavy once several locales are released.
