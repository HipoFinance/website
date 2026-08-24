# 2026-08-24 — Copy-link icons for the FAQ and HPO anchors

The `/faq/` and `/hpo/` anchors added earlier today are only useful if a reader can find the link to copy.
This session gives every deep-linkable heading and question a small link icon that appears on hover and puts
the absolute URL on the clipboard. English only, like the rest of the content work; fa/ru/hi stay `draft` and
pick the two new strings up in the locale sync.

## Commits

| Commit    | Description                                    |
| --------- | ---------------------------------------------- |
| `pending` | Add copy-link icons to the FAQ and HPO anchors |

## What changed

- **`src/components/AnchorLink.astro`** (new) — the icon itself: a real `<a href="#id">` carrying
  `data-anchor-copy`, a translated `aria-label`/`title`, and the confirmation text in `data-copied`. Its
  scoped styles size it with `clamp(13px, 0.8em, 18px)` so it follows the heading it trails without ever
  growing past a discreet 18px, and it is `opacity: 0` until the heading is hovered.
- **`src/scripts/anchor-copy.ts`** (new) — one delegated `click` listener for the whole page. A plain left
  click is intercepted (`preventDefault`, so inside a `<summary>` the answer does not toggle and the page does
  not jump), `navigator.clipboard.writeText(link.href)` copies the absolute URL, and the icon flashes for
  1.4 s. Modified clicks (⌘/Ctrl/Shift/Alt, middle click) are left to the browser, so "open in new tab" and
  "copy link address" keep working. Without a secure context the deprecated `execCommand('copy')` textarea
  trick is the fallback; if even that fails the link falls back to normal navigation so the URL bar holds the
  anchor.
- **`src/components/FAQ.astro`** — the icon on each section `<h2>` and each question `<summary>`, whose parent
  gets the `anchor-host` class the hover rule keys on (49 icons: 9 sections + 40 questions).
- **`src/components/Hpo.astro`** — the same on the six section headings (`#utility`, `#tokenomics`,
  `#scarcity`, `#investors`, `#watch`, `#faq`) and the seven FAQ questions (13 icons).
- **`src/scripts/details-anchors.ts`** — its delegated click handler now ignores `[data-anchor-copy]` links,
  which share the anchor but must not scroll or re-open the `<details>`.
- **`src/i18n/en/site.json`** — `site.anchor.copy` ("Copy link") and `site.anchor.copied` ("Link copied").

## Design decisions

- **Inline, not in the margin.** GitHub-style icons live in the left margin; that would collide with the RTL
  layouts and with the `<summary>` marker, so the icon trails the text instead. It keeps its box when hidden,
  so revealing it on hover never reflows the heading.
- **Hover to reveal, but not on touch.** The reveal rule sits in `@media (hover: hover)`; under
  `@media (hover: none)` the icon stays at `opacity: .4` instead, since a touch reader has no way to hover it
  and copying a link matters most on a phone. `:focus-visible` also reveals it, so it is keyboard-reachable.
- **Copy instead of navigate.** A reader who hovers the icon wants the URL, not another jump to the answer
  they are already reading, so the click copies and leaves the page (and the history) untouched. The element
  stays an `<a href="#id">`, so the no-JS and modified-click behaviours are still plain deep links.
- **Confirmation as a tooltip.** The copied state shows `data-copied` in a small `::after` bubble above the
  icon and tints it `--color-positive` for 1.4 s. The bubble's `translateX(-50%)` is mirrored under
  `html[dir='rtl']`.
- **Docs were left alone** — Starlight already renders its own anchor links on `/docs/` headings.

### Verification performed

- `npm run build` — 52 pages, exit 0.
- `node scripts/check-i18n.mjs` — `i18n: ok, 12 warning(s)`, the expected draft-locale warnings; the two new
  keys show up under fa/ru/hi `missing`, to be filled in the locale sync.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 15 groups passed.
- `npx prettier --check 'src/**/*.{astro,ts,js,json}'` — clean.
- `dist/faq/index.html`: 49 icons (9 section anchors + 40 question anchors), every `href` matching an existing
  `id`; `dist/hpo/index.html`: 13 (6 + 7).
- The copy module is bundled once per page (an 819-byte inline script) and once only in the dev server's
  script list — the `<script>` in `AnchorLink.astro` is deduped across its ~50 instances.

### Follow-ups

- Interaction QA in a browser (hover reveal, clipboard, RTL tooltip, touch fallback) is still pending: Chrome
  is not running behind the required proxy, so the browser tools were unavailable this session.
- `site.anchor.copy` / `site.anchor.copied` need translations in the fa/ru/hi sync.
