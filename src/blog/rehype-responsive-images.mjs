// Rehype plugin: gives every in-body blog image explicit `widths`/`sizes` so Astro's built-in markdown
// image pipeline (@astrojs/markdown-remark's rehypeImages, which reads these same hast properties and
// runs right after this plugin — see astro.config.mjs) emits a real srcset instead of the single
// ~1600px WebP it produces when an <img> carries no size hints. Scoped to blog posts only, the same way
// rehype-heading-anchors.mjs is, so /docs/ and the prose collection are untouched — a *global*
// `image.layout`/`image.widths` config would apply to every <Image>/<Picture> on the site, including
// ones that already set their own widths, which is the behaviour change specs/blog-migration.md rules
// out.
//
// The values mirror the hero <Picture> in src/pages/blog/[slug]/index.astro: the article column is
// `max-w-[760px]` with `px-6`/`md:px-12` padding, so a body image never renders wider than 664px
// (`sizes` below is copied from the hero for the same reason), and the largest requested width is
// 1520 = 760 * 2, i.e. a 2x-density screen at the column's own (unpadded) max width.
const BLOG_FILE = /\/src\/content\/blog\//
const WIDTHS = [480, 760, 1140, 1520]
const SIZES = '(min-width: 760px) 664px, calc(100vw - 48px)'

function walk(node) {
  if (node.type === 'element' && node.tagName === 'img') {
    const properties = (node.properties ??= {})
    properties.widths = WIDTHS
    properties.sizes = SIZES
    return
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child)
    }
  }
}

export default function rehypeResponsiveImages() {
  return (tree, file) => {
    const path = String(file.history?.[0] ?? file.path ?? '')
      .split('\\')
      .join('/')
    if (!BLOG_FILE.test(path)) {
      return
    }
    walk(tree)
  }
}
