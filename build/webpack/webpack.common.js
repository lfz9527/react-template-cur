const fs = require('fs')
const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin') // 简化 HTML 文件创建以服务捆绑包的插件, 将js文件自动引进 html 文件中
const CopyPlugin = require('copy-webpack-plugin') // 将已存在的单个文件或整个目录复制到生成目录
const WebpackBar = require('webpackbar') // 优雅的 Webpack 进度条和分析器
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin') // 启动本地服务/打包错误提示

const paths = require('../config/paths')
const {getClientEnvironment} = require('../config/env')
const useTypeScript = fs.existsSync(paths.appTsConfig)
const ClientEnvironment = getClientEnvironment(paths.publicUrlOrPath)
const {stringified} = ClientEnvironment

const config = {
    entry: {
        app: paths.appIndexJs
    },
    cache: {
        // 缓存,cache.type 设置为 'filesystem' 是会开放更多的可配置项。
        // 收集在反序列化期间分配的未使用的内存，, 仅当 cache.type 设置为 'filesystem' 时生效。这需要将数据复制到更小的缓冲区中，并有性能成本。
        type: 'filesystem',
        buildDependencies: {
            // 是一个针对构建的额外代码依赖的数组对象。webpack 将使用这些项和所有依赖项的哈希值来使文件系统缓存失效。
            config: [__filename]
        }
    },
    resolve: {
        extensions: paths.moduleFileExtensions,
        alias: {
            '@': paths.appSrc
        }
    },
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.(tsx?|jsx|js)$/,
                        exclude: [/node_modules/, /(.|_)min\.js$/],
                        use: [
                            {
                                loader: 'babel-loader',
                                options: {
                                    // 使用缓存
                                    cacheDirectory: true
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    plugins: [
        new Webpack.DefinePlugin(stringified),
        new HtmlWebpackPlugin({
            template: paths.appHtml,
            cache: true,
            env: stringified.NODE_ENV || ''
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: paths.appPublic,
                    to: paths.appBuild,
                    globOptions: {
                        dot: true,
                        gitignore: false,
                        ignore: ['**/index.html']
                    }
                }
            ]
        }),
        new WebpackBar({
            name: 'RUNNING',
            color: '#722ed1'
        }),
        useTypeScript &&
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: paths.appTsConfig
                }
            })
    ].filter(Boolean)
}
module.exports = config
