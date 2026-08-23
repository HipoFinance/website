import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const LoadingIndicator = observer(({ model }: Props) => {
  return (
    <div
      className={
        'bg-surface-deep/70 pointer-events-none fixed end-5 bottom-20 z-50 w-10 rounded-full sm:bottom-2' +
        (model.ongoingRequests > 0 ? '' : ' hidden')
      }
    >
      <img src='/images/app/loading-dark.svg' alt='' className='h-10 animate-spin' />
    </div>
  )
})

export default LoadingIndicator
