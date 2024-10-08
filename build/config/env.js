const fs = require('fs')
const path = require('path')
const paths = require('./paths')
const {expand: envExpand} = require('dotenv-expand')
const dotenv = require('dotenv')

// 删除 require 缓存中的 './paths' 模块
// 这样可以确保每次都重新加载最新的 paths 配置
delete require.cache[require.resolve('./paths')]

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
    throw new Error('请指定NODE_ENV')
}

const dotenvFiles = [
    `${paths.dotenv}.${NODE_ENV}.local`,
    NODE_ENV !== 'test' && `${paths.dotenv}.local`,
    `${paths.dotenv}.${NODE_ENV}`,
    paths.dotenv
].filter(Boolean)

/**
 * 从.env*文件加载环境变量。抑制警告
 * 如果此文件丢失。dotenv永远不会修改任何环境变量
 * 这些已经设置好了。.env文件支持变量扩展。
 */

dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
        envExpand(
            dotenv.config({
                path: dotenvFile
            })
        )
    }
})

// 获取当前工作目录的真实路径
const appDirectory = fs.realpathSync(process.cwd())

// 处理 NODE_PATH 环境变量
// 1. 获取现有的 NODE_PATH 或使用空字符串
// 2. 将路径字符串分割成数组
// 3. 过滤掉空路径和绝对路径
// 4. 将相对路径转换为绝对路径
// 5. 将处理后的路径数组重新组合成字符串
process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter((folder) => folder && !path.isAbsolute(folder))
    .map((folder) => path.resolve(appDirectory, folder))
    .join(path.delimiter)

// 获取 NODE_ENV 和 REACT_APP_* 环境变量，并准备将它们
// 通过 webpack 配置中的 DefinePlugin 注入到应用程序中。
const REACT_APP = /^REACT_APP_/i

/**
 * 获取客户端环境变量
 * @param {string} publicUrl - 公共URL
 * @returns {Object} 包含原始和字符串化的环境变量
 */
const getClientEnvironment = (publicUrl) => {
    // 获取所有以REACT_APP_开头的环境变量
    const raw = Object.keys(process.env)
        .filter((key) => REACT_APP.test(key))
        .reduce(
            (env, key) => {
                env[key] = process.env[key]
                return env
            },
            {
                // NODE_ENV: 用于确定是否在生产模式下运行，影响React的运行模式
                NODE_ENV: process.env.NODE_ENV || 'development',
                // PUBLIC_URL: 用于解析public中静态资产的路径
                PUBLIC_URL: publicUrl
            }
        )

    // 将所有环境变量值转换为字符串，以便传递给webpack DefinePlugin
    const stringified = {
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key])
            return env
        }, {})
    }

    return {
        raw,
        stringified
    }
}

const isProduction = ({NODE_ENV}) => NODE_ENV === 'production'
const isDevelopment = ({NODE_ENV}) => NODE_ENV === 'development'

module.exports = {
    getClientEnvironment,
    isProduction,
    isDevelopment
}
