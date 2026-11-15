import { observer } from 'mobx-react-lite'
import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react'
import type { TransitionBeforeSwapEvent } from 'astro:transitions/client'
import { isAppPath, Model } from '../Model'
import { openOutside } from './telegram'
import TmaHeader from './TmaHeader.tsx'
import TmaTabs from './TmaTabs.tsx'
import StakeUnstake from '../StakeUnstake.tsx'
import AmountAlert from '../AmountAlert.tsx'
import MultisigGuidance from '../MultisigGuidance.tsx'
import Defi from '../Defi.tsx'
import Reward from '../Reward.tsx'
import StatsPage from '../StatsPage.tsx'
import ClubLoader from '../ClubLoader.tsx'

interface Props {
  model: Model
}

// The mini-app shell: exactly one viewport tall (see `.tma-shell` in app.css), with the header and
// the tab row as fixed-size rows and one scroller between them. Document scrolling is off in this
// mode, which is what keeps Telegram's pull-to-close gesture from fighting the form.
//
// Reward / Stats / DeFi keep their existing responsive components; the stake form is the web one with
// Mini App adjustments (specs/mini-app-stake-form-unified.md). HPO shows the website's own static page
// (specs/mini-app-hpo-tab.md).
const TmaApp = observer(({ model }: Props) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const activePage = model.activePage
  const activeTab = model.activeTab

  // The HPO tab: the page's static <main> (Hpo.astro, in AppLayout's hidden [data-tma-content] slot)
  // is moved into the host, not copied, so its scripts keep their elements. A swap that stays on HPO
  // (a language switch) brings a new <main>, hence after-swap. Before every swap the host is emptied:
  // the persisted island carries its DOM into the next document, and a stale #hpoPrice there would
  // sit ahead of the new one and catch the scripts.
  useLayoutEffect(() => {
    const host = hostRef.current
    if (activePage !== 'hpo' || host == null) {
      return
    }
    const adopt = () => {
      const main = document.querySelector('[data-tma-content] > main')
      if (main != null) {
        host.replaceChildren(main)
      }
    }
    const empty = () => {
      host.replaceChildren()
    }
    adopt()
    document.addEventListener('astro:after-swap', adopt)
    document.addEventListener('astro:before-swap', empty)
    return () => {
      document.removeEventListener('astro:after-swap', adopt)
      document.removeEventListener('astro:before-swap', empty)
      // Left without a swap (the Telegram chrome revoked): the content goes back to the page.
      const main = host.querySelector(':scope > main')
      const slot = document.querySelector('[data-tma-content]')
      if (main != null && slot != null && slot.querySelector(':scope > main') == null) {
        slot.append(main)
      }
    }
  }, [activePage])

  // A link off the app opens outside the mini app, on every screen (the stake form's rates and chat
  // links, Stats' sources, DeFi's services, the Club, the HPO tab): Telegram's webview ignores a
  // target=_blank link to another site, and a link that navigated in place would replace the mini app
  // with a page that has no tabs and no way back — another site, or a page of this one without the app
  // (the docs, /faq/, /blog/). Links to app pages (and #anchors on this one) stay in place. A capture
  // handler on the shell, so it runs before the links' own handlers and before the ClientRouter's
  // document listener, which skips a click whose default is prevented. TonConnect's window lives
  // outside the shell and keeps its own links. A modified click (only possible in the ?tma=1 preview)
  // is left to the browser.
  const onLinkClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    const anchor = (event.target as Element).closest('a[href]')
    if (!(anchor instanceof HTMLAnchorElement)) {
      return
    }
    const url = new URL(anchor.href)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return
    }
    if (url.origin === window.location.origin && isAppPath(url.pathname)) {
      return
    }
    event.preventDefault()
    openOutside(model.tmaMode, url.href)
  }

  // The ClientRouter restores window scroll, not ours, so reset the inner scroller by hand when
  // the page changes — otherwise the stake form opens halfway down after a long Stats page.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [activePage, activeTab])

  // No HPO videos in the Mini App: a hidden iframe still downloads, so the section leaves the incoming
  // document before the swap inserts it (Hpo.astro's inline script covers a full page load). On every
  // swap, since it arrives from Stake or Stats too, where this tab is not yet open.
  useEffect(() => {
    const dropVideos = (event: Event) => {
      ;(event as TransitionBeforeSwapEvent).newDocument.getElementById('watch')?.remove()
    }
    document.addEventListener('astro:before-swap', dropVideos)
    return () => {
      document.removeEventListener('astro:before-swap', dropVideos)
    }
  }, [])

  const onStakePage = activePage === 'stake'

  let page = (
    <>
      <StakeUnstake model={model} />
    </>
  )

  if (activePage === 'defi') {
    page = <Defi model={model} />
  } else if (activePage === 'reward') {
    page = <Reward model={model} />
  } else if (activePage === 'club') {
    // The Club's four tabs sit at the top of the page as a segmented row, the same component as on
    // the web (specs/club-website.md §10, Open question 1 (a)); the bottom row stays Stake · Club ·
    // Stats · HPO.
    page = <ClubLoader model={model} />
  } else if (activePage === 'stats') {
    page = <StatsPage model={model} />
  } else if (activePage === 'hpo') {
    // No React children: the effect above fills it.
    page = <div ref={hostRef} />
  }

  return (
    <div className='tma-shell font-body text-text flex flex-col overflow-hidden' onClickCapture={onLinkClick}>
      <TmaHeader model={model} />
      <div ref={bodyRef} className='flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain'>
        {page}
      </div>
      <TmaTabs model={model} />
      {/* Both are fixed overlays driven by the stake flow, so they sit outside the scroller — same
          arrangement as the desktop chrome, where they are siblings of the form rather than part
          of it. */}
      {onStakePage && <AmountAlert model={model} />}
      {onStakePage && <MultisigGuidance model={model} />}
    </div>
  )
})

export default TmaApp
