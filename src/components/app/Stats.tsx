import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Model } from './Model'

interface Props {
  model: Model
}

const Stats = observer(({ model }: Props) => {
  return (
    <div className='font-body text-brown dark:text-dark-50 mx-auto mb-16 w-full max-w-5xl'>
      <div className='mx-auto flex max-w-lg flex-row items-center px-4'>
        <p className='text-lg font-bold'>Hipo statistics</p>
        <a href={model.explorerHref} target='hipo_explorer' className='text-blue ml-auto text-xs font-light'>
          TON Explorer
        </a>
      </div>

      <div className='mx-auto max-w-lg text-sm font-medium'>
        <div className='dark:bg-dark-800 m-4 rounded-2xl bg-white p-8 shadow-sm'>
          <div className='relative my-4 flex flex-row'>
            <p>APY</p>
            <img src='/images/app/question.svg' tabIndex={0} className='peer ml-1 w-4 dark:hidden' />
            <img src='/images/app/question-dark.svg' tabIndex={0} className='peer ml-1 hidden w-4 dark:block' />
            <p className='bg-lightblue text-blue absolute top-6 left-1/3 z-10 hidden -translate-x-1/4 rounded-lg p-4 text-xs font-normal shadow-xl peer-hover:block peer-focus:block'>
              Your yearly earnings based on recent staking rewards.
            </p>
            <p className='ml-auto'>{model.apyFormatted}</p>
          </div>
          {/* <div className='relative my-4 flex flex-row'>
                        <p>Protocol fee</p>
                        <img src='/images/app/question.svg' tabIndex={0} className='peer ml-1 w-4 dark:hidden' />
                        <img src='/images/app/question-dark.svg' tabIndex={0} className='peer ml-1 hidden w-4 dark:block' />
                        <p className='absolute left-1/3 top-6 z-10 hidden -translate-x-1/4 rounded-lg bg-lightblue p-4 text-xs font-normal text-blue shadow-xl peer-hover:block peer-focus:block'>
                            This fee is subtracted from generated validator rewards, NOT your staked amount.
                        </p>
                        <p className='ml-auto'>{model.protocolFee}</p>
                    </div> */}
          <div className='relative my-4 flex flex-row'>
            <p>Staked</p>
            <img src='/images/app/question.svg' tabIndex={0} className='peer ml-1 w-4 dark:hidden' />
            <img src='/images/app/question-dark.svg' tabIndex={0} className='peer ml-1 hidden w-4 dark:block' />
            <p className='bg-lightblue text-blue absolute top-6 left-1/3 z-10 hidden -translate-x-1/4 rounded-lg p-4 text-xs font-normal shadow-xl peer-hover:block peer-focus:block'>
              Total GRAM currently staked in Hipo.
            </p>
            <p className='ml-auto'>{model.currentlyStaked}</p>
          </div>
          <div className='relative my-4 flex flex-row'>
            <p>Holders</p>
            <img src='/images/app/question.svg' tabIndex={0} className='peer ml-1 w-4 dark:hidden' />
            <img src='/images/app/question-dark.svg' tabIndex={0} className='peer ml-1 hidden w-4 dark:block' />
            <p className='bg-lightblue text-blue absolute top-6 left-1/3 z-10 hidden -translate-x-1/4 rounded-lg p-4 text-xs font-normal shadow-xl peer-hover:block peer-focus:block'>
              The number of wallets holding the hGRAM token.
            </p>
            <p className='ml-auto'>{model.holdersCountFormatted}</p>
          </div>
          <div className='my-4 flex flex-row justify-center'>
            <p>
              <a href='https://stats.hipo.finance' className='text-blue' target='hipo_stats'>
                More Stats
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Stats
