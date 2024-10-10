const {
    initEnv,
    printBuildError,
    checkBrowser,
    logger,
    checkRequiredFiles
} = require('../utils')

// 外部统一通过 cross-env 控制环境变量
const realENV = process.env.NODE_ENV
initEnv(realENV)

const chalk = require('chalk')
const fs = require('fs-extra')
const bfj = require('bfj')
const webpack = require('webpack')
const formatWebpackMessages = require('../utils/formatWebpackMessages')
const paths = require('../config/paths')

const {
    measureFileSizesBeforeBuild,
    printFileSizesAfterBuild
} = require('../utils/FileSizeReporter')
const printHostingInstructions = require('../utils/printHostingInstructions')

// 会警告超过这些尺寸的文件
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

// 检测文件是否存在
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
}

// 从命令行参数中获取除了 node 执行命令和脚本文件名之外的参数
const argv = process.argv.slice(2)
// 检查命令行参数中是否包含 --stats 标志，含有的话就将构建信息写入json文件
const writeStatsJson = argv.indexOf('--stats') !== -1

// 是否开启代码分析
const isAnalyze = argv.indexOf('--analyze')!== -1

// 创建生产构建并打印部署说明。
const build = (previousFileSizes) => {
    console.log('创建优化的生产构建...')
    const webpackConfig = require('../webpack/webpack.prod')
    const compiler = webpack(webpackConfig)
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages
            if (err) {
                if (!err.message) {
                    return reject(err)
                }
                let errMessage = err.message
                //  处理 postcss 错误
                if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
                    errMessage +=
                        '\n编译错误: 从 CSS selector 开始' +
                        err['postcssNode'].selector
                }
                messages = formatWebpackMessages({
                    errors: [errMessage],
                    warnings: []
                })
            } else {
                messages = formatWebpackMessages(
                    stats.toJson({all: false, warnings: true, errors: true})
                )
            }
            if (messages.errors.length) {
                // 只保留第一个错误。其他错误通常表明存在同样的问题，但会用噪音干扰读者
                if (messages.errors.length > 1) {
                    messages.errors.length = 1
                }
                return reject(new Error(messages.errors.join('\n\n')))
            }
            // 如果是在CI环境中运行
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' ||
                    process.env.CI.toLowerCase() !== 'false') &&
                messages.warnings.length
            ) {
                // 在 CI 构建中忽略源映射警告。更多信息请参见 #8227
                const filteredWarnings = messages.warnings.filter(
                    (w) => !/Failed to parse source map/.test(w)
                ).filter(
                    // 忽略 entrypoint size limit 警告
                    (w) =>!/entrypoint size limit/.test(w)
                )

                if (filteredWarnings.length) {
                    console.log(
                        chalk.yellow(
                            '\n由于 process.env.CI = true，将警告视为错误.\n' +
                                '大多数 CI 服务器会自动设置它。\n'
                        )
                    )
                    return reject(new Error(filteredWarnings.join('\n\n')))
                }
            }

            const resolveArgs = {
                stats,
                previousFileSizes,
                warnings: messages.warnings
            }
            // 构建打印信息是否需要写入json文件
            if (writeStatsJson) {
                return bfj
                    .write(
                        paths.appBuild + '/bundle-stats.json',
                        stats.toJson()
                    )
                    .then(() => resolve(resolveArgs))
                    .catch((error) => reject(new Error(error)))
            }
            return resolve(resolveArgs)
        })
    })
}

// 初始化浏览器
const initBrowsers = async () => {
    try {
        // 校验浏览器
        await checkBrowser()
        // 检测构建前的文件大小
        const previousFileSizes = await measureFileSizesBeforeBuild(
            paths.appBuild
        )
        // 清空构建目录
        fs.emptyDirSync(paths.appBuild)

        if(isAnalyze){
            process.env.REACT_APP_ANALYZE = 'true'
        }
        return build(previousFileSizes)
    } catch (err) {
        if (err && err.message) {
            logger.error(err.message)
        }
        process.exit(1)
    }
}

// 初始化构建
const initBuild = () => {
    initBrowsers().then(
        ({stats, previousFileSizes, warnings}) => {
            if (warnings.length) {
                logger.warn('编译警告。\n')
                console.log(warnings.join('\n\n'))
                console.log(
                    '\n查询 ' +
                        chalk.underline(chalk.yellow('keywords')) +
                        ' 去知道更多的警告信息'
                )
                console.log(
                    '若要忽略，请在该行代码前添加' +
                        chalk.cyan('// eslint-disable-next-line') +
                        '\n'
                )
            } else {
                logger.success('编译成功!\n')
            }
            logger.info(`当前打包环境为：${process.env.NODE_ENV}\n`)
            console.log('gzip 压缩后的文件大小:\n')
            printFileSizesAfterBuild(
                stats,
                previousFileSizes,
                paths.appBuild,
                WARN_AFTER_BUNDLE_GZIP_SIZE,
                WARN_AFTER_CHUNK_GZIP_SIZE
            )
            console.log()
            printHostingInstructions()
        },
        (err) => {
            const tscCompileOnError =
                process.env.TSC_COMPILE_ON_ERROR === 'true'
            if (tscCompileOnError) {
                logger.error(
                    '编译时出现以下类型错误（您可能需要在部署应用程序之前检查这些错误）:\n'
                )
                printBuildError(err)
            } else {
                logger.error('编译失败:\n')
                printBuildError(err)
                process.exit(1)
            }
        }
    )
}
initBuild()
