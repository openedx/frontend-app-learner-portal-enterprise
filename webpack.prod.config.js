const fs = require('fs');
const dotenv = require('dotenv');
const { createConfig } = require('@openedx/frontend-build');
const { addPreconnectDomainsToHtmlWebpackPlugin } = require('./config');

// Note: copied from `@openedx/frontend-build`
function resolvePrivateEnvConfig(filePath) {
  if (fs.existsSync(filePath)) {
    const privateEnvConfig = dotenv.parse(fs.readFileSync(filePath));
    Object.entries(privateEnvConfig).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }
}
resolvePrivateEnvConfig('.env.private');

// Create/extend the Webpack configuration
const config = createConfig('webpack-prod', {
  optimization: {
    moduleIds: 'deterministic',
    splitChunks: {
      // `maxSize` applies to all cache groups. Note, per the Webpack documentation, `maxSize` is intended to be used with
      // HTTP/2 and long-term caching, due to increasing the request count for better caching. `maxSize` takes precedence
      // over `maxInitialRequests` and `maxAsyncRequests`. Note, the 244 KiB value for `maxSize` listed below is based on
      // parsed size, not Gzipped size.
      maxSize: 244 * 1024,
    },
  },
});

config.plugins = config.plugins.map((plugin) => {
  if (plugin.constructor.name === 'HtmlWebpackPlugin') {
    return addPreconnectDomainsToHtmlWebpackPlugin(plugin);
  }
  return plugin;
});

module.exports = config;
