// Remark plugin: prefixes root-relative internal links in translated Markdown with the entry's locale
// (spec: specs/multi-language-site.md §G). A file under src/content/docs/<locale>/… or
// src/content/prose/<locale>/… is in that locale; `/docs/x/` and `/stake/` inside it become
// `/fa/docs/x/` and `/fa/stake/`. English (the docs root and prose/en) is left untouched, as are
// external, protocol-relative, hash and relative URLs, URLs already starting with a locale segment,
// asset paths (/docs/images/, /og/, /images/), the English-only /app/ stub and /i18n/ catalogs, and
// file-ish URLs (.png, .pdf, …). No dependencies: the
// tree is walked by hand. Registered in astro.config.mjs `markdown.remarkPlugins`, so it applies to
// both the docs and the prose collection.
import { DEFAULT_LOCALE, isLocaleKey } from './registry.mjs'

const CONTENT_LOCALE = /\/src\/content\/(?:docs|prose)\/([^/]+)\//
const ASSET_PREFIXES = ['/docs/images/', '/og/', '/images/']
// English-only paths that have no localized twin: the legacy /app/ stub and the /i18n/<locale>.json
// catalogs.
const UNLOCALIZED_PREFIXES = ['/app/', '/i18n/']
const FILE_LIKE = /\.(?:png|jpe?g|gif|svg|webp|ico|pdf|rar|zip|txt|xml|json|csv|mp4|webm|woff2?)$/i

function localeOfFile(file) {
  const path = String(file.history?.[0] ?? file.path ?? '')
    .split('\\')
    .join('/')
  const match = CONTENT_LOCALE.exec(path)
  return match !== null && isLocaleKey(match[1]) ? match[1] : DEFAULT_LOCALE
}

function localize(url, locale) {
  if (!url.startsWith('/') || url.startsWith('//')) {
    return url
  }
  const path = url.split(/[?#]/, 1)[0]
  const first = path.split('/')[1] ?? ''
  if (
    isLocaleKey(first) ||
    ASSET_PREFIXES.some((p) => path.startsWith(p)) ||
    UNLOCALIZED_PREFIXES.some((p) => path === p.slice(0, -1) || path.startsWith(p)) ||
    FILE_LIKE.test(path)
  ) {
    return url
  }
  return '/' + locale + url
}

function walk(node, locale) {
  if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
    node.url = localize(node.url, locale)
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child, locale)
    }
  }
}

export default function remarkLocalizeLinks() {
  return (tree, file) => {
    const locale = localeOfFile(file)
    if (locale !== DEFAULT_LOCALE) {
      walk(tree, locale)
    }
  }
}
