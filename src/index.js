import 'es6-promise/auto';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './jspdf-plugin.js';
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
  // Get the locations of all hyperlinks.
  if (opt.enableLinks) {
    // Find all anchor tags and get the container's bounds for reference.
    opt.links = [];
    var links = container.querySelectorAll('a');
    var containerRect = unitConvert(container.getBoundingClientRect(), pageSize.k);

    // Treat each client rect as a separate link (for text-wrapping).
    Array.prototype.forEach.call(links, function(link) {
      var clientRects = link.getClientRects();
      for (var i=0; i<clientRects.length; i++) {
        var clientRect = unitConvert(clientRects[i], pageSize.k);
        clientRect.left -= containerRect.left;
        clientRect.top -= containerRect.top;
        opt.links.push({ el: link, clientRect: clientRect });
      }
    });
  }

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
