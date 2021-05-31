const path = require('path');

const commonJSConfig = {
  entry: ['core-js/stable', './lib/DashPlatformProtocol.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'DashPlatformProtocol.min.js',
    library: 'DashPlatformProtocol',
    libraryTarget: 'umd',
  },
  node: {
    fs: 'empty',
  },
  resolve: {
    alias: {
      [path.join(__dirname, 'node_modules/re2/re2.js')]: path.join(`${__dirname}/lib/util/RegExp.js`),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};

module.exports = [commonJSConfig];
