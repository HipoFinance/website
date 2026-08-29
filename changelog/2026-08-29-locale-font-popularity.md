# 2026-08-29 — Every locale gets the most-used font for its script

The per-script font set had been assembled by matching the personality of the
English pair (Heebo + Fredoka) into each script. This session re-picked it
against a different criterion, set by the maintainer: **use the most popular font
for each language.** Four of the eight non-Latin faces changed.

The session started as a narrower request — swap Arabic off Vazirmatn, which is a
Persian face — and widened once the goal was stated.

## Commits

| Commit | Description                                                   |
| ------ | ------------------------------------------------------------- |
| (this) | Re-pick the per-script fonts for popularity; split ar from fa |

## Method

Popularity is Google Fonts' own `popularity` rank from
`https://fonts.google.com/metadata/fonts` (1 = most used, across 1,946
families), filtered to families whose `primaryScript` is the script in question.
That filter matters: ranked by raw subset coverage, Rubik is the "most popular
Arabic font" and Roboto the most popular Cyrillic one, but only because they are
huge Latin families that happen to ship those subsets. Filtering to
`primaryScript` gives fonts actually _designed for_ the script.

Coverage was then checked mechanically rather than assumed: every codepoint in
each locale's real content (`src/i18n/<locale>/*.json`, `src/content/prose/<locale>/**`,
`src/content/docs/<locale>/**` — 170–190k characters per locale) was tested
against each candidate's `cmap` with fontTools.

## What changed

| Locale | Role    | Was                   | Now     | Rank among fonts designed for the script  |
| ------ | ------- | --------------------- | ------- | ----------------------------------------- |
| ar     | body    | Vazirmatn (a fa face) | Cairo   | #1 of 50 Arabic (overall #90)             |
| ar     | display | Baloo Bhaijaan 2      | Cairo   | same                                      |
| fa     | display | Baloo Bhaijaan 2      | Lalezar | overall #353, vs Baloo Bhaijaan 2 at #774 |
| ru     | body    | Rubik                 | Roboto  | overall #2, vs Rubik at #26               |
| hi     | body    | Hind                  | Poppins | #1 of 57 Devanagari (overall #7)          |

Unchanged: `fa` body stays **Vazirmatn** (the de-facto Persian web standard —
IRANSans is more used in Iran but is proprietary), `ru` display stays
**Comfortaa**, `hi` display stays **Baloo 2**, and the six Latin locales keep
**Heebo + Fredoka**.

`@fontsource/tajawal`, `@fontsource-variable/baloo-bhaijaan-2`,
`@fontsource-variable/rubik` and `@fontsource/hind` were removed;
`@fontsource-variable/cairo`, `@fontsource-variable/roboto`,
`@fontsource/lalezar` and `@fontsource/poppins` added, all 5.3.0.

## Why Arabic ended up on one family

Arabic was first given Tajawal (body, #2 for Arabic) + Cairo (display, #1),
keeping the body/display split every other locale has. The coverage check killed
it: **Tajawal has no U+066B or U+066C**, the Arabic decimal and thousands
separators. That is not an edge case here — `ar` carries `intl: 'ar-u-nu-arab'`
in the registry, so `Intl.NumberFormat` emits both in every formatted amount:

```
Intl.NumberFormat('ar-u-nu-arab').format(1234567.89) → ١٬٢٣٤٬٥٦٧٫٨٩
```

plus 34 static content files that contain them literally. It produced no tofu —
the stack fell through to Cairo, which has both — but every number on the Arabic
site would have rendered its digits in Tajawal and its separators in Cairo. In a
staking app where numbers are the product, that is the wrong place to accept a
seam. Cairo covers 100% of the Arabic content set and is the most popular Arabic
face anyway, so `ar` now runs one family in both roles and takes its hierarchy
from weight and size instead.

## Lalezar's single weight

Lalezar ships weight 400 only, and `font-fredoka` is always used at
`font-semibold`. Rather than let the browser synthesize a fake bold, the
`@font-face` declares `font-weight: 400 700` so 600 matches the real face — it is
a heavy display design already. Noted in the stylesheet so it does not read as a
typo.

## Decisions declined

- **Re-picking the Latin faces.** Applied literally, "most popular" says replace
  Heebo (#63) and Fredoka (#115) with Roboto (#2) or Open Sans (#3). Those two
  faces are the 2026-08-11 redesign's identity across six of ten locales; the goal
  is to localize the brand, not delete it. Latin was excluded from scope.
- **Mukta for Hindi body.** Both Poppins and Mukta were selected; they are
  mutually exclusive. Poppins won on the stated criterion (#1 vs #2 for
  Devanagari). Mukta is the better _text_ face — Poppins is geometric with tight
  apertures, Hind and Mukta were built by Indian Type Foundry as UI faces — so if
  Hindi body copy reads poorly at 16px, Mukta is a one-line swap.
- **Inter for Russian body.** Roboto (#2) beats Inter (#4) on the criterion.
- **Chasing a "most popular Cyrillic font".** Only five Google fonts are
  Cyrillic-primary and all five are obscure Church-Slavonic display faces. There
  is no meaningful ranking to follow; Russian sites use Latin-primary families
  with good Cyrillic, which is what both Roboto and Comfortaa are.

### Verification performed

- `npm run build` — clean, 512 pages, `prebuild` i18n gate passed. No content
  changed, so no locale went stale.
- Glyph coverage, fontTools against each locale's full content: Lalezar covers
  all 56 Persian codepoints, Cairo all 60 Arabic (including the Intl separators
  and the Arabic-Indic digits), Roboto all 61 Cyrillic, Poppins all 60
  Devanagari. Zero misses.
- The four `html[lang=…]` token blocks in the built CSS name the intended
  families, in all three stylesheet compilations.
- Tajawal, Baloo Bhaijaan 2, Rubik and Hind appear nowhere in `dist/_astro/*.css`.
- Heebo and Fredoka both ship `latin-ext`, so Turkish `ğ ş İ`, German umlauts and
  Portuguese diacritics were already covered — checked while auditing, no change
  needed.

### Follow-ups

- **None of this has been looked at in a browser.** The four new faces need a
  native reader's eye per locale, especially: Lalezar at `font-semibold` on the
  Persian hero headline (the synthetic-bold workaround above), and Poppins at
  16px for Hindi body copy.
- Hindi now ships four Poppins Devanagari statics (~154 KB total) plus Baloo 2
  (112 KB) — the heaviest locale by some margin. Worth trimming a weight if it
  shows up in field data.
- `ar` has no body/display contrast any more. If that reads flat once someone
  looks at it, Almarai (#168) and Readex Pro (#181) are the next Arabic-designed
  faces; check their U+066B/U+066C coverage first.
