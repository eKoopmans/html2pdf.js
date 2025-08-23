const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const pkg = require('./package.json');

const externals = [ 'jspdf', 'html2canvas' ];
const banner = `${pkg.name} v${pkg.version}
Copyright (c) ${(new Date).getFullYear()} Erik Koopmans
Released under the ${pkg.license} License.`;

module.exports = env => {
  const isDev = env.dev;
  const mode = isDev ? 'production' : 'development';
  const watch = isDev;
  const useAnalyzer = env.analyzer;

  const makeUMDConfig = (filename, { bundle, min } = {}) => ({
    output: {
      filename,
      library: {
        name: 'html2pdf',
        type: 'umd',
        export: 'default',
        umdNamedDefine: true,
      }
    },
    target: 'browserslist',
    externals: bundle ? [] : externals,
    externalsType: 'umd',
    optimization: { minimize: min },
    devtool: min ? 'source-map' : false,
    bundleAnalyzer: {
      analyzerMode: useAnalyzer ? 'server' : 'disabled',
      analyzerPort: 'auto',
      defaultSizes: 'stat',
    },
  });

  const builds = {
    umd: makeUMDConfig('html2pdf.js'),
    umdBundle: makeUMDConfig('html2pdf.bundle.js', { bundle: true }),
    ...(isDev ? {} : {
      umdMin: makeUMDConfig('html2pdf.min.js', { min: true }),
      umdBundleMin: makeUMDConfig('html2pdf.bundle.min.js', { bundle: true, min: true }),
    }),
  };

  return Object.values(builds).map(build => ({
    entry: './src/index.js',
    mode,
    target: build.target,
    watch,
    watchOptions: {
      ignored: /node_modules/,
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      chunkFormat: false,
      ...build.output,
    },
    node: false,
    externals: build.externals,
    externalsType: build.externalsType,
    optimization: build.optimization,
    devtool: build.devtool || false,
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      new webpack.BannerPlugin(banner),
      new BundleAnalyzerPlugin(build.bundleAnalyzer || { analyzerMode: 'disabled' }),
    ],
    experiments: build.experiments,
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
      ],
    },
  }));
};
