import 'es6-promise/auto';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './plugin/jspdf-plugin.js';
import { objType, createElement, cloneNode, unitConvert } from './utils.js';

/**
 * Generate a PDF from an HTML element or string using html2canvas and jsPDF.
 *
 * @param {Element|string} source The source element or HTML string.
 * @param {Object=} opt An object of optional settings: 'margin', 'filename',
 *    'image' ('type' and 'quality'), and 'html2canvas' / 'jspdf', which are
 *    sent as settings to their corresponding functions.
 */
var html2pdf = function(source, opt) {
  // Render the canvas and pass the result to makePDF.
  var onRendered = opt.html2canvas.onrendered || function() {};
  delete opt.html2canvas.onrendered;
  var done = function(canvas) {
    onRendered(canvas);
    document.body.removeChild(overlay);
    html2pdf.makePDF(canvas, pageSize, opt);
  };
  html2canvas(container, opt.html2canvas).then(done);
};


// Expose the html2pdf function.
export default html2pdf;
