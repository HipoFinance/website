import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const Footer = observer(({ model }: Props) => {
  return (
    <div className='bg-milky font-body text-brown dark:bg-dark-900 dark:text-dark-50 mt-auto'>
      {/* <!-- Call to Action Banner --> */}
      <div id='cta-banner' className='mx-auto p-4'>
        <div className='mx-auto flex max-w-5xl'>
          <div className='w-fiull border-c6 bg-c4 relative mx-auto my-4 flex flex-col-reverse items-start justify-items-end gap-0 rounded-2xl border px-4 py-2 md:flex-row md:items-center md:justify-between md:gap-4'>
            <div className='flex w-full flex-col items-center justify-between gap-2 md:flex-row'>
              <div className='text-c7'>
                <div className='text-lg'>
                  <p>Join the Hipo community on Telegram - get updates, ask questions, and meet other GRAM holders</p>
                </div>
              </div>
              <div>
                <a href='https://t.me/hipo_chat' target='_blank' rel='noopener noreferrer'>
                  <button className='bg-c6 cursor-pointer rounded-xl px-8 py-2 text-white'>Join Chat</button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-milky font-body text-brown dark:bg-dark-900 dark:text-dark-50 mt-auto'>
        <div className='mx-auto flex w-full max-w-5xl flex-col justify-center px-8 py-8 sm:flex sm:flex-row-reverse sm:items-start sm:px-0'>
          <div className='mx-auto flex flex-row flex-wrap'>
            <div className='mx-8 my-4'>
              <h3 className='text-orange font-bold'>Social</h3>
              <a
                className='my-4 block text-sm'
                href='https://t.me/HipoFinance'
                target='_blank'
                rel='noopener noreferrer'
              >
                Telegram Channel
              </a>
              <a className='my-4 block text-sm' href='https://t.me/hipo_chat' target='_blank' rel='noopener noreferrer'>
                Telegram Chat
              </a>
              <a
                className='my-4 block text-sm'
                href='https://x.com/hipofinance'
                target='_blank'
                rel='noopener noreferrer'
              >
                X
              </a>
              <a
                className='my-4 block text-sm'
                href='https://www.youtube.com/@HipoFinance'
                target='_blank'
                rel='noopener noreferrer'
              >
                YouTube
              </a>
              <a
                className='my-4 block text-sm'
                href='https://medium.com/@hipofinance'
                target='_blank'
                rel='noopener noreferrer'
              >
                Blog
              </a>

              {/* 
            <a className='my-4 block text-sm' href='https://t.me/HipoFinance' target='hipo_telegram'>
              Telegram Channel
            </a>
            <a className='my-4 block text-sm' href='https://twitter.com/hipofinance' target='hipo_twitter'>
              Twitter
            </a>
            <a className='my-4 block text-sm' href='https://www.youtube.com/@HipoFinance' target='hipo_youtube'>
              YouTube
            </a>
            <a className='my-4 block text-sm' href='https://medium.com/@hipofinance' target='hipo_blog'>
              Blog
            </a> */}
            </div>

            {/* <div className='mx-8 my-4'>
            <h3 className='text-orange dark:text-brown font-bold'>Community</h3>
            <a className='my-4 block text-sm' href='https://t.me/hipo_chat' target='hipo_chat'>
              Hipo Chat
            </a>
            <a className='my-4 block text-sm' href='https://t.me/Hipo_hub' target='hipo_hub'>
              Hipo Hub
            </a>
            <a
              className='my-4 block text-sm'
              href='https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv'
              target='dao_votes'
            >
              DAO Votes
            </a>
          </div> */}

            <div className='mx-8 my-4'>
              <h3 className='text-orange font-bold'>Docs</h3>
              <a
                className='my-4 block text-sm'
                href='https://github.com/HipoFinance'
                target='blank'
                rel='noopener noreferrer'
              >
                GitHub
              </a>
              <a className='my-4 block text-sm' href='https://docs.hipo.finance/' target='self'>
                {' '}
                Documentation{' '}
              </a>
              <a className='my-4 block text-sm' href='/hpo' target='_self'>
                {' '}
                About HPO{' '}
              </a>
              <a
                className='my-4 block text-sm'
                href='https://stats.hipo.finance/'
                target='_blank'
                rel='noopener noreferrer'
              >
                Hipo Stats
              </a>
              <a className='my-4 block text-sm' href='/faq' target='_self'>
                {' '}
                FAQ{' '}
              </a>
            </div>
          </div>

          <div className='mx-auto flex max-w-96 flex-col gap-4 px-8 pb-16 sm:w-1/2'>
            <div
              className='font-logo text-orange flex flex-row items-center gap-4 text-2xl font-bold select-none'
              onClick={model.switchNetwork}
            >
              <img src='/images/app/logo.svg' className='-mr-3 -ml-4 h-20 dark:hidden' />
              <img src='/images/app/logo-dark.svg' className='-mr-3 -ml-4 hidden h-20 dark:block' />
              <p>Hipo</p>
            </div>
            <p>Hipo is an open-source liquid staking protocol with one of the most engaged communities on TON.</p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Footer
