const Webpack = require('webpack');
const {merge} = require('webpack-merge'); // Webpack合并函数
const commonConfig = require('./webpack.common.js');

const devConfig = {
  mode: 'development',
};

module.exports = merge(commonConfig, devConfig);