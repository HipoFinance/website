#!/usr/bin/env node
// Checks of the Club's site-level rules (specs/club-website.md §3, §12): the claim gate sentences get
// their {date}, and the build guards of src/data/club-flag.mjs (the flags agree, no mock in CI, no
// Club build without the Telegram bot id).
//
//   node --experimental-strip-types scripts/club-site-selftest.mjs

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  gateMessage,
  parseGrowthBand,
  toLeaderboard,
  toOverview,
  toPayIntentReply,
  toStatus,
} from '../src/components/app/club/api.ts'
import { intentCovers } from '../src/components/app/club/payments.ts'
import { interpolate } from '../src/i18n/make-t.ts'
import { CLUB_LIVE, CLUB_TG_BOT_ID, clubBuildProblems } from '../src/data/club-flag.mjs'

const club = JSON.parse(readFileSync(new URL('../src/i18n/en/club.json', import.meta.url), 'utf8'))

let count = 0
function check(name, fn) {
  try {
    fn()
    count++
  } catch (e) {
    console.error('FAIL', name)
    throw e
  }
}

// ------------------------------------------------------------------------------------ the gate

// The claim gate reasons spec 2b sends (§6a).
const REASONS = ['in_progress', 'frozen', 'switch_pending', 'link_wait', 'revert_hold', 'below_min', 'no_link']

check('every claim gate sentence is shown with its date, never a literal {date}', () => {
  const overview = { claim: { ok: false, opensAt: 1793500000 }, claimsOpenAt: 1793400000 }
  for (const reason of REASONS) {
    const { key, dateAt } = gateMessage(reason, overview)
    assert.ok(club[key] !== undefined, `${key} is in the catalog`)
    // What ClubModel.gateError passes: the formatted dateAt as {date}.
    const text = interpolate(club[key], { date: String(dateAt) })
    assert.ok(!/[{}]/.test(text), `${key}: ${text}`)
  }
  assert.equal(gateMessage('link_wait', overview).key, 'club.gate.linkWait')
  assert.equal(gateMessage('link_wait', overview).dateAt, 1793500000)
  // No opens_at on the gate: claims_open_at.
  assert.equal(gateMessage('revert_hold', { claim: { ok: false }, claimsOpenAt: 1793400000 }).dateAt, 1793400000)
})

// ------------------------------------------------------- the server's "payment in progress" record

check('pay_in_progress is read from cluboverview, clubstatus and a clubpayintent refusal', () => {
  const wire = { target: 'upgrade', level: 6, valid_until: 1793500300, created: 1793500000 }
  const mapped = { target: 'upgrade', level: 6, validUntil: 1793500300, created: 1793500000 }
  assert.deepEqual(toOverview({ ok: true, pay_in_progress: wire }).payInProgress, mapped)
  assert.deepEqual(toStatus({ ok: true, pay_in_progress: wire }).payInProgress, mapped)
  assert.equal(toOverview({ ok: true }).payInProgress, undefined)
  assert.equal(toOverview({ ok: true, pay_in_progress: null }).payInProgress, undefined)
  const refusal = toPayIntentReply({ ok: false, reason: 'payment_in_progress', now: 1, pay_in_progress: wire })
  assert.equal(refusal.ok, false)
  assert.equal(refusal.reason, 'payment_in_progress')
  assert.deepEqual(refusal.open, mapped)
  const written = toPayIntentReply({ ok: true, now: 1, pay_in_progress: { ...wire, expires_at: 1793501560 } })
  assert.equal(written.ok, true)
  assert.equal(written.open?.created, 1793500000)
  // A record whose target is unreadable still blocks both payments.
  const odd = toOverview({ ok: true, pay_in_progress: { target: 'swap' } }).payInProgress
  assert.equal(odd?.target, 'unknown')
  assert.equal(intentCovers(odd, 'claim'), false)
  assert.equal(intentCovers(odd, 5), false)
  assert.equal(intentCovers({ target: 'claim' }, 'claim'), true)
  assert.equal(intentCovers({ target: 'upgrade', level: 5 }, 5), true)
  assert.equal(intentCovers({ target: 'upgrade', level: 5 }, 6), false)
  assert.equal(intentCovers({ target: 'upgrade' }, 6), true)
})

check('every new sentence is in the catalog', () => {
  // refusalKey (ClubModel.ts) of the new payment refusals and of the server's wallet-flow refusal.
  const key = (reason) => 'club.error.' + reason.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  for (const reason of ['payInProgress', 'intentFailed', 'payment_in_progress', 'onItsWay', 'locked']) {
    assert.ok(club[key(reason)] !== undefined, key(reason))
  }
  assert.equal(key('payment_in_progress'), 'club.error.paymentInProgress')
  assert.match(club['club.error.paymentInProgress'], /server has processed it/)
  for (const k of [
    'club.pay.otherOnItsWay',
    'club.pay.upgradeOnItsWay',
    'club.board.growthBand',
    'club.board.growthOver',
  ]) {
    assert.ok(club[k] !== undefined, k)
  }
  assert.equal(interpolate(club['club.board.growthBand'], { low: '−10', high: '−5' }), '−10% to −5%')
})

check('signed amounts: no sign on zero, no -0 in amountFixed (ClubModel.ts)', () => {
  const model = readFileSync(new URL('../src/components/app/club/ClubModel.ts', import.meta.url), 'utf8')
  assert.match(model, /const n = raw === 0 \? 0 : raw/)
  assert.match(model, /text\)\) \{\n\s+return text/)
})

check('growth on the leaderboard: other rows a band string, the own row exact', () => {
  // The server's form (clubleaderboard.go ClubGrowthBand).
  assert.deepEqual(parseGrowthBand({ from: 20, to: 25 }), { low: 20, high: 25 })
  assert.deepEqual(parseGrowthBand({ from: 100 }), { low: 100, high: undefined })
  assert.deepEqual(parseGrowthBand({ from: -100, to: -95 }), { low: -100, high: -95 })
  for (const bad of [{}, { from: 20, to: 15 }, { from: 20, to: 'x' }, { from: 1.5, to: 6.5 }, []]) {
    assert.equal(parseGrowthBand(bad), undefined, JSON.stringify(bad))
  }
  assert.deepEqual(parseGrowthBand('20-25'), { low: 20, high: 25 })
  assert.deepEqual(parseGrowthBand('100+'), { low: 100 })
  assert.deepEqual(parseGrowthBand('-5-0'), { low: -5, high: 0 })
  assert.deepEqual(parseGrowthBand('-10--5'), { low: -10, high: -5 })
  for (const bad of ['', '20', '25-20', 'a-b', '20 - 25', 20, null, undefined, '1e2-1e3']) {
    assert.equal(parseGrowthBand(bad), undefined, String(bad))
  }
  const board = toLeaderboard({
    ok: true,
    rows: [
      { rank: 1, name: 'A', band: 1, growth_band: { from: 20, to: 25 } },
      { rank: 2, name: 'B', band: 1 },
    ],
    me: { rank: 9, name: 'Me', growth: 6.4, holdings: '1.5' },
  })
  assert.deepEqual(board.rows[0].growthBand, { low: 20, high: 25 })
  assert.equal(board.rows[0].growth, undefined)
  assert.equal(board.rows[1].growthBand, undefined)
  assert.equal(board.me.growth, 6.4)
  assert.equal(board.me.growthBand, undefined)
})

// ------------------------------------------------------------------------------ the build guards

const build = (processEnv, viteEnv = processEnv, extra = {}) =>
  clubBuildProblems({ processEnv, viteEnv, command: 'build', ...extra })

check('the bot id: the default is @HipoFinanceBot’s, and a Club build needs an all-digit id', () => {
  assert.equal(CLUB_TG_BOT_ID, '6362986884')
  assert.deepEqual(build({ PUBLIC_CLUB: '1' }), [])
  assert.deepEqual(build({ PUBLIC_CLUB: '1', PUBLIC_CLUB_TG_BOT_ID: '123' }), [])
  assert.equal(build({ PUBLIC_CLUB: '1', PUBLIC_CLUB_TG_BOT_ID: '12a' }).length, 1)
  assert.equal(build({ PUBLIC_CLUB: '1' }, undefined, { botId: '' }).length, 1)
  assert.equal(build({ PUBLIC_CLUB: '1' }, undefined, { botId: 'SET-ME' }).length, 1)
  // The flag off (the live site before L), the dev server and the local mock preview never fail on it;
  // with the flag on (from L) every build holds the Club and needs the id.
  assert.equal(build({}, undefined, { botId: '' }).length, CLUB_LIVE ? 1 : 0)
  assert.deepEqual(
    clubBuildProblems({ processEnv: { PUBLIC_CLUB: '1' }, viteEnv: { PUBLIC_CLUB: '1' }, command: 'dev', botId: '' }),
    [],
  )
  assert.deepEqual(build({ PUBLIC_CLUB: '1', PUBLIC_CLUB_MOCK: '1' }, undefined, { botId: '' }), [])
})

check('the mock is never built in CI', () => {
  assert.equal(build({ PUBLIC_CLUB_MOCK: '1', CI: 'true' }).length, 1)
  assert.equal(build({ PUBLIC_CLUB: '1', PUBLIC_CLUB_MOCK: '1', CI: '1' }).length, 1)
  // Also when the switch is only in an .env file.
  assert.ok(build({ CI: 'true' }, { PUBLIC_CLUB_MOCK: '1' }).some((p) => p.includes('in CI')))
  assert.deepEqual(build({ CI: 'true' }), [])
  assert.deepEqual(build({ PUBLIC_CLUB: '1', CI: 'true' }), [])
})

check('a flag the config and the pages would read differently stops the build', () => {
  // PUBLIC_CLUB only in an .env file: Vite's pages would build the Club, astro.config.mjs would not.
  assert.ok(build({}, { PUBLIC_CLUB: '1' }).some((p) => p.startsWith('PUBLIC_CLUB differs')))
  assert.ok(
    clubBuildProblems({ processEnv: {}, viteEnv: { PUBLIC_CLUB_TG_BOT_ID: '9' }, command: 'dev' }).some((p) =>
      p.startsWith('PUBLIC_CLUB_TG_BOT_ID differs'),
    ),
  )
  assert.deepEqual(build({ PUBLIC_CLUB: '1' }, { PUBLIC_CLUB: '1' }), [])
})

check('a wallet change is decided by the server: no local block, undo warning and new sentences exist', () => {
  const model = readFileSync(new URL('../src/components/app/club/ClubModel.ts', import.meta.url), 'utf8')
  assert.ok(!model.includes('paymentBlocksWalletChange'))
  assert.ok(club['club.error.paymentInProgress'] && !/25 min/.test(JSON.stringify(club)))
  assert.match(club['club.error.walletChanged'], /Club wallet changed/)
  assert.match(club['club.modal.confirm.voidPayment'], /may not count after this change/)
  const modals = readFileSync(new URL('../src/components/app/club/Modals.tsx', import.meta.url), 'utf8')
  assert.equal(modals.split('club.modal.confirm.voidPayment').length - 1, 2)
})

console.log(`club-site-selftest: ${count} checks passed`)
