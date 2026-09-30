// Rehype plugin: gives every heading of a blog post an id and a trailing `#` link to itself, so a
// reader can copy a link to a section. Registered in astro.config.mjs `markdown.rehypePlugins`, which
// is global — it also runs over the docs and the prose collection — so it returns early unless the file
// is under src/content/blog/ (specs/blog-migration.md, Heading anchors).
//
// It runs before Astro's own heading-id pass, which keeps an id that is already set, so the ids made
// here are the ones Astro reports as well. The slugs follow github-slugger's rules (lowercase, Unicode
// letters and digits kept, other punctuation dropped, spaces to hyphens, `-1`/`-2` on repeats) without
// importing it: it is only a transitive dependency of Astro. The link has no text of its own — the `#`
// is painted by CSS (`.heading-anchor` in src/components/blog/Prose.astro) — so it adds nothing to the
// heading's text, and its accessible name comes from aria-label. No dependencies: the tree is walked by
// hand.
import { readFileSync } from 'node:fs'

const BLOG_FILE = /\/src\/content\/blog\//
const HEADING = /^h[2-6]$/
const LABEL = JSON.parse(readFileSync(new URL('../i18n/en/blog.json', import.meta.url), 'utf8'))['blog.anchor.label']

// Ids already spoken for by the page chrome every blog post renders inside (BlogLayout.astro's Header
// and Banner) — seeded into `seen` so a heading slug can never collide with them and steal a
// `document.getElementById` or an in-page `#anchor` link meant for the chrome.
const CHROME_IDS = [
  'mobile-menu',
  'menu-button',
  'site-banner',
  'close-banner',
  'lang-suggest',
  'lang-suggest-text',
  'lang-suggest-dismiss',
]

function textOf(node) {
  if (node.type === 'text') {
    return node.value
  }
  return Array.isArray(node.children) ? node.children.map(textOf).join('') : ''
}

// Returns '' for a heading with no sluggable text (e.g. an image-only or emoji-only heading), which the
// caller treats as "don't anchor this one" rather than minting an empty, collidable id.
function slugify(text, seen) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\s-]/gu, '')
    .replace(/\s/g, '-')
  if (base === '') {
    return ''
  }
  let slug = base
  for (let n = 1; seen.has(slug); n++) {
    slug = `${base}-${n}`
  }
  seen.add(slug)
  return slug
}

function walk(node, seen) {
  if (node.type === 'element' && HEADING.test(node.tagName)) {
    const properties = (node.properties ??= {})
    if (typeof properties.id === 'string' && properties.id !== '') {
      seen.add(properties.id)
    } else {
      const slug = slugify(textOf(node), seen)
      if (slug === '') {
        // No text to slug: leave the heading without an id, and without the anchor link that would
        // otherwise point at `#` (the whole document) instead of the heading.
        return
      }
      properties.id = slug
    }
    node.children.push({
      type: 'element',
      tagName: 'a',
      properties: { className: ['heading-anchor'], href: '#' + properties.id, ariaLabel: LABEL },
      children: [],
    })
    return
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child, seen)
    }
  }
}

export default function rehypeHeadingAnchors() {
  return (tree, file) => {
    const path = String(file.history?.[0] ?? file.path ?? '')
      .split('\\')
      .join('/')
    if (!BLOG_FILE.test(path)) {
      return
    }
    walk(tree, new Set(CHROME_IDS))
  }
}
