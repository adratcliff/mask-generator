const copyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new copyWebpackPlugin([
        {
          from: './src/workers/',
          to: './',
        },
      ]),
    ],
  },
};