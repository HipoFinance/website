import { observer } from 'mobx-react-lite'
import { Model } from './Model'
import TestnetBadge from './TestnetBadge.tsx'

interface Props {
  model: Model
}

const Header = observer(({ model }: Props) => {
  return (
    <div className='font-body text-brown dark:text-dark-50 mx-auto w-full max-w-5xl'>
      {!model.isBannerClosed && (
        <div className='fixed top-0 right-0 left-0 z-50 mx-auto max-w-5xl'>
          <div className='w-fiull border-c6 bg-c4 relative mx-4 my-4 flex flex-col-reverse items-start justify-items-end gap-0 rounded-2xl border px-4 py-2 md:flex-row md:items-center md:justify-between md:gap-4'>
            <div className='flex w-full flex-col items-center justify-between gap-2 md:flex-row'>
              <div className='text-c7'>
                <div className='flex flex-col items-center gap-1 md:hidden'>
                  <div>
                    💰 <b>Earn 100% of staking rewards</b>.
                  </div>
                  <div>Protocol fee is now 0%.</div>
                </div>
                <div className='max-md:hidden'>
                  💰 <b>Earn 100% of staking rewards</b>. Protocol fee is now 0%.
                </div>
              </div>
              <div>
                <a href='http://t.me/HipoFinanceBot/join' target='_blank' rel='noopener noreferrer'>
                  <button className='bg-c6 rounded-xl px-8 py-2 text-white'>Earn Now</button>
                </a>
              </div>
            </div>
            <div className='absolute top-0 right-0 flex w-full flex-row justify-end md:static md:w-fit'>
              <button
                className='text-c6 p-3 text-xs font-bold md:py-2'
                onClick={() => {
                  model.closeBanner()
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={'mx-4 flex flex-row items-center pt-4' + (!model.isBannerClosed ? ' mt-40 md:mt-16' : '')}>
        <a href='https://hipo.finance' className='-mr-3 -ml-4'>
          <img src='/images/app/logo.svg' className='h-20 dark:hidden' />
          <img src='/images/app/logo-dark.svg' className='hidden h-20 dark:block' />
        </a>

        <TestnetBadge model={model} />

        <ul className='border-c1 bg-milky dark:border-c2 dark:bg-choco fixed bottom-0 left-0 z-10 flex w-full flex-row border-t text-sm font-thin select-none sm:static sm:ml-2 sm:w-auto sm:border-0 sm:bg-transparent sm:dark:bg-transparent'>
          <li
            className={
              'flex-1 cursor-pointer pt-3 text-center whitespace-nowrap sm:ml-4 sm:flex-none sm:pt-0' +
              (model.activePage === 'stake' ? ' text-dark-600' : ' text-brown')
            }
            onClick={() => {
              model.setActivePage('stake')
            }}
          >
            <div className='flex flex-col items-center sm:flex-row sm:pl-2'>
              <img
                src='/images/app/page-stake-brown.svg'
                className={'h-4 dark:hidden!' + (model.activePage !== 'stake' ? ' block' : ' hidden')}
              />
              <img
                src='/images/app/page-stake-white.svg'
                className={'hidden h-4' + (model.activePage !== 'stake' ? ' dark:block!' : ' sm:dark:block!')}
              />
              <img
                src='/images/app/page-stake-orange.svg'
                className={'h-4 sm:hidden' + (model.activePage === 'stake' ? ' block' : ' hidden')}
              />
              <img
                src='/images/app/page-stake-black.svg'
                className={'hidden h-4' + (model.activePage === 'stake' ? ' sm:block dark:hidden!' : '')}
              />
              <span className='p-2 dark:text-white'>Stake</span>
            </div>
            <div
              className={'bg-orange mt-1 hidden h-1 rounded-full' + (model.activePage === 'stake' ? ' sm:block!' : '')}
            ></div>
          </li>
          <li
            className={
              'flex-1 cursor-pointer pt-3 text-center whitespace-nowrap sm:ml-4 sm:flex-none sm:pt-0' +
              (model.activePage === 'reward' ? ' text-dark-600' : ' text-brown')
            }
            onClick={() => {
              model.setActivePage('reward')
            }}
          >
            <div className='flex flex-col items-center sm:flex-row sm:pl-2'>
              <img
                src='/images/app/page-reward-brown.svg'
                className={'h-4 dark:hidden!' + (model.activePage !== 'reward' ? ' block' : ' hidden')}
              />
              <img
                src='/images/app/page-reward-white.svg'
                className={'hidden h-4' + (model.activePage !== 'reward' ? ' dark:block!' : ' sm:dark:block!')}
              />
              <img
                src='/images/app/page-reward-orange.svg'
                className={'h-4 sm:hidden' + (model.activePage === 'reward' ? ' block' : ' hidden')}
              />
              <img
                src='/images/app/page-reward-black.svg'
                className={'hidden h-4' + (model.activePage === 'reward' ? ' sm:block dark:hidden!' : '')}
              />
              <span className='p-2 dark:text-white'>Reward</span>
            </div>
            <div
              className={'bg-orange mt-1 hidden h-1 rounded-full' + (model.activePage === 'reward' ? ' sm:block!' : '')}
            ></div>
          </li>
          <li
            className={
              'flex-1 cursor-pointer pt-3 text-center whitespace-nowrap sm:ml-4 sm:flex-none sm:pt-0' +
              (model.activePage === 'defi' ? ' text-dark-600' : ' text-brown')
            }
            onClick={() => {
              model.setActivePage('defi')
            }}
          >
            <div className='flex flex-col items-center sm:flex-row sm:pl-2'>
              <img
                src='/images/app/page-defi-brown.svg'
                className={'h-4 dark:hidden!' + (model.activePage !== 'defi' ? ' block' : ' hidden')}
              />
              <img
                src='/images/app/page-defi-white.svg'
                className={'hidden h-4' + (model.activePage !== 'defi' ? ' dark:block!' : ' sm:dark:block!')}
              />
              <img
                src='/images/app/page-defi-orange.svg'
                className={'h-4 sm:hidden' + (model.activePage === 'defi' ? ' block' : ' hidden')}
              />
              <img
                src='/images/app/page-defi-black.svg'
                className={'hidden h-4' + (model.activePage === 'defi' ? ' sm:block dark:hidden!' : '')}
              />
              <span className='p-2 dark:text-white'>DeFi</span>
            </div>
            <div
              className={'bg-orange mt-1 hidden h-1 rounded-full' + (model.activePage === 'defi' ? ' sm:block!' : '')}
            ></div>
          </li>
        </ul>

        <div className='ml-auto'>
          <img
            src='/images/app/theme.svg'
            onClick={() => {
              model.setDark(true)
            }}
            className='mr-3 block h-4 cursor-pointer dark:hidden'
          />
          <img
            src='/images/app/theme-dark.svg'
            onClick={() => {
              model.setDark(false)
            }}
            className='mr-2 hidden h-6 cursor-pointer dark:block'
          />
        </div>
        <div id='ton-connect-button' className='min-w-max'></div>
      </div>
    </div>
  )
})

export default Header
