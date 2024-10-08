const importAll = (r: __WebpackModuleApi.RequireContext) => r.keys().forEach(r)

const svgFile = require.context('./svg', true, /\.svg$/)

try {
    importAll(svgFile)
} catch (error) {
    console.log(error)
}
export {} // 默认导出，ts如若不导出，会警告
