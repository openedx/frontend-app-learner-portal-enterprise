const fs = require('fs');
const dotenv = require('dotenv');
const { createConfig } = require('@edx/frontend-build');

// Note: copied from `@openedx/frontend-build`
function resolvePrivateEnvConfig(filePath) {
  if (fs.existsSync(filePath)) {
    const privateEnvConfig = dotenv.parse(fs.readFileSync(filePath));
    Object.entries(privateEnvConfig).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }
};
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
      cacheGroups: {
        // Disable the default vendors cache group.
        defaultVendors: false,
        // Split out the vendor code from the application code.
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name(module, chunks, cacheGroupKey) {
            // Get the name of the chunk from the module, and prepend the cache group key.
            return `${cacheGroupKey}-${chunks[0].name}`;
          },
          chunks: 'all',
          priority: 0, // Lower priority than other cache groups.
        },
        // Split out the React vendor code from the application code, with a higher priority.
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
          priority: 20, // Higher priority than all other cache groups.
        },
        // Split out the Open edX Paragon vendor code from the application code, with a higher priority.
        paragonVendor: {
          test: /([\\/]node_modules[\\/](?:@edx[\\/]paragon|@openedx[\\/]paragon)[\\/])/,
          name: 'paragon-vendor',
          chunks: 'all',
          priority: 10, // Higher priority than other edX shared libraries and the default vendor cache group.
        },
        // Split out the Open edX vendor code (other shared libraries) from the application code, with a higher priority.
        edXVendor: {
          test: /[\\/]node_modules[\\/](?:@edx|@openedx)[\\/]/,
          name: 'edx-vendor',
          chunks: 'all',
          priority: 5, // Higher priority than default vendor cache group.
        },
      },
    },
  },
});

module.exports = config;
