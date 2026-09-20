# Language preference, switcher dismissal, and the locale line-up (Phase A)

Three things, all approved together as Phase A of
[`specs/language-preference-and-locale-lineup.md`](../specs/language-preference-and-locale-lineup.md):
the language dropdown now closes the way a dropdown should, a chosen language is remembered for later
visits, and the site ships eight locales instead of ten — Hindi and Italian are gone permanently, and
the dropdown is ordered the way the user asked. Phase B, which adds Spanish, Chinese, Ukrainian and
French, is specced but not started.

## Commits

| Commit         | Subject                                                             |
| -------------- | ------------------------------------------------------------------- |
| `0a3331a`      | Close the language dropdown on click-away, and remember the choice  |
| (this session) | Remove the Hindi and Italian locales, and reorder the language list |

## The switcher closes now

Amendment 2 of `specs/language-switcher-rollout.md` deliberately left "closing on outside click or
Escape" out of scope, and it showed: an open panel stayed open until you clicked its summary again or
picked an entry. The fix is an extension of the one document-delegated listener in
`LanguageSwitcher.astro`, which already owns every `<details data-i18n-switcher>` on the page — the
site header and footer, the app shell's mirror, and the React island's, since after hydration that is
the same element in the DOM with no open-state of its own. Three rules now: a click outside closes
every panel that does not contain the click target, Escape closes them and returns focus to the
`<summary>`, and moving focus out closes them too.

Per-component React state was the obvious alternative and was rejected: it would desync from the
`open` attribute the existing code already manipulates by hand, and would not cover the three Astro
instances.

## A remembered language, honoured once per session

`localStorage['hipo.locale']` has been written on every pick since the switcher shipped, but nothing
ever read it except the suggestion bar — so a choice survived the click and nothing more.

The trap in simply reading it back is that **dismissing** the suggestion bar writes it too (with the
page's own locale). Reusing that key would have meant anyone who ever dismissed the bar got bounced
out of shared non-English links forever after. So the choice now lives in a second key,
`localStorage['hipo.locale.pref']`, written only by an actual pick — in any of the four switchers, or
the suggestion bar's link, never its dismiss button. The docs `<select>`, which wrote nothing at all
before, now writes both.

`src/components/LocalePreference.astro` renders a small inline script into `<head>` from `SEO.astro`
and the Starlight head override — the same two places `FontPreload` is wired into. Before the body
paints, it checks for a stored preference and `location.replace()`s to the same path in that locale.

Four properties keep it safe:

- **Only an explicit choice triggers it.** Language _detection_ still only suggests: `banner.js`
  reads `navigator.languages` and renders a link, exactly as before. This is the narrowing of
  spec §J's "no automatic redirect" recorded as decision 17, not its abandonment.
- **Once per tab**, guarded by `sessionStorage['hipo.locale.redirected']`, so a link deliberately
  opened in another language is readable after the first bounce. Landing on a page already in the
  preferred language sets the guard too — without that, pressing Back straight after picking a language
  would bounce forward again on any page the bfcache did not keep, replacing the English entry and
  making Back look broken.
- **`location.replace` adds no history entry**, so Back leaves the site instead of bouncing.
  Measured: `history.length` is 2 after the bounce (the blank entry plus the page), and Back lands
  off-site.
- **Crawlers never have the key**, so hreflang, canonicals and everything Googlebot sees are
  untouched.

It bails inside the Telegram Mini App on all four signals `probeTmaMode()` uses — `__telegram__initParams`
being the one that still identifies the webview on a `/docs/` deep link, where `__hipoTma` is never set
and the launch fragment is gone — on pages with no localized twin, and on draft-locale pages so a Phase B
preview does not bounce out of itself. Every storage access is wrapped in `try`/`catch`; with storage blocked
the page renders and nothing moves.

The script is built as a string rather than with `define:vars`, which matters: ClientRouter
re-executes an inline script whose text changed, and a second top-level `const` of the same name in
one document is a `SyntaxError`.

## Hindi and Italian, removed

Search Console over 2026-08-21 → 2026-09-17:

|                          | `/hi/` | `/it/` |
| ------------------------ | ------ | ------ |
| URLs with impressions    | 8      | 26     |
| Impressions              | 20     | 77     |
| Clicks                   | 0      | 2      |
| Average position         | 60.6   | 23.5   |
| Never-crawled URLs freed | 9      | 10     |

Hindi was the floor on every measure and its removal costs nothing. **Italian was not** — 15 of its
URLs rank in the top 10 and Google indexes it cleanly — and that was said plainly before approval.
What makes it defensible is the absence of Italian-language demand: 5 Italian-string impressions and
0 clicks in 28 days, with about half of Italy's clicks landing on English pages anyway. The motive is
cost: two locales' worth of translation upkeep, and 19 never-crawled URLs returned to a crawl budget
that is the site's binding constraint.

262 files went with them, and the registry line had to go in the same commit as the content:
`docsEntryId()` only treats a leading path segment as a locale when `isLocaleKey()` says so, so a
registry deletion that outran the content deletion would have published 88 English pages at
`/docs/hi/…` and `/docs/it/…` with the wrong `lang` and no noindex.

`/hi/` URLs 404 — zero clicks means no link equity to preserve, and a 404 is cheaper for the crawl
budget than a stub. Three `/it/` URLs earn meta-refresh stubs to their English equivalents (`/it/`,
`/it/docs/`, `/it/docs/giveaways-and-prizes/hipo-club/`); the other 23 had 1–3 impressions and no
clicks and 404 with the rest. GitHub Pages cannot serve a 301, so a stub is the strongest instrument
available.

Two side effects worth recording. Hindi's 16 lakh-grouping assertions in `i18n-selftest.mjs` were
deleted rather than retargeted — no remaining locale groups that way, so the coverage protected
nothing shipped, and Phase B restores number-format coverage with Spanish, French, Ukrainian and
Chinese cases. And `@fontsource/poppins` and `@fontsource-variable/baloo-2` left with the Devanagari
`@font-face` blocks; Italian, being Latin, needed no font change at all.

## Ordering

The dropdown order is registry key order, so the requested line-up is a registry reorder:
`en, ru, id, pt-br, fa, ar, tr, de`, with Phase B's four slotting into their final positions later.
It also reorders the hreflang links and sitemap chunks, which is cosmetic — both are unordered sets
to a crawler.

## Declined and deferred

- **Setting the two locales to `draft` instead of deleting them.** That captures the identical SEO
  benefit at one word of diff and stays reversible, and the handoff recommended it as the first step.
  Rejected because the stated goal was to stop paying the translation tax, which `draft` does not do:
  the 262 files would still sit in the tree and in every future translation sweep.
- **A cookie for the preference.** There is no server on GitHub Pages to read one, so it would be a
  worse `localStorage` with a header cost on every request.
- **Redirecting on every page view.** Rejected with the user: a deep link shared in another language
  would become unreadable without clearing site data.
- **Fixing the whole `hi`/`it` mention list in historical documents.** Decisions 1 and 13–15 in
  `specs/multi-language-site.md`, the dated status headers and the older changelog reports record what
  was true when written and were left alone. Decisions 16 and 17 were appended instead.

## Review

`code-reviewer` found no blocking defect — it replayed the redirect's path rule over all 516 built pages
× 8 public locales and confirmed every target exists — and raised seven findings. Three were fixed before
this was called done:

- The Telegram guard checked three of `probeTmaMode()`'s four signals, missing `__telegram__initParams`,
  which is exactly the one that survives a reload on a non-app page. That was the spec's own wording,
  unmet.
- Back could bounce forward once right after a pick, on a page the bfcache did not keep, replacing the
  English history entry. Fixed by setting the guard when the page already is the preferred language.
- Importing the shared key constants had quietly turned the switcher's hoisted script from inline into a
  separate bundled request on every page, so closing the panel waited on a fetch. The keys are now spelled
  out in that one script, with the duplication documented at both ends — the same trade-off
  `starlight/LanguageSelect.astro` already makes.

Also handled: a `location.replace('')` no-op on a bare `/ru` pathname with no trailing slash, which now
falls back to `/`. Two findings were recorded rather than fixed — that "once per session" is really once
per _tab_, and that visitors who picked a language before this ships are not migrated to the new key (they
cannot be: the old key is also what a dismissal wrote). A speculative Safari focus wart was left alone,
unverified.

`money-auditor` ran on the same diff, because withdrawing a locale changes which number-format rules
the stake amount field applies. Verdict: safe. It proved by differential execution over 66,429 strings ×
8 locales that the registry edit changes the reading of **no** keystroke for any surviving locale, that
every deleted Hindi assertion was a duplicate of a surviving English one (`hi` and `en` share their
separator symbols exactly), and that a Hindi-grouped amount — in Latin or Devanagari digits — still
parses correctly on the English page. Two things came back:

- **One assertion was worth restoring.** Mutation testing showed the deleted `v('hi', '1,2345,')` case
  was the _only_ guard on the upper bound of a grouping run; loosening `format.ts` to accept 4-digit
  middle groups passed the suite without it. Re-pinned as `v('en', '1,2345,')`, and verified by
  re-running that mutation: the suite now fails, as it should.
- **Italian speakers now read English number rules**, where `1,500` is 1500 rather than 1.5 — a 1000×
  difference in either direction, bounded by the wallet balance. No code changed to cause it; it is what
  withdrawing a locale means, and it is the same exposure German, Turkish, Indonesian and Brazilian
  visitors already have on the English page. The amount field rewrites itself to canonical form on blur,
  before the stake button can be pressed. Recorded in the spec's risks rather than fixed.

### Verification performed

- `npm run build` — green, 434 pages, `check-i18n` 100 % for all seven translated locales, 0 warnings.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 18 groups passed.
- `dist/`: no `hi/`, `docs/hi/` or `docs/it/`; `dist/it/` contains **only** the three stub files;
  no `hreflang="hi"` or `hreflang="it"` anywhere; `sitemap-index.xml` lists 24 chunks (8 locales × 3),
  none of them `hi` or `it`. The stub carries `<meta http-equiv="refresh">` plus
  `<meta name="robots" content="noindex">` and a canonical to its English target.
- Headless Chrome against `npm run preview`, all passing: outside click, Escape (focus returned to the
  `<summary>`), tab-out, second switcher closing the first, own-summary toggle — on the site header,
  the footer, the hydrated island, and the static shell with the island chunk blocked at the network
  level.
- Preference end-to-end in a clean browser profile: no preference ⇒ nothing moves; picking Deutsch in
  the header writes both keys and lands on `/de/`; a new tab (new session) landing on `/faq/` is taken
  to `/de/faq/`; a second English URL in that session stays English; `history.length` 2 and Back lands
  off-site.
- Cross-locale path handling: `/ar/docs/glossary/?x=1#anchor` with a German preference lands on
  `/de/docs/glossary/?x=1#anchor` — prefix swapped, query and hash preserved.
- Negative cases: `?tma=1` on `/stake/` does not redirect while the control without it does;
  `dist/app/index.html` carries no preference script at all; with `localStorage` and `sessionStorage`
  patched to throw before any page script runs, `/faq/` renders, both switchers are present and no
  page error is raised.
- The dismissal distinction, with the browser locale forced to `de-DE`: dismissing the suggestion bar
  writes `hipo.locale='en'` and leaves `hipo.locale.pref` null, and a new session then does **not**
  redirect; clicking the bar's link writes both keys and navigates.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` after restoring the grouping assertion:
  18 groups passed; and with `format.ts` mutated to drop the upper bound, it fails (then restored).
- Screenshots at 375 px and 1280 px of `/`, `/faq/`, `/stake/` and `/docs/`, plus the dropdown open at
  both widths: eight entries in the requested order, panel inside the viewport, no layout shift.

- After the three review fixes, rebuilt (green, 434 pages) and re-ran the journey end to end in clean
  profiles: no preference ⇒ nothing moves; picking Deutsch lands on `/de/faq/` with the guard set;
  **Back returns to `/faq/` and stays English**; a fresh tab with a Russian preference is taken from
  `/docs/` to `/ru/docs/` and the next URL in that tab stays English; a tab carrying only
  `sessionStorage['__telegram__initParams']` with `tgWebAppPlatform` is not redirected; outside-click and
  Escape still close the panel with the script inline again. Confirmed in `dist/faq/index.html` that the
  switcher script is inlined and no `LanguageSwitcher…js` request is emitted.

### Follow-ups

- Phase B: Spanish, Chinese (`/zh/`, `lang: zh-CN`, no webfont), Ukrainian and French — 712 items and
  ~33,000 source words each, flipped `public` as one batch. Its acceptance criteria are already in the
  spec, including the French narrow-no-break-space amount-parsing case, which is why `money-auditor`
  runs on that diff.
- Search Console: the `sitemap-hi-*` and `sitemap-it-*` chunks will disappear from
  `sitemap-index.xml`. Remove those sitemap submissions, and expect `/hi/` and `/it/` 404s in the
  Coverage report for a few weeks — that is the removal working.
- `src/i18n/GLOSSARY.md` still carries per-locale style sections only for surviving locales; Phase B
  adds four more.
