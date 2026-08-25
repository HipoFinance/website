# 2026-08-25 — Retries that actually wait

A stake was reported as failed by the app — "Cannot find your transaction —
Despite multiple attempts, we could not locate it." — seconds after being
submitted, while the transaction had in fact landed on-chain. The cause was in
`retry`, and it had been there since the app moved under `/app/` (`e28a41d`).

## Commits

| Commit | Description                                   |
| ------ | --------------------------------------------- |
| (this) | Space out read retries: 30 attempts, 1s apart |

## The bug

`retry` rescheduled a failed attempt with `setTimeout(attempt)` — **no delay
argument**. All ten attempts therefore ran back to back, separated only by each
request's own latency, so the whole retry budget was spent in a couple of
seconds. The file already defined `retryDelay = 3 * 1000` and used it in three
other places; this one call site simply never got it.

The consequence is worst in `waitForCompletion`, the loop that watches for a
stake or unstake to appear on-chain. It reads the last block, the account, and
the account's transactions, each through `retry`. A brief network failure
exhausts all three budgets almost instantly, the rejection escapes to the
function's `catch`, and that `catch` sets `waitForTransaction` to `'timeout'` —
which the UI renders as `app.wait.timeoutTitle`, "Cannot find your transaction".

So a transient read failure was reported to the user as a transaction that did
not happen, within seconds, on a screen about their money. The loop's actual
five-minute `txValidUntil` deadline never got near being reached.

Ruled out while diagnosing, so they do not get re-investigated: `readLastBlock`
catches everything internally and cannot throw into that path; both v4 read
endpoints were healthy when checked; and the GA4 events added earlier the same
day are additive — `track()` swallows its own errors and cannot throw into the
send path.

## The fix

Retries now wait 1 second between attempts and get 30 of them — half a minute
for a hiccup to clear — as specified by the user. Two named constants,
`retryAttemptDelay` and `retryAttempts`, sit beside the existing `retryDelay`
with a comment distinguishing them: `retryDelay` is how long a whole failed read
waits before being scheduled again, the new pair is the gap between attempts
within one read.

All fifteen `retry` call sites take the default, so this applies to every read
in the app.

A useful side effect: `console.warn('retry', …)` is written as
`retries < retryAttempts`, so it now fires from the first failed attempt rather
than only the last few. That warning is what would have identified this in one
step, and it is now visible for the whole sequence.

## Decisions

- **The parameters are the user's, not a derivation.** 1s × 30 was specified
  directly. A shorter budget would restore some of the old fragility; a longer
  one delays honest failures further.
- **Failover to the public endpoint is now slower, and that is the trade.**
  `readLastBlock`'s `catch` calls `countTonEndpointFailure()`, and
  `endpointFailureThreshold` is 3 — so with reads that now take up to ~30s to
  give up, a hard-down primary endpoint takes roughly 90s to fail over instead
  of being near-instant. The stale-block failover path (`isStaleBlock`) is
  unaffected and still immediate. Worth revisiting if the primary ever goes
  down hard; not worth pre-empting.
- **The misleading message is not fixed here.** "We could not read the chain"
  and "your transaction did not happen" are still the same string. Splitting
  them means a new key in `src/i18n/en/app.json` plus nine translations under
  the `GLOSSARY.md` conventions — a translation task, not a code change, and
  not one to start unasked. Raised with the user and left open.

## Verification performed

- `npm run build` — clean, 512 pages.
- Read the constants back out of the shipped bundle rather than trusting the
  source: the delay minifies to `1e3` and the attempt count to `30`. (The first
  attempt to check this misread `1e3` as `1` with a digits-only regex — worth
  recording, since the naive check reports a 1ms delay and looks like a bug.)
- Smoke-tested the real app in a headless browser against `npm run preview`:
  the island hydrates, the amount input renders, the live APY reads back as
  16.6% — so chain reads still work through the new retry — and the console is
  free of errors.
- Not reproducible here: the original failure is intermittent and needs a real
  mainnet transaction. The user's next stake succeeded on its own, before this
  fix, which is consistent with a transient read failure.

## Follow-ups

- ~~Split the "cannot reach the network" and "transaction not found" messages,
  across all ten locales.~~ Done the same day — changelog
  2026-08-25-unreachable-message.md. The two new strings still want a native
  review, which is tracked there.
- ~~If `waitForCompletion` should distinguish them properly, the read failure
  wants its own state rather than reusing `'timeout'`.~~ Done: `'unreachable'`.
  The same change also made the poll loop ride out failed reads for the whole
  `validUntil` window, which is the more complete form of this fix — the retry
  budget here is no longer what bounds a wait.
