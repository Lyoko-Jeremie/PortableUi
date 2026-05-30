const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distDir = path.resolve(__dirname, 'dist/examples');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    basic: './examples/basic/main.ts',
    complex: './examples/complex/main.ts',
    layout: './examples/layout/main.ts',
    media: './examples/media/main.ts',
    imperative: './examples/imperative/main.ts',
  },
  output: {
    path: distDir,
    filename: 'assets/[name].[contenthash:8].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.examples.json',
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'basic.html',
      template: './examples/basic/template.html',
      chunks: ['basic'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'complex.html',
      template: './examples/complex/template.html',
      chunks: ['complex'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'layout.html',
      template: './examples/layout/template.html',
      chunks: ['layout'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'media.html',
      template: './examples/media/template.html',
      chunks: ['media'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'imperative.html',
      template: './examples/imperative/template.html',
      chunks: ['imperative'],
      inject: 'body',
    }),
  ],
  devServer: {
    static: {
      directory: distDir,
    },
    port: 8080,
    open: ['basic.html'],
  },
};

