const Webpack = require('webpack')
const {merge} = require('webpack-merge') // Webpack合并函数
const commonConfig = require('./webpack.common.js')
const paths = require('../config/paths.js')
const {SERVER_HOST, PROXY, HTTPS} = require(paths.devConfig)

const devConfig = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    target: 'web',
    output: {
        path: paths.appBuild,
        publicPath: paths.publicUrlOrPath,
        filename: 'js/[name].js'
    },
    devServer: {
        host: SERVER_HOST,
        https: !!HTTPS,
        compress: true, // 是否启用 gzip 压缩
        stats: 'errors-only', // 终端仅打印 error
        clientLogLevel: 'silent', // 日志等级
        open: true, // 打开默认浏览器
        hot: true, // 热更新
        noInfo: true,
        proxy: {
            ...PROXY
        },
        historyApiFallback: true // 单页面配置appProxySetup
    },
    plugins: [new Webpack.HotModuleReplacementPlugin()],
    optimization: {
        minimize: false, //关闭压缩
        minimizer: [],
        splitChunks: {
            chunks: 'all',
            minSize: 0
        }
    }
}

module.exports = merge(commonConfig, devConfig)
