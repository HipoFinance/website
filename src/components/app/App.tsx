import { observer } from 'mobx-react-lite'

import Header from './Header.tsx'
import OldWalletUpgrade from './OldWalletUpgrade.tsx'
import StakeUnstake from './StakeUnstake.tsx'
import Defi from './Defi.tsx'
import Reward from './Reward.tsx'
import StatsPage from './StatsPage.tsx'
import Wait from './Wait.tsx'
import Stats from './Stats.tsx'
import Footer from './Footer.tsx'
import LoadingIndicator from './LoadingIndicator.tsx'
import ErrorDisplay from './ErrorDisplay.tsx'
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/700.css'
import '@fontsource/eczar/800.css'
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
    <>
      <Header model={model} />
      {page}
      {/* Rendered outside the active page so a pending transaction's modal survives a page
          switch, including browser back/forward, instead of unmounting with the stake widget. */}
      <Wait model={model} />
      <Footer />
      <LoadingIndicator model={model} />
      <ErrorDisplay model={model} />
      {/* TonConnect renders its modals here (see tonConnectWidgetRootId in Model.ts). It has to
          be inside the island: its default root is appended to document.body, which the
          ClientRouter replaces on every navigation. */}
      <div id='ton-connect-widget-root'></div>
    </>
  )
})

export default App
