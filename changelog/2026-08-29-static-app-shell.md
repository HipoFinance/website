# 2026-08-29 — A static app shell instead of a spinner

Third session of the day. The dApp pages painted a spinner and a "Loading the
Hipo app…" line until the island hydrated, then swapped the whole layout in at
once. Crawlers saw the loading message where the app should be, and visitors saw
the page jump. They now paint the app's chrome — and its live figures — at build
time, and the island lands on top of markup that already matches it.

Also settles the `@ton/crypto` follow-up from
`changelog/2026-08-29-app-island-code-splitting.md`: it cannot be done from this
repository, for a reason worth writing down.

## Commits

| Commit | Description                                                 |
| ------ | ----------------------------------------------------------- |
| (this) | Paint the app chrome and its live figures before the island |

## What changed

**New `src/components/app/shell/`** — `AppShell.astro` plus `ShellHeader`,
`ShellStakeForm`, `ShellStats` and `ShellIcon`, hand-written Astro mirrors of
the island's React markup. They render into the same `[data-app-loading]`
wrapper `App.tsx` already deleted on hydration, so nothing about that mechanism
changed; only what sits inside it did.

`/stake/` and `/unstake/` get the full body: title, tab pills, the amount card,
the Connect button, the fee rows, the Telegram line, the footer links and the
stats strip. `/rewards/`, `/stats/` and `/defi/` get the header only —
`/rewards/` shows nothing until a wallet is connected, and the other two are big
enough to deserve their own pass.

### The rule the mirrors follow

**A mirror reproduces the island's first-paint state, not its eventual state.**
Rendering a figure the island would then blank out would be a worse flash than
the spinner it replaced. So: no wallet connected, nothing read from the chain,
and the chain-gated rows (`youWillReceive`, `exchangeRate`, the yearly-rewards
and transaction-cost lines) rendered present-but-empty, holding their final
height from the very first paint.

### The stats strip, and why it can carry real numbers

The exception is the three tiles under the form, and the mechanism is what makes
them safe:

- `AppLayout` inlines the build-time gauge payload as
  `<script type="application/json" id="gauge-data">`, next to the existing
  `#i18n-app` catalog tag and for the same reason — a ClientRouter swap hands
  the persisted island a fresh copy without a request.
- `ShellStats` renders its figures from that payload through a new `appStats()`
  in `src/data/gauge.ts`.
- `Model` seeds its own `gauge` and `holdersCount` from the same tag
  (`readInlineGauge`), so the island's **first** paint reproduces the identical
  strings.

`appStats()` is deliberately separate from `gaugeValues()`: it matches Model's
`statsApyFormatted` / `statsStakedCompact` / `statsHoldersFormatted`, which
round differently from the landing page's copies of the same numbers (compact
with one fraction digit and a compact holder count, rather than two digits and
an exact count).

### Details that would otherwise bite

- The wrapper is `data-tma-hide`. This is the desktop chrome; inside Telegram
  the island renders `TmaApp`, and the inline script in `<head>` has already set
  `html.tma` so the shell never paints there.
- The balances drawer is rendered as an empty `max-h-0 overflow-hidden` div. The
  island fills it with content clipped to the same zero height, so both are 0 px
  and the card sits at the same offset either way.
- `ShellIcon.astro` carries lucide's icon paths and its `defaultAttributes` by
  hand, because Astro cannot render the React icon components. Re-check them
  against `node_modules/lucide-react/dist/esm/icons/<name>.mjs` when bumping.
- The site-wide `site.app.loading` string is now unused in code. Left in the
  catalogs rather than removed from ten locales for no gain.

## Verification performed

Headless Chrome against the production build, served by `astro preview`:

- **The shell is removed on hydration** on all five pages (0 `data-app-loading`
  divs remain), and the island renders in every case — **0 JS errors**
  throughout. (An early "not removed" reading was my own grep matching the word
  `data-app-loading` inside the HTML comment I had just written in `AppLayout`.)
- **No blink on the numbers.** The static shell and the hydrated island both
  read `17.34% APY, last round`, `8M GRAM staked`, `23.4K hGRAM holders`. This
  test is stronger than it looks: on localhost the v4 endpoint is CORS-blocked
  to the production origin, so the chain never answers — those figures can only
  have come from the seeded `#gauge-data`.
- **Shell-vs-island text diff**: 0.962 similarity on `/stake/`, 0.969 on
  `/unstake/`. The only remaining difference is the clipped balances drawer
  described above. An earlier run of this same diff caught a real bug — the
  shell was missing the "Swap on exchange" link, which is _visible_ on
  `/unstake/` and would have caused exactly the jump this work removes. Added,
  along with the transaction-cost tooltip.
- `npm run build` clean, 512 pages. `node scripts/check-i18n.mjs` ok — the
  shell adds no new keys, it reuses the island's `app` catalog.
- The static HTML for `/stake/` now contains the whole app UI and the live
  figures, where it previously contained "Loading the Hipo app…".

## The `@ton/crypto` follow-up: not possible from here

The previous entry suggested `@ton/crypto` + `tweetnacl` + `jssha` (~250 KB)
looked purely transitive, since the site never holds private keys. That was
wrong twice over, and both corrections are worth keeping:

1. **`@ton/core` needs `@ton/crypto` itself.** Its `wonderCalculator` — cell
   hashing, entirely load-bearing — calls `sha256`. Only `safeSign` and
   `domainSignature` want the signing half.
2. **The `@ton/ton` barrel arrives regardless of how we import.** It is
   CommonJS, has no `module` field and no `exports` map, so Rollup pulls the
   whole graph; and `@hipo-finance/sdk`'s compiled `dist/index.js` does a plain
   `require("@ton/ton")`, so the barrel comes in through the sdk no matter what
   `chain.ts` asks for.

Measured, not assumed: rewriting `chain.ts` to deep-import
`@ton/ton/dist/client/TonClient4` and take `Address`/`Dictionary`/`fromNano`/
`toNano` from `@ton/core` changed the chain chunk from **143,594 to 143,566
bytes gzipped — 28 bytes** — and `WalletContractV4`, `MultisigWallet` and
`mnemonicToPrivateKey` were all still in it. The experiment was reverted.

The fix belongs upstream in `@hipo-finance/sdk`, which Hipo owns: deep-import
the few `@ton/ton` entry points it actually needs, or ship an ESM build so
Rollup can tree-shake it. A `resolve.alias` shim for `@ton/ton` in this repo
would work too, but it would silently change what the sdk sees on the money
path, which is not a trade worth making here.

## Follow-ups

- Body mirrors for `/stats/` and `/defi/`. `/defi/` is a static link list and
  should be easy; `/stats/` is charts and needs thought about what a chartless
  first paint looks like.
- The shell's Connect button is inert until hydration. The window is short now
  (48 KB island) and a press during it does nothing rather than misbehaving,
  but it is the one way the shell is less honest than the spinner was.
- Upstream `@hipo-finance/sdk` change described above — the only route to the
  remaining ~250 KB.
- `mobx` (211 KB of source) is still the largest single item in the eager chunk.
