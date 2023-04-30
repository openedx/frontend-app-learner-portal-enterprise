const { createConfig } = require('@edx/frontend-build');

const config = createConfig('webpack-dev', {
  devServer: {
    historyApiFallback: {
      disableDotRule: true,
    },
  },
});

module.exports = config;
