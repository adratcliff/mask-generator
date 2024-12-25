const { defineConfig } = require('@vue/cli-service');
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
});
