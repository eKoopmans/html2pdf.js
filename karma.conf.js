// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai-spies', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: 'src/index.js', watched: false, served: true },
      { pattern: 'test/**/*.js', watched: true },
      { pattern: 'test/reference/*.*', included: false, served: true },
      { pattern: require.resolve('pdftest/dist/pdftest.client.min.js'), watched: false },
      { pattern: require.resolve('pdftest/dist/chai-pdftest.min.js'), watched: false },
    ],


    // list of files / patterns to exclude
    exclude: [
      'test/manual/',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/index.js': ['webpack'],
      'test/**/*.js': ['webpackTests'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,


    // Remove timeouts so the PDF snapshot GUI can wait on user feedback.
    browserNoActivityTimeout: 0,


    // Suppress console.log messages
    client: {
      // captureConsole: false
    },


    webpackPreprocessor: {
      output: {
        library: 'html2pdf',
        libraryExport: 'default',
      },
      target: 'browserslist',
      optimization: { minimize: false },
      watch: true,
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
          },
        ],
      },
    },

    customPreprocessors: {
      webpackTests: {
        base: 'webpack',
        options: {
          output: {},
          externals: ['html2pdf'],
          externalsType: 'global',
        },
      },
    },
  });
}
