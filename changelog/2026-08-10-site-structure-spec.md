# 2026-08-10 — Site structure redesign spec

A spec-interview session (`/spec`), no implementation. Behrang wants the hash-fragment SPA at
`/app/` dissolved into path-based, crawlable pages to help SEO and UX. The session produced
`specs/site-structure-redesign.md` after a three-round interview; that spec is the source of
truth for the future implementation session.

| Commit | Description |
| ------ | ----------- |
| _(this session's single commit)_ | Add the site structure redesign spec and changelog entry. |

### Decisions made in the interview

- **Static prerender, not SSR.** Hosting stays GitHub Pages; each new URL is build-time HTML
  with live data hydrating client-side. True SSR was declined as unnecessary for SEO.
- **URL map:** `/stake/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/`; `/unstake/` is its
  own URL rendering the shared stake/unstake widget with the unstake tab active.
- **Navigation mechanism.** Behrang picked "shared island + client router (react-router)" in
  the interview, but validation surfaced a flaw: SEO copy must live in the static shell
  outside the `client:only` island, and a React-router takeover would leave the previous
  page's copy on screen after in-app navigation. The spec therefore uses Astro
  `<ClientRouter />` + `transition:persist` — same promised behavior (instant nav, wallet and
  polling state survive, real URLs), correct static copy per page. Flagged for review since
  it deviates from the literal interview answer.
- **Real SEO content per page** — Behrang committed to purpose-written copy, meta, and
  JSON-LD per page; drafted during implementation, reviewed before merge.
- **`/app/` dies.** It becomes a `noindex` stub that best-effort-maps the legacy
  `#/page=…/tab=…` hash to the new URLs, falling back to `/stake/`. The TonConnect manifest
  moves to the site root (copy kept at the old path for existing wallet sessions); the
  BotFather Mini App URL update is an external follow-up.
- **Testnet support removed entirely** — not just the `#network=testnet` switch but all
  `isMainnet` branches, testnet addresses, `TestnetBadge`, and the network-mismatch flow.
  The lighter "remove the switch only" option was explicitly declined.
- **Deferred to the design phase:** unified site-wide header/nav; app pages keep the React
  `Header`/`Footer` for now. Graphical redesign is the next project after this one.
- **URL details settled in review:** `/rewards/` (plural) over `/reward/` — matches search
  phrasing and convention. Trailing slashes stay site-wide: SEO-equivalent either way, but
  GitHub Pages has no redirect config, so dropping them would 404 every indexed URL, while
  the directory-style output auto-301s `/stake` → `/stake/` for free.
- **Client rewrite considered and declined.** A framework rewrite (Svelte/Solid/Preact/etc.)
  buys little — bundle weight is dominated by the TON libraries, the stack doesn't block the
  next projects, and there are no tests to guard a rewrite. Instead: incremental refactoring
  after this restructure lands, starting with splitting the 1500-line `Model.ts` into domain
  stores (wallet, chain polling, staking flows, stats) in a later session.
- **Read-path reliability accepted as a follow-up.** Public v4 endpoints via ton-access are
  flaky; the plan is a self-hosted liteserver + `ton-api-v4` frontend behind a cache (infra
  in the `operation`/`nginx` repos), with the client trying the Hipo endpoint first and
  falling back to ton-access. Added to the spec's follow-ups; to be specced separately.

### Verification performed

None — no code changed. The spec records its own acceptance checks (build succeeds,
per-page copy present in `dist/` HTML, deep links and legacy redirects work).

### Follow-ups

- Behrang reviews the spec; implementation happens in a later session with the spec as input.
- After the future deploy: update the BotFather Mini App URL, update external catalogs that
  link to `/app/`, watch Search Console.
