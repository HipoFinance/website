# Persian numbers: "." for decimals, "," for thousands

**Status:** implemented; approved (Alireza 2026-11-09). Amended the same day while building: the amount
reader takes fa's "." and "," too (Alireza chose option 2). Money-audited once; its one finding
(F1, below) accepted by Alireza.

## Goal

Persian pages write numbers as `۱,۲۳۴.۵` instead of `۱٬۲۳۴٫۵`. The Persian decimal mark «٫» looks
like a comma in most fonts, so readers take `۱۲٫۵` for twelve thousand five hundred, or for a list.
Alireza asked for "," as the thousands separator and "." as the decimal point (2026-11-09).

## In plain terms

Today every number on a Persian page uses the two Persian separators the browser offers: «٬» between
thousands and «٫» before the decimals. The second one looks like a comma, so `۱۲٫۵` reads like
"12,5". After this change Persian pages use the ordinary "," and "." that readers expect from apps
and exchanges, and keep the Persian digits: `۱,۲۳۴.۵ hGRAM`, `۱۷.۴۹٪`.

Two kinds of number change: those the site formats in code (every balance, amount, percentage and
compact figure on the app, the Club, /hpo/ and /stats/), and those typed into the Persian texts and
docs (469 places, e.g. `۰.۱ GRAM` in a fee table).

The staking app's amount field changes too, so that it reads what the page now shows. It treats "."
as the Persian decimal and "," as the Persian thousands mark, exactly as the English page does, and it
still reads the Persian marks «٫» and «٬» that Persian keyboards type. So `۱۲.۳۴۵` is 12.345, `۱,۲۳۴`
is 1234 (it used to be refused as unclear), and `۱٫۵۰۰` stays 1.5. The Max button writes `۱۲.۳۴۵`,
which reads back the same.

This was not the first plan. The first plan left the reader alone, but then the field showed "." and
the reader refused `۱۲.۳۴۵` (it could not tell 12.345 from 12345), which would have broken Max for
some balances. Changing the reader fixed it; it is the part a mistake in could send a wrong amount,
so it gets one money audit and the tests below.

Arabic keeps its own separators. Dates are unchanged (they have no separators).

No decisions needed.

## Definitions

**Concepts**

- **momayyez «٫» (U+066B)** — the Persian/Arabic decimal separator, what `Intl` gives for `fa`.
- **«٬» (U+066C)** — the Persian/Arabic thousands separator, what `Intl` gives for `fa`.
- **the amount reader** — `parseNumberInput` (and `isViablePrefix`, which decides whether a half-typed
  string can still become valid) in `src/i18n/format.ts`: turns what a user typed into the ASCII
  amount the stake/unstake transaction is built from.
- **the amount field display** — `formatInput`: writes an ASCII amount (Max, a language switch) back
  into the field in the locale's digits and decimal mark.
- **the locale's symbols** — `symbolsOf(locale)`: the decimal and group marks the reader treats as the
  locale's own; any other separator is "foreign" and follows stricter rules.

## Context

- `src/i18n/format.ts` — every displayed number goes through `formatNumber` (`Intl.NumberFormat` of
  the locale); `formatNano`, `formatPercent`, `formatCompact`, `formatUsd*`, `formatRate` call it.
  `symbolsOf` reads the locale's digits, decimal and group from `Intl`; the reader and `formatInput`
  use it. The reader's rules are in the comment above `parseNumberInput`: «٬» and whitespace are
  group-only in every locale; the locale's own decimal alone is the decimal; a single foreign
  separator placed like a thousands group is refused as unclear.
- `specs/multi-language-site.md` §E (decision 2) — numbers follow each locale's `Intl` conventions.
  `src/i18n/GLOSSARY.md` — fa examples and the rule "Thousands separator «٬», decimal «٫»".
- Measured before the change, fa reader: `۱,۵۰۰.۵` → 1500.5, `۱.۵` → 1.5, `۱,۵` → 1.5,
  `۱٬۵۰۰٫۵` → 1500.5, `۱٫۵۰۰` → 1.5, `1,500` → refused, `۱۲.۳۴۵` → refused.

## Approach

1. A per-locale table in `format.ts`, `DISPLAY_SEPARATORS = { fa: { decimal: '.', group: ',' } }`.
2. `formatNumber` swaps «٫» → "." and «٬» → "," for a locale in the table. All helpers inherit it.
3. `symbolsOf` takes the table's marks over `Intl`'s, so for fa "." is the own decimal and "," the own
   group, the same rules en has. `formatInput` therefore writes "." for fa.
4. The reader folds «٫» (`Intl`'s decimal) to the locale's decimal before tokenising, for a locale in
   the table (`foldIntlDecimal`, in `parseNumberInput` and `isViablePrefix`), so a Persian keyboard's
   `۱٫۵۰۰` stays 1.5. «٬» is group-only already.
5. The fa texts: a script swapped «٫»/«٬» between two Persian digits for "."/","; `check-i18n
   --update-hashes fa` (no hash changed: hashes are of the English source).
6. The rule: GLOSSARY fa lines and §E of `specs/multi-language-site.md` (an fa exception). The
   selftest's fa cases now state the new reader answers, with a check that every fa display — page
   number grouped or plain, and `formatInput` — reads back as the same amount.

Rejected: leaving the reader alone (Max and a language switch write `۱۲.۳۴۵`, which it refused);
keeping «٫» in the field only (safe, but the field would look unlike the page).

## Changes

- `src/i18n/format.ts` — the table; `formatNumber`, `symbolsOf`, `foldIntlDecimal` in the reader.
- `scripts/i18n-selftest.mjs` — fa expectations; the read-back check.
- `src/i18n/fa/*.json`, `src/content/docs/fa/**`, `src/content/prose/fa/**` — the typed separators.
- `src/i18n/GLOSSARY.md`, `specs/multi-language-site.md` — the fa rule.
- `CHANGELOG.md` — one entry.

## Acceptance criteria

- [x] `formatNumber('fa', 1234567.89, { maximumFractionDigits: 2 })` is `۱,۲۳۴,۵۶۷.۸۹`;
      `formatPercent('fa', 0.1749)` is `۱۷.۴۹٪`; `ar` gives `١٬٢٣٤٫٥` as before (selftest).
- [x] `formatInput('fa', '12.345')` is `۱۲.۳۴۵`, and every fa display (grouped, plain, `formatInput`)
      of 0.5, 1, 12.345, 100.1, 1234, 1234.5, 1000000, 1234567.891 reads back as the same amount; the
      round trip for every other locale passes unchanged (selftest).
- [x] fa reader: `۱,۲۳۴` → 1234, `1,500` → 1500, `۱۲.۳۴۵` → 12.345, `۱.۵۰۰` → 1.500, `۱٫۵۰۰` →
      1.500, `۱٬۵۰۰٫۵` → 1500.5, `۱,۵` → 1.5; the half-typed `۱٬` stays invalid; other locales'
      answers unchanged (selftest, all 19 groups).
- [x] `grep -rE "[۰-۹][٫٬][۰-۹]"` over the fa texts, docs and the built `dist/fa` finds nothing.
- [x] Screenshots: `/fa/club/rewards/` (mock), `/fa/stake/` (live stats `۱۷.۶۱٪`, `۸.۸ میلیون`; the
      field takes `۱۲.۳۴۵`, `۱٫۵۰۰`, `۱,۲۳۴.۵` without the invalid colour), `/fa/docs/fees-and-gas/`.
- [x] `npm run build` passes ("i18n: ok, 0 warning(s)") and the selftest passes.
- [x] Money audit (once) of the reader change: no open finding. 2026-11-09: fa old against new reader
      over 2.6 M strings, 0 read as a different amount; everything the app writes reads back; the
      multisig copy amount byte-identical. One finding, F1, accepted by Alireza: with the cursor in
      the amount field, a language switch (e.g. browser Back between /de/stake/ and /fa/stake/)
      re-reads the typed text under the new locale's rules (`Model.relocalizeAmount`), so "10.000"
      is 10000 in de and 10 in fa. The same risk en already has against de/ru; the money stays in the
      user's wallet (gas and a round's wait to undo), the field rewrites itself on blur and the wallet
      shows the amount. Not fixed.

## Risks & rollback

- The reader: a mistake could read a typed fa amount differently. Covered by the selftest's fa cases
  and read-back check, and the money audit. A refusal is safe (the field turns red); a misread is
  the risk. Accepted: F1 (a focused language switch re-reads the typed text), and that fa readers who
  type "." for thousands or "," for decimals get en's readings ("۲,۵۰۰" is 2500).
- A number written another way (a chart library formatting by itself) keeps «٫»: seen in screenshots,
  fixed in place. Rollback: revert the commit; nothing is stored.

## Open questions

None.
