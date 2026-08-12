# 2026-08-12 — Team feedback round: copy, app UX, exact on-chain stats

Second session of the day: a 16-item feedback batch relayed from the team, plus two
follow-up asks (a copyable exact staked figure, and on-chain-first stats).

| Commit    | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| `1621484` | Show a loading indicator while the app island loads.             |
| `e2702e4` | Apply the team copy feedback across landing, HPO, and docs.      |
| `679b7e6` | Apply the app UX feedback: icons, compact DeFi, help, CTA.       |
| `ac43036` | Show the exact staked amount and prefer on-chain over the gauge. |

### De-jargoning and landing copy (`e2702e4`)

- **"Protocol fee" → "Staking fee"** (hero pill, stats card, banner, Stats-page caption)
  and **"APY" → "Yearly rewards"** (landing, stake widget rows, TMA header) — "protocol"
  and "APY" are nerd jargon to the target audience. The Stats page's chart/card keeps
  "APY" as the technical context; flagged as a possible follow-up.
- **HPO is "the decision-making & profit-sharing token"** — "governance" dropped from
  headlines (home panel, HPO hero, page meta, FAQ); the "Participate in governance"
  utility card became "Vote on key decisions". **Every `$HPO` became `HPO`**, docs
  included (six md files).
- **Fiat first**: the landing staked card leads with the dollar figure, "staked, worth N
  GRAM" beneath, "TVL" removed. **Exact counts**: holders show the real number (23,194),
  not "23,000+".
- **Hipo Club** moved above the HPO panel; step 3 of "How it works" became "Earn free
  HPO" mentioning that club + HPO rewards come free with staking, linking `#hipo-club`.
- **Footer**: "Open-source **GRAM** liquid staking on TON", a **Help & support** link
  (Telegram chat), and the duplicate copyright row removed (follow-up ask).
- **Burned so far** on the HPO tokenomics card: live, computed as 1B minted minus the
  on-chain jetton total supply from tonapi (~22.2M today), em dash on failure — never a
  hardcoded number. CORS verified for hipo.finance. Follow-up: have the gauge expose
  this to drop the third-party call.
- The tokenomics doc's vesting note rendered odd squares — broken `abs-0.twimg.com`
  emoji images from the GitBook import; replaced with a markdown list.

### App UX (`1621484`, `679b7e6`)

- **Loading placeholder**: the app pages showed bare SEO copy until the island hydrated;
  a spinner + "Loading the Hipo app…" now fills the slot, removed by `App.tsx` on mount
  and on every `astro:page-load` (each swapped-in page carries a fresh copy).
- **Balances strip** inset (`mx-3.5`) and tucked 18 px under the form card — reads as a
  drawer sliding out from behind the stake/unstake card, per Behrang's original design
  intent.
- **DeFi page** rebuilt as two compact cards: Exchanges (DeDust/STON.fi/TONCO rows, each
  with Swap and Earn pills — merging the old separate liquidity section) and Wallets.
  "DEX" → "exchange" in user-facing copy. The live DEX rate was skipped (marked "not
  needed", and the protocol rate would mislead next to DEX prices).
- **Bottom tab bars** (web below `lg`, and TMA) got lucide icons (Coins/Gift/
  ChartLine/ArrowLeftRight).
- **TMA rewards page**: claim/connect button renders above the detail rows/illustration
  so it can't be missed below the fold; desktop keeps the original order.
- **Help/reassurance**: "Questions or something unclear? Ask us on Telegram — a real
  person replies" under the stake form in both chromes, plus the footer link.

### Exact figure + on-chain priority (`ac43036`)

- New `Model.statsStakedExact` (full-GRAM, `en-US` grouping); the Stats staked card
  shows it as an always-visible selectable line ("exactly 8,285,160 GRAM") via a new
  `StatCard` `exact` prop — the copy-paste source for community posts. The landing
  staked card carries the same figure as a native tooltip.
- The stats getters with two sources (APY, staked ×3, the USD TVL's GRAM side) now
  prefer `treasuryState` (contract reads via the block poller) and fall back to the
  gauge only until the first treasury read lands — the gauge lags the chain. First-paint
  speed is preserved: gauge fills first, chain takes over. Holders/market stats remain
  gauge-only (no contract source); the hGRAM/GRAM rate was already chain-only.

### Verification performed

- `npm run build` clean; prettier clean; `tsc --noEmit` zero errors under `src/` after
  every step.
- Built-output greps: section order, all renames (zero "Protocol fee" left in HTML),
  placeholder present in app pages' HTML and its removal code in the bundle, icons and
  "Ask us on Telegram" in the island bundle, `hpoBurned` wiring, no `$HPO` or twimg
  leftovers, minified tooltip assignment in the inlined landing script.
- tonapi probed with `Origin: https://hipo.finance` — CORS allows it; supply
  977,788,535 HPO → burned ≈ 22.2M, consistent with the documented burns.
- Browser pass not possible (Chrome extension disconnected); the visual-judgment items —
  balance strip proportions, TMA rewards layout, compact DeFi cards — need a human look
  on production.

### Follow-ups

- Eyeball on production: balance strip, TMA rewards/DeFi, tab icons, loading spinner.
- Ask Alireza to expose the burned-HPO figure via the gauge, replacing the tonapi call.
- Possibly rename the Stats page's remaining "APY" labels to "Yearly rewards".
- The TON v4 read-endpoint spec is still awaiting review before implementation.
