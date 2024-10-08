const path = require('path')
const fs = require('fs')

/**
 * 获取公共 URL 或路径
 * 这个函数用于根据环境和配置确定应用的公共 URL 或路径
 * @param {string} homepage - 配置文件中的 homepage 字段
 * @param {string} envPublicUrl - 环境变量中的 PUBLIC_URL 字段
 * @returns {string} - 最终确定的公共 URL 或路径
 */
const getPublicUrlOrPath = () => {
    const isEnvDevelopment = process.env.NODE_ENV === 'development'
    let homepage = require(
        path.resolve(fs.realpathSync(process.cwd()), 'package.json')
    ).homepage

    let envPublicUrl = process.env.PUBLIC_URL
    const stubDomain = 'https://create-react-app.dev'

    if (envPublicUrl) {
        // 确保以斜杠结尾
        envPublicUrl = envPublicUrl.endsWith('/')
            ? envPublicUrl
            : envPublicUrl + '/'

        // 验证 `envPublicUrl` 是 URL 还是路径，如果是 URL，则忽略 `stubDomain`
        const validPublicUrl = new URL(envPublicUrl, stubDomain)

        return isEnvDevelopment
            ? envPublicUrl.startsWith('.')
                ? '/'
                : validPublicUrl.pathname
            : // 对于不使用客户端路由的应用，可以将 "homepage" 设置为 "." 以启用相对资源路径
              envPublicUrl
    }

    if (homepage) {
        // 去除末尾斜杠
        homepage = homepage.endsWith('/') ? homepage : homepage + '/'

        // 验证 `homepage` 是 URL 还是路径，并使用其路径名
        const validHomepagePathname = new URL(homepage, stubDomain).pathname
        return isEnvDevelopment
            ? homepage.startsWith('.')
                ? '/'
                : validHomepagePathname
            : // 对于不使用客户端路由的应用，可以将 "homepage" 设置为 "." 以启用相对资源路径
              homepage.startsWith('.')
              ? homepage
              : validHomepagePathname
    }

    return '/'
}

module.exports = getPublicUrlOrPath
