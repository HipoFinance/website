# 2026-09-16 — The stake figure in the `/vs/` Hipo card never moved

Reported from Telegram: on `/vs/`, in "The 0% fee, in GRAM", the last card's caption —
"your 100,000 GRAM with Hipo today" — kept saying 100,000 no matter which preset chip was
pressed or what was typed into the amount field. Every other figure in that section re-scaled
correctly, which is what made it look like a stale number rather than a broken control.

| Commit | Subject |
| --- | --- |
| (this session) | Re-scale the stake named in the `/vs/` Hipo card caption |

## What was wrong

`src/scripts/vs-stake.js` rewrites the section by looking up `data-vs-cell` spans baked into the
static HTML: `hipoEnd`, `end:<id>`, `earned:<id>`, `extra:<id>` and so on. It has always called
`set('stake', gram(stake))` as part of that sweep — but `VsRoute.astro` rendered the caption as

```astro
{t('vs.compare.hipoEndLabel', { stake: gram(DEFAULT_STAKE) })}
```

so the build-time amount went into the sentence as plain text and no `data-vs-cell="stake"` node
ever existed. `set()` is a deliberate no-op for a missing cell (that is what lets the shared cell
list cover pages that render only some of them), so the mismatch was silent: the script did its
work, the caption simply was not part of the DOM it could reach.

## The fix

The `{stake}` placeholder is now filled with the span itself, in the frontmatter:

```ts
const hipoEndLabel = t('vs.compare.hipoEndLabel', {
  stake: `<span data-vs-cell="stake" class="num">${gram(DEFAULT_STAKE)}</span>`,
})
```

and the caption renders with `set:html`. Two things decided the shape:

- **Interpolate the markup, do not split the sentence in the template.** Splitting the translated
  string around the placeholder and rendering `{before}<span>…</span>{after}` is the more usual
  move, but Astro keeps template whitespace, so any line break Prettier introduced between those
  three nodes would become a space in the output. English and German would have survived that;
  Arabic's `"الـ{stake} GRAM …"` deliberately has no space before the figure and would have grown
  one. Interpolation has no whitespace to leak.
- **`num` on the span**, per the RTL rule in `CLAUDE.md`: an isolated, tabular figure inside
  running text. The digits themselves were already localised — `١٠٠٬٠٠٠` in `ar`, `۱۰۰٬۰۰۰` in
  `fa` — since both the build and the script format through `src/i18n/format.ts`.

No catalog changed, so no locale work followed: all ten `vs.json` files already carry `{stake}`,
and the fix is in how that placeholder is filled rather than in the copy.

### Verification performed

- `npm run build` (the `check-i18n` prebuild gate included) — clean, 542 pages.
- Grepped the built HTML: `dist/vs/index.html` renders
  `…class="num">100,000</span> GRAM with Hipo today`, `dist/ar/vs/index.html` renders
  `الـ<span …>١٠٠٬٠٠٠</span> GRAM …` with no space introduced before the figure, and
  `dist/fa/vs/index.html` likewise.
- `npx prettier --check` on the touched file — unchanged.

### Follow-ups

- `vs-stake.js` also sets `earnedUsd:hipo` and `earnedUsd:<id>`, which no cell in the current
  markup carries. Harmless today (the same silent no-op), but it is the same shape as this bug:
  the script's cell list and the template's spans have no check tying them together. If a third
  figure goes missing, consider having the script warn in dev on a `set()` that hits nothing.
