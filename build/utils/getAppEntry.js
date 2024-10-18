const getAppPath = require('./getAppPath')
const paths = require('../config/paths')
/**
 * 【获取entry文件入口】
 *
 * @param {String} path 引入根路径
 * @returns {Object} 返回的entry { "client1/client1":"./src/client1/index.js",...}
 */
const getAppEntry = (path) => {
    const entry = {}
    const apps = getAppPath(path)
    apps.forEach((item) => {
        const normalizedPath = path.replace(/\\/g, '/')
        /**
         * 下面输出格式为{"client1/client1":".src/pages/client1/index.js"}
         * 这样目的是为了将js打包到对应的文件夹下
         */
        // 自动获取入口文件后缀
        const entrySrc = paths.resolveModule(
            '',
            `${normalizedPath}/${item}/index`
        )

        entry[`${item}/${item}`] = entrySrc
    })
    return entry
}

getAppEntry('../../src/pages')

module.exports = getAppEntry
