// Import dependencies.
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

function banner() {
  var text = pkg.name + ' v' + pkg.version + '\n';
  text += 'Copyright (c) ' + (new Date).getFullYear() + ' Erik Koopmans\n';
  text += 'Released under the ' + pkg.license + ' License.';
  text = '/**\n * ' + text.replace(/\n/g, '\n * ') + '\n */';
  return { banner: text };
}
function license(filename) {
  filename = filename || './LICENSE';
  var data = fs.readFileSync(filename).toString();
  data = '/**\n * @license\n * ' + data.trim().replace(/\n/g, '\n * ') + '\n */\n';
  return { banner: data };
}

var globals = {
  jspdf: 'jsPDF',
  html2canvas: 'html2canvas'
};

var manualChunks = {};

export default [
  // Un-bundled builds.
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs', globals },
      { file: pkg.module, format: 'es', globals },
      { file: pkg.browser, format: 'umd', name: 'html2pdf', globals }
    ],
    external: [
      'jspdf',
      'html2canvas',
    ],
    plugins: [
      resolve(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      babel({ exclude: 'node_modules/**' }),
      banner()
    ]
  },
  // Un-bundled builds (minified).
  {
    input: 'src/index.js',
    output: [
      { file: pkg.browser.replace(/js$/, 'min.js'), format: 'umd', name: 'html2pdf', globals }
    ],
    external: [
      'jspdf',
      'html2canvas',
    ],
    plugins: [
      resolve(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      babel({ exclude: 'node_modules/**' }),
      uglify({
        output: { preamble: banner().banner }
      })
    ]
  },
  // Bundled builds.
  {
    input: 'src/index.js',
    output: [
      { file: pkg.browser.replace(/js$/, 'bundle.js'), format: 'umd', name: 'html2pdf', manualChunks }
    ],
    plugins: [
      resolve(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      babel({ exclude: 'node_modules/**' }),
      banner()
    ]
  },
  // Bundled builds (minified).
  {
    input: 'src/index.js',
    output: [
      { file: pkg.browser.replace(/js$/, 'bundle.min.js'), format: 'umd', name: 'html2pdf', manualChunks }
    ],
    plugins: [
      resolve(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      babel({ exclude: 'node_modules/**' }),
      uglify({
        output: { preamble: banner().banner }
      })
    ]
  }
];
