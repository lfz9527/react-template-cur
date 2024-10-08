import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/assets/icons/index'
import App from './app'

const rootElement = document.getElementById('root')
const root = ReactDOM.createRoot(rootElement as HTMLDivElement)
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
