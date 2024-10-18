// 打包环境配置
const {merge} = require('webpack-merge') // Webpack合并函数
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 抽离css文件, 这个插件将CSS取到单独的文件中。它为每个包含CSS的JS文件创建一个CSS文件。它支持按需加载 CSS 和 SourceMaps。
const CompressionPlugin = require('compression-webpack-plugin') // 静态资源压缩, 使用Content-Encoding为它们提供服务
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin') // 这个插件优化和压缩css
const TerserPlugin = require('terser-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer') // 使用交互式可缩放树形地图可视化 webpack 输出文件的大小
const commonConfig = require('./webpack.common.js')
const paths = require('../config/paths.js')
const {ANALYZER_HOST = 'localhost', ANALYZER_PORT = '8080'} = require(
    paths.devConfig
)
const {getClientEnvironment, isProduction} = require('../config/env')
const {raw} = getClientEnvironment(paths.publicUrlOrPath)
const isProd = isProduction(raw)
const {REACT_APP_ANALYZE} = raw

const prodConfig = {
    mode: 'production',
    target: 'browserslist',
    output: {
        path: paths.appBuild,
        filename: '[name].[contenthash:8].js',
        assetModuleFilename: '[name].[contenthash:8].[ext]',
        publicPath: paths.publicUrlOrPath,
        clean: true // 在生成文件之前清空 output 目录
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:8].css',
            chunkFilename: '[name].[contenthash:8].chunk.css',
            ignoreOrder: true
        }),
        new CompressionPlugin({
            test: /\.js$|\.html$|.\css/, // 匹配文件名
            threshold: 10240, // 对超过10k的数据压缩
            deleteOriginalAssets: false // 不删除源文件
        }),
        REACT_APP_ANALYZE &&
            new BundleAnalyzerPlugin({
                analyzerMode: 'server',
                analyzerHost: ANALYZER_HOST,
                analyzerPort: ANALYZER_PORT
            })
    ].filter(Boolean),
    optimization: {
        // 允许你通过提供一个或多个定制过的 TerserPlugin 实例， 覆盖默认压缩工具(minimizer)
        minimizer: [
            new TerserPlugin({
                extractComments: false, // 删除注释
                terserOptions: {
                    compress: {
                        // 生产环境才清除 打印的日志
                        pure_funcs: [...(isProd ? ['console.log'] : [])]
                    }
                },
                exclude: /service-worker/, // 排除 service worker 文件
            }),
            new CssMinimizerPlugin(),
        ], // 在生产环境中排除 service-worker.js
        // 对于动态导入模块，请在 SplitChunksPlugin 页面中查看配置其行为的可用选项。
        splitChunks: {
            automaticNameDelimiter: '-', // 生成名称的分隔符
            chunks: 'all', // all-所有模块生效，async-抽取异步模块，initial:同步模块生效
            // minSize: 100000, //  todo, 后续还有性能问题再拆, 生成 chunk 的最小体积（以 bytes 为单位）。
            // maxSize: 244000, // todo, 后续还有性能问题再拆, 生成 chunk 的最大体积（以 bytes 为单位）。
            cacheGroups: {
                serviceWorker: {
                    test: /service-worker\.js$/,
                    chunks: 'all',
                    enforce: true,
                },
                commons: {
                    test: /[/\\]node_modules[/\\]/, // 只筛选从node_modules文件夹下引入的模块
                    name: 'commons',
                    chunks: 'all',
                    minSize: 0, // 分离前最小模块大小，默认为0，最小为30000
                    maxInitialRequests: 3, //最大初始化加载次数，一个入口文件可以并行加载的最大文件数量，默认3
                    priority: -10 // 优先级, 先vendors引用包, 再找本地包,  因为default 权重小于vendors
                }
            }
        }
    },
}

module.exports = merge(commonConfig, prodConfig)
