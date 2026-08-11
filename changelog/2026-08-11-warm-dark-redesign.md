# 2026-08-11 — Warm Dark redesign

Implementation of the "Warm Dark" full-site redesign from Behrang's Claude Design handoff
bundle (`Hipo.finance website redesign.zip`: a README spec plus per-page `.dc.html`
high-fidelity references). Work was split across three subagents — landing/FAQ (fast-worker),
HPO/docs theme (fast-worker), and the staking app island (deep-reasoner) — with the
orchestrator owning the shared token layer and integration. Builds on the previous session's
URL restructure; not yet pushed.

| Commit    | Description                                                   |
| --------- | ------------------------------------------------------------- |
| `b982912` | Implement the Warm Dark visual redesign across the whole site |

### Decisions made with Behrang up front

- **Single warm-dark theme site-wide** — light mode and every theme toggle removed, docs
  included (Starlight forced dark via `ThemeProvider`/`ThemeSelect` component overrides).
- **Stats page keeps all data** — the design's 4-card + chart-grid layout, with the existing
  Market sections and all five history charts restyled into it rather than dropped.
- **Reward page uses the design's shell with real data** — no "accrued HPO" / "next
  distribution" rows, since no data source exists for them.
- **Telegram Mini App variant deferred** — the design's Telegram-specific chrome would need
  `@twa-dev/sdk` back; the webview gets the responsive pages for now.
- **HPO page content** (asked mid-session after the agent flagged the design omits old
  sections): the airdrop is over, so the Partners airdrop grid and Airdrop schedule table are
  gone for good; the 12-question HPO FAQ and both YouTube videos were restored below the
  designed sections, restyled. The README's stale assumptions (hash navigation, `/app`,
  `@twa-dev/sdk`) were overridden with the current path-based architecture.

### What changed

- **Token layer** (`src/styles/global.css`): Warm Dark palette (`--color-bg/surface/
surface-deep/border/text*/accent*/positive`) and faces `--font-body` (Heebo) /
  `--font-fredoka` in `@theme`; `@fontsource-variable/fredoka` added, Heebo imported globally.
  Legacy palette and `hipo-*` utilities remain as dead code pending a sweep.
- **Landing** rebuilt to the design's seven sections with exact copy and audit links; live
  numbers (hero APY, stats row, HPO panel) filled by new `src/scripts/landing-data.js` from
  the gauge, design placeholders as fallback. Banner restyled in normal flow (fixed-position
  hack removed). Footer is the deep-band design. 404 restyled minimally.
- **FAQ** rebuilt as a sticky 220px section nav + native `<details>` accordions; all 67
  questions ported verbatim, all 76 anchor ids preserved (verified programmatically); the
  old per-question "#" permalink icons were dropped (ids remain for deep links).
- **HPO** rebuilt per design (hero market card with static SVG sparkline — the old CoinGecko
  iframe doesn't fit the design and no owned price-history source exists; `GeckoChart.astro`
  left unused), plus the restored videos/FAQ. `hpo-data.js` ids kept working.
- **Docs** themed warm-dark entirely through `docs.css` custom properties; Fredoka headings;
  sidebar/ToC/search/prev-next per design; header links FAQ / Stats / Open app via a clean
  `Header` component override (a documented override point in Starlight 0.40). Breadcrumbs
  from the mockup were skipped (no Starlight 0.40 equivalent without touching content).
- **App island** restyled throughout: pill nav header, segmented stake/unstake, deep input
  wells, coral CTAs with hard offset shadows, restyled balances panel, Wait/alerts/upgrade
  flows, DeFi cards, under-card links (Docs, FAQ, Audits, Treasury on explorer). The
  stake-page Stats panel became three compact cards (metric explanations moved to `title`
  tooltips). The five app pages' SEO copy sections and cross-link nav match the new language.
- **Wallet button**: TonConnect's widget button is gone (`buttonRootId` removed);
  the header renders our own coral connect pill / bordered `UQBx…9kFa · Disconnect` pill via
  `tonConnectUI.openModal()` and a new `Model.disconnect()`. The dropdown-portal adoption
  stays as a harmless no-op safeguard; toast adoption, old-body `removeChild` defusal, and
  `tc-using-mouse` modality tracking remain load-bearing. TonConnect UI itself is pinned to
  `THEME.DARK` with a warm-dark `colorsSet`.
- **Stats page**: design pill range switcher relabelled `24H/1W/1M/3M/1Y` (no "All" —
  Prometheus retention rolls off and the left edge would drift); TVL and Active-stakers cards
  get real computed deltas (`charts/delta.ts`), APY carries the protocol fee, the rate card
  the "only goes up" caption; charts recolored (coral/green/off-white, coral area fill,
  `#3d3331` gridlines). TVL-in-USD and compact-staked computeds added to the Model from
  already-fetched gauge data.
- **App logo link unified** (Behrang's review catch): the app header's logo linked to the
  absolute `https://hipo.finance` — a leftover from the standalone-SPA era — while the
  marketing headers used `/`. Now `/` everywhere.
- **Island footer moved to the layout** (orchestrator): the static footer now lives in
  `src/components/AppFooter.astro` rendered at the end of `AppLayout`, below the SEO copy and
  cross-links — inside the island it sat mid-document. `Footer.tsx` deleted.
- **Dependencies**: `@fontsource-variable/fredoka` added; `@fontsource/poppins` and
  `@fontsource/eczar` dropped (no references remain). CLAUDE.md styling/dApp sections updated.
- **Legacy sweep** (same session, after Behrang approved): every pre-redesign token and
  utility removed from `global.css` and `app.css` — the old palette (orange/brown/choco/
  milky/blue/purples/darkblues/`c1`–`c7`/`dark-50`–`950`/etc.), `--font-family-*` tokens,
  the fractional-width and rotation utilities, all `hipo-*` `@utility` blocks, and the
  `.dark` `@custom-variant` (zero `dark:` variants remain). Every removal was grep-verified
  at zero usages first; the only literal matches for `hipo-*` names are anchors/URLs/
  filenames, and the app's `bg-black/60` modal scrims now use Tailwind's built-in black
  (previously shadowed by an identical custom token). `GeckoChart.astro` deleted (zero
  imports). `global.css` shrank from 269 to 30 lines, `app.css` from 240 to 28. Post-sweep
  build green; dist CSS confirmed to contain all Warm Dark utilities and none of the removed
  ones (the only remaining "purple" in built CSS is Starlight's internal `--sl-color-purple`).

### Verification performed

- `npm run build` green (49 pages). Compiled CSS spot-checked for every token utility family
  (`font-fredoka`, `font-body`, `bg-surface*`, `bg-accent`, `text-positive`, …).
- HTTP checks on the preview build: home renders Fredoka classes; FAQ serves exactly 67
  `<details>`; HPO serves both video embeds; docs serve `data-theme="dark"` with zero
  theme-select markup; app pages carry the restyled copy; 404 on-theme.
- FAQ anchor-id parity old-vs-new verified programmatically by the landing agent (76/76).
- Side-by-side visual pass in Chrome against the `.dc.html` references: Home matches the
  mockup through every section (hero pixel-close, live gauge numbers replacing the
  placeholders); FAQ, HPO (including the restored sections), docs, Stake (compared directly
  against `App.dc.html`), Unstake, Rewards, DeFi, and Stats all render on-design. One bug
  found and fixed: `Hpo.astro` referenced `/images/hpo.png` (correct path `/hpo.png`), which
  broke the market-card icon.
- App smoke test post-redesign: view-transition navigation still preserves the island (marker
  survives, no reloads), the custom connect button opens the TonConnect modal correctly in
  the dark theme, and the new pill nav navigates.
- The Stats history charts show their (restyled) "Couldn't load history / Retry" state when
  the site runs on localhost — the gauge's Prometheus endpoint doesn't serve cross-origin
  requests, and Behrang confirmed charts work in production. The redesign did not touch the
  endpoint or fetch logic (diff-verified — only display labels changed).

### Follow-ups

- Exchange-rate history chart: needs a `hipo_treasury_rate`-style metric from the gauge's
  Prometheus exporter; the fourth design chart slot waits on it.
- Telegram Mini App chrome (deferred above) as its own project with real-device testing.
- Docs sidebar groups remain collapsible (Starlight native) though the mockup shows them
  always-open; revisit only if it bothers anyone.
