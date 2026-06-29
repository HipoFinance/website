import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Model } from './Model'
import { Clock, Zap, ArrowRight } from 'lucide-react'

interface Props {
  model: Model
}

const StakeUnstake = observer(({ model }: Props) => {
  return (
    <div className='font-body text-brown dark:text-dark-50 mx-auto w-full max-w-5xl'>
      <p className='pt-4 text-center text-3xl font-bold'>Hipo</p>
      <p className='my-8 text-center'>
        {model.isStakeTabActive
          ? 'Stake GRAM and receive hGRAM while staking'
          : 'Unstake hGRAM and receive GRAM and rewards'}
      </p>

      <div className='dark:bg-tabbar bg-milky dark:bg-dark-400 mx-auto my-8 w-max rounded-full p-0.5 dark:text-white'>
        <ul
          className={'tab-bar relative flex flex-nowrap select-none' + (model.isStakeTabActive ? ' stake' : ' unstake')}
        >
          <li
            className='z-1 m-1 inline-block w-36 cursor-pointer rounded-full py-1 text-center'
            onClick={() => {
              model.setActiveTab('stake')
            }}
          >
            Stake
          </li>
          <li
            className='z-1 m-1 inline-block w-36 cursor-pointer rounded-full py-1 text-center'
            onClick={() => {
              model.setActiveTab('unstake')
            }}
          >
            Unstake
          </li>
        </ul>
      </div>

      <div
        className={
          'h-8 transition-all duration-700 motion-reduce:transition-none' +
          (model.isWalletConnected ? ' max-h-0' : ' max-h-8')
        }
      ></div>

      <div className='mx-auto mb-12 max-w-lg'>
        <div
          className={
            'overflow-hidden transition-all duration-700 motion-reduce:transition-none' +
            (model.isWalletConnected ? ' max-h-80' : ' max-h-0')
          }
        >
          <div className='bg-brown dark:bg-dark-600 dark:text-dark-50 mx-4 rounded-t-2xl px-8 pt-4 pb-12 text-sm text-white'>
            <div className='flex flex-row flex-wrap'>
              <p className='font-light'>GRAM balance</p>
              <p className='ml-auto font-medium'>{model.tonBalanceFormatted}</p>
            </div>

            {model.stakingInProgressDetails.map((value) => (
              <div key={(value.estimated ?? '') + value.amount} className='flex flex-row flex-wrap'>
                <p className='font-light opacity-70'>
                  {value.estimated == null ? 'In progress' : 'In progress, done by ' + value.estimated}
                </p>
                <p className='ml-auto font-medium opacity-70'>{value.amount}</p>
              </div>
            ))}

            <div className='my-4 h-px bg-white opacity-40'></div>

            <div className='flex flex-row flex-wrap'>
              <p className='font-light'>hGRAM balance</p>
              <p className='ml-auto font-medium'>{model.htonBalanceFormatted}</p>
            </div>

            <div className={'flex flex-row flex-wrap' + (model.unstakingInProgressDetails != null ? '' : ' hidden')}>
              <p className='font-light opacity-70'>
                {model.unstakingInProgressDetails?.estimated == null
                  ? 'In progress'
                  : 'In progress, done by ' + model.unstakingInProgressDetails.estimated}
              </p>
              <p className='ml-auto font-medium opacity-70'>{model.unstakingInProgressFormatted}</p>
            </div>
          </div>
        </div>

        <div className='dark:bg-dark-700 mx-4 -mt-8 rounded-2xl bg-white p-8 shadow-sm'>
          <p>{model.isStakeTabActive ? 'Stake' : 'Unstake'}</p>

          <label>
            <div
              className={
                'border-milky focus-within:border-brown dark:border-dark-900 dark:bg-dark-900 mt-4 mb-8 flex flex-row rounded-lg border p-4 ' +
                (model.isAmountValid
                  ? ''
                  : ' border-orange focus-within:border-orange dark:border-orange dark:focus-within:border-orange')
              }
            >
              <img src='/images/app/gram.svg' className={'w-7' + (model.isStakeTabActive ? '' : ' hidden')} />
              <img src='/images/app/hgram.svg' className={'w-7' + (model.isStakeTabActive ? ' hidden' : '')} />
              <input
                id='amount'
                type='text'
                inputMode='decimal'
                placeholder=' Amount'
                size={1}
                className={
                  'dark:bg-dark-900 dark:text-dark-50 h-full w-full flex-1 px-3 text-lg focus:outline-none' +
                  (model.isAmountValid ? '' : ' text-orange dark:text-orange')
                }
                value={model.amount}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.replace(/,/g, '.')
                  model.setAmount(value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && model.isButtonEnabled) {
                    const button = document.querySelector<HTMLInputElement>('#submit')
                    if (button != null) {
                      const target = e.target as HTMLInputElement
                      target.blur()
                      button.click()
                    }
                  }
                }}
              />
              <button
                className={
                  'bg-milky dark:text-dark-600 rounded-lg px-3 text-xs hover:bg-gray-200 active:bg-gray-300' +
                  (model.isAmountValid
                    ? ''
                    : ' bg-orange hover:bg-brown! active:bg-dark-600! dark:hover:text-dark-50 text-white')
                }
                onClick={model.setAmountToMax}
              >
                Max
              </button>
            </div>
          </label>

          <div
            className={
              'grid grid-cols-2 gap-4 overflow-hidden transition-all motion-reduce:transition-none' +
              (model.isStakeTabActive ? ' max-h-0 pb-0' : ' max-h-64 pb-4')
            }
          >
            <div
              className={
                'bg-milky dark:text-brown flex cursor-pointer flex-col gap-2 rounded-lg border-2 p-4 text-sm select-none' +
                (model.unstakeOption === 'best' ? ' border-orange' : ' border-milky')
              }
              onClick={() => {
                model.setUnstakeOption('best')
              }}
            >
              <div className='flex items-start gap-2'>
                <div className='bg-orange/10 text-orange rounded-full p-1'>
                  <Clock className='size-4' />
                </div>
                <p className='text-dark-800 font-medium'>
                  Wait
                  {model.unstakeHours && ' ' + model.unstakeHours + 'h'}
                </p>
                <img
                  src='/images/app/check-orange.svg'
                  className={'ml-auto w-5' + (model.unstakeOption === 'best' ? '' : ' invisible')}
                />
              </div>
              <div className='flex items-center gap-2'>
                <p className='text-xs'>
                  Slower
                  <br />
                  Full rewards
                </p>
              </div>
            </div>
            <div
              className={
                'bg-milky dark:text-brown flex cursor-pointer flex-col gap-2 rounded-lg border-2 p-4 text-sm select-none' +
                (model.unstakeOption === 'instant' ? ' border-orange' : ' border-milky')
              }
              onClick={() => {
                model.setUnstakeOption('instant')
              }}
            >
              <div className='flex items-start gap-2'>
                <div className='bg-orange/10 text-orange rounded-full p-1'>
                  <Zap className='size-4' />
                </div>
                <p className='text-dark-800 font-medium'>Instant</p>
                <img
                  src='/images/app/check-orange.svg'
                  className={'ml-auto w-5' + (model.unstakeOption === 'instant' ? '' : ' invisible')}
                />
              </div>
              <div className='flex items-center gap-2'>
                <p className='text-xs'>
                  Faster, lower rewards
                  <br />
                  If liquidity is available
                </p>
              </div>
            </div>
            <div
              className={
                'col-span-2 -mt-2 text-right text-xs' +
                (model.unstakeOption !== 'instant' ? ' invisible' : '') +
                (model.unstakeMoreThanInstantBurnable ? ' text-orange' : '')
              }
            >
              &nbsp; {model.maxBurnableTokensFormatted}
            </div>
          </div>

          <button
            id='submit'
            className='bg-orange dark:text-dark-600 h-14 w-full rounded-2xl text-lg font-medium text-white disabled:opacity-80'
            disabled={!model.isButtonEnabled}
            onClick={(e) => {
              console.log(2, model.isStakeTabActive && !model.isAmountValid)
              const target = e.target as HTMLInputElement
              target.blur()
              if (!model.isWalletConnected) {
                model.connect()
              } else if (model.isStakeTabActive && !model.isAmountValid) {
                console.log(3)
                model.setAmountAlert('stake-max')
              } else if (!model.isStakeTabActive && !model.isAmountValid) {
                model.setAmountAlert('unstake-max')
              } else if (!model.isStakeTabActive && model.unstakeOption === 'instant' && model.unstakeMoreThanInstantBurnable) {
                model.setAmountAlert('instant-unstake-max')
              } else {
                model.send()
              }
            }}
          >
            {model.buttonLabel}
          </button>

          {!model.isStakeTabActive && (
            <div className='text-blue mt-2 flex font-light'>
              <a href={model.swapUrl} target='hipo_swap' className='ml-auto flex items-center gap-1 text-sm'>
                <span className=''>Swap on DEX</span>
                <ArrowRight className='h-4 w-4' />
              </a>
            </div>
          )}

          <div className='mt-12 text-sm font-medium'>
            <div className='my-4 flex flex-row flex-wrap'>
              <p>You will receive</p>
              <p className='ml-auto'>{model.youWillReceive}</p>
            </div>
            <div className='my-4 flex flex-row flex-wrap'>
              <p>Exchange rate</p>
              <p className='ml-auto'>{model.exchangeRateFormatted}</p>
            </div>
            <div className='relative my-4 flex flex-row flex-wrap'>
              <p>Transaction cost</p>
              <img src='/images/app/question.svg' tabIndex={0} className='peer ml-1 w-4 dark:hidden' />
              <img src='/images/app/question-dark.svg' tabIndex={0} className='peer ml-1 hidden w-4 dark:block' />
              <p className='bg-lightblue text-blue absolute top-6 left-1/3 z-10 hidden -translate-x-1/4 rounded-lg p-4 text-xs font-normal shadow-xl peer-hover:block peer-focus:block'>
                This fee is an average, but to ensure all cases are covered, we initially send extra gas, which is later
                refunded to your wallet.
              </p>
              <p className='ml-auto'>
                {model.isStakeTabActive ? model.averageStakeFeeFormatted : model.averageUnstakeFeeFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default StakeUnstake
