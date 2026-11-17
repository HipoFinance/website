// Rehype step for the docs home (/docs/ and /<locale>/docs/), turning its Markdown into the landing's
// cards (specs/docs-home-landing.md). Registered in astro.config.mjs `markdown.rehypePlugins`, which is
// global, so it returns early for any file but src/content/docs/index.md and
// src/content/docs/<locale>/index.md.
//
// Each `## heading` and everything up to the next one becomes a <section>: `docs-home-card` when the
// section holds a list, `docs-home-strip` when it does not (the closing "Still have a question?"). The
// sections are wrapped in one `docs-home-cards` grid. In each list item, the text after the first
// " — " goes into `<span class="docs-home-summary">` and the dash is dropped; what comes before it
// (the link, or two links joined by a word) goes into `<span class="docs-home-title">`. What precedes
// the first heading (the risks note) is left as it is.
//
// The heading may be bare or already inside Starlight's `div.sl-heading-wrapper` (its anchor-link step
// may run before or after this one). The step throws — failing the build — on a docs home with no `##`
// heading or a list item with no link: the layout depends on that shape, and a translation that broke
// it would otherwise ship as a half-drawn card. No dependencies: the tree is walked by hand.

// Any locale folder name (two or three letters, optionally a region: `fa`, `pt-br`), never deeper.
const DOCS_HOME = /\/src\/content\/docs\/(?:[a-z]{2,3}(?:-[a-z]{2,4})?\/)?index\.md$/
const DASH = ' — '

const isElement = (node, tag) => node?.type === 'element' && (tag === undefined || node.tagName === tag)
const classesOf = (node) => {
  const value = node.properties?.className
  return Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\s+/) : []
}
const isHeading = (node) =>
  isElement(node, 'h2') ||
  (isElement(node, 'div') &&
    classesOf(node).includes('sl-heading-wrapper') &&
    node.children.some((c) => isElement(c, 'h2')))
const element = (tagName, className, children) => ({ type: 'element', tagName, properties: { className }, children })
const hasLink = (node) => isElement(node, 'a') || (Array.isArray(node.children) && node.children.some(hasLink))

function splitItem(li, file) {
  // A loose list wraps the item in a <p>; the split works on whichever holds the inline content.
  const holder = li.children.find((c) => isElement(c, 'p')) ?? li
  if (!hasLink(holder)) {
    throw new Error(`${file}: a docs-home list item has no link, which the cards need`)
  }
  const index = holder.children.findIndex((c) => c.type === 'text' && c.value.includes(DASH))
  if (index === -1) {
    holder.children = [element('span', ['docs-home-title'], holder.children)]
    return
  }
  const node = holder.children[index]
  const at = node.value.indexOf(DASH)
  const before = node.value.slice(0, at)
  const after = node.value.slice(at + DASH.length)
  const title = [...holder.children.slice(0, index), ...(before ? [{ type: 'text', value: before }] : [])]
  const summary = [...(after ? [{ type: 'text', value: after }] : []), ...holder.children.slice(index + 1)]
  if (!title.some(hasLink)) {
    throw new Error(`${file}: a docs-home list item has its link after the " — ", not before it`)
  }
  holder.children = [element('span', ['docs-home-title'], title), element('span', ['docs-home-summary'], summary)]
}

export default function rehypeDocsHomeCards() {
  return (tree, file) => {
    const path = (file.path ?? file.history?.[0] ?? '').replaceAll('\\', '/')
    if (!DOCS_HOME.test(path)) {
      return
    }
    const children = tree.children
    const first = children.findIndex(isHeading)
    if (first === -1) {
      throw new Error(`${path}: the docs home has no "##" heading, which the landing's cards need`)
    }
    const sections = []
    let current
    for (const node of children.slice(first)) {
      if (isHeading(node)) {
        current = []
        sections.push(current)
      }
      current.push(node)
    }
    const wrapped = sections.map((nodes) => {
      const lists = nodes.filter((n) => isElement(n, 'ul') || isElement(n, 'ol'))
      for (const list of lists) {
        for (const li of list.children.filter((c) => isElement(c, 'li'))) {
          splitItem(li, path)
        }
      }
      return element('section', [lists.length > 0 ? 'docs-home-card' : 'docs-home-strip'], nodes)
    })
    tree.children = [...children.slice(0, first), element('div', ['docs-home-cards', 'not-content'], wrapped)]
  }
}
