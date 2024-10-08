// 接口响应类型
export interface ResponseType<T = any> {
    code: number
    msg: string
    data: T
}
