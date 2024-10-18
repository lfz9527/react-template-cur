import React, {useEffect, useState} from 'react'
import Card from './card'
import './index.less'
import {Toast} from 'antd-mobile'
import {GetApp, GetPlatList, GetPwaData} from '@/api'
import {Button} from 'antd-mobile'
import {globalState} from '@/core/store'
import {parseQueryStringToObj} from '@/utils'
import {PwaEvent} from '@/enums'

interface AppData {
    app_id: string
    app_name?: string
    app_welcome?: string
}

interface PlatListData {
    icon?: string
    id?: string
    introduction?: string
    plat_name?: string
    plat_url?: string
}

let standalone = 0

const Client = () => {
    const {uuid, setUuid} = globalState()
    const [appData, setAppData] = useState<AppData>({
        app_id: ''
    }) // 应用信息
    const [platList, setPlatList] = useState<PlatListData[]>([]) // 平台列表

    const AppId = process.env.REACT_APP_ID

    useEffect(() => {
        // standalone = Number(search.get('standalone'))
        // console.log('standalone', standalone)

        if (standalone > 0) {
            openPwaCb()
        }
        init()
    }, [])

    // 初始化
    const init = async () => {
        Toast.show({
            icon: 'loading',
            content: '加载中…',
            maskClickable: false,
            duration: 0
        })
        initAppData()
    }

    // 获取应用信息
    const initAppData = async () => {
        try {
            const res = await GetApp({AppID: AppId})
            const cookie = document.cookie
            const {uuid} = parseQueryStringToObj(cookie)
            setUuid(uuid)
            const {data} = res
            const {app_id} = data
            setAppData(data)
            getPlatList(app_id)
        } catch (error) {
            console.log(error)
        }
    }

    // 获取平台列表
    const getPlatList = async (AppID: string) => {
        try {
            const res = await GetPlatList({AppID, uuid})
            const {data = []} = res
            setPlatList(data)
            Toast.clear()
        } catch (error) {
            console.log(error)
        }
    }

    const openPwaCb = () => {
        GetPwaData({step: PwaEvent.openFromPwa})
    }


    const sharePage = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '页面标题',
                    url: window.location.href
                })
            } catch (error) {
                console.error('分享失败', error)
            }
        } else {
            console.log('Web Share API 不被支持')
        }
    }

    return (
        <div className='home-wrap'>
            <div className='top-bg'>
                <div className='top-content'>
                    <div className='left'>
                        <div className='title'>{appData.app_name}</div>
                        <div className='desc'>{appData.app_welcome}</div>
                    </div>
                    {false && (
                        <div className='right'>
                            <Button
                                size='mini'
                                shape='rounded'
                                className='add-btn'
                                onClick={sharePage}
                            >
                                open pwa
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className='card-wrap'>
                {platList.map((v) => {
                    return <Card key={v.id} data={v} />
                })}
            </div>
        </div>
    )
}
export default Client
