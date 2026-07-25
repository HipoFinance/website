---
description: Interview me about a feature request, then write a spec for review
argument-hint: [brief feature description]
---

You are running a feature-spec interview. The feature request (possibly empty) is: $ARGUMENTS

Your job is to interview me to understand what I actually need, then produce a written spec I can review. **Do not write any implementation code during this process** — the output of this command is a spec document only. Implementation happens later, in a separate request, after I've reviewed and approved the spec.

## Phase 1 — Interview

Ask me questions to understand the feature. Use the AskUserQuestion tool when the answers are enumerable choices; use plain text questions when they're open-ended. Ask in small batches (2–4 questions at a time), and let my answers drive the follow-up questions — this is an interview, not a fixed questionnaire.

Before asking anything, look at the relevant parts of the codebase so your questions are informed and concrete rather than generic. Refer to real pages, components, or flows by name.

Cover whichever of these matter for the request (skip what's obviously irrelevant):

- **Problem & motivation** — what problem is this solving? What happens today without it?
- **Users & context** — who uses it, and where does it live (landing pages, `/app/` dApp, `/hpo/` page)?
- **Scope** — what's in, what's explicitly out? What's the smallest version that would still be useful?
- **UX & behavior** — user-visible flow, states (loading/error/empty), mobile vs. desktop, dark mode.
- **Data & integration** — where does data come from (on-chain via the SDK, gauge API, static content)? Any new external dependencies?
- **Edge cases & failure modes** — what should happen when things go wrong?
- **Constraints** — deadlines, design references, things that must not change.

Stop interviewing when you have enough to write an unambiguous spec — typically 2–3 rounds. Don't drag it out; if something is a detail I clearly don't care about, make a sensible call and record it as an assumption.

## Phase 2 — Write the spec

Write the spec to `specs/<kebab-case-feature-name>.md` (create the directory if needed). Structure:

1. **Summary** — one paragraph: what and why.
2. **Requirements** — numbered, testable statements of what the feature must do.
3. **Out of scope** — explicit non-goals from the interview.
4. **UX / behavior** — flows, states, and copy where relevant.
5. **Technical approach** — which files/components are affected, how it fits the existing architecture (see CLAUDE.md), new dependencies if any. High-level only — no code.
6. **Edge cases & error handling**
7. **Open questions & assumptions** — anything I deferred or you decided on my behalf.

## Phase 3 — Review

Present a short summary of the spec (not the whole file) and ask me to review it. Apply any corrections I give to the spec file. Then stop — **do not begin implementation**. When I'm satisfied, I'll ask you to implement it in a follow-up message, and the spec file is the source of truth for that work.
