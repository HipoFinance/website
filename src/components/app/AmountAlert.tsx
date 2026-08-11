import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const AmountAlert = observer(({ model }: Props) => {
  let heading
  let message
  if (model.amountAlert === 'stake-max') {
    heading = 'Insufficient funds'
    message = 'Not enough GRAM in wallet.'
  } else if (model.amountAlert === 'unstake-max') {
    heading = 'Insufficient funds'
    message = 'Not enough hGRAM in wallet.'
  } else if (model.amountAlert === 'instant-unstake-max') {
    heading = 'Insufficient liquidity'
    message = 'Not enough liquidity available for instant unstake.'
  }

  if (model.amountAlert !== 'none') {
    return (
      <div className='font-body text-text fixed top-0 left-0 z-1000 flex h-full w-full overflow-y-auto bg-black/60 p-8'>
        <div className='border-border bg-surface m-auto w-96 max-w-sm rounded-[20px] border p-8 shadow-2xl'>
          <img src='/images/app/warning-dark.svg' alt='' className='m-4 mx-auto h-16' />
          <h1 className='font-fredoka text-center text-xl font-semibold'>{heading}</h1>
          <p className='text-text-muted mt-4 text-center text-sm'>{message}</p>
          <button
            className='bg-accent text-on-accent hover:bg-accent-hover mt-6 h-14 w-full cursor-pointer rounded-2xl text-lg font-semibold'
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
            Okay
          </button>
        </div>
      </div>
    )
  }
})

export default AmountAlert
