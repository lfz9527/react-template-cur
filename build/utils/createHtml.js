const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const getAppPath = require('./getAppPath')
const pageDC = require('../config/pageDefaultConf')

const HTMLs = []
const createHtml = (page_path) => {
    const pages = getAppPath(page_path)
    pages.forEach((item) => {
        let infoJson = {},
            infoData = {}
        try {
            // 读取pageInfo.json文件内容，如果在页面目录下没有找到pageInfo.json 捕获异常
            infoJson = fs.readFileSync(
                `${page_path}/${item}/pageInfo.json`,
                'utf-8'
            ) //
            infoData = JSON.parse(infoJson)
        } catch (error) {
            infoData = {}
        }
        console.log('item', item)

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
            template: './public/index.html',
            filename: `${item}/index.html`, //html位置
            hash: true,
            minify: {
                //压缩html
                collapseWhitespace: true,
                preserveLineBreaks: true
            }
        }
        const html = new HtmlWebpackPlugin(chunk)
        HTMLs.push(html)
    })
    return HTMLs
}

createHtml('../../src/pages')

module.exports = createHtml
