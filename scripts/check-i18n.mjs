#!/usr/bin/env node
// Translation completeness / freshness check (specs/multi-language-site.md §I, §L). No dependencies.
// Runs as `prebuild`, so a broken released locale fails CI.
//
//   node scripts/check-i18n.mjs                          check; exit 1 on released-locale errors
//   node scripts/check-i18n.mjs --update-hashes [locale] refresh meta.json sourceHash after a translation pass
//   node scripts/check-i18n.mjs --mark-reviewed <locale> <prefix>   mark entries reviewed (e.g. app. / prose/faq/ / docs/ / all)
//   node scripts/check-i18n.mjs --top-urls <locale>      the URLs to request indexing for (§L step 3)
//
// For every non-English locale in the registry it compares, against English: the flat key sets of
// src/i18n/<locale>/<ns>.json (placeholder parity, allowed HTML subset), the prose collection
// (src/content/prose/<locale>/**), the docs pages (src/content/docs/<locale>/** vs the root English files)
// and src/i18n/<locale>/docs-sidebar.json when English has one. The sidecar src/i18n/<locale>/meta.json
// records per item { sourceHash, reviewed, reviewedAt? } (sha1 of the English value or file) so stale
// and unreviewed translations are surfaced as warnings. Released (indexed|public) locale: missing →
// error; draft locale: everything is a warning, plus a coverage percentage.

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { DEFAULT_LOCALE, LOCALES, isReleased, isLocaleKey } = await import(
  new URL('../src/i18n/registry.mjs', import.meta.url).href
)

const I18N_DIR = join(ROOT, 'src', 'i18n')
const PROSE_DIR = join(ROOT, 'src', 'content', 'prose')
const DOCS_DIR = join(ROOT, 'src', 'content', 'docs')
const SITE = 'https://hipo.finance'
const ALLOWED_TAGS = new Set(['a', 'strong', 'em', 'code', 'br'])
const NOT_CATALOGS = new Set(['meta.json', 'docs-sidebar.json'])
const KEY_PATTERN = /^[a-z][a-z0-9]*(\.[a-z0-9][a-zA-Z0-9]*)+$/
const LIST_CAP = 20

// ------------------------------------------------------------------------------------------------ util

function sha1(value) {
  return createHash('sha1').update(value).digest('hex')
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function walk(dir, predicate) {
  if (!existsSync(dir)) {
    return []
  }
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full, predicate))
    } else if (predicate(full)) {
      out.push(full)
    }
  }
  return out.sort()
}

function posix(p) {
  return p.split(sep).join('/')
}

function placeholders(value) {
  return [...value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).sort()
}

// Catalog strings are rendered with set:html / dangerouslySetInnerHTML, so the whole tag is vetted, not
// just its name: the tag must be in ALLOWED_TAGS, no `on*` attribute may appear anywhere, and an `a`
// may only carry an href that starts with `/`, `#`, `https://`, `http://` or `mailto:`. Returns the
// offending tags/attributes as short descriptions, e.g. `<script>`, `<a onclick>`, `<a href="javascript:…">`.
//   disallowedTags('<a href="javascript:alert(1)">x</a>')  → ['a href="javascript:alert(1)"']
//   disallowedTags('<strong onclick="x()">y</strong>')      → ['strong onclick']
//   disallowedTags('<a href="/stake/">ok</a><br>')          → []
function disallowedTags(value) {
  const bad = []
  for (const m of value.matchAll(/<\/?\s*([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>?/g)) {
    const tag = m[1].toLowerCase()
    const attrs = m[2]
    if (!ALLOWED_TAGS.has(tag)) {
      bad.push(tag)
      continue
    }
    // Quoted values blanked first so `href="/onboarding/"` is not mistaken for a handler.
    const handler = /(?:^|[\s"'])(on[a-zA-Z]+)\s*=/i.exec(attrs.replace(/"[^"]*"|'[^']*'/g, '""'))
    if (handler !== null) {
      bad.push(`${tag} ${handler[1].toLowerCase()}`)
    }
    for (const href of attrs.matchAll(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      const url = (href[1] ?? href[2] ?? href[3]).trim()
      if (!/^(?:\/|#|https:\/\/|http:\/\/|mailto:)/i.test(url)) {
        bad.push(`${tag} href="${url}"`)
      }
    }
  }
  return bad
}

// -------------------------------------------------------------------------------------- source model

// Reads one locale's translatable items into a Map of itemKey → { value, hash, kind }.
//   catalog:      "<ns>.<rest>"           value = string
//   prose:        "prose/<rel path>"      value = file contents
//   docs:         "docs/<rel path>"       value = file contents
//   sidebar:      "docs-sidebar/<link>"   value = label
// `problems` collects structural errors in that locale's own files (non-flat JSON, bad keys, HTML).
function readLocale(locale, problems) {
  const items = new Map()
  const dir = join(I18N_DIR, locale)
  const namespaces = new Set()
  if (existsSync(dir)) {
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.json') || NOT_CATALOGS.has(name)) {
        continue
      }
      const ns = name.slice(0, -'.json'.length)
      namespaces.add(ns)
      let json
      try {
        json = readJson(join(dir, name))
      } catch (error) {
        problems.push(`${locale}/${name}: invalid JSON (${error.message})`)
        continue
      }
      if (json === null || typeof json !== 'object' || Array.isArray(json)) {
        problems.push(`${locale}/${name}: must be a flat object`)
        continue
      }
      for (const [key, value] of Object.entries(json)) {
        if (typeof value !== 'string') {
          problems.push(`${locale}/${name}: "${key}" must be a string (catalogs are flat)`)
          continue
        }
        if (!KEY_PATTERN.test(key)) {
          problems.push(`${locale}/${name}: key "${key}" is not flat dotted lowerCamel`)
        } else if (!key.startsWith(ns + '.')) {
          problems.push(`${locale}/${name}: key "${key}" must start with "${ns}." (namespace = file name)`)
        }
        const bad = disallowedTags(value)
        if (bad.length > 0) {
          problems.push(
            `${locale}/${name}: "${key}" uses disallowed HTML <${bad[0]}> (allowed: a strong em code br; no on* attributes; href must start with / # https:// http:// mailto:)`,
          )
        }
        items.set(key, { value, hash: sha1(value), kind: 'catalog' })
      }
    }
  }
  const proseDir = join(PROSE_DIR, locale)
  for (const file of walk(proseDir, (f) => /\.mdx?$/.test(f))) {
    const value = readFileSync(file, 'utf8')
    items.set('prose/' + posix(relative(proseDir, file)), { value, hash: sha1(value), kind: 'prose' })
  }
  // English docs live at the root of src/content/docs (locale dirs excluded); other locales under <locale>/.
  const docsDir = locale === DEFAULT_LOCALE ? DOCS_DIR : join(DOCS_DIR, locale)
  for (const file of walk(docsDir, (f) => /\.mdx?$/.test(f))) {
    const rel = posix(relative(docsDir, file))
    if (locale === DEFAULT_LOCALE && isLocaleKey(rel.split('/')[0])) {
      continue
    }
    const value = readFileSync(file, 'utf8')
    items.set('docs/' + rel, { value, hash: sha1(value), kind: 'docs' })
  }
  const sidebar = join(dir, 'docs-sidebar.json')
  if (existsSync(sidebar)) {
    try {
      const json = readJson(sidebar)
      for (const [link, label] of Object.entries(json)) {
        // `_comment` and other `_`-prefixed keys document the file; they are not labels.
        if (link.startsWith('_')) {
          continue
        }
        if (typeof label !== 'string') {
          problems.push(`${locale}/docs-sidebar.json: "${link}" must be a string`)
          continue
        }
        items.set('docs-sidebar/' + link, { value: label, hash: sha1(label), kind: 'sidebar' })
      }
    } catch (error) {
      problems.push(`${locale}/docs-sidebar.json: invalid JSON (${error.message})`)
    }
  }
  return { items, namespaces }
}

function metaPath(locale) {
  return join(I18N_DIR, locale, 'meta.json')
}

function readMeta(locale) {
  const file = metaPath(locale)
  return existsSync(file) ? readJson(file) : {}
}

function writeMeta(locale, meta) {
  const sorted = Object.fromEntries(
    Object.keys(meta)
      .sort()
      .map((k) => [k, meta[k]]),
  )
  writeFileSync(metaPath(locale), JSON.stringify(sorted, null, 2) + '\n')
}

function localesInRegistry() {
  return Object.keys(LOCALES).filter((key) => key !== DEFAULT_LOCALE)
}

function hasAnyFiles(locale) {
  return existsSync(join(I18N_DIR, locale)) || existsSync(join(PROSE_DIR, locale)) || existsSync(join(DOCS_DIR, locale))
}

// --------------------------------------------------------------------------------------------- check

function listSome(label, values) {
  if (values.length === 0) {
    return []
  }
  const shown = values.slice(0, LIST_CAP)
  const rest = values.length - shown.length
  return [`${label} (${values.length}): ${shown.join(', ')}${rest > 0 ? `, … and ${rest} more` : ''}`]
}

function check() {
  const errors = []
  const warnings = []
  const englishProblems = []
  const english = readLocale(DEFAULT_LOCALE, englishProblems)
  for (const problem of englishProblems) {
    errors.push(problem)
  }
  const total = english.items.size
  console.log(`i18n: English source has ${total} items (${[...english.namespaces].join(', ')} catalogs, prose, docs)`)

  const released = localesInRegistry().filter((key) => isReleased(key))
  if (released.length === 1 || released.length === 2) {
    warnings.push(
      `batch rule: ${released.length} non-English locale(s) released (${released.join(', ')}); locales are submitted for indexing in batches of at least three (decision 14)`,
    )
  }

  for (const locale of localesInRegistry()) {
    const status = LOCALES[locale].status
    const strict = isReleased(locale)
    const report = strict ? errors : warnings
    const tag = `${locale} (${status})`
    if (!hasAnyFiles(locale)) {
      if (strict) {
        errors.push(`${tag}: no translation files at all (${total} items missing)`)
      } else {
        console.log(`  ${tag}: not started — coverage 0.0% (0/${total})`)
      }
      continue
    }
    const problems = []
    const { items } = readLocale(locale, problems)
    for (const problem of problems) {
      report.push(problem)
    }
    const meta = readMeta(locale)
    const missing = []
    const extra = []
    const placeholderMismatch = []
    const stale = []
    const untracked = []
    let unreviewed = 0
    let translated = 0
    for (const [key, source] of english.items) {
      const translation = items.get(key)
      if (translation === undefined) {
        missing.push(key)
        continue
      }
      translated++
      if (source.kind === 'catalog' || source.kind === 'sidebar') {
        const a = placeholders(source.value).join(',')
        const b = placeholders(translation.value).join(',')
        if (a !== b) {
          placeholderMismatch.push(`${key} (en {${a}} vs ${locale} {${b}})`)
        }
      }
      const entry = meta[key]
      if (entry === undefined) {
        untracked.push(key)
      } else {
        if (entry.sourceHash !== source.hash) {
          stale.push(key)
        }
        if (entry.reviewed !== true) {
          unreviewed++
        }
      }
    }
    for (const key of items.keys()) {
      if (!english.items.has(key)) {
        extra.push(key)
      }
    }
    const coverage = total === 0 ? 100 : (translated / total) * 100
    console.log(
      `  ${tag}: coverage ${coverage.toFixed(1)}% (${translated}/${total}), missing ${missing.length}, stale ${stale.length}, unreviewed ${unreviewed}, untracked ${untracked.length}, extra ${extra.length}`,
    )
    // Released: missing and placeholder problems are errors, listed in full.
    if (strict) {
      for (const key of missing) {
        errors.push(`${tag}: missing ${key}`)
      }
      for (const item of placeholderMismatch) {
        errors.push(`${tag}: placeholder mismatch ${item}`)
      }
    } else {
      warnings.push(...listSome(`${tag}: missing`, missing).map((s) => s))
      warnings.push(...listSome(`${tag}: placeholder mismatch`, placeholderMismatch))
    }
    warnings.push(
      ...listSome(
        `${tag}: stale (English changed since translation; run --update-hashes ${locale} after retranslating)`,
        stale,
      ),
    )
    warnings.push(...listSome(`${tag}: untracked in meta.json (run --update-hashes ${locale})`, untracked))
    warnings.push(...listSome(`${tag}: extra (not in English)`, extra))
    if (unreviewed > 0) {
      warnings.push(`${tag}: ${unreviewed} translated item(s) not yet reviewed by a native speaker`)
    }
  }

  for (const warning of warnings) {
    console.warn(`  warning: ${warning}`)
  }
  for (const error of errors) {
    console.error(`  error: ${error}`)
  }
  if (errors.length > 0) {
    console.error(`i18n: ${errors.length} error(s), ${warnings.length} warning(s)`)
    return 1
  }
  console.log(`i18n: ok, ${warnings.length} warning(s)`)
  return 0
}

// ------------------------------------------------------------------------------------- maintenance

function updateHashes(locales) {
  const english = readLocale(DEFAULT_LOCALE, [])
  for (const locale of locales) {
    if (!hasAnyFiles(locale)) {
      console.log(`${locale}: no translation files, nothing to do`)
      continue
    }
    const { items } = readLocale(locale, [])
    const meta = readMeta(locale)
    const next = {}
    let added = 0
    let refreshed = 0
    let kept = 0
    for (const [key, source] of english.items) {
      if (!items.has(key)) {
        continue
      }
      const entry = meta[key]
      if (entry === undefined) {
        next[key] = { sourceHash: source.hash, reviewed: false }
        added++
      } else if (entry.sourceHash !== source.hash) {
        // English changed: the translation needs a fresh look, so the review flag is reset.
        next[key] = { sourceHash: source.hash, reviewed: false }
        refreshed++
      } else {
        next[key] = entry
        kept++
      }
    }
    const dropped = Object.keys(meta).length - kept - refreshed
    writeMeta(locale, next)
    console.log(
      `${locale}: meta.json updated — ${added} added, ${refreshed} refreshed (reviewed reset), ${kept} unchanged, ${dropped} dropped`,
    )
  }
}

function markReviewed(locale, prefix) {
  const english = readLocale(DEFAULT_LOCALE, [])
  const { items } = readLocale(locale, [])
  const meta = readMeta(locale)
  const today = new Date().toISOString().slice(0, 10)
  let count = 0
  for (const [key, source] of english.items) {
    if (!items.has(key) || !(prefix === 'all' || key.startsWith(prefix))) {
      continue
    }
    // A review is against the current English, so the hash is refreshed along with the flag.
    meta[key] = { sourceHash: source.hash, reviewed: true, reviewedAt: today }
    count++
  }
  writeMeta(locale, meta)
  console.log(`${locale}: ${count} item(s) matching "${prefix}" marked reviewed (${today})`)
}

function topUrls(locale) {
  const paths = [
    '/',
    '/stake/',
    '/unstake/',
    '/rewards/',
    '/faq/',
    '/hpo/',
    '/docs/',
    '/docs/tutorials/staking/',
    '/docs/tutorials/unstaking/',
  ]
  const prefix = locale === DEFAULT_LOCALE ? '' : '/' + locale
  for (const path of paths) {
    console.log(SITE + prefix + path)
  }
}

// -------------------------------------------------------------------------------------------- main

function requireLocale(value, flag) {
  if (value === undefined || !isLocaleKey(value)) {
    console.error(`${flag}: expected a registry locale key (${Object.keys(LOCALES).join(', ')}), got "${value ?? ''}"`)
    process.exit(2)
  }
  return value
}

const args = process.argv.slice(2)
const flag = args[0]
if (flag === undefined) {
  process.exit(check())
} else if (flag === '--update-hashes') {
  updateHashes(args[1] === undefined ? localesInRegistry() : [requireLocale(args[1], flag)])
} else if (flag === '--mark-reviewed') {
  const locale = requireLocale(args[1], flag)
  if (args[2] === undefined) {
    console.error('--mark-reviewed: expected <locale> <prefix> (e.g. app. / prose/faq/ / docs/ / docs-sidebar/ / all)')
    process.exit(2)
  }
  markReviewed(locale, args[2])
} else if (flag === '--top-urls') {
  topUrls(requireLocale(args[1], flag))
} else if (flag === '--help' || flag === '-h') {
  console.log(
    readFileSync(fileURLToPath(import.meta.url), 'utf8')
      .split('\n')
      .slice(1, 10)
      .map((l) => l.replace(/^\/\/ ?/, ''))
      .join('\n'),
  )
} else {
  console.error(`unknown flag ${flag}; see --help`)
  process.exit(2)
}
