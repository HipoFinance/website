# 2026-08-12 — Site chrome unification, live fee, HPO refresh

A team-feedback round relayed by Behrang, plus the follow-ups from the previous session:
Alireza's gauge deploy made the protocol fee live, and the liteserver read-endpoint spec
was written and committed for review.

| Commit    | Description                                           |
| --------- | ----------------------------------------------------- |
| `a32bdc7` | Make the protocol fee live and swap the hero mascot.  |
| `0d7a3b1` | Unify the header, footer, and banner across the site. |
| `1ba2e3c` | Refresh the HPO page and the Hipo Club section.       |
| `3f5e434` | Add the self-hosted TON v4 read-endpoint spec.        |

### Live protocol fee and mascot

- Alireza's gauge commit `5912000` added `treasury.protocol_fee` to `/data` as a percent
  (GovernanceFee/65535×100, same convention as `current_apy`). The landing hero pill and
  stats-row card now start as an em dash and fill from the fetch — guarded with `!= null`,
  not `> 0`, since zero is the real value. The app's Stats page needed nothing: its fee
  caption was already computed from on-chain treasury state.
- The hero mascot is the new 3D piggy-bank render (`Hipo-Bank-3D-2.png` → webp in place at
  `public/images/hipo-bank.webp`, 101 KB, alpha verified byte-identical) and is hidden
  below `lg`, where the hero stacks to one column.

### One chrome everywhere

The team flagged that the header changed completely between pages and that the home and
app footers differed. Decisions made:

- **One flat menu** (chosen by Behrang from three options): Home · HPO · Docs · FAQ ·
  Stake · Rewards · Stats · DeFi on every non-docs page, current page in coral. The new
  `SiteHeader.astro` renders it on static pages; the app's React header renders the same
  bar with the wallet button in the CTA slot. The app's pill sub-menu is gone (it
  duplicated Stats and hid Rewards/DeFi from the rest of the site); the mobile bottom tab
  bar now covers all widths below `lg`, and the inline nav shows from `lg` because eight
  items need the room.
- **The footer difference was inherited, not designed** — the app footer came from the old
  app, the slim landing/HPO footers from the redesign mock. Unified on the richer layout
  as `SiteFooter.astro` (Telegram CTA card, Social/Docs columns, copyright) with an `app`
  prop for the bottom-bar clearance. `LandingHeader/Footer`, `HpoHeader/Footer`, and
  `AppFooter` are deleted.
- **The announcement banner went global.** Two implementations existed (static
  `Banner.astro` on home with localStorage, a React copy in the app header with a 24h
  cookie). The static one now renders on home, FAQ, HPO, and the app pages — dismissed
  once site-wide, re-shown by bumping `HIDDEN_CODE` in `banner.js`, which now re-inits on
  `astro:page-load` so ClientRouter body swaps don't lose it. The React banner and its
  Model plumbing (`isBannerClosed`, cookie helpers) are removed; TMA mode hides the banner
  with the rest of the static shell.
- **Logo without the disk** (matching the docs header) in the site header, footer, app
  header, and TMA header. The HPO page header's external `stats.hipo.finance` link — and
  the docs header's — now point at `/stats/`; the remaining external stats links are
  in-content references and stay.

### HPO page refresh

- Removed every number without a live or documented source: the 3.1M/1.1M/147K/146K
  community claims and "Only 12% of 500M stakable GRAM". Replacements are live-backed or
  qualitative ("Audited & open-source", reworded "Room to grow").
- New "**$HPO is built to get scarcer**" section, all claims from the docs: fixed 1B
  supply; Oct 2025 team-token burn (90% of the first year's release) with 24→48-month
  vesting extension; seasonal burns of unclaimed Hipo Club rewards; club-level reset on
  selling.
- FAQ: the seven stale TGE/ILO/FDV questions (one had a broken title) collapsed into one
  historical launch question; new questions cover value drivers, the shrinking supply, and
  earning HPO through Hipo Club's current per-validation-round reward model.
- Landing's Hipo Club card gained the `star-shine.svg` icon and now links to
  `/docs/giveaways-and-prizes/hipo-club/` instead of the docs root.

### Liteserver spec

`specs/ton-v4-read-endpoint.md`, written via the `/spec` interview: tonwhales `ton-api-v4`
in front of Hipo's existing liteserver at `v4.hipo.finance` (nginx: origin-locked CORS,
rate limit, cache), client-side failover in `Model.ts` to the public endpoint on 3
consecutive failures or a 10-minute-stale last block, 60 s recovery probe. Committed for
review — **implementation has not started**; the server half lands in the operation and
nginx repos.

### Verification performed

- `npm run build` clean; prettier clean; `tsc --noEmit` zero errors under `src/`.
- Built-HTML greps: banner present on all five page types; identical footer everywhere;
  flat-menu links in both the static pages and the app bundle; no old community numbers
  anywhere in `dist/`; the React banner code absent from the island bundle; em-dash fee
  placeholders and the `protocol_fee` wiring in the home page.
- Mascot conversion checked pixel-level (alpha histogram identical to the source PNG).
- **Browser pass skipped** — the Chrome extension was disconnected all session. Worth
  eyeballing after deploy: the app header at tablet width, the bottom tab bar on app
  pages, and the banner behavior across in-app navigation.

### Follow-ups

- Post-deploy visual check (above), plus the rate chart/sparkline items from 2026-08-11
  are confirmed done.
- Alireza can drop the old 6-metric Prometheus allowlist entry (Behrang pinged).
- Review of the TON v4 read-endpoint spec, then implementation in a follow-up session.
- Docs pages intentionally keep Starlight's own chrome (no banner, own header); revisit if
  the team wants the banner there too.
