# 2026-08-04 — Stats page link placement

Small follow-up to the 2026-08-03 layout session. The "More Stats" and
"TON Explorer" links moved from the page's top-right corner (beside the
"Statistics" title) to below the Refresh button, and thin screens got more
breathing room above that button.

## Commits

| Commit    | Description                                         |
| --------- | --------------------------------------------------- |
| `458511e` | Move the extra stats links below the Refresh button |

## What changed

- **Link placement** (`src/components/app/StatsPage.tsx`): the previous
  session parked the two links in an absolutely-positioned block vertically
  centered against the title. They now stack right-aligned directly under the
  Refresh button — the button row became a `flex-col items-end gap-3` column
  holding the button and the links. The links keep their `text-xs font-light`
  styling and `gap-3` tap separation.
- **Title markup simplified**: with the absolute block gone, the
  `relative`-wrapper `div` around the "Statistics" heading was removed; the
  heading is a plain centered `<p>` again.
- **Mobile spacing**: the Refresh column gained `mt-8 sm:mt-0`, adding space
  between the "Live protocol and market figures." subtitle and the button on
  thin screens only; `sm` and up are unchanged.

This also resolves the previous report's follow-up about the corner links
extending above/below the title line — the corner placement no longer exists.

### Verification performed

`npm run build` (44 pages, clean) and `prettier --check` on the touched file.
Tailwind-class-level change reviewed in the diff; no browser pass.

### Follow-ups

- Unchanged from earlier sessions: expose the Prometheus proxy
  (`gauge.hipo.finance/prometheus`) so the charts get live data.
