#!/usr/bin/env node
// Hipo Fund on-chain snapshot (specs/hipo-fund-onchain-reports.md). Prints the holdings tables and the
// Sources block that go into src/content/docs/hipo-fund/quarterly-report-*.md, so a report is one command
// plus a short narrative. Reporting tool only — never wired into `prebuild`, because the build must not
// depend on the network.
//
//   node scripts/hipo-fund-snapshot.mjs                        snapshot at the latest masterchain block
//   node scripts/hipo-fund-snapshot.mjs --at 2026-03-18        snapshot at the block covering 12:00 UTC that day
//   node scripts/hipo-fund-snapshot.mjs --seqno 88062675       snapshot at exactly that masterchain block
//   node scripts/hipo-fund-snapshot.mjs --compare 2025-12-18   also diff against that date (on-chain + as published)
//   node scripts/hipo-fund-snapshot.mjs --json                 machine-readable, for diffing two runs
//
// Every report records its masterchain seqno in the Notes, so `--seqno <that number>` re-derives the exact
// published balances however long afterwards — which is what makes a published figure checkable rather than
// merely sourced.
//
// Three facts this script exists to get right:
//
// 1. THE FUND IS TWO WALLETS. The multisig hipofund.ton holds most of it, but the pre-migration wallet
//    UQBwGlrp… was never emptied and still holds USDT and HPO. The published reports already aggregate
//    both — 9,000,000 HPO (multisig) + 23,524.435767 (legacy) = 9,023,524.435767, which is the December 18,
//    2025 report's "9,023,524.43" to the cent. Reading only the multisig understates the fund by ~$18k.
// 2. THE ARCHIVE ENDPOINT IS THE PUBLIC ONE. https://v4.hipo.finance is the dApp's primary read endpoint but
//    is NOT archive-capable — it 500s on /block/utime/…. Historical reads must go to mainnet-v4.tonhubapi.com.
// 3. NEVER INVENT A NUMBER. Every value here is fetched, or it is printed as UNAVAILABLE and the process
//    exits non-zero. There is no cache, no fallback price, no "approximately". A report is never published
//    with an UNAVAILABLE in it.
//
// Zero new dependencies: raw fetch for every HTTP call (so every URL is printable in the Sources block) plus
// @ton/core — already a direct dependency — for the one thing raw REST cannot do, encoding the
// get_wallet_address argument tuple and decoding the address slice it returns.

import { Address, Cell, beginCell, serializeTuple } from '@ton/core'

// ------------------------------------------------------------------------------------------------ constants

// The two wallets the fund holds assets in. The legacy one is documented on /docs/hipo-fund/ as the
// "previous wallet"; it is still funded, so it is still counted.
const WALLETS = [
  { name: 'Multisig (hipofund.ton)', address: 'EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr' },
  { name: 'Legacy wallet', address: 'UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG' },
]

// The asset allowlist. Both wallets also receive spam jettons ("LOCKED GRAM", "GRAM AIRDROP", TONRAGE,
// STAR) — assets are included by being on this list, never by a price or verification heuristic.
const ASSETS = [
  { symbol: 'USDT', master: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', decimals: 6, price: 'usdt' },
  { symbol: 'HPO', master: 'EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM', decimals: 9, price: 'hpo' },
  { symbol: 'hGRAM', master: 'EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w', decimals: 9, price: 'hgram' },
]

// Hipo's treasury. get_treasury_state field 0 is totalCoins (GRAM backing) and field 1 is totalTokens
// (hGRAM minted); their ratio is the protocol redemption rate, read from the same block as the balances.
const TREASURY = 'EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ'

const V4 = 'https://mainnet-v4.tonhubapi.com'
const COINGECKO = 'https://api.coingecko.com/api/v3'
const CG_IDS = { gram: 'the-open-network', hpo: 'hipo-governance-token' }

// The December 18, 2025 report AS PUBLISHED. Quoted, never recomputed: that report valued hGRAM at $1.5200
// where rate x GRAM price gives $1.6127 for its block, so recomputing it would silently restate history.
const DECEMBER_2025 = {
  date: 'December 18, 2025',
  page: '/docs/hipo-fund/quarterly-report-december-18-2025/',
  total: 110875.29,
  rows: [
    { symbol: 'USDT', amount: 50461.2, usd: 50461.2, pct: 45.53 },
    { symbol: 'HPO', amount: 9023524.43, usd: 36094.09, pct: 32.55 },
    { symbol: 'hGRAM', amount: 16000, usd: 24320.0, pct: 21.92 },
  ],
}

const GRAM_DECIMALS = 9
const RETRIES = 4
const RATE_LIMIT_BACKOFF = 35000

// ------------------------------------------------------------------------------------------------ util

const sources = []
let degraded = false

function record(url, note) {
  sources.push({ url, note })
}

// Marks an input as unobtainable. The run continues so the operator sees the whole picture at once, but the
// process exits non-zero and every cell that depended on it renders as UNAVAILABLE.
function unavailable(what, reason) {
  degraded = true
  process.exitCode = 1
  console.error(`UNAVAILABLE: ${what} — ${reason}`)
  return undefined
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// `soft` fetches contribute no figure to the report (only the coverage scan), so their failure must not
// mark the run degraded — and must not clear a real failure recorded elsewhere.
async function fetchJson(url, what, soft = false) {
  let lastError = ''
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    let rateLimited = false
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(30000) })
      if (res.ok) {
        return await res.json()
      }
      lastError = `HTTP ${res.status}`
      rateLimited = res.status === 429
      // 429/5xx are worth waiting out; a 4xx that is not a rate limit will not fix itself.
      if (!rateLimited && res.status < 500) {
        break
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    if (attempt < RETRIES) {
      // CoinGecko's free tier resets on roughly a minute, so a few seconds of backoff just burns the retries.
      await sleep((rateLimited ? RATE_LIMIT_BACKOFF : 1500) * attempt)
    }
  }
  if (soft) {
    console.error(`(soft) could not fetch ${what} — ${url} → ${lastError}`)
    return undefined
  }
  unavailable(what, `${url} → ${lastError}`)
  return undefined
}

// Exact decimal string from a BigInt of base units — never via Number, because 9,023,524,435,767,465
// nano-HPO is above Number.MAX_SAFE_INTEGER and would round.
function units(raw, decimals) {
  const negative = raw < 0n
  const digits = (negative ? -raw : raw).toString().padStart(decimals + 1, '0')
  const whole = digits.slice(0, digits.length - decimals)
  const fraction = decimals === 0 ? '' : '.' + digits.slice(digits.length - decimals)
  return (negative ? '-' : '') + whole + fraction
}

const asNumber = (raw, decimals) => Number(units(raw, decimals))

function group(value, dp) {
  if (value === undefined || !Number.isFinite(value)) {
    return 'UNAVAILABLE'
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

const usd = (value) => (value === undefined ? 'UNAVAILABLE' : '$' + group(value, 2))
const pct = (value) => (value === undefined ? 'UNAVAILABLE' : group(value, 2) + '%')
const iso = (unix) => new Date(unix * 1000).toISOString().replace('.000', '')

// Trims trailing zeros so 6,000.902364275 prints in full but 9,000,000 does not print as 9,000,000.000000000.
// The sign is carried separately: (-0).toLocaleString() is "0", which would silently flip a small negative
// delta such as -0.5 GRAM into +0.5.
function amount(value) {
  if (value === undefined) {
    return 'UNAVAILABLE'
  }
  const negative = value.startsWith('-')
  const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.')
  const trimmed = fraction.replace(/0+$/, '')
  const head = Number(whole).toLocaleString('en-US')
  return (negative ? '-' : '') + (trimmed ? `${head}.${trimmed}` : head)
}

// ------------------------------------------------------------------------------------------------ ton v4

// TonClient4 appends the argument tuple as a url-safe base64 path segment; matched here exactly.
function encodeArgs(args) {
  if (args.length === 0) {
    return ''
  }
  const boc = serializeTuple(args).toBoc({ idx: false, crc32: false }).toString('base64')
  return '/' + boc.replaceAll('/', '_').replaceAll('+', '-').replaceAll('=', '')
}

const urlAddress = (address) => Address.parse(address).toString({ urlSafe: true })

async function runMethod(seqno, address, method, args = [], what = method) {
  const url = `${V4}/block/${seqno}/${urlAddress(address)}/run/${method}${encodeArgs(args)}`
  const body = await fetchJson(url, what)
  if (body === undefined) {
    return undefined
  }
  record(url, `${method} on ${address} → exitCode ${body.exitCode}`)
  // A get-method that does not exist at this block (an uninitialised jetton wallet, say) is not an outage;
  // the caller decides whether that means "zero" or "missing".
  return body.exitCode === 0 ? body.result : null
}

async function resolveBlock(at, seqno) {
  if (seqno !== undefined) {
    // v4 has no "utime of block N" route, and the price lookup needs the block's wall-clock time; toncenter's
    // masterchain block record carries gen_utime and agrees with /block/latest's `now` to the second.
    const url = `https://toncenter.com/api/v3/blocks?workchain=-1&seqno=${seqno}&limit=1`
    const body = await fetchJson(url, `time of masterchain block ${seqno}`)
    if (body === undefined) {
      return undefined
    }
    const block = body.blocks?.[0]
    if (block === undefined) {
      return unavailable(`time of masterchain block ${seqno}`, `${url} → no such masterchain block`)
    }
    const utc = Number(block.gen_utime)
    record(url, `time of masterchain block ${seqno} → ${iso(utc)}`)
    return { seqno: Number(seqno), utc, requested: `seqno ${seqno}` }
  }
  if (at === undefined) {
    const url = `${V4}/block/latest`
    const body = await fetchJson(url, 'latest masterchain block')
    if (body === undefined) {
      return undefined
    }
    record(url, `latest masterchain block → seqno ${body.last.seqno}`)
    return { seqno: body.last.seqno, utc: body.now ?? Math.floor(Date.now() / 1000), requested: 'latest' }
  }
  const requested = Math.floor(Date.parse(`${at}T12:00:00Z`) / 1000)
  if (!Number.isFinite(requested)) {
    console.error(`Bad --at date "${at}", expected YYYY-MM-DD`)
    process.exit(2)
  }
  if (requested * 1000 > Date.now()) {
    console.error(`--at ${at} is in the future; there is no block to read.`)
    process.exit(2)
  }
  const url = `${V4}/block/utime/${requested}`
  const body = await fetchJson(url, `masterchain block covering ${iso(requested)}`)
  if (body === undefined) {
    return undefined
  }
  const master = body.exist ? body.block.shards.find((shard) => shard.workchain === -1) : undefined
  if (master === undefined) {
    return unavailable(`masterchain block covering ${iso(requested)}`, `${url} → no masterchain shard`)
  }
  record(url, `masterchain block covering ${iso(requested)} → seqno ${master.seqno}`)
  return { seqno: master.seqno, utc: requested, requested: iso(requested) }
}

async function nativeBalance(seqno, address) {
  const url = `${V4}/block/${seqno}/${urlAddress(address)}`
  const body = await fetchJson(url, `GRAM balance of ${address}`)
  if (body === undefined) {
    return undefined
  }
  record(url, `GRAM balance of ${address} → ${units(BigInt(body.account.balance.coins), GRAM_DECIMALS)}`)
  return BigInt(body.account.balance.coins)
}

// Derived on-chain rather than hard-coded, so the script stays correct if the fund moves to a third wallet.
async function jettonBalance(seqno, master, owner) {
  const args = [{ type: 'slice', cell: beginCell().storeAddress(Address.parse(owner)).endCell() }]
  const derived = await runMethod(seqno, master, 'get_wallet_address', args, `jetton wallet of ${owner}`)
  if (derived === undefined) {
    return undefined
  }
  if (derived === null) {
    return unavailable(`jetton wallet of ${owner}`, 'get_wallet_address returned a non-zero exit code')
  }
  const wallet = Cell.fromBase64(derived[0].cell).beginParse().loadAddress().toString({ urlSafe: true })
  const data = await runMethod(seqno, wallet, 'get_wallet_data', [], `jetton balance of ${wallet}`)
  if (data === undefined) {
    return undefined
  }
  // Uninitialised at this block = the wallet never held this jetton yet. That is a real zero, not an outage.
  return { wallet, raw: data === null ? 0n : BigInt(data[0].value) }
}

async function exchangeRate(seqno) {
  const state = await runMethod(seqno, TREASURY, 'get_treasury_state', [], 'hGRAM exchange rate')
  if (state === undefined) {
    return undefined
  }
  if (state === null) {
    return unavailable('hGRAM exchange rate', 'get_treasury_state returned a non-zero exit code')
  }
  const totalCoins = BigInt(state[0].value)
  const totalTokens = BigInt(state[1].value)
  if (totalTokens === 0n) {
    return unavailable('hGRAM exchange rate', 'totalTokens is zero')
  }
  return { totalCoins, totalTokens, rate: asNumber(totalCoins, 9) / asNumber(totalTokens, 9) }
}

// ------------------------------------------------------------------------------------------------ prices

// The hourly point nearest the block, from a +/-3h window. USDT is not fetched: it is fixed at exactly
// 1.0000 by the stated methodology, and saying so is more honest than quoting a $0.9998 index tick.
async function price(id, atUnix, what) {
  const from = atUnix - 10800
  const to = atUnix + 10800
  const url = `${COINGECKO}/coins/${id}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`
  const body = await fetchJson(url, what)
  if (body === undefined) {
    return undefined
  }
  const points = body.prices ?? []
  if (points.length === 0) {
    return unavailable(what, `${url} → no price points in the window`)
  }
  let best = points[0]
  for (const point of points) {
    if (Math.abs(point[0] / 1000 - atUnix) < Math.abs(best[0] / 1000 - atUnix)) {
      best = point
    }
  }
  record(url, `${what} → $${best[1]} at ${iso(Math.round(best[0] / 1000))}`)
  return { value: best[1], at: Math.round(best[0] / 1000) }
}

// ------------------------------------------------------------------------------------------------ coverage

// Advisory, but fatal if BOTH sources fail: the allowlist only covers what the fund holds today, so a new
// LP, lending or vesting position must surface as an unexplained line rather than as silence.
async function coverage(seqno) {
  const known = new Set(ASSETS.map((asset) => Address.parse(asset.master).toRawString()))
  const seen = []
  for (const wallet of WALLETS) {
    let listed
    const tonapi = `https://tonapi.io/v2/accounts/${wallet.address}/jettons`
    const body = await fetchJson(tonapi, `jetton list of ${wallet.address}`, true)
    if (body !== undefined) {
      record(tonapi, `jetton list of ${wallet.address} → ${body.balances.length} jettons`)
      listed = body.balances.map((entry) => ({
        master: Address.parse(entry.jetton.address).toRawString(),
        symbol: entry.jetton.symbol,
        raw: entry.balance,
      }))
    } else {
      // tonapi's free tier rate-limits hard, so a second independent index decides whether this is an
      // outage or a real finding. Only both failing is fatal.
      const tc = `https://toncenter.com/api/v3/jetton/wallets?owner_address=${wallet.address}&limit=100`
      const alt = await fetchJson(tc, `jetton list of ${wallet.address} (fallback)`)
      if (alt === undefined) {
        return undefined
      }
      record(tc, `jetton list of ${wallet.address} → ${alt.jetton_wallets.length} jettons (tonapi fallback)`)
      listed = alt.jetton_wallets.map((entry) => ({
        master: Address.parse(entry.jetton).toRawString(),
        symbol: entry.jetton,
        raw: entry.balance,
      }))
    }
    for (const entry of listed) {
      if (!known.has(entry.master) && BigInt(entry.raw) > 0n) {
        seen.push({ wallet: wallet.name, symbol: entry.symbol, master: entry.master })
      }
    }
  }
  // tonapi returns jettons in no stable order; sort so two runs of the same block diff clean.
  return seen.sort((a, b) => a.wallet.localeCompare(b.wallet) || a.master.localeCompare(b.master))
}

// ------------------------------------------------------------------------------------------------ snapshot

async function snapshot(at, seqno) {
  const block = await resolveBlock(at, seqno)
  if (block === undefined) {
    return undefined
  }
  const rate = await exchangeRate(block.seqno)
  const gram = await price(CG_IDS.gram, block.utc, 'GRAM/USD')
  const hpo = await price(CG_IDS.hpo, block.utc, 'HPO/USD')

  const holdings = new Map()
  const perWallet = []
  for (const wallet of WALLETS) {
    const native = await nativeBalance(block.seqno, wallet.address)
    const row = { wallet: wallet.name, address: wallet.address, GRAM: native }
    holdings.set('GRAM', (holdings.get('GRAM') ?? 0n) + (native ?? 0n))
    for (const asset of ASSETS) {
      const held = await jettonBalance(block.seqno, asset.master, wallet.address)
      row[asset.symbol] = held?.raw
      holdings.set(asset.symbol, (holdings.get(asset.symbol) ?? 0n) + (held?.raw ?? 0n))
    }
    perWallet.push(row)
  }

  const priceOf = {
    USDT: 1.0,
    HPO: hpo?.value,
    hGRAM: rate && gram ? rate.rate * gram.value : undefined,
    GRAM: gram?.value,
  }
  const decimalsOf = { USDT: 6, HPO: 9, hGRAM: 9, GRAM: GRAM_DECIMALS }

  const rows = ['USDT', 'HPO', 'hGRAM', 'GRAM'].map((symbol) => {
    const raw = holdings.get(symbol)
    const amountNumber = raw === undefined ? undefined : asNumber(raw, decimalsOf[symbol])
    const unitPrice = priceOf[symbol]
    // Rounded to cents HERE, before the total is taken, so the published USD column adds up to the published
    // total exactly. Summing full precision and then rounding leaves the table off by a cent, and a table that
    // does not add up is the first thing a reader checks.
    const exact = amountNumber === undefined || unitPrice === undefined ? undefined : amountNumber * unitPrice
    return {
      symbol,
      raw,
      decimals: decimalsOf[symbol],
      amount: raw === undefined ? undefined : units(raw, decimalsOf[symbol]),
      price: unitPrice,
      usd: exact === undefined ? undefined : Math.round(exact * 100) / 100,
    }
  })

  const total = rows.every((row) => row.usd !== undefined) ? rows.reduce((sum, row) => sum + row.usd, 0) : undefined
  for (const row of rows) {
    row.pct = total === undefined || row.usd === undefined || total === 0 ? undefined : (row.usd / total) * 100
  }

  return {
    block,
    rate,
    prices: { gram, hpo, usdt: { value: 1.0, at: block.utc } },
    perWallet,
    rows,
    total,
    totalGram: total === undefined || gram === undefined ? undefined : total / gram.value,
    coverage: await coverage(block.seqno),
  }
}

// ------------------------------------------------------------------------------------------------ render

function table(header, lines) {
  const widths = header.map((cell, index) => Math.max(cell.length, ...lines.map((line) => line[index].length)))
  const render = (cells) => '| ' + cells.map((cell, index) => cell.padEnd(widths[index])).join(' | ') + ' |'
  const rule = '| ' + widths.map((width) => '-'.repeat(width)).join(' | ') + ' |'
  return [render(header), rule, ...lines.map(render)].join('\n')
}

function renderSnapshot(snap, label) {
  const out = []
  out.push(`### Portfolio Allocation (${label})`)
  out.push('')
  out.push(
    table(
      ['Asset', 'Amount', 'Allocation', 'Value (USD)'],
      snap.rows.map((row) => [row.symbol, amount(row.amount), pct(row.pct), usd(row.usd)]),
    ),
  )
  out.push('')
  out.push(`Total: ${usd(snap.total)}`)
  out.push(`Total in GRAM: ${group(snap.totalGram, 2)} GRAM`)
  out.push('')
  out.push('Per wallet (base units):')
  for (const row of snap.perWallet) {
    const cells = ['GRAM', ...ASSETS.map((asset) => asset.symbol)]
      .map((symbol) => `${symbol} ${row[symbol] === undefined ? 'UNAVAILABLE' : row[symbol].toString()}`)
      .join('  ')
    out.push(`  ${row.wallet}: ${cells}`)
  }
  return out.join('\n')
}

function renderPublishedComparison(snap, label) {
  const bySymbol = new Map(snap.rows.map((row) => [row.symbol, row]))
  const lines = DECEMBER_2025.rows.map((prev) => {
    const now = bySymbol.get(prev.symbol)
    return [
      prev.symbol,
      group(prev.amount, 2),
      usd(prev.usd),
      pct(prev.pct),
      amount(now?.amount),
      usd(now?.usd),
      pct(now?.pct),
    ]
  })
  const gram = bySymbol.get('GRAM')
  lines.push(['GRAM', '—', '—', '—', amount(gram?.amount), usd(gram?.usd), pct(gram?.pct)])
  const delta = snap.total === undefined ? undefined : snap.total - DECEMBER_2025.total
  const deltaPct = snap.total === undefined ? undefined : (snap.total / DECEMBER_2025.total - 1) * 100
  return [
    `### Comparison vs the ${DECEMBER_2025.date} report (as published)`,
    '',
    table(['Asset', 'Dec amount', 'Dec USD', 'Dec %', `${label} amount`, `${label} USD`, `${label} %`], lines),
    '',
    `Total: ${usd(DECEMBER_2025.total)} → ${usd(snap.total)} = ${delta === undefined ? 'UNAVAILABLE' : (delta < 0 ? '-' : '+') + usd(Math.abs(delta))} (${deltaPct === undefined ? 'UNAVAILABLE' : (deltaPct < 0 ? '' : '+') + group(deltaPct, 2) + '%'})`,
  ].join('\n')
}

function renderOnChainComparison(snap, other, label, otherLabel) {
  const otherBy = new Map(other.rows.map((row) => [row.symbol, row]))
  return [
    `### On-chain comparison: ${otherLabel} → ${label}`,
    '',
    table(
      ['Asset', `${otherLabel} amount`, `${label} amount`, 'Change'],
      snap.rows.map((row) => {
        const prev = otherBy.get(row.symbol)
        const change =
          row.raw === undefined || prev?.raw === undefined
            ? 'UNAVAILABLE'
            : amount(units(row.raw - prev.raw, row.decimals))
        return [row.symbol, amount(prev?.amount), amount(row.amount), change]
      }),
    ),
  ].join('\n')
}

function renderSources(snap) {
  const out = ['### Sources', '']
  out.push(
    `- Masterchain block: seqno ${snap.block.seqno}, ${iso(snap.block.utc)} (requested: ${snap.block.requested})`,
  )
  out.push(
    `- hGRAM exchange rate: ${snap.rate === undefined ? 'UNAVAILABLE' : snap.rate.rate.toFixed(6)} GRAM/hGRAM` +
      (snap.rate === undefined
        ? ''
        : ` (totalCoins ${units(snap.rate.totalCoins, 9)} / totalTokens ${units(snap.rate.totalTokens, 9)})`),
  )
  out.push(
    `- GRAM/USD: ${snap.prices.gram === undefined ? 'UNAVAILABLE' : '$' + snap.prices.gram.value + ' at ' + iso(snap.prices.gram.at)}`,
  )
  out.push(
    `- HPO/USD: ${snap.prices.hpo === undefined ? 'UNAVAILABLE' : '$' + snap.prices.hpo.value + ' at ' + iso(snap.prices.hpo.at)}`,
  )
  out.push('- USDT/USD: 1.0000 exactly (methodology, not fetched)')
  out.push('')
  out.push('URLs called:')
  for (const source of sources) {
    out.push(`  ${source.url}`)
    out.push(`    ${source.note}`)
  }
  out.push('')
  if (snap.coverage === undefined) {
    out.push('Coverage scan: UNAVAILABLE — both tonapi and toncenter failed; verify holdings at tonviewer.com')
  } else if (snap.coverage.length === 0) {
    out.push('Coverage scan: no jettons outside the allowlist hold a non-zero balance.')
  } else {
    out.push('Coverage scan — held but NOT valued (outside the four-asset allowlist):')
    for (const entry of snap.coverage) {
      out.push(`  ${entry.wallet}: ${entry.symbol} (${entry.master})`)
    }
  }
  return out.join('\n')
}

// ------------------------------------------------------------------------------------------------ main

const argv = process.argv.slice(2)
const flag = (name) => {
  const index = argv.indexOf(name)
  return index === -1 ? undefined : argv[index + 1]
}
const at = flag('--at')
const seqno = flag('--seqno')
const compare = flag('--compare')
const asJson = argv.includes('--json')

const snap = await snapshot(at, seqno)
if (snap === undefined) {
  console.error('\nSnapshot incomplete — see UNAVAILABLE lines above. Nothing is published from a partial run.')
  process.exit(1)
}
const label = at ?? iso(snap.block.utc).slice(0, 10)

let other
if (compare !== undefined) {
  other = await snapshot(compare)
}

if (asJson) {
  console.log(
    JSON.stringify(
      {
        label,
        block: snap.block,
        rate: snap.rate && {
          ...snap.rate,
          totalCoins: snap.rate.totalCoins.toString(),
          totalTokens: snap.rate.totalTokens.toString(),
        },
        prices: snap.prices,
        rows: snap.rows.map((row) => ({ ...row, raw: row.raw?.toString() })),
        total: snap.total,
        totalGram: snap.totalGram,
        coverage: snap.coverage,
        sources,
      },
      null,
      2,
    ),
  )
} else {
  console.log(`## Hipo Fund snapshot — ${label}\n`)
  console.log(renderSnapshot(snap, `as of ${iso(snap.block.utc)}, masterchain block ${snap.block.seqno}`))
  console.log('')
  console.log(renderPublishedComparison(snap, label))
  if (other !== undefined) {
    console.log('')
    console.log(renderOnChainComparison(snap, other, label, compare))
  }
  console.log('')
  console.log(renderSources(snap))
}

if (degraded) {
  console.error('\nRun is DEGRADED: at least one input was UNAVAILABLE. Do not publish these figures.')
  process.exit(1)
}
