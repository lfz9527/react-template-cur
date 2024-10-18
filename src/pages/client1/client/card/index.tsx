import React, {FC} from 'react'
import './index.less'
import {Button} from 'antd-mobile'
import {GoPlat} from '@/api'

const baseURL = process.env.REACT_APP_BASE_URL

interface Props {
    data?: any
}

const Card: FC<Props> = (props) => {
    const {data = {}} = props

    // 跳转应用
    const applyFn = async () => {
        const {plat_url, id} = data
        // 数据埋点
        GoPlat({PlatId: id})
        window.open(plat_url, '_blank')
    }

    return (
        <div>
            <div className='card-content' onClick={applyFn}>
                <div className='left content'>
                    <img src={baseURL + data.icon} alt='logo' />
                </div>
                <div className='mid content'>
                    <div className='title'>{data.plat_name}</div>
                    <div className='desc'>{data.introduction}</div>
                </div>
                <div className='right content'>
                    <Button color='primary' size='mini' shape='rounded'>
                        {/* 立即申请 */}
                        Apply Now
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Card
