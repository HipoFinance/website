# Club pages: match the wireframe's look

Status: approved by Alireza 2026-11-07 (English first; other locales after review).

Wireframe: "Hipo Club Wireframe v1" (claude.ai design canvas), boards Main, Rewards, Friends.
The comparison of the wireframe with the code was done on 2026-11-07; this spec takes the
recommended subset. The fonts stay the site's (Fredoka for display, Heebo for body) and the
segmented tabs stay (spec club-website.md §10). Display only: no amount, formula or send changes.

## Scope

Shared (`src/components/app/club/ui.tsx`, app colour tokens in `src/styles/app.css`):

- G1 Primary button: no offset shadow, radius 14px.
- G2 Secondary button: normal weight, stronger border (new token `--color-border-control`, both schemes).
- G3 Buttons 44px tall in strips, the header and dialogs; disabled = raised fill with a border, muted text.
- G4 Line height 1.5 instead of `leading-relaxed`; card inner gap 16px.
- G5 Inset boxes and bar tracks are raised (lighter than the card in dark): new token `--color-surface-raised`.
- G6 Secondary text brighter than muted: new token `--color-text-secondary`.
- G7 Card headings as small uppercase eyebrow labels (13px, 0.06em tracking, muted) with a 16px lucide icon.
- G8 Tables: cells 10–12px padding, body 15px, header muted weight 500.
- G9 Filter / sort pills: separate pills, active = filled with the text colour and page-colour text, 40px.
- G10 Own row (leaderboard, levels table): tinted background (new token `--color-row-self`) + bold.
- G11 Big numbers 44–48px and bolder; footnotes 13–14px.

Header (`ClubPage.tsx`):

- H1 Season pill (clock icon, "Season N · **D days left**") in the chip row beside the Telegram chip.
- H2 Title 44px, subtitle 17px.
- H3 Linked chip: green dot, normal text colour. Not-linked chip: dashed border, grey dot.

Overview:

- O5 Level up: check-circle / empty-circle icon per condition, status inline, section heading with
  "Next season runs …" line, fee value bold.
- O6 Leaderboard: header on one row (title left, controls right), raised select, positive growth
  green, "…" gap row before own row, hidden-name message replaces the table.

Layout:

- R1 Rewards: each section is a heading row plus sibling cards, not one card with nested boxes.
- F1 Friends: Invite and Earned-from-referrals as two cards side by side (stack below ~720px).

Out of scope: items that need server data, the wallet dialogs (W), the Mini App board (M), and the
other Overview / Rewards / Friends / Community items of the comparison list.

## Checks

1. `npm run build` passes (includes the i18n gate); `node --experimental-strip-types scripts/i18n-selftest.mjs` passes.
2. Mock preview (`PUBLIC_CLUB=1 PUBLIC_CLUB_MOCK=1 npm run dev`), `/club/`, `/club/rewards/`,
   `/club/friends/`, states B, D, G, nolink: each item above visible; dark and light; 390px wide with
   no horizontal scroll; Mini App layout not broken.
3. New English strings only in `src/i18n/en/club.json`; other locales after approval (locales skill).

## Phase 2 (approved by Alireza 2026-11-08: "go for the other listed differences")

Done in phase 1 follow-ups: content width 1184px (`max-w-[1232px]`), app header up to 1440px with
40px padding, header chips right-aligned when they wrap, the Level up check mark drawn as the wireframe's.

Amended 2026-11-14: the app header went back to the site's 1280px with 48px padding, so the logo lines up with the 1184px content on every page ([one-header-across-site](one-header-across-site.md), phase 1).

- O1 Status strip: a 24px tone icon on the left; title in the body font, 19px/600, normal text colour.
- O3 Claim card: divider above the rows, button and terms pinned to the card bottom, per-round with 2 decimals.
- O4 Your HPO: trend line under the number, rank as a two-line block on the right, legend on one row,
  nudge as text plus a coral "Buy HPO" link in the inset box, footer as one bordered row.
- O7 Balances: plain columns (no boxes), pool note under the HPO column, "address · Change" as a link.
- O8 Teasers: the whole card is the link (no Open button); Revenue sharing in a paused style (dashed border).
- R5 Past claims: separate Fee and Transaction columns.
- R7 Revenue sharing: dashed border on a transparent background, facts in a 3-column grid.
- F2 Invite link in a read-only input with Copy on the same row; Share alone below.
- F4 Friends table: numbers with only the decimals they need.
- C1 Community: "Hipo Chat" as an outline pill with the Telegram icon; "Powered by Limzo" underlined.
- W1 Dialog 600px wide, 28px padding, strong border, 26px title.
- W2 Fact rows in a raised box; choice cards side by side, filled, the suggested one with a coral border;
  "Connected now" shows its HPO.
- W3 Confirm step: roomier table, new value bold, "holds enough" in a success box.
- W4 After a switch: one strip, not two stacked; the amount in "Buy X HPO".
- W5 Choice cards look disabled while a request runs.
- M1 Mini App: cards radius 18, padding 16, gap 14 at phone width.

Not in phase 2: items that need server data (O9, R8, F5, the APY card, "Earned on"), items that need
new text (they fail the i18n gate until translated), C2 (its copy needs mili's sign-off).
