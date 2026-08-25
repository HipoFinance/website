# 2026-08-24 — Nine-locale translation batch

This session brought the site's translation layer from three partial locales to **nine complete
ones**. `fa`, `ru` and `hi` were re-synchronised against the English content that the three
preceding sessions rewrote (FAQ restructure, docs formatting sweep, fund-report/docs restructure,
anchor copy links), and six locales that existed only as registry entries — `ar`, `de`, `it`, `tr`,
`id`, `pt-br` — were translated from scratch: catalogs, prose, docs, sidebar labels and Starlight UI
strings. Every locale now reports 100 % coverage against the English source.

Per the user's direction the first version is **machine translation**, to be corrected by native
reviewers afterwards, and the rollout target is **`indexed`** — built, `hreflang`-linked and in the
sitemap, but with no visible language dropdown or suggestion banner.

## Commits

| Commit    | Subject                                                             |
| --------- | ------------------------------------------------------------------- |
| `33abe5f` | Translate the site into nine locales                                |
| `fb449fc` | Merge remote-tracking branch 'origin/main' into i18n-multi-language |

## What changed

### Terminology first

Before any translation ran, a terminology sheet was agreed per locale so that all downstream work
shared one vocabulary. `src/i18n/GLOSSARY.md` grew from 182 to 512 lines:

- a second terminology table (83 recurring terms × the six new locales) alongside the existing
  fa/ru/hi columns;
- six new style blocks (`Arabic (ar)`, `German (de)`, `Italian (it)`, `Turkish (tr)`,
  `Indonesian (id)`, `Brazilian Portuguese (pt-br)`) covering register, digit system, date order,
  punctuation and how Latin tokens are isolated inside the running text.

A written brief made the rules binding for every translator: what is never translated (product
names, contract names, tickers, URLs, addresses, tx hashes, code spans, anchor fragments), the
frontmatter keys that must stay byte-identical, and the requirement that a translated Markdown file
stay _diff-comparable_ with its English source — same heading levels in the same order, same tables,
same link targets, same code fences, same HTML tags.

### fa / ru / hi resynchronisation

The three existing locales were first reconciled structurally with the restructured English tree:
46 retired prose files and 4 merged docs pages were removed per locale, obsolete catalog keys were
pruned, and the four docs-merge redirects in `astro.config.mjs` were expanded per locale so
previously indexed translated URLs keep resolving:

```js
redirects: Object.fromEntries(
  Object.entries(DOCS_MERGE_REDIRECTS).flatMap(([from, to]) => [
    [from, to],
    ...builtLocales()
      .filter((key) => key !== DEFAULT_LOCALE)
      .map((key) => [`/${key}${from}`, `/${key}${to}`]),
  ]),
)
```

The changed and new English content was then translated into all three.

### Six new locales

For `ar`, `de`, `it`, `tr`, `id` and `pt-br` the full set was produced: the six catalogs
(`site`, `landing`, `hpo`, `faq`, `seo`, `app`), `docs-sidebar.json`, the 76 prose files, the 42 docs
pages, and `src/content/i18n/<lang>.json` for Starlight's own UI strings. `ar` is the second RTL
locale after `fa`; it carries `intl: 'ar-u-nu-arab'` so numbers render in Arabic-Indic digits.

### Verification tooling

Agent self-reports were not treated as evidence. Three checks over the whole tree were the ground
truth, and they are what caught the real defects:

- **existence + catalog parity** — every English item has a counterpart, every catalog has exactly
  the English keys, every `{placeholder}` appears exactly once;
- **structural parity** — frontmatter keys, heading levels, link targets, `src` attributes, code
  fences, table rows and HTML tags compared against the English file;
- **address audit** — every `EQ…`/`UQ…` contract address in a translated page compared with the
  English one.

Defects found and fixed this way:

- a German page had `UQDjhorr…` where English has `EQDjhorr…` — an address the translator had
  retyped rather than copied;
- 19 Hindi docs pages had every heading demoted one level, and several were stale against the
  rewritten English pages; `hi/hipo-tokens/hipo-governance-token-hpo.md` was missing the HPO jetton
  address and had collapsed two bold spans into one;
- eleven Persian pages had drifted on links, table rows, frontmatter keys or HTML tags —
  `fa/docs/index.md` was still a stale GitBook stub missing 35 links, `hpo-tokens-distribution.md`
  still carried the old inline `<sub>` wallet lines instead of the six address tables, and four
  pages were missing links the English pages gained (`/docs/fees-and-gas/` ×3, `/docs/risks/`,
  `/docs/staking-without-the-app/`) or pointed at a dead `github.com/HipoFinance/audits` URL;
- 52 places across 13 Arabic files had a space before the punctuation that follows an isolated Latin
  token (`Hipo .`, `NFT :`), from over-applying the Latin-isolation rule — fixed by script, skipping
  code fences, code spans and URLs (the one survivor is a real shell command, `docker build … .`).

Each was repaired by a dedicated structural-fix pass rather than a re-translation.

## Rollout

With the tree clean, all nine locales were flipped from `draft` to `indexed` in
`src/i18n/registry.mjs`. They are built, `hreflang`-linked and in the sitemap; the language
dropdowns and the suggestion banner stay dormant, since those need two `public` locales.

## Merging the light-theme work

`origin/main` had moved twelve commits ahead while this branch ran — a site-wide light palette plus
new copy — so the branch merged it before going back. Fourteen files conflicted; the rule was to keep
theirs for design and new copy and ours for i18n and RTL. Two integration consequences:

- **New English copy needs new keys.** The footer's Telegram strip became a "Start Staking GRAM" CTA,
  the steps row gained a matching CTA card, and the 404 page was rewritten. That is nine new catalog
  keys (`site.footer.cta*`, `site.notFound.headline`/`lead`/`askChat`, `landing.how.cta.*`) and six
  retired ones (`site.footer.joinPrompt`/`joinNow`, `site.notFound.heading`/`body`/`support`/`chat`),
  translated into all nine locales — the item count went 583 → 586.
- **The accent split reaches i18n-touched markup.** `bg-accent` became `bg-accent-fill` and the logo
  became a `logo-on-dark`/`logo-on-light` pair; both had to be re-applied on top of our `t(...)`,
  `localizedPath(...)` and logical-utility edits in the same lines.

A review of the resolution caught two defects a build cannot see, both fixed in the merge commit:

- `syncTonConnectTheme` assigned `uiOptions` without `actionsConfiguration`. TonConnect's setter
  assigns that field wholesale (`this.actionsConfiguration = options.actionsConfiguration`, no `in`
  guard), so every OS light/dark flip cleared `twaReturnUrl` and the next signed transaction would
  strand a Mini App user in their wallet. The branch already documented this invariant next to
  `applyTonConnectLanguage`; the newly merged theme sync did not honour it.
- The merge reverted the auditor rename from the content-accuracy session — the March 2024 card was
  back to "Ender Ting" while still keyed `landing.audits.programCrafterDate`. Restored to
  ProgramCrafter / `PC`.

Four smaller items went in with them: `CLAUDE.md` claimed `bg-accent` "does not exist" (it compiles,
which is exactly why it is dangerous), the 404 page's `::selection` still used the foreground coral,
the Persian 404 CTA had an unmirrored `→` among nine mirrored `←` siblings, and `CHANGELOG.md` needed
a `prettier` pass after the entry lists were interleaved.

### llms.txt

`public/llms.txt` stays English for every language (decision 8), but it now has to describe the ten
of them: a "Languages and localized URLs" section listing each prefix and its direction, the rule that
any English URL has a twin at the same path behind a prefix, and the caveats an LLM needs — English is
authoritative while translations await native review, product and contract names are never translated,
addresses and code are byte-identical, and `fa`/`ar` numerals and Jalali dates are not different
values. One correction found while writing it: `/faq/` and `/hpo/` anchors really are the same English
slugs in every locale, but Starlight generates docs heading anchors from the _translated_ heading
(`/fa/docs/…` has `id="استیک-کردن-گام‌به‌گام"` where English has `id="staking-step-by-step"`), so a
`/docs/` fragment is only valid for its own language. The file says so.

## Verification performed

- `node scripts/check-i18n.mjs` — 583/583 items in all nine locales: `missing 0`, `stale 0`,
  `untracked 0`, `extra 0`. Remaining warnings are the nine "not yet reviewed by a native speaker".
- Structural parity: 0 mismatches across all nine locales (docs and prose).
- Address audit: 0 mismatches.
- Placeholder parity: 0 mismatches across all catalogs.
- Short-file scan (a translation under 40 % of its English size, which catches truncation): clean.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 15 groups passed.
- `I18N_INCLUDE_DRAFTS=1 npm run build` and, after the status flip, `npm run build` — both clean,
  502 pages, Pagefind index over 542 HTML files.
- Built output spot-checked: `/index.html` carries all 11 `hreflang` values (`x-default` included),
  each locale contributes its pages to the sitemap, `/ar/` renders as `<html lang="ar" dir="rtl">`,
  no language switcher is emitted, and the locale-prefixed docs-merge redirects resolve
  (`/fa/docs/introduction/liquid-staking/why-ton/` → `/fa/docs/introduction/liquid-staking/`,
  `/pt-br/docs/introduction/how-does-hipo-work/get-hgram/` →
  `/pt-br/docs/hipo-tokens/hipo-staked-gram-hgram/`).

## Follow-ups

- **Native review.** Everything is machine translation. `scripts/check-i18n.mjs --mark-reviewed
<locale> <prefix>` records review progress; all 583 items in each of the nine locales are currently
  unreviewed.
- **Terminology gaps** the translators flagged as absent from the glossary and resolved ad hoc:
  non-custodial, slashing, price impact, seed phrase, permissionless, collateral, private key. Worth
  an addendum before the review round so reviewers correct one rendering, not nine.
- **Per-locale consistency questions** raised by translators and left for the reviewers: whether the
  German glossary should be re-sorted alphabetically (it currently keeps English order for diff
  parity), whether pt-br says «o Hipo» or «a Hipo», whether "Season" stays English in German,
  whether Italian percentages take a non-breaking space, and whether the Persian fund report should
  carry Jalali dates alongside the Gregorian ones.
- **Browser/RTL QA** is still outstanding — it needs Chrome relaunched through the local proxy, which
  did not happen this session. `ar` in particular has never been rendered.
- **Search Console.** After deploy, `scripts/check-i18n.mjs --top-urls <locale>` lists the URLs to
  submit for each newly indexed locale.
