import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
    model: Model
}

const Landing = observer(({ model }: Props) => {
    return (
        <div className='mx-auto min-w-[360px] bg-background bg-fixed py-4 text-center md:py-8 lg:py-16'>
            {/* <!-- Title --> */}
            <div className='hipo-section flex flex-col items-start gap-8 text-left md:max-w-screen-lg'>
                {/* <!-- Mobile version --> */}
                <div className='sm:hidden'>
                    <div className='flex flex-col items-start gap-6'>
                        <div className='text-[32px] font-bold'>The #1 Most Profitable Liquid Staking on TON.</div>
                        <div className='mx-auto px-4'>
                            <img className='size-64' src='hipo-bank.webp' alt='Hipo Bank Illustration' />
                        </div>
                        <div className='text-lg'>
                            Join <span className='font-bold text-purple9'>23,000+</span> TON holders earning passive
                            income with Hipo.
                        </div>
                        <div className='hipo-button-div'>
                            <a
                                className='hipo-button-a'
                                href='https://app.hipo.finance/#/'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <div className='hipo-button-label'>Stake Now</div>
                            </a>
                        </div>
                    </div>
                </div>
                {/* <!-- Desktop version --> */}
                <div className='hidden sm:visible sm:flex sm:flex-row'>
                    <div className='flex w-1/2 flex-col items-start gap-6'>
                        <div className='mb-16 text-[48px] font-bold leading-tight md:text-[64px]'>
                            The #1 Most Profitable Liquid Staking on TON.
                        </div>
                        <div className='text-[20px] font-normal md:text-[24px]'>
                            Join <span className='font-bold text-purple9'>23,000+</span> TON holders earning passive
                            income with Hipo.
                        </div>
                        <div className='hipo-button-div'>
                            <a
                                className='hipo-button-a'
                                href='https://app.hipo.finance/#/'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                <div className='hipo-button-label'>Stake Now</div>
                            </a>
                        </div>
                    </div>
                    <div className='w-1/2'>
                        <div className='mx-auto px-4'>
                            <img className='size-full' src='hipo-bank.webp' alt='Hipo Bank Illustration' />
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- Highlights --> */}
            <div className='hipo-section w-full min-w-[280px] text-sm font-bold md:max-w-screen-lg md:text-lg'>
                <div className='rounded-2xl border border-darkblue5 bg-gradient-to-t from-darkblue4 to-darkblue3 p-2'>
                    <div className='mx-auto flex w-full flex-row bg-[url(/dots.svg)] py-6'>
                        <div className='mx-auto flex w-2/7 flex-col items-center gap-4'>
                            <img src='shild.svg' className='size-10' alt='Security Shield Icon' />
                            <p>Audited</p>
                        </div>
                        <div className='mx-auto flex w-2/7 flex-col items-center gap-4'>
                            <img src='lockup.svg' className='size-10' alt='No Lockup Icon' />
                            <p>No Lockup</p>
                        </div>
                        <div className='mx-auto flex w-2/7 flex-col items-center gap-4'>
                            <img src='star-shine.svg' className='size-10' alt='Top Rewards Icon' />
                            <p>Top Rewards</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- How Hipo works --> */}
            <div id='how-it-works' className='hipo-section flex flex-col items-center text-center md:max-w-screen-lg'>
                <div className='hipo-section-title'>How Hipo works</div>
                <div className='hipo-section-summary'>
                    <p>Stake any amount of TON and</p>
                    <p>earn more than just staking rewards!</p>
                </div>

                <div className='hipo-cards-list'>
                    <div className='hipo-how-it-works-card'>
                        <div className='hipo-how-it-works-card-bg'>
                            <div className='hipo-how-it-works-card-template'>
                                <div className='hipo-how-it-works-card-title w-full'>1. Stake TON</div>
                                <div className='hipo-how-it-works-card-text w-full grow pb-4'>
                                    Deposit your TON into Hipo to earn the highest staking rewards in the market.
                                </div>
                                <div className='mx-auto'>
                                    <img className='size-16 lg:size-28' src='ton.svg' alt='TON Token Icon' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='hipo-how-it-works-card'>
                        <div className='hipo-how-it-works-card-bg'>
                            <div className='hipo-how-it-works-card-template'>
                                <div className='hipo-how-it-works-card-title w-full'>2. Get Liquid hTON</div>
                                <div className='hipo-how-it-works-card-text w-full grow pb-4'>
                                    Get hTON representing your staked TON. Its value grows as staking rewards
                                    accumulate, and you can use it across DeFi.
                                </div>
                                <div className='mx-auto'>
                                    <img className='size-16 lg:size-28' src='hton.svg' alt='hTON Token Icon' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='hipo-how-it-works-card'>
                        <div className='hipo-how-it-works-card-bg'>
                            <div className='hipo-how-it-works-card-template'>
                                <div className='hipo-how-it-works-card-title w-full'>3. Earn Bonus HPO</div>
                                <div className='hipo-how-it-works-card-text w-full grow pb-4'>
                                    Enjoy extra rewards in HPO — Hipo&apos;s governance and profit-sharing token.
                                </div>
                                <div className='mx-auto'>
                                    <img className='size-16 lg:size-28' src='hpo.svg' alt='HPO Token Icon' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='hipo-how-it-works-card'>
                        <div className='hipo-how-it-works-card-bg'>
                            <div className='hipo-how-it-works-card-template'>
                                <div className='hipo-how-it-works-card-title w-full'>4. Unstake Anytime</div>
                                <div className='hipo-how-it-works-card-text w-full grow pb-4'>
                                    Return your hTON whenever you want. You&apos;ll receive TON plus your accumulated
                                    staking rewards.
                                </div>
                                <div className='mx-auto'>
                                    <div className='flex flex-row items-center gap-4 text-3xl'>
                                        <img className='size-16 lg:size-28' src='ton.svg' alt='TON Token Icon' />+
                                        <div className='flex flex-row items-center gap-2'>
                                            <img className='size-10 lg:size-16' src='ton.svg' alt='TON Token Icon' />
                                            <img className='size-10 lg:size-16' src='ton.svg' alt='TON Token Icon' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- Hipo Security Audits --> */}
            <div id='audits' className='hipo-section flex w-full flex-col items-center text-center md:max-w-screen-lg'>
                <div className='hipo-section-title'>Hipo Security Audits</div>
                <div className='hipo-section-summary'>
                    <p>One of the most rigorously tested smart contracts in the TON ecosystem.</p>
                </div>

                <div className='hipo-cards-list'>
                    <div className='hipo-audits-card'>
                        <div className='hipo-audits-card-bg'>
                            <div className='hipo-audits-card-template'>
                                <div className='mb-6 flex flex-row items-center gap-1 font-bold'>
                                    <img className='size-4' src='quantstamp.svg' alt='Quantstamp Logo' />
                                    Quantstamp
                                </div>
                                <div className='mb-8 flex flex-col gap-4 text-start'>
                                    <div>Hipo v2 Smart Contract Audit</div>
                                    <div className='text-[18px] text-[#ffffff]/50'>Apr 2025</div>
                                </div>
                                <div className='hipo-see-report-link-text'>
                                    <a
                                        href='https://github.com/HipoFinance/audits?tab=readme-ov-file#2025-04-quantstamp-hipo-audit-report'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        See Report →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='hipo-audits-card'>
                        <div className='hipo-audits-card-bg'>
                            <div className='hipo-audits-card-template'>
                                <div className='mb-6 flex flex-row items-center gap-1 font-bold'>
                                    <div className='flex size-6 items-center justify-center rounded-full bg-gradient-to-t from-green-900 to-green-500 text-xs font-light'>
                                        ET
                                    </div>
                                    Ender Ting
                                </div>
                                <div className='mb-8 flex flex-col gap-4 text-start'>
                                    <div>Hipo v2 Smart Contract Audit</div>
                                    <div className='text-[18px] text-[#ffffff]/50'>March 2024</div>
                                </div>
                                <div className='hipo-see-report-link-text'>
                                    <a
                                        href='https://github.com/HipoFinance/audits?tab=readme-ov-file#2024-03-programcrafter-hipo-audit-report'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        See Report →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='hipo-audits-card'>
                        <div className='hipo-audits-card-bg'>
                            <div className='hipo-audits-card-template'>
                                <div className='mb-6 flex flex-row items-center gap-1 font-bold'>
                                    <img className='size-4' src='tontech.svg' alt='TonTech Logo' />
                                    TonTech
                                </div>
                                <div className='mb-8 flex flex-col gap-4 text-start'>
                                    <div>Hipo v1 Smart Contract Audit</div>
                                    <div className='text-[18px] text-[#ffffff]/50'>Oct 2023</div>
                                </div>
                                <div className='hipo-see-report-link-text'>
                                    <a
                                        href='https://github.com/HipoFinance/audits#2023-10-tontech-hipo-audit-report'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        See Report →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='hipo-audits-card'>
                        <div className='hipo-audits-card-bg'>
                            <div className='hipo-audits-card-template'>
                                <div className='mb-6 flex flex-row items-center gap-1 font-bold'>
                                    <div className='flex size-6 items-center justify-center rounded-full bg-gradient-to-t from-blue-900 to-blue-500 text-xs font-light'>
                                        DS
                                    </div>
                                    Daniil Sedov
                                </div>
                                <div className='mb-8 flex flex-col gap-4 text-start'>
                                    <div>Hipo v1 Smart Contract Audit</div>
                                    <div className='text-[18px] text-[#ffffff]/50'>Oct 2023</div>
                                </div>
                                <div className='hipo-see-report-link-text'>
                                    <a
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        href='https://github.com/HipoFinance/audits#2023-10-daniil-sedov-hipo-audit-report'
                                    >
                                        See Report →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- HPO  --> */}
            <div id='hpo' className='hipo-section flex flex-col items-center gap-8 text-center md:max-w-screen-lg'>
                <div className='hipo-section-title'>HPO</div>
                <div className='hipo-section-summary'>
                    <p>Hipo&apos;s Governance and Profit-Sharing Token!</p>
                </div>
                <div className='flex flex-row flex-wrap gap-2'>
                    <div className='mx-auto mb-8 w-full sm:w-5/12'>
                        <div className='flex flex-auto flex-col items-center'>
                            <div className='mb-4 w-full'>
                                <gecko-coin-price-chart-widget
                                    locale='en'
                                    transparent-background='false'
                                    outlined='true'
                                    coin-id='hipo-governance-token'
                                    initial-currency='usd'
                                ></gecko-coin-price-chart-widget>
                            </div>
                            <div className='flex w-full flex-row justify-between gap-2 text-sm'>
                                <div className='flax-auto space-x-1'>
                                    <span className='font-normal'>Market Cap.:</span>
                                    <span id='hpoMarketCap' className='text-xl font-bold'>
                                        {model.getMarketCap}
                                    </span>
                                </div>
                                <div className='flax-auto space-x-1'>
                                    <span className='font-normal'>Volume:</span>
                                    <span id='hpoVolume' className='text-xl font-bold'>
                                        {model.getTotalVolume}
                                    </span>
                                </div>
                                <div className='flax-auto space-x-1'>
                                    <span className='font-normal'>Holders:</span>
                                    <span id='hpoHolders' className='text-xl font-bold'>
                                        {model.getHoldersCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mx-auto sm:w-5/12'>
                        <div className='flex w-full flex-col items-start gap-6 px-2 text-start'>
                            <div className='hipo-section-text'>
                                Become an HPO holder for revenue-sharing and decision-making in Hipo.
                            </div>
                            <div className='hipo-learn-more-link-text'>
                                <a href='https://hpo.hipo.finance/'>Learn More</a>
                            </div>
                            <div className='hipo-button-div'>
                                <a
                                    className='hipo-button-a'
                                    href='https://app.ston.fi/swap?chartVisible=false&ft=TON&tt=HPO'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <div className='hipo-button-label'>Buy HPO</div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- Hipo Club --> */}
            <div id='hipo-club' className='hipo-section-side-touched bg-gradient-to-t from-darkblue4 to-darkblue3'>
                <div className='bg-top-left flex flex-col items-center gap-8 bg-[url(/mesh.png)] bg-contain bg-no-repeat px-8 py-16 text-center md:px-36'>
                    <div className='hipo-section-title'>Hipo Club</div>
                    <div className='hipo-section-summary'>
                        <p>Community of Hipo Believers</p>
                    </div>
                    <div className='flex flex-row flex-wrap items-center gap-4'>
                        <div className='mx-auto mb-8 items-center sm:w-5/12'>
                            <img className='mx-auto size-24 sm:size-36 md:size-48' src='hpo.svg' alt='Hipo Logo' />
                        </div>
                        <div className='mx-auto sm:w-5/12'>
                            <div className='flex w-full flex-col items-start gap-6 px-2 text-start'>
                                <div className='hipo-section-text'>
                                    Earn HPO by staking in Hipo, and become part of the Hipo community of HPO holders.
                                </div>
                                <div className='hipo-learn-more-link-text'>
                                    <a href='https://docs.hipo.finance/giveaways-and-prizes/hipo-club'>Learn More</a>
                                </div>
                                <div className='hipo-button-div'>
                                    <a
                                        className='hipo-button-a'
                                        href='http://t.me/HipoFinanceBot/join'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        <div className='hipo-button-label'>Join Hipo Club</div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- Why Hipo? --> */}
            <div id='why-hipo' className='hipo-section flex w-full flex-col items-center text-center'>
                <div className='hipo-section-title'>Why Hipo?</div>
                <div className='hipo-section-summary mb-10'>
                    <p>Building the Future of TON Staking, Together!</p>
                </div>

                <div className='hipo-cards-list'>
                    <div className='hipo-why-hipo-card'>
                        <div className='hipo-why-hipo-card-bg'>
                            <div className='flex w-full flex-row items-center gap-2'>
                                <div className='hipo-why-hipo-card-title w-full'>Highest APY</div>
                                <img className='size-10 md:size-16' src='graph.png' alt='Growth Graph Icon' />
                            </div>
                            <div className='hipo-why-hipo-card-text w-full pb-4'>
                                Earn the most competitive staking rewards on TON.
                            </div>
                        </div>
                    </div>

                    <div className='hipo-why-hipo-card'>
                        <div className='hipo-why-hipo-card-bg'>
                            <div className='flex w-full flex-row items-center gap-2'>
                                <div className='hipo-why-hipo-card-title w-full'>Community-Driven</div>
                                <img className='size-10 md:size-16' src='heart-shine.svg' alt='Community Heart Icon' />
                            </div>
                            <div className='hipo-why-hipo-card-text w-full pb-4'>
                                Hipo is built with and for the community.
                            </div>
                        </div>
                    </div>

                    <div className='hipo-why-hipo-card'>
                        <div className='hipo-why-hipo-card-bg'>
                            <div className='flex w-full flex-row items-center gap-2'>
                                <div className='hipo-why-hipo-card-title w-full'>Open-Source & Audited</div>
                                <img className='size-10 md:size-16' src='audit-shield.svg' alt='Audit Shield Icon' />
                            </div>
                            <div className='hipo-why-hipo-card-text w-full pb-4'>
                                One of the most rigorously tested smart contracts on TON.
                            </div>
                        </div>
                    </div>

                    <div className='hipo-why-hipo-card'>
                        <div className='hipo-why-hipo-card-bg'>
                            <div className='flex w-full flex-row items-center gap-2'>
                                <div className='hipo-why-hipo-card-title w-full'>Truly Decentralized</div>
                                <img className='size-10 md:size-16' src='decentralized.svg' alt='Decentralized Icon' />
                            </div>
                            <div className='hipo-why-hipo-card-text w-full pb-4'>
                                Fully DeFi-native and permissionless by design.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default Landing
