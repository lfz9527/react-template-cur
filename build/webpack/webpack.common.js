const fs = require('fs')
const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin') // 简化 HTML 文件创建以服务捆绑包的插件, 将js文件自动引进 html 文件中
const CopyPlugin = require('copy-webpack-plugin') // 将已存在的单个文件或整个目录复制到生成目录
const WebpackBar = require('webpackbar') // 优雅的 Webpack 进度条和分析器
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin') // 启动本地服务/打包错误提示
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 抽离css文件, 这个插件将CSS取到单独的文件中。它为每个包含CSS的JS文件创建一个CSS文件。它支持按需加载 CSS 和 SourceMaps。
const paths = require('../config/paths')
const {getClientEnvironment, isDevelopment} = require('../config/env')
const useTypeScript = fs.existsSync(paths.appTsConfig)
const {raw,stringified} = getClientEnvironment(paths.publicUrlOrPath)
const {
    REACT_APP_IMAGE_BASE_64_PATH,
    REACT_APP_SHOULD_BASE_64_FROM_FILE_END,
    REACT_APP_ASSET_SIZE_LIMIT
} = raw
const isDev = isDevelopment(raw)

const cssLoaders = (importLoaders) => [
    // 执行顺序从后到前 less-loader -> postcss-loader -> css-loader -> style-loader/MiniCssExtractPlugin.loader
    isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // style-loader的作用就是将结果以style标签的方式插入DOM树中。style-loader将css-loader打包好的 CSS 代码以<style>标签的形式插入到 HTML 文件中
    {
        loader: 'css-loader', // 主要是解析css文件中的@import和url语句，处理css-modules，并将结果作为一个js模块返回
        options: {
            modules: false,
            sourceMap: isDev, // 开发环境开启
            importLoaders // 执行顺序: 需要先被 less-loader postcss-loader (所以这里设置为 2)
        }
    },
    {
        loader: 'postcss-loader', // 进一步处理css文件，比如添加浏览器前缀，压缩 CSS 等
        options: {
            postcssOptions: {
                plugins: [
                    require('postcss-flexbugs-fixes'), // 用于修复一些和 flex 布局相关的 bug
                    !isDev && [
                        'postcss-preset-env', // 最新的 CSS 语法转换为目标环境的浏览器能够理解的 CSS 语法，目的是使开发者不用考虑浏览器兼容问题。
                        {
                            // 使用 autoprefixer 来自动添加浏览器头
                            autoprefixer: {
                                grid: true,
                                flexbox: 'no-2009'
                            },
                            stage: 3
                        }
                    ]
                ].filter(Boolean)
            }
        }
    }
]

const createHtml = require('../utils/createHtml.js') // html配置
const getEntry = require('../utils/getAppEntry.js')
const {HTMLs,copyFilePatterns} = createHtml('./src/pages',raw)
const entry = getEntry(paths.mulAppIndexJs)

// console.log('raw',raw);
// console.log('stringified',stringified);


const config = {
    entry: entry,
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
                    },
                    {
                        test: /\.css$/,
                        use: cssLoaders(1)
                    },
                    {
                        test: /\.less$/,
                        use: [
                            ...cssLoaders(2),
                            {
                                loader: 'less-loader',
                                options: {
                                    sourceMap: isDev
                                }
                            }
                        ]
                    },
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        type: 'asset',
                        parser: {
                            // 当提供函数时，返回 true 值时告知 webpack 将模块作为一个 Base64 编码的字符串注入到包中，
                            // 否则模块文件会被生成到输出的目标目录中。将base64的资源都放在一个目录下
                            dataUrlCondition: (source, {filename}) => {
                                // 1. 如果是base64下的目录，将文件打包成base64
                                if (
                                    filename.includes(
                                        REACT_APP_IMAGE_BASE_64_PATH
                                    )
                                ) {
                                    return true
                                }
                                // 2. 如果开启了文件尾部扫描，则形如 xxx.base64.xxx会以Base64 编码的字符串注入到包中
                                if (
                                    REACT_APP_SHOULD_BASE_64_FROM_FILE_END &&
                                    filename.includes('.base64')
                                ) {
                                    return true
                                }
                                // 3. 对于小于imageInlineSizeLimit的文件，会以Base64 编码的字符串注入到包中
                                if (
                                    source.length <= REACT_APP_ASSET_SIZE_LIMIT
                                ) {
                                    return true
                                }
                                return false
                            }
                        }
                    },
                    {
                        test: /\.(eot|ttf|woff|woff2?)$/,
                        exclude: paths.appSvg, // 不处理 svg类型文件
                        type: 'asset/resource'
                    },
                    {
                        test: /\.svg$/,
                        include: paths.appSvg,
                        use: [
                            {
                                loader: 'svg-sprite-loader',
                                options: {
                                    symbolId: 'icon-[name]' // symbolId和use使用的名称对应 <use xlinkHref={"#icon-" + svgName} />
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
        // 给一个默认的html 确保 / /index.html 是可以访问的
        // new HtmlWebpackPlugin({
        //     template: paths.appHtml,
        //     cache: true,
        //     env: raw.NODE_ENV || 'development'
        // }),
        new CopyPlugin({
            patterns: [
                ...copyFilePatterns,
                {
                    from: paths.appPublic + '/service-worker.js',
                    to: paths.appBuild,
                    globOptions: {
                        ignore: ['**/index.html']
                    }
                }
            ]
        }),
        new WebpackBar({
            name: isDev ? 'RUNNING' : 'BUNDLING',
            color: isDev ? '#52c41a' : '#722ed1'
        }),
        useTypeScript &&
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: paths.appTsConfig
                }
            }),
        ...HTMLs
    ].filter(Boolean)
}
module.exports = config
