// Click-to-copy for the link icons rendered by src/components/AnchorLink.astro (/faq/ and /hpo/).
//
// The icon is a plain <a href="#id">: without this module it just jumps to the anchor, and a
// modified click (new tab, new window, "copy link address") keeps working. A plain left click is
// what we take over — the reader who hovered the icon wants the shareable URL on their clipboard,
// not another jump to the place they are already reading. The page is deliberately left alone: no
// navigation, no history entry, and inside a <summary> no toggle of the answer.

const FEEDBACK_MS = 1400

const timers = new WeakMap<HTMLElement, number>()

// document.execCommand is deprecated but is the only fallback when the async clipboard is missing
// (any non-secure context — a plain-http preview on the LAN, for instance).
function copyLegacy(text: string): boolean {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '-1000px'
  area.style.opacity = '0'
  document.body.appendChild(area)
  try {
    area.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    area.remove()
  }
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return copyLegacy(text)
  }
}

function flash(link: HTMLElement) {
  const running = timers.get(link)
  if (running !== undefined) clearTimeout(running)
  link.classList.add('is-copied')
  timers.set(
    link,
    window.setTimeout(() => {
      link.classList.remove('is-copied')
      timers.delete(link)
    }, FEEDBACK_MS),
  )
}

async function copyAnchor(link: HTMLAnchorElement) {
  // link.href is already absolute and carries the current path, so the copied URL works from
  // anywhere — including the localized copies of the page.
  const copied = await copy(link.href)
  if (copied) {
    flash(link)
  } else {
    // Nothing reached the clipboard: fall back to the link's normal behaviour so the reader can at
    // least copy the URL out of the address bar.
    location.hash = link.hash
  }
}

function onClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-anchor-copy]')
  if (link === null || link === undefined) return
  // Leave "open in a new tab", middle clicks and the like to the browser.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  void copyAnchor(link)
}

document.addEventListener('click', onClick)
