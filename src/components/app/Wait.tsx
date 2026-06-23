import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
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
  if (model.waitForTransaction === 'signed') {
    img = (
      <div>
        <img src='/images/app/loading.svg' className='m-4 mx-auto h-16 animate-spin dark:hidden' />
        <img src='/images/app/loading-dark.svg' className='m-4 mx-auto hidden h-16 animate-spin dark:block' />
      </div>
    )
    progress = (
      <div className='border-dark-600 border-opacity-50 dark:border-milky dark:border-opacity-50 my-4 w-full rounded-full border'>
        <div className='bg-blue h-1 w-1/6'></div>
      </div>
    )
    heading = <h1 className='text-center text-xl font-bold'>Finalizing your transaction</h1>
    message = <p className='mt-4 text-center'>Awaiting the processing of your transaction in the next block.</p>
  } else if (model.waitForTransaction === 'sent') {
    img = (
      <div>
        <img src='/images/app/loading.svg' className='m-4 mx-auto h-16 animate-spin dark:hidden' />
        <img src='/images/app/loading-dark.svg' className='m-4 mx-auto hidden h-16 animate-spin dark:block' />
      </div>
    )
    progress = (
      <div className='border-dark-600 border-opacity-50 dark:border-milky dark:border-opacity-50 my-4 w-full rounded-full border'>
        <div className='bg-blue h-1 w-1/2'></div>
      </div>
    )
    heading = <h1 className='text-center text-xl font-bold'>Finalizing your transaction</h1>
    message = <p className='mt-4 text-center'>Awaiting the processing of your transaction in the next block.</p>
  } else if (model.waitForTransaction === 'timeout') {
    img = (
      <div>
        <img src='/images/app/warning.svg' className='m-4 mx-auto h-16 dark:hidden' />
        <img src='/images/app/warning-dark.svg' className='m-4 mx-auto hidden h-16 dark:block' />
      </div>
    )
    progress = <></>
    heading = <h1 className='text-center text-xl font-bold'>Cannot find your transaction</h1>
    message = <p className='mt-4 text-center'>Despite multiple attempts, we could not locate it.</p>
    button = (
      <button
        className='bg-orange dark:text-dark-600 mt-4 h-14 w-full rounded-2xl text-lg font-medium text-white'
        onClick={() => {
          model.setWaitForTransaction('no')
        }}
      >
        Okay
      </button>
    )
  } else if (model.waitForTransaction === 'done') {
    img = (
      <div>
        <img src='/images/app/logo.svg' className='m-4 mx-auto h-32 dark:hidden' />
        <img src='/images/app/logo-dark.svg' className='m-4 mx-auto hidden h-32 dark:block' />
      </div>
    )
    progress = <></>
    heading = (
      <h1 className='text-center text-xl font-bold'>Successfully {model.isStakeTabActive ? 'staked' : 'unstaked'}</h1>
    )
    button = (
      <button
        className='bg-orange dark:text-dark-600 mt-4 h-14 w-full rounded-2xl text-lg font-medium text-white'
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
      <div
        className={
          'bg-opacity-40 text-brown dark:text-dark-50 fixed top-0 left-0 z-1000 flex h-full w-full overflow-y-auto bg-black p-8'
        }
      >
        <div className='bg-milky dark:bg-dark-700 m-auto w-96 max-w-sm rounded-3xl p-8 shadow-2xl'>
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
