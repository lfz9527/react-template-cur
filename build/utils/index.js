const chalk = require('chalk')
const ip = require('ip') // 获取 IP 地址实用程序
const paths = require('../config/paths')
const path = require('path')
const fs = require('fs')
const os = require('os')
const detect = require('detect-port-alt') // 端口检测
const isRoot = () => process.getuid && process.getuid() === 0

// 检查当前环境是否支持交互式输出
// process.stdout.isTTY 用于判断是否在终端环境中运行
// 如果为 true，表示可以使用交互式输出
const isInteractive = process.stdout.isTTY
const divider = '----------------------------------------------'

// 初始化环境设置
const initEnv = (env) => {
    // 设置正确的环境
    process.env.BABEL_ENV = env
    process.env.NODE_ENV = env

    //使脚本在未处理的拒绝时崩溃，而不是默默地崩溃
    //忽视他们。将来，未处理的promise拒绝将
    //使用非零退出代码终止Node.js进程。
    process.on('unhandledRejection', (err) => {
        throw err
    })

    // 加载环境变量
    // 这将从.env文件中读取环境变量，并将它们设置到process.env中
    // 这样我们就可以在整个构建过程中使用这些环境变量
    // 例如，可以通过process.env.REACT_APP_API_URL访问API URL
    require('../config/env')
}
// 终端日志log输出显示
const logger = {
    error: (err) => {
        console.error(chalk.red(err))
    },
    success: (msg) => {
        console.log(chalk.green(msg))
    },
    start: (port, host) => {
        console.log(`服务启动! ${chalk.green('✓')}`)
        console.log(`
    ${chalk.bold('应用运行在:')}
    ${chalk.gray(divider)}
    - 本地: ${chalk.blue(`http://${host}:${port}`)}
    - 网络: ${chalk.blue(`http://${ip.address()}:${port}`)}
    ${chalk.gray(divider)}

    请注意，开发构建版本未经优化。
    要创建生产构建版本，请运行 npm run build。
    ${chalk.magenta(`按下 ${chalk.italic('Ctrl+c')} 停止`)}`)
        console.log()
    },
    info: (info) => {
        console.log(chalk.cyan(info))
    },
    warn: (warn) => {
        console.log(chalk.yellow(warn))
    }
}
// 检查浏览器
const checkBrowser = () => {
    const pak = require(paths.appPackageJson)
    const browserslist = pak.browserslist

    if (browserslist != null) {
        return Promise.resolve(browserslist)
    }
    if (!isInteractive) {
        return Promise.reject(
            new Error(
                chalk.red('这里要求必须添加 browsers.') +
                    os.EOL +
                    `请添加 ${chalk.underline(
                        'browserslist'
                    )} 在文件 ${chalk.bold('package.json')}里面。`
            )
        )
    }
}

// 打印构建错误
const printBuildError = (err) => {
    const message = err != null && err.message
    const stack = err != null && err.stack
    //为Terser错误添加更多有用消息
    if (
        stack &&
        typeof message === 'string' &&
        message.indexOf('from Terser') !== -1
    ) {
        try {
            const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack)
            if (!matched) {
                throw new Error('控制流使用错误，无法匹配堆栈跟踪。')
            }
            const problemPath = matched[2]
            const line = matched[3]
            const column = matched[4]
            console.log(
                '无法缩小此文件中的代码: \n\n',
                logger.warn(
                    `\t${problemPath}:${line}${column !== '0' ? ':' + column : ''}`
                ),
                '\n'
            )
        } catch (ignored) {
            console.log('压缩包失败.', err)
        }
    } else {
        console.log((message || err) + '\n')
    }
    console.log()
}

// 清除控制台
const clearConsole = () => {
    process.stdout.write(
        process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
    )
}

// 端口检测

/**
 * 选择一个可用的端口号
 * 如果指定的端口号可用，则返回该端口号；否则，返回一个新的可用端口号
 * @param {number} port - 要检查的端口号
 * @param {string} host - 主机名或 IP 地址
 * @returns {Promise<number|null>} - 解析为选定或检测到的端口号的 Promise，如果无法选择端口，则返回 null
 */
async function choosePort(port, host) {
    const newPort = await detect(port, host)
    if (newPort === port) {
        return newPort
    }
    const message =
        process.platform!== 'win32' && port < 1024 &&!isRoot()
           ? `运行服务器在 1024 以下的端口需要管理员权限。`
            : `该端口已经被占用 ${port}.`
    if (process.stdout.isTTY) {
        logger.warn(message)
        return newPort
    }
    logger.error(message)
    return null
}
// 检查文件是否存在
const checkRequiredFiles = (files) => {
    var currentFilePath
    try {
        files.forEach((filePath) => {
            currentFilePath = filePath
            fs.accessSync(filePath, fs.F_OK)
        })
        return true
    } catch (err) {
        var dirName = path.dirname(currentFilePath)
        var fileName = path.basename(currentFilePath)
        console.log(chalk.red('找不到必要的文件。'))
        console.log(chalk.red('  名字: ') + chalk.cyan(fileName))
        console.log(chalk.red('  查询地址: ') + chalk.cyan(dirName))
        return false
    }
}

module.exports = {
    initEnv,
    logger,
    isInteractive,
    printBuildError,
    checkBrowser,
    clearConsole,
    choosePort,
    checkRequiredFiles
}
