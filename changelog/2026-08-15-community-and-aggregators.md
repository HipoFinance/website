# 2026-08-15 — Community section, aggregators, and content refresh

A batch of six content improvements requested by Behrang: surfacing the GroypFi
and swap.coffee aggregators (on the dApp's DeFi page and in the "How to buy
HPO" steps), a new Hipo Community section on the landing page, removal of the
hero badge row, a "Burned So Far" pointer in the tokenomics docs, and a new 3D
mascot render on the home page.

## Commits

| Commit    | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `6786125` | Add GroypFi and swap.coffee aggregators to the DeFi page                    |
| `d6d40c1` | Add the Hipo Community section, drop the hero badges, and update the mascot |
| `c7bd750` | Broaden the buy-HPO venues and link the docs to the live burn counter       |

## DeFi page: Aggregators section

`Defi.tsx` gained a third `Section`, "Aggregators", between Exchanges and
Wallets, listing GroypFi and swap.coffee with a single Swap action each. The
swap URLs live in `Model.ts` next to the other partner URLs
(`groypfiSwapUrl`, `swapCoffeeSwapUrl`); both point at the hGRAM jetton
master, matching the pre-existing GroypFi URL used by `Model.swapUrl`.

Logos were fetched fresh: GroypFi's from `groypfi.io/icon-256-fullbleed.png`,
swap.coffee's from their GitHub org avatar (their site only serves a 32×32
favicon, too small for the retina 36px slot). Both were downscaled to 128px
and saved as `public/images/app/groypfi.png` / `swapcoffee.png`. Both are
square full-bleed images, so the rows pass `round` (rendered as circles, like
Ton Space and MyTonWallet).

The static SEO prose on `/defi/` (`src/pages/defi/index.astro`) gained a
matching "Swap via aggregators" card so the crawlable copy stays in sync with
the island.

## "How to buy HPO" step 03

The step used to name only STON.fi. It now reads:

> Head to your favorite DEX or aggregator — STON.fi, DeDust, TONCO, GroypFi,
> or swap.coffee — and connect your TON wallet.

Kept as plain text (no links), matching the other steps.

## Landing page

- **Hero badge row removed** ("Audited ×4 / No lockup / Top rewards"), per
  request. `/images/shild.svg` was its only consumer and was deleted;
  `lockup.svg` is still used by `Hpo.astro` and stays.
- **New "Hipo Community" section** (`id='hipo-community'`) inserted directly
  above Hipo Club, mirroring its banner-card markup (border, rounded-[28px],
  coral gradient, `heart-shine.svg` icon, pill CTA). The gradient runs at
  240° instead of Hipo Club's 120° so the two adjacent banners don't read as
  duplicates. CTA links to `https://t.me/hipo_chat`.
- **New mascot render**: `public/images/hipo-bank.webp` replaced in place
  with the new 3D piggy-bank render (800×800, ~105 KB, from
  `Hipo-Bank-3D-5.webp`). Same filename, so no markup change; GitHub Pages'
  10-minute cache means the swap propagates quickly.

## Tokenomics docs: Burned So Far

`src/content/docs/.../tokenomics.md` gained a `### Burned So Far` section
pointing to the live burned counter. Rather than duplicating a number that
would go stale, it links to `/hpo/#tokenomics` — a new `id='tokenomics'`
added to the section wrapping the donut chart and burn counter in
`Hpo.astro`. Root-relative link, matching the prevailing docs convention.

Prettier normalized the whole doc's bullets (`*` → `-`) as a side effect. Its
first pass also nested the `:::note` closing fence under the list; the fix
(a blank line before `:::`) exposed a GitBook-era trailing `\` after
"as follows:", which then rendered as a literal backslash — removed it.

### Verification performed

- `npm run build` passes (49 pages, Pagefind index built).
- Grepped built output: `hipo-community` present and "Audited" absent on
  `/`; GroypFi + swap.coffee present on `/defi/`; `id='tokenomics'` on
  `/hpo/`; "Burned So Far" + `/hpo/#tokenomics` link on the docs page.
- Rendered HTML of the vesting `:::note` inspected before/after the
  backslash fix.
- Both new logos visually inspected after downscale.

## Follow-ups done in-session

All three follow-ups spotted during the main work were applied before
committing, at Behrang's request:

- Swept the last `hpo.hipo.finance` links from the docs — 5 hits across 4
  files (`hipo-usd1-000-000-rewards-program.md`, `hipo-governance-token-hpo.md`,
  `hpo-tokens-distribution.md`, `tokenomics.md`), all rewritten as
  root-relative `/hpo/` links with natural link text instead of a hostname.
- Deleted the now-unreferenced `public/images/shild.svg`.
- Added `rel='noopener noreferrer'` to the `Defi.tsx` action pills (the
  named `target` windows are kept and still work with noopener).

### Follow-ups

- None outstanding.
