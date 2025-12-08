import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Model } from './Model.ts'
import './styles.css'
import '@fontsource/heebo/latin-400.css'
import '@fontsource/heebo/latin-500.css'
import '@fontsource/heebo/latin-700.css'
import '@fontsource/eczar/latin-700.css'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/poppins/latin-900.css'

if (self === top) {
    const model = new Model()
    model.init()

    ReactDOM.createRoot(document.querySelector('#root') ?? document.body).render(
        <React.StrictMode>
            <App model={model} />
        </React.StrictMode>,
    )
} else {
    console.error('Inside a frame')
}
