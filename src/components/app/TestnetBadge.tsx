import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const TestnetBadge = observer(({ model }: Props) => {
  return (
    <>
      <p className={'font-logo text-orange ml-3 text-2xl' + (model.isMainnet ? '' : ' hidden')}>Hipo</p>
      <div
        className={
          'bg-orange dark:text-dark-600 ml-2 h-fit rounded-full px-2 py-1 text-xs text-white uppercase' +
          (model.isMainnet ? ' hidden' : '')
        }
      >
        testnet
      </div>
    </>
  )
})

export default TestnetBadge
