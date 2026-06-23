import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const ErrorDisplay = observer(({ model }: Props) => {
  return (
    <div
      className={
        'bg-orange dark:text-dark-600 fixed bottom-20 left-6 flex max-w-screen-sm rounded-2xl p-2 text-white drop-shadow sm:bottom-2' +
        (model.errorMessage === '' ? ' hidden' : '')
      }
    >
      <img src='/images/app/error.svg' className='h-6 dark:hidden' />
      <img src='/images/app/error-dark.svg' className='hidden h-6 dark:block' />
      <p className='mx-1'>{model.errorMessage}</p>
    </div>
  )
})

export default ErrorDisplay
