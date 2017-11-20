// Import dependencies.
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
  // Bundled builds.
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main.replace(/js$/, 'bundle.js'), format: 'cjs' },
      { file: pkg.module.replace(/js$/, 'bundle.js'), format: 'es' },
      { file: pkg.browser.replace(/js$/, 'bundle.js'), format: 'iife' },
      { file: pkg.browser.replace(/js$/, 'umd.bundle.js'), format: 'umd' }
    ]
  },
  // Un-bundled builds.
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
      { file: pkg.browser, format: 'iife' },
      { file: pkg.browser.replace(/js$/, 'umd.js'), format: 'umd' }
    ]
  }
];
