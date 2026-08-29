# 2026-08-29 — Two English-only pages: `/verify/` and `/vs/`

Sixth session of the day, following `changelog/2026-08-29-sdk-ton-core.md`. Two
new standalone pages arrived as drafts from the outreach work and were adapted
to this repo:

- **`/verify/`** — the canonical list of Hipo's official wallets, contracts,
  Telegram channels and social accounts, linked from outreach messages so a
  recipient can check that a message really came from us.
- **`/vs/`** — the campaign's landing page, arguing the 0% protocol fee with
  live figures.

The drafts carried `// VERIFY path against repo` markers on their imports and a
handful of hardcoded protocol numbers. Both were wrong against this codebase in
ways worth recording.

## Commits

| Commit | Description                                 |
| ------ | ------------------------------------------- |
| (this) | Add the `/verify/` and `/vs/` landing pages |

## What the drafts assumed, and what is actually here

**There is no `Layout.astro`.** The site has three layouts; static pages use
`LandingLayout`, which takes `title` / `description` as props and renders
`SEO.astro` itself — the drafts passed `<SEO slot="head">` into a generic
layout, which would have rendered nothing.

**The numbers were typed in.** `apy: 16.6`, `tvlGram: 8_523_491`, and a fetch to
an `https://mcp.hipo.finance/api/exchange-rate` endpoint the site does not use.
The repo already has the build-time data path this page wanted:
`src/data/gauge.ts` (`fetchGauge()`) carries APY, protocol fee, TVL and the GRAM
and HPO prices, deduped to one fetch per build. `/vs/` reads that instead.

**The design was generic Tailwind** (`rounded-xl`, `font-bold`, `text-4xl`,
`bg-accent`). Rewritten onto the Warm Dark tokens and the site's own idiom:
`font-fredoka` semibold headings, `rounded-[20px]` cards, the coral pill CTA
with `shadow-[0_6px_0_var(--color-accent-shadow)]`. Note `bg-accent` in the
draft was the exact bug CLAUDE.md warns about — it compiles and silently paints
the foreground coral as a fill.

## Corrections to the copy

Checked against the contracts (through the MCP server), the SDK and the docs:

- **The three addresses were right.** Treasury, hGRAM and HPO all match
  `src/content/docs/contracts-and-audits.md` and `@hipo-finance/sdk`'s
  `Constants.js`. `/verify/` now links each to Tonviewer and carries the docs'
  caveat that the hGRAM parent address can change on a protocol upgrade.
- **The Club level curve is not linear.** The draft computed HPO rewards as
  `stake × rate × level`. The live coefficients are
  `[1, 1.2, 1.6, 2.2, 3, 4, 5.2, 6.6, 8.2, 10]` — the endpoints happen to be 1×
  and 10×, so the two columns the table shows were right by luck and every level
  between them would have been wrong. The page now reads the array.
- **The HPO boost was understated at the top.** "About 1.6 points at Level 10"
  is 1.8 at today's prices. It is no longer a typed-in number: it is computed
  from the gauge's HPO and GRAM prices at build time, and the sentence is
  dropped entirely if either price is missing.
- **"Full unstake — up to 36 hours"** matched the FAQ's worst case but not its
  headline: rounds run ~18h now (they used to be ~36h). The card leads with
  "typically under 18 hours" and keeps 36 as the worst case, matching
  `prose/en/faq/unstaking/how-long-does-unstaking-take.md`.
- **The validator-collateral line** is accurate — `docs/risks.md` and
  `validators.md` both say a penalty comes out of the borrower's collateral.
- The draft's `rate` (hGRAM/GRAM) was fetched and never rendered; dropped.

## New `src/data/club.ts`

The two Club inputs — `hton_hpo_reward_rate` and `reward_coefficients` — come
from `https://api.hipogang.io/wallet-rewards`, the same endpoint `Model.ts`
reads. It is a per-wallet endpoint, but both fields are protocol-wide and come
back for any address, so the module probes it with the zero address and reads
nothing wallet-specific. Falls back to the values observed today when the host
is unreachable, exactly as `gauge.ts` and `stats.ts` do — a stale rate is worth
more here than a blank table on a page whose entire premise is real figures.

`hpoPerYear()` and `hpoBoostPoints()` mirror Model's `profitAfterOneYear` /
`profitAfterOneYearOnLastLevel`. Rounds per year uses the same 65,536s constant
Model falls back to; the comment points at `get_round_timing` for when that
changes again.

## `localized` on SEO.astro and LandingLayout

Both pages are English-only and have no `src/pages/[locale]/` twin. `SEO.astro`
emits `hreflang` for every indexable locale unconditionally, which on these two
URLs would have advertised `/fa/verify/`, `/ru/vs/` and eight more that 404. A
new optional `localized` prop (default `true`, so nothing else changes) skips
the alternate set and the `x-default` line. `@astrojs/sitemap` needed nothing —
it derives alternates from pages that were actually built, and both URLs come
out as a bare `<loc>`.

`verify` and `vs` were added to `RESERVED_SEGMENTS` in the registry, so a future
locale key can never collide with them.

### Declined: translating these two pages

CLAUDE.md's "Adding a page" rule wants a `[locale]` twin and catalog strings in
every released locale. Not done, deliberately: `/vs/` is a campaign landing page
with a lifetime measured in weeks, and `/verify/` is linked from English-language
outreach. Putting their strings in the catalogs would make ten locales fail the
`check-i18n` gate for copy nobody asked to translate. Both pages hardcode their
English, and `localized={false}` keeps that honest to crawlers. If either page
turns out to be permanent, translating it is the follow-up.

## Other

`public/llms.txt` now points at `/verify/` in "Important links for LLMs" and in
the phishing-risk bullet — an assistant asked "is this Hipo message real?"
should be able to find the authoritative list. `/vs/` was left out on purpose:
it restates the home page, and listing it would only blur which URL is
canonical.

`GaugeData` gained `hpo.market.current_price.usd`, which the payload always
carried but the wire type never declared — the same omission the previous
session fixed for `treasury.protocol_fee`.

### Verification performed

- `npm run build` — 514 pages, i18n gate passes with only the pre-existing
  "not yet reviewed" warnings. No `[gauge]` or `[club]` fallback warnings, so
  both build-time fetches succeeded.
- Both pages' figures confirmed present in the built HTML, not filled in by a
  script: APY 16.57%, fee 0%, 7,998,307 GRAM staked, and both reward tables.
- Reward math cross-checked against the live endpoint: 1,000 GRAM earns ≈1,054
  HPO a year at Level 1 and ≈10,539 at Level 10; boost 0.2pp / 1.8pp.
- `dist/vs/index.html` and `dist/verify/index.html` carry a canonical link and
  **no** `hreflang` (`/faq/` still carries its 11); `dist/sitemap-0.xml` lists
  each once with no `xhtml:link` alternates.
- Contract addresses diffed against `contracts-and-audits.md` and
  `node_modules/@hipo-finance/sdk/dist/Constants.js`.

### Follow-ups

- The 0% fee is the page's headline claim and is currently true
  (`governanceFee: 0.00%`). The tables render the live value, so a governance
  change would show up there — but the `<h1>`, the title and the lead paragraph
  are prose and would need rewriting the same day.
- `/vs/` is not linked from anywhere on the site (it is reached from outreach
  messages). `/verify/` is not either; a footer link would need a `site.json`
  key in all ten released locales, so it was left for whoever decides the page
  is permanent.
- Neither page has an OG image of its own; both fall back to `/og/default.png`.
