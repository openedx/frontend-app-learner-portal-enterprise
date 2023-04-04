// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('eslint');

config.overrides = [
  {
    files: ['*.test.js', '*.test.jsx', '*.test.ts', '*.test.tsx'],
    rules: {
      'react/prop-types': 'off',
      'react/jsx-no-constructed-context-values': 'off',
    },
  },
];

// Temporarily update the 'indent' and 'template-curly-spacing' rules
// since they are causing eslint to fail for no apparent reason since
// upgrading @edx/frontend-build from v3 to v5:
//  - TypeError: Cannot read property 'range' of null
config.rules.indent = ['error', 2, { ignoredNodes: ['TemplateLiteral', 'SwitchCase'] }];
config.rules['template-curly-spacing'] = 'off';
config.rules['import/prefer-default-export'] = 'off';

module.exports = config;
