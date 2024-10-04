const Webpack = require('webpack');
const {merge} = require('webpack-merge'); // Webpack合并函数
const commonConfig = require('./webpack.common.js');

const prodConfig = {
  mode: 'production',
};

module.exports = merge(commonConfig, prodConfig);
