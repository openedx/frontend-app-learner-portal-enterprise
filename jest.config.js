const { createConfig } = require('@openedx/frontend-build');

process.env.TZ = 'UTC';

const config = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
});

config.transformIgnorePatterns = ['node_modules/(?!(lodash-es|@(open)?edx)/)'];

module.exports = config;
