import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const AmountAlert = observer(({ model }: Props) => {
  const t = model.t
  let heading
  let message
  if (model.amountAlert === 'stake-max') {
    heading = t('app.amountAlert.insufficientFunds')
    message = t('app.amountAlert.notEnoughGram')
  } else if (model.amountAlert === 'unstake-max') {
    heading = t('app.amountAlert.insufficientFunds')
    message = t('app.amountAlert.notEnoughHgram')
  } else if (model.amountAlert === 'instant-unstake-max') {
    heading = t('app.amountAlert.insufficientLiquidity')
    message = t('app.amountAlert.notEnoughLiquidity')
  }

  if (model.amountAlert !== 'none') {
    return (
      <div className='font-body text-text fixed start-0 top-0 z-1000 flex h-full w-full overflow-y-auto bg-black/60 p-8'>
        <div className='border-border bg-surface m-auto w-96 max-w-sm rounded-[20px] border p-8 shadow-2xl'>
          <img src='/images/app/warning-dark.svg' alt='' className='m-4 mx-auto h-16' />
          <h1 className='font-fredoka text-center text-xl font-semibold'>{heading}</h1>
          <p className='text-text-muted mt-4 text-center text-sm'>{message}</p>
          <button
            className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover mt-6 h-14 w-full cursor-pointer rounded-2xl text-lg font-semibold'
            onClick={() => {
              model.setAmountAlert('none')
              const amountEl = document.querySelector<HTMLInputElement>('#amount')
              if (amountEl != null) {
                amountEl.focus()
              }
            }}
            onKeyDown={(e) => {
              if (e.key == 'Escape') {
                const button = e.target as HTMLButtonElement
                button.click()
              }
            }}
            autoFocus
          >
            {t('app.common.okay')}
          </button>
        </div>
      </div>
    )
  }
})

export default AmountAlert
