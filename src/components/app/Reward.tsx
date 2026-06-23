import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const Referral = observer(({ model }: Props) => {
  return (
    <div className='font-body text-brown dark:text-dark-50 mx-auto w-full max-w-5xl p-4 pb-32'>
      <p className='px-8 pt-4 text-center text-3xl font-bold'>Staking Rewards</p>
      <p className='mt-2 mb-4 px-8 text-center'>Track your hGRAM rewards.</p>

      {model.isWalletConnected || (
        <div className='dark:bg-dark-700 mx-auto mt-4 max-w-md rounded-xl bg-white shadow-md'>
          <div className='mx-auto flex max-w-sm flex-col gap-8 p-8'>
            <p className='text-center'>
              Connect your TON wallet to view your <b className='font-bold'>staking rewards</b>.
            </p>
            <img src='/images/app/hpo-hton-ton-gift.webp' className='h-36 object-contain' />
            <button
              className='bg-orange dark:text-dark-600 mx-auto block h-14 w-full rounded-2xl text-lg font-medium text-white sm:w-80'
              onClick={(e) => {
                model.connect()
                const target = e.target as HTMLInputElement
                target.blur()
              }}
            >
              {model.buttonLabel}
            </button>
          </div>
        </div>
      )}

      {model.isWalletConnected && (
        <>
          <div className='dark:bg-dark-700 mx-auto mb-4 flex max-w-md flex-col rounded-xl bg-white p-8 text-sm shadow-md'>
            <h3 className='mb-2 font-bold'>Current Balance</h3>
            <div className='flex flex-row gap-1'>
              <p className=''>{model.htonBalanceFormatted}</p>
              <p className='text-gray-400'>{model.htonBalanceInTon}</p>
            </div>

            <hr className='my-4' />

            <h3 className='mb-2 font-bold'>Rewards After a Year</h3>
            <div className='flex flex-row gap-1'>
              <p className=''>{model.profitAfterOneYear}</p>
            </div>

            <hr className='my-4' />

            <h3 className='mb-2 font-bold'>Reward Rate</h3>
            <div className=''>
              {model.walletRewards != null && (
                <p className=''>
                  {(model.walletRewards.rewardCoefficients ?? [1])[model.walletRewards.clubLevel] ?? 1}x (Level{' '}
                  {model.walletRewards.clubLevel + 1}
                  <span className='text-gray-400'>/{(model.walletRewards.rewardCoefficients ?? [1]).length}</span>)
                </p>
              )}
            </div>
            {(model.walletRewards?.clubLevel ?? 0) < (model.walletRewards?.rewardCoefficients ?? [1]).length - 1 && (
              <p className='text-gray-400'>
                Level {(model.walletRewards?.rewardCoefficients ?? [1]).length} Rewards:{' '}
                {model.profitAfterOneYearOnLastLevel}
              </p>
            )}

            <a
              className='bg-orange dark:text-dark-600 mx-auto mt-8 block h-14 w-full cursor-pointer place-content-center rounded-2xl text-center text-lg font-medium text-white sm:w-80'
              href='https://t.me/HipoFinanceBot/join'
            >
              {model.claimWalletRewardsLabel}
            </a>
          </div>

          {model.walletRewards != null && (
            <div className='dark:bg-dark-700 mx-auto flex max-w-md flex-col rounded-xl bg-white px-8 shadow-md'>
              <h3 className='mt-8 mb-4 font-bold'>Recent Rewards</h3>

              {model.walletRewards.earnedRewards.map((reward, i) => (
                <div className='my-4 flex w-full flex-col gap-2 text-sm' key={i}>
                  {i > 0 && <hr className='-mt-2 mb-2' />}

                  <div className='flex flex-row'>
                    <div
                      className=''
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
                    <img src='/images/app/gram.svg' className='h-8 w-8' />
                    <div className='ml-auto flex flex-row gap-1'>
                      <span className='text-green-600'>
                        {(
                          reward.tonReward + (reward.time >= new Date(1781256166 * 1_000) ? reward.stakeReward : 0)
                        ).toLocaleString('en', {
                          maximumFractionDigits: 9,
                        })}
                      </span>
                      <span className='text-gray-400'>GRAM</span>
                    </div>
                  </div>

                  <div className='flex flex-row items-center'>
                    <img src='/images/app/hpo.svg' className='h-8 w-8' />
                    <div className='ml-auto flex flex-row gap-1'>
                      <span className='text-green-600'>{reward.hpoReward}</span>
                      <span className='text-gray-400'>HPO</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className='mt-8 flex flex-col place-content-center items-center gap-1'>
                {model.walletRewardsFetchState === 'error' && (
                  <p className=''>Oops! Please try again a little later.</p>
                )}
              </div>

              {model.walletRewards?.earnedRewards.length === 0 && model.htonBalance > 0n && (
                <div className='mx-auto flex max-w-md flex-col gap-8 p-8'>
                  <p className='text-center'>
                    Your first reward will be credited within <b className='font-bold'>36 hours</b>.
                  </p>
                  <img src='/images/app/hpo-hton-ton-gift.webp' className='h-36 object-contain' />
                </div>
              )}

              {model.walletRewards?.earnedRewards.length === 0 && model.htonBalance === 0n && (
                <div className='mx-auto -mt-8 flex max-w-sm flex-col gap-8 p-8'>
                  <p className='text-center'>Start staking with Hipo for daily rewards!</p>
                  <img src='/images/app/hpo-hton-ton-gift.webp' className='h-36 object-contain' />
                  <button
                    className='bg-orange dark:text-dark-600 mx-auto block h-14 w-full rounded-2xl text-lg font-medium text-white sm:w-80'
                    onClick={() => {
                      model.setActivePage('stake')
                      model.setActiveTab('stake')
                    }}
                  >
                    Stake Now
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
})

export default Referral
