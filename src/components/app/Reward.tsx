import { observer } from 'mobx-react-lite'
import { Model } from './Model'
import { Num, nodes } from './Interpolate'

interface Props {
  model: Model
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <div className='flex flex-row flex-wrap'>
    <p>{label}</p>
    <p className='text-text num ms-auto font-medium'>{value ?? '—'}</p>
  </div>
)

const SeasonCard = observer(({ model }: Props) => {
  const t = model.t
  const season = model.season
  const status = model.seasonStatus
  if (season == null || status == null) {
    return null
  }
  const left = model.seasonUnderOneDay
    ? t('app.reward.season.hoursLeft', { count: model.isolate(model.formatNumber(model.seasonHoursLeft ?? 0)) })
    : t('app.reward.season.daysLeft', { count: model.isolate(model.formatNumber(model.seasonDaysLeft ?? 0)) })
  const last = model.lastClaimFormatted
  const top = (model.walletRewards?.clubLevel ?? 0) >= 9
  const claims = model.seasonClaims

  return (
    <div className='border-border bg-surface flex flex-col gap-3 rounded-[20px] border p-7'>
      <h2 className='font-fredoka text-xl font-semibold'>
        {t('app.reward.season.title', { number: model.isolate(model.formatNumber(season.number)) })}
      </h2>
      <div className='text-text-muted flex flex-col gap-1 text-sm'>
        <p>{t('app.reward.season.endsOn', { date: model.isolate(model.seasonEndFormatted ?? '') })}</p>
        <p className='text-text font-medium'>{left}</p>
      </div>
      <div className='bg-border h-px'></div>
      {status === 'penalty' && <p className='text-accent text-sm'>{t('app.reward.season.penalty')}</p>}
      {status === 'claimed' && (
        <p className='text-positive text-sm'>
          {t(top ? 'app.reward.season.claimedTop' : 'app.reward.season.claimed', {
            amount: model.isolate(last?.amount ?? '—'),
            date: model.isolate(last?.date ?? '—'),
          })}
        </p>
      )}
      {status === 'notClaimed' && (
        <div className='flex flex-col gap-1 text-sm'>
          <p className='text-text'>{t('app.reward.season.notClaimed')}</p>
          <p className='text-text-muted'>{t('app.reward.season.claimHint')}</p>
        </div>
      )}
      {claims.length > 0 && (
        <div className='flex flex-col gap-2 text-sm'>
          <div className='text-text-muted font-medium'>{t('app.reward.season.pastClaims')}</div>
          {claims.map((claim, i) => (
            <div className='text-text-muted flex min-w-0 flex-col gap-0.5' key={claim.key || i}>
              <div className='num'>{claim.date}</div>
              <div className='text-text num wrap-anywhere'>
                {t('app.reward.season.claimRow', {
                  amount: model.isolate(claim.amount),
                  fee: model.isolate(claim.fee),
                })}
              </div>
              {claim.url != null && (
                <a
                  className='text-accent wrap-anywhere hover:underline'
                  href={claim.url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {t('app.reward.season.viewTx')}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

const Reward = observer(({ model }: Props) => {
  const t = model.t
  const rewards = model.walletRewards
  const coefficients = rewards?.rewardCoefficients ?? [1]
  const level = rewards?.clubLevel ?? 0
  const caption = model.claimableRewardsFormatted

  // In the mini app the claim button renders above the detail rows instead of below them — on a
  // phone viewport a bottom placement lands under the fold and gets missed.
  const tma = model.isTelegram
  const claimCta = (
    <div className='flex flex-col gap-2'>
      {(caption.hpo != null || caption.gram != null) && (
        <div className='text-text-faint flex flex-col gap-0.5 text-center text-[12.5px]'>
          {caption.hpo != null && (
            <p className='num'>{t('app.reward.claimableHpo', { amount: model.isolate(caption.hpo) })}</p>
          )}
          {caption.gram != null && (
            <p className='num'>{t('app.reward.claimableGram', { amount: model.isolate(caption.gram) })}</p>
          )}
        </div>
      )}
      <a
        className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover block h-14 w-full rounded-2xl text-center text-[17px] leading-14 font-semibold'
        href='https://t.me/HipoFinanceBot/join'
        target='_blank'
        rel='noopener noreferrer'
      >
        {t('app.reward.claim')}
      </a>
    </div>
  )

  const rewardRate =
    rewards != null
      ? t('app.reward.rewardRateValue', {
          coefficient: model.isolate(model.formatNumber(coefficients[level] ?? 1)),
          level: model.isolate(model.formatNumber(level + 1)),
          total: model.isolate(model.formatNumber(coefficients.length)),
        })
      : undefined

  return (
    <div className='font-body text-text mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pt-10 pb-8'>
      <div className='pb-7 text-center'>
        <h1 className='font-fredoka mb-2 text-3xl font-semibold sm:text-[34px]'>{t('app.reward.title')}</h1>
        <p className='text-text-muted text-base'>{t('app.reward.subtitle')}</p>
      </div>

      <div className='flex w-full max-w-[480px] flex-col gap-4'>
        {model.isWalletConnected && <SeasonCard model={model} />}

        <div className='border-border bg-surface flex flex-col gap-[18px] rounded-[20px] border p-7'>
          <div className='flex flex-row items-center gap-3.5'>
            <img src='/hpo.png' alt='HPO' className='h-12 w-12' />
            <div>
              <div className='font-fredoka text-xl font-semibold'>{t('app.reward.hpoRewards')}</div>
              <div className='text-text-muted text-sm'>{t('app.reward.distributedVia')}</div>
            </div>
          </div>

          <div className='bg-border h-px'></div>

          {model.isWalletConnected ? (
            <>
              {tma && claimCta}

              <div className='text-text-muted flex flex-col gap-2.5 text-sm'>
                <Row label={t('app.reward.stakedBalance')} value={model.htonBalanceFormatted} />
                <Row label={t('app.reward.valueInGram')} value={model.htonBalanceInTon} />
                <div className='flex flex-col gap-2.5'>
                  {model.totalEarnedSinceFormatted != null && (
                    <p className='text-text-faint text-[12.5px]'>
                      {nodes(t('app.reward.earnedSince'), { date: <Num>{model.totalEarnedSinceFormatted}</Num> })}
                    </p>
                  )}
                  <div className='flex flex-col gap-2.5 ps-3'>
                    <Row label={t('app.reward.totalGramEarned')} value={model.totalEarnedFormatted} />
                    <Row label={t('app.reward.totalHpoEarned')} value={model.totalHpoEarnedFormatted} />
                  </div>
                </div>
                <Row label={t('app.reward.afterYear')} value={model.profitAfterOneYear} />
                <Row label={t('app.reward.rewardRate')} value={rewardRate} />
              </div>

              {level < coefficients.length - 1 && (
                <p className='text-text-faint -mt-2 text-[12.5px]'>
                  {nodes(t('app.reward.lastLevelRewards'), {
                    level: <Num>{model.formatNumber(coefficients.length)}</Num>,
                    amount: <Num>{model.profitAfterOneYearOnLastLevel ?? '—'}</Num>,
                  })}
                </p>
              )}

              {!tma && claimCta}
            </>
          ) : (
            <>
              <p className='text-text-muted text-sm'>
                {nodes(t('app.reward.connectPrompt'), {
                  stakingRewards: <b className='text-text font-medium'>{t('app.reward.stakingRewards')}</b>,
                })}
              </p>
              {!tma && <img src='/images/app/hpo-hgram-gram-gift.webp' alt='' className='h-36 object-contain' />}
              <button
                className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover h-14 w-full cursor-pointer rounded-2xl text-[17px] font-semibold'
                onClick={(e) => {
                  model.connect()
                  const target = e.target as HTMLInputElement
                  target.blur()
                }}
              >
                {t('app.common.connectWallet')}
              </button>
              {tma && <img src='/images/app/hpo-hgram-gram-gift.webp' alt='' className='h-36 object-contain' />}
            </>
          )}
        </div>

        {model.isWalletConnected && rewards == null && model.walletRewardsFetchState === 'error' && (
          <div className='border-border bg-surface flex flex-col rounded-[20px] border p-7'>
            <h2 className='font-fredoka mb-4 text-xl font-semibold'>{t('app.reward.recent')}</h2>
            <p className='text-text-muted mt-4 text-center text-sm'>{t('app.reward.tryAgain')}</p>
          </div>
        )}

        {model.isWalletConnected && rewards != null && (
          <div className='border-border bg-surface flex flex-col rounded-[20px] border p-7'>
            <h2 className='font-fredoka mb-4 text-xl font-semibold'>{t('app.reward.recent')}</h2>

            {rewards.earnedRewards.map((reward, i) => (
              <div className='flex w-full flex-col gap-2 py-3.5 text-sm' key={i}>
                {i > 0 && <div className='bg-border -mt-3.5 mb-2 h-px'></div>}

                <div className='text-text-muted flex flex-row'>
                  <div
                    className='num'
                    title={model.formatDate(reward.time, {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  >
                    {model.formatDate(reward.time, { month: 'long', day: '2-digit' })}
                  </div>
                  <div className='ms-auto'>{t('app.reward.rowLabel')}</div>
                </div>

                <div className='flex flex-row items-center'>
                  <img src='/images/app/gram.svg' alt='' className='h-7 w-7' />
                  <div className='ms-auto flex flex-row gap-1'>
                    <span className='text-positive num font-medium'>
                      {model.formatNumber(
                        reward.tonReward + (reward.time >= new Date(1781256166 * 1_000) ? reward.stakeReward : 0),
                        { maximumFractionDigits: 9 },
                      )}
                    </span>
                    <span className='text-text-faint'>GRAM</span>
                  </div>
                </div>

                <div className='flex flex-row items-center'>
                  {/* hpo.svg is dark-on-transparent and disappears on the warm-dark surface. */}
                  <img src='/hpo.png' alt='' className='h-7 w-7' />
                  <div className='ms-auto flex flex-row gap-1'>
                    <span className='text-positive num font-medium'>
                      {model.formatNumber(reward.hpoReward, { maximumFractionDigits: 9 })}
                    </span>
                    <span className='text-text-faint'>HPO</span>
                  </div>
                </div>
              </div>
            ))}

            {model.walletRewardsFetchState === 'error' && (
              <p className='text-text-muted mt-4 text-center text-sm'>{t('app.reward.tryAgain')}</p>
            )}

            {rewards.earnedRewards.length === 0 && model.htonBalance > 0n && (
              <div className='flex flex-col gap-6'>
                <p className='text-text-muted text-center text-sm'>
                  {nodes(t('app.reward.firstRewardWithin'), {
                    hours: <b className='text-text font-medium'>{t('app.reward.firstRewardHours')}</b>,
                  })}
                </p>
                <img src='/images/app/hpo-hgram-gram-gift.webp' alt='' className='h-36 object-contain' />
              </div>
            )}

            {rewards.earnedRewards.length === 0 && model.htonBalance === 0n && (
              <div className='flex flex-col gap-6'>
                <p className='text-text-muted text-center text-sm'>{t('app.reward.startStaking')}</p>
                <img src='/images/app/hpo-hgram-gram-gift.webp' alt='' className='h-36 object-contain' />
                <button
                  className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover h-14 w-full cursor-pointer rounded-2xl text-[17px] font-semibold'
                  onClick={() => {
                    model.navigateToTab('stake')
                  }}
                >
                  {t('app.reward.stakeNow')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export default Reward
