import { observer } from 'mobx-react-lite'
import { Model } from './Model.ts'
import Header from './Header.tsx'
import Landing from './Landing.tsx'
import Footer from './Footer.tsx'

interface Props {
    model: Model
}

const App = observer(({ model }: Props) => {
    return (
        <div className='font-body text-brown dark:text-dark-50'>
            <Header model={model} />
            <Landing model={model} />
            <Footer model={model} />
        </div>
    )
})

export default App
