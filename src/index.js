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
  // Determine the PDF page size.
  var pageSize = jsPDF.getPageSize(opt.jsPDF);
  pageSize.inner = {
    width:  pageSize.width - opt.margin[1] - opt.margin[3],
    height: pageSize.height - opt.margin[0] - opt.margin[2]
  };
  pageSize.inner.ratio = pageSize.inner.height / pageSize.inner.width;

  // Copy the source element into a PDF-styled container div.
  var container = html2pdf.makeContainer(source, pageSize);
  var overlay = container.parentElement;

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

html2pdf.makeContainer = function(source, pageSize) {
  // Enable page-breaks.
  var pageBreaks = source.querySelectorAll('.html2pdf__page-break');
  var pxPageHeight = pageSize.inner.height * pageSize.k / 72 * 96;
  Array.prototype.forEach.call(pageBreaks, function(el) {
    el.style.display = 'block';
    var clientRect = el.getBoundingClientRect();
    el.style.height = pxPageHeight - (clientRect.top % pxPageHeight) + 'px';
  }, this);
};

html2pdf.makePDF = function(canvas, pageSize, opt) {
  // Calculate the number of pages.
  var ctx = canvas.getContext('2d');
  var pxFullHeight = canvas.height;
  var pxPageHeight = Math.floor(canvas.width * pageSize.inner.ratio);
  var nPages = Math.ceil(pxFullHeight / pxPageHeight);

  // Create a one-page canvas to split up the full image.
  var pageCanvas = document.createElement('canvas');
  var pageCtx = pageCanvas.getContext('2d');
  var pageHeight = pageSize.inner.height;
  pageCanvas.width = canvas.width;
  pageCanvas.height = pxPageHeight;

  // Initialize the PDF.
  var pdf = new jsPDF(opt.jsPDF);

  for (var page=0; page<nPages; page++) {
    // Trim the final page to reduce file size.
    if (page === nPages-1) {
      pageCanvas.height = pxFullHeight % pxPageHeight;
      pageHeight = pageCanvas.height * pageSize.inner.width / pageCanvas.width;
    }

    // Display the page.
    var w = pageCanvas.width;
    var h = pageCanvas.height;
    pageCtx.fillStyle = 'white';
    pageCtx.fillRect(0, 0, w, h);
    pageCtx.drawImage(canvas, 0, page*pxPageHeight, w, h, 0, 0, w, h);

    // Add the page to the PDF.
    if (page)  pdf.addPage();
    var imgData = pageCanvas.toDataURL('image/' + opt.image.type, opt.image.quality);
    pdf.addImage(imgData, opt.image.type, opt.margin[1], opt.margin[0],
                 pageSize.inner.width, pageHeight);

    // Add hyperlinks.
    if (opt.enableLinks) {
      var pageTop = page * pageSize.inner.height;
      opt.links.forEach(function(link) {
        if (link.clientRect.top > pageTop && link.clientRect.top < pageTop + pageSize.inner.height) {
          var left = opt.margin[1] + link.clientRect.left;
          var top = opt.margin[0] + link.clientRect.top - pageTop;
          pdf.link(left, top, link.clientRect.width, link.clientRect.height, { url: link.el.href });
        }
      });
    }
  }

  // Finish the PDF.
  pdf.save( opt.filename );
}


// Expose the html2pdf function.
export default html2pdf;
