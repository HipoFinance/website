# The page must never scroll sideways

`/hpo/` had a horizontal scrollbar on a phone. The cause was the HPO jetton address in the first FAQ
answer — a bare 48-character `<code>` — and the deeper cause was that the site had no wrapping rule
of any kind: `grep -niE 'overflow-wrap|word-break|hyphens|overflow-x'` across `src/styles/` returned
nothing. So the report was treated as one instance of a class of bug, and the session ended with a
site-wide defence, an audit of the other 522 built pages, and the rule written into `CLAUDE.md`.

| commit    | subject                                           |
| --------- | ------------------------------------------------- |
| `fe7fee3` | Break long addresses instead of widening the page |

## Why an address overflows

A TON address is one unbreakable word. At 320 px the `/hpo/` FAQ `<details>` leaves 228 px of
usable width; the address renders in the mono face at 15 px, roughly 432 px. Given no
`overflow-wrap`, a browser will not break a word — it widens the document instead, and because
nothing on the site sets `overflow-x` on `html` or `body`, that widening became a real scrollbar
rather than a silent clip.

The same shape recurs by construction: every page that names a contract reintroduces it. A spot fix
on that one `<code>` would have been wrong.

## The defence, in `global.css`

```css
body {
  overflow-wrap: break-word;
}

code:not(pre code) {
  overflow-wrap: anywhere;
}
```

The pair is deliberate, and the two halves do different jobs:

- `break-word` inherits to everything and only breaks a word that has no line of its own to fit on,
  so ordinary prose is untouched. This is what saves the headings, the card titles and the banner
  copy — all of which the audit flagged as marginal in German and Russian.
- `break-word` does **not** lower an element's min-content width, so a flex or grid child, whose
  `min-width` is `auto`, still refuses to shrink below its longest word. `anywhere` does lower it,
  which is why it goes on `code` — the element every address on this site is marked up as — and why
  the structural cases below needed `min-w-0` rather than more CSS.

Markup that holds a long token in something other than a `code` opts in with Tailwind's own
`wrap-anywhere` or `break-all` (as `/verify/` already did) rather than a new rule in `global.css`.

Two notes on scope. These are plain rules, not `@utility`, so unlike the `num` utility below them
they do **not** need mirroring into `app.css`: a utility has to exist in each compilation because
each scans its own markup, but a plain rule just ships in this stylesheet, and `AppLayout` imports
it — verified by the app pages linking the same `global.*.css` bundle that carries the rule. And
`/docs/` is the one section this misses, which is fine: Starlight ships its own copies
(`reset.css` sets `overflow-wrap: break-word` on `code` and the headings, `markdown.css` sets
`anywhere` on `li` and makes tables `display: block; overflow: auto`, expressive-code gives `pre`
its own `overflow-x: auto`). That is what keeps `docs.css` free to go on not importing `global.css`.

`overflow-x: hidden` on `html` was considered and rejected: it hides this class of bug rather than
fixing it, and it breaks `position: sticky` descendants.

## The audit

All 523 built pages were scanned for runs of 28+ characters with no break opportunity, reporting the
tag and class list of the element holding each one, and the result was cross-read against a sweep
for the other overflow shapes — fixed widths, `whitespace-nowrap`, negative margins, flex children
without `min-w-0`.

Four structural cases were found where the CSS above is not enough, because the offending box is a
flex item whose `min-width: auto` pins it to its content:

- **The app header's wallet group** (`Header.tsx`, mirrored in `shell/ShellHeader.astro`) was
  `flex flex-none`, so it could not shrink at all. With a long Connect label — `ru` "Подключить
  кошелёк", `it` "Connetti il wallet", `hi`, `pt-br`, `id`, `de` — logo + button + hamburger +
  padding came to ~355-375 px against a 320 px viewport. `flex-none` → `min-w-0` lets the group
  shrink to the button's own min-content, so the label wraps at a word boundary instead of pushing
  the page. Both files changed identically; the shell is a hand-copied mirror and a divergence
  shows up as the page shifting when React mounts.
- **The HPO hero's three-up stat row** — three flex children, no `min-w-0`, captions that are single
  long words in German ("Marktkapitalisierung", 20 characters) and Italian. Min-content summed past
  the 192 px available inside the card.
- **The promo banner's text span** — same shape, one flex child with no `min-w-0`. Comfortable in
  English, so this one is insurance rather than a live bug.
- **The two bottom-left toasts** (`ErrorDisplay.tsx`, `MultisigGuidance.tsx`'s `Toast`) were
  `fixed start-6 … max-w-screen-sm`, i.e. up to 640 px starting 24 px in. Being `fixed` they never
  produced a document scrollbar, but they ran off the right edge of a small phone. Bounded to
  `max-w-[min(40rem,calc(100vw-3rem))]`.

One claim from the sweep was checked and refuted: `max-w-screen-sm` is not a dead Tailwind v3
holdover. Tailwind 4.3 still emits `.max-w-screen-sm{max-width:var(--breakpoint-sm)}`; the class
worked, it was simply too wide. Its replacement was checked in the build output too, because an
arbitrary value with nested commas is exactly the kind of thing Tailwind can decline to emit — it
compiles, to `max-width:min(40rem,100vw - 3rem)`. Tailwind drops the inner `calc()`, which is
correct: `min()` takes a math expression directly.

Cleared without changes: `/verify/` (already the model — `break-all` + `min-w-0` on the address
`<code>`, `shrink-0` on the label), `vs.astro`'s two `min-w-[420px]` tables (each already inside an
`overflow-x-auto` wrapper), the landing page's `-mx-6` card rail (the only negative margin in the
codebase, correctly paired with `overflow-x-auto` and `sm:mx-0 sm:overflow-visible`), the chart data
table, the Telegram Mini App chrome (`min-w-0` + `truncate` throughout), and the i18n catalogs
(the 40-character hashes in `meta.json` are review sidecars, excluded from the catalog glob and
never rendered). `whitespace-nowrap` and `whitespace-pre` do not occur anywhere in `src/`.

## The rule, recorded

`CLAUDE.md` gains a Styling bullet stating that a horizontal scrollbar is always a bug, naming the
address-shaped cause, pointing at the `global.css` defence and Starlight's equivalent, and listing
what the CSS cannot cover: a flex or grid child still needs `min-w-0`, `whitespace-nowrap` and fixed
`w-[…px]` defeat wrapping outright, a `-mx-*` bleed needs an ancestor that clips or scrolls, and
anything deliberately wider than the viewport scrolls inside its own `overflow-x: auto` box — the
document is never the scroller.

### Verification performed

- Reproduced the cause in the rendered page: `dist/hpo/index.html` carries the address as a bare
  `<code>`, and the emitted `.hpo-answer` rules (`Hpo.astro`'s scoped `<style>`) style only `ol`,
  `strong` and `a` — no `code`, no wrap declaration.
- `npm run build` — clean, 523 pages (so the `check-i18n` prebuild gate passed too), and
  `dist/_astro/global.*.css` contains both `body{overflow-wrap:break-word}` and
  `code:not(pre code){overflow-wrap:anywhere}`, plus the toasts' new
  `max-width:min(40rem,100vw - 3rem)`.
- Confirmed `/stake/` links that same bundle, so all three rules reach the dApp without duplication
  in `app.css`.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 18 groups passed.
- Scanned every built page for long unbreakable tokens and inspected the container of each hit;
  after the changes, every one sits in a `code`, in a `break-all` element, in a scrollable box, or
  in Starlight's content.
- `npx prettier --write` on every touched file — no reformatting beyond the edits.

Not verified in a browser: no headless Chrome is available in this environment and the Claude in
Chrome extension is not connected, so the 320 px geometry above is computed rather than measured. A
visual pass at 320 px on `/hpo/` and on an app page in German or Russian is worth doing.

### Follow-ups

- The bottom tab bar (`Header.tsx`, and its shell mirror) has `flex-1` children with no `min-w-0`;
  `pt-br` "Estatísticas"/"Recompensas" puts its min-content near 312 px of the 320 px available.
  Being `fixed start-0 end-0` it cannot produce a document scrollbar, so it was left alone, but the
  labels will clip. `truncate` is probably the right answer, not `min-w-0`.
- The scan is a throwaway script in the session scratchpad. If this recurs it belongs next to
  `scripts/check-i18n.mjs` as a build gate rather than being rewritten each time.
- `.hpo-answer` styles `ol`, `strong` and `a` but not `code`, so an address in an HPO FAQ answer
  renders at the inherited size in the preflight mono face, unlike `/verify/`, which sets
  `[&_code]:font-mono [&_code]:text-[13px]`. Cosmetic, and out of scope here.
