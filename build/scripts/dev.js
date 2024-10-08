// 导入初始化环境函数
const {initEnv, logger, isInteractive, clearConsole} = require('../utils')

// 初始化开发环境
initEnv('development')

// 导入所需模块
const Webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const {checkBrowsers} = require('react-dev-utils/browsersHelper')
const {choosePort} = require('react-dev-utils/WebpackDevServerUtils')

// console.log('----',process.env);

// 导入路径配置
const paths = require('../config/paths')

// 开发配置
const {SERVER_HOST, SERVER_PORT} = require(paths.devConfig)
// 开发环境下的webpack 配置
const webpackDevConfig = require('../webpack/webpack.dev')

// 检查必需文件是否存在
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    // 如果必需文件不存在，退出进程
    process.exit(1)
}

const SETTING_PROT = SERVER_PORT || process.env.PORT
const SETTING_HOST = SERVER_HOST || process.env.HOST

const DEFAULT_PROT = parseInt(SETTING_PROT, 10) || 3000
const HOST = SETTING_HOST || 'localhost'

logger.info(`正在尝试绑定到HOST环境变量: ${chalk.yellow(chalk.bold(HOST))}`)

// 初始化浏览器
const initBrowsers = async () => {
    await checkBrowsers(paths.appPath, isInteractive)
    // 我们尝试使用默认端口，但如果它被占用，我们会提供给用户在不同端口上运行的选项。
    // `choosePort()` Promise 会解析到下一个可用的端口。
    const port = await choosePort(HOST, DEFAULT_PROT)
    if (port == null) {
        // 没有找到端口
        return
    }

    let compiler

    try {
        compiler = Webpack(webpackDevConfig)
    } catch (err) {
        console.log(chalk.red('编译失败.'))
        console.log()
        console.log(err.message || err)
        console.log()
        process.exit(1)
    }

    const serverConfig = {
        ...webpackDevConfig.devServer,
        host: HOST,
        port
    }

    const devServer = new WebpackDevServer(compiler, serverConfig)
    devServer.listen(port, HOST, (err) => {
        if (err) {
            return logger.error(err.message)
        }
        if (isInteractive) {
            clearConsole()
        }
        console.log(chalk.cyan('启动开发环境...\n'))
        return logger.start(port, HOST)
    })
}
initBrowsers()
