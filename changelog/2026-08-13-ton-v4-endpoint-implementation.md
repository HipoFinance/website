# 2026-08-13 — Implement the TON v4 read endpoint

Behrang approved `specs/ton-v4-read-endpoint.md` and this session built both
halves end to end: the client failover logic here, and the server (nginx
vhost + deployment) in the HipoGang `nginx` and `operation` repos.

| Repo      | Commit    | Description                                                            |
| --------- | --------- | ---------------------------------------------------------------------- |
| website   | `ff9f6ee` | Read from v4.hipo.finance first, with failover to the public endpoint. |
| nginx     | `8042333` | Add the v4.hipo.finance vhost.                                         |
| nginx     | `69ff6da` | Fix the default vhost proxying unmatched hostnames to Grafana.         |
| operation | `6919b10` | Add the tonv4 stack.                                                   |
| operation | `6d5c9dd` | Roll the nginx image.                                                  |

### Client

`Model.ts` gets an endpoint manager replacing the dead `connectTonAccess`
(ton-access has been dead for a while — see the comment at its former call
site). Primary is `https://v4.hipo.finance`, fallback is
`mainnet-v4.tonhubapi.com`. Failover triggers after 3 consecutive failed
read cycles, or when the last block is older than 10 minutes — "up but
stale" counts as down, not just connection failures. Recovery is a 60s
probe against a throwaway `TonClient4` instance so it can't disturb
in-flight reads on the live client; the probe pauses and resumes alongside
the other poll timers rather than running independently. Endpoint choice is
in-memory only — a fresh page load always starts on the primary.
`PUBLIC_TON_V4_ENDPOINT` overrides both endpoints to one fixed value and
disables failover entirely (for local/staging use).

One deliberate deviation from the spec, worth recording: `switchTonEndpoint`
resets `lastBlock` on every swap. Without that, the existing "older block"
staleness guard would reject almost every read immediately after swapping
back to a primary that's still a few seconds behind the fallback it just
replaced, which would flap the endpoint forever. This mirrors what
`setAddress` already does when the wallet address changes, so it's not a
new pattern in the file — just applied to the new switch path too.

### Server (summarized — detail lives in the HipoGang repos' own changelogs)

`tonwhales/ton-api-v4` v59, digest-pinned (mirroring the image into our own
registry was considered and declined as unnecessary), pointed at Hipo's own
liteserver only — verified there is no public-endpoint fallback baked into
the image that could leak through. The nginx vhost allows GET/HEAD/OPTIONS
only, locks CORS to `https://hipo.finance`, rate-limits at 120r/m, and lets
cache behavior come purely from upstream `Cache-Control` headers by setting
`expires off` — that's what defeats the http-context `json` no-cache
rewrite that would otherwise blanket every response. A healthcheck was
added because `ton-api-v4` wedges portless forever if its liteserver becomes
unreachable, rather than exiting or recovering.

Fixed en route: the default nginx vhost was proxying unmatched hostnames to
Grafana's login page — this is how the freshly created `v4.hipo.finance` DNS
record surfaced the bug before the real vhost config landed. It now returns
a logged 404 instead.

### Process note

The first pass at the server implementation targeted stale mirror repos
(`HipoFinance/operation` and `HipoFinance/config`) instead of the live ones
(`HipoGang/nginx` and `HipoGang/operation`). The stale `operation` copy also
had a decommissioned liteserver address hardcoded in the port, which got
caught before it shipped. Both stale clones were deleted.

`specs/ton-v4-nginx.conf` was added as a mirror of the deployed vhost plus
the relevant http-context pieces, following the same convention as
`specs/metrics-proxy-nginx.conf`.

### Verification performed

- Client: `tsc` and prettier clean; the built bundle carries exactly the two
  endpoint strings; dev failover to the public endpoint reasoned through
  step by step, and the DNS-failure case measured fast in practice (~0.4s
  per failed attempt, so 3 consecutive failures don't stall the UI).
- Server smoke test against the live deployment: `/block/latest` returns 200
  with a block timestamp ~1s behind wall clock; `cache-control` is
  `public, max-age=5` (not `no-cache`); exactly one
  `access-control-allow-origin: https://hipo.finance` header; `x-cache-status`
  present. Immutable `/block/{seqno}` is `max-age=31536000`, MISS then HIT
  on a repeat request. `POST /send` → 405. `/block/watch` → 404. A request
  from an evil origin gets no ACAO header at all. `stats.hipo.finance` and
  `gauge.hipo.finance` confirmed unchanged by the vhost work. A real
  `run/get_jetton_data` call through the new endpoint returns the correct
  jetton supply.
- Pending at time of writing: a production browser pass of the app actually
  reading from the new endpoint, which can only happen after this commit
  deploys.

### Follow-ups

- 120r/m is a starting point for the rate limit — watch for 429s from
  NAT'd users sharing an IP (the client degrades to the public endpoint in
  that case, not an outage, but it's worth tracking); 300r/m is the next
  step if needed.
- Add a monitor probe alerting on `/block/latest`'s `now` field being older
  than 10 minutes — both a wedged upstream and a desynced liteserver still
  answer HTTP 200, so only the payload catches them.
- The nginx repo's `make test` is broken at HEAD (the Dockerfile's
  `VOLUME /var/run/` shadows the secrets mount) — a one-line fix, but
  deliberately left out of this session to keep it scoped.
- `gauge.hipo.finance`'s `/data` endpoint serves `Cache-Control: no-cache`
  because of the same `expires` map that the new v4 vhost opts out of; the
  gauge vhost may want the same `expires off` treatment.
- `hpo-data.js` still reads the burned-HPO figure from
  `mainnet-v4.tonhubapi.com` directly; it could switch to
  `v4.hipo.finance` now that the endpoint exists.
