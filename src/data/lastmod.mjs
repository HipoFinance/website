// Per-URL `<lastmod>` for the sitemap, derived from git history.
//
// Google treats `lastmod` as a *binary* trust signal: it either believes a site's dates or it
// discards them for the whole site, and it verifies by fetching a URL you flagged and comparing it
// against the copy it already has. So the only failure that matters here is claiming a page changed
// when it did not — a build timestamp on every URL would announce a site-wide change on every
// deploy, Google would find them identical, and we would have taught it to ignore the field. The
// asymmetry runs the whole module: **when in doubt, emit nothing**. A missing date costs us only the
// status quo (Google falls back to its own per-URL change heuristics); a wrong one costs us the
// signal itself.
//
// That is also why a page's date is the newest commit touching its *content inputs* — its locale
// catalogs, its prose entries, its Markdown — and deliberately NOT its layout, components or CSS.
// Editing src/layouts/LandingLayout.astro does re-render every page, but chrome is not the kind
// of change Google's staleness model is asking about, and bumping every date on a refactor is the
// mass-false-positive problem wearing a different hat. The repo's i18n discipline is what makes
// catalogs a sound proxy: every user-visible string goes through a catalog or the prose collection,
// so copy cannot change without one of them changing. src/i18n/<locale>/site.json and seo.json are
// left out for the same reason — they are shared by every URL of a locale (51 of them), so
// attributing a change in one to any single page would be a false positive on the other 50.
//
// One caveat for whoever next rewrites history: %cI is the *committer* date, so a filter-repo run or
// a full rebase restamps every commit with "now" and would date the whole site today. The uniform-date
// guard below only catches a rewrite that finishes inside one second, so re-check the sitemap after one.
//
// See changelog/2026-08-30-sitemap-lastmod.md for the reasoning and the Search Console context.

import { execFileSync } from 'node:child_process'
import { posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_LOCALE, isLocaleKey } from '../i18n/registry.mjs'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))

// The only trees consulted. Keeping the `git log` scoped keeps it to one fast process.
const ROOTS = ['src/i18n', 'src/content/prose', 'src/content/docs', 'src/pages']

// Content inputs per route segment, relative to a locale. `catalogs` are files under
// src/i18n/<locale>/, `prose` are directories under src/content/prose/<locale>/ (newest entry wins).
// `/app/` is filtered out of the sitemap upstream and has no entry; anything absent here simply gets
// no lastmod.
const ROUTES = {
  '': { catalogs: ['landing.json'], prose: [] },
  faq: { catalogs: ['faq.json'], prose: ['faq'] },
  hpo: { catalogs: ['hpo.json'], prose: ['hpo-faq'] },
  // The five app pages take their date from their own explainer cards only. app.json is deliberately
  // NOT an input: one flat 190-key namespace shared by all five, so a label changed on /defi/ would
  // date the other four as well — 40 false claims out of 50 URLs, the same failure site.json is
  // excluded for. The cost is that an app.json-only copy change moves nothing, which is the safe
  // direction. The cards are per-page and exist in every locale.
  stake: { catalogs: [], prose: ['shell/stake'] },
  unstake: { catalogs: [], prose: ['shell/unstake'] },
  rewards: { catalogs: [], prose: ['shell/rewards'] },
  stats: { catalogs: [], prose: ['shell/stats'] },
  defi: { catalogs: [], prose: ['shell/defi'] },
}

// Two English-only pages whose copy is written inline in the page file rather than in a catalog
// (both say so in their own header comments). One file each, so no mass-bump risk.
const ENGLISH_ONLY = {
  verify: 'src/pages/verify.astro',
  vs: 'src/pages/vs.astro',
}

/** @type {{ files: Map<string, string>, dirs: Map<string, string> } | null | undefined} */
let index
const warned = new Set()

function warnOnce(key, message) {
  if (warned.has(key)) {
    return
  }
  warned.add(key)
  console.warn(`[sitemap] ${message}`)
}

/**
 * One `git log` pass over ROOTS → newest commit date per tracked path, plus the same rolled up over
 * every ancestor directory so a prose directory can be queried directly.
 * @returns {{ files: Map<string, string>, dirs: Map<string, string> } | null} null when dates cannot
 * be trusted, in which case no URL gets a lastmod.
 */
function buildIndex() {
  const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })

  let log
  try {
    // A shallow clone gives every file the tip commit's date — the build-timestamp failure wearing a
    // git costume. actions/checkout defaults to fetch-depth: 1, so this guard is what stands between
    // a CI misconfiguration and poisoning the signal for the whole site.
    if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
      warnOnce('shallow', 'shallow git clone: omitting <lastmod>. Set `fetch-depth: 0` on actions/checkout.')
      return null
    }
    // core.quotePath=false keeps non-ASCII paths raw instead of C-escaped. %x00 prefixes each commit
    // header with a NUL, which cannot occur in a path, so the two line kinds are unambiguous.
    // --diff-merges=combined (git >= 2.31) is what makes merges come out right: by default a merge
    // lists no files at all, which would miss a conflict resolution that edits the file — this
    // history has one, fb449fc, where nine landing.json catalogs got their final text. `combined`
    // lists exactly the paths that differ from *every* parent, so an ordinary merge still
    // contributes nothing while an edit made during the merge counts. (--no-merges silently
    // under-dated those nine home pages by two days; --diff-merges=first-parent would go the other
    // way and credit the merge with everything the branch brought in.)
    const format = ['--format=%x00%cI', '--name-only', '--diff-merges=combined']
    log = git(['-c', 'core.quotePath=false', 'log', ...format, '--', ...ROOTS])
  } catch (error) {
    warnOnce('git', `git unavailable, omitting <lastmod>: ${error.message}`)
    return null
  }

  const files = new Map()
  const dirs = new Map()
  const bump = (map, key, date) => {
    const current = map.get(key)
    if (current === undefined || date > current) {
      map.set(key, date)
    }
  }

  let date = null
  for (const line of log.split('\n')) {
    if (line.startsWith('\0')) {
      // Normalise to UTC so the strings compare lexicographically: %cI keeps the committer's offset,
      // and this history has several. A date git cannot express as a real instant (a commit object
      // written directly by an importer with an out-of-range timestamp) must degrade to "no date" —
      // toISOString() would throw a RangeError, and @astrojs/sitemap catches a throwing serialize by
      // logging and writing *no sitemap at all*, with the build still exiting 0. The files that
      // follow are then skipped by the `date === null` check below.
      const parsed = new Date(line.slice(1))
      date = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
      continue
    }
    if (line === '' || date === null) {
      continue
    }
    bump(files, line, date)
    for (let dir = posix.dirname(line); dir !== '.' && dir !== '/'; dir = posix.dirname(dir)) {
      bump(dirs, dir, date)
    }
  }

  // Belt and braces for a history the shallow check does not catch (a squashed export, say): if every
  // tracked file shares one date, the dates carry no information and claiming them would be a lie.
  if (files.size > 1 && new Set(files.values()).size === 1) {
    warnOnce('uniform', 'every tracked file shares one commit date: omitting <lastmod>.')
    return null
  }

  return { files, dirs }
}

/**
 * Content inputs for a sitemap URL's pathname, as repo-relative paths (files or directories).
 * @param {string} pathname e.g. `/`, `/fa/faq/`, `/docs/introduction/liquid-staking/`
 * @returns {string[]} empty when the route is not one we can attribute
 */
function inputsFor(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments.length > 0 && isLocaleKey(segments[0]) ? segments.shift() : DEFAULT_LOCALE

  // Docs are one Markdown file each; English at the root, translations under a locale directory.
  // The sidebar labels are chrome shared by every docs page, so they are not an input.
  // RESERVED_SEGMENTS keeps a locale key off the first URL segment, but says nothing about deeper
  // ones: an English doc at src/content/docs/it/foo.md would be indistinguishable from the Italian
  // translation of foo.md. None exists (content.config.ts's locale-first ids would break first), so
  // do not create a top-level docs directory named after a locale.
  if (segments[0] === 'docs') {
    const base = locale === DEFAULT_LOCALE ? 'src/content/docs' : `src/content/docs/${locale}`
    const rest = segments.slice(1)
    return [`${base}/${rest.length === 0 ? 'index' : rest.join('/')}.md`]
  }

  if (segments.length === 1 && locale === DEFAULT_LOCALE && ENGLISH_ONLY[segments[0]]) {
    return [ENGLISH_ONLY[segments[0]]]
  }

  const route = segments.length === 0 ? ROUTES[''] : segments.length === 1 ? ROUTES[segments[0]] : undefined
  if (route === undefined) {
    return []
  }
  return [
    ...route.catalogs.map((name) => `src/i18n/${locale}/${name}`),
    ...route.prose.map((dir) => `src/content/prose/${locale}/${dir}`),
  ]
}

/**
 * The `<lastmod>` for one sitemap URL: the newest commit date across the page's content inputs.
 * A translated page carries its own date, not the English source's — when the Persian catch-up lands
 * a week after the English edit, that later date is the truthful one for /fa/.
 * @param {string} pathname
 * @returns {string | undefined} ISO 8601 UTC, or undefined when no date can be trusted
 */
export function lastmodFor(pathname) {
  if (index === undefined) {
    index = buildIndex()
  }
  if (index === null) {
    return undefined
  }

  const inputs = inputsFor(pathname)
  if (inputs.length === 0) {
    warnOnce(`route:${pathname}`, `no content inputs mapped for ${pathname}: omitting its <lastmod>.`)
    return undefined
  }

  let newest
  for (const input of inputs) {
    const date = index.files.get(input) ?? index.dirs.get(input)
    if (date !== undefined && (newest === undefined || date > newest)) {
      newest = date
    }
  }
  if (newest === undefined) {
    warnOnce(`inputs:${inputs[0]}`, `git knows none of the inputs for ${pathname} (${inputs.join(', ')}).`)
  }
  return newest
}
