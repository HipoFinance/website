import { lazy, Suspense } from 'react'
import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

// The Club is one lazy chunk (specs/club-website.md §1): its UI, its socket client and its payment
// code are fetched only when a Club page renders, so every other page's island stays as it was.
const ClubPage = lazy(() => import('./club/ClubPage.tsx'))

// Holds the page's height while the chunk loads, like the Club's own skeleton cards.
const ClubFallback = () => (
  <div className='mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 pt-2 pb-28 sm:px-6' aria-busy='true'>
    <div className='bg-surface h-11 w-full max-w-md animate-pulse rounded-full'></div>
    <div className='bg-surface h-24 animate-pulse rounded-[20px]'></div>
    <div className='grid gap-4 md:grid-cols-2'>
      <div className='bg-surface h-56 animate-pulse rounded-[20px]'></div>
      <div className='bg-surface h-56 animate-pulse rounded-[20px]'></div>
    </div>
  </div>
)

const ClubLoader = observer(({ model }: Props) => (
  <Suspense fallback={<ClubFallback />}>
    <ClubPage model={model} />
  </Suspense>
))

export default ClubLoader
