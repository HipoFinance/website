import { observer } from 'mobx-react-lite'
import { Clock, Zap } from 'lucide-react'
import { Model } from '../Model'

interface Props {
  model: Model
}

// The phone-first form: the same Model fields as the desktop widget (amount, unstake option, the
// you-will-receive computed, Max, the invalid-amount coral state, buttonLabel), laid out as the
// two cards of the mini app mockup. `min-h-full` plus `mt-auto` on the submit block is what pins
// the CTA to the bottom of the viewport on a short page while still letting a long one scroll.
const TmaStakeUnstake = observer(({ model }: Props) => {
  const stake = model.isStakeTabActive
  const balance = stake ? model.tonBalanceFormatted : model.htonBalanceFormatted
  const receiveAmount = model.youWillReceiveAmount
  const hint = stake ? model.stakeRemain : model.unstakeOption === 'best' ? model.unstakeBestRemain : undefined

  return (
    <div className='flex min-h-full flex-col gap-3.5 px-4 pt-1.5 pb-4'>
      <div className='border-border bg-surface flex flex-row gap-1 rounded-full border p-1 text-[13px] font-semibold select-none'>
        <button
          type='button'
          aria-pressed={stake}
          className={
            'flex-1 cursor-pointer rounded-full py-2 text-center ' +
            (stake ? 'bg-accent text-on-accent' : 'text-text-muted')
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
            'flex-1 cursor-pointer rounded-full py-2 text-center ' +
            (!stake ? 'bg-accent text-on-accent' : 'text-text-muted')
          }
          onClick={() => {
            model.navigateToTab('unstake')
          }}
        >
          Unstake
        </button>
      </div>

      <label
        className={
          'bg-surface flex flex-col gap-3 rounded-2xl border p-4 ' +
          (model.isAmountValid ? 'border-border' : 'border-accent')
        }
      >
        <div className='text-text-faint flex flex-row justify-between gap-2 text-xs'>
          <span>{stake ? 'You stake' : 'You unstake'}</span>
          {model.isWalletConnected && balance != null && <span className='truncate'>Balance: {balance}</span>}
        </div>

        <div className='flex flex-row items-center gap-2.5'>
          <img src={stake ? '/images/app/gram.svg' : '/images/app/hgram.svg'} alt='' className='h-[26px] w-[26px]' />
          <input
            id='amount'
            type='text'
            inputMode='decimal'
            placeholder='0'
            size={1}
            className={
              'placeholder:text-text-faint w-full min-w-0 flex-1 bg-transparent text-[26px] font-semibold focus:outline-none ' +
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
            className='bg-border text-text-muted ml-auto shrink-0 cursor-pointer rounded-lg px-[9px] py-[5px] text-[11px] font-semibold'
            onClick={model.setAmountToMax}
          >
            Max
          </button>
        </div>
      </label>

      <div className='border-border bg-surface-deep flex flex-col gap-2 rounded-2xl border p-4'>
        <div className='text-text-faint text-xs'>You receive</div>
        <div className='flex flex-row items-center gap-2.5'>
          <img src={stake ? '/images/app/hgram.svg' : '/images/app/gram.svg'} alt='' className='h-[26px] w-[26px]' />
          <span className='min-w-0 flex-1 truncate text-[26px] font-semibold'>
            {receiveAmount == null ? '—' : receiveAmount === '' ? '0' : receiveAmount}
          </span>
          <span className='text-text-muted ml-auto shrink-0 text-sm font-medium'>{model.youWillReceiveToken}</span>
        </div>
      </div>

      {!stake && (
        <>
          <div className='grid grid-cols-2 gap-2.5'>
            <div
              className={
                'bg-surface flex cursor-pointer flex-col gap-1.5 rounded-[14px] border-2 p-3 select-none ' +
                (model.unstakeOption === 'best' ? 'border-accent' : 'border-border')
              }
              onClick={() => {
                model.setUnstakeOption('best')
              }}
            >
              <div className='flex flex-row items-center gap-1.5'>
                <Clock className='text-accent size-3.5' />
                <p className='text-[13px] font-semibold'>Full</p>
                <span
                  className={
                    'text-accent ml-auto text-xs font-bold' + (model.unstakeOption === 'best' ? '' : ' invisible')
                  }
                >
                  ✓
                </span>
              </div>
              <p className='text-text-muted text-[11.5px] leading-[1.4]'>
                Wait until round ends
                <br />
                Maximum rewards
              </p>
            </div>

            <div
              className={
                'bg-surface flex cursor-pointer flex-col gap-1.5 rounded-[14px] border-2 p-3 select-none ' +
                (model.unstakeOption === 'instant' ? 'border-accent' : 'border-border')
              }
              onClick={() => {
                model.setUnstakeOption('instant')
              }}
            >
              <div className='flex flex-row items-center gap-1.5'>
                <Zap className='text-accent size-3.5' />
                <p className='text-[13px] font-semibold'>Instant</p>
                <span
                  className={
                    'text-accent ml-auto text-xs font-bold' + (model.unstakeOption === 'instant' ? '' : ' invisible')
                  }
                >
                  ✓
                </span>
              </div>
              <p className='text-text-muted text-[11.5px] leading-[1.4]'>
                If liquidity is available
                <br />
                Reduced rewards
              </p>
            </div>
          </div>

          {model.unstakeOption === 'instant' && (
            <div
              className={
                '-mt-2 px-1 text-[11.5px] ' + (model.unstakeMoreThanInstantBurnable ? 'text-accent' : 'text-text-faint')
              }
            >
              {model.maxBurnableTokensFormatted}
            </div>
          )}
        </>
      )}

      {hint != null && <div className='text-text-faint -mt-2 px-1 text-[11.5px]'>{hint}</div>}

      <div className='text-text-muted flex flex-col gap-2 px-1 text-[13px]'>
        <div className='flex flex-row flex-wrap gap-x-2'>
          <span>Exchange rate</span>
          <span className='text-text ml-auto font-medium'>{model.exchangeRateFormatted ?? '—'}</span>
        </div>
        <div className='flex flex-row flex-wrap gap-x-2'>
          <span>Yearly rewards, last round</span>
          <span className='text-positive ml-auto font-semibold'>{model.apyFormatted ?? '—'}</span>
        </div>
      </div>

      <div className='mt-auto flex flex-col gap-2.5 pt-2'>
        <button
          id='submit'
          className='bg-accent text-on-accent w-full cursor-pointer rounded-[14px] py-[15px] text-[17px] font-semibold disabled:cursor-not-allowed disabled:opacity-60'
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
        <p className='text-text-faint text-center text-[11.5px]'>
          Questions?{' '}
          <a className='text-accent' href='https://t.me/hipo_chat' target='_blank' rel='noopener noreferrer'>
            Ask us on Telegram
          </a>{' '}
          — a real person replies.
        </p>
      </div>
    </div>
  )
})

export default TmaStakeUnstake
