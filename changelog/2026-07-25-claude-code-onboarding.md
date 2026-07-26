# 2026-07-25 — Claude Code onboarding

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. Set up
this repo for Claude-assisted work: an orientation guide and a spec-first
workflow command. No site code changed. (Written retrospectively from the commit
record.)

| Commit    | Summary                                         |
| --------- | ----------------------------------------------- |
| `f433302` | Add CLAUDE.md and /spec command for Claude Code |

---

### Documentation

- **Added `CLAUDE.md`** (46 lines), the orientation guide, covering: the npm
  commands and the Node >= 22.12 requirement; that there are no tests and no
  linter; that deployment is automatic on push to `main` via
  `.github/workflows/deploy.yml`; and that the top-level `README` describes the
  old pre-Astro setup and should not be trusted.

  It described the site as three distinct sections at the time — landing pages,
  the `/app/` React island, and `/hpo/` — plus the dApp architecture (all state
  in the single MobX `Model.ts`, navigation held in the URL hash fragment rather
  than a router), the Tailwind 4 setup with no `tailwind.config.js`, and the
  obligation to keep `public/llms.txt` in sync with protocol-level facts. The
  `/docs/` section was added to it in the next session.

### Workflow

- **Added the `/spec` slash command** (`.claude/commands/spec.md`, 42 lines): a
  three-phase workflow — interview the requester in small batches of questions
  informed by the actual codebase, then produce a spec document for review, and
  only implement later in a separate request. The command explicitly forbids
  writing implementation code during the interview phase.

  The next session used it; `specs/gitbook-docs-migration.md` is its first
  output.

---

### Verification performed

Documentation only — nothing to build or run.

### Follow-ups

- None outstanding from this session.
