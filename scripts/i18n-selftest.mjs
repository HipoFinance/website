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
  keypadDecimalOf,
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
  // Locales whose group symbol is "." (so a lone "." is never a decimal there) and ",".
  const dotGroup = ['de', 'tr', 'it', 'id', 'pt-br']
  const commaGroup = ['en', 'hi']
  // ASCII in any locale
  for (const l of locales) {
    assert.equal(p(l, '1234.5'), dotGroup.includes(l) ? undefined : '1234.5', l)
    assert.equal(p(l, '1234,5'), commaGroup.includes(l) ? undefined : '1234.5', l)
    assert.equal(p(l, '1234'), '1234', l)
    assert.equal(p(l, ' 12 '), '12', l)
    assert.equal(p(l, '0.5'), dotGroup.includes(l) ? undefined : '0.5', l)
    assert.equal(p(l, '0,5'), commaGroup.includes(l) ? undefined : '0.5', l)
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
    assert.equal(p(l, '१२३४.५'), dotGroup.includes(l) ? undefined : '1234.5', 'devanagari ' + l)
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
  assert.equal(p('fa', '1,500'), undefined)
  assert.equal(p('ar', '1,500'), undefined)
  assert.equal(p('fa', '1,234'), undefined)
  assert.equal(p('ru', '1.500'), undefined)
  assert.equal(p('fa', '1,50'), '1.50')
  assert.equal(p('fa', '1,5000'), '1.5000')
  assert.equal(p('fa', '0,500'), '0.500')
  assert.equal(p('en', '1,5'), undefined)
  // …but the locale's own decimal symbol never is.
  assert.equal(p('en', '1.000'), '1.000')
  assert.equal(p('ru', '1,000'), '1.000')
  assert.equal(p('de', '1.500'), '1500')
  assert.equal(p('de', '1,500'), '1.500')
  // The locale's group symbol is never a decimal: unfinished groups are invalid, not a smaller number.
  assert.equal(p('en', '1,'), undefined)
  assert.equal(p('en', '1,0'), undefined)
  assert.equal(p('en', '1,00'), undefined)
  assert.equal(p('en', '1,0000'), undefined)
  assert.equal(p('en', '1234,5'), undefined)
  assert.equal(p('de', '1.5'), undefined)
  assert.equal(p('de', '12.'), undefined)
  assert.equal(p('de', '.5'), undefined)
  assert.equal(p('hi', '1,00'), undefined)
  assert.equal(p('fa', '۱٬'), undefined)
  assert.equal(p('fa', '۱٬۰'), undefined)
  assert.equal(p('fa', '۱٬۰۰'), undefined)
  assert.equal(p('ru', '1 0'), undefined)
  assert.equal(p('ru', '1 00'), undefined)
  // A leading-zero head is never a thousands group, whatever the locale's group symbol is.
  assert.equal(p('de', '0,123'), '0.123')
  assert.equal(p('de', '0.123'), undefined)
  assert.equal(p('en', '0.123'), '0.123')
  assert.equal(p('en', '0,123'), undefined)
  assert.equal(p('hi', '0,123'), undefined)
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
})

// A mobile numeric keypad follows the DEVICE's region, not the page's: on the English site a phone set
// to a comma-decimal region shows a "," key and no "." at all, so "0,3" was the only decimal the
// visitor could type and every prefix of it was rejected as a malformed thousands group (reported from
// the stake form, 2026-08-29). Model passes that key as parseNumberInput's third argument.
check('keypadDecimalOf', () => {
  // A device that disagrees with the page, and whose symbol this parser knows.
  assert.equal(keypadDecimalOf('en', 'de-DE'), ',')
  assert.equal(keypadDecimalOf('en', 'tr-TR'), ',')
  assert.equal(keypadDecimalOf('de', 'en-US'), '.')
  assert.equal(keypadDecimalOf('en', 'fa-IR'), '\u066b')
  // A device that agrees with the page contributes nothing, so nothing changes for it.
  assert.equal(keypadDecimalOf('en', 'en-GB'), undefined)
  assert.equal(keypadDecimalOf('de', 'ru-RU'), undefined)
  // Unusable input never throws.
  assert.equal(keypadDecimalOf('en', undefined), undefined)
  assert.equal(keypadDecimalOf('en', ''), undefined)
  assert.equal(keypadDecimalOf('en', '   '), undefined)
  assert.equal(keypadDecimalOf('en', 'not a tag'), undefined)
  assert.equal(keypadDecimalOf('en', 'C'), undefined)
})

check('parseNumberInput with a foreign keypad', () => {
  const p = parseNumberInput
  const u = undefined
  // The reported bug: an English page on a comma-decimal phone. Every prefix of "0,3" now reads.
  assert.equal(p('en', '0,3', ','), '0.3')
  assert.equal(p('en', '0,', ','), '0.')
  assert.equal(p('en', '1,5', ','), '1.5')
  assert.equal(p('en', '1234,5', ','), '1234.5')
  assert.equal(p('en', '0,000000001', ','), '0.000000001')
  // The mirror image: a period-decimal phone on the German page.
  assert.equal(p('de', '0.3', '.'), '0.3')
  assert.equal(p('de', '1.5', '.'), '1.5')
  // What must NOT change: a string that still reads exactly as one thousands group is a group, even
  // on a foreign keypad — otherwise "1,000" copied off our own English page would stake 1 GRAM.
  assert.equal(p('en', '1,000', ','), '1000')
  assert.equal(p('de', '1.000', '.'), '1000')
  assert.equal(p('en', '1,234,567', ','), '1234567')
  assert.equal(p('hi', '12,34,567', ','), '1234567')
  // The locale's own decimal still wins, and real garbage stays garbage.
  assert.equal(p('en', '1.5', ','), '1.5')
  assert.equal(p('en', '1,234.5', ','), '1234.5')
  assert.equal(p('en', '1,2,3', ','), u)
  assert.equal(p('en', '0,123,456', ','), u)
  assert.equal(p('en', '1,2345678901', ','), u)
  assert.equal(p('en', 'a,3', ','), u)
  // A keypad symbol that is already the page's decimal, or is not a separator at all, changes nothing.
  assert.equal(p('en', '1,5', '.'), u)
  assert.equal(p('en', '1,5', 'x'), u)
  // Without the argument every locale behaves exactly as it did before.
  assert.equal(p('en', '1,5'), u)
  assert.equal(p('en', '0,3'), u)
  assert.equal(p('de', '1.5'), u)
  assert.equal(p('en', '1,000'), '1000')
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
    sequence('en', '1,000.5', ['1', u, u, u, '1000', '1000.', '1000.5']),
    sequence('de', '1.000,5', ['1', u, u, u, '1000', '1000.', '1000.5']),
    sequence('fa', '۱٬۰۰۰٫۵', ['1', u, u, u, '1000', '1000.', '1000.5']),
    // (a trailing space is trimmed, so "1 " still reads as 1 — the right number for what is typed)
    sequence('ru', '1 000,5', ['1', '1', u, u, '1000', '1000.', '1000.5']),
    sequence('ru', '1 000,5', ['1', '1', u, u, '1000', '1000.', '1000.5']),
    sequence('hi', '1,000.5', ['1', u, u, u, '1000', '1000.', '1000.5']),
  ]
  for (const final of finals) assert.equal(toNano(final), 1000_500_000_000n)
  // Hindi lakh grouping: 12,34,567 → 1234567, invalid at every unfinished group.
  assert.equal(sequence('hi', '12,34,567', ['1', '12', u, u, u, u, u, u, '1234567']), '1234567')
  // The typo a reviewer feared: the group mark typed alone then digits never reads as a decimal.
  assert.equal(sequence('en', '1,5', ['1', u, u]), u)
  assert.equal(sequence('fa', '۱٬۵', ['1', u, u]), u)
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
