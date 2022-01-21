const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
module.exports = (env) => {
  
  return {
  // webpack will take the files from ./src/index
  // regenerator-runtime needed to polyfill a generator function for async calls
  entry: ['regenerator-runtime/runtime.js','./src/index'],

  output: {
    path: path.join(__dirname, '/build'),
    filename: 'bundle.js',
    assetModuleFilename: 'data/[hash][ext][query]'
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    rules: [{
        test: /\.bundle\.js$/,
        use: {
          loader: 'bundle-loader',
          options: {
            name: 'my-chunk',
            cacheDirectory: true,
            presets: ['@babel/preset-env']
          }
        }
      },

      {
        test: /\.(ts|js)x?$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ["@babel/preset-env",
                {
                  "targets": {
                    "browsers": [">0.03%"]
                  },
                  "useBuiltIns": "entry",
                  "corejs": 3
                }
              ],
              "@babel/preset-typescript",
              "@babel/preset-react"
            ]
          },
        },
      },

      // css-loader to bundle all the css files into one file and style-loader to add all the styles inside the style tag of the document
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),

    new Dotenv({
      path: `./environments/.env${env.envFile ? `.${env.envFile}` : ''}`
    })
  ]
}};