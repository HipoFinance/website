// The Community tab, "coming soon" until Limzo delivers its data (specs/club-website.md §9, K1; the
// copy is the spec's draft for mili). No points and no Limzo calls.
import { observer } from 'mobx-react-lite'
import type { ClubModel } from './ClubModel.ts'
import { HIPO_CHAT_URL, LIMZO_URL } from './ClubModel.ts'
import { Button, Card } from './ui.tsx'

interface Props {
  club: ClubModel
}

const CommunityTab = observer(({ club }: Props) => {
  const t = club.t
  return (
    <Card>
      <h2 className='font-fredoka text-2xl font-semibold'>{t('club.community.title')}</h2>
      <p className='text-text-muted text-[15px] leading-relaxed'>{t('club.community.body')}</p>
      <div className='flex flex-wrap items-center gap-3'>
        <Button kind='primary' href={HIPO_CHAT_URL}>
          {t('club.community.chat')}
        </Button>
        <a
          className='text-text-muted hover:text-accent text-sm'
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
