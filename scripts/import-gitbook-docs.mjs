#!/usr/bin/env node
// One-time importer that pulls the Hipo documentation out of GitBook and writes it into this
// repository as Starlight content. See specs/gitbook-docs-migration.md.
//
//   node scripts/import-gitbook-docs.mjs
//
// It is idempotent: it wipes and rewrites src/content/docs/ and public/docs/images/ on every run,
// so it can be re-run to pick up GitBook edits before cutover. After cutover the generated Markdown
// is the source of truth and this script is kept only for reference.

import { existsSync, readdirSync, statSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { isLocaleKey } from '../src/i18n/registry.mjs'

const SITE = 'https://docs.hipo.finance'
const OUT_CONTENT = 'src/content/docs'
const OUT_ASSETS = 'public/docs/images'
const ASSET_URL_BASE = '/docs/images'

// The GitBook home page and this page are the same document; it becomes /docs/.
const HOME_PATH = '/introduction/hipo-liquid-staking-protocol'

// Links in the corpus that point at paths GitBook no longer serves, but which still have a
// documentation page under a different path.
const LINK_FIXUPS = {
  '/hipo-tokens/hipo-staked-ton-hton': '/hipo-tokens/hipo-staked-gram-hgram',
  '/introduction/hpo-hipo-governance-token/hpo-tokens-distribution':
    '/hipo-tokens/hipo-governance-token-hpo/hpo-tokens-distribution',
}

// Stale links to GitBook's retired "frequently-asked-questions" section. It has no equivalent under
// /docs/; the questions are answered by the site's own FAQ page. Left unrewritten these would 404
// once docs.hipo.finance starts wildcard-redirecting into /docs/.
const EXTERNAL_FIXUPS = {
  '/frequently-asked-questions/what-is-apy': '/faq/',
  '/frequently-asked-questions/what-is-the-expected-timeframe-for-receiving-my-ton-after-unstaking': '/faq/',
}

const HINT_TO_ASIDE = { info: 'note', success: 'tip', warning: 'caution', danger: 'danger' }

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return res.text()
}

/** Parse llms.txt into the ordered page list. Format: `- [Title](url.md): optional description` */
function parseIndex(llms) {
  const re = /^- \[([^\]]*)\]\((https:\/\/docs\.hipo\.finance\/[^)]+)\.md\)(?::\s*(.*))?$/gm
  return [...llms.matchAll(re)].map((m) => ({
    indexTitle: m[1].trim(),
    path: m[2].replace(SITE, ''),
    description: (m[3] || '').trim(),
  }))
}

/**
 * Pull the content-image URLs out of a rendered GitBook page, in document order.
 *
 * GitBook proxies images through `/~gitbook/image?url=<encoded CDN url>` and emits each one many
 * times over (one per srcset width/dpr variant), then repeats the whole run inside the RSC payload.
 * Site chrome (`/icon/`, `/socialpreview/`) lives outside `/uploads/` and is filtered out.
 */
function extractImageUrls(html) {
  const seq = []
  for (const m of html.matchAll(/~gitbook\/image\?url=([^"'&\\<>\s]+)/g)) {
    let url
    try {
      url = decodeURIComponent(m[1])
    } catch {
      continue
    }
    if (!url.includes('uploads')) continue
    if (seq.at(-1) !== url) seq.push(url) // collapse the srcset variant runs
  }
  return seq
}

/** Reconcile the extracted URL sequence against the number of <img> refs in the Markdown. */
function reconcile(seq, want, path) {
  if (seq.length === want) return seq
  // The RSC payload repeats the document run verbatim; keep the first copy.
  if (want > 0 && seq.length % want === 0) {
    const head = seq.slice(0, want).join('|')
    let uniform = true
    for (let i = 0; i < seq.length; i += want) {
      if (seq.slice(i, i + want).join('|') !== head) uniform = false
    }
    if (uniform) return seq.slice(0, want)
  }
  const uniq = [...new Set(seq)]
  if (uniq.length === want) return uniq
  throw new Error(
    `${path}: cannot map images — markdown has ${want} <img> refs but the page yielded ` +
      `${seq.length} url(s) (${uniq.length} unique). Refusing to guess.`,
  )
}

/** Direct CDN links for {% file %} attachments (these are not routed through /~gitbook/image). */
function extractAttachmentUrls(html) {
  const seq = []
  for (const m of html.matchAll(/https:\/\/\d+-files\.gitbook\.io\/[^"'\\<>\s]+/g)) {
    const url = m[0].replace(/\\u0026/g, '&').replace(/&amp;/g, '&')
    if (!url.includes('uploads')) continue
    if (!seq.includes(url)) seq.push(url)
  }
  return seq
}

const slugify = (path) => path.replace(/^\//, '').replace(/\//g, '-') || 'index'

function assetName(pageSlug, index, url) {
  const file = decodeURIComponent(url.split('?')[0]).split('/').pop() || ''
  const ext = (file.match(/\.([a-z0-9]+)$/i)?.[1] || 'png').toLowerCase()
  return `${pageSlug}-${index + 1}.${ext}`
}

function youtubeId(url) {
  return url.match(/youtu\.be\/([\w-]+)/)?.[1] ?? url.match(/[?&]v=([\w-]+)/)?.[1] ?? null
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function embedHtml(url, caption) {
  const id = youtubeId(url)
  if (!id) return `[${caption || url}](${url})`
  const title = escapeAttr(caption || 'Hipo video')
  return (
    `<iframe class="docs-embed" src="https://www.youtube-nocookie.com/embed/${id}" ` +
    `title="${title}" loading="lazy" frameborder="0" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
    `allowfullscreen></iframe>`
  )
}

/** Map a GitBook doc path to its URL on hipo.finance. */
function docHref(rawPath, knownPaths) {
  let path = rawPath.replace(/\.md$/, '').replace(/\/$/, '')
  if (EXTERNAL_FIXUPS[path]) return EXTERNAL_FIXUPS[path]
  path = LINK_FIXUPS[path] ?? path
  if (path === '' || path === HOME_PATH) return '/docs/'
  if (!knownPaths.has(path)) return null
  return `/docs${path}/`
}

function transform(md, page, ctx) {
  let out = md

  // GitBook injects an llms.txt pointer as the first blockquote of every page.
  out = out.replace(/^>\s*For the complete documentation index[\s\S]*?(?:\n\s*\n|$)/, '')

  // The first H1 becomes frontmatter `title`; Starlight renders it as the page heading.
  const h1 = out.match(/^#[^#].*$/m)
  const title = h1 ? h1[0].replace(/^#\s*/, '').trim() : page.indexTitle
  if (h1) out = out.replace(h1[0], '')

  // Callouts -> Starlight asides.
  out = out.replace(
    /\{%\s*hint\s+style="(\w+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g,
    (_, style, body) => `:::${HINT_TO_ASIDE[style] ?? 'note'}\n${body.trim()}\n:::`,
  )

  // Video embeds -> plain iframes (paired form first, then the self-closing form).
  out = out.replace(/\{%\s*embed\s+url="<?([^">]+?)>?"\s*%\}([\s\S]*?)\{%\s*endembed\s*%\}/g, (_, url, caption) =>
    embedHtml(url, caption.trim()),
  )
  out = out.replace(/\{%\s*embed\s+url="<?([^">]+?)>?"\s*%\}/g, (_, url) => embedHtml(url, ''))

  // Rewrite internal links before any local asset paths are introduced.
  out = out.replace(/\]\((https:\/\/docs\.hipo\.finance)?(\/[^)\s]*)\)/g, (match, host, path) => {
    if (!host && !/\.md$|^\/(introduction|security|tutorials|hipo-|dao|profit-|giveaways-|legal-|brand-)/.test(path)) {
      return match // a genuinely site-relative link that isn't a doc page
    }
    const href = docHref(path, ctx.knownPaths)
    return href ? `](${href})` : match
  })
  out = out.replace(/\]\(https:\/\/docs\.hipo\.finance\/?\)/g, '](/docs/)')

  // Attachments -> download links.
  let fileIndex = 0
  out = out.replace(
    /\{%\s*file\s+src="\/files\/\w+"\s*%\}/g,
    () => `[Download ${ctx.attachments[fileIndex].label}](${ctx.attachments[fileIndex++].href})`,
  )

  // Figure images -> local assets, paired positionally with the extracted URLs.
  let imgIndex = 0
  out = out.replace(/(<img\s+src=")\/files\/\w+(")/g, (_, a, b) => a + ctx.images[imgIndex++] + b)

  // GitBook colour spans have no Starlight equivalent; keep the text, drop the wrapper.
  out = out.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/g, '$1')
  out = out.replace(/&#x20;/g, ' ')

  out = out.replace(/\n{3,}/g, '\n\n').trim()

  const frontmatter = ['---', `title: ${JSON.stringify(title)}`]
  if (page.description) frontmatter.push(`description: ${JSON.stringify(page.description)}`)
  frontmatter.push('---', '')

  return frontmatter.join('\n') + '\n' + out + '\n'
}

// Translated docs live at src/content/docs/<locale>/ (specs/multi-language-site.md §G). This importer
// wipes src/content/docs/ wholesale, so it must never run once any locale directory exists there.
function refuseIfTranslationsExist() {
  if (!existsSync(OUT_CONTENT)) return
  const locales = readdirSync(OUT_CONTENT).filter(
    (name) => isLocaleKey(name) && statSync(join(OUT_CONTENT, name)).isDirectory(),
  )
  if (locales.length > 0) {
    console.error(
      `Refusing to run: ${OUT_CONTENT}/ contains translated docs (${locales.join(', ')}); ` +
        'this importer would delete them. The Markdown in this repo is the source of truth now.',
    )
    process.exit(1)
  }
}

async function main() {
  refuseIfTranslationsExist()
  const pages = parseIndex(await fetchText(`${SITE}/llms.txt`))
  if (pages.length === 0) throw new Error('llms.txt yielded no pages')
  console.log(`Found ${pages.length} pages in llms.txt`)

  const knownPaths = new Set(pages.map((p) => p.path))

  await rm(OUT_CONTENT, { recursive: true, force: true })
  await rm(OUT_ASSETS, { recursive: true, force: true })
  await mkdir(OUT_ASSETS, { recursive: true })

  const labels = new Map() // sidebar labels (with emoji), for building the astro.config sidebar
  let imageCount = 0
  let attachmentCount = 0

  for (const page of pages) {
    const [md, html] = await Promise.all([fetchText(`${SITE}${page.path}.md`), fetchText(`${SITE}${page.path}`)])

    for (const m of html.matchAll(/href="(\/[a-z0-9/-]*)"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/a>/g)) {
      const text = m[2].replace(/<[^>]+>/g, '').trim()
      if (text && !labels.has(m[1])) labels.set(m[1], text)
    }

    const pageSlug = slugify(page.path)
    const wantImages = (md.match(/<img\s+src="\/files\//g) || []).length
    const wantFiles = (md.match(/\{%\s*file\s+src="\/files\//g) || []).length

    const imageUrls = reconcile(extractImageUrls(html), wantImages, page.path)
    const images = []
    for (const [i, url] of imageUrls.entries()) {
      const name = assetName(pageSlug, i, url)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
      const bytes = Buffer.from(await res.arrayBuffer())
      if (bytes.length === 0) throw new Error(`${page.path}: empty asset ${url}`)
      await writeFile(join(OUT_ASSETS, name), bytes)
      images.push(`${ASSET_URL_BASE}/${name}`)
      imageCount++
    }

    const attachments = []
    if (wantFiles > 0) {
      const candidates = extractAttachmentUrls(html).filter((u) => !imageUrls.includes(u))
      if (candidates.length < wantFiles) {
        throw new Error(
          `${page.path}: markdown has ${wantFiles} {% file %} ref(s) but only ` +
            `${candidates.length} attachment url(s) were found.`,
        )
      }
      for (const [i, url] of candidates.slice(0, wantFiles).entries()) {
        // The object path is percent-encoded (`o/spaces%2F…%2FName.rar`), so decode before splitting.
        const label = decodeURIComponent(url.split('?')[0]).split('/').pop() || 'file'
        const name = assetName(`${pageSlug}-file`, i, url)
        const res = await fetch(url)
        if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
        const bytes = Buffer.from(await res.arrayBuffer())
        if (bytes.length === 0) throw new Error(`${page.path}: empty attachment ${url}`)
        await writeFile(join(OUT_ASSETS, name), bytes)
        attachments.push({ label, href: `${ASSET_URL_BASE}/${name}` })
        attachmentCount++
      }
    }

    const body = transform(md, page, { knownPaths, images, attachments })

    const rel = page.path === HOME_PATH ? 'index.md' : `${page.path.replace(/^\//, '')}.md`
    const dest = join(OUT_CONTENT, rel)
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, body)

    const extras = [wantImages && `${wantImages} img`, wantFiles && `${wantFiles} file`].filter(Boolean)
    console.log(`  ${rel}${extras.length ? `  (${extras.join(', ')})` : ''}`)
  }

  console.log(`\nWrote ${pages.length} pages, ${imageCount} images, ${attachmentCount} attachments.`)
  console.log('\nSidebar labels (for astro.config.mjs):')
  for (const [href, label] of labels) {
    if (href === '/' || !knownPaths.has(href.replace(/\/$/, ''))) continue
    console.log(`  ${href}  ->  ${label}`)
  }
}

await main()
