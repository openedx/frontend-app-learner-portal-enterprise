// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@edx/frontend-build');

process.env.TZ = 'UTC';

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
      'src/index.jsx',
  ],
});
