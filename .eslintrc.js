// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('eslint', {
  extends: [
    '@edx/eslint-config',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  ignorePatterns: ['*.config.js'],
  overrides: [
    {
      files: ['*.test.js', '*.test.jsx'],
      rules: {
        'react/prop-types': 'off',
        'react/jsx-no-constructed-context-values': 'off',
      },
    },
  ],
  rules: {
    // Temporarily update the 'indent' and 'template-curly-spacing' rules
    // since they are causing eslint to fail for no apparent reason since
    // upgrading @edx/frontend-build from v3 to v5:
    //  - TypeError: Cannot read property 'range' of null
    indent: ['error', 2, { ignoredNodes: ['TemplateLiteral', 'SwitchCase'] }],
    'template-curly-spacing': 'off',
    'import/prefer-default-export': 'off',
  },
});

module.exports = config;
