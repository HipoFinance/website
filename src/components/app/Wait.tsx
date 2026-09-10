import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const Wait = observer(({ model }: Props) => {
  const t = model.t
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
    heading = <h1 className='font-fredoka text-center text-xl font-semibold'>{t('app.wait.finalizingTitle')}</h1>
    message = <p className='text-text-muted mt-4 text-center text-sm'>{t('app.wait.finalizingMessage')}</p>
  } else if (model.waitForTransaction === 'timeout' || model.waitForTransaction === 'unreachable') {
    // Same shape, different claim. 'timeout' means the chain was answering and the transaction never
    // showed up; 'unreachable' means we never got to look, so it may well have gone through — and
    // saying otherwise on a screen about someone's money is the mistake worth avoiding here.
    const unreachable = model.waitForTransaction === 'unreachable'
    img = <img src='/images/app/warning-dark.svg' alt='' className='m-4 mx-auto h-16' />
    progress = <></>
    heading = (
      <h1 className='font-fredoka text-center text-xl font-semibold'>
        {t(unreachable ? 'app.wait.unreachableTitle' : 'app.wait.timeoutTitle')}
      </h1>
    )
    message = (
      <p className='text-text-muted mt-4 text-center text-sm'>
        {t(unreachable ? 'app.wait.unreachableMessage' : 'app.wait.timeoutMessage')}
      </p>
    )
    button = (
      <button
        className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover mt-6 h-14 w-full cursor-pointer rounded-2xl text-lg font-semibold'
        onClick={() => {
          model.setWaitForTransaction('no')
        }}
      >
        {t('app.common.okay')}
      </button>
    )
  } else if (model.waitForTransaction === 'rejected') {
    // The instant unstake rolled back for want of liquidity. Nothing moved, and the balance is
    // exactly as it was — which is the opposite of what this screen used to say here.
    img = <img src='/images/app/warning-dark.svg' alt='' className='m-4 mx-auto h-16' />
    progress = <></>
    heading = <h1 className='font-fredoka text-center text-xl font-semibold'>{t('app.wait.rejectedTitle')}</h1>
    message = <p className='text-text-muted mt-4 text-center text-sm'>{t('app.wait.rejectedMessage')}</p>
    button = (
      <button
        className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover mt-6 h-14 w-full cursor-pointer rounded-2xl text-lg font-semibold'
        onClick={() => {
          model.setWaitForTransaction('no')
        }}
      >
        {t('app.common.okay')}
      </button>
    )
  } else if (model.waitForTransaction === 'done' || model.waitForTransaction === 'queued') {
    // 'queued' is a bill: the request is accepted and pays out when the round settles. That is
    // what the Full unstake option asks for, so it is the ordinary outcome there rather than an
    // edge case — and it is not the same claim as 'done', which means the value has moved.
    const stake = model.waitKind === 'stake'
    const queued = model.waitForTransaction === 'queued'
    img = <img src='/images/app/logo-dark.svg' alt='' className='m-4 mx-auto h-32' />
    progress = <></>
    heading = (
      <h1 className='font-fredoka text-center text-xl font-semibold'>
        {queued
          ? t(stake ? 'app.wait.queuedStakeTitle' : 'app.wait.queuedUnstakeTitle')
          : t(stake ? 'app.wait.stakedTitle' : 'app.wait.unstakedTitle')}
      </h1>
    )
    message = queued ? (
      <p className='text-text-muted mt-4 text-center text-sm'>
        {t(stake ? 'app.wait.queuedStakeMessage' : 'app.wait.queuedUnstakeMessage')}
      </p>
    ) : undefined
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
        {t('app.common.okay')}
      </button>
    )
  }

  if (model.waitForTransaction !== 'no') {
    return (
      <div className='font-body text-text fixed start-0 top-0 z-1000 flex h-full w-full overflow-y-auto bg-black/60 p-8'>
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
