const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const getAppPath = require('./getAppPath')
const paths = require('../config/paths')
const pageDC = require('../config/pageDefaultConf')
const {checkDir, logger} = require('./index')

const HTMLs = []
let copyFilePatterns = []
let paths_src

// 生成html和相关静态文件
const createHtml = (page_path, raw) => {
    paths_src = page_path
    const pages = getAppPath(page_path)
    pages.forEach((item) => {
        generateHtml(item, raw)
        copyStaticFile(item)
    })
    return {
        HTMLs,
        copyFilePatterns
    }
}

// 每个页面都要自己的html
const generateHtml = (item, raw = {}) => {
    const appEntrySrc = `${paths_src}/${item}`
    // 读取pageInfo.json文件内容，如果在页面目录下没有找到pageInfo.json 捕获异常
    let infoJson = {},
        infoData = {}
    try {
        // 读取pageInfo.json文件内容，如果在页面目录下没有找到pageInfo.json 捕获异常
        infoJson = fs.readFileSync(`${appEntrySrc}/pageInfo.json`, 'utf-8') //
        infoData = JSON.parse(infoJson)
    } catch (error) {
        infoData = {}
    }

    // 获取模板文件
    const template = checkHtml(appEntrySrc)

    const chunk = {
        title: infoData.title ? infoData.title : pageDC.PAGE_DEF_TITLE,
        meta: {
            keywords: infoData.keywords
                ? infoData.keywords
                : pageDC.PAGE_DEF_KEYWORDS,
            description: infoData.description
                ? infoData.description
                : pageDC.PAGE_DEF_DESCRIPTION
        },
        chunks: [`${item}/${item}`], //引入的js
        template: template,
        filename: `${item}/index.html`, //html位置
        hash: true,
        minify: {
            //压缩html
            collapseWhitespace: true,
            preserveLineBreaks: true
        },
        cache: true,
        env: raw.NODE_ENV || 'development'
    }
    const html = new HtmlWebpackPlugin(chunk)
    HTMLs.push(html)
}

// 每个页面都有自己独一无二的配置.需要复制一份静态文件
const copyStaticFile = (item) => {
    const hasSw = checkDir(`${paths_src}/${item}/service-worker.js`)
    const hasStaticConf = checkDir(`${paths_src}/${item}/static_config`)
    const hasManifest = checkDir(`${paths_src}/${item}/manifest.json`)

    const copyManifest = {
        from: `${paths_src}/${item}/manifest.json`,
        to: `${paths.appBuild}/${item}/manifest.json`,
        globOptions: {
            dot: true,
            gitignore: false,
            ignore: ['**/index.html']
        }
    }
    const copySw = {
        from: `${paths_src}/${item}/service-worker.js`,
        to: `${paths.appBuild}/${item}/service-worker.js`,
        globOptions: {
            dot: true,
            gitignore: false,
            ignore: ['**/index.html']
        }
    }

    const copyStaticConf = {
        from: `${paths_src}/${item}/static_config`,
        to: `${paths.appBuild}/${item}/static_config`,
        globOptions: {
            dot: true,
            gitignore: false,
            ignore: ['**/index.html']
        }
    }

    const patterns = [hasManifest && copyManifest ,hasSw && copySw, hasStaticConf && copyStaticConf].filter(
        Boolean
    )
    copyFilePatterns = [...copyFilePatterns,...patterns,]
}

/**
 * 检查html文件是否存在
 * @param {*} appEntrySrc
 * @returns
 */
const checkHtml = (appEntrySrc) => {
    const htmlBoolean = {
        [`${appEntrySrc}/index.html`]: checkDir(`${appEntrySrc}/index.html`),
        ['./public/index.html']: checkDir('./public/index.html')
    }
    const validHtml = Object.values(htmlBoolean).some((item) => item)

    if (!validHtml) {
        const msg = `请在public目录下创建index.html文件，或者在${appEntrySrc}目录下创建index.html文件`
        logger.error(msg)
        process.exit(1)
    }
    // 获取value为true的key
    const key = Object.keys(htmlBoolean).find((key) => htmlBoolean[key])
    return key
}

// @test
createHtml('./src/pages')

module.exports = createHtml
