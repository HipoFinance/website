# 2026-07-22 — llms.txt rewrite

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. The
first Claude-assisted session on this repo: turn `public/llms.txt` from a file
that mixed website-authoring instructions with protocol facts into a document
aimed only at the LLMs that read it. (Written retrospectively from the commit
record.)

| Commit    | Summary                                                        |
| --------- | -------------------------------------------------------------- |
| `73865da` | Rewrite llms.txt: trim authoring copy, add technical resources |

---

### Trimmed

- **Dropped the SEO / meta / hero sections.** These were internal guidance for
  people writing website copy, not information an LLM answering questions about
  Hipo can use. Kept the parts that do serve that purpose: the naming rules
  (GRAM vs TON, hGRAM vs hTON), the FAQ, the risk guardrails, and the links.

The file shrank on net — 24 insertions against 51 deletions — despite gaining a
new section.

### Added

- **A Technical resources section** linking the contract repository's own
  documentation: architecture, integration guide, TL-B schemas and flow graphs,
  plus the current mainnet treasury and parent addresses. This gives an LLM a
  path from the summary in `llms.txt` to primary sources.

### Fixed

- **The ton.vote DAO link**, which pointed at a `/hipo` alias that was never
  registered.

---

### Verification performed

Not recorded for this session beyond the commit itself. `llms.txt` is a static
file served from `public/`, so it carries no build-time validation.

### Follow-ups

- The companion spec lives in the contract repo, not here:
  `docs/specs/2026-07-22-ai-friendly-docs-llms-txt.md`.
- `llms.txt` needs manual re-checking whenever protocol-level facts on the site
  change; `CLAUDE.md` records this obligation (added in a later session).
