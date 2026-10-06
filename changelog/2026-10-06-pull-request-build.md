# 2026-10-06 — A build for every pull request

Until now the only workflow in this repo was `deploy.yml`, which runs after a push to `main`. A pull
request was therefore merged without anyone having seen whether it builds; the first sign of a broken
build was a failed deploy. This session adds a second workflow that builds every pull request to `main`.

It is one part of the guards step of the team's shared Claude setup (the `claude-team` repo,
`specs/guards-small.md`, section 2). The rest of that step lives outside this repo.

| Commit         | Subject                          |
| -------------- | -------------------------------- |
| (this session) | Build every pull request to main |

## What changed

`.github/workflows/pr-build.yml`, new. On a pull request to `main` it checks the branch out, installs
with `npm ci` and runs `npm run build`, the same command as the deploy, so the `prebuild` translation
gate and every released locale are covered.

Choices worth recording:

- **`pull_request`, never `pull_request_target`.** The second runs with the base repository's token
  and secrets, which a pull request from a fork must not reach. With `pull_request` the token is
  read-only and no secret is available.
- **`permissions: contents: read`** and `persist-credentials: false` on the checkout, so the token is
  not left in the clone for the pull request's own build scripts to find.
- **Full history** (`fetch-depth: 0`), for the same reason as `deploy.yml`: `src/data/lastmod.mjs`
  reads commit dates and refuses to work on a shallow clone.
- **One build per pull request at a time.** A new push to the same pull request cancels the build
  that is still running.

## What it does not do

It is not a gate. Nobody is required to open a pull request, and all three team members keep pushing
to `main` as before, because a push to `main` is how a blog post is published. The build result is
there for whoever chooses to work through a pull request.

A push-restricting ruleset on `main` was considered and dropped for that reason. What is planned
instead, and is applied on GitHub by a person, not by this commit: a ruleset that stops `main` being
deleted or force-pushed, the publishing environment limited to `main`, and GitHub's secret scanning.

### Verification performed

- The file parses as YAML, and it uses the same action versions as `deploy.yml`.
- An independent review read it for fork safety: `pull_request` only, a read-only token, no secret
  referenced, a cache scoped to the pull request.
- **Not verified:** the workflow has never run. This commit goes straight to `main`, and the workflow
  starts only on a pull request, so the first pull request after this is its first run.

### Follow-ups

- Watch the first pull request: it should show a `pr-build` result within a few minutes.
- The GitHub steps in `claude-team/machine/github-steps.md` are still to be run.
