// Deep links into a page whose answers are collapsed <details> (/faq/ and the /hpo/ FAQ).
// Two jobs, on load, on every `hashchange`, and on every in-page anchor click:
//  1. A retired anchor is rewritten to its successor through the `aliases` map the caller passes,
//     so old external links and search-engine jump links still land on the right answer instead of
//     silently dropping to the top of the page. A page with no retired anchors passes nothing.
//  2. A question anchor targets a <details>; the browser scrolls to it but leaves it collapsed, so
//     the reader sees only the question. Open it before scrolling.
// Section anchors (`#staking`, `#tokenomics`) are left to the browser.

function decodeAnchor(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function currentAnchor(): string {
  return decodeAnchor(location.hash.slice(1))
}

// The callers already installed in this tab, by their own key (see installDetailsAnchors).
const installed = new Set<string>()

// How the ClientRouter reached the current page: 'traverse' for back/forward. On a traverse the
// router has already restored the reader's scroll position, so the reveal on `astro:page-load` stays
// out of it — otherwise going back to `/hpo/#question` from another app page jumps to the question
// instead of where the reader was. Undefined on a full page load, which reveals as before.
let navigationType: string | undefined
document.addEventListener('astro:before-preparation', (event) => {
  navigationType = (event as Event & { navigationType?: string }).navigationType
})

// `key` names the caller ('hpo', 'faq'): each installs its own listeners once, with its own aliases.
export function installDetailsAnchors(key: string, aliases: Readonly<Record<string, string>> = {}) {
  function reveal(anchor: string, scroll = false) {
    if (anchor === '') return
    const alias = aliases[anchor]
    const id = alias ?? anchor
    const target = document.getElementById(id)
    if (alias !== undefined) {
      // Rewrite the fragment without a second navigation (no history entry, no hashchange loop).
      history.replaceState(history.state, '', `#${id}`)
    }
    if (target === null) return
    const wasClosed = target instanceof HTMLDetailsElement && !target.open
    if (wasClosed) target.open = true
    // The browser already scrolled for a live anchor; re-scroll only when we changed something
    // (an aliased fragment points elsewhere, an opened <details> may shift layout), or when asked to.
    if (alias !== undefined || wasClosed || scroll) target.scrollIntoView({ block: 'start' })
  }

  function revealAnchor() {
    reveal(currentAnchor())
  }

  // Clicking an in-page link whose hash is already the current one fires no `hashchange`, so a
  // collapsed <details> would stay shut. Handle that case here; a different hash is left to the
  // browser's navigation plus the `hashchange` listener below.
  function onAnchorClick(event: MouseEvent) {
    if (event.defaultPrevented) return
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
    if (link === null || link === undefined) return
    // The copy icons (src/scripts/anchor-copy.ts) share the anchor but never navigate.
    if (link.hasAttribute('data-anchor-copy')) return
    const anchor = decodeAnchor(link.hash.slice(1))
    if (anchor === '' || anchor !== currentAnchor()) return
    reveal(anchor)
  }

  // /hpo/ runs under <ClientRouter />, so this module runs once per tab while the page changes under
  // it: `astro:page-load` re-runs the reveal after every in-place switch (and on a direct load).
  // The listeners on window and document are added once per caller, not on every call.
  // After an in-place switch: one frame late, and always scrolling. The incoming page still carries the
  // app's static header shell under the live header until App.tsx removes it on this same event, so a
  // scroll made before that lands 84 px too far once it goes; rAF runs after every page-load listener,
  // so the shell is gone by then. Not on the document's own first page-load: the router fires that one
  // from the window `load` event, after the YouTube embeds, and by then the reader may have scrolled on
  // (the reveal at module load already put them on the question). `readyState` tells the two apart:
  // still loading when this module runs within a full page load, 'complete' when it first runs during
  // an in-place switch — whose `astro:before-preparation` it missed, so `navigationType` can't.
  let documentLoad = document.readyState !== 'complete'
  function onPageLoad() {
    const force = !documentLoad
    documentLoad = false
    if (navigationType === 'traverse') return
    requestAnimationFrame(() => reveal(currentAnchor(), force))
  }

  revealAnchor()
  if (installed.has(key)) return
  installed.add(key)
  document.addEventListener('astro:page-load', onPageLoad)
  window.addEventListener('hashchange', revealAnchor)
  document.addEventListener('click', onAnchorClick)
}
