# 2026-08-22 — Light theme, and a mobile carousel for the steps

Added a light palette to the whole site, reversing the "single-theme dark, no
light mode anywhere" decision taken with the Warm Dark redesign
(changelog 2026-08-11). The request arrived as a design handoff —
`home-light.html` plus a written palette mapping — covering the home page only;
the scope was widened to the entire site (landing pages, dApp, docs, 404,
Telegram Mini App) at the user's direction, because the header, the footer and
the token layer are shared and a light `/` beside a dark `/faq/` would have read
as a bug.

The scheme is chosen by `prefers-color-scheme` and nothing else: no toggle, no
`localStorage`, no `.dark` class. Warm Dark stays the _authored_ base, so a
browser that does not support the media query still gets the original design.

## Commits

| Commit    | Description                                                         |
| --------- | ------------------------------------------------------------------- |
| `ec2123d` | Add a light theme, and rework the home page steps and section order |

## What changed

### The token layer

- **`src/styles/global.css`** — the `@theme` block keeps the Warm Dark values;
  a `@media (prefers-color-scheme: light)` block re-declares the same custom
  properties with the light palette. This works because Tailwind 4 emits
  `@theme` into `@layer theme`, and unlayered rules beat layered ones whatever
  the source order — so the override needs no `!important` and no specificity
  trick.
- Values that are not surface colors (the hero glow, the two artwork
  drop-shadows) moved out of the `--color-*` namespace into plain `:root`
  properties, read through `var()` from arbitrary utilities. Keeping them in
  `--color-*` would have generated a dozen meaningless `bg-art-shadow`-style
  utilities.
- `color-scheme: dark light` on `:root` (and a matching `<meta>`, below) so
  scrollbars and form controls follow.

Palette mapping, as specified in the handoff:

| Token                                | Dark      | Light      |
| ------------------------------------ | --------- | ---------- |
| `--color-bg`                         | `#201b1a` | `#faf6ef`  |
| `--color-surface`                    | `#2b2423` | `#ffffff`  |
| `--color-surface-deep`               | `#171312` | `#f1e9de`  |
| `--color-border`                     | `#3d3331` | `#e7dccf`  |
| `--color-text`                       | `#f5efe8` | `#291f20`  |
| `--color-text-muted`                 | `#c2b5ac` | `#6f6058`  |
| `--color-text-faint`                 | `#8d7f76` | unchanged  |
| `--color-accent` (foreground coral)  | `#ff7e73` | `#e0574b`  |
| `--color-accent-fill` (solid coral)  | `#ff7e73` | unchanged  |
| `--color-accent-shadow`              | `#c1544a` | unchanged  |
| `--color-on-accent`                  | `#291f20` | unchanged  |
| `--color-positive`                   | `#4ade80` | `#16a34a`  |
| `--hero-glow`                        | `.28` α   | `.35` α    |
| `--art-shadow` / `--art-shadow-soft` | black     | warm brown |

### Splitting coral in two

The handoff's central constraint: coral **as text** has to darken on cream to
stay legible, while coral **as a button fill** (dark text on top) stays the
brand `#ff7e73`. One token could not carry both, so:

- `--color-accent` became the foreground coral — it now darkens in light mode.
  Every `text-accent`, `hover:text-accent`, `hover:text-accent-hover` and
  `border-accent` in the codebase (≈150 occurrences) kept working unchanged and
  simply got the right value.
- `--color-accent-fill` / `--color-accent-fill-hover` are new and hold the
  fixed brand coral. The 55 `bg-accent` / `hover:bg-accent-hover` occurrences
  were swept to `bg-accent-fill` / `hover:bg-accent-fill-hover`.

Sweeping the 55 backgrounds rather than the 150 foregrounds was the smaller
change _and_ the more honest naming: the thing that needed a new name is the
one that behaves specially.

Two consequences worth noting:

- `::selection` is a _background_ with `--color-on-accent` text on it, so it
  moved to `--color-accent-fill` in both `LandingLayout.astro` and `docs.css`.
  Left on `--color-accent` it would have painted near-black text on dark red.
- Starlight's `--sl-color-bg-accent` (skip link, banner) is likewise a fill
  paired with `--sl-color-text-invert`, so it maps to the fill coral too.

### Fixed-in-both-themes colors

Three colors deliberately do **not** flip, and got tokens so they stop being
implicit:

- `--color-mark-chip` (`#f5efe8`) — the cream disc behind the monochrome
  Quantstamp and TonTech marks on the home page. It was `bg-text`, which would
  have flipped it to near-black and swallowed the (dark) logos. The handoff's
  `home-light.html` keeps it cream, which is what the token now encodes.
- `--color-on-gradient` (`#fffdf8`) — the "ET" / "DS" initials on the auditor
  avatars. They sit on their own green/blue gradient, not on the page, so they
  inherited `text-text` and would have gone dark-on-dark. Now forced light, as
  the handoff's component note asks.
- `--color-accent-fill`, above.

### The logo

The handoff's note about "dropping the cream circle wrapper" described an
earlier design iteration — the current markup has no wrapper, just a bare
`hipo.svg`. The real problem is inside the file: the mark is a **cream body**
(`#efebe5`) with black linework drawn on top, so on a cream page the body
vanishes and only the linework survives.

`public/images/hipo-light.svg` is a new companion generated from `hipo.svg` by
dropping the body fill (`fill: none`) and warming the linework from `#0e0e0e`
to the palette ink `#291f20` — warm-dark line art on a transparent body. It was
rendered against `#faf6ef` (page), `#ffffff` (cards) and `#f1e9de` (footer)
before being committed; a transparent body was chosen over a cream one
precisely so all three grounds work.

Both `<img>`s ship at every logo site (`SiteHeader`, `SiteFooter`, app
`Header.tsx`, `TmaHeader.tsx`) and `.logo-on-dark` / `.logo-on-light` in
`global.css` display one. The docs header gets the same treatment for free
through Starlight's `logo: { light, dark }`.

### Docs (`/docs/`)

- **`src/components/starlight/ThemeProvider.astro`** no longer pins
  `data-theme='dark'`; it now bridges `prefers-color-scheme` to `data-theme`
  and re-applies on change. Inline and in `<head>`, so it runs before the first
  paint. `ThemeSelect.astro` still renders nothing — there is still no picker.
- **`src/styles/docs.css`** grew a `:root[data-theme='light']` block with the
  light `--hipo-*` primitives. The `--sl-color-*` mapping block moved to the
  selector `:root, :root[data-theme='light']`: Starlight ships its own
  `:root[data-theme='light']` palette, which outranks a bare `:root`, and
  would otherwise have replaced our mapping with its stock light colors the
  moment the docs went light. Matching that specificity keeps the mapping
  pointed at the `--hipo-*` primitives in both schemes, so the primitives stay
  the only thing that changes.
- `--hipo-accent-high` inverts from _lighter_ than accent (`#ffc4bf`) to
  _darker_ (`#a83a2f`): Starlight uses it as the high-contrast accent for text
  sitting on `--sl-color-accent-low`.
- The backdrop overlay became `--hipo-overlay` so it can lighten with the page.
- Code-block themes switch on their own — Expressive Code keys off
  `data-theme`, which now moves.

### The dApp

- **`src/styles/app.css`** — `--chart-grid` follows `--color-border`;
  `--chart-ink` is unchanged because `--color-text-faint` is.
- **`src/components/app/Model.ts`** — the TonConnect modal takes one fixed
  theme, so both `colorsSet` palettes are now supplied and
  `preferredTonConnectTheme()` reads the media query at construction.
  `syncTonConnectTheme` pushes a later scheme change into the live modal via
  `uiOptions`, which matters because the modal is long-lived (it survives
  `ClientRouter` swaps — see `keepRuntimeStyles`).
- **`src/components/app/tma/telegram.ts`** — the header, background and
  bottom-bar colors Telegram paints around the mini app now follow the scheme.
  Read once at startup: Telegram exposes no theme-change callback, and startup
  is when the mini app is (re)opened anyway.
- `hover:bg-[#4a3f3c]` (a hardcoded lighter-than-border hover on the small
  chips in `StakeUnstake.tsx` and `MultisigGuidance.tsx`) became
  `hover:bg-border-strong`, a new token — the literal would have been a dark
  blob on the light page.

### Browser chrome

`theme-color` and `color-scheme` metas moved from `AppLayout.astro` (app pages
only) into the shared `SEO.astro`, so all three layouts get them, and
`theme-color` is now split by `media` per scheme. `color-scheme` is
`dark light` — dark first, matching the base palette a browser with no
preference receives.

### "How Hipo works" as a mobile carousel

A second, unrelated request in the same session: below `sm` the four step cards
stacked into a four-deep column that pushed the rest of the page down. They are
now a snapping horizontal carousel, which is what the design handoff
(`Home.dc.html`) always specified for that section — and only that section;
`#audits` and `#why-hipo` are plain grids there too.

Implemented on the existing grid container rather than a new wrapper:
`grid-flow-col` with `auto-cols-[minmax(min(260px,78vw),1fr)]` plus
`overflow-x-auto` and `snap-x snap-mandatory`, reverting to
`sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-4` from `sm` up. `-mx-6 px-6`
cancels the section's own padding so cards bleed to the screen edge while the
first still lines up under the heading, and `scroll-p-6` puts a snapped card
back on that line.

The scrollbar is hidden (`[scrollbar-width:none]` plus the WebKit
pseudo-element), which is only defensible because the card width —
`min(260px, 78vw)` — guarantees the next card peeks in at every phone width,
and that peek is the affordance. No JS: scroll snap does all of it.

### Home page order and the Hipo Club link

Two small follow-up requests, also in this session:

- **Security audits moved to the end of the home page**, after "Why Hipo?".
  Nothing links to `#audits`, so the anchor move is safe. The `pb-18` that kept
  the last section clear of the footer moved with it, and "Why Hipo?" went back
  to the uniform `py-12`.
- **The Hipo Club button** now points at `https://t.me/HipoFinanceBot` instead
  of `.../join`.

The same `/join` URL survives in five other places that were left alone because
the request named the Hipo Club button specifically: the app's **Claim
Rewards** button (`Reward.tsx:30`, a different CTA), and four docs pages
(`tutorials/staking.md`, `giveaways-and-prizes/hipo-gang.md`,
`.../hipo-gang/hipo-gang-season-1.md`, `introduction/hipo-rewards.md`). If
`/join` is wrong rather than merely redundant, those want the same edit — see
Follow-ups.

### Telegram write access

The `/join` removal from the Hipo Club button was reverted: the goal behind it
was being able to message those users, and dropping the mini-app path was the
wrong lever for that. `Telegram.WebApp.requestWriteAccess()` (Bot API 6.9) is
the right one — it shows Telegram's native "allow this bot to message you"
prompt — so the direct link is back and the permission is asked for instead.

Two limits shaped where the call could actually go:

- **It is a mini-app runtime method, not something a link can carry.**
  `Telegram.WebApp` only exists while the page is running inside a Telegram
  webview. The "Join Hipo Club" button on hipo.finance, the docs links and the
  Claim Rewards button in the web app are ordinary links that _navigate to_
  Telegram; there is no `WebApp` object at click time. Asking for write access
  "on the links" is therefore not implementable — the ask has to happen inside
  whichever mini app the user lands in.
- **Each mini app must ask for itself.** The call added here is in
  `tma/telegram.ts`, which is the staking mini app this repo serves. The docs
  distinguish `t.me/HipoFinanceBot/app` ("Telegram Mini App") from
  `t.me/HipoFinanceBot/join` ("Hipo Club"), and there is no Hipo Club code in
  this repository — so users arriving through the Hipo Club link need the same
  call added in _that_ codebase. See Follow-ups.

The call sits last in `initTelegramChrome`, after the chrome is settled, and is
skipped when `initDataUnsafe.user.allow_write_to_pm` is already true — users who
started the bot are reachable already and re-asking would spend a popup for
nothing. That field is real but absent from `@twa-dev/types`, hence the cast.
`requestWriteAccess` throws `WebAppWriteAccessRequested` on a second call in the
same session, which the existing `guard()` swallows.

## Decisions

- **Scope: whole site.** Home-only was the literal request; it was widened
  after flagging that the header, footer, banner and tokens are shared with
  `/faq/` and `/hpo/`, and that a light landing page leading into a dark dApp
  would look broken. The user chose everything, including docs and the dApp.
- **System-only, no toggle.** Offered a header toggle with `localStorage` and a
  no-flash bootstrap script as an alternative; the user chose the OS setting as
  the only input. This keeps the site free of theme-bootstrap JS entirely
  (the docs' `ThemeProvider` is three lines and only mirrors the media query
  into an attribute Starlight already understands).
- **Dark stays the authored base.** The light values live in the media query
  rather than the other way round, so a browser without `prefers-color-scheme`
  support degrades to the original design rather than to a half-applied one.
- **A transparent logo body over a cream one.** A cream-filled body would have
  shown a faint patch on the `#f1e9de` footer and on white cards. Verified by
  rendering against all three grounds.
- **Not changed:** the HPO donut segment colors (`#6fc7b2`, `#7ea6e0`,
  `#b795e0`, `#9ab87c`) and the amber burn arc (`#ffb03a`) in `Hpo.astro`, the
  `rgba(255,126,115,.12)` coral washes under charts and behind the Hipo Club /
  Community panels, and the `bg-black/60` modal scrims. The handoff does not
  mention any of them and they read acceptably on both grounds; see Follow-ups.

## Verification performed

- `npm run build` — clean, 50 pages, Pagefind index rebuilt.
- `npx prettier --write` over every touched file.
- Inspected the emitted `dist/_astro/global.*.css`: both palettes present
  (`--color-accent: #ff7e73` in `:root`, `#e0574b` in the light block); the new
  utilities `bg-accent-fill`, `hover:bg-accent-fill-hover`, `bg-mark-chip`,
  `text-on-gradient`, `hover:bg-border-strong` all generated and pointing at
  their tokens; `.logo-on-dark` / `.logo-on-light` swap under the media query.
- Grepped the whole `src/` tree for raw hex, `rgba(`, `drop-shadow`, gradients
  and Tailwind palette colors (`text-green-500`-style) to make sure nothing
  scheme-dependent was left hardcoded. The only survivors are the deliberate
  exceptions listed under Decisions.
- Rendered `hipo-light.svg` with sharp against `#faf6ef`, `#ffffff` and
  `#f1e9de`, alongside the dark original on `#201b1a`, and compared.
- Screenshotted `/`, `/faq/`, `/hpo/`, `/docs/`, `/stake/` and the 404 page at
  1280px in both schemes against `npm run preview`, and compared them pairwise.
  Dark is pixel-unchanged where it should be; light matches the handoff.
- Section order read back from the rendered DOM after the move
  (`how-it-works → hipo-community → hipo-club → hpo → why-hipo → audits`), and
  the foot of the page screenshotted to confirm the spacing above the footer
  survived the `pb-18` handover. Button `href` read back as
  `https://t.me/HipoFinanceBot`.
- Carousel: shot `#how-it-works` at 390px (both schemes), 640px and 1024px.
  Confirmed the track scrolls (`scrollWidth` 1136 vs `clientWidth` 390),
  that a snap lands card 2 exactly on the heading's left edge, and that 640px
  and 1024px still render the unchanged 2- and 4-column grids.

Getting a browser to run here took a detour worth recording: Playwright's
`chrome-headless-shell` downloads fine but will not start — eleven system
libraries are missing (`libatk-1.0`, `libatk-bridge-2.0`, `libatspi`, `libgbm`,
`libasound`, `libX{composite,damage,fixes,randr,i,render}`). Rather than
`sudo apt-get install`, they were fetched with `apt-get download` (no root) and
unpacked with `dpkg -x` into a scratch prefix on `LD_LIBRARY_PATH`. Nothing was
installed system-wide.

Two things the screenshots could **not** show, because the sandbox has no
network to them: the HPO sparkline (`gauge.hipo.finance`) and any live
blockchain state in the dApp (the stake page renders its "Unable to access
blockchain" toast). Those two surfaces are unverified in light mode.

## Follow-ups

Three of these were closed after the deploy, once the live site made the
data-backed surfaces reachable (the sandbox could not reach
`gauge.hipo.finance` or the TON endpoint during the build):

- ~~Check the HPO sparkline and donut, and the `/stats/` charts.~~ Done against
  https://hipo.finance in both schemes. All read correctly on cream.
- ~~The HPO donut's pastel segments may lose definition on white.~~ They do not
  — all six stay distinct against `#ffffff`. The concern was unfounded. The one
  element that _is_ faint on white is the small amber burn arc (`#ffb03a`), but
  it is a two-degree tick and no more prominent in dark mode.
- ~~The `.12`-alpha coral washes are near-invisible on cream.~~ Overstated:
  subtle but clearly present under the TVL chart and the HPO sparkline. Raising
  the alpha in light mode is a taste call, not a fix.

Three more were closed in the same round of review:

- ~~`--color-body-strong` is dead weight.~~ Deleted from both palettes; it had
  no reference anywhere in `src/`.
- ~~The carousel is scoped to below `sm` rather than every width, as the
  handoff has it.~~ Confirmed as the wanted behaviour; the handoff's universal
  version is not being adopted.
- ~~Compare later work against `home-light.html` rather than this changelog.~~
  Moot: the light theme now covers every page, so the home-only handoff is no
  longer the reference.

Still open:

- ~~Decide whether `/join` should be shortened elsewhere.~~ Resolved the other
  way: the link is back to `/join` everywhere, with write access requested from
  inside the mini app instead.
- **Add `requestWriteAccess()` to the Hipo Club mini app** (`.../join`), which
  is not in this repository. Without it, users who reach Telegram through the
  Hipo Club button are still unreachable by the bot — this repo's call only
  covers people who open the staking mini app.
- **Decide when the prompt should fire.** It is on mini-app open right now,
  which maximises coverage but is the moment users are least invested; moving
  it to a point of intent would convert better. Moving it is a one-line change.
- Verify the premise end to end with a test account: confirm that a user who
  reaches the bot only through a direct mini-app link is genuinely unmessageable
  until the prompt is accepted. That is the documented behaviour, but it was not
  testable from here — it needs the bot token.
