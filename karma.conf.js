// Karma configuration

// Load Rollup dependencies
const rollupConfig = {
  resolve: require('rollup-plugin-node-resolve'),
  commonjs: require('rollup-plugin-commonjs'),
  replace: require('rollup-plugin-replace'),
  babel: require('rollup-plugin-babel')
}

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai-spies', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: 'src/index.js', watched: false },
      { pattern: 'test/reference/*.*', included: false, served: true },
      { pattern: require.resolve('pdftest/dist/pdftest.client.min.js'), watched: false },
      { pattern: require.resolve('pdftest/dist/chai-pdftest.min.js'), watched: false },
      'test/**/*.js'
    ],


    // list of files / patterns to exclude
    exclude: [
      'test/manual/',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/index.js': ['rollup'],
      'test/**/*.js': ['rollupTests'],
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


    // Rollup preprocessor
    // Setup as a normal Rollup config object, just without the input
    // It has its own autoWatch behaviour, so Karma's file watcher must be disabled on its files
    rollupPreprocessor: {
      output: {
        name: 'html2pdf',
        format: 'iife',
        globals: {
          jspdf: 'jsPDF',
          html2canvas: 'html2canvas'
        }
      },
      plugins: [
        rollupConfig.resolve(),
        rollupConfig.commonjs(),
        rollupConfig.replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
        rollupConfig.babel({ exclude: 'node_modules/**' })
      ]
    },

    customPreprocessors: {
      rollupTests: {
        base: 'rollup',
        options: {
          output: {
            name: 'html2pdf_test',
            format: 'iife',
            globals: {
              html2pdf: 'html2pdf',
            },
          },
        },
      },
    },
  })
}
