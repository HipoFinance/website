import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const LoadingIndicator = observer(({ model }: Props) => {
  return (
    <div
      className={
        'bg-dark-950 bg-opacity-20 dark:bg-opacity-70 pointer-events-none fixed right-5 bottom-20 z-50 w-10 rounded-full sm:bottom-2' +
        (model.ongoingRequests > 0 ? '' : ' hidden')
      }
    >
      <img src='/images/app/loading.svg' className='h-10 animate-spin dark:hidden' />
      <img src='/images/app/loading-dark.svg' className='hidden h-10 animate-spin dark:block' />
    </div>
  )
})

export default LoadingIndicator
