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
| ru     | display | Comfortaa             | Nunito  | overall #22, vs Comfortaa at #138         |
| hi     | body    | Hind                  | Poppins | #1 of 57 Devanagari (overall #7)          |

Unchanged: `fa` body stays **Vazirmatn** (the de-facto Persian web standard —
IRANSans is more used in Iran but is proprietary), `hi` display stays **Baloo 2**,
and the six Latin locales keep **Heebo + Fredoka**.

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

## A stray token, found while writing this up

`HpoLayout.astro` set its `<body>` face with `font-heebo` where `LandingLayout.astro:48` and
`AppLayout.astro:116` both use `font-body`. The two Tailwind tokens behind those utilities,
`--font-body` and `--font-heebo`, were declared byte-identically in `global.css` and in all four
locale blocks, so nothing ever rendered differently — but it meant every per-locale override had to
set the same value twice, and the second copy was one edit away from silently drifting out of sync
with the first.

`HpoLayout` now uses `font-body` like the other two layouts, and `--font-heebo` is deleted: one
declaration in `global.css` and four in `i18n-fonts.css`. Nothing else in the repository referenced
it. The stylesheet comment describing the tokens claimed `--font-heebo` lived in `global.css` and
`app.css`; `app.css` never declared it, so that comment was already wrong and is corrected too.

## What the browser showed, and the one thing it caught

All four locales were rendered at 1440px in the light scheme, from a local
`astro preview` of the built `dist/`, and inspected at 3x zoom.

`fa`, `ar` and `hi` came out clean. Lalezar renders as a real face on the Persian
hero with no synthetic-bold artefacts, which was the specific risk in declaring a
single-weight font over `400 700`. Cairo in both Arabic roles does not read flat —
size and weight carry the hierarchy — and every Arabic number renders in one face,
separators included, which is what dropping Tajawal was for. Baloo 2 matches
Fredoka's density on the Hindi hero and Poppins reads cleanly at 16px, so the
legibility concern about choosing Poppins over Mukta did not materialise.

Russian did not. Comfortaa is a much lighter typeface than Fredoka at the same
nominal weight — both are `wght 300-700` and both render at 600 from
`font-semibold`, but Comfortaa's 700 is about as dark as Fredoka's 500. Every
heading that mixes scripts showed the two halves at visibly different stroke
weights: "Как работает **Hipo**", "Стейкинг **GRAM** № **1** … сети **TON**", the
Latin roughly twice as thick. Comfortaa also draws Cyrillic `т` and `и` in
cursive-derived forms, so "по доходности в сети" rendered with `m`- and `u`-shaped
letters.

Nunito replaces it: rounded like Fredoka, conventional Cyrillic letterforms, a
`200-1000` weight axis, and considerably more popular (#22 vs #138), so the swap
serves the session's criterion as well as the visual problem. Re-rendered, the
weights sit close enough that `Hipo` reads as brand emphasis rather than a
mismatch.

This is the argument for rendering rather than reasoning about type: the Comfortaa
problem is invisible in the CSS, in the coverage tests, and in the popularity data.

### Verification performed

- `npm run build` — clean, 512 pages, `prebuild` i18n gate passed. No content
  changed, so no locale went stale.
- Glyph coverage, fontTools against each locale's full content: Lalezar covers
  all 56 Persian codepoints, Cairo all 60 Arabic (including the Intl separators
  and the Arabic-Indic digits), Roboto all 61 Cyrillic, Poppins all 60
  Devanagari. Zero misses.
- The four `html[lang=…]` token blocks in the built CSS name the intended
  families, in all three stylesheet compilations.
- Rendered `/fa/`, `/ru/`, `/hi/` and `/ar/` in headless Chrome against a local
  preview; `/ru/` re-rendered after the Nunito swap to confirm the fix.
- Runtime numerals checked separately from static content, since `Intl` emits
  codepoints no content file contains: Vazirmatn and Lalezar cover all of fa's
  (۰-۹, ٪ ٫ ٬), Cairo all of ar's, and Poppins and Baloo 2 both map `U+0970`, the
  abbreviation sign in Hindi's compact `क॰` notation. Cairo does not map `U+061C`
  (Arabic Letter Mark), but that is category `Cf` — an invisible control with no
  glyph — and none of the Arabic faces map it.
- Tajawal, Baloo Bhaijaan 2, Rubik and Hind appear nowhere in `dist/_astro/*.css`.
- After the `font-heebo` removal: a second clean build, `.font-heebo` no longer emitted anywhere in
  `dist/_astro/*.css`, `.font-body{font-family:var(--font-body)}` unchanged, the four per-locale
  `--font-body` declarations intact, and `/hpo/` and `/fa/hpo/` both carrying
  `<body class="bg-bg font-body text-text …">`. No rendering change — the two tokens held identical
  values.
- Heebo and Fredoka both ship `latin-ext`, so Turkish `ğ ş İ`, German umlauts and
  Portuguese diacritics were already covered — checked while auditing, no change
  needed.

### Follow-ups

- Still unrendered: the **dark scheme** (Warm Dark is the authored base and only
  light was checked), mobile widths, and the `/docs/` and dApp pages.
- A native reader per locale is still worth having before any of these flip from
  `indexed` to `public` — rendering correctly is not the same as reading well.
- Hindi now ships four Poppins Devanagari statics (~154 KB total) plus Baloo 2
  (112 KB) — the heaviest locale by some margin. Worth trimming a weight if it
  shows up in field data.
- `ar` has no body/display contrast any more. If that reads flat once someone
  looks at it, Almarai (#168) and Readex Pro (#181) are the next Arabic-designed
  faces; check their U+066B/U+066C coverage first.
