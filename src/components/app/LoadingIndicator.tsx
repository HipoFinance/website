import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

// The Model's own reads (the stake form's block poll, /wallet-rewards). Not on the Club pages: they
// show their own loading state (skeleton cards, busy buttons), and there the only read counted here
// is the stake form's block read, which nothing on the page waits for — a read that kept failing
// (an endpoint outage, or localhost, which the endpoint refuses) left the ring spinning for good.
const LoadingIndicator = observer(({ model }: Props) => {
  return (
    <div
      className={
        'bg-surface-deep/70 pointer-events-none fixed end-5 bottom-20 z-50 w-10 rounded-full sm:bottom-2' +
        (model.ongoingRequests > 0 && model.activePage !== 'club' ? '' : ' hidden')
      }
    >
      <img src='/images/app/loading-dark.svg' alt='' className='h-10 animate-spin' />
    </div>
  )
})

export default LoadingIndicator
