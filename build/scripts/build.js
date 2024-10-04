const {initEnv, isInteractive, printBuildError} = require('./utils')

initEnv('production')

const chalk = require('react-dev-utils/chalk')
const fs = require('fs-extra')
const bfj = require('bfj')
const webpack = require('webpack')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const {checkBrowsers} = require('react-dev-utils/browsersHelper')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const webpackConfig = require('../webpack/webpack.prod')
const paths = require('../config/paths')
const {logger} = require('./utils')
const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild

// 会警告超过这些尺寸的文件
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

// 检测文件是否存在
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  console.log(222);
    process.exit(1)
}

// 从命令行参数中获取除了 node 执行命令和脚本文件名之外的参数
const argv = process.argv.slice(2)
// 检查命令行参数中是否包含 --stats 标志
const writeStatsJson = argv.indexOf('--stats') !== -1

// 创建生产构建并打印部署说明。
const build = (previousFileSizes) => {
    console.log('创建优化的生产构建...')
    const compiler = webpack(webpackConfig)
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages
            if (err) {
                if (!err.message) {
                    return reject(err)
                }
                let errMessage = err.message
                // 为 postcss 错误添加额外信息。
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
            if (writeStatsJson) {
                return bfj
                    .write(
                        paths.appBuild + '/bundle-stats.json',
                        stats.toJson()
                    )
                    .then(() => resolve(resolveArgs))
                    .catch((error) => reject(new Error(error)))
            }
        })
    })
}

// 初始化浏览器
const initBrowsers = async () => {
    try {
        await checkBrowsers(paths.appPath, isInteractive)
        //首先，读取构建目录中的当前文件大小。
        //这让我们展示了他们后来发生了多大的变化。
        const previousFileSizes = await measureFileSizesBeforeBuild(
            paths.appBuild
        )
        // 清空构建目录
        fs.emptyDirSync(paths.appBuild)
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
            console.log('gzip 压缩后的文件大小:\n')
            printFileSizesAfterBuild(
                stats,
                previousFileSizes,
                paths.appBuild,
                WARN_AFTER_BUNDLE_GZIP_SIZE,
                WARN_AFTER_CHUNK_GZIP_SIZE
            )
            console.log()
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
