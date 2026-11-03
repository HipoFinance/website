#!/usr/bin/env node
// Writes public/tonconnect/wallets-v2.json, the wallet list the app hands to TonConnect (walletsListSource in
// Model.ts). config.ton.org hangs on some filtered networks and the SDK has no timeout, so the app reads the
// list from our own origin. Fresh from config.ton.org at each build; on any failure the committed fallback is
// copied instead, with a warning. Never fails the build.
//
//   WALLETS_LIST_URL=<url> node scripts/wallets-list.mjs     override the source (to try the fallback path)
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'

const url = process.env.WALLETS_LIST_URL ?? 'https://config.ton.org/wallets-v2.json'
const fallback = new URL('../src/data/wallets-v2.fallback.json', import.meta.url)
const out = new URL('../public/tonconnect/wallets-v2.json', import.meta.url)

function validate(list) {
  if (!Array.isArray(list) || list.length < 10) throw new Error('not an array of at least 10 wallets')
  for (const w of list) {
    if (typeof w?.app_name !== 'string' || typeof w.name !== 'string' || typeof w.image !== 'string') {
      throw new Error('an entry lacks app_name, name or image')
    }
  }
  if (
    !list.some((w) => Array.isArray(w.bridge) && w.bridge.some((b) => b?.type === 'sse' && typeof b.url === 'string'))
  ) {
    throw new Error('no entry has an sse bridge')
  }
}

mkdirSync(new URL('./', out), { recursive: true })
try {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const list = await res.json()
  validate(list)
  writeFileSync(out, JSON.stringify(list))
  console.log(`wallets-list: ${list.length} wallets from ${url}`)
} catch (error) {
  console.warn(`wallets-list: WARNING could not fetch ${url} (${error.message}); using the committed fallback`)
  copyFileSync(fallback, out)
}
