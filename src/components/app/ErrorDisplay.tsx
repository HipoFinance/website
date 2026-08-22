import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const ErrorDisplay = observer(({ model }: Props) => {
  return (
    <div
      className={
        'font-body bg-accent-fill text-on-accent fixed bottom-20 left-6 z-50 flex max-w-screen-sm rounded-2xl p-2 drop-shadow sm:bottom-2' +
        (model.errorMessage === '' ? ' hidden' : '')
      }
    >
      <img src='/images/app/error.svg' alt='' className='h-6' />
      <p className='mx-1'>{model.errorMessage}</p>
    </div>
  )
})

export default ErrorDisplay
