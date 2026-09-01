# 2026-09-01 — The comma keypad, again: dropping the device gate

Second session of the day, following
`changelog/2026-09-01-verify-page-translations.md`. A user screenshot arrived
showing the English `/stake/` page with `22,22` in the amount field, in the
invalid colour, the Stake button dead and "You will receive" blank — the phone's
numeric keypad offering `,` and no `.` at all.

This is the same report as
`changelog/2026-08-29-verify-and-vs-pages.md` §"The comma-keypad amount bug",
which was fixed three days earlier. The fix was deployed (`f78863c` is on
`origin/main`, and deploys are automatic). What this screenshot found is the gap
that fix recorded under **"Trade-off accepted"** — and the trade-off has now been
inverted.

## Commits

| Commit | Description                                              |
| ------ | -------------------------------------------------------- |
| (this) | Read a group symbol as the decimal where it cannot group |

## Why the August fix did not cover it

`f78863c` gave `parseNumberInput` an optional third argument, `keypadDecimal`,
derived by `keypadDecimalOf(locale, navigator.language)`. A single `,` on the
English page, in a string that could not be a thousands group, was read as the
decimal **only if the device's own decimal symbol was `,`**.

`navigator.language` is the system language and region. **It is not the
keyboard.** The August entry said so explicitly:

> someone running an English phone with a German third-party keyboard still gets
> the old behaviour. That is the previous state, not a regression

That person is exactly who reported this. Their tag resolves to a `.`-decimal
locale, `keypadDecimalOf` returned `undefined`, and `22,22` fell through to the
strict rule and was rejected.

There is no better version of the same signal. `navigator.languages` is still
language rather than keyboard; a timezone→region table misfires for travellers,
VPN users and every Telegram Mini App visitor; and each of those still fails
_silently_ when it guesses wrong. The signal was the wrong thing to condition on.

## The decision

**The protection and the fix are mutually exclusive.** The old rule existed so
that a user typing `1,000` who presses Stake at `1,` or `1,0` cannot send 1 GRAM
instead of 1000. But `22,22` is itself a valid prefix of `22,220`, and `1,5` of
`1,500` — any rule strict enough to reject the mid-typing states also rejects the
strings the reporter typed. There is no middle position; the "reject only
group-prefixes" variant was checked and leaves the reported case broken.

So the gate is gone. The locale's group symbol now groups **only where the string
can actually be a group**:

```ts
} else if (ch === symbols.group) {
  decimal = looksGrouped ? undefined : ch
```

`keypadDecimalOf` is deleted, along with `Model`'s memo for it — a parameter that
silently does nothing is a trap.

### Why this is a strict widening, not a loosening

Not one existing valid reading changes. That is provable rather than tested:
inside the single-separator branch, `looksGrouped` is character-for-character the
same predicate as the group validation that runs afterwards (`GROUP_HEAD` on the
head, exactly three digits in the tail). So every string the new branch now reads
as a decimal is a string the old code was already guaranteed to reject. Two
independent sweeps confirmed it empirically — one over every literal pair in the
test file, one over a 5,000-string corpus × 10 locales — and **every difference
is `undefined` → a value**; none is one value becoming a different value.

`1,000` is still 1000, `1,234,567` still 1234567, Hindi `12,34,567` still
1234567, `1,234.5` still 1234.5. That matters most for the shape a visitor gets
by copying a figure off our own pages.

### What is unaffected, and why

`fa`, `ar` and `ru` do not change at all, and keep the old strictness for free:
their group symbols are `٬` U+066C and NBSP/NNBSP, which `GROUP_ONLY` normalises
to `GROUP_MARK` _before_ tokenising, so `ch === symbols.group` is unreachable
there. `fa "۱٬"`, `"۱٬۰"` and `ru "1 0"` stay invalid. The affected locales are
exactly `en`/`hi` (group `,`) and `de`/`tr`/`it`/`id`/`pt-br` (group `.`).

Ambiguous **foreign** separators are untouched: `fa "1,500"` and `ru "1.500"` are
still invalid, not a guess. The new branch is deliberately kept separate from the
`else if (looksGrouped) { return undefined }` branch below it for that reason — a
foreign group-shaped separator must still be rejected, while the locale's own
group-shaped symbol must fall through to group validation.

## The cost, and what pays for it

The change makes two adjacent keystrokes differ by 1000×, where today the earlier
one is simply rejected:

```
de  "1.500"  →  1   1.   1.5   1.50   1500     ← the last "0" multiplies by 1000
en  "12,345" →  1   12   12.   12.3   12.34    12345
```

Before, every intermediate state was coral with a dead button, which pushed the
user off the wrong separator. Now the parser confirms the wrong mental model for
four keystrokes and flips magnitude on the fifth. The realistic sequences: a
German visitor types `1.500` for 1500 GRAM, the trailing `0` does not register on
a phone keyboard, and `1.50` is live and sends 1.5; or a comma-habit visitor on
the English page learns from `12,3` and `12,34` that `,` is the decimal here, then
types `12,345` and stakes twelve thousand.

The harm is bounded — there is no principal-loss path. There is no client-side
minimum amount (`minimumDepositAmount` exists in the SDK but `Model` never calls
it), `isAmountValid` already caps at `maxAmount` so the _larger_ direction cannot
exceed the balance, and a mis-sized amount costs one fee to redo
(`averageStakeFee` 0.015 GRAM, `averageUnstakeFee` 0.042 GRAM) plus, on unstake, a
wasted round. Note the asymmetry in the existing guards: a stake shows its GRAM
value on the TonConnect confirmation screen, but an **unstake shows only the fee**
— the burn is in the payload — so on `/unstake/` the on-page echo is the only
thing the user sees.

**The guard: the field normalises on blur.** `Model.normalizeAmount` rewrites
`amountRaw` from the canonical value when the amount is valid, wired to `onBlur`
on both amount inputs (`StakeUnstake.tsx`, `tma/TmaStakeUnstake.tsx`). Leave the
field and it shows the number the parser actually read: `12,345` snaps to `12345`,
and on the German page `1.50` snaps to `1,50`. The decision becomes visible before
Stake is pressed rather than after. Only on blur — rewriting per keystroke is what
`setAmount`'s comment forbids, because a lone group mark has no digits after it
yet and would make grouping unreachable.

### Declined

- **A wider device signal** (`navigator.languages`, timezone→region). A
  better-odds guess at a signal that is structurally the wrong one, still silent
  when it misses.
- **Inferring the separator from what the user has typed this session.** Makes
  parsing stateful on the money path — the same string reading differently
  depending on history — and cannot help the first keystroke.
- **An inline hint next to an invalid field.** After this change the only strings
  still invalid by ambiguity are the foreign group-shaped ones (`fa "1,500"`),
  where a hint has nothing useful to say; and "use a period" is useless advice to
  a keypad with no period key. It would also cost a catalog key in ten released
  locales through the `check-i18n` gate for no residual benefit. The echo it
  wanted to add already exists as `youWillReceive`, now backed by blur
  normalisation.

## Verification performed

- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 15 groups passed
  (two groups removed: `keypadDecimalOf`, and `parseNumberInput with a foreign
keypad` whose assertions were folded into the main group, since they now hold
  for every visitor without the third argument).
- 48 assertions flipped, **all of them `undefined` → a value**, checked by
  diffing the pre-change parser against the new one over every literal
  `(locale, input)` pair in the test file, including every keystroke prefix of
  every `sequence(...)` table. The `fa` and `ru` sequence tables are
  byte-identical.
- New cases pin the report and the boundaries: `en "22,22"` → 22.22, `en ",234"`
  → 0.234, the `1,000` / `1,0000` three-vs-four-digit pair, `hi "12,34"`, the
  cliff pairs `de "1.50"`/`"1.500"` and `en "12,34"`/`"12,345"` so the 1000× step
  is documented rather than discovered, and an unchanged trio `fa "1,500"`,
  `ru "1.500"`, `sequence('fa', '۱٬۵')`.
- `formatInput`/`parseNumberInput` round-trip group passes unmodified; a separate
  sweep of 4,000 random nano values × 10 locales found no round-trip that changes
  meaning. `setAmountToMax` writes ungrouped `formatInput` output, so the new
  branch cannot fire on it.
- `npm run build` — passes, including the `check-i18n` prebuild gate. No catalog
  strings change, so no locale work was needed.
- `grep -rn keypadDecimal src scripts` — no matches.

## Follow-ups

- The `/unstake/` confirmation gap is worth a look on its own: the wallet dialog
  shows the fee, not the hGRAM being burned, so the user's only check on the
  amount is our own page. Blur normalisation improves that but does not close it.
- Nothing else in the codebase calls `parseNumberInput`; if a second amount input
  ever appears, it needs the same `onBlur`.
