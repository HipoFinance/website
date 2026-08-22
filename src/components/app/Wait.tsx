import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const Wait = observer(({ model }: Props) => {
  let img
  let progress
  let heading
  let message
  let button
  if (model.waitForTransaction === 'signed' || model.waitForTransaction === 'sent') {
    const sent = model.waitForTransaction === 'sent'
    img = <img src='/images/app/loading-dark.svg' alt='' className='m-4 mx-auto h-16 animate-spin' />
    progress = (
      <div className='border-border my-4 w-full overflow-hidden rounded-full border'>
        <div className={'bg-accent-fill h-1' + (sent ? ' w-1/2' : ' w-1/6')}></div>
      </div>
    )
    heading = <h1 className='font-fredoka text-center text-xl font-semibold'>Finalizing your transaction</h1>
    message = (
      <p className='text-text-muted mt-4 text-center text-sm'>
        Awaiting the processing of your transaction in the next block.
      </p>
    )
  } else if (model.waitForTransaction === 'timeout') {
    img = <img src='/images/app/warning-dark.svg' alt='' className='m-4 mx-auto h-16' />
    progress = <></>
    heading = <h1 className='font-fredoka text-center text-xl font-semibold'>Cannot find your transaction</h1>
    message = (
      <p className='text-text-muted mt-4 text-center text-sm'>Despite multiple attempts, we could not locate it.</p>
    )
    button = (
      <button
        className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover mt-6 h-14 w-full cursor-pointer rounded-2xl text-lg font-semibold'
        onClick={() => {
          model.setWaitForTransaction('no')
        }}
      >
        Okay
      </button>
    )
  } else if (model.waitForTransaction === 'done') {
    img = <img src='/images/app/logo-dark.svg' alt='' className='m-4 mx-auto h-32' />
    progress = <></>
    heading = (
      <h1 className='font-fredoka text-center text-xl font-semibold'>
        Successfully {model.isStakeTabActive ? 'staked' : 'unstaked'}
      </h1>
    )
    button = (
      <button
        className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover mt-6 h-14 w-full cursor-pointer rounded-2xl text-lg font-semibold'
        onClick={() => {
          model.setWaitForTransaction('no')
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
    )
  }

  if (model.waitForTransaction !== 'no') {
    return (
      <div className='font-body text-text fixed top-0 left-0 z-1000 flex h-full w-full overflow-y-auto bg-black/60 p-8'>
        <div className='border-border bg-surface m-auto w-96 max-w-sm rounded-[20px] border p-8 shadow-2xl'>
          {img}
          {progress}
          {heading}
          {message}
          {button}
        </div>
      </div>
    )
  }
})

export default Wait
