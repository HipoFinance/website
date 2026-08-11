import { observer } from 'mobx-react-lite'
import { Model } from './Model'
import { Clock, Zap, ArrowRight } from 'lucide-react'

interface Props {
  model: Model
}

const StakeUnstake = observer(({ model }: Props) => {
  const stake = model.isStakeTabActive

  return (
    <div className='font-body text-text mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pt-10 pb-8'>
      <div className='pb-7 text-center'>
        <h1 className='font-fredoka mb-2 text-3xl font-semibold sm:text-[34px]'>
          {stake ? 'Stake GRAM' : 'Unstake hGRAM'}
        </h1>
        <p className='text-text-muted text-base'>
          {stake ? 'Stake GRAM and receive hGRAM while staking' : 'Unstake hGRAM and receive GRAM and rewards'}
        </p>
      </div>

      <div className='border-border bg-surface mb-7 flex flex-row gap-1.5 rounded-full border p-[5px] text-[15px] font-semibold select-none'>
        <button
          type='button'
          aria-pressed={stake}
          className={
            'min-h-11 flex-1 cursor-pointer rounded-full px-9 py-2 text-center ' +
            (stake ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-accent')
          }
          onClick={() => {
            model.navigateToTab('stake')
          }}
        >
          Stake
        </button>
        <button
          type='button'
          aria-pressed={!stake}
          className={
            'min-h-11 flex-1 cursor-pointer rounded-full px-9 py-2 text-center ' +
            (!stake ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-accent')
          }
          onClick={() => {
            model.navigateToTab('unstake')
          }}
        >
          Unstake
        </button>
      </div>

      <div className='flex w-full max-w-[480px] flex-col'>
        {/* Balances panel: revealed by the same 700ms max-height transition as before, and tucked
            14px under the form card so the card's rounded top overlaps it. */}
        <div
          className={
            'overflow-hidden transition-all duration-700 motion-reduce:transition-none' +
            (model.isWalletConnected ? ' max-h-80' : ' max-h-0')
          }
        >
          <div className='border-border bg-surface-deep text-text-muted -mb-3.5 rounded-t-[20px] border border-b-0 px-[26px] pt-[18px] pb-[30px] text-sm'>
            <div className='flex flex-row flex-wrap pb-2'>
              <p className='font-light'>GRAM balance</p>
              <p className='text-text ml-auto font-medium'>{model.tonBalanceFormatted}</p>
            </div>

            {model.stakingInProgressDetails.map((value) => (
              <div key={(value.estimated ?? '') + value.amount} className='flex flex-row flex-wrap opacity-70'>
                <p className='font-light'>
                  {value.estimated == null ? 'Staking' : 'Staking starts in ' + value.estimated}
                </p>
                <p className='text-text ml-auto font-medium'>{value.amount}</p>
              </div>
            ))}

            <div className='bg-border mt-1.5 mb-2.5 h-px'></div>

            <div className='flex flex-row flex-wrap'>
              <p className='font-light'>hGRAM balance</p>
              <p className='text-text ml-auto font-medium'>{model.htonBalanceFormatted}</p>
            </div>

            <div
              className={
                'flex flex-row flex-wrap opacity-70' + (model.unstakingInProgressDetails != null ? '' : ' hidden')
              }
            >
              <p className='font-light'>
                {model.unstakingInProgressDetails?.estimated == null
                  ? 'Unstaking'
                  : 'Unstaking in ' + model.unstakingInProgressDetails.estimated}
              </p>
              <p className='text-text ml-auto font-medium'>{model.unstakingInProgressFormatted}</p>
            </div>
          </div>
        </div>

        <div className='border-border bg-surface relative flex flex-col gap-4 rounded-[20px] border p-7'>
          <div className='text-base font-medium'>{stake ? 'Stake' : 'Unstake'}</div>

          <label>
            <div
              className={
                'bg-surface-deep flex flex-row items-center gap-3 rounded-[14px] border px-4 py-3.5 ' +
                (model.isAmountValid ? 'border-border focus-within:border-text-faint' : 'border-accent')
              }
            >
              <img src={stake ? '/images/app/gram.svg' : '/images/app/hgram.svg'} alt='' className='h-7 w-7' />
              <input
                id='amount'
                type='text'
                inputMode='decimal'
                placeholder='Amount'
                size={1}
                className={
                  'placeholder:text-text-faint h-full w-full min-w-0 flex-1 bg-transparent text-[19px] font-medium focus:outline-none ' +
                  (model.isAmountValid ? 'text-text' : 'text-accent')
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
                type='button'
                className='bg-border text-text-muted hover:text-text cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold hover:bg-[#4a3f3c]'
                onClick={model.setAmountToMax}
              >
                Max
              </button>
            </div>
          </label>

          {!stake && (
            <>
              <div className='grid grid-cols-2 gap-3'>
                <div
                  className={
                    'bg-surface-deep flex cursor-pointer flex-col gap-2 rounded-[14px] border-2 p-3.5 select-none ' +
                    (model.unstakeOption === 'best' ? 'border-accent' : 'border-border')
                  }
                  onClick={() => {
                    model.setUnstakeOption('best')
                  }}
                >
                  <div className='flex flex-row items-center gap-2'>
                    <Clock className='text-accent size-4' />
                    <p className='text-[15px] font-semibold'>Full</p>
                    <span
                      className={'text-accent ml-auto font-bold' + (model.unstakeOption === 'best' ? '' : ' invisible')}
                    >
                      ✓
                    </span>
                  </div>
                  <p className='text-text-muted text-[12.5px] leading-[1.45]'>
                    Wait until round ends
                    <br />
                    Maximum rewards
                  </p>
                </div>

                <div
                  className={
                    'bg-surface-deep flex cursor-pointer flex-col gap-2 rounded-[14px] border-2 p-3.5 select-none ' +
                    (model.unstakeOption === 'instant' ? 'border-accent' : 'border-border')
                  }
                  onClick={() => {
                    model.setUnstakeOption('instant')
                  }}
                >
                  <div className='flex flex-row items-center gap-2'>
                    <Zap className='text-accent size-4' />
                    <p className='text-[15px] font-semibold'>Instant</p>
                    <span
                      className={
                        'text-accent ml-auto font-bold' + (model.unstakeOption === 'instant' ? '' : ' invisible')
                      }
                    >
                      ✓
                    </span>
                  </div>
                  <p className='text-text-muted text-[12.5px] leading-[1.45]'>
                    If liquidity is available
                    <br />
                    Reduced rewards
                  </p>
                </div>
              </div>

              <div
                className={
                  '-mt-2.5 text-[12.5px] ' +
                  (model.unstakeOption === 'instant' && model.unstakeMoreThanInstantBurnable
                    ? 'text-accent'
                    : 'text-text-faint')
                }
              >
                {model.unstakeOption === 'best' ? model.unstakeBestRemain : model.maxBurnableTokensFormatted}
                &nbsp;
              </div>
            </>
          )}

          {stake && model.stakeRemain != null && (
            <div className='text-text-faint -mt-2.5 text-[12.5px]'>{model.stakeRemain}</div>
          )}

          <button
            id='submit'
            className='bg-accent text-on-accent hover:bg-accent-hover h-14 w-full cursor-pointer rounded-2xl text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-60'
            disabled={!model.isButtonEnabled}
            onClick={(e) => {
              const target = e.target as HTMLInputElement
              target.blur()
              if (!model.isWalletConnected) {
                model.connect()
              } else if (stake && !model.isAmountValid) {
                model.setAmountAlert('stake-max')
              } else if (!stake && !model.isAmountValid) {
                model.setAmountAlert('unstake-max')
              } else if (!stake && model.unstakeOption === 'instant' && model.unstakeMoreThanInstantBurnable) {
                model.setAmountAlert('instant-unstake-max')
              } else {
                model.send()
              }
            }}
          >
            {model.buttonLabel}
          </button>

          {!stake && (
            <div className='-mt-2 flex flex-row'>
              <a
                href={model.swapUrl}
                target='hipo_swap'
                className='text-text-faint hover:text-accent ml-auto flex flex-row items-center gap-1 text-sm'
              >
                <span>Swap on DEX</span>
                <ArrowRight className='h-4 w-4' />
              </a>
            </div>
          )}

          <div className='text-text-muted flex flex-col gap-2.5 pt-2.5 text-sm'>
            <div className='flex flex-row flex-wrap'>
              <p>You will receive</p>
              <p className='text-text ml-auto font-medium'>{model.youWillReceive}</p>
            </div>
            <div className='flex flex-row flex-wrap'>
              <p>Exchange rate</p>
              <p className='text-text ml-auto font-medium'>{model.exchangeRateFormatted}</p>
            </div>
            <div className='flex flex-row flex-wrap'>
              <p>APY, last round</p>
              <p className='text-positive ml-auto font-semibold'>{model.apyFormatted}</p>
            </div>
            <div className='relative flex flex-row flex-wrap'>
              <p>Transaction cost</p>
              <img src='/images/app/question-dark.svg' tabIndex={0} className='peer ml-1 w-4' alt='' />
              <p className='border-border bg-surface-deep text-text-muted absolute top-6 left-1/3 z-10 hidden -translate-x-1/4 rounded-xl border p-4 text-xs font-normal shadow-xl peer-hover:block peer-focus:block'>
                This fee is an average, but to ensure all cases are covered, we initially send extra gas, which is later
                refunded to your wallet.
              </p>
              <p className='text-text ml-auto font-medium'>
                {stake ? model.averageStakeFeeFormatted : model.averageUnstakeFeeFormatted}
              </p>
            </div>
          </div>
        </div>

        <div className='text-text-faint flex flex-row flex-wrap justify-center gap-x-6 gap-y-2 pt-5 text-[13px]'>
          <a className='hover:text-accent' href='/docs/'>
            Docs
          </a>
          <a className='hover:text-accent' href='/faq/'>
            FAQ
          </a>
          <a
            className='hover:text-accent'
            href='https://github.com/HipoFinance/audits'
            target='_blank'
            rel='noopener noreferrer'
          >
            Audits
          </a>
          <a className='hover:text-accent' href={model.explorerHref} target='hipo_explorer'>
            Treasury on explorer
          </a>
        </div>
      </div>
    </div>
  )
})

export default StakeUnstake
