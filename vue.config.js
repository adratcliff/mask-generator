const { defineConfig } = require('@vue/cli-service');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    externals: [
      'core-js',
      'register-service-worker',
      'vue',
      'vue-router',
    ],
  },
  chainWebpack: (config) => {
    config.plugin('copy').use(CopyPlugin, [
      {
        patterns: [{ from: './src/workers', to: './'}],
      },
    ]);
  },
});
