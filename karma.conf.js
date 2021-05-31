// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const RewiremockPlugin = require('rewiremock/webpack/plugin');

module.exports = (config) => {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      'lib/test/karma/loader.js',
    ],
    exclude: [
    ],
    preprocessors: {
      'lib/test/karma/loader.js': ['webpack'],
    },
    webpack: {
      mode: 'development',
      optimization: {
        minimize: false,
      },
      resolve: {
        alias: {
          [path.join(__dirname, 'node_modules/re2/re2.js')]: path.join(`${__dirname}/lib/util/RegExp.js`),
        },
      },
      plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new RewiremockPlugin(),
      ],
      node: {
        fs: 'empty',
      },
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    singleRun: false,
    concurrency: Infinity,
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-webpack',
    ],
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    },
  });
};
