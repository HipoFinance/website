import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { Model } from '../Model'
import TmaHeader from './TmaHeader.tsx'
import TmaTabs from './TmaTabs.tsx'
import TmaStakeUnstake from './TmaStakeUnstake.tsx'
import OldWalletUpgrade from '../OldWalletUpgrade.tsx'
import AmountAlert from '../AmountAlert.tsx'
import MultisigGuidance from '../MultisigGuidance.tsx'
import Defi from '../Defi.tsx'
import Reward from '../Reward.tsx'
import StatsPage from '../StatsPage.tsx'

interface Props {
  model: Model
}

// The mini-app shell: exactly one viewport tall (see `.tma-shell` in app.css), with the header and
// the tab row as fixed-size rows and one scroller between them. Document scrolling is off in this
// mode, which is what keeps Telegram's pull-to-close gesture from fighting the form.
//
// Reward / Stats / DeFi keep their existing responsive components; only the stake form has a
// phone-specific layout.
const TmaApp = observer(({ model }: Props) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const activePage = model.activePage
  const activeTab = model.activeTab

  // The ClientRouter restores window scroll, not ours, so reset the inner scroller by hand when
  // the page changes — otherwise the stake form opens halfway down after a long Stats page.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [activePage, activeTab])

  const onStakePage = activePage === 'stake'

  let page = (
    <>
      <OldWalletUpgrade model={model} />
      <TmaStakeUnstake model={model} />
    </>
  )

  if (activePage === 'defi') {
    page = <Defi model={model} />
  } else if (activePage === 'reward') {
    page = <Reward model={model} />
  } else if (activePage === 'stats') {
    page = <StatsPage model={model} />
  }

  return (
    <div className='tma-shell font-body text-text flex flex-col overflow-hidden'>
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
