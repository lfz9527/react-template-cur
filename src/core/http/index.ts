import axios, {
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios'
import {ResponseType} from '@/types'

const BASE_URL =  ''
type requestType = 'json' | 'form'



const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 120000, // 超时时间120秒
    validateStatus() {
        // 使用async-await，处理reject情况较为繁琐，所以全部返回resolve，在业务代码中处理异常
        return true
    }
})

// 请求拦截器
instance.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => {
        return request
    },
    (err: AxiosError) => {
        return Promise.reject(err)
    }
)

// 响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (err: AxiosError) => Promise.reject(err)
)

const request = async <T>(
    url: string,
    options: AxiosRequestConfig & {requestType?: requestType}
): Promise<ResponseType<T>> => {
    // 兼容from data文件上传的情况
    const {requestType, ...rest} = options
    try {
        const headers = {
            ...(rest.headers || {})
        }
        if (requestType === 'form') {
            headers['Content-Type'] = 'multipart/form-data'
        }
        const response = await instance.request<ResponseType<T>>({
            url,
            ...rest,
            headers
        })
        const {status, data} = response
        // 处理 HTTP 状态码
        if (status < 200 || status >= 500) {
            return Promise.reject()
        }
        if (data.code !== 1) {
            return Promise.reject(data)
        }
        return Promise.resolve(data)
    } catch (error) {
        return Promise.reject(error)
    }
}

export default request
