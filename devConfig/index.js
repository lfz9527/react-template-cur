// host
const SERVER_HOST = 'localhost'
// 端口号
const SERVER_PORT = 8100
// 是否开启https
const HTTPS = false

// 代码分析报告 host
const ANALYZER_HOST = 'localhost'
// 代码分析报告 port
const ANALYZER_PORT = '8888'
// 是否开启代码分析
const ANALYZER = false
// 代理配置
const PROXY = {
    '/Api': {
        target: 'https://www.bestflows.io/', // 联调地址
        changeOrigin: true
    }
}

module.exports = {
    SERVER_HOST,
    SERVER_PORT,
    ANALYZER_HOST,
    ANALYZER_PORT,
    ANALYZER,
    HTTPS,
    PROXY
}
