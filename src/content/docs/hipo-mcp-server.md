---
title: 'Hipo MCP Server'
description: "Connect Claude, Cursor, or any MCP-capable AI client to Hipo's documentation and live on-chain data."
---

### What is the Hipo MCP Server?

The Hipo MCP Server is a small open-source service that lets AI assistants read Hipo. It speaks the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), an open standard for connecting AI clients to external data, so any MCP-capable client — Claude, Claude Code, Cursor, and others — can look up Hipo's documentation and query live on-chain numbers instead of guessing from memory.

Once connected, your assistant can answer questions like:

- _What is the current hGRAM/GRAM exchange rate, and what APY does that imply?_
- _How much GRAM is staked in Hipo right now?_
- _When does the current validation round end, and when will my deferred deposit mint hGRAM?_
- _What is the hGRAM balance of this address, and what is it worth in GRAM?_
- _What gas fee should I attach to a deposit?_

The answers come from Hipo's smart-contract getters on TON, not from the model's training data, so they are current as of the moment you ask.

The server is strictly **read-only**. It holds no keys, signs nothing, and sends no messages to the blockchain. It can look, but it can never move your funds — connecting it is not a way for anyone to stake, unstake, or transfer on your behalf.

### Connecting

#### Hosted server (recommended)

Hipo runs a public instance. Point your MCP client at:

```
https://mcp.hipo.finance/mcp
```

In [Claude Code](https://claude.com/claude-code), one command is enough:

```sh
claude mcp add --transport http hipo https://mcp.hipo.finance/mcp
```

Clients that are configured with a JSON file (Claude Desktop, Cursor, and most others) take an entry like this:

```json
{
  "mcpServers": {
    "hipo": {
      "type": "http",
      "url": "https://mcp.hipo.finance/mcp"
    }
  }
}
```

#### Running it locally

If you would rather run the server yourself, it is published on npm as [`@hipo-finance/mcp`](https://www.npmjs.com/package/@hipo-finance/mcp) and speaks stdio. This requires Node.js 20 or newer:

```sh
claude mcp add hipo -- npx -y @hipo-finance/mcp
```

Or, as a JSON configuration entry:

```json
{
  "mcpServers": {
    "hipo": {
      "command": "npx",
      "args": ["-y", "@hipo-finance/mcp"]
    }
  }
}
```

### Tools

These are the questions the server can answer. Your AI client picks the right one on its own — you ask in plain language.

| Tool                 | What it returns                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `get_exchange_rate`  | The current hGRAM↔GRAM rate, total GRAM staked, hGRAM supply, and the recent APY derived from on-chain rate updates                              |
| `get_treasury_state` | Treasury totals: TVL in GRAM, hGRAM supply, pending deposits and unstakes, active round participations, the halt flag, and governance parameters |
| `get_round_timing`   | Validation round timing: current and next round boundaries, the election participation window, and how long stakes stay frozen                   |
| `get_fees`           | Current gas fees for deposit, unstake, and loan requests                                                                                         |
| `get_wallet_status`  | A given address's hGRAM balance, its value in GRAM, and any pending stakes or unstakes                                                           |
| `get_reward_history` | A given address's historical staking rewards per round, including Hipo Club level and HPO rewards                                                |
| `get_participation`  | Hipo's participation in a validation round: state, loan counts, totals, and stake release time                                                   |
| `get_loan_info`      | A borrower's per-round loan contract: address, deployment state, balance, and parties                                                            |
| `get_max_punishment` | The maximum punishment the protocol can apply for a given validator stake                                                                        |

The first four tools need no input at all. `get_wallet_status`, `get_reward_history`, and `get_loan_info` take a TON address — the owner's or borrower's own address, not their jetton wallet address — and `get_max_punishment` takes a stake amount in GRAM. `get_participation` and `get_loan_info` also accept a round start time, but it is optional: omit it and they report on the current round.

Every response carries the same reminder that the tools return live protocol data, not financial advice: values change every validation round and no returns are guaranteed.

### Documentation resources

Alongside the live data, the server exposes Hipo's technical documents as MCP resources, fetched from their canonical public locations so they are always current:

| Resource                   | Content                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `hipo://docs/overview`     | The smart-contract repository README: protocol summary and deployed contract addresses |
| `hipo://docs/architecture` | Contracts, the validation-round state machine, and protocol invariants                 |
| `hipo://docs/integration`  | Message schemas and the integration guide for wallets and other protocols              |
| `hipo://docs/schema`       | The full TL-B schemas of all Hipo contracts                                            |
| `hipo://docs/knowledge`    | The curated Hipo knowledge base ([llms.txt](https://hipo.finance/llms.txt))            |

### Example

A call to `get_exchange_rate` returns plain JSON. Numbers change every round, so treat these as a shape, not as current values:

```json
{
  "oneHgramInGram": "1.143623345",
  "oneGramInHgram": "0.874413769",
  "totalCoinsGram": "2501952.200844389",
  "totalTokensHgram": "2187741.455006677",
  "recentApy": "15.59%",
  "apyNote": "APY is derived from the last on-chain rate update (current_rate / previous_rate compounded to a year). Rewards accrue in the exchange rate: hGRAM becomes worth more GRAM over time; there is no separate claim.",
  "disclaimer": "Live protocol data, not financial advice. Values change every validation round and no returns are guaranteed."
}
```

The server never re-implements protocol math. Every number above comes from a contract getter, and the contract repository is the source of truth for deployed addresses.

### Self-hosting

The server is MIT-licensed and lives at [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp). It ships two transports — `stdio` for local clients and streamable HTTP for a hosted deployment — and a Dockerfile:

```sh
docker build -t hipo-mcp .
docker run -p 3000:3000 -e TONCENTER_API_KEY=... hipo-mcp
```

All configuration is optional; the defaults target mainnet through the public toncenter API.

| Environment variable       | Default                                | Purpose                                                                                                       |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `HIPO_NETWORK`             | `mainnet`                              | `mainnet` or `testnet`                                                                                        |
| `TONCENTER_ENDPOINT`       | `https://toncenter.com/api/v2/jsonRPC` | TON HTTP API endpoint                                                                                         |
| `TONCENTER_API_KEY`        | _(none)_                               | toncenter API key; without one the public rate limit applies, and rate-limited calls are retried with backoff |
| `TONCENTER_API_KEY_FILE`   | _(none)_                               | Path to a file holding the API key, such as a Docker secret; takes precedence over `TONCENTER_API_KEY`        |
| `HIPO_STATE_CACHE_SECONDS` | `5`                                    | How long treasury state, times, and fees are cached between tool calls                                        |
| `HIPO_DOCS_CACHE_SECONDS`  | `300`                                  | How long documentation resources are cached                                                                   |
| `HIPO_REWARDS_API_BASE`    | `https://api.hipogang.io`              | Base URL of the Hipo rewards API; set it empty to disable `get_reward_history`                                |
| `PORT` / `HOST`            | `3000` / `0.0.0.0`                     | HTTP transport only                                                                                           |

<br>
