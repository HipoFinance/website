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
  } else if (model.waitForTransaction === 'timeout') {
    img = <img src='/images/app/warning-dark.svg' alt='' className='m-4 mx-auto h-16' />
    progress = <></>
    heading = <h1 className='font-fredoka text-center text-xl font-semibold'>{t('app.wait.timeoutTitle')}</h1>
    message = <p className='text-text-muted mt-4 text-center text-sm'>{t('app.wait.timeoutMessage')}</p>
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
  } else if (model.waitForTransaction === 'done') {
    img = <img src='/images/app/logo-dark.svg' alt='' className='m-4 mx-auto h-32' />
    progress = <></>
    heading = (
      <h1 className='font-fredoka text-center text-xl font-semibold'>
        {model.isStakeTabActive ? t('app.wait.stakedTitle') : t('app.wait.unstakedTitle')}
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
