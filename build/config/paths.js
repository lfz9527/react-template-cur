const path = require("path");
const fs = require("fs");
// 获取由 node 执行的文件的工作目录
const appDirectory = fs.realpathSync(process.cwd());

/**
 * 从相对路径解析绝对路径
 * @param {string} relativePath 相对路径
 */
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

/**
 * 解析模块文件
 * @param {function} resolveFn 解析函数
 * @param {string} filePath 文件路径
 */
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );
  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }
  return resolveFn(`${filePath}.tsx`);
};

/**
 * 解析环境变量
 * @param {string} filePath 文件路径
 */
const resolveDefineVariable = () => {
  const config = {};
  for (const key in process.env) {
    // 以 USER_ 开头的环境变量
    if (key.startsWith("USER_")) {
      // 将环境变量转换为字符串
      config[`process.env.${key}`] = JSON.stringify(process.env[`${key}`]);
    }
  }
  return config;
};

// 模块文件扩展名
const moduleFileExtensions = ["ts", "tsx", "js", "jsx"];

module.exports = {
  appDefineVariable: resolveDefineVariable(), // 到页面中可以用到的变量
  appIndexJs: resolveModule(resolveApp, "src/index"), // 入口文件
  appProxySetup: resolveModule(resolveApp, 'setProxy'), // 代理配置
  appHtml: resolveApp("public/index.html"), // html 模板
  dist: resolveApp("dist"), // 打包目录
  appPackageJson: resolveApp("package.json"), // package.json 文件
  appSrc: resolveApp("src"), // src 目录
  module: resolveApp("node_modules"), // node_modules 目录
  moduleFileExtensions, // 模块文件扩展名
};
