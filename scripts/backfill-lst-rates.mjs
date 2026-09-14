// Backfill two years of daily exchange rates for the measurable TON liquid-staking protocols.
//
// See specs/realized-apy-comparison.md. This is the Phase 1 script: it samples every protocol's
// rate once a day at 00:00 UTC by resolving that timestamp to a masterchain seqno and running the
// protocol's get-method at that block, and writes src/data/lst-rates.json.
//
// Two rules from the spec are load-bearing here, and both are about NOT trusting a stack position:
//
//   - Hipo is read through @hipo-finance/sdk, never by index. Its get_treasury_state tuple is
//     append-only but not positionally stable — a `deficit` field was inserted mid-tuple and
//     shifted everything after it, which already broke dune/exporter/export-rates.mjs.
//   - The Whales-family pool (Tonstakers, Stakee, KTON) ships two stack layouts: 30 items with the
//     jetton supply at [13], 34 items with it at [17]. Total staked is at [2] in both. Reading [13]
//     from a 34-item stack silently returns accruedGovernanceFee — a wrong number, not an error.
//     So we branch on stack length and refuse a length we do not recognise.
//
// Samples store the two raw integers as decimal STRINGS, not their ratio (spec R13). Strings
// because Tonstakers' staked total is ~4.5e16 nanotons, past Number.MAX_SAFE_INTEGER — a JSON
// number would quietly lose the low digits. The rate and the pool size are both derived later.
//
// Re-runnable: every (date, protocol) result is appended to a cache file, so a crash or a rate
// limit costs only the samples not yet taken. Delete the cache to force a clean re-read.
import { writeFileSync, appendFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Address } from '@ton/core'
import { TonClient4 } from '@ton/ton/dist/client/TonClient4.js'
import { treasuryAddresses } from '@hipo-finance/sdk'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

// The public v4 archive. Verified to execute get-methods against two-year-old state, keyless and
// free; historical responses come back CDN-cached. Override for a different archive provider.
const ENDPOINT = process.env.TON_V4_ENDPOINT ?? 'https://mainnet-v4.tonhubapi.com'

const DAYS = Number(process.env.LST_DAYS ?? 731)
const CONCURRENCY = Number(process.env.LST_CONCURRENCY ?? 6)
const OUT = join(root, 'src/data/lst-rates.json')
const CACHE = process.env.LST_CACHE ?? join(root, '.cache/lst-rates-samples.jsonl')

// Whales-family stack layouts: stack length -> index of the pool jetton supply. Total staked is
// [2] in both. An unrecognised length is an error, never a guess.
//
// Verified against contract source, not inferred from position (spec R4): 30 fields is upstream
// ton-blockchain/liquid-staking-contract `main` (Tonstakers, Stakee — identical code hashes),
// 34 fields is its `v2` branch (KTON, byte-identical to v2 HEAD). In the 34-field layout index 13
// is `accrued_governance_fee`, so reading it as supply is a hard bug that yields a plausible
// number. `total_balance / supply` is the ratio the contract itself converts at:
// `muldiv(jetton_amount, total_balance, supply)`. Accrued governance fees are excluded from
// total_balance rather than double-counted, and pending deposits and withdrawals sit on both
// sides at once — so never add requested_for_deposit to the numerator.
const WHALES_SUPPLY_INDEX = { 30: 13, 34: 17 }

// Hipo's get_treasury_state tuple is append-only, and over this window it has been observed at 20
// fields (nearly all of it), then 21, 24 and 26 across 2026-09-06/07 — several deployments in two
// days, not one migration. So this asserts a MINIMUM arity rather than an allowlist of lengths,
// the same way gauge's own exporter does, and reads only [0] and [1]: total_coins and total_tokens
// sit ahead of every insertion, including the `deficit` field added at index 5, which is why
// reading them by index is safe while reading anything past index 5 is not.
//
// @hipo-finance/sdk is deliberately NOT used here. Its parser tracks today's tuple and throws
// "Not a number" on the 20-field state that covers most of the window — the SDK is right for
// reading current state and useless for reading history. The check that the index read is correct
// is that the ratio stays continuous across every arity change.
const HIPO_MIN_ARITY = 20

// Offsets from 00:00 UTC to try when the archive cannot serve an account at the day's first block.
const SEQNO_FALLBACK_OFFSETS = [0, 3600, 7200, 21600]

const PROTOCOLS = [
  {
    id: 'hipo',
    label: 'Hipo',
    address: treasuryAddresses.get('mainnet').toString(),
    method: 'get_treasury_state',
    field: 'stack[0] / stack[1]',
    read: async (client, seqno, address) => {
      const res = await client.runMethod(seqno, address, 'get_treasury_state')
      if (res.exitCode !== 0) {
        return { exitCode: res.exitCode }
      }
      const len = res.result.length
      if (len < HIPO_MIN_ARITY) {
        throw new Error(`get_treasury_state returned ${len} fields, expected at least ${HIPO_MIN_ARITY}`)
      }
      return { staked: intAt(res.result, 0), supply: intAt(res.result, 1), stackLen: len }
    },
  },
  {
    id: 'tonstakers',
    label: 'Tonstakers',
    address: 'EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR',
    method: 'get_pool_full_data',
    field: 'stack[2] / stack[13 or 17 by layout]',
    read: readWhalesPool,
  },
  {
    id: 'stakee',
    label: 'Stakee',
    address: 'EQD2_4d91M4TVbEBVyBF8J1UwpMJc361LKVCz6bBlffMW05o',
    method: 'get_pool_full_data',
    field: 'stack[2] / stack[13 or 17 by layout]',
    read: readWhalesPool,
  },
  {
    id: 'kton',
    label: 'KTON',
    address: 'EQA9HwEZD_tONfVz6lJS0PVKR5viEiEGyj9AuQewGQVnXPg0',
    method: 'get_pool_full_data',
    field: 'stack[2] / stack[13 or 17 by layout]',
    read: readWhalesPool,
  },
  {
    // Collected so that R12's liveness test can be EVALUATED from the data rather than asserted
    // from a remembered TVL figure. It is expected to fail that test and be dropped.
    id: 'bemo',
    label: 'bemo',
    address: 'EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k',
    method: 'get_full_data',
    field: 'stack[1] / stack[0]',
    read: async (client, seqno, address) => {
      const res = await client.runMethod(seqno, address, 'get_full_data')
      if (res.exitCode !== 0) {
        return { exitCode: res.exitCode }
      }
      return {
        staked: intAt(res.result, 1),
        supply: intAt(res.result, 0),
        stackLen: res.result.length,
      }
    },
  },
]

async function readWhalesPool(client, seqno, address) {
  const res = await client.runMethod(seqno, address, 'get_pool_full_data')
  if (res.exitCode !== 0) {
    return { exitCode: res.exitCode }
  }
  const len = res.result.length
  const supplyIndex = WHALES_SUPPLY_INDEX[len]
  if (supplyIndex === undefined) {
    // A third layout would mean a contract upgrade we have not read. Refuse rather than pick the
    // nearest index: the failure mode of guessing is a plausible-looking wrong line on the chart.
    throw new Error(`unrecognised get_pool_full_data stack length ${len}`)
  }
  return { staked: intAt(res.result, 2), supply: intAt(res.result, supplyIndex), stackLen: len }
}

function intAt(stack, index) {
  const item = stack[index]
  if (item === undefined || item.type !== 'int') {
    throw new Error(`stack[${index}] is ${item === undefined ? 'missing' : item.type}, expected int`)
  }
  return item.value
}

// ---- date grid -------------------------------------------------------------

// 00:00 UTC for each of the last DAYS days, oldest first. A realized-APY series barely moves day
// to day, so a fixed daily instant is already finer than the signal.
function dateGrid() {
  const midnightToday = Math.floor(Date.now() / 86400000) * 86400
  const days = []
  for (let i = DAYS - 1; i >= 0; i--) {
    const ts = midnightToday - i * 86400
    days.push({ ts, date: new Date(ts * 1000).toISOString().slice(0, 10) })
  }
  return days
}

// ---- cache -----------------------------------------------------------------

function loadCache() {
  const byKey = new Map()
  if (!existsSync(CACHE)) {
    return byKey
  }
  for (const line of readFileSync(CACHE, 'utf8').split('\n')) {
    if (line.trim() === '') {
      continue
    }
    try {
      const row = JSON.parse(line)
      // Transport failures are not cached across runs: re-running is how they get retried. An
      // exitCode row is a real answer about that date and does stay.
      if (row.error === undefined) {
        byKey.set(`${row.date}:${row.id}`, row)
      }
    } catch {
      // A torn last line from an interrupted run: ignore it, the sample is simply retaken.
    }
  }
  return byKey
}

function appendCache(row) {
  mkdirSync(dirname(CACHE), { recursive: true })
  appendFileSync(CACHE, JSON.stringify(row) + '\n')
}

// ---- run -------------------------------------------------------------------

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++
      if (i >= items.length) {
        return
      }
      results[i] = await worker(items[i], i)
    }
  })
  await Promise.all(runners)
  return results
}

async function withRetry(label, fn) {
  let delay = 500
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      // An unrecognised stack layout is a real finding, not a flaky request — surface it at once.
      if (message.includes('unrecognised')) {
        throw e
      }
      if (attempt >= 5) {
        throw new Error(`${label}: ${message}`)
      }
      await new Promise((r) => setTimeout(r, delay))
      delay *= 2
    }
  }
}

async function main() {
  const client = new TonClient4({ endpoint: ENDPOINT, timeout: 30000 })
  const days = dateGrid()
  const cache = loadCache()
  const addresses = new Map(PROTOCOLS.map((p) => [p.id, Address.parse(p.address)]))

  console.log(`[lst] ${days[0].date} … ${days[days.length - 1].date} (${days.length} days)`)
  console.log(`[lst] endpoint ${ENDPOINT}, concurrency ${CONCURRENCY}`)
  console.log(`[lst] ${cache.size} samples already cached`)

  let taken = 0
  let failed = 0

  const seqnoCache = new Map()
  const seqnoAt = (ts) => {
    if (!seqnoCache.has(ts)) {
      seqnoCache.set(
        ts,
        withRetry(`utime ${ts}`, async () => {
          const block = await client.getBlockByUtime(ts)
          const shard = block.shards.find((s) => s.workchain === -1)
          if (shard === undefined) {
            throw new Error('no masterchain shard in block')
          }
          return shard.seqno
        }),
      )
    }
    return seqnoCache.get(ts)
  }

  await mapLimit(days, CONCURRENCY, async (day) => {
    const missing = PROTOCOLS.filter((p) => !cache.has(`${day.date}:${p.id}`))
    if (missing.length === 0) {
      return
    }

    // One seqno lookup per day serves every protocol. Resolved from the timestamp, never
    // extrapolated: masterchain cadence went from ~0.4 to ~2.2 blocks/s inside this window, so
    // linear extrapolation from a known seqno lands months away.
    let seqno
    try {
      seqno = await seqnoAt(day.ts)
    } catch (e) {
      console.warn(`[lst] ${day.date}: ${e.message}`)
      failed += missing.length
      return
    }

    for (const protocol of missing) {
      let row
      try {
        let out
        let lastError
        // A handful of seqnos answer HTTP 500 for a given account no matter how often they are
        // retried — the archive cannot serve that block for it. Stepping to a later block the
        // same day is a genuine chain read, and a rate series does not move perceptibly in an
        // hour, so this fills the hole honestly rather than leaving a gap at the chart's edge.
        for (const offset of SEQNO_FALLBACK_OFFSETS) {
          const at = offset === 0 ? seqno : await seqnoAt(day.ts + offset)
          try {
            out = await withRetry(`${protocol.id} ${day.date}`, () =>
              protocol.read(client, at, addresses.get(protocol.id)),
            )
            if (offset !== 0) {
              console.log(`[lst] ${day.date} ${protocol.id}: used +${offset / 3600}h block ${at}`)
            }
            seqno = at
            break
          } catch (e) {
            lastError = e
          }
        }
        if (out === undefined) {
          throw lastError
        }
        row =
          out.exitCode !== undefined
            ? // -256 is "account not deployed at this block", which is a real answer about that
              // date, not a transport failure. Recorded as such so the series simply starts later.
              { date: day.date, id: protocol.id, seqno, exitCode: out.exitCode }
            : {
                date: day.date,
                id: protocol.id,
                seqno,
                staked: out.staked.toString(),
                supply: out.supply.toString(),
                stackLen: out.stackLen,
              }
        taken++
      } catch (e) {
        console.warn(`[lst] ${day.date} ${protocol.id}: ${e.message}`)
        row = { date: day.date, id: protocol.id, seqno, error: e.message }
        failed++
      }
      cache.set(`${day.date}:${protocol.id}`, row)
      appendCache(row)
      if (taken % 250 === 0 && taken > 0) {
        console.log(`[lst] ${taken} samples taken, ${failed} failed`)
      }
    }
  })

  console.log(`[lst] done: ${taken} taken this run, ${failed} failed`)
  writeDataset(days, cache)
}

// Run-length encode the observed stack lengths. Cheap, and it is the audit trail for the one
// failure mode that produces a wrong number rather than an error: a layout change mid-history.
function encodeStackLens(values) {
  const runs = []
  for (const value of values) {
    const last = runs[runs.length - 1]
    if (last !== undefined && last[0] === value) {
      last[1]++
    } else {
      runs.push([value, 1])
    }
  }
  return runs
}

function writeDataset(days, cache) {
  const protocols = {}
  for (const protocol of PROTOCOLS) {
    const staked = []
    const supply = []
    const stackLens = []
    let samples = 0
    for (const day of days) {
      const row = cache.get(`${day.date}:${protocol.id}`)
      if (row === undefined || row.staked === undefined) {
        staked.push(null)
        supply.push(null)
        stackLens.push(row?.exitCode ?? null)
        continue
      }
      staked.push(row.staked)
      supply.push(row.supply)
      stackLens.push(row.stackLen)
      samples++
    }
    protocols[protocol.id] = {
      label: protocol.label,
      address: protocol.address,
      method: protocol.method,
      field: protocol.field,
      samples,
      stackLens: encodeStackLens(stackLens),
      staked,
      supply,
    }
    console.log(`[lst] ${protocol.id}: ${samples}/${days.length} samples`)
  }

  const dataset = {
    generated: new Date().toISOString().slice(0, 10),
    endpoint: ENDPOINT,
    start: days[0].date,
    end: days[days.length - 1].date,
    days: days.length,
    note: 'Daily 00:00 UTC samples. staked/supply are raw chain integers as decimal strings; rate = staked / supply. See specs/realized-apy-comparison.md.',
    protocols,
  }
  writeFileSync(OUT, JSON.stringify(dataset, null, 1) + '\n')
  console.log(`[lst] wrote ${OUT}`)
}

await main()
