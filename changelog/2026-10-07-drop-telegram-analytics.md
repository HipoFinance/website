# 2026-10-07 — Telegram Analytics removed from the app pages

Asked from Telegram: is the tganalytics script still useful, and should it go? Looked into it, and
the answer was to drop it.

| Commit         | Subject                                          |
| -------------- | ------------------------------------------------ |
| (this session) | Drop the Telegram Analytics script from the dApp |

## What was there

`AppLayout.astro` loaded `https://tganalytics.xyz/index.js` on every dApp page and initialised it on
`load` behind the same `location.host === 'hipo.finance'` gate that Google Analytics uses. Added
2026-06-23 in `e28a41d`, the commit that moved the app under `/app`.

## What the investigation found

**The service is alive.** The script is 408 KB and had been modified an hour before it was checked.
An early reading suggested it was serving an empty file; that was this environment stalling on a
408 KB download from that host, not the service — a ranged request returns the real SDK
(`var telegramAnalytics=function(){…}`) in 97 ms, while a control file of similar size from cdnjs
downloads normally. Worth recording so the wrong conclusion is not reached again.

**Our registration was stale.** The init token decodes to:

```
app_name   HipoFinance
app_url    https://t.me/HipoFinanceBot
app_domain https://app.hipo.finance
```

`app.hipo.finance` has not served the app since the `/app` move — it 301s to `hipo.finance/app/` —
while the init only ran on `hipo.finance`. So events were being sent from a host the token does not
name, almost certainly since the day the script was added.

**It cost more than the app it measured.** 408 KB raw on every dApp page. The entire eager app
island is 191 KB raw, 52 KB gzipped.

**Google Analytics already covers the overlap.** `Analytics.astro` tags every hit with
`hipo_platform`, derived from `window.__hipoTma`, so Mini App and web traffic were already
separated. The one thing GA cannot replace is Telegram's own ecosystem listings, which this feeds —
that was the question put to the owner, who decided to drop it.

## The change

Both the `<script src>` and the `init()` block are gone from `AppLayout.astro`. `Analytics.astro`'s
header comment described its host gate as "matching the Telegram-analytics script in
AppLayout.astro", which would have become a dangling reference, so it now explains the gate on its
own terms and notes what used to share it.

No other file referenced `telegramAnalytics` or `tganalytics`, so nothing else had to change. GA is
now the site's only analytics.

### Verification performed

- `npm run build` passes, 619 pages.
- `tganalytics` appears nowhere in `src/`, `public/` or `specs/`, and nowhere in the built
  `/stake/`, `/fa/stake/` or `/defi/` pages.
- The GA measurement ID is still present on both an app page and the landing page, so removing the
  one script did not disturb the other.
- `/stake/` still carries its island mount, its static shell, the banner and the inlined gauge seed —
  the deletion sat between the `<body>` tag and the banner, so the check was that nothing around it
  moved.

### Follow-ups

- If Telegram's ecosystem listings turn out to matter later, re-adding this means a **new token
  registered to `hipo.finance`**, not the old one. It should also be injected only when
  `window.__hipoTma` says the page is inside Telegram, so web visitors do not download a Mini App
  SDK they get nothing from.
