/*
 * @file: 接口列表
 */
import http from '@/core/http'
import {ResponseType} from '@/types'
/**
 * @function get
 * @description 请求测试
 */

// 获取app数据
export function GetApp(data): Promise<ResponseType> {
    return http('/Api/App/GetApp', {
        params: {
            ...data,
        }
    })
}

// 获取平台列表
export function GetPlatList(data): Promise<ResponseType> {
    return http('/Api/Plat/List',{
        params: data
    })
}

// 点击平台跳转埋点
export function GoPlat(data): Promise<ResponseType> {
    return http('/Api/Plat/GoPlat',{
        params: data
    })
}

// pwa 埋点

export function GetPwaData(data): Promise<ResponseType> {
    return http( '/Api/App/Pwa',{
        params: {
            ...data,
        }
    })
}
