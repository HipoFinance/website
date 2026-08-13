# 2026-08-13 — TON v4 endpoint follow-ups

The `v4.hipo.finance` endpoint shipped and was verified working in production earlier today —
"It's working" (Behrang). This session works through the follow-up list left by
[2026-08-13-ton-v4-endpoint-implementation.md](2026-08-13-ton-v4-endpoint-implementation.md):
three items done, one declined.

| Commit    | Description                                            |
| --------- | ------------------------------------------------------ |
| `ae02ed0` | Read the burned-HPO figure from v4.hipo.finance first. |

### Done here

**`hpo-data.js`'s burned-HPO lookup** now reads from `v4.hipo.finance` first, with the public
`mainnet-v4.tonhubapi.com` endpoint as a per-call fetch fallback — the same primary-then-public
order the app island already uses, just implemented as a plain `fetch().catch()` chain rather than
the island's stateful endpoint manager, since this script has no polling loop to manage. That
fallback is also what keeps localhost dev working: the primary's CORS is locked to the production
origin, so a local `fetch` to it fails and falls through to the public endpoint automatically.

### Done in sibling repos

- **nginx `4f3ffb1`** unbroke `make test` — the Dockerfile's `VOLUME /var/run/` was shadowing the
  test harness's `/run` mounts on Alpine, where `/var/run` is a symlink to `/run`. Detail in that
  repo's `changelog/2026-08-13-fix-make-test.md`.
- **operation `503d2f6`** added the TON v4 staleness alert: a new `json_exporter` prober reads the
  block timestamp out of `v4.hipo.finance/block/latest`'s response body, since both of that
  endpoint's failure modes keep answering HTTP 200. Detail in that repo's
  `changelog/2026-08-13-tonv4-staleness-alert.md`.

### Declined

**Giving `gauge.hipo.finance/data` the same `expires off` treatment as the v4 vhost** — raised as a
follow-up from the implementation session, and declined here. The gauge Go service sets no
`Cache-Control` header at all, unlike `ton-api-v4`, which does. That means nginx's http-context
`json` no-cache rewrite is currently the _only_ cache policy in effect on that route; removing it
via `expires off` wouldn't hand control to a deliberate upstream policy the way it did for the v4
vhost — it would leave no header at all and hand caching over to browser heuristics, which is worse
than what's there now. A deliberate cache policy belongs in the gauge service itself first. Raised
for Alireza rather than done unilaterally.

---

### Verification performed

- `hpo-data.js`: prettier clean, `npm run build` clean, and the built `/hpo/` page carries both
  endpoint strings (primary and fallback).
- The primary endpoint's `get_jetton_data` path was already smoke-tested live earlier in the day
  during the implementation session's server verification, and answers correctly.

### Follow-ups

- Activating the monitoring added by operation `503d2f6` still needs operator steps on the node —
  detail lives in that repo's changelog, not here.
- The rate-limit watch from the implementation session (429s from NAT'd users sharing an IP;
  120r/m could move to 300r/m if needed) remains observational — nothing has been seen yet.
