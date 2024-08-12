const { createConfig } = require('@openedx/frontend-build');

process.env.TZ = 'UTC';

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
});
