# Phase B — Spanish, Ukrainian and French, and `/pt-br/` becomes `/pt/`

Phase B of [`specs/language-preference-and-locale-lineup.md`](../specs/language-preference-and-locale-lineup.md),
approved after Phase A shipped. The site goes from eight locales to eleven: Spanish, Ukrainian and
French are added as one batch, and Brazilian Portuguese moves from `/pt-br/` to `/pt/`. Chinese was in
the approved plan and was dropped during implementation — see below.

## Commits

| Commit         | Subject                                                         |
| -------------- | --------------------------------------------------------------- |
| (this session) | Add the Spanish, Ukrainian and French locales, and rename pt-br |

## The line-up

Registry order is dropdown order, so the requested order is the registry:

```
en · ru · es · id · pt · fa · ar · tr · uk · de · fr
```

## Chinese, considered and dropped

The approved spec had `/zh/` in this batch with a CJK system font stack. It came out during
implementation, and decision 1's "No CJK" stands.

The problem is arithmetic, not packaging. Every face the site ships encodes an alphabet and costs
tens of kilobytes — `heebo-latin-400` is 11,956 B, `fredoka-latin-wght` 29,732 B, and the heaviest,
`vazirmatn-arabic-wght`, 46,308 B for an entire weight axis. `FontPreload.astro` budgets two faces and
~60 KB per locale against that. Simplified Chinese needs thousands of drawn glyphs: Noto Sans SC is
**4.31 MB of woff2 across 101 unicode-range subsets** plus a 99 KB stylesheet, and because the subsets
are cut by character frequency rather than by our text, a real page pulls a few hundred KB, not a few
tens.

Three options, all rejected:

- **Ship the full family.** Two orders of magnitude over budget for one locale.
- **A system font stack** (PingFang SC, Microsoft YaHei, Noto Sans CJK). Costs nothing and looks
  normal to a Chinese reader, but there is no rounded CJK counterpart to Fredoka, so Chinese headings
  lose the brand's display face.
- **Subset the font to our own copy** with `pyftsubset`. Genuinely small, and the instinct behind
  "just download a font file" — self-hosting alone changes nothing, since Fontsource _is_ self-hosted.
  But the subset is derived from the copy, so it must be regenerated whenever Chinese text changes,
  and any character outside it falls back to a different face mid-sentence. `check-i18n` cannot catch
  that staleness.

The deciding factor was traffic: there is not enough Chinese demand to justify a build step that can
silently ship a half-drawn page. Revisit if Chinese traffic appears.

## `/pt-br/` → `/pt/`

Checked before touching anything, because a locale tag drives `Intl` and therefore the amount input:

- **`Intl` output for `pt` is byte-identical to `pt-BR`** — `1.234.567,89`, `20 de setembro de 2026`.
  CLDR's default for bare `pt` **is** Brazilian; `pt-PT` is the divergent one, grouping with U+00A0.
  So nothing on the money surface changes.
- Starlight ships `pt.json`, not `pt-BR.json`, and was already resolving `pt-BR` to it — Portuguese UI
  strings were in `dist/pt-br/docs/` before the move.
- `matchLocale` resolves `pt`, `pt-BR` and `pt-PT` identically under either key shape.

The gain is reach: `hreflang="pt-BR"` targets Brazil alone, `hreflang="pt"` offers the same pages to
Portugal, Angola and Mozambique. The copy stays Brazilian; the label drops to plain `Português`.

`meta.json` keys are relative paths, so the four `git mv`s needed **no `--update-hashes`** — `pt` read
100 % (712/712), 0 stale, immediately after the move, which is the evidence that the mapping survived.
Three `/pt-br/` URLs get meta-refresh stubs (`/pt-br/`, `/pt-br/docs/`, `/pt-br/stake/`); the rest 404.
`/pt-br/` earned 7 impressions and 0 clicks over 28 days, so this was the cheapest moment it will ever
have. Done inside this batch so Google re-evaluates the hreflang cluster once rather than twice.

## What each locale cost in bytes

Nothing, which is why these three were the right three:

- **`uk` reuses `ru`'s faces.** Ukrainian's own letters — Є/є U+0404/0454, І/і U+0406/0456,
  Ї/ї U+0407/0457, Ґ/ґ U+0490/0491 — all sit inside the base cyrillic range already declared, so
  `html[lang='uk']` simply joins `html[lang='ru']` in a grouped selector. Verified in the build: `/uk/`
  preloads byte-identical files to `/ru/`.
- **`es` and `fr` fall through to the Latin default**, identical to English. The only French character
  outside the `latin` subset is `Ÿ`, and `latin-ext` is already declared.

## The money surface, and a claim I got wrong

**Correction, recorded because it was stated confidently twice before review:** French's group separator
is indeed U+202F, a narrow no-break space rather than `ru`/`uk`'s U+00A0 — but the claim that this
needed new parser coverage was **false**. JavaScript's `\s` already matches U+202F, and `GROUP_ONLY`
(`format.ts:147`) folds it to U+00A0 before tokenising, so for the parser French is indistinguishable
from Russian. `code-reviewer` brute-forced every string to length 4 over the separator alphabet and
found **zero** behavioural differences between `fr` and `ru`, and the grouped round trip was already
covered by the test group that loops the whole registry.

The two selftest additions stay, re-labelled honestly: `fr` in `VIABLE_SHAPES` and U+202F in
`VIABLE_ALPHABET` are a **tripwire** that fails loudly if `GROUP_ONLY` is ever narrowed to literal
spaces, not coverage of a gap. The suite runs in 2.8 s, so the ~3× larger sweep costs nothing.

`money-auditor` confirmed the behaviour independently: U+202F folds in all four whitespace regexes,
never survives normalisation, and is correctly never considered as a decimal candidate. Across all
eleven locales it found no input, paste, keystroke sequence or locale switch that makes the field send
a number other than the one displayed — 66,000 (amount, locale) self-paste round trips, an exhaustive
`isViablePrefix` sweep over a 10-character alphabet at depth 5 (0 reachable amounts blocked, 0 dead
strings accepted), the 9-fraction-digit nanoTON boundary exact in every locale, and
`fromNano → formatInput → parseNumberInput → toNano` the identity up to 1e18. `pt` was verified
byte-identical to `pt-BR` over 8 NumberFormat option sets × 14 values and 4 DateTimeFormat sets.

## Translation

712 items per locale — 538 catalog strings, 54 sidebar labels, 76 prose files, 44 docs pages, about
33,000 source words each. Drafted against `src/i18n/GLOSSARY.md`, which gains a terminology table and a
style block per new locale, including the multisig field-name convention (`Destination Address` and
`TON Amount` are literal field names in multisig.ton.org's English-only UI, so every locale renders
them as "translated label (English Field Name)") — a convention every translator had been
rediscovering.

The quarterly reports were the risk: reformatting `1,234,567.89` into `1.234.567,89` and
`1 234 567,89` is exactly where a digit goes missing. Each was checked by extracting every numeric
token from both versions, canonicalising the separators and diffing the multisets, and the allocation
tables were re-added by hand. One real catch came out of that: `24-hour trading volume` had been
rendered in Ukrainian as "добовий обсяг" in two places, dropping the `24`.

All three locales are **machine-translated with no native review**. `check-i18n` records that — every
item carries `reviewed: false`, which is a warning, not a build failure. The eight existing locales are
in the same state, so "100 %" means complete, not reviewed.

## Declined and deferred

- **Fixing the English source issues the translators found.** Eleven locales now depend on that copy,
  so each fix costs eleven edits. They are listed under Follow-ups rather than folded into this diff.
- **Translating Pagefind's search-box strings.** See Follow-ups — it is a pre-existing gap across the
  whole site, not something this batch introduced, and it deserves its own change.
- **`/zh-cn/` instead of `/zh/`.** Moot once Chinese was dropped, but the analysis stands for whenever
  it returns: the URL segment is only a key, `matchLocale` resolves `zh`, `zh-CN`, `zh-Hans` and
  `zh-TW` identically under either shape, and `localeCode()` yields `ZH` either way. What search
  engines read is `lang`.

### Verification performed

- `npm run build` green: **596 pages**, `check-i18n` **100 % (712/712) for all eleven locales,
  0 warnings**, `i18n-selftest` 18 groups pass.
- `dist/sitemap-index.xml` lists **33** chunks (11 locales × 3). The homepage's hreflang cluster names
  all eleven plus `x-default`. `/es/`, `/fr/`, `/uk/` build 64 pages each with no `noindex`.
- Before the flip, a drafts build (`I18N_INCLUDE_DRAFTS=1`) proved the ~1,100 new Markdown files pass
  the content schemas, and confirmed draft behaviour: the three were absent from hreflang and the
  sitemap and carried `robots: noindex, nofollow`.
- Fonts, from the built pages: `/uk/` preloads `nunito-cyrillic-wght-normal.woff2` +
  `roboto-cyrillic-wght-normal.woff2`, byte-identical to `/ru/`; `/es/` and `/fr/` preload
  `fredoka-latin-wght-normal.woff2` + `heebo-latin-400-normal.woff2`, identical to English.
- `pt`: 64 pages at `/pt/`, `<html lang="pt">`, `hreflang="pt"` across the cluster, `dist/pt-br/`
  holding nothing but the three stubs, and `check-i18n` 100 % with 0 stale and no `--update-hashes`.
- Headless Chrome against `npm run preview`: the dropdown lists the eleven labels in the requested
  order; `/es/`, `/fr/`, `/uk/`, `/pt/` and their `/faq/`, `/stake/`, `/docs/`, `/hpo/`, `/verify/`
  pages all return 200 and render translated, with correct `<html lang>` on each.
- The dropdown panel is capped at `max-height: 352px` with `overflow-y: auto`; at eleven entries the
  content is 408px, and the last entry (Français) is reachable by scrolling at 1280×900, 375×700 and
  1280×620.
- Screenshots at 375 px and 1280 px of `/es/`, `/fr/stake/`, `/uk/docs/`, plus the open dropdown.

### Follow-ups

Issues the translators found **in the English source**. None blocks this batch; each now costs eleven
edits to fix, so they are worth doing as one pass:

- **`hipo-club/hipo-club-season-3.md` — the 20/80 split does not add up.** Unclaimed is 1,900,901 HPO,
  split as 380,180.248 + 1,520,720.8, which sums to 1,900,901.048. Twenty percent of 1,900,901 is
  380,180.2.
- **`hipo-fund/quarterly-report-december-18-2025.md` — a rate looks inverted.** "~24K GRAM into ~47K
  USDT at an average rate of 1.9 GRAM per USDT" — 24K→47K is ~1.96 **USDT per GRAM**, i.e. ~0.51 GRAM
  per USDT. Also headed December 18 while its table says "as of Dec 17".
- **`hpo-tokens-distribution.md` — link text does not match its href** in the Community and Liquidity
  "Old wallet" rows (`UQ…-hZC` linking to `…-kuH`; `UQ…i_Ns` linking to `…i66p`). Same accounts in
  bounceable/non-bounceable form, but the other four rows match, and on an address page a mismatch
  reads as a red flag.
- **The protocol fee has three names**: _governance fee_ in `fees-and-gas.md` and the glossary,
  _staking fee_ in `hipo-fund.md`, _staking fees_ in `site.banner.body`.
- **"TON Connect" vs "TonConnect"** — `faq/getting-started/which-wallets-are-supported.md` spells it
  with a space; `GLOSSARY.md`'s do-not-translate table says one word. It is a do-not-translate term, so
  the inconsistency now sits in eleven locales.
- **`landing.hero.title` is "The #1 most profitable {accent} on TON"** — a double superlative with no
  idiomatic form in Spanish, French or Ukrainian. All three translators independently dropped the "#1";
  the existing Portuguese keeps it, and reads oddly ("O staking de GRAM mais rentável #1 na TON").
  Three translators hitting the same wall suggests the English is the problem.
- **Stale or self-contradicting pages**: `hipo-gang.md` and `hipo-usd1-000-000-rewards-program.md` are
  framed as ended but written in present/future tense; `hipo-ambassadors-program.md` still says
  "Twitter" linking `x.com` and mixes _Program_/_programme_; `hipo-mcp-server.md` documents
  `HIPO_NETWORK=testnet` though the site dropped testnet on 2026-08-10; `wallets-and-rewards.md`'s
  quick-reference row says connecting a wallet is enough to start earning, which the body contradicts.
- **Pool name inconsistency**: `HPO/GRAM` in `hipo-incentive-programs.md` vs `GRAM/HPO` on the $1M page.
- **`GroypFi` is missing** from `GLOSSARY.md`'s do-not-translate product list (DeDust, STON.fi, TONCO,
  swap.coffee, Evaa are there).
- **Hard-coded "0 %" fee claims** in three prose files plus `site.banner.body`. If the DAO ever changes
  the governance fee, those are the stale copies, in eleven locales.

- **`quarterly-report-december-18-2025.md` percentage column was nudged to reach 100.00.** Stated USDT
  45.53 % / hGRAM 21.92 %; recomputed from the table's own USD values against the $110,875.29 total,
  45.51 % / 21.93 %, which rounds to 99.99. `quarterly-report-august-1-2025.md`'s April 18 column sums
  to 100.01. Cosmetic (~$22 of notional on $110,875), present in all five language versions.

Separate from the English copy:

- **The i18n selftest does not gate the deploy.** `package.json`'s `prebuild` runs `check-i18n` only,
  and `.github/workflows/deploy.yml` runs `npm ci && npm run build` — so `scripts/i18n-selftest.mjs`,
  the only guard on the amount parser, runs when a human remembers to run it. Nothing is broken today
  (it passes on both local Node 24 / ICU 78.3 and CI's Node 22 / ICU 78.2, with identical `Intl`
  output), but a future regression in number parsing would not be caught before it deployed. Adding it
  to `prebuild` is one line; it is left out of this batch because it changes what can block a deploy.
- **`Model.ts:1955-1964` may have swapped reward labels** — `claimableRewardsFormatted` maps
  `gram: rewards.hpoSumRewards` and `hpo: rewards.htonSumRewards`, which reads backwards against the
  field names. Unchanged by this batch and possibly correct (the rewards API's `hpo_*`/`hton_*` naming
  may not map to the token names), but it needs a live payload to settle, and if it is swapped the
  claim caption names the wrong token.

- **Pagefind's search-box strings are English in ten of the eleven locales.** Starlight ships the
  `pagefind.*` keys **only for Spanish**; `ru`, `id`, `pt`, `fa`, `ar`, `tr`, `de` have had an English
  search box inside translated docs since they launched, and `fr` and `uk` now join them. The fix is
  ten keys per locale in the existing `src/content/i18n/<lang>.json` override.
- **Native review** for all eleven locales remains open (`--mark-reviewed <locale> <prefix>`).
- **Search Console**: submit the nine new sitemap chunks (`es`, `uk`, `fr` × site/app/docs), drop the
  `sitemap-pt-br-*` submissions, and expect `/pt-br/` 404s in Coverage for a few weeks.
