const babelJest = require('babel-jest');

const babelOptions = {
  presets: ['babel-preset-gatsby'],
};

module.exports = babelJest.createTransformer(babelOptions);
