# 2026-08-23 — A staking CTA in the footer

Replaced the site-wide "Join Hipo on Telegram" strip at the top of the footer
with a staking call to action, so every page outside the app ends on a way into
`/stake/` rather than on a second invitation to Telegram.

The request came with its own reasoning: the home page already carries a **Hipo
Community** section (a full panel, with the same `t.me/hipo_chat` link and a
longer pitch), so the footer strip was saying the same thing a screen later. The
option to simply delete the strip was offered alongside replacing it; replacing
it is what was chosen here, because it fills the slot rather than leaving the
footer to open on the logo.

## Commits

| Commit | Description                                            |
| ------ | ------------------------------------------------------ |
| (this) | Replace the footer's Telegram strip with a staking CTA |

## What changed

**`src/components/SiteFooter.astro`** — the strip that read "Join Hipo on
Telegram for updates, support, and discussions." with a **Join now** button is
gone. In its place, in the same slot above the logo/links row:

> **Start Staking GRAM** — Start earning rewards and bonuses with as low as
> 1 GRAM. → **Stake now** (`/stake/`)

The copy is the same pair the home page's closing carousel card uses
(changelog 2026-08-22), deliberately: it is the one primary CTA of the site, and
a visitor who scrolled past the carousel card meets the identical offer at the
bottom rather than a differently-worded variant.

The panel matches that card's styling too — the coral gradient the Hipo
Community and Hipo Club panels use, over the standard `border-border` border,
with the primary coral pill and its hard offset shadow. It stacks on a phone and
becomes text-left/button-right from `sm` up. It does **not** reuse the old
strip's `bg-surface`; against the footer's `bg-surface-deep` the gradient is
what separates a CTA from the chrome around it.

### Nothing was lost with the strip

Both Telegram destinations are still one click away in the same footer: the
**Social** column lists "Telegram channel" (`t.me/HipoFinance`) and "Telegram
chat" (`t.me/hipo_chat`), and the **Docs** column lists "Help & support", which
is the same `t.me/hipo_chat` link the removed **Join now** button pointed at. So
the strip was the third copy of that link on the page, not the only one.

## Decisions

- **Suppressed on the app pages.** `SiteFooter` already takes an `app` prop (it
  adds the padding that clears the fixed mobile tab bar), so the CTA is rendered
  behind `!app`. "Start Staking GRAM / Stake now" at the bottom of `/stake/` —
  the app's own default page — is noise, and on `/unstake/` it is close to
  contradictory. The app pages therefore now open their footer on the logo row.
  This was a judgment call, not part of the request; it is a one-word revert
  (`!app &&`) if the CTA is wanted everywhere.
- **Left as a replacement, not a deletion.** Deleting outright was the other
  half of the request. Replacing keeps the footer's existing rhythm — a panel,
  then the links — and gives the FAQ and HPO pages a closing CTA they did not
  have, since neither carries the home page's carousel card.
- **Copy not varied for the footer.** Writing a second headline ("Ready to
  start?", and so on) was considered and dropped: two different names for the
  same action on one page is worse than one name twice.

## Verification performed

- `npm run build` — clean, 50 pages.
- Counted the CTA in the built output: `dist/index.html` has it twice (the
  carousel card and the footer), `dist/faq/index.html` and `dist/hpo/index.html`
  once each, `dist/stake/index.html` zero times.
- `grep -rl 'Join Hipo on Telegram' dist/` — no matches, so no page kept a stale
  copy of the old strip.
- Deploy watched to success and the live page re-fetched from hipo.finance.

## Follow-ups

- `src/pages/404.astro` renders no `SiteFooter` at all — it is the one page
  outside the app with neither the footer links nor any CTA. Pre-existing and
  untouched here, but it is the obvious next place for a "Stake now".
- The home page now shows four coral-gradient panels in sequence (carousel CTA,
  Hipo Community, Hipo Club, footer CTA). Each earns its place individually;
  whether the repetition of the treatment dilutes it is a design question worth
  a look, not something to change unilaterally.
