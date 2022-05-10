const { getBaseConfig } = require('@edx/frontend-build');
const withDojoPreset = require('@reustleco/dojo-frontend-common/configs/eslint');

const config = withDojoPreset(getBaseConfig('eslint'));

if (!config.rules) config.rules = {}

const noExtraneousDependencies = (
  config.rules['import/no-extraneous-dependencies']
  || ['error', { devDependencies: [] }]
)

// This module is only used in tests, so it's allowed to use dev dependencies
noExtraneousDependencies[1].devDependencies.push("src/utils/tests.jsx");

config.rules['import/no-extraneous-dependencies'] = noExtraneousDependencies;

module.exports = config;
