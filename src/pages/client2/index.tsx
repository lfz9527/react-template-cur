import React from 'react'
import ReactDOM from 'react-dom/client'
import TanStackQueryProvider from '@/core/http/TanStackQueryProvider'
import '@/assets/icons/index'
import '@/styles/index.less'
import 'antd-mobile/es/global'
import App from './app'

const rootElement = document.getElementById('root')
const root = ReactDOM.createRoot(rootElement as HTMLDivElement)
root.render(
    <TanStackQueryProvider>
        <App />
    </TanStackQueryProvider>
)
