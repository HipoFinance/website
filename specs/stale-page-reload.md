# The app reloads itself once when a deploy has removed its files

**Status:** implemented

## Goal

After a deploy, a page that was cached or left open can no longer start or continue the app: only the
static outline shows, then nothing. The page should notice that its app files are gone and reload
itself once, with fresh files, without ever falling into a reload loop.

## In plain terms

Each time we publish the site, the app's program files get new names and the old files are deleted.
The page itself (the HTML) names the program files it needs. Browsers and Telegram may keep a page for
up to ten minutes or more, and a member may keep a tab open for hours. Such an old page asks for files
that no longer exist, gets "not found", and the app never starts. The member sees the grey outline of
the app and nothing else, until they think of closing and reopening it. We push often, so this happens
after almost every release (seen on Nov 1).

The fix: when the page fails to fetch one of the app's files, it reloads itself once. The reload gets
the new page, which names the new files, and the app starts normally. To make sure the reload really
gets the new page and not the cached copy, the page first asks the server for a fresh copy.

The same happens for an app that is already running: when the member moves to a part of the app that
needs a file it hasn't loaded yet (the Club, the wallet code), and that file is gone, the page reloads.

A guard stops a loop: the page reloads at most once a minute. If the files are still missing after the
reload (for example if the server is broken), the page does not reload again by itself. Instead it
shows a short line, "Couldn't load the page.", with a Reload button, so the member is never left with
an outline that does nothing.

What the member sees: a short blink as the page reloads, then the app. Nothing they typed is kept in
the form; the wallet stays connected (it is stored by the browser), and a claim started before the
reload is handled by the claim checks that already exist.

Not a money change: it decides when the page reloads, not what any transaction holds. No decisions
needed.

## Definitions

**Concepts**

- **App file**: a JavaScript file under `/_astro/` with a content hash in its name (`AppIsland.<hash>.js`,
  `ClubPage.<hash>.js`, the chain and TonConnect chunks). A deploy deletes the old ones.
- **Stale page**: a page whose HTML, or whose running code, names app files of an earlier deploy.
- **Island**: the React app Astro mounts into the page (`AppIsland`, `client:only='react'`).
- **Hydration error**: Astro's `astro:hydration-error` event, sent when an island's file can't be
  imported (after Astro's own one retry, one second later).
- **Preload error**: Vite's `vite:preloadError` event, sent on `window` when a lazy `import()` inside the
  running app fails.
- **Reload guard**: a timestamp in `sessionStorage` (`hipo.staleReload`) of the last automatic reload.
- **Load-failed notice**: the "Couldn't load the page." line with its Reload button, static HTML in the
  page, hidden until the guard blocks a reload.

## Context

- The island is mounted in `src/layouts/AppLayout.astro:154` (`client:only='react'`,
  `transition:persist='app-island'`), with `<ClientRouter />` in the head (`:137`). The static shell
  (`data-app-loading`, `:160`) stays on screen until `App.tsx` hydrates and removes it.
- Astro 6.4.8's island loader (`node_modules/astro/dist/runtime/server/astro-island.js`) imports the
  component with one retry after 1 s, then catches the failure and dispatches `astro:hydration-error`
  (cancelable, bubbles) and logs it. Nothing else happens: that is the "outline, then nothing".
- Vite 7.3.5 wraps lazy imports in `__vitePreload`, which dispatches `vite:preloadError` on `window`
  when a lazy import or its preloads fail, then rethrows unless the event was cancelled.
- Lazy imports in the running app: `ClubLoader.tsx:11` (`ClubPage`, under `Suspense` with no error
  boundary, so a failure unmounts the whole tree), `Model.ts:373` `loadChain` and `Model.ts:388`
  `loadTonConnect` (each caches its promise, so a failed import is cached and every later call fails
  too), `ClubModel.ts` `clubModelFor` (caches the pending promise per model in a `WeakMap`, same issue),
  plus `telegramLogin.ts`, `socket.ts`, `@twa-dev/sdk` imports in the Club and TMA code.
- With ClientRouter and `transition:persist`, moving between app pages keeps the old island running
  even though the new page's HTML is fresh; so after a deploy the running island's next lazy import
  fails (e.g. opening `/club/`).
- GitHub Pages serves HTML with `Cache-Control: max-age=600`; deploys go through
  `.github/workflows/deploy.yml`.

## Approach

One small inline script in the head of `AppLayout.astro` (inline, so it works even when every app
file is gone) listens for both events and calls one function:

1. If the reload guard says an automatic reload happened less than 60 s ago, or `sessionStorage` is not
   usable, show the load-failed notice instead of reloading (the error is still logged).
2. Otherwise write the guard, fetch the current URL with `cache: 'reload'` (so the browser's cached copy
   of the HTML is replaced), with a 5 s timeout, then `location.reload()` — only when that fetch answered
   with the page (`response.ok`); a failed, non-ok or timed-out fetch shows the notice instead. A failure
   while `navigator.onLine === false` does nothing, and a failure while a reload is pending is ignored
   (both added after the code review: an offline reload would land on the browser's error page). The URL, including the hash
   Telegram puts its launch data in, stays the same.
3. The script registers its listeners once per document (a `window` flag), since ClientRouter may run
   head scripts again on a swap.

The notice is plain HTML rendered by `AppLayout.astro` from the site catalog, hidden with the `hidden`
attribute, because the app that would normally draw messages is the part that failed. It sits outside
the `data-tma-hide` wrappers so it also shows in Telegram, where the static shell is hidden. Its Reload
button runs the same fresh-copy fetch, then `location.reload()` (a press by the member is not limited by
the guard). It is a centred line under the header area, in the page's own colours (light and dark), with
`role='alert'` so screen readers announce it.

For the hydration error, only an island import failure counts (`detail.componentUrl` set); a render
error inside the app is not a stale page.

No retry inside the page: after a deploy the old file is gone, so only fresh HTML helps, and Chromium
remembers a failed import for the life of the document anyway (checked: a second `import()` of the same
URL fails without a request). Clearing the cached promises in `loadChain`, `loadTonConnect` and
`clubModelFor` was built, measured to do nothing in Chromium, and removed (Alireza, 2026-11-02). A retry
under a new URL (`?retry=1`) would work for a brief network drop only; left for a later change if
members report a stuck app with no deploy behind it.

Rejected: a service worker that keeps old files (heavy, and it would serve stale code on purpose);
keeping old `/_astro/` files across deploys (GitHub Pages' artifact deploy replaces the whole site, so
it would need a second hosting step); shortening the HTML cache (not under our control on GitHub Pages,
and it does not help a tab left open).

## Changes

- `src/layouts/AppLayout.astro` — the inline head script above (about 40 lines), with a comment on why
  it is inline and why it reloads only once a minute; and the hidden load-failed notice in `<main>`.
- `src/i18n/en/site.json` — two new keys: `site.app.loadFailed` "Couldn't load the page." and
  `site.app.reload` "Reload".
- The same two keys in each released locale's `site.json`, after the English version is approved (the
  `locales` skill; the build gate fails without them).
- `CHANGELOG.md` — one entry.

## Acceptance criteria

Checked against a production build (`npm run build`, `npm run preview`) in Playwright, imitating a
deploy by answering 404 for chosen `/_astro/` files:

- [x] **Stale HTML on first load:** with the `AppIsland.*.js` request answered 404 on the first page load
      only, `/stake/` reloads exactly once and the app then renders (the shell is removed, the stake form
      is live). Same in Telegram mode (`/stake/?tma=1`), where the URL is unchanged after the reload.
- [x] **Loop guard:** with `AppIsland.*.js` answered 404 every time, the page reloads exactly once in
      2 minutes of watching, the console shows the Astro hydration error, and after the reload the
      notice "Couldn't load the page." with a Reload button is visible, on the web and in Telegram mode
      (`?tma=1`), in light and dark, at phone width (390 px) and desktop width.
- [x] **Reload button:** pressing Reload with the 404s turned off reloads the page and the app renders;
      the notice is gone.
- [x] **Notice hidden normally:** on a normal visit the notice is never visible, and screenshots of
      `/stake/` match today's.
- [x] **Running app, lazy chunk gone:** open `/stake/` normally, then answer 404 for `ClubPage.*.js` once,
      and navigate to the Club by the app's own link: the page reloads once and the Club renders.
- [x] **Running app, wallet chunk gone:** with the TonConnect chunk answered 404 once after load,
      pressing Connect reloads the page once; afterwards Connect opens the TonConnect dialog.
- [x] **No reload on a normal visit:** a full visit with no 404s (load, move between all five app pages
      and the Club, open the Connect dialog) causes no automatic reload (`sessionStorage` has no guard
      key).
- [x] `npm run build` passes (with the i18n gate) and `node --experimental-strip-types scripts/i18n-selftest.mjs`
      passes.
- [ ] A real deploy check after the push: a page opened before the deploy and used afterwards
      recovers (by hand, Alireza, on Telegram and in a browser).

## Risks & rollback

- **A reload in the middle of a Club claim or upgrade.** A reload happens only when a file needed for the
  next step is missing, so that step could not run anyway. A claim lock written before it is handled by
  the existing load-time check (`settleDueClaimLocks`, 0d7d4f3). A transaction already handed to the
  wallet is not touched by a reload.
- **Reload loop.** Bounded by the 60 s guard; if `sessionStorage` throws, no automatic reload at all.
- **Analytics** count the reloaded visit twice, once per reload; rare, only right after a deploy.
- **Undo:** revert the commit; the site then behaves as today.

## Open questions

None. (The load-failed notice was decided by Alireza on 2026-11-02.)
