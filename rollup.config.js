// Import dependencies.
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
  // Bundled builds.
  {
    name: 'html2pdf',
    input: 'src/index.js',
    output: [
      { file: pkg.main.replace(/js$/, 'bundle.js'), format: 'cjs' },
      { file: pkg.module.replace(/js$/, 'bundle.js'), format: 'es' },
      { file: pkg.browser.replace(/js$/, 'bundle.js'), format: 'iife' },
      { file: pkg.browser.replace(/js$/, 'umd.bundle.js'), format: 'umd' }
    ],
    globals: {
      jspdf: 'jsPDF',
      html2canvas: 'html2canvas'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  // Un-bundled builds.
  {
    name: 'html2pdf',
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
      { file: pkg.browser, format: 'iife' },
      { file: pkg.browser.replace(/js$/, 'umd.js'), format: 'umd' }
    ],
    external: [
      'jspdf',
      'html2canvas'
    ],
    globals: {
      jspdf: 'jsPDF',
      html2canvas: 'html2canvas'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];
