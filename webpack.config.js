const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const pkg = require('./package.json');

const banner = `${pkg.name} v${pkg.version}
Copyright (c) ${(new Date).getFullYear()} Erik Koopmans
Released under the ${pkg.license} License.`;

module.exports = env => {
  const isDev = env.dev;
  const mode = isDev ? 'production' : 'development';
  const watch = isDev;
  const useAnalyzer = env.analyzer;

  const makeBrowserConfig = (filename, { bundle, min } = {}) => ({
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
    externals: bundle ? [] : ['jspdf', 'html2canvas'],
    externalsType: 'global',
    optimization: { minimize: min },
    devtool: min ? 'source-map' : false,
    bundleAnalyzer: {
      analyzerMode: useAnalyzer ? 'server' : 'disabled',
      analyzerPort: 'auto',
      defaultSizes: 'stat',
    },
  });

  const makeNodeConfig = (filename, { libraryTarget, target, externalsType, ...config }) => ({
    output: {
      filename,
      libraryTarget,
    },
    target,
    externals: ['jspdf', 'html2canvas'],
    externalsType,
    babelOptions: {
      presets: ['@babel/preset-env'],
      targets: { node: "current" },
    },
    ...config,
  });


  const builds = {
    browser: makeBrowserConfig('html2pdf.js'),
    browserBundle: makeBrowserConfig('html2pdf.bundle.js', { bundle: true }),
    node: makeNodeConfig('require/html2pdf.cjs.js', { libraryTarget: 'commonjs2', target: 'node', externalsType: 'commonjs' }),
    es: makeNodeConfig('include/html2pdf.es.js', { libraryTarget: 'module', target: 'es6', externalsType: 'module', experiments: { outputModule: true } }),
    ...(isDev ? {} : {
      browserMin: makeBrowserConfig('html2pdf.min.js', { min: true }),
      browserBundleMin: makeBrowserConfig('html2pdf.bundle.min.js', { bundle: true, min: true }),
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
