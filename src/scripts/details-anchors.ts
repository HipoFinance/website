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

export function installDetailsAnchors(aliases: Readonly<Record<string, string>> = {}) {
  function reveal(anchor: string) {
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
    // (an aliased fragment points elsewhere, an opened <details> may shift layout).
    if (alias !== undefined || wasClosed) target.scrollIntoView({ block: 'start' })
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

  // LandingLayout and HpoLayout have no <ClientRouter />, so this module runs fresh on every full
  // page load; the `astro:page-load` listener is a harmless no-op today and keeps the behaviour if
  // a router is added.
  revealAnchor()
  document.addEventListener('astro:page-load', revealAnchor)
  window.addEventListener('hashchange', revealAnchor)
  document.addEventListener('click', onAnchorClick)
}
