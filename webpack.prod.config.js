const fs = require('fs');
const dotenv = require('dotenv');
const { createConfig } = require('@edx/frontend-build');
const glob = require('glob')
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');

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

const plugins = []
// PurgeCSS
if (process.env.USE_PURGECSS) {
  plugins.push(
    new PurgeCSSPlugin({
      paths: [glob.sync('node_modules/@edx/paragon/**/*', {nodir: true})],
      whitelistPatterns: [/pgn[-_]/]
    })
    )
}

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
  plugins: plugins
});

module.exports = config;
