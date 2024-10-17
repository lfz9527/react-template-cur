import React from 'react'
import {ErrorBlock, Space} from 'antd-mobile'
const NotFound = () => {
    return (
        <div id='app'>
            <Space
                justify='center'
                block
                direction='vertical'
                style={{height: '100vh'}}
            >
                {/* 如果404直接重定向回应用列表页 */}
                <ErrorBlock status='empty' />
            </Space>
        </div>
    )
}

export default NotFound
