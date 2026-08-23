import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { Model } from './Model'

interface Props {
  model: Model
}

interface RowProps {
  logo: string
  name: string
  round?: boolean
  actions: { label: string; href: string; target: string }[]
}

// One compact row per partner: logo, name, and small action pills — a table, not a card wall.
// Partner names are proper nouns and stay as-is; the action labels come translated from the parent.
const Row = ({ logo, name, round, actions }: RowProps) => (
  <div className='border-border flex flex-row items-center gap-3 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0'>
    <img src={logo} alt='' className={'h-9 w-9 object-contain' + (round === true ? ' rounded-full' : '')} />
    <p className='font-medium'>{name}</p>
    <div className='ms-auto flex flex-row gap-2'>
      {actions.map(({ label, href, target }) => (
        <a
          key={target + label}
          className='bg-accent text-on-accent hover:bg-accent-hover rounded-full px-3.5 py-1.5 text-[13px] font-semibold'
          href={href}
          target={target}
          rel='noopener noreferrer'
        >
          {label}
        </a>
      ))}
    </div>
  </div>
)

const Section = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <div className='border-border bg-surface rounded-[20px] border p-6'>
    <h2 className='font-fredoka text-xl font-semibold'>{title}</h2>
    <p className='text-text-muted mt-1 mb-4 text-sm'>{description}</p>
    <div className='flex flex-col'>{children}</div>
  </div>
)

const Defi = observer(({ model }: Props) => {
  const t = model.t
  const swap = t('app.defi.swap')
  const earn = t('app.defi.earn')
  const use = t('app.defi.use')
  return (
    <div className='font-body text-text mx-auto w-full max-w-[560px] px-6 pt-10 pb-8'>
      <div className='pb-7 text-center'>
        <h1 className='font-fredoka mb-2 text-3xl font-semibold sm:text-[34px]'>{t('app.defi.title')}</h1>
        <p className='text-text-muted mx-auto max-w-lg text-base'>{t('app.defi.subtitle')}</p>
      </div>

      <div className='flex flex-col gap-4'>
        <Section title={t('app.defi.exchanges')} description={t('app.defi.exchangesDescription')}>
          <Row
            logo='/images/app/dedust.png'
            name='DeDust'
            actions={[
              { label: swap, href: model.dedustSwapUrl, target: 'hipo_dedust' },
              { label: earn, href: model.dedustPoolUrl, target: 'hipo_dedust' },
            ]}
          />
          <Row
            logo='/images/app/ston.png'
            name='STON.fi'
            actions={[
              { label: swap, href: model.stonSwapUrl, target: 'hipo_ston' },
              { label: earn, href: model.stonPoolUrl, target: 'hipo_ston' },
            ]}
          />
          <Row
            logo='/images/app/tonco.svg'
            name='TONCO'
            actions={[
              { label: swap, href: model.toncoSwapUrl, target: 'hipo_tonco' },
              { label: earn, href: model.toncoPoolUrl, target: 'hipo_tonco' },
            ]}
          />
        </Section>

        <Section title={t('app.defi.aggregators')} description={t('app.defi.aggregatorsDescription')}>
          <Row
            logo='/images/app/groypfi.png'
            name='GroypFi'
            round
            actions={[{ label: swap, href: model.groypfiSwapUrl, target: 'hipo_groypfi' }]}
          />
          <Row
            logo='/images/app/swapcoffee.png'
            name='swap.coffee'
            round
            actions={[{ label: swap, href: model.swapCoffeeSwapUrl, target: 'hipo_swapcoffee' }]}
          />
        </Section>

        <Section title={t('app.defi.wallets')} description={t('app.defi.walletsDescription')}>
          <Row
            logo='/images/app/tonspace.jpg'
            name='Ton Space'
            round
            actions={[{ label: use, href: model.tonspaceUrl, target: 'hipo_tonspace' }]}
          />
          <Row
            logo='/images/app/mytonwallet.webp'
            name='MyTonWallet'
            round
            actions={[{ label: use, href: model.mtwUrl, target: 'hipo_mtw' }]}
          />
        </Section>
      </div>
    </div>
  )
})

export default Defi
