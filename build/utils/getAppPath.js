const fs = require('fs')
const path = require('path')
const {checkDir} = require('./index')

/**
 * 判断是不是一个文件夹
 * @param {*} d 文件路径
 * @returns
 */
const isDir = (d) => fs.statSync(d).isDirectory() //判断是不是一个文件夹

/**
 * 获取客户端页面路径
 * @param {*} dir 应用路径
 * @returns
 */
const getClientPath = (dir) => {
    const arr = []
    const validDir = checkDir(dir) //是否存在目录
    if (!validDir) return arr
    const readdirSync = fs.readdirSync(dir) //获取目录下所有文件
    readdirSync.forEach((item) => {
        const currentPath = dir.replace(/\\/g, '/') + '/' + item
        // 判斷是不是一个文件夹，每个文件夹就是一个应用页面
        if (isDir(currentPath)) {
            arr.push(item)
        }
    })
    return arr
}
// @test
// getClientPath('../../src/pages')

module.exports = getClientPath
