// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@edx/frontend-build');

const config = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  transform: {
    '^.+\\.[t|j]s?$': [
      'babel-jest',
    ],
  },
});

/**
 * It looks like there's a bug with the jest/babel version we're using
 * and when transformIgnorePattern is an array only first item is used,
 * other are ignored.
 *
 * To get around this, we're overwriting the first entry to add other
 * `node_modules` we want to transform.
 *
 * https://github.com/react-dnd/react-dnd/issues/3443#issuecomment-1119863770
 */
config.transformIgnorePatterns = ['/node_modules/(?!@edx|@reustleco)'];
module.exports = config;
