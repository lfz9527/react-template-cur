const paths = require('../config/paths');

const config = {
  entry: {
    app: paths.appIndexJs
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
        '@': paths.appSrc,
    },
    
  },
  module:{
    rules:[
      {
        oneOf: [
            {
              test: /\.(tsx?|jsx|js)$/,
              exclude: [/node_modules/, /(.|_)min\.js$/],
              use:[
                {
                  loader: 'babel-loader',
                  options: {
                     // 使用缓存
                    cacheDirectory: true,
                  }
                }
              ]
          },
        ]
      }
    ]
  }
}
module.exports = config;