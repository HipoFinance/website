// Locale-aware number, date and duration formatting (spec §E, decision 2): every displayed number
// follows the locale's own Intl conventions — digits, grouping, decimal symbol, percent/currency
// placement, compact notation. Persian gets Persian digits and the Jalali calendar, Arabic gets
// Arabic-Indic digits, Hindi lakh grouping, Russian NBSP groups. The Intl tag comes from intlOf(): the
// registry's `lang`, except where an entry pins a numbering system (`ar` → `ar-u-nu-arab`, since plain
// `ar` formats with Latin digits in current ICU — decision 10).
// Pure, dependency-free; used by the island, Astro components and src/scripts/*.js.
import { DEFAULT_LOCALE } from './registry.mjs'
import { intlOf, type Locale } from './locale.ts'
import type { Translator } from './t.ts'

const numberFormats = new Map<string, Intl.NumberFormat>()

function numberFormat(locale: Locale, opts?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const lang = intlOf(locale)
  const key = lang + (opts === undefined ? '' : JSON.stringify(opts))
  let format = numberFormats.get(key)
  if (format === undefined) {
    format = new Intl.NumberFormat(lang, opts)
    numberFormats.set(key, format)
  }
  return format
}

export function formatNumber(locale: Locale, value: number, opts?: Intl.NumberFormatOptions): string {
  return numberFormat(locale, opts).format(value)
}

// Nanotons → whole tokens (same default as the old Model.formatNano: up to 2 fraction digits).
export function formatNano(locale: Locale, nano: bigint | number, maxFractionDigits = 2): string {
  return formatNumber(locale, Number(nano) / 1e9, { maximumFractionDigits: maxFractionDigits })
}

// 0.032 → "3.2%" (fa "۳٫۲٪").
export function formatPercent(locale: Locale, ratio: number, maxFractionDigits = 2): string {
  return formatNumber(locale, ratio, { style: 'percent', maximumFractionDigits: maxFractionDigits })
}

// 0.032 → "+3.2%", -0.032 → "-3.2%", 0 → "0%".
export function formatSignedPercent(locale: Locale, ratio: number): string {
  return formatNumber(locale, ratio, { style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero' })
}

// 1234567 → "1.2M" (fa "۱٫۲ میلیون").
export function formatCompact(locale: Locale, value: number, maxFractionDigits = 1): string {
  return formatNumber(locale, value, { notation: 'compact', maximumFractionDigits: maxFractionDigits })
}

// style:'currency' puts the sign where the locale does. Pass e.g. { maximumSignificantDigits: 4 } for
// sub-dollar prices or { notation: 'compact' } for market caps.
export function formatUsd(locale: Locale, value: number, opts?: Intl.NumberFormatOptions): string {
  return formatNumber(locale, value, { style: 'currency', currency: 'USD', maximumFractionDigits: 2, ...opts })
}

// Exchange rates: 4 fixed fraction digits.
export function formatRate(locale: Locale, value: number): string {
  return formatNumber(locale, value, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

const dateFormats = new Map<string, Intl.DateTimeFormat>()

// Locale default calendar and numbering system on purpose (fa → Jalali + Persian digits, decision 9).
export function formatDate(locale: Locale, date: Date | number, opts: Intl.DateTimeFormatOptions): string {
  const lang = intlOf(locale)
  const key = lang + JSON.stringify(opts)
  let format = dateFormats.get(key)
  if (format === undefined) {
    format = new Intl.DateTimeFormat(lang, opts)
    dateFormats.set(key, format)
  }
  return format.format(date)
}

// "3h 20m" from the catalog templates app.format.duration.hm / .m, numbers locale-formatted.
// Replaces Model.formatRemain; note it renders "0m" (not "") when nothing remains.
export function formatDuration(t: Translator, seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const params = { h: formatNumber(t.locale, h), m: formatNumber(t.locale, m) }
  return h === 0 ? t.t('app.format.duration.m', params) : t.t('app.format.duration.hm', params)
}

// Wraps a value in FSI … PDI (U+2068 / U+2069) so `≈ 1,234.5 GRAM` keeps reading order inside RTL text
// composed as a plain string (JSX uses the `num` utility class instead).
export function isolate(s: string): string {
  return '\u2068' + s + '\u2069'
}

// ---------------------------------------------------------------------------------------------------
// Amount input: parse anything a user of the locale might type into the ASCII "1234.5" that toNano()
// accepts, and render that ASCII back in the locale's digits for the controlled input.

interface Symbols {
  digits: string[] // index 0–9 → the locale's digit
  decimal: string
  group: string
}

const symbolCache = new Map<Locale, Symbols>()

function symbolsOf(locale: Locale): Symbols {
  let symbols = symbolCache.get(locale)
  if (symbols === undefined) {
    const lang = intlOf(locale)
    const sample = new Intl.NumberFormat(lang, { useGrouping: false }).format(9876543210)
    const sampleDigits = [...sample]
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    if (sampleDigits.length === 10) {
      for (let i = 0; i < 10; i++) {
        digits[Number('9876543210'[i])] = sampleDigits[i]
      }
    }
    const parts = new Intl.NumberFormat(lang).formatToParts(1234567.89)
    symbols = {
      digits,
      decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
      group: parts.find((part) => part.type === 'group')?.value ?? ',',
    }
    symbolCache.set(locale, symbols)
  }
  return symbols
}

// Arabic-Indic U+0660–0669, Extended Arabic-Indic (Persian) U+06F0–06F9, Devanagari U+0966–096F, and
// fullwidth U+FF10–FF19 → ASCII.
const NATIVE_DIGITS = /[\u0660-\u0669\u06f0-\u06f9\u0966-\u096f\uff10-\uff19]/g
const DIGIT_BASES = [0x0660, 0x06f0, 0x0966, 0xff10]

function toAsciiDigit(ch: string): string {
  const code = ch.charCodeAt(0)
  for (const base of DIGIT_BASES) {
    if (code >= base && code <= base + 9) {
      return String(code - base)
    }
  }
  return ch
}

// Bidi control marks, which never mean anything in a number: U+200E/U+200F LRM/RLM, U+061C ALM,
// U+2066–U+2069 isolates, U+202A–U+202E embeddings.
const BIDI_MARKS = /[\u200e\u200f\u061c\u2066-\u2069\u202a-\u202e]/g

// Group-only symbols — never a decimal in any locale: whitespace incl. NBSP U+00A0, NNBSP U+202F and
// thin space U+2009 (what ru, fr, … group with) and the ARABIC THOUSANDS SEPARATOR '٬' U+066C (fa, ar).
// Runs of them are normalised to the single GROUP_MARK before tokenising.
const GROUP_ONLY = /[\s\u00a0\u202f\u2009\u066c]+/g
const GROUP_MARK = '\u00a0'
// Leading/trailing whitespace is trimmed first ("12 " is 12); a leading/trailing '٬' is not ("۱٬" is
// an unfinished group, not 1).
const EDGE_WHITESPACE = /^[\s\u00a0\u202f\u2009]+|[\s\u00a0\u202f\u2009]+$/g

// Any other separator a user might type: ASCII '.' and ',', Arabic decimal '٫' U+066B and Arabic comma
// '،' U+060C (used as a decimal separator on Persian keyboards).
const SEPARATORS = new Set(['.', ',', '\u066b', '\u060c'])

// toNano() precision: amounts are integers of 1e-9 GRAM, so more fraction digits than this cannot be sent.
const MAX_FRACTION_DIGITS = 9

// The digits before the first group symbol: 1–3, never leading-zero ("0.123" is a decimal in any locale).
const GROUP_HEAD = /^[1-9][0-9]{0,2}$/

// `keypadDecimal` is the decimal separator the VISITOR'S DEVICE produces, when it is known and differs
// from the page locale's (Model passes it; see `keypadDecimalOf`). A mobile numeric keypad follows the
// device's region, not the page's: on the English site a device set to a comma-decimal region offers a
// "," key and no "." at all, so without this the visitor cannot type a decimal amount at all — every
// state of "0,3" is rejected as a malformed thousands group. It only ever rescues states that CANNOT be
// read as a group; "1,000" stays 1000 on the English page whatever the device does.
//
// Returns ASCII "1234.5" (a trailing "." is kept so a controlled input can show "12." mid-typing; a
// leading "." becomes "0."), or undefined for empty input, unknown characters or an unparseable mix of
// separators. Decimal-vs-group rules (spec §E; the money path, so ambiguity resolves to "invalid",
// never to a guess):
//   - whitespace between digits and '٬' U+066C are always thousands separators ("1 234,5" ru,
//     "۱٬۰۰۰" in any locale);
//   - the locale's group symbol is ONLY ever a group: "1,000" in en is 1000, and the states typed on
//     the way there — "1," "1,0" "1,00" — are invalid (undefined) rather than 1, 1.0, 1.00, so an
//     unfinished group can never be sent as a thousand-fold smaller amount. Likewise "1.5" in de is
//     invalid (de's decimal is ",") — the field shows the invalid colour until the user fixes it.
//     The ONE exception is `keypadDecimal`: when the visitor's own keypad emits that character as its
//     decimal, "1,5" and "0,3" in en are read as 1.5 and 0.3, because on that device they cannot be
//     anything else. A string that still looks exactly like a group ("1,000") is a group even then;
//   - the locale's decimal symbol, alone, is the decimal ("1,5" de, "1.000" en = 1.000);
//   - a single FOREIGN separator (neither the locale's group nor its decimal: "1.5" ru, "۱.۵" / "۱،۵" fa)
//     is the decimal too — unless it sits where a thousands group would ("1,500" in fa: a 1–3 digit
//     head, exactly three digits after), which is ambiguous and therefore invalid, not a guess;
//   - the same non-decimal separator repeated is grouping ("1,234,567" en, Hindi "12,34,567"); the
//     locale's decimal symbol repeated is garbage;
//   - two different separators: the last one (occurring once) is the decimal, the other the group
//     ("1,234.5" en, "1.234,5" de); three kinds (or whitespace plus two) is garbage.
// Group symbols must separate plausible groups: head 1–3 digits without a leading zero, middle runs
// 2–3 (Hindi lakh), the last exactly 3, none after the decimal. Rejects "1.2,3", "1,2,3", ",234",
// "0,123,456", "1,000,00". More than 9 fraction digits (MAX_FRACTION_DIGITS) is rejected too, since
// toNano could not represent it.
export function parseNumberInput(locale: Locale, raw: string, keypadDecimal?: string): string | undefined {
  const symbols = symbolsOf(locale)
  const cleaned = raw
    .replace(NATIVE_DIGITS, toAsciiDigit)
    .replace(BIDI_MARKS, '')
    .replace(EDGE_WHITESPACE, '')
    .replace(GROUP_ONLY, GROUP_MARK)
  if (cleaned === '') {
    return undefined
  }
  // Tokenise into digits and separators; anything else is rejected.
  const separators: { ch: string; index: number }[] = []
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (ch >= '0' && ch <= '9') {
      continue
    }
    if (ch === GROUP_MARK || SEPARATORS.has(ch) || ch === symbols.decimal || ch === symbols.group) {
      separators.push({ ch, index: i })
      continue
    }
    return undefined
  }
  if (!/[0-9]/.test(cleaned)) {
    return undefined
  }
  const spaced = separators.some((s) => s.ch === GROUP_MARK)
  const distinct = [...new Set(separators.map((s) => s.ch))].filter((ch) => ch !== GROUP_MARK)
  const count = (ch: string) => separators.filter((s) => s.ch === ch).length
  let decimal: string | undefined
  if (distinct.length === 0) {
    decimal = undefined
  } else if (distinct.length === 1) {
    const ch = distinct[0]
    if (count(ch) === 1) {
      // Whether the whole string reads exactly as one thousands group ("1,000", never "0,3" or "1,5").
      const { index } = separators[0]
      const looksGrouped = GROUP_HEAD.test(cleaned.slice(0, index)) && cleaned.length - index - 1 === 3
      if (spaced || ch === symbols.decimal) {
        // Group-only marks already group, so anything else is the decimal; the locale's decimal always is.
        decimal = ch
      } else if (ch === symbols.group) {
        // The locale's group symbol is a group (validated below) — unless it is also the only decimal
        // key this visitor's keypad has, and the string cannot be a group anyway.
        decimal = !looksGrouped && ch === keypadDecimal ? ch : undefined
      } else if (looksGrouped) {
        // A foreign separator that looks exactly like a thousands group: ambiguous, so not a guess.
        return undefined
      } else {
        decimal = ch
      }
    } else {
      if (spaced || (ch === symbols.decimal && ch !== symbols.group)) {
        return undefined
      }
      decimal = undefined
    }
  } else if (distinct.length === 2 && !spaced) {
    const last = separators[separators.length - 1]
    if (count(last.ch) !== 1) {
      return undefined
    }
    decimal = last.ch
  } else {
    return undefined
  }
  const decimalAt = decimal === undefined ? -1 : cleaned.indexOf(decimal)
  const groups = separators.filter((s) => s.ch !== decimal)
  if (groups.length > 0) {
    // Exactly one group symbol kind (whitespace or the one derived above), all before the decimal.
    const group = groups[0].ch
    if (groups.some((s) => s.ch !== group || (decimalAt !== -1 && s.index > decimalAt))) {
      return undefined
    }
    const integer = decimalAt === -1 ? cleaned : cleaned.slice(0, decimalAt)
    const runs = integer.split(group)
    const middle = runs.slice(1, -1)
    if (
      !GROUP_HEAD.test(runs[0]) ||
      runs[runs.length - 1].length !== 3 ||
      middle.some((run) => run.length < 2 || run.length > 3)
    ) {
      return undefined
    }
  }
  let result = ''
  for (const ch of cleaned) {
    if (ch >= '0' && ch <= '9') {
      result += ch
    } else if (ch === decimal) {
      result += '.'
    }
    // group symbols are dropped
  }
  if (result.startsWith('.')) {
    result = '0' + result
  }
  // A leading-zero integer part ("0123", "00") is garbage, not 123.
  if (/^0[0-9]/.test(result)) {
    return undefined
  }
  const fraction = result.indexOf('.')
  if (fraction !== -1 && result.length - fraction - 1 > MAX_FRACTION_DIGITS) {
    return undefined
  }
  return result
}

// The decimal separator this visitor's device would put on a numeric keypad, for `parseNumberInput`'s
// third argument. `tag` is what the browser reports (`navigator.language`), which on iOS and Android
// carries the system region — the same setting the keypad's decimal key follows.
//
// Returns undefined unless the answer is both usable and worth acting on: an unparseable tag, a symbol
// this parser does not recognise as a separator, or a device that already agrees with the page locale
// all yield undefined, so the caller can pass the result straight through and a matching device leaves
// every existing reading untouched.
export function keypadDecimalOf(locale: Locale, tag: string | undefined): string | undefined {
  if (tag == null || tag.trim() === '') {
    return undefined
  }
  let device: string
  try {
    device = new Intl.NumberFormat(tag).formatToParts(1.5).find((part) => part.type === 'decimal')?.value ?? '.'
  } catch {
    // An invalid tag ("C", "posix") throws RangeError; the page locale's own rules then apply.
    return undefined
  }
  if (!SEPARATORS.has(device) || device === symbolsOf(locale).decimal) {
    return undefined
  }
  return device
}

// ASCII "1234.5" → the locale's digits and decimal symbol, no grouping (for the amount input display).
// English is returned unchanged. Round-trips through parseNumberInput for every registry locale.
export function formatInput(locale: Locale, ascii: string): string {
  const symbols = symbolsOf(locale)
  let result = ''
  for (const ch of ascii) {
    if (ch >= '0' && ch <= '9') {
      result += symbols.digits[Number(ch)]
    } else if (ch === '.') {
      result += symbols.decimal
    } else {
      result += ch
    }
  }
  return result
}

// Plain ASCII "1234.5" for amounts the user must retype into another tool (the multisig transfer
// amount): English formatting, no grouping, so every locale gets "0.1", not "۰٫۱" or "0,1". Note that
// `numberingSystem: 'latn'` alone is not enough — de/ru keep their "," decimal under it.
export function formatAsciiNano(nano: bigint | number, maxFractionDigits = 2): string {
  return formatNumber(DEFAULT_LOCALE, Number(nano) / 1e9, {
    useGrouping: false,
    maximumFractionDigits: maxFractionDigits,
  })
}
