const chalk = require('chalk')
const url = require('url')
const globalModules = require('global-modules')
const fs = require('fs')
const paths = require('../config/paths')
const useYarn = fs.existsSync(paths.yarnLockFile)

/**
 * 打印静态服务器指令
 * 这个函数用于在构建过程结束后，打印出如何使用静态服务器来托管构建文件夹的指令
 * @param {string} buildFolder - 构建文件夹的路径
 * @param {boolean} useYarn - 是否使用 Yarn 来安装 serve 包
 */
const printStaticServerInstructions = (buildFolder) => {
    console.log('你可以使用 serve 开启一个静态服务:')
    console.log()
    // 检查全局模块中是否已安装 serve
    if (!fs.existsSync(`${globalModules}/serve`)) {
        // 如果未安装，根据 useYarn 的值决定使用 yarn 还是 npm 安装
        if (useYarn) {
            console.log(`  ${chalk.cyan('yarn')} global add serve`)
        } else {
            console.log(`  ${chalk.cyan('npm')} install -g serve`)
        }
    }
    // 打印使用 serve 命令来托管构建文件夹的指令
    console.log(`  ${chalk.cyan('serve')} -s ${buildFolder}`)
    console.log()
}

const printHostingInstructions = () => {
    printStaticServerInstructions(paths.appBuild)
}

module.exports = printHostingInstructions
