# 2026-07-26 (third session) — Docs link audit

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. The
maintainer asked for every link in `src/content/docs/**.md` to be listed with
its state, to find dead ones. **None were dead.** The audit did surface two
consistency defects, which were then fixed here and in three non-docs
components carrying the same defect.

| Commit    | Summary                                                            |
| --------- | ------------------------------------------------------------------ |
| `fe7eb5d` | Normalize links across docs and components to canonical https URLs |

This report and the `CHANGELOG.md` entry land in a follow-up commit.

---

### The audit

131 link references across the 38 files, resolving to **99 unique URLs** — 36
internal, 63 external. Extraction covered markdown links and images, raw
`<a>`/`<img>`/`<iframe>` attributes (the docs use raw `<figure>` and `<iframe>`
blocks heavily, inherited from GitBook), and bare URLs in prose.

Internal targets were checked twice: against the source tree, and against the
built `dist/` output after `npm run build`. All 36 resolve — 9 page routes, 25
files under `public/docs/images/` including two `.rar` downloads, and the two
`/faq/` anchors added last session (`FAQ.astro:197` and `:437`). No GitBook
`broken-reference` artifacts, no reference-style `[x][y]` links, no relative
paths.

All 63 external URLs are reachable. Four groups return non-200 and needed
second-source confirmation rather than being reported as dead:

- **`ton.vote` (4 links) — HTTP 404, live.** Their SPA host returns 404 for
  every sub-route while serving the app shell; client-side routing then
  resolves it. The root returns 200, a nonsense path returns the identical
  404 body, so status alone proves nothing. Confirmed against `api.ton.vote`:
  the DAO is `daoId: 84` and all three proposal addresses appear in its
  `daoProposals` list.
- **`getgems.io` (4 links) — HTTP 403, live.** Cloudflare blocks curl; their
  homepage 403s too. Confirmed via `tonapi.io` that all three NFT collections
  exist on-chain and are owned by `hipo.ton`.
- **`t.me` over plain http (5 refs) — timed out, live over https.** This is the
  first defect below.
- **YouTube embeds (7 unique) — 200, but a 200 proves little**, since removed
  videos still serve a player shell. Checked via oembed instead: all seven
  resolve to real videos on the `@HipoFinance` channel.

### Defect 1 — plain `http://` schemes

Six references, in five docs files, used `http://`: four instances of
`t.me/HipoFinanceBot/join`, one of `t.me/HipoFinanceBot/app`, and
`stats.hipo.finance/`. All hang or redirect over http and return 200 over
https.

A repo-wide grep found the same `http://t.me/HipoFinanceBot/join` in three
files outside the docs — `Landing.astro:343` ("Join Hipo Club"),
`Banner.astro:25` and `app/Header.tsx:28` (both "Earn Now"). These were flagged
rather than fixed silently, since the request was scoped to the docs; the
maintainer asked for them in the same session and they are included in the same
commit.

### Defect 2 — two spellings of the dApp URL

Six references used `https://app.hipo.finance/#/…`, which 301-redirects to
`https://hipo.finance/app/#/…` — the spelling already used by ten other
references, and the one the phishing-awareness page lists as canonical. Having
both is a genuine hazard on a site that teaches users to recognize official
URLs, so they were collapsed onto the `hipo.finance/app/` form. Unique URLs in
the docs dropped 99 → 95.

### Checked and deliberately not changed

- **`tutorials/unstaking.md:25`** has `...false\&ft=TON\&tt=hTON` in the STON.fi
  link. The backslashes look like a GitBook escaping artifact, but they are
  valid CommonMark escapes: the built HTML renders
  `href="…false&#x26;ft=TON&#x26;tt=hTON"`, which is correct. Verified in
  `dist/` rather than assumed. Left alone.
- **`https://hpo.hipo.finance/`** (5 refs) redirects to `hipo.finance/hpo/`.
  Unlike the dApp case there is no competing spelling in the docs, so there was
  nothing to normalize toward; not touched.
- **Case and trailing-slash variance** in social links (`t.me/HipoFinance` vs
  `t.me/hipofinance`, `x.com/hipofinance` vs `.../`). All resolve. Left alone —
  the variants on `security/phishing-awareness-and-prevention.md` are that
  page's canonical list of official URLs, and rewriting entries there is a
  content decision, not a cleanup.

### Deferred

- **The Twitter-CDN emoji hotlink.** `tokenomics.md:40-41` embeds
  `https://abs-0.twimg.com/emoji/v2/svg/25aa.svg` twice as a bullet character —
  a GitBook import leftover. It loads today, but it is an uncontrolled
  third-party asset from x.com's CDN standing in for a typographic mark, and it
  leaks a request to Twitter from a docs page. Not fixed because the
  replacement is a judgment call (a real bullet, a local SVG, or dropping it),
  not a mechanical substitution.

---

### Verification performed

- `npm run build` after each round of edits — 43 pages, Pagefind index rebuilt,
  no errors.
- Re-scanned the built `dist/docs/` HTML: no `href`/`src` points at a file that
  does not exist.
- Re-checked the changed URLs live after editing: `t.me/HipoFinanceBot/join`,
  `/app`, `stats.hipo.finance/` and `hipo.finance/app/` all 200.
- `grep "http://"` across `src/` and `public/` now returns nothing beyond XML
  and schema namespace URIs (`w3.org`, `schema.org`, `ogp.me`, `purl.org`),
  which are identifiers and must not be rewritten.
- Confirmed in `dist/` that every rendered `t.me/HipoFinanceBot*` href is
  https. Note the `Header.tsx` instance ships inside the `client:only` React
  island and so does not appear in the static HTML; only its source was
  verified.
- `git diff` reviewed in full to confirm no prose was altered — 15 insertions,
  15 deletions, all of them URLs.

### Follow-ups

- The `abs-0.twimg.com` hotlink above.
- Carried over and still open: **the `docs.hipo.finance` Cloudflare cutover**
  has not been executed. See
  [the earlier report](2026-07-26-faq-anchors-and-cutover-runbook.md#follow-ups);
  the runbook is in `specs/gitbook-docs-migration.md`.
- Carried over: the five pre-rule `CHANGELOG.md` entries remain verbose, and
  `origin/alirezaravanbakhsh-patch-1` is still a stale remote branch.
- This session's work is on the `docs-link-audit` branch, not `main`.
