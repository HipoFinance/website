import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { Model } from './Model'

interface Props {
  model: Model
}

interface CardProps {
  logo: string
  name: string
  href: string
  target: string
  action: string
  round?: boolean
}

const Card = ({ logo, name, href, target, action, round }: CardProps) => (
  <div className='border-border bg-surface flex w-44 flex-none flex-col items-center gap-3 rounded-[20px] border p-5 text-center'>
    <img src={logo} alt='' className={'h-12 w-12 object-contain' + (round === true ? ' rounded-full' : '')} />
    <p className='font-medium whitespace-nowrap'>{name}</p>
    <a
      className='bg-accent text-on-accent hover:bg-accent-hover w-full rounded-xl px-4 py-2 text-sm font-semibold'
      href={href}
      target={target}
    >
      {action}
    </a>
  </div>
)

const Section = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <div className='flex flex-col items-start gap-6 py-8 sm:flex-row sm:gap-10'>
    <div className='flex-1 sm:max-w-64'>
      <h2 className='font-fredoka text-2xl font-semibold'>{title}</h2>
      <p className='text-text-muted mt-2'>{description}</p>
    </div>
    <div className='flex w-full flex-1 flex-row flex-wrap items-stretch justify-center gap-4'>{children}</div>
  </div>
)

const Defi = observer(({ model }: Props) => {
  return (
    <div className='font-body text-text mx-auto w-full max-w-[1120px] px-6 pt-10 pb-8 sm:px-10'>
      <div className='pb-4 text-center'>
        <h1 className='font-fredoka mb-2 text-3xl font-semibold sm:text-[34px]'>What can I do with hGRAM?</h1>
        <p className='text-text-muted mx-auto max-w-lg text-base'>
          Maximize the potential of your capital with hGRAM in TON DeFi protocols
        </p>
      </div>

      <Section title='Swap on DEXs' description='hGRAM can be traded on DEXs for other tokens.'>
        <Card
          logo='/images/app/dedust.png'
          name='DeDust'
          href={model.dedustSwapUrl}
          target='hipo_dedust'
          action='Swap now'
        />
        <Card
          logo='/images/app/ston.png'
          name='STON.fi'
          href={model.stonSwapUrl}
          target='hipo_ston'
          action='Swap now'
        />
        <Card
          logo='/images/app/tonco.svg'
          name='TONCO'
          href={model.toncoSwapUrl}
          target='hipo_tonco'
          action='Swap now'
        />
      </Section>

      <Section
        title='Provide liquidity'
        description='Use hGRAM to provide liquidity on DEXs, earning fees, and reward.'
      >
        <Card
          logo='/images/app/dedust.png'
          name='DeDust'
          href={model.dedustPoolUrl}
          target='hipo_dedust'
          action='Earn now'
        />
        <Card
          logo='/images/app/ston.png'
          name='STON.fi'
          href={model.stonPoolUrl}
          target='hipo_ston'
          action='Earn now'
        />
        <Card
          logo='/images/app/tonco.svg'
          name='TONCO'
          href={model.toncoPoolUrl}
          target='hipo_tonco'
          action='Earn now'
        />
      </Section>

      <Section title='TON wallets' description='Partner wallets supporting hGRAM and HPO.'>
        <Card
          logo='/images/app/tonspace.jpg'
          name='Ton Space'
          href={model.tonspaceUrl}
          target='hipo_tonspace'
          action='Use now'
          round
        />
        <Card
          logo='/images/app/mytonwallet.webp'
          name='MyTonWallet'
          href={model.mtwUrl}
          target='hipo_mtw'
          action='Use now'
          round
        />
      </Section>
    </div>
  )
})

export default Defi
