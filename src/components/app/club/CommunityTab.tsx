// The Community tab, "coming soon" until Limzo delivers its data (specs/club-website.md §9, K1; the
// copy is the spec's draft for mili). No points and no Limzo calls.
import { observer } from 'mobx-react-lite'
import { Send } from 'lucide-react'
import type { ClubModel } from './ClubModel.ts'
import { HIPO_CHAT_URL, LIMZO_URL } from './ClubModel.ts'
import { Card } from './ui.tsx'

interface Props {
  club: ClubModel
}

const CommunityTab = observer(({ club }: Props) => {
  const t = club.t
  return (
    <Card>
      <h2 className='font-display text-2xl font-extrabold'>{t('club.community.title')}</h2>
      <p className='text-text-muted text-body leading-normal'>{t('club.community.body')}</p>
      <div className='flex flex-wrap items-center gap-3'>
        <a
          className='border-border-control text-text hover:text-accent inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2'
          href={HIPO_CHAT_URL}
          target='_blank'
          rel='noopener noreferrer'
        >
          <Send className='size-4 shrink-0' aria-hidden='true' />
          {t('club.community.chat')}
        </a>
        <a
          className='text-text-muted hover:text-accent text-label underline underline-offset-4'
          href={LIMZO_URL}
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('club.community.limzo')}
        </a>
      </div>
    </Card>
  )
})

export default CommunityTab
