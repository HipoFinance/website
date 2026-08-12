# 2026-08-12 — Hotfix: chart 403s after the allowlist cleanup, tonapi 429s

Third session of the day. Behrang reported three production symptoms with the browser:
the HPO/USD sparkline missing, tonapi calls answering 429, and 403s from the gauge.
The first and third were one bug; the second was the new burned-HPO lookup.

| Commit    | Description                                                 |
| --------- | ----------------------------------------------------------- |
| `5fc56aa` | Match the allowlist's new 8-metric Prometheus query.        |
| `0aade2e` | Read the burned-HPO figure from the TON v4 API, not tonapi. |

### The 403s / missing sparkline

Alireza's allowlist cleanup (nginx repo `bb7a4a7`…`f50408b`) allowlisted a **new
8-metric query** — `hipo_treasury_protocol_fee` inserted after `hipo_treasury_hton_rate`
— and then dropped both older entries, including the 7-metric query the deployed site
was still sending. Every `query_range` request 403'd, so the HPO sparkline drew nothing
and the Stats charts showed their in-card error state. Confirmed by probing: both old
queries 403, the 8-metric one 200.

Fix: the client query in `charts/prometheus.ts` now matches the deployed entry
byte-for-byte (`encodeURIComponent` output compared: MATCH), the new metric joined the
`MetricName` union (history now available for a future fee chart), and
`specs/metrics-proxy-nginx.conf` mirrors the deployed single-entry map. Lesson recorded:
the allowlist contract cuts both ways — dropping an entry needs the same deploy-order
care as adding one.

### The tonapi 429s

The "Burned so far" figure introduced earlier today called `tonapi.io/v2/jettons/…`,
whose free tier rate-limits aggressively. Replaced with the TON v4 API
(`mainnet-v4.tonhubapi.com` — the API the dApp's `TonClient4` already speaks):
`/block/latest` then `/block/{seqno}/{jetton}/run/get_jetton_data`, first stack item =
total supply, `1B − supply` = burned. Block-keyed, CDN-cached (`max-age=31536000`),
CORS `*`. When `v4.hipo.finance` from the read-endpoint spec exists, this constant can
point there. The remaining "tonapi" string in the island bundle is Tonkeeper's
TonConnect bridge (`bridge.tonapi.io`) from the wallet list — not ours to change.

### Verification performed

- curl probes: old 6- and 7-metric queries → 403; new 8-metric query → 200 with data;
  v4 `get_jetton_data` → exitCode 0, supply 977,788,535 HPO with `Origin:
https://hipo.finance` accepted.
- Build/prettier/`tsc` clean; the 8-metric query confirmed in the built prometheus
  chunk; no `tonapi.io/v2` call anywhere in `dist/`.
- Post-deploy browser pass on production (extension reconnected): HPO page network shows
  `query_range` 200 and the sparkline drawing; burned figure fills; no 403/429.

### Follow-ups

- Still worth having the gauge expose the burned figure natively (drops the two v4
  calls); ask Alireza.
- When adding the protocol-fee history chart to the Stats page, the metric and the
  allowlist are already in place.
