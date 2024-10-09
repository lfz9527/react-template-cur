import React from 'react'
import {useRoutes} from 'react-router-dom'
import './app.less'
import routes from './core/router'

const App = () => {
    // 通过useRoutes配置实现路由管理
    const element = useRoutes(routes)
    return <div className='app'>{element}</div>
}

export default App
