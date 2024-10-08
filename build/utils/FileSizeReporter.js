const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const fileSize = require('filesize')
const recursive = require('recursive-readdir')
const stripAnsi = require('strip-ansi')
const gzipSize = require('gzip-size').sync
const {logger} = require('./index')

// 检查文件是否为 JavaScript 或 CSS 文件，并且不是 service-worker.js 或 precache-manifest 相关文件
const canReadAsset = (asset) => {
    return (
        /\.(js|css)$/.test(asset) &&
        !/service-worker\.js/.test(asset) &&
        !/precache-manifest\.[0-9a-f]+\.js/.test(asset)
    )
}

/**
 * 打印构建后的文件大小
 * 这个函数用于在构建过程结束后，打印出所有生成文件的大小信息
 * @param {Object} webpackStats - Webpack 构建的统计信息
 * @param {Object} previousSizeMap - 之前构建的文件大小映射
 * @param {string} buildDir - 构建目录的路径
 * @param {number} maxBundleGzipSize - 最大的打包文件（gzip 压缩后）大小限制
 * @param {number} maxChunkGzipSize - 最大的代码块文件（gzip 压缩后）大小限制
 */
const printFileSizesAfterBuild = (
    webpackStats,
    previousSizeMap,
    buildDir,
    maxBundleGzipSize,
    maxChunkGzipSize
) => {
    const root = previousSizeMap.root
    const sizes = previousSizeMap.sizes
    const assets = (webpackStats.stats || [webpackStats])
        .map((stats) =>
            stats
                .toJson({all: false, assets: true})
                .assets.filter((asset) => canReadAsset(asset.name))
                .map((asset) => {
                    const fileContents = fs.readFileSync(
                        path.join(root, asset.name)
                    )
                    const size = gzipSize(fileContents)
                    const previousSize =
                        sizes[removeFileNameHash(root, asset.name)]
                    const difference = getDifferenceLabel(size, previousSize)
                    return {
                        folder: path.join(
                            path.basename(buildDir),
                            path.dirname(asset.name)
                        ),
                        name: path.basename(asset.name),
                        size: size,
                        sizeLabel:
                            fileSize(size) +
                            (difference ? ' (' + difference + ')' : '')
                    }
                })
        )
        .reduce((single, all) => all.concat(single), [])

    // 按照文件大小排序
    assets.sort((a, b) => b.size - a.size)
    // 计算并获取 assets 数组中 sizeLabel 字符串的最大长度
    const longestSizeLabelLength = Math.max.apply(
        null,
        assets.map((a) => stripAnsi(a.sizeLabel).length)
    )
    let suggestBundleSplitting = false
    assets.forEach((asset) => {
        let sizeLabel = asset.sizeLabel
        const sizeLength = stripAnsi(sizeLabel).length
        if (sizeLength < longestSizeLabelLength) {
            const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength)
            sizeLabel += rightPadding
        }
        const isMainBundle = asset.name.indexOf('main.') === 0
        const maxRecommendedSize = isMainBundle
            ? maxBundleGzipSize
            : maxChunkGzipSize
        const isLarge = maxRecommendedSize && asset.size > maxRecommendedSize
        if (isLarge && path.extname(asset.name) === '.js') {
            suggestBundleSplitting = true
        }
        console.log(
            '  ' +
                (isLarge ? chalk.yellow(sizeLabel) : sizeLabel) +
                '  ' +
                chalk.dim(asset.folder + path.sep) +
                chalk.cyan(asset.name)
        )
    })
    if (suggestBundleSplitting) {
        console.log()
        logger.warn('包的大小明显大于推荐大小')
        logger.warn('考虑使用代码分割来减小它的体积')
        logger.warn('也能以使用 webpack-bundle-analyzer 来分析包的内容')
    }
}

// 删除文件名中的哈希
const removeFileNameHash = () => {}

// 获取文件大小的差异标签
const getDifferenceLabel = () => {}

// 测量构建前的文件大小
const measureFileSizesBeforeBuild = (buildDir) => {
    return new Promise((resolve) => {
        recursive(buildDir, (err, fileNames) => {
            let sizes
            if (!err && fileNames && fileNames.length > 0) {
                sizes = fileNames
                    .filter(canReadAsset)
                    .reduce((memo, fileName) => {
                        const contents = fs.readFileSync(fileName)
                        const key = removeFileNameHash(buildDir, fileName)
                        memo[key] = gzipSize(contents)
                        return memo
                    })
            }
            resolve({
                root: buildDir,
                sizes: sizes || {}
            })
        })
    })
}

module.exports = {
    measureFileSizesBeforeBuild,
    printFileSizesAfterBuild
}
