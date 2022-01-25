import Worker from '../worker.js';
import { jsPDF } from 'jspdf';
import * as html2canvas from 'html2canvas';

/* iOS PDF Canvas Size limitation Workaround plugin:

    Creates a canvas per page instead of attempting to render the entire document as one canvas.
    
    This is not optimal but produces the desired result.
*/

Worker.prototype.toPdf = function toPdf() {
  var prereqs = [
    function checkContainer() { return document.body.contains(this.prop.container)
                               || this.toContainer(); }
  ];

  return this.thenList(prereqs).then(async function toPdf_pagebreak_internal() {
    var opt = this.opt;
    var root = this.prop.container;
    var pxPageWidth = this.prop.pageSize.inner.px.width;
    var pxPageHeight = this.prop.pageSize.inner.px.height;

    var clientBoundingRect = root.getBoundingClientRect();
    
    var pxFullHeight = clientBoundingRect.height;
    var nPages = Math.ceil(pxFullHeight / pxPageHeight);
    
    opt.html2canvas.width = pxPageWidth;
    opt.html2canvas.height = pxPageHeight;

    opt.html2canvas.windowWidth = pxPageWidth;
    opt.html2canvas.windowHeight = pxPageHeight;

    // Initialize the PDF.
    this.prop.pdf = this.prop.pdf || new jsPDF(opt.jsPDF);

    for (var page=0; page<nPages; page++) {
      var options = Object.assign({}, opt.html2canvas);
      delete options.onrendered;

      // Increase the y value to capture only the 'current' page
      options.x = 0;
      options.y = page * pxPageHeight;

      var canvas = await html2canvas(this.prop.container, options);

      // Add the page to the PDF.
      if (page)  this.prop.pdf.addPage();
      var imgData = canvas.toDataURL('image/' + opt.image.type, opt.image.quality);
      this.prop.pdf.addImage(imgData, opt.image.type, opt.margin[1], opt.margin[0],
                        this.prop.pageSize.inner.width, this.prop.pageSize.inner.height);
    }
    
    document.body.removeChild(this.prop.overlay);
  });
}