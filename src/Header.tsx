import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
    model: Model
}

const Header = observer(({ model }: Props) => {
    return (
        <div className='mx-auto min-w-[360px] bg-background bg-fixed py-4 text-center md:py-8 lg:py-16'>
            <div className='font-body text-brown dark:text-dark-50 mx-auto w-full max-w-screen-lg bg-background py-8'>
                {!model.isBannerClosed && (
                    <div className='fixed left-0 right-0 top-0 z-50 mx-auto max-w-screen-lg'>
                        <div className='w-fiull border-1 relative mx-4 my-4 flex flex-col-reverse items-start justify-items-end gap-0 rounded-2xl border-c6 bg-c4 px-4 py-2 md:flex-row md:items-center md:justify-between md:gap-4'>
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
                                        <button className='rounded-xl bg-c6 px-8 py-2 text-white'>Earn Now</button>
                                    </a>
                                </div>
                            </div>
                            <div className='absolute right-0 top-0 flex w-full flex-row justify-end md:static md:w-fit'>
                                <button
                                    className='p-3 text-xs font-bold text-c6 md:py-2'
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
                <div
                    className={
                        'mx-auto mb-10 px-4 md:mb-16 md:max-w-screen-xl' +
                        (!model.isBannerClosed ? ' mt-28 md:mt-8' : '')
                    }
                >
                    <div className='flex w-full flex-row items-center'>
                        {/* <!-- Logo --> */}
                        <div className='flex flex-row items-center gap-2 pr-2'>
                            <a href='https://hipo.finance/'>
                                <img className='size-10 md:size-16' src='hipo.svg' alt='Hipo Logo' />
                            </a>
                            <a href='https://hipo.finance/'>
                                <div className='font-eczar text-xl text-white md:text-2xl'>Hipo</div>
                            </a>
                        </div>

                        <nav className='flex grow flex-col items-end px-2 shadow-md'>
                            <div className='text-bold flex flex-row md:mx-auto md:text-[18px]'>
                                {/* <!-- Hamburger button (shown on mobile) --> */}
                                <button
                                    id='menu-toggle'
                                    className='text-white focus:outline-none md:hidden'
                                    title='Toggle mobile menu'
                                    onClick={() => {
                                        model.toggleMenu()
                                    }}
                                >
                                    <svg
                                        className='h-6 w-6'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        viewBox='0 0 24 24'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    >
                                        <path d='M4 6h16M4 12h16M4 18h16' />
                                    </svg>
                                </button>

                                <ul id='menu' className='hidden space-x-6 pb-2 pt-6 font-bold md:flex'>
                                    <li>
                                        <a href='#how-it-works' className='hover:text-purple-500'>
                                            How it works
                                        </a>
                                    </li>
                                    <li>
                                        <a href='#audits' className='hover:text-purple-500'>
                                            Audits
                                        </a>
                                    </li>
                                    <li>
                                        <a href='#hpo' className='hover:text-purple-500'>
                                            HPO
                                        </a>
                                    </li>
                                    <li>
                                        <a href='#hipo-club' className='hover:text-purple-500'>
                                            Hipo Club
                                        </a>
                                    </li>
                                    <li>
                                        <a href='#why-hipo' className='hover:text-purple-500'>
                                            Why Hipo
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </nav>

                        <div className='hidden md:block md:pl-2'>
                            <a
                                className='hipo-app-button-a'
                                href='https://app.hipo.finance'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <div className='text-lg font-normal'>Go to App</div>
                            </a>
                        </div>
                    </div>

                    {/* <!-- Mobile menu (hidden by default) --> */}
                    <div
                        id='mobile-menu'
                        className={'items-end px-4 pb-4 pt-2 text-end' + (model.isMenuHidden ? ' hidden' : '')}
                    >
                        <ul className='space-y-2 text-white'>
                            <li>
                                <a
                                    href='#how-it-works'
                                    className='block hover:text-purple-500'
                                    onClick={() => {
                                        model.toggleMenu()
                                    }}
                                >
                                    How it works
                                </a>
                            </li>
                            <li>
                                <a
                                    href='#audits'
                                    className='block hover:text-purple-500'
                                    onClick={() => {
                                        model.toggleMenu()
                                    }}
                                >
                                    Audits
                                </a>
                            </li>
                            <li>
                                <a
                                    href='#hpo'
                                    className='block hover:text-purple-500'
                                    onClick={() => {
                                        model.toggleMenu()
                                    }}
                                >
                                    HPO
                                </a>
                            </li>
                            <li>
                                <a
                                    href='#hipo-club'
                                    className='block hover:text-purple-500'
                                    onClick={() => {
                                        model.toggleMenu()
                                    }}
                                >
                                    Hipo Club
                                </a>
                            </li>
                            <li>
                                <a
                                    href='#why-hipo'
                                    className='block hover:text-purple-500'
                                    onClick={() => {
                                        model.toggleMenu()
                                    }}
                                >
                                    Why Hipo
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default Header
