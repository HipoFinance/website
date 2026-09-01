#!/usr/bin/env node
// Dependency-free assertions for src/i18n/format.ts and src/i18n/locale.ts.
//
//   node --experimental-strip-types scripts/i18n-selftest.mjs
//
// (Node >= 22.12; on Node >= 23.6 type stripping is on by default and the flag is accepted as a no-op.)
// The i18n modules import each other with explicit `.ts` extensions precisely so Node can load them
// without a bundler; t.ts is not imported here because it uses import.meta.glob (Vite only).

import assert from 'node:assert/strict'
import { LOCALES, DEFAULT_LOCALE, RESERVED_SEGMENTS, builtLocales, releasedLocales } from '../src/i18n/registry.mjs'
import { localizedPath, stripLocale, langOf, dirOf, intlOf, localeOf, localeParams } from '../src/i18n/locale.ts'
import {
  formatNumber,
  formatNano,
  formatPercent,
  formatSignedPercent,
  formatCompact,
  formatUsd,
  formatRate,
  formatDate,
  formatDuration,
  parseNumberInput,
  formatInput,
  formatAsciiNano,
  isolate,
} from '../src/i18n/format.ts'

let count = 0
function check(name, fn) {
  try {
    fn()
    count++
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

const locales = Object.keys(LOCALES)

// --- registry -------------------------------------------------------------------------------------
check('registry', () => {
  assert.equal(DEFAULT_LOCALE, 'en')
  for (const key of locales) assert.ok(!RESERVED_SEGMENTS.includes(key))
  assert.equal(builtLocales()[0], 'en')
  assert.ok(!releasedLocales().includes('en'))
  assert.deepEqual(
    localeParams(),
    releasedLocales().map((locale) => ({ params: { locale } })),
  )
})

// --- locale.ts ------------------------------------------------------------------------------------
check('localeOf', () => {
  assert.equal(localeOf({ params: {} }), 'en')
  assert.equal(localeOf({ params: { locale: 'fa' } }), 'fa')
  assert.throws(() => localeOf({ params: { locale: 'xx' } }))
})

check('stripLocale', () => {
  assert.deepEqual(stripLocale('/fa/stake/'), { locale: 'fa', path: '/stake/' })
  assert.deepEqual(stripLocale('/stake/'), { locale: 'en', path: '/stake/' })
  assert.deepEqual(stripLocale('/'), { locale: 'en', path: '/' })
  assert.deepEqual(stripLocale('/fa/'), { locale: 'fa', path: '/' })
  assert.deepEqual(stripLocale('/fa'), { locale: 'fa', path: '/' })
  assert.deepEqual(stripLocale('/fa?x=1'), { locale: 'fa', path: '/?x=1' })
  assert.deepEqual(stripLocale('/fa/docs/x/#y'), { locale: 'fa', path: '/docs/x/#y' })
  assert.deepEqual(stripLocale('/pt-br/hpo/'), { locale: 'pt-br', path: '/hpo/' })
  assert.deepEqual(stripLocale('/faq/'), { locale: 'en', path: '/faq/' })
  assert.deepEqual(stripLocale('/fake/'), { locale: 'en', path: '/fake/' })
})

check('localizedPath', () => {
  assert.equal(localizedPath('/stake/', 'fa'), '/fa/stake/')
  assert.equal(localizedPath('/stake/', 'en'), '/stake/')
  assert.equal(localizedPath('/', 'fa'), '/fa/')
  assert.equal(localizedPath('/', 'en'), '/')
  assert.equal(localizedPath('/fa/stake/', 'fa'), '/fa/stake/')
  assert.equal(localizedPath('/fa/stake/', 'ru'), '/ru/stake/')
  assert.equal(localizedPath('/fa/stake/', 'en'), '/stake/')
  assert.equal(localizedPath('/fa/', 'en'), '/')
  assert.equal(localizedPath('/fa', 'ru'), '/ru/')
  assert.equal(localizedPath('/stake', 'fa'), '/fa/stake')
  assert.equal(localizedPath('/docs/x/#anchor', 'fa'), '/fa/docs/x/#anchor')
  assert.equal(localizedPath('/stake/?a=1', 'fa'), '/fa/stake/?a=1')
  assert.equal(localizedPath('/hpo/', 'pt-br'), '/pt-br/hpo/')
  assert.equal(localizedPath('#top', 'fa'), '#top')
  assert.equal(localizedPath('mailto:hi@hipo.finance', 'fa'), 'mailto:hi@hipo.finance')
  assert.equal(localizedPath('tel:+1', 'fa'), 'tel:+1')
  assert.equal(localizedPath('https://hipo.finance/stake/', 'fa'), 'https://hipo.finance/stake/')
  assert.equal(localizedPath('http://x/', 'fa'), 'http://x/')
  assert.equal(localizedPath('//cdn/x', 'fa'), '//cdn/x')
  assert.equal(localizedPath('', 'fa'), '')
  assert.equal(localizedPath('./x/', 'fa'), './x/')
  // round trip used by the language switcher
  assert.equal(localizedPath(stripLocale('/fa/docs/x/').path, 'en'), '/docs/x/')
  assert.equal(localizedPath(stripLocale('/docs/x/').path, 'fa'), '/fa/docs/x/')
})

check('langOf/dirOf/intlOf', () => {
  assert.equal(langOf('pt-br'), 'pt-BR')
  // `lang` stays the plain tag for <html lang>/hreflang; only Intl sees the numbering-system override.
  assert.equal(langOf('ar'), 'ar')
  assert.equal(intlOf('ar'), 'ar-u-nu-arab')
  assert.equal(intlOf('fa'), 'fa')
  assert.equal(intlOf('en'), 'en')
  assert.equal(dirOf('fa'), 'rtl')
  assert.equal(dirOf('ar'), 'rtl')
  assert.equal(dirOf('en'), 'ltr')
})

// --- format.ts ------------------------------------------------------------------------------------
check('formatNumber en unchanged', () => {
  assert.equal(formatNumber('en', 1234567.891), '1,234,567.891')
  assert.equal(formatNumber('en', 1234.5, { maximumFractionDigits: 2 }), (1234.5).toLocaleString('en-US'))
  assert.equal(formatNano('en', 1234500000000n), '1,234.5')
  assert.equal(formatNano('en', 1234567n), '0')
  assert.equal(formatNano('en', 1050000000n, 4), '1.05')
  assert.equal(formatPercent('en', 0.032), '3.2%')
  assert.equal(formatSignedPercent('en', 0.032), '+3.2%')
  assert.equal(formatSignedPercent('en', -0.032), '-3.2%')
  assert.equal(formatSignedPercent('en', 0), '0%')
  assert.equal(formatCompact('en', 1234567), '1.2M')
  assert.equal(formatUsd('en', 1234.5), '$1,234.50')
  assert.equal(formatUsd('en', 0.002345, { maximumSignificantDigits: 4 }), '$0.002345')
  assert.equal(formatRate('en', 1.05), '1.0500')
})

check('formatNumber native conventions', () => {
  assert.equal(formatNumber('fa', 1234.5), '۱٬۲۳۴٫۵')
  assert.equal(formatNumber('ru', 1234.5), '1 234,5')
  assert.equal(formatNumber('de', 1234.5), '1.234,5')
  assert.equal(formatNumber('hi', 1234567), '12,34,567')
  assert.equal(formatNumber('ar', 1234.5), '١٬٢٣٤٫٥')
  assert.equal(formatPercent('fa', 0.032), '۳٫۲٪')
  assert.ok(formatCompact('fa', 1234567).startsWith('۱٫۲'))
  assert.ok(formatUsd('de', 1234.5).includes('1.234,50'))
})

check('formatDate', () => {
  const d = new Date(Date.UTC(2026, 7, 22, 12))
  assert.equal(formatDate('en', d, { month: 'long', day: '2-digit', timeZone: 'UTC' }), 'August 22')
  const fa = formatDate('fa', d, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  assert.ok(/۱۴۰۵/.test(fa), 'fa uses the Jalali calendar by default: ' + fa)
  assert.ok(/۳۱/.test(fa) && /مرداد/.test(fa), fa)
})

check('formatDuration', () => {
  const en = {
    locale: 'en',
    t: (key, params) => (key === 'app.format.duration.hm' ? `${params.h}h ${params.m}m` : `${params.m}m`),
    tHtml: () => '',
    has: () => true,
  }
  assert.equal(formatDuration(en, 3 * 3600 + 20 * 60 + 5), '3h 20m')
  assert.equal(formatDuration(en, 20 * 60), '20m')
  assert.equal(formatDuration(en, 3 * 3600), '3h 0m')
  assert.equal(formatDuration(en, 0), '0m')
  assert.equal(formatDuration(en, -10), '0m')
  const fa = {
    ...en,
    locale: 'fa',
    t: (key, params) => (key === 'app.format.duration.hm' ? `${params.h} س ${params.m} د` : `${params.m} د`),
  }
  assert.equal(formatDuration(fa, 3 * 3600 + 20 * 60), '۳ س ۲۰ د')
})

check('isolate', () => {
  assert.equal(isolate('x'), '⁨x⁩')
})

check('parseNumberInput', () => {
  const p = parseNumberInput
  // ASCII in any locale. "1234.5" / "1234,5" used to be undefined on the locales whose group symbol
  // was the character used ("." for de/tr/it/id/pt-br, "," for en/hi): a 4-digit head can never be a
  // valid thousands group, so it now has no other reading and falls back to the decimal — the same
  // fallback that makes "22,22" work on the English page (see below).
  for (const l of locales) {
    assert.equal(p(l, '1234.5'), '1234.5', l)
    assert.equal(p(l, '1234,5'), '1234.5', l)
    assert.equal(p(l, '1234'), '1234', l)
    assert.equal(p(l, ' 12 '), '12', l)
    assert.equal(p(l, '0.5'), '0.5', l)
    assert.equal(p(l, '0,5'), '0.5', l)
    assert.equal(p(l, ''), undefined, l)
    assert.equal(p(l, '   '), undefined, l)
    assert.equal(p(l, 'abc'), undefined, l)
    assert.equal(p(l, '12a'), undefined, l)
    assert.equal(p(l, '1.2.3'), undefined, l)
    assert.equal(p(l, '1,2.3,4'), undefined, l)
    assert.equal(p(l, '1.2,3'), undefined, 'multiple decimals ' + l)
    assert.equal(p(l, '-1'), undefined, l)
    assert.equal(p(l, '1e5'), undefined, l)
    assert.equal(p(l, '.'), undefined, l)
    assert.equal(p(l, '‎۱۲۳۴٫۵‏'), '1234.5', l)
    assert.equal(p(l, '۱۲۳۴٫۵'), '1234.5', l)
    assert.equal(p(l, '۱٬۲۳۴٫۵'), '1234.5', l)
    assert.equal(p(l, '١٢٣٤٫٥'), '1234.5', l)
    assert.equal(p(l, '۱۲۳۴،۵'), '1234.5', 'arabic comma ' + l)
    assert.equal(p(l, '१२३४.५'), '1234.5', 'devanagari ' + l)
  }
  // Separators that are neither the locale's decimal nor its group symbol are decimals.
  assert.equal(p('en', '1234.5'), '1234.5')
  assert.equal(p('ru', '1234.5'), '1234.5')
  assert.equal(p('ru', '1234,5'), '1234.5')
  assert.equal(p('fa', '1234.5'), '1234.5')
  assert.equal(p('fa', '1234,5'), '1234.5')
  assert.equal(p('fa', '1.5'), '1.5')
  assert.equal(p('ar', '1.5'), '1.5')
  assert.equal(p('ru', '1.5'), '1.5')
  assert.equal(p('ru', '1,000'), '1.000')
  assert.equal(p('en', '1.000'), '1.000')
  assert.equal(p('en', '.5'), '0.5')
  assert.equal(p('en', '12.'), '12.')
  assert.equal(p('de', ',5'), '0.5')
  assert.equal(p('de', '12,'), '12.')
  assert.equal(p('de', '1,5'), '1.5')
  // locale-specific grouping
  assert.equal(p('en', '1,234.5'), '1234.5')
  assert.equal(p('en', '1,234,567.89'), '1234567.89')
  assert.equal(p('en', '1,000'), '1000')
  // One digit either side of the cliff: "1,000" is exactly a group (1000); "1,0000" has 4 digits after
  // the comma, which no thousands group is, so it falls back to the decimal instead of being rejected.
  assert.equal(p('en', '1,0000'), '1.0000')
  // The same cliff one keystroke earlier: 2 digits after the separator can only be a decimal reading,
  // 3 digits can only be a group — this is what makes normalizeAmount's blur snap jump 1000x in Model.ts.
  assert.equal(p('de', '1.50'), '1.50')
  assert.equal(p('de', '1.500'), '1500')
  assert.equal(p('en', '12,34'), '12.34')
  assert.equal(p('en', '12,345'), '12345')
  assert.equal(p('hi', '12,34,567.5'), '1234567.5')
  assert.equal(p('hi', '12,34,567'), '1234567')
  assert.equal(p('ru', '1 234,5'), '1234.5')
  assert.equal(p('ru', '1 234,5'), '1234.5')
  assert.equal(p('ru', '1 234,5'), '1234.5')
  assert.equal(p('ru', '1 234 567,89'), '1234567.89')
  assert.equal(p('ru', '1,234.5'), '1234.5')
  assert.equal(p('de', '1.234,5'), '1234.5')
  assert.equal(p('de', '1.000'), '1000')
  assert.equal(p('de', '1.234.567,89'), '1234567.89')
  assert.equal(p('fa', '۱٬۲۳۴٬۵۶۷٫۸۹'), '1234567.89')
  assert.equal(p('fa', '۱٬۰۰۰'), '1000')
  assert.equal(p('ar', '١٬٢٣٤٫٥'), '1234.5')
  // Whitespace between digits groups in every locale (what ru formats with; also "1 000" pasted in en).
  assert.equal(p('en', '1 000'), '1000')
  assert.equal(p('en', '1 000.5'), '1000.5')
  assert.equal(p('en', '1 000,5'), '1000.5')
  assert.equal(p('fa', '۱ ۰۰۰'), '1000')
  // U+066C ARABIC THOUSANDS SEPARATOR is a group in every locale (it is never a decimal anywhere).
  assert.equal(p('en', '١٬٥٠٠'), '1500')
  assert.equal(p('en', '۱٬۵۰۰'), '1500')
  assert.equal(p('ru', '١٬٥٠٠'), '1500')
  assert.equal(p('ru', '۱٬۵۰۰'), '1500')
  assert.equal(p('de', '١٬٥٠٠'), '1500')
  assert.equal(p('de', '۱٬۵۰۰'), '1500')
  assert.equal(p('en', '۱٬۵۰۰٫۵'), '1500.5')
  assert.equal(p('en', '۱٬۵'), undefined)
  // A foreign single separator placed exactly like a thousands group is ambiguous → invalid, not 1.5.
  // Unaffected by this change: these separators are foreign to fa/ru, not their own group symbol, so
  // they never reach the fallback rule below.
  assert.equal(p('fa', '1,500'), undefined)
  assert.equal(p('ar', '1,500'), undefined)
  assert.equal(p('fa', '1,234'), undefined)
  assert.equal(p('ru', '1.500'), undefined)
  assert.equal(p('fa', '1,50'), '1.50')
  assert.equal(p('fa', '1,5000'), '1.5000')
  assert.equal(p('fa', '0,500'), '0.500')
  // …but the locale's own decimal symbol never is.
  assert.equal(p('en', '1.000'), '1.000')
  assert.equal(p('ru', '1,000'), '1.000')
  assert.equal(p('de', '1.500'), '1500')
  assert.equal(p('de', '1,500'), '1.500')
  // The locale's OWN group symbol groups only where the string CAN actually be a thousands group.
  // Short of that — an unfinished group, a leading-zero head, or one digit too many after it — there is
  // no other possible reading, so the symbol falls back to being the decimal instead of being rejected.
  // This is the fix: a mobile keypad follows the device's region, not the page's, so a comma-decimal
  // phone on the English site has no "." key at all and, before this, could not type a decimal amount —
  // reported from the stake form as "22,22" refusing to parse (2026-08-29).
  assert.equal(p('en', '1,'), '1.')
  assert.equal(p('en', '1,0'), '1.0')
  assert.equal(p('en', '1,00'), '1.00')
  assert.equal(p('en', '1,5'), '1.5')
  assert.equal(p('en', '1234,5'), '1234.5')
  assert.equal(p('en', '22,22'), '22.22', 'the reported bug')
  assert.equal(p('en', ',234'), '0.234')
  assert.equal(p('en', '0,000'), '0.000')
  assert.equal(p('de', '1.5'), '1.5')
  assert.equal(p('de', '12.'), '12.')
  assert.equal(p('de', '.5'), '0.5')
  assert.equal(p('hi', '1,00'), '1.00')
  assert.equal(p('hi', '12,34'), '12.34')
  // Group-only marks (whitespace, U+066C) are different: they are NEVER a decimal in any locale, so a
  // lone one still leaves an unfinished group invalid rather than falling back like the ASCII separators
  // above — unaffected by this change.
  assert.equal(p('fa', '۱٬'), undefined)
  assert.equal(p('fa', '۱٬۰'), undefined)
  assert.equal(p('fa', '۱٬۰۰'), undefined)
  assert.equal(p('ru', '1 0'), undefined)
  assert.equal(p('ru', '1 00'), undefined)
  // A leading-zero head is never a thousands group, whatever the locale's group symbol is — so it too
  // has no group reading and falls back to the decimal.
  assert.equal(p('de', '0,123'), '0.123')
  assert.equal(p('de', '0.123'), '0.123')
  assert.equal(p('en', '0.123'), '0.123')
  assert.equal(p('en', '0,123'), '0.123')
  assert.equal(p('hi', '0,123'), '0.123')
  assert.equal(p('de', '12.345'), '12345')
  assert.equal(p('en', '0.001'), '0.001')
  // Implausible groupings are rejected, not silently renumbered.
  assert.equal(p('en', '1,000,00'), undefined)
  assert.equal(p('en', '0,123,456'), undefined)
  assert.equal(p('en', '1,000.5,0'), undefined)
  assert.equal(p('ru', '1 000 0'), undefined)
  assert.equal(p('ru', '1 000,000 000'), undefined)
  assert.equal(p('ru', '1 000.5,0'), undefined)
  assert.equal(p('en', '1,234,567'), '1234567')
  // A leading-zero integer part is rejected ("0123" is not 123); "0", "0." and "0.5" are fine.
  assert.equal(p('en', '0123'), undefined)
  assert.equal(p('en', '00'), undefined)
  assert.equal(p('ru', '0 123'), undefined)
  assert.equal(p('en', '0'), '0')
  assert.equal(p('en', '0.'), '0.')
  assert.equal(p('fa', '۰٫۵'), '0.5')
  // toNano precision: at most 9 fraction digits.
  assert.equal(p('en', '0.000000001'), '0.000000001')
  assert.equal(p('en', '1.234567891'), '1.234567891')
  assert.equal(p('en', '1.2345678901'), undefined)
  assert.equal(p('fa', '۱٫۲۳۴۵۶۷۸۹۰۱'), undefined)
  // The reported bug, spelled out: every prefix of "0,3" now reads on the English page, whatever
  // keypad typed it — there is no longer a device-specific code path, so this holds for every visitor.
  assert.equal(p('en', '0,3'), '0.3')
  assert.equal(p('en', '0,'), '0.')
  assert.equal(p('en', '0,000000001'), '0.000000001')
  assert.equal(p('de', '0.3'), '0.3')
  // What must NOT change, confirmed still exact: a string that reads exactly as one thousands group is
  // still a group ("1,000" en, "1.000" de, "1,234,567" en, Hindi "12,34,567" — all asserted above), and
  // real garbage stays garbage.
  assert.equal(p('en', '1,2,3'), undefined)
  assert.equal(p('en', '1,2345678901'), undefined)
  assert.equal(p('en', 'a,3'), undefined)
})

// Keystroke sequences through the amount input. Model.setAmount keeps the typed text verbatim and
// derives `amount` = parseNumberInput(locale, text) ?? '' with `amountInvalid` = (parse failed), and
// amountInNano is undefined (not sendable) whenever amountInvalid — so these prefix tables are exactly
// what the model sees after each keystroke. (Model.ts itself imports Astro/TON modules and cannot be
// loaded here.) Every prefix must be either invalid or the number the digits so far read as in the
// locale — never a thousand-fold smaller reading of a half-typed group — and the full string must
// reach the same nano in every locale.
check('amount input keystrokes', () => {
  const toNano = (ascii) => {
    const [int, frac = ''] = ascii.split('.')
    return BigInt(int + (frac + '000000000').slice(0, 9))
  }
  const sequence = (locale, typed, expected) => {
    const chars = [...typed]
    assert.equal(chars.length, expected.length, `${locale} ${typed}: table length`)
    for (let i = 1; i <= chars.length; i++) {
      const prefix = chars.slice(0, i).join('')
      assert.equal(parseNumberInput(locale, prefix), expected[i - 1], `${locale} typed "${prefix}"`)
    }
    return parseNumberInput(locale, typed)
  }
  const u = undefined
  const finals = [
    // Every prefix before the 4th digit after the separator now reads as the decimal it can only be
    // ("1." "1.0" "1.00"), then flips to the group once a 3-digit run completes it — the same cliff
    // Model.normalizeAmount documents.
    sequence('en', '1,000.5', ['1', '1.', '1.0', '1.00', '1000', '1000.', '1000.5']),
    sequence('de', '1.000,5', ['1', '1.', '1.0', '1.00', '1000', '1000.', '1000.5']),
    // fa's group mark is U+066C, unconditional in every locale — unaffected by this change.
    sequence('fa', '۱٬۰۰۰٫۵', ['1', u, u, u, '1000', '1000.', '1000.5']),
    // (a trailing space is trimmed, so "1 " still reads as 1 — the right number for what is typed)
    // ru groups with whitespace, also unconditional — unaffected by this change.
    sequence('ru', '1 000,5', ['1', '1', u, u, '1000', '1000.', '1000.5']),
    sequence('ru', '1 000,5', ['1', '1', u, u, '1000', '1000.', '1000.5']),
    sequence('hi', '1,000.5', ['1', '1.', '1.0', '1.00', '1000', '1000.', '1000.5']),
  ]
  for (const final of finals) assert.equal(toNano(final), 1000_500_000_000n)
  // Hindi lakh grouping: 12,34,567 → 1234567. Each unfinished group reads as the decimal it can only
  // be until the group completes — invalid only once a second, incomplete group makes it ambiguous.
  assert.equal(sequence('hi', '12,34,567', ['1', '12', '12.', '12.3', '12.34', u, u, u, '1234567']), '1234567')
  // fa's group mark, typed alone then digits, never reads as a decimal — unaffected by this change.
  assert.equal(sequence('fa', '۱٬۵', ['1', u, u]), u)
  // The bug this session fixes: en's group symbol, typed alone then one digit, cannot become a group
  // ("1,5" can never grow into "1,500"), so it now falls back to the decimal instead of staying invalid
  // — reported from the stake form as "22,22" refusing to parse on a comma-only keypad (2026-08-29).
  assert.equal(sequence('en', '1,5', ['1', '1.', '1.5']), '1.5')
  // The locale's decimal mark is a decimal from the first keystroke.
  assert.equal(sequence('en', '1.5', ['1', '1.', '1.5']), '1.5')
  assert.equal(sequence('de', '1,5', ['1', '1.', '1.5']), '1.5')
  assert.equal(sequence('fa', '۱٫۵', ['1', '1.', '1.5']), '1.5')
  assert.equal(sequence('fa', '۱،۵', ['1', '1.', '1.5']), '1.5')
  assert.equal(sequence('ru', '1,5', ['1', '1.', '1.5']), '1.5')
  // Empty and pasted strings agree with the typed ones.
  assert.equal(parseNumberInput('en', ''), u)
  assert.equal(parseNumberInput('fa', '۱٬۰۰۰'), '1000')
  assert.equal(parseNumberInput('en', '1,000'), '1000')
  assert.equal(parseNumberInput('hi', '12,34,567'), '1234567')
  // formatInput is what Max / a locale switch write back into the field; it re-parses to the same value.
  assert.equal(parseNumberInput('fa', formatInput('fa', '1000.5')), '1000.5')
  assert.equal(parseNumberInput('de', formatInput('de', '1000.5')), '1000.5')
})

check('formatAsciiNano', () => {
  assert.equal(formatAsciiNano(100_000_000n), '0.1')
  assert.equal(formatAsciiNano(1_234_567_000_000_000n), '1234567')
  assert.equal(formatAsciiNano(1_234_567_890_000n, 9), '1234.56789')
})

check('formatInput', () => {
  assert.equal(formatInput('en', '1234.5'), '1234.5')
  assert.equal(formatInput('fa', '1234.5'), '۱۲۳۴٫۵')
  // Arabic-Indic digits via the registry's `intl: 'ar-u-nu-arab'` (plain `ar` formats with Latin digits in current ICU).
  assert.equal(formatInput('ar', '1234.5'), '١٢٣٤٫٥')
  assert.equal(formatInput('ru', '1234.5'), '1234,5')
  assert.equal(formatInput('de', '1234.5'), '1234,5')
  assert.equal(formatInput('hi', '1234.5'), '1234.5')
  assert.equal(formatInput('fa', '12.'), '۱۲٫')
  assert.equal(formatInput('fa', ''), '')
})

check('formatInput/parseNumberInput round trip', () => {
  const samples = [
    '0',
    '1',
    '12',
    '1234',
    '1234.5',
    '1234567.89',
    '0.5',
    '0.000000001',
    '12.',
    '1000',
    '1000000',
    '100.100',
  ]
  for (const l of locales) {
    for (const s of samples) {
      const shown = formatInput(l, s)
      assert.equal(parseNumberInput(l, shown), s, `${l}: ${s} -> ${shown}`)
      // what Max would write (the locale's grouped display) also parses
      const grouped = formatNumber(l, Number(s), { maximumFractionDigits: 9 })
      const parsed = parseNumberInput(l, grouped)
      assert.ok(parsed !== undefined && Number(parsed) === Number(s), `${l}: grouped ${grouped} -> ${parsed}`)
    }
  }
})

console.log(`i18n selftest: ${count} groups passed`)
