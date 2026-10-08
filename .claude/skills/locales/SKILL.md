---
name: locales
description: The English-first procedure for any change to the website - build and review the English version, stop for the person's approval, check upstream, then translate into the released locales or merge. Use for every change to site text, pages, components, docs or prose, including one that only changes English copy, and when asked to translate, to add a locale, or to get a change ready to push.
---

# English first, other locales after approval

This holds for every change in this repo, including one that only changes English copy, prose or
docs. A push to `main` deploys to https://hipo.finance at once, so nothing is committed or pushed
until the person says so.

## 1. English only

Implement and review the English version locally before anything is committed. Do not translate
and do not build other locales yet.

- Show it with `npm run dev`. It compiles only the pages that are opened, and it skips the
  `check-i18n` step that runs before a build.
- Give the person the English `localhost` URLs and headless screenshots.
- When the session runs on a remote machine, also give the SSH port-forward to open the pages from
  their own machine, with the dev server's actual port:
  `ssh -N -L 4321:localhost:4321 <your dev host>`.
- There is no English-only production build today: `npm run build` builds every released locale and
  fails when English has keys they lack. If a production-style English build is needed, propose a
  switch for it through a spec. Do not improvise one.

**Stop and wait for the person's approval.**

## 2. Check upstream

After the approval, run `git fetch origin`. No pull and no merge.

Report whether `origin/main` has commits the local branch lacks: how many, and for each its
subject, author and the files it touches. Say which of those files overlap with this change.
**Then stop.**

This step is done in full even when a session-start hook already pulled: commits can land upstream
during the work, and the hook skips a tree with uncommitted changes. Never pull or rebase by
yourself in the middle of a change.

## 3. The person chooses

- **Locales.** Translate the change into every released locale, following `src/i18n/GLOSSARY.md`.
  Run `node scripts/check-i18n.mjs --update-hashes <locale>` for each. Then run the full
  `npm run build`; check `free -h` first on a shared machine, because the build is heavy. Show the
  person the locale URLs from the local preview for review.
- **Merge upstream.** Merge or rebase onto `origin/main`, resolve conflicts, and show the person
  any resolution that is not trivial. Then go back to step 1.

## 4. Commit and push only when the person says so

A push to `main` deploys the site immediately.
