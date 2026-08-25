# 2026-08-25 — Google Analytics 4

Added GA4 (`G-3VEWCJ55NM`) to hipo.finance. The property and data stream were
created in the Google console by the user; this session covers the tag, its
placement, and the two behaviours a stock GA snippet gets wrong on this site —
the docs section and the dApp's client-side navigation.

## Commits

| Commit | Description                            |
| ------ | -------------------------------------- |
| (this) | Add Google Analytics 4 across the site |

## What changed

**`src/components/Analytics.astro`** (new) — the whole tag, in one place. The
measurement ID is a literal: it is public in the page source of every
GA-instrumented site, so making it an env var would only have forced a GitHub
Actions secret into the deploy workflow, which currently has none.

It is wired into **all three places a `<head>` is built** in this repo. Missing
any one of them is invisible — the reports just quietly under-count:

- **`src/components/SEO.astro`** — covers `LandingLayout`, `HpoLayout` and
  `AppLayout`. Placed in the shared component rather than in the three layouts
  so a fourth layout cannot forget it.
- **`src/components/starlight/Head.astro`** — Starlight owns the `<head>` of
  `/docs/` and never renders `SEO.astro`. Without this the entire documentation
  section — the largest part of the site, 40 pages per locale — would have been
  absent from every report. The override already existed (it filters draft-locale
  hreflangs); this appends to it.
- **`src/pages/404.astro`** — hand-rolls its own `<head>`.

### Client-side navigation in the dApp

`gtag('config', …)` sends exactly one `page_view`, at load. The five app pages
navigate through Astro's `ClientRouter`, which swaps the DOM without a document
load — so out of the box GA would have recorded an entire app session, however
many pages deep, as a single view. The same applies to switching locale, which
is also a swap.

The fix is a manual `page_view` on **`astro:after-swap`**. That event fires only
on swaps and never on first load, so it cannot double-count the config hit —
which `astro:page-load`, the more obvious choice, would have done.

### Splitting Telegram Mini App from web

Requested during the session: the mini app serves the same pages as the website,
so its traffic would otherwise be indistinguishable in the reports.

Every hit now carries a `hipo_platform` parameter, `telegram_mini_app` or `web`,
passed through `gtag('config', …)` so it rides along on every event sent to the
measurement ID rather than having to be repeated per event.

The value comes from `window.__hipoTma`, set by the probe already at the top of
`AppLayout`'s `<head>` — reusing it avoids a third copy of the Telegram
detection logic, which `CLAUDE.md` already warns is duplicated once between that
probe and `tma/telegram.ts`. **That probe had to move above `<SEO>`**, since
`<SEO>` is what renders `Analytics.astro`; it previously sat below both. Moving
it is harmless and arguably more correct — its own comment says it must run
before the first paint.

This requires one console step to become visible: an event-scoped custom
dimension on `hipo_platform` (Admin → Custom definitions). GA collects the
parameter either way, but does not surface an unregistered one in reports.

## Decisions

- **Runtime host gate, not `import.meta.env.PROD`.** The tag renders everywhere
  but returns immediately unless `location.host === 'hipo.finance'`, so `npm run
dev`, `npm run preview` and any fork's GitHub Pages copy stay silent while
  still serving byte-identical markup. This copies the gate on the Telegram
  analytics script already in `AppLayout`.
- **Redirect stubs left out.** `/app/` (the legacy hash-link stub) and the 40
  docs redirect stubs from the restructure carry no tag. They are `noindex`
  meta-refresh pages that bounce immediately; instrumenting them would add a hit
  in front of the real page's hit and pollute landing-page reports. The cost is
  that traffic still arriving on old links is not directly measurable — worth
  revisiting if that number matters.
- **Locale is not a custom parameter.** With ten locales the language is already
  in the page path (`/fa/stake/`), so GA can group by it without help.
- **No consent banner.** GA sets cookies; the privacy policy already discloses
  "cookies and tracking technologies" but the site asks for no opt-in, which is
  thin for EU visitors. Raised with the user and left as a separate decision,
  not silently bundled into this change.

## Verification performed

- `npm run build` — clean, 502 pages.
- Counted the tag in the built output: 501 of 542 HTML files carry it. The 41
  without are `/app/` and the 40 docs redirect stubs, each confirmed to be a
  meta-refresh page — every real page is covered, in all ten locales.
- Confirmed exactly one copy per page (no double-firing from SEO plus a layout).
- Confirmed in `dist/stake/index.html` that the Telegram probe now precedes the
  GA snippet in source order, which is what makes `hipo_platform` correct on the
  app pages.
- After deploy, loaded the live pages with a headless browser and confirmed
  `googletagmanager.com/gtag/js` is present in the post-JavaScript DOM.

## Follow-ups

- Register the `hipo_platform` custom dimension in the GA console, or the
  mini-app/web split stays collected but invisible.
- Decide on cookie consent for EU visitors.
- `/app/` and the docs redirect stubs are unmeasured by choice; instrument them
  if the volume of old-link traffic becomes a question.
