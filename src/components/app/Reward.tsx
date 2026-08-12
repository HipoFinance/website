import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <div className='flex flex-row flex-wrap'>
    <p>{label}</p>
    <p className='text-text ml-auto font-medium'>{value ?? '—'}</p>
  </div>
)

const Reward = observer(({ model }: Props) => {
  const rewards = model.walletRewards
  const coefficients = rewards?.rewardCoefficients ?? [1]
  const level = rewards?.clubLevel ?? 0

  // In the mini app the claim button renders above the detail rows instead of below them — on a
  // phone viewport a bottom placement lands under the fold and gets missed.
  const tma = model.isTelegram
  const claimCta = (
    <a
      className='bg-accent text-on-accent hover:bg-accent-hover block h-14 w-full rounded-2xl text-center text-[17px] leading-14 font-semibold'
      href='https://t.me/HipoFinanceBot/join'
      target='_blank'
      rel='noopener noreferrer'
    >
      {model.claimWalletRewardsLabel}
    </a>
  )

  return (
    <div className='font-body text-text mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pt-10 pb-8'>
      <div className='pb-7 text-center'>
        <h1 className='font-fredoka mb-2 text-3xl font-semibold sm:text-[34px]'>Rewards</h1>
        <p className='text-text-muted text-base'>Earn bonus HPO on top of your staking rewards</p>
      </div>

      <div className='flex w-full max-w-[480px] flex-col gap-4'>
        <div className='border-border bg-surface flex flex-col gap-[18px] rounded-[20px] border p-7'>
          <div className='flex flex-row items-center gap-3.5'>
            <img src='/hpo.png' alt='HPO' className='h-12 w-12' />
            <div>
              <div className='font-fredoka text-xl font-semibold'>HPO rewards</div>
              <div className='text-text-muted text-sm'>Distributed to stakers via Hipo Club</div>
            </div>
          </div>

          <div className='bg-border h-px'></div>

          {model.isWalletConnected ? (
            <>
              {tma && claimCta}

              <div className='text-text-muted flex flex-col gap-2.5 text-sm'>
                <Row label='Your staked balance' value={model.htonBalanceFormatted} />
                <Row label='Value in GRAM' value={model.htonBalanceInTon} />
                <Row label='Rewards after a year' value={model.profitAfterOneYear} />
                <Row
                  label='Reward rate'
                  value={
                    rewards != null ? `${coefficients[level] ?? 1}× (Level ${level + 1}/${coefficients.length})` : '—'
                  }
                />
              </div>

              {level < coefficients.length - 1 && (
                <p className='text-text-faint -mt-2 text-[12.5px]'>
                  Level {coefficients.length} rewards: {model.profitAfterOneYearOnLastLevel ?? '—'}
                </p>
              )}

              {!tma && claimCta}
            </>
          ) : (
            <>
              <p className='text-text-muted text-sm'>
                Connect your TON wallet to view your <b className='text-text font-medium'>staking rewards</b> and your
                Hipo Club reward rate.
              </p>
              {!tma && <img src='/images/app/hpo-hgram-gram-gift.webp' alt='' className='h-36 object-contain' />}
              <button
                className='bg-accent text-on-accent hover:bg-accent-hover h-14 w-full cursor-pointer rounded-2xl text-[17px] font-semibold'
                onClick={(e) => {
                  model.connect()
                  const target = e.target as HTMLInputElement
                  target.blur()
                }}
              >
                Connect wallet
              </button>
              {tma && <img src='/images/app/hpo-hgram-gram-gift.webp' alt='' className='h-36 object-contain' />}
            </>
          )}
        </div>

        {model.isWalletConnected && rewards != null && (
          <div className='border-border bg-surface flex flex-col rounded-[20px] border p-7'>
            <h2 className='font-fredoka mb-4 text-xl font-semibold'>Recent rewards</h2>

            {rewards.earnedRewards.map((reward, i) => (
              <div className='flex w-full flex-col gap-2 py-3.5 text-sm' key={i}>
                {i > 0 && <div className='bg-border -mt-3.5 mb-2 h-px'></div>}

                <div className='text-text-muted flex flex-row'>
                  <div
                    title={reward.time.toLocaleString(navigator.language, {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  >
                    {reward.time.toLocaleString(navigator.language, {
                      month: 'long',
                      day: '2-digit',
                    })}
                  </div>
                  <div className='ml-auto'>Rewards</div>
                </div>

                <div className='flex flex-row items-center'>
                  <img src='/images/app/gram.svg' alt='' className='h-7 w-7' />
                  <div className='ml-auto flex flex-row gap-1'>
                    <span className='text-positive font-medium'>
                      {(
                        reward.tonReward + (reward.time >= new Date(1781256166 * 1_000) ? reward.stakeReward : 0)
                      ).toLocaleString('en', {
                        maximumFractionDigits: 9,
                      })}
                    </span>
                    <span className='text-text-faint'>GRAM</span>
                  </div>
                </div>

                <div className='flex flex-row items-center'>
                  {/* hpo.svg is dark-on-transparent and disappears on the warm-dark surface. */}
                  <img src='/hpo.png' alt='' className='h-7 w-7' />
                  <div className='ml-auto flex flex-row gap-1'>
                    <span className='text-positive font-medium'>{reward.hpoReward}</span>
                    <span className='text-text-faint'>HPO</span>
                  </div>
                </div>
              </div>
            ))}

            {model.walletRewardsFetchState === 'error' && (
              <p className='text-text-muted mt-4 text-center text-sm'>Oops! Please try again a little later.</p>
            )}

            {rewards.earnedRewards.length === 0 && model.htonBalance > 0n && (
              <div className='flex flex-col gap-6'>
                <p className='text-text-muted text-center text-sm'>
                  Your first reward will be credited within <b className='text-text font-medium'>36 hours</b>.
                </p>
                <img src='/images/app/hpo-hgram-gram-gift.webp' alt='' className='h-36 object-contain' />
              </div>
            )}

            {rewards.earnedRewards.length === 0 && model.htonBalance === 0n && (
              <div className='flex flex-col gap-6'>
                <p className='text-text-muted text-center text-sm'>Start staking with Hipo for daily rewards!</p>
                <img src='/images/app/hpo-hgram-gram-gift.webp' alt='' className='h-36 object-contain' />
                <button
                  className='bg-accent text-on-accent hover:bg-accent-hover h-14 w-full cursor-pointer rounded-2xl text-[17px] font-semibold'
                  onClick={() => {
                    model.navigateToTab('stake')
                  }}
                >
                  Stake now
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
