import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const AmountAlert = observer(({ model }: Props) => {
  let heading
  let message
  if (model.amountAlert === 'stake-max') {
    heading = <h1 className='text-center text-xl font-bold'>Insufficient Funds</h1>
    message = <p className='mt-4 text-center'>You don't have enough GRAM in your wallet.</p>
  } else if (model.amountAlert === 'unstake-max') {
    heading = <h1 className='text-center text-xl font-bold'>Insufficient Funds</h1>
    message = <p className='mt-4 text-center'>You don't have enough hGRAM in your wallet.</p>
  } else if (model.amountAlert === 'instant-unstake-max') {
    heading = <h1 className='text-center text-xl font-bold'>More Than Available Now</h1>
    message = <p className='mt-4 text-center'>This amount is more than instantly available amount to unstake.</p>
  }

  if (model.amountAlert !== 'none') {
    return (
      <div
        className={
          'text-brown dark:text-dark-50 fixed top-0 left-0 z-1000 flex h-full w-full overflow-y-auto bg-black/40 p-8'
        }
      >
        <div className='bg-milky dark:bg-dark-700 m-auto w-96 max-w-sm rounded-3xl p-8 shadow-2xl'>
          <div>
            <img src='/images/app/warning.svg' className='m-4 mx-auto h-16 dark:hidden' />
            <img src='/images/app/warning-dark.svg' className='m-4 mx-auto hidden h-16 dark:block' />
          </div>
          {heading}
          {message}
          <button
            className='bg-orange dark:text-dark-600 mt-4 h-14 w-full rounded-2xl text-lg font-medium text-white'
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
