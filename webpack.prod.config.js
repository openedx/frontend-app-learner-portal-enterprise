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

const config = createConfig('webpack-prod');

module.exports = config;
