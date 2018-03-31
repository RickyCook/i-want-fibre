const path = require('path')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = {
  entry: {
    background: './src/background.js',
    reaCs: './src/reaCs.js',
    manifest: './src/manifest-gen.js',
  },
  module: {
    rules: [
      { test: require.resolve('./src/manifest-gen.js'),
        use: [
          { loader: 'file-loader', options: { name: 'manifest.json' } },
          { loader: 'val-loader' },
        ],
      },
      { test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      { test: /\.css$/,
        loader: 'raw-loader',
      },
    ],
  },
  plugins: [
    /*new HtmlWebpackPlugin({
      filename: 'reaCs.html',
      chunks: [ 'reaCs' ],
    }),*/
    new CleanWebpackPlugin(['dist']),
  ],
  output: {
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  }
}
