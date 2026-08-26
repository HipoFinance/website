# 2026-08-26 — The Hipo Club page stops restating half a rule

The Hipo Club page said, twice, that "selling rewarded HPO at any time resets
your level to Level 1". That was the whole rule when it was written. It stopped
being the whole rule when `wallets-and-rewards.md` landed the day before:
retention is measured against an amount you are expected to **keep**, summed
across every wallet connected in the Club, and selling is only one of the ways
that amount can fall short — sending HPO to an exchange, or to a wallet you
never connected, does it just as well.

A reader who only saw the Club page would therefore conclude that _not selling_
was sufficient, and could lose a level by moving HPO somewhere unconnected while
believing they had done nothing wrong. The two pages now say the same thing, and
the Club page links to the one that carries the detail.

## Commits

| Commit | Description                                                          |
| ------ | -------------------------------------------------------------------- |
| (this) | Link the Hipo Club page to the multiple-wallets rule, in ten locales |

## What changed

`src/content/docs/giveaways-and-prizes/hipo-club.md`, in both places the rule
appeared:

- Under **How Leveling Works**, the one-line caveat now names both failure modes
  rather than only selling.
- Under **Responsibilities of Club Members**, the paragraph is restated around
  the amount you are expected to keep, and a second paragraph adds the part the
  page was missing entirely — that the amount is counted across all of your
  connected Club wallets, so moving HPO between your own wallets is free — then
  links to [Using Multiple Wallets](/docs/wallets-and-rewards/) for the full rule
  and the recovery procedure.

The link is bidirectional now: `wallets-and-rewards.md` already listed Hipo Club
under _Related_.

Same edit in all nine translated locales. The concepts were already translated —
the equivalent sentences exist in each locale's own `wallets-and-rewards.md` —
so the wording was reused from there rather than translated afresh, which keeps
the two pages consistent within a locale as well as across the pair. The href
stays `/docs/wallets-and-rewards/` in every file; `remark-localize-links.mjs`
adds the locale prefix at build time.

## What was deliberately not changed

The Season 4 note at the foot of the page still describes the change from a
per-level sell allowance to "a level reset when rewarded HPO is sold". That is a
historical statement about what changed between seasons, not a statement of the
current rule, so it was left as written.

## Native review of the translations is no longer a follow-up

Asked what the remaining blockers were, the maintainer settled a follow-up that
several reports had been carrying: there are no resources for native review of
the nine locales, the LLM drafts ship as they are, and reader feedback is the
correction channel when it arrives. `--mark-reviewed` is effectively unused; the
staleness gate (`--update-hashes`, enforced by `prebuild`) is unaffected and
still runs. The follow-up has been struck through in the reports that raised it
rather than repeated again here.

Three other open items were closed by the maintainer the same day and are struck
through in their own reports: the club backend `5d270b4` is deployed (so the
multiple-wallets page and production now agree), `borrower.yaml` points at the
v2 treasury, and the reporter who diagnosed the yearly HPO figure has been told
they were right.

### Verification performed

- `npm run build` — passes, including the `prebuild` i18n gate with no missing
  items for any released locale.
- `node scripts/check-i18n.mjs` after `--update-hashes` for all nine locales —
  clean.
- Both edited spots re-read in every locale to confirm the link href was left
  unprefixed and the two-paragraph structure preserved.

### Follow-ups

- The Season 4 note is the last place on the site that frames the rule purely in
  terms of selling. It is correct as history, but if the seasons note is ever
  rewritten for a Season 5, the wording should not be copied forward.
