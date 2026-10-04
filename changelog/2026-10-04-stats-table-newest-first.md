# 2026-10-04 — The `/stats/` data tables open on the newest sample

Reported from Telegram: "Why the tables below charts on /stats/ page is not updated? They are from
the Sep 4 - 5!"

They were updated. The data was current to the minute — the fault was that the table showed the
wrong end of it.

| Commit         | Subject                                           |
| -------------- | ------------------------------------------------- |
| (this session) | Open the /stats/ data tables on the newest sample |

## What was actually wrong

Each chart's "Show table" renders **every** sample in the visible range: 360 rows at 30d (one per
two hours), 289 at 24h. They sit in a `max-h-64` scroll box, so about six are visible when it opens.
`tableRows` sorted ascending, so those six were the six **oldest** — and on a 30-day range ending
today, the oldest is 4 September. Today's rows were there the whole time, roughly 360 rows below the
fold.

Read at a glance, a table whose visible rows are all a month old is a table that stopped updating a
month ago. That is exactly how it was reported, and the inference was reasonable.

Checked before changing anything, because stale data would have been the worse bug: querying the
metrics proxy directly with the same allowlisted query the chart sends returned 360 points per
series running `2026-09-04 10:00` → `2026-10-04 10:00`, with the last sample minutes old. Nothing
was stale.

## The fix

`tableRows` now sorts descending. The table opens on the most recent sample and the range's start is
at the bottom.

The chart above still runs left to right, so the table no longer reads in the same direction as the
axis it belongs to. That is the deliberate trade: the table is a record of samples rather than a
second rendering of the time axis, and a record opens on its most recent entry — the same reason a
log or a transaction list does. It also matches the readout above it, which shows the latest value.

Considered and not taken: keeping ascending order and scrolling the box to the bottom on open. It
preserves the chart's reading direction, but it needs a ref and an effect on the `<details>` toggle
to do something a sort does for free, and it leaves the scroll position as hidden state that can be
wrong after a range change.

### Verification performed

- The live metrics proxy was queried first, to establish the data was current (above).
- `npm run build` passes. No copy changed, so the i18n gate is untouched.
- Driven in a browser with the range request fulfilled locally: with every `<details>` opened, the
  first three rows read `Oct 4, 2026, 10:00 AM`, `8:00 AM`, `6:00 AM` and the last two read
  `Sep 4, 2026, 12:00 PM`, `10:00 AM`, across 2,527 rows in nine tables.
- `tableRows` has one consumer, the table itself, so no other view depended on ascending order.
