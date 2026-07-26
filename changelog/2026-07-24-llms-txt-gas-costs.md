# 2026-07-24 — llms.txt gas costs and refunds

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. A
single-section addition to `public/llms.txt`, correcting a misreading that the
file otherwise invites: that the amounts attached to Hipo transactions are a
protocol fee. (Written retrospectively from the commit record.)

| Commit    | Summary                                       |
| --------- | --------------------------------------------- |
| `8c4fc87` | Add gas costs and refunds section to llms.txt |

---

### Gas costs and refunds

- **Hipo takes no protocol fee from the staked amount.** The small amounts
  attached to staking and unstaking transactions are gas prepayments, and the
  unused part is refunded.
- **Deposit and unstake refund differently**, which is the part most likely to
  be misreported. A deposit's unused prepayment returns to the wallet shortly
  after as a separate excess transfer. An unstake's returns little or nothing at
  request time — the remainder is paid out together with the final GRAM
  withdrawal, so a raw withdrawal payout slightly _overstates_ the pure staking
  reward.
- **How to measure a real return**: net all flows per cycle — (deposits sent −
  deposit refunds) against (request-time refunds + withdrawal payout).
- **Do not quote specific gas amounts.** They move with network gas prices.
  Current values come from the treasury's `get_treasury_fees` getter, also
  exposed by the Hipo MCP server's `get_fees` tool.

Also bumped the file's `Last reviewed` date to 2026-07-24.

---

### Verification performed

Not recorded for this session beyond the commit itself.

### Follow-ups

- None outstanding from this session.
