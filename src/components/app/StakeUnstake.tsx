import { observer } from 'mobx-react-lite'
import { Model } from './Model'
import { Clock, Zap, ArrowRight } from 'lucide-react'
import { nodes } from './Interpolate'

interface Props {
  model: Model
}

const StakeUnstake = observer(({ model }: Props) => {
  const stake = model.isStakeTabActive
  const t = model.t

  return (
    <div className='font-body text-text mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pt-10 pb-8'>
      <div className='pb-7 text-center'>
        <h1 className='font-fredoka mb-2 text-3xl font-semibold sm:text-[34px]'>
          {stake ? t('app.stake.titleStake') : t('app.stake.titleUnstake')}
        </h1>
        <p className='text-text-muted text-base'>
          {stake ? t('app.stake.subtitleStake') : t('app.stake.subtitleUnstake')}
        </p>
      </div>

      <div className='border-border bg-surface mb-7 flex flex-row gap-1.5 rounded-full border p-[5px] text-[15px] font-semibold select-none'>
        <button
          type='button'
          aria-pressed={stake}
          className={
            'min-h-11 flex-1 cursor-pointer rounded-full px-9 py-2 text-center ' +
            (stake ? 'bg-accent-fill text-on-accent' : 'text-text-muted hover:text-accent')
          }
          onClick={() => {
            model.navigateToTab('stake')
          }}
        >
          {t('app.common.stake')}
        </button>
        <button
          type='button'
          aria-pressed={!stake}
          className={
            'min-h-11 flex-1 cursor-pointer rounded-full px-9 py-2 text-center ' +
            (!stake ? 'bg-accent-fill text-on-accent' : 'text-text-muted hover:text-accent')
          }
          onClick={() => {
            model.navigateToTab('unstake')
          }}
        >
          {t('app.common.unstake')}
        </button>
      </div>

      <div className='flex w-full max-w-[480px] flex-col'>
        {/* Balances panel: revealed by the same 700ms max-height transition as before. Inset on
            both sides and tucked 18px under the form card, so the darker strip reads as a drawer
            sliding out from behind the card rather than a separate stacked box. */}
        <div
          className={
            'overflow-hidden transition-all duration-700 motion-reduce:transition-none' +
            (model.isWalletConnected ? ' max-h-80' : ' max-h-0')
          }
        >
          <div className='border-border bg-surface-deep text-text-muted mx-3.5 -mb-[18px] rounded-t-[16px] border border-b-0 px-[22px] pt-4 pb-[34px] text-sm'>
            <div className='flex flex-row flex-wrap pb-2'>
              <p className='font-light'>{t('app.stake.gramBalance')}</p>
              <p className='text-text num ms-auto font-medium'>{model.tonBalanceFormatted}</p>
            </div>

            {model.stakingInProgressDetails.map((value) => (
              <div key={(value.estimated ?? '') + value.amount} className='flex flex-row flex-wrap opacity-70'>
                <p className='font-light'>
                  {value.estimated == null
                    ? t('app.stake.staking')
                    : t('app.stake.stakingStartsIn', { remain: model.isolate(value.estimated) })}
                </p>
                <p className='text-text num ms-auto font-medium'>{value.amount}</p>
              </div>
            ))}

            <div className='bg-border mt-1.5 mb-2.5 h-px'></div>

            <div className='flex flex-row flex-wrap'>
              <p className='font-light'>{t('app.stake.hgramBalance')}</p>
              <p className='text-text num ms-auto font-medium'>{model.htonBalanceFormatted}</p>
            </div>

            <div
              className={
                'flex flex-row flex-wrap opacity-70' + (model.unstakingInProgressDetails != null ? '' : ' hidden')
              }
            >
              <p className='font-light'>
                {model.unstakingInProgressDetails?.estimated == null
                  ? t('app.stake.unstaking')
                  : t('app.stake.unstakingIn', { remain: model.isolate(model.unstakingInProgressDetails.estimated) })}
              </p>
              <p className='text-text num ms-auto font-medium'>{model.unstakingInProgressFormatted}</p>
            </div>
          </div>
        </div>

        <div className='border-border bg-surface relative flex flex-col gap-4 rounded-[20px] border p-7'>
          <div className='text-base font-medium'>{stake ? t('app.common.stake') : t('app.common.unstake')}</div>

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
                placeholder={t('app.stake.amountPlaceholder')}
                size={1}
                dir='ltr'
                className={
                  'placeholder:text-text-faint h-full w-full min-w-0 flex-1 bg-transparent text-start text-[19px] font-medium focus:outline-none ' +
                  (model.isAmountValid ? 'text-text' : 'text-accent')
                }
                value={model.amountRaw}
                onInput={(e) => {
                  model.setAmount(e.currentTarget.value)
                }}
                onBlur={model.normalizeAmount}
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
                className='bg-border text-text-muted hover:text-text hover:bg-border-strong cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold'
                onClick={model.setAmountToMax}
              >
                {t('app.common.max')}
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
                    <p className='text-[15px] font-semibold'>{t('app.stake.optionFull')}</p>
                    <span
                      className={'text-accent ms-auto font-bold' + (model.unstakeOption === 'best' ? '' : ' invisible')}
                    >
                      ✓
                    </span>
                  </div>
                  <p className='text-text-muted text-[12.5px] leading-[1.45]'>
                    {t('app.stake.optionFullLine1')}
                    <br />
                    {t('app.stake.optionFullLine2')}
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
                    <p className='text-[15px] font-semibold'>{t('app.stake.optionInstant')}</p>
                    <span
                      className={
                        'text-accent ms-auto font-bold' + (model.unstakeOption === 'instant' ? '' : ' invisible')
                      }
                    >
                      ✓
                    </span>
                  </div>
                  <p className='text-text-muted text-[12.5px] leading-[1.45]'>
                    {t('app.stake.optionInstantLine1')}
                    <br />
                    {t('app.stake.optionInstantLine2')}
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
            className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover h-14 w-full cursor-pointer rounded-2xl text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-60'
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
                className='text-text-faint hover:text-accent ms-auto flex flex-row items-center gap-1 text-sm'
              >
                <span>{t('app.stake.swapOnExchange')}</span>
                <ArrowRight className='h-4 w-4 rtl:-scale-x-100' />
              </a>
            </div>
          )}

          <div className='text-text-muted flex flex-col gap-2.5 pt-2.5 text-sm'>
            <div className='flex flex-row flex-wrap'>
              <p>{t('app.stake.youWillReceive')}</p>
              <p className='text-text num ms-auto font-medium'>{model.youWillReceive}</p>
            </div>
            <div className='flex flex-row flex-wrap'>
              <p>{t('app.stake.exchangeRate')}</p>
              <p className='text-text num ms-auto font-medium'>{model.exchangeRateFormatted}</p>
            </div>
            <div className='flex flex-row flex-wrap'>
              <p>{t('app.stake.yearlyRewards')}</p>
              <p className='text-positive num ms-auto font-semibold'>{model.apyFormatted}</p>
            </div>
            <div className='relative flex flex-row flex-wrap'>
              <p>{t('app.stake.transactionCost')}</p>
              <img src='/images/app/question-dark.svg' tabIndex={0} className='peer ms-1 w-4' alt='' />
              <p className='border-border bg-surface-deep text-text-muted absolute start-1/3 top-6 z-10 hidden -translate-x-1/4 rounded-xl border p-4 text-xs font-normal shadow-xl peer-hover:block peer-focus:block rtl:translate-x-1/4'>
                {t('app.stake.transactionCostTooltip')}
              </p>
              <p className='text-text num ms-auto font-medium'>
                {stake ? model.averageStakeFeeFormatted : model.averageUnstakeFeeFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Reassurance at the money moment: a human to reach before committing funds. */}
        <p className='text-text-faint pt-5 text-center text-[13px]'>
          {nodes(t('app.stake.questions'), {
            link: (
              <a
                className='text-accent hover:text-accent-hover'
                href='https://t.me/hipo_chat'
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('app.stake.askOnTelegram')}
              </a>
            ),
          })}
        </p>

        <div className='text-text-faint flex flex-row flex-wrap justify-center gap-x-6 gap-y-2 pt-3 text-[13px]'>
          <a className='hover:text-accent' href={model.localizedPath('/docs/')}>
            {t('app.stake.docs')}
          </a>
          <a className='hover:text-accent' href={model.localizedPath('/faq/')}>
            {t('app.stake.faq')}
          </a>
          <a
            className='hover:text-accent'
            href='https://github.com/HipoFinance/audits'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('app.stake.audits')}
          </a>
          <a className='hover:text-accent' href={model.explorerHref} target='hipo_explorer'>
            {t('app.stake.treasuryOnExplorer')}
          </a>
        </div>
      </div>
    </div>
  )
})

export default StakeUnstake
