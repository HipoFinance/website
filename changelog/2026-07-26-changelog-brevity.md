# 2026-07-26 (second session) — Changelog brevity rule

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. A
documentation-only session: no site code changed. The maintainer asked twice,
unprompted, that the root `CHANGELOG.md` stay very brief and that detail live in
the per-session reports, so the convention in `CLAUDE.md` was sharpened to say
so concretely.

| Commit    | Summary                                                                             |
| --------- | ----------------------------------------------------------------------------------- |
| `a02294c` | Update changelog strategy. (the tightened rule itself, committed by the maintainer) |

This report and the `CHANGELOG.md` entry land in a follow-up commit.

---

### What changed

`CLAUDE.md`'s Changelog section described the root file as "a brief running log
… then a few bullets." That was too loose to constrain anything: the first
session to follow it (`cef455b`, earlier today) produced **eight bullets, most
of them two or three lines with their rationale inline** — a near-duplicate of
the report it linked to, which defeats the point of splitting the two files.

The rule is now concrete:

- **3–5 one-line bullets**, naming only _what_ changed.
- No rationale, trade-offs, tables or sub-bullets in the root.
- The tie-breaker: **if a bullet needs a second line to make sense, it belongs
  in the report instead.**
- The report is named as the only place detail goes, and explicitly allowed to
  be long — the previous wording gave no such permission, which is part of why
  detail leaked upward.

`CHANGELOG.md`'s own header was updated to match, since it also said only
"Brief running log."

### Why the convention, not just this session's behaviour

The instruction could have been satisfied by writing a short entry this once.
Recording it in `CLAUDE.md` instead makes it hold for sessions that never see
this conversation, which is the same reason the convention was written down in
the first place. It is also stored in Claude Code's per-project memory, so the
preference survives independently of the repo.

### This session's own entry

Written to the new rule as a working example: two one-line bullets. The root
file now contains one entry that follows the convention and five that predate
it.

### Deferred

- **Retrofitting the five existing entries** was offered — the reasoning in them
  is already duplicated in their reports, so trimming would lose nothing — and
  was not taken up. Left as-is; the rule applies going forward. Worth doing
  eventually so the file stops contradicting its own stated convention.

---

### Verification performed

- `npx prettier --check CHANGELOG.md CLAUDE.md changelog/2026-07-26-changelog-brevity.md`
- No build run: nothing under `src/` or `public/` was touched, and none of these
  three files is part of the Astro build.
- Confirmed the two `changelog/` links in the new root entry and this report's
  back-link to `CHANGELOG.md` resolve to files that exist.

### Follow-ups

- Carried over and still open: **the `docs.hipo.finance` Cloudflare cutover**
  has not been executed. See
  [the previous session's report](2026-07-26-faq-anchors-and-cutover-runbook.md#follow-ups);
  the runbook is in `specs/gitbook-docs-migration.md`.
- The five pre-rule `CHANGELOG.md` entries remain verbose (above).
- `origin/alirezaravanbakhsh-patch-1` ("Delete .github/workflows/deploy") is a
  stale remote branch, unrelated to this session, and can probably be deleted.
