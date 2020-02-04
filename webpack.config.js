const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/betical.js',
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'betical.js'
  },
  module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.(mp3)$/,
          use: [
            {
              loader: 'url-loader',
              options: {}
            }
          ],
        },
      ],
  },
  stats: {
      colors: true
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './public/index.html',
      filename: './index.html'
    }),
    new CleanWebpackPlugin()
  ]
};