const path = require('path')
const fs = require('fs')
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')

// 获取由 node 执行的文件的工作目录
const appDirectory = fs.realpathSync(process.cwd())

/**
 * 从相对路径解析绝对路径
 * @param {string} relativePath 相对路径
 */
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

// 获取公共URL或路径
// 参数1: 是否为开发环境
// 参数2: package.json中的homepage字段
// 参数3: 环境变量中的PUBLIC_URL
const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === 'development',
    require(resolveApp('package.json')).homepage,
    process.env.PUBLIC_URL
)

/**
 * 解析模块文件
 * @param {function} resolveFn 解析函数
 * @param {string} filePath 文件路径
 */
const resolveModule = (resolveFn, filePath) => {
    const extension = moduleFileExtensions.find((extension) =>
        fs.existsSync(resolveFn(`${filePath}${extension}`))
    )
    if (extension) {
        return resolveFn(`${filePath}${extension}`)
    }
    return resolveFn(`${filePath}.tsx`)
}

// 模块文件扩展名
const moduleFileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json']

module.exports = {
    appBuild: resolveApp('dist'), // 打包构建目录
    // .env 文件路径
    dotenv: resolveApp('.env'),
    // 项目根目录路径
    appPath: resolveApp('.'),
    // public文件路径
    appPublic: resolveApp('public'),
    // 项目入口文件路径
    appIndexJs: resolveModule(resolveApp, 'src/index'),
    // 代理配置文件路径
    appProxySetup: resolveModule(resolveApp, 'setProxy'),
    // HTML 模板文件路径
    appHtml: resolveApp('public/index.html'),
    // 打包输出目录路径
    dist: resolveApp('dist'),
    // package.json 文件路径
    appPackageJson: resolveApp('package.json'),
    // src 源代码目录路径
    appSrc: resolveApp('src'),
    // node_modules 目录路径
    module: resolveApp('node_modules'),
    // 获取 PUBLIC_URL
    publicUrlOrPath,
    // 获取tsconfig.json 文件目录
    appTsConfig: resolveApp('tsconfig.json'),
    devConfig: resolveApp('devConfig'),
    appSvg: resolveApp('src/assets/icons/index.js'),
    // 支持的模块文件扩展名数组
    moduleFileExtensions
}
