# 2026-08-25 — Fixing the banner's layout shift

Search Console's Core Web Vitals report flagged `https://hipo.finance` for
**CLS above 0.1 on mobile**. The cause was the promo banner, and this session
fixes it. LCP on mobile is also flagged and is _not_ fixed here — see
Follow-ups, it is a different and much larger problem.

## Commits

| Commit | Description                                    |
| ------ | ---------------------------------------------- |
| (this) | Decide the promo banner before the first paint |

## The cause

`Banner.astro` shipped the bar with Tailwind's `hidden`, and `banner.js` — a
bundled module script, therefore deferred — removed that class on load after
reading `localStorage`. Confirmed against the live site before touching
anything: the served HTML contained

```
id="site-banner" class="bg-accent-fill text-on-accent hidden"
```

while the post-JavaScript DOM contained the same element without `hidden`.

So for every visitor who had not dismissed it, a full-width bar was inserted at
the very top of an already-painted page, pushing the entire document down. That
is close to the worst shape a layout shift can take: maximum distance, and it
moves everything.

It affected every page that renders `Banner.astro` — `HomeRoute`, `FaqRoute`,
`HpoRoute` and `AppLayout` — but Search Console reported the home page, which is
where the traffic is.

## The fix

Invert it: the banner now renders **visible** and is hidden before paint when it
should not appear, rather than rendering hidden and being revealed after.

- **`src/scripts/banner-constants.js`** (new) — `BANNER_KEY`, `HIDDEN_CODE` and
  the new `OFF_CLASS`, imported by both the component and the script so the two
  cannot drift. `HIDDEN_CODE` keeps its role as the deploy-time knob that
  re-shows the banner to everyone.
- **`Banner.astro`** — an `is:inline` script sitting immediately above the
  banner markup reads `localStorage` and puts `.banner-off` on `<html>`. Being
  inline and unbundled it is parser-blocking, so it runs while the parser is
  still above the banner: the bar is either painted in the first frame or never
  painted at all. A module script would have been deferred and defeated the
  point, which is exactly how the bug arose.
- **`global.css`** — `.banner-off #site-banner { display: none }`. The class
  goes on `<html>` rather than the banner precisely because the decision has to
  be expressible before the element exists.
- **`banner.js`** — no longer reveals anything. It now only wires the dismiss
  click and re-applies the class across view transitions.

### Why `astro:after-swap` and not `astro:page-load`

The app pages navigate through `ClientRouter`, and Astro's `swapRootAttributes`
(`node_modules/astro/dist/transitions/swap-functions.js`) **removes every
attribute from `<html>`** and re-adds them from the incoming document — so
`.banner-off` is dropped on every swap. Verified in the installed source rather
than assumed.

`astro:after-swap` fires after the new DOM is in place but before the browser
paints it, so re-applying there restores the class invisibly. `astro:page-load`
runs later and would have reintroduced the very shift being fixed. Listener
wiring, which has no such constraint, stays on `astro:page-load`.

## Verification performed

- `npm run build` — clean, 502 pages.
- The built home page now ships `class="bg-accent-fill text-on-accent"` with no
  `hidden`, and the `.banner-off` script appears at byte 7068 against the banner
  markup at 9702 — i.e. the decision is genuinely made before the markup.
- End-to-end in a headless browser against `npm run preview`, one profile reused
  so storage persisted:
  - fresh visitor → `<html class="scroll-smooth">`, banner painted immediately;
  - after seeding `site_banner_hidden=1` → `<html class="scroll-smooth
banner-off">`, banner never painted;
  - reloading `/` in the same profile → still `banner-off`.
- Confirmed the `.banner-off` rule survives into the built CSS bundle.

## Follow-ups

- **LCP on mobile is untouched and is the bigger problem.** The five flagged
  URLs are almost certainly the five dApp pages: `/` ships 1.6 KB of JavaScript,
  while `/stake/` and friends ship 1.27 MB raw — 310 KB gzipped over the wire —
  and render nothing server-side (`AppIsland` is `client:only`, so `<main>` is
  empty until React hydrates). Fixing it means loading the TON SDK and
  TonConnect on demand instead of upfront, and/or painting a real static first
  screen. That is a project, not a patch.
- **The language-suggestion bar will reintroduce this bug.** `#lang-suggest`
  still ships `hidden` and is revealed by JavaScript, because whether it applies
  depends on `navigator.languages` and cannot be decided from storage alone. It
  renders only once a second locale reaches status `public`, so it is inert
  today — but it needs the same pre-paint treatment before that happens, or it
  will reserve the CLS problem a fresh home.
- CLS is field data on a 28-day rolling window: this will not show in Search
  Console for weeks. "Validate Fix" starts Google's own re-check sooner.
