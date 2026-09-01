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

| Commit    | Description                                                 |
| --------- | ----------------------------------------------------------- |
| `3833c0e` | Read a group symbol as the decimal where it cannot group    |
| `e6ecc60` | Record the comma-keypad commit hash, and the declined rules |
| (this)    | Refuse a keystroke that types the amount into a dead end    |

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

## Declined after shipping: locale-independent separator rules

Reviewing the above, the owner proposed replacing the locale-aware logic with
three locale-independent rules: one separator symbol → it is the decimal; two →
the later is the decimal and the earlier the group, invalid if the later repeats;
more than two → invalid. The appeal is real — it deletes the page locale from the
parsing decision, and "the page locale does not match how this person types" is
the root of the bug class reported twice in three days.

Rules 2 and 3 were adopted in the sense that they are already, character for
character, what `parseNumberInput` does. **Rule 1 was declined.** Measured over
303,470 `(locale, input)` pairs — every literal and keystroke prefix in the test
suite, every locale's rendering of realistic amounts, plus ~30,000 random
strings — rule 1 produces exactly one value→different-value transformation, and
it is always 1000× **smaller**:

| input         | intent | today |  rule 1 |
| ------------- | -----: | ----: | ------: |
| `en "1,000"`  |   1000 |  1000 |   **1** |
| `en "10,000"` |  10000 | 10000 |  **10** |
| `de "1.500"`  |   1500 |  1500 | **1.5** |

Two facts decided it. `en` is the only `public` locale, so this lands on the main
traffic path, on round thousands — the modal stake amount. And the grouped form
is what our own UI hands the user: `StakeUnstake.tsx:67` and `:85` print the
balance through `formatNano` → `Intl` **with grouping on**, a few pixels above the
input. (`formatInput`, and therefore `setAmountToMax` and `normalizeAmount`, never
group — so the field's own writers are safe under any reading. The exposure is
what the user copies off the line above it.)

Blur normalisation is too weak to license it: `1,000` → `1.000` moves one
punctuation mark, and in `fa`/`ar` it is invisible — `۱٬۰۰۰` (U+066C) and `۱٫۰۰۰`
(U+066B) differ only in the dot's vertical position. That is exactly the
regression `setAmount`'s comment records as never to be repeated.

The two sub-readings, for the record. Reading the rule as "one distinct **kind**"
is separately incoherent: it makes `1,234,567` invalid while `1,234,567.8` stays
valid — appending a decimal rescues a string the same rules just rejected — and
it kills Hindi lakh grouping (16 shapes go value→invalid). Reading it as "one
**occurrence**" is coherent and well-behaved (0 value→invalid), but only moves the
cliff: `1,000,000` typed out reads 1 · 1. · 1.0 · 1.00 · 1.000 · invalid ·
invalid · invalid · 1000000, replacing a 1000× step with a 10⁶ one.

A third option — making the lone-separator rule locale-independent from the other
side, treating `X,YYY` as a group in **every** locale — was also declined. It is
tidier (one rule for a lone separator, no locale lookup) and its errors are rarer,
but they run 1000× **larger** (`en "1.000"` → 1000), and larger is the only
direction that can overspend; `isAmountValid`'s cap at `maxAmount` does not bind
for a user with a large balance.

Two amendments from the proposal are kept as invariants, because the data on them
is unambiguous. **Whitespace and `٬` U+066C are always thousands separators**,
never decimals — taken verbatim, rule 1 reads `ru "1 000"` and `fa "۱٬۰۰۰"` as 1.
And **group-shape validation must stay** (head 1–3 digits, no leading zero, tail
exactly 3): without it `ru "1 0"` becomes a valid 10, and `en "1,5."` — one stray
keystroke past the state the reporter was in — becomes 15.

The honest point in the proposal's favour, recorded because it is the residual
cost of what shipped: rule 1 **does** remove the lone-separator cliff completely.
It was judged not worth a silent misread of a correct input, since the cliff only
punishes a mid-typing state the user escapes by finishing the number.

## The input filter

The reporter confirmed the fix works. The owner then sent a second screenshot —
`0,,,546164,` sitting in the field, red and rejected, but _typeable_ — and asked
that the field stop accepting a separator that cannot lead anywhere.

`setAmount` now refuses a keystroke that appends a character no continuation can
rescue, using a new predicate in `format.ts`:

```ts
export function isViablePrefix(locale: Locale, raw: string): boolean
```

**Could this string still become a number by typing more?** `"0,"` is viable — it
is on its way to `"0,5"` — but `"0,,"` is not, and neither is `"0,546164,"`: a
head of `0` can never satisfy `GROUP_HEAD`, so as soon as a second symbol forces
one of them to group, nothing saves it. Typing the reported string now leaves
`0,546164` in the field, live and valid at 0.546164; the extra commas never land.

The predicate is exact rather than heuristic. `parseNumberInput` decides two
things about a finished string — which symbol groups and which is the decimal —
so `isViablePrefix` enumerates every role assignment the locale could end up with
and asks whether the typed text is consistent with one of them. Each clause of
`canComplete` mirrors a rule the parser will apply, and the code names which.

### The invariant, and why it is the whole design

**Every prefix of every string `parseNumberInput` accepts must be viable.** A
filter that blocks one makes a reachable amount untypeable, which is strictly
worse than the bug it fixes. Both directions are brute-forced: 26.9 M enumerated
(locale, string) pairs over the locales with distinct separator pairs, 7.2 M
prefixes of valid amounts, and the two sweeps are kept in the selftest rather
than run once and discarded.

That bar earned its keep immediately. The first draft trimmed trailing whitespace
the way `parseNumberInput` does, and the sweep found it in 35 seconds: trailing
trim is **not prefix-stable**. `"1 "` parses as 1, but the instant a character
follows, that space is a group mark — `"1 " + "000"` is 1000, `"1 " + ","` is
dead. Only the leading trim survives, hence `LEAD_WHITESPACE`; `parseNumberInput`
is consulted first so a string that already parses stays viable regardless.

### Why it filters only single-character appends

The guard fires only when the change is one character appended onto a state that
was itself viable. Three consequences, all deliberate:

- **The caret cannot jump.** The rejected character is the last one, which is
  where the caret already was. This is what made the obvious objection to
  keystroke filtering — a bouncing caret mid-string — evaporate rather than need
  mitigating.
- **Backspacing out of a dead state still works.** Deleting the `4` from
  `"1,234.5"` gives `"1,23.5"`, which is itself dead; it must still land in the
  field for the next backspace to reach it. A deletion is never an append, so it
  passes through.
- **A dead paste does not freeze the field.** Requiring the prior state to be
  viable means only the keystroke that _first_ kills viability is refused, once.

`onAmountInput` (`src/components/app/amountInput.ts`, shared by both inputs) puts
the DOM value and caret back when the model refuses, since nothing else forces a
re-render when `amountRaw` did not change.

### What this deliberately does not do

- **"Only one `.`" is not literally implementable on the English page**, because
  the grammar genuinely accepts `1.234.567,8`. So `1.50.` stays typeable — every
  string that is dead on arrival is blocked, but a second dot that could still
  lead somewhere is not. Tightening that is a change to which formats we accept,
  not to the filter.
- **Mid-string insertion is unfiltered**, by design: filtering there is exactly
  what would cost a caret jump and break legitimate edits.
- **`"0"` then `"1"` now swallows the `1`** (`"01"` is dead), where it previously
  showed red. Making it replace the zero the way a calculator does was left out
  for now: it changes a value rather than declining a keystroke, which is a
  different kind of act on the money path.
- **The filter does not touch the 1000× cliff.** `en "1,000"` and `en "1,0000"`
  are both viable, so blur normalisation remains the only guard for that; the
  selftest records this so a future reader does not assume otherwise.

Stripping the dead tail on blur instead was **declined**. It does not fix the
complaint (the garbage is still typeable, and on a phone blur often does not fire
until Stake is tapped), and worse, it would silently rewrite a completed number on
the money path: `"1,0000"` → `"1,000"` turns 1.0000 into 1000. Refusing a
keystroke changes no value; it only declines to accept one.

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

For the input filter:

- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 18 groups passed
  (three new). Runtime goes from 0.24 s to ~3.4 s, dominated by the two sweeps;
  accepted deliberately rather than shrinking their bounds.
- The two sweeps are the invariant, kept in the suite: an exhaustive DFS to
  length 6 over the symbol alphabet × `en`/`de`/`fa`/`ru` (one locale per distinct
  (decimal, group) pair) asserting no prefix of a reachable amount is blocked, and
  a walk of the blocked frontier to length 3 confirming none has a valid
  completion within 4 appended characters.
- Typing simulated through the guard: `en "0,,,546164,"` → `0,546164` (3 dropped);
  `en "1,234,567.8"`, `en "1.234.567,8"`, `de "1.500,25"`, `fa "۱٬۰۰۰٫۵"`,
  `ru "1 000,5"`, `hi "12,34,567"` → nothing dropped in any of them.
- Separately re-checked the no-over-blocking direction against the three shapes
  that actually reach the field — `formatInput` output (Max and blur), the grouped
  `Intl` rendering shown on the balance line, and plain ASCII — over 2,300
  prefixes × 10 locales: 0 over-blocks.
- `npm run build` — passes. No catalog, prose or doc strings change, so
  `check-i18n` needed no work.

## Follow-ups

- The `/unstake/` confirmation gap is worth a look on its own: the wallet dialog
  shows the fee, not the hGRAM being burned, so the user's only check on the
  amount is our own page. Blur normalisation improves that but does not close it.
- Nothing else in the codebase calls `parseNumberInput`; if a second amount input
  ever appears, it needs the same `onBlur`.
