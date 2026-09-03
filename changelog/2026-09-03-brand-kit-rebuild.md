# 2026-09-03 — The brand kit, rebuilt from the live marks

The ZIP behind `/docs/brand-kit/` had drifted. It shipped **hTON** as the staking
token mark and carried no **hGRAM** at all — three years after the rename — and
the request that opened this session was exactly that: "it doesn't include hGRAM
icon."

The missing icon was the symptom. The cause is that the kit was a hand-curated
folder of 16 files exported from Illustrator at various dates between August 2024
and May 2025, with no relationship to what `public/` actually contains. Any mark
the site changes has to be re-exported into the ZIP by hand, and nothing tells
anyone when that hasn't happened. So the fix is not "add hGRAM.png" — it is to
generate the kit from the marks the site renders, and let the missing pieces fall
out of that.

## Commits

| Commit    | Description                                   |
| --------- | --------------------------------------------- |
| `d830ec7` | Generate the brand kit instead of curating it |
| `a1aabb6` | Describe what the brand kit now contains      |

## What the kit is now

`scripts/build-brand-kit.mjs` assembles
`public/docs/images/brand-kit-file-1.zip` from two sources and nothing else:

- the live marks under `public/` — `images/hipo.svg`, `images/hipo-light.svg`,
  `hgram.svg`, `images/hgram-3d.svg`, `hpo.svg`, `images/app/hpo.svg`,
  `images/hton.svg`, `favicon.ico`;
- the two logotype lockups in the new `brand/` directory, which are the only
  brand artwork the site itself does not use anywhere.

Everything else is derived. Every PNG and the `.ico` are rasterized from those
SVGs by sharp, so a raster can never disagree with its vector. 61 files, 1.98 MB,
up from 16 files and 535 KB:

```
Logo/            mark, logotype, horizontal + square lockups (SVG + PNG)
Token Marks/     hGRAM, hGRAM 3D, HPO, HPO 3D, hTON (SVG + PNG at 256/512/1024)
App Icons/       favicon.ico + square PNGs at 32…512
Colors/          palette sheet, hipo-colors.css, hipo-colors.txt
README.md        which file where, clear space, don'ts, token addresses
```

### The three things the old kit was missing

**hGRAM.** Both the flat coin and the 3D one, in SVG and at the three PNG sizes a
listing site or an explorer asks for. hTON is kept, moved to a folder named
`hTON (legacy)` and labelled in the README as the former name of hGRAM, so that
older material can be identified and replaced rather than copied.

**A light-background colorway.** The mark is a cream body with dark linework and
only reads on a dark ground; the old kit's answer was a single
`Hipo Logo Outline.png`, a raster-only older drawing. The site solved this
properly in `public/images/hipo-light.svg` — drop the body fill, warm the
linework from `#0e0e0e` to `#291f20` — and the script now applies that same
recipe to both lockups by class, so every logo file in the kit exists in both
colorways. Coral moves to `#e0574b` in the light version, per the
`--color-accent` / `--color-accent-fill` split in `global.css`.

**A written brand standard.** The old kit was 16 files and no words at all. The
README (`brand/README.md`, copied in at build time) covers which file goes on
which ground, clear space and minimum size, the don'ts, the two coral values and
why they differ, the typefaces and where to get them, and the hGRAM and HPO
jetton addresses with a pointer to `/docs/contracts-and-audits/` to verify them.

### Smaller additions

- The **logotype on its own**, which only existed as a PNG. The script lifts the
  four `.word` paths out of the horizontal lockup and fits a tight viewBox around
  them, in coral, cream and ink.
- **App icons**, which the kit never had — the same drawing as `favicon.ico`, at
  the sizes a manifest or an apple-touch tag wants.
- **The palette**, as a rendered sheet, as CSS custom properties and as plain
  text with RGB triples.

## How the logotype viewBox is measured

There is no path-geometry library in this repo and the letterforms are pure
cubics, so the pixels are the cheapest reliable ruler: render the four paths
alone at 4×, trim the transparent border, and scale the trim offsets back into
user units.

One trap, worth recording because it produced a silently wrong file first: sharp
runs `trim` **before** `resize` inside a single pipeline regardless of call
order, so the offsets it reports are measured against the raw SVG raster, not the
grid you scaled to. The first attempt emitted `viewBox="641.5 335 600 400"` — a
window on empty space, and a blank logotype. The script now rasterizes in one
pass and trims the finished bitmap in a second.

## Second pass: the review, and a flat HPO

The first cut shipped `HPO` and `HPO 3D` as **the same file**. `public/hpo.svg`
and `public/images/app/hpo.svg` differ only by a dead `opacity: .8` group — the
site draws the HPO coin dimensional everywhere and has no flat version at all, so
naming one of them "3D" was a label, not a difference. hGRAM ships flat and 3D
because the flat coin is what jetton metadata, wallet lists and anything under
~64 px want, and HPO needs the same pair.

`flatCoin()` derives it from `public/hpo.svg` the way `public/hgram.svg` is drawn
next to `public/images/hgram-3d.svg`: keep the face circle, the mascot and its
linework, drop the offset edge disc and the inner bevel, square the viewBox on the
face, add the same hairline ring.

A review of the first cut then found five things worth fixing, three of which
would have shipped a wrong artifact without anyone noticing:

- **`logotype()` failed open.** With zero matched `.word` paths the probe raster
  is fully transparent, and sharp's `trim` does not throw on that — it returns the
  image untrimmed, zero offsets, full size. The viewBox falls back to the whole
  lockup and three blank logotypes ship, exit code 0. Now asserts exactly four
  paths, a negative trim offset (pinning sharp's sign convention) and that the
  probe actually trimmed.
- **`toLight()` failed open the same way.** It is four exact-substring replaces
  against a hand-normalized style block; run the sources through a formatter and
  every one becomes a no-op, emitting a byte-identical copy of the dark file under
  a light name. Now checks the post-condition — no `#efebe5`, `#0e0e0e` or
  `#ff7e73` survives — rather than trusting the replacements to have fired.
- **The palette's "Cream" was the wrong cream.** `#f5efe8` is `--color-text`;
  the mascot's body is `#efebe5`, which appears in every piece of artwork and was
  missing from the palette entirely. The kit was handing partners the wrong fill
  for the one thing the README tells them not to get wrong. Split into
  **Logo cream** `#efebe5` and **Text cream** `#f5efe8`.
- **`favicon.ico` was a different colorway from the icons beside it.** The site's
  `public/favicon.ico` still has `#776464` linework — the pre-redesign brown —
  while everything rasterized from `hipo.svg` is `#0e0e0e`. Copying it in gave a
  partner two icons that don't match, and contradicted the script's own claim to
  rasterize everything. The kit now writes its own multi-size `.ico` (16/32/48,
  PNG payloads) from `hipo.svg`. The site's stale favicon is a separate fix.
- **The docs copy overclaimed.** "Every mark … in a version for dark backgrounds
  and one for light" is true of the logo, logotype and lockups, and false of the
  token marks and app icons, which carry their own disc and ship in one colorway.
  Corrected in English and all nine locales.

Smaller ones from the same pass: the ZIP is now byte-reproducible (sorted entry
list, fixed mtimes, `TZ=UTC`) so a diff on that tracked 2 MB blob always means a
real change; it is written beside the staging tree and moved into place only on a
successful `zip`, instead of deleting the tracked artifact first; the internal
"re-run the script" comments are stripped out of the SVGs on their way into the
kit, since they tell an external designer to edit a file they don't have; the
palette sheet's near-black swatches sit on a light plate instead of vanishing into
its warm-dark ground; and `sharp` is a declared devDependency rather than a
hoisted transitive of Astro, behind `npm run brand-kit`.

## Decisions taken

**The ZIP is generated, never edited.** Recorded in `CLAUDE.md` under Other
notes. The whole point is that the kit cannot drift again: change the site's
mark, re-run the script.

**`brand/` holds only what `public/` cannot.** Two lockup SVGs, normalized from
their Illustrator exports to semantic classes (`.body`, `.line`, `.line-join`,
`.ink`, `.word`) so the recolor is a five-line substitution rather than a
per-path edit.

**GRAM is not in the kit.** `public/images/gram.svg` and `gram-3d.svg` are TON's
asset, not Hipo's, and a Hipo brand kit is the wrong place to redistribute it.

**The fonts are not bundled.** Fredoka and Heebo are OFL and could be shipped,
but the only copies in this repo are `@fontsource` web subsets — latin-only
woff2, not what a designer opening the kit wants. The README links the Google
Fonts pages instead.

**`Hipo Logo Outline.png` and the `v1`/`v2` exports are dropped.** The outline is
superseded, in vector, by the light-background files. The `v1`/`v2` pairs
differed only by export size and colorway and are replaced by named files at
named sizes.

**`Hipo Logo on Dark Background.png` is regenerated, not carried over.** The old
one had a blue-black radial glow that is not in the palette. The script composes
the mark over `#201b1a` with the site's own coral `--hero-glow`.

## Verification performed

- `npm run brand-kit` — 61 files, 1.98 MB; `unzip -t` reports no errors, and two
  consecutive builds produce the same MD5.
- `file` on the generated `favicon.ico` reports a three-icon 16/32/48 resource;
  it round-trips through `sips` at 48 px.
- The flat HPO rendered beside `hgram.svg`/`hgram-3d.svg`: same flat-vs-
  dimensional relationship, hairline ring included.
- Every generated mark rendered and inspected on both a `#201b1a` and a
  `#faf6ef` ground: the light colorway drops the cream body and warms the
  linework as intended, and the extracted logotype keeps its diamond `i` dot.
- `node scripts/check-i18n.mjs` — 100 % coverage, no missing or stale items after
  `--update-hashes` for all nine released locales.
- `npm run build` — 523 pages, clean; `/docs/brand-kit/` and the nine translated
  twins carry the new copy and the ZIP is emitted to `dist/`.

## Follow-ups

- `LandingLayout`, `AppLayout` and `HpoLayout` all point their JSON-LD
  `publisher.logo.url` at `https://hipo.finance/hipo.svg`, which does not exist —
  `public/` has `hgram.svg`, `hpo.svg` and `images/hipo.svg`, but no root
  `hipo.svg`. Structured-data consumers are fetching a 404. Not touched here;
  it is a one-line fix in three layouts plus a decision about where the canonical
  logo URL should live.
- `public/favicon.ico` (and its copy at `public/images/app/favicon.ico`) is the
  pre-redesign drawing: `#776464` linework where every other icon on the site is
  `#0e0e0e`. The kit no longer copies it, but the site still serves it. The
  `ico()` helper in `scripts/build-brand-kit.mjs` will write a correct one.
- Nothing detects that the committed ZIP is stale. The build does not regenerate
  it and `prebuild` does not check it, so editing a mark under `public/` and
  forgetting `npm run brand-kit` reintroduces exactly the drift this session
  removed — now less visibly, because the docs assert the ZIP is generated. A
  `--check` mode compared in CI would close it.
- The nine translated pages are machine-translated and unreviewed, like the rest
  of the locale set.
