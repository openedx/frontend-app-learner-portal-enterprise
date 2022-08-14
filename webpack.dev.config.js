const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('webpack-dev-server', {
  devServer: {
    // allow *.localhost and localhost origins for enterprise-slug.sub-domains-of.the.app.
    allowedHosts: ['.localhost', 'localhost'],
  },
});
