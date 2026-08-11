import { observer } from 'mobx-react-lite'

import Header from './Header.tsx'
import OldWalletUpgrade from './OldWalletUpgrade.tsx'
import StakeUnstake from './StakeUnstake.tsx'
import Defi from './Defi.tsx'
import Reward from './Reward.tsx'
import StatsPage from './StatsPage.tsx'
import Wait from './Wait.tsx'
import Stats from './Stats.tsx'
import LoadingIndicator from './LoadingIndicator.tsx'
import ErrorDisplay from './ErrorDisplay.tsx'
// Heebo is the redesign's body face (--font-body in app.css); Fredoka, the display face, comes
// from @fontsource-variable/fredoka, imported once in global.css.
import '@fontsource/heebo/300.css'
import '@fontsource/heebo/400.css'
import '@fontsource/heebo/500.css'
import '@fontsource/heebo/700.css'
import { Model } from './Model'
import { useRef, useEffect } from 'react'
import AmountAlert from './AmountAlert.tsx'
import MultisigGuidance from './MultisigGuidance.tsx'

const App = observer(() => {
  const modelRef = useRef<Model | null>(null)
  if (!modelRef.current) {
    modelRef.current = new Model()
  }
  const model = modelRef.current

  useEffect(() => {
    model.init()
  }, [model])

  let page = (
    <>
      <OldWalletUpgrade model={model} />
      <StakeUnstake model={model} />
      <AmountAlert model={model} />
      <MultisigGuidance model={model} />
      <Stats model={model} />
    </>
  )

  if (model.activePage === 'defi') {
    page = <Defi model={model} />
  } else if (model.activePage === 'reward') {
    page = <Reward model={model} />
  } else if (model.activePage === 'stats') {
    page = <StatsPage model={model} />
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <Header model={model} />
      {page}
      {/* Rendered outside the active page so a pending transaction's modal survives a page
          switch, including browser back/forward, instead of unmounting with the stake widget. */}
      <Wait model={model} />
      <LoadingIndicator model={model} />
      <ErrorDisplay model={model} />
      {/* TonConnect renders its modals here (see tonConnectWidgetRootId in Model.ts). It has to
          be inside the island: its default root is appended to document.body, which the
          ClientRouter replaces on every navigation. */}
      <div id='ton-connect-widget-root'></div>
    </div>
  )
})

export default App
