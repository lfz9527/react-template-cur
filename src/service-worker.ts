/// <reference lib="webworker" />
// @eslint-disable no-restricted-globals
import {clientsClaim, setCacheNameDetails} from 'workbox-core'
import {precacheAndRoute} from 'workbox-precaching'
// import {registerRoute} from 'workbox-routing'
declare const self: ServiceWorkerGlobalScope

// const PUBLIC_URL = process.env.PUBLIC_URL || '/'

const name = 'MCash'
const version = `${name}-1.0,1`

// 设置自定义缓存名称
setCacheNameDetails({
    prefix: name, // 自定义前缀
    suffix: version // 自定义后缀
})

// 放在顶部，sw获得控制权，不然是下次打开页面获得
clientsClaim()
// 跳过等待
self.skipWaiting()
// 预请求资源，__WB_MANIFEST变量会注册webpack打包的所有项目资源文件
precacheAndRoute(self.__WB_MANIFEST)

// 创建一个处理程序，绑定到 index.html
// const handler = createHandlerBoundToURL(PUBLIC_URL + 'index.html')
// const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$')
// // 设置 App Shell 样式的路由，以便所有导航请求都由 index.html 外壳文件满足
// registerRoute(
//     // 返回 false 以豁免请求被 index.html 处理
//     ({request, url}: {request: Request; url: URL}) => {
//         // 如果这不是一个导航请求，跳过
//         if (request.mode !== 'navigate') {
//             return false
//         }

//         // 如果这是一个以 /_ 开头的 URL，跳过
//         if (url.pathname.startsWith('/_')) {
//             return false
//         }

//         // 如果这看起来像一个资源 URL，因为它包含一个文件扩展名，跳过
//         if (url.pathname.match(fileExtensionRegexp)) {
//             return false
//         }

//         // 返回 true 表示我们想要使用这个处理程序
//         return true
//     },
//     // 创建一个绑定到 URL 的处理程序，使用 process.env.PUBLIC_URL + '/index.html'
//     handler
// )
