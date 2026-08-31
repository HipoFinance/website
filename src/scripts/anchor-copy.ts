// Click-to-copy, in two flavours, sharing one clipboard core.
//
//  * `a[data-anchor-copy]` — the link icons rendered by src/components/AnchorLink.astro (/faq/ and
//    /hpo/), which copy the heading's absolute URL. Described below.
//  * `[data-copy-text]` — anything that copies the literal text in that attribute. /verify/ uses it
//    for the raw wallet addresses, where what the reader wants on the clipboard is the string
//    itself, not a URL.
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

async function copyLiteral(button: HTMLElement) {
  const text = button.dataset.copyText ?? ''
  // Nothing to fall back to when the clipboard is unavailable: the text is already on the page and
  // selectable, so a silent no-op leaves the reader exactly where they were.
  if (text !== '' && (await copy(text))) {
    flash(button)
  }
}

function onClick(event: MouseEvent) {
  const target = (event.target as Element | null) ?? null
  if (target === null) return

  const button = target.closest<HTMLElement>('[data-copy-text]')
  if (button !== null) {
    void copyLiteral(button)
    return
  }

  const link = target.closest<HTMLAnchorElement>('a[data-anchor-copy]')
  if (link === null) return
  // Leave "open in a new tab", middle clicks and the like to the browser.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  void copyAnchor(link)
}

document.addEventListener('click', onClick)
