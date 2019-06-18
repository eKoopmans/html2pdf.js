import Worker from '../worker.js';
import { unitConvert, createIFrameContainer } from '../utils.js';

// Add hyperlink functionality to the PDF creation.

// Main link array, and refs to original functions.
var linkInfo = [];
var orig = {
  toCanvas: Worker.prototype.toCanvas,
  toPdf: Worker.prototype.toPdf,
};

Worker.prototype.toCanvas = function toCanvas() {
  return this.then(function toCanvas_hyperlink() {
    // Attach extra behaviour to the domtoimage onclone property.
    var oncloneOrig = this.opt.domtoimage.onclone || function () {},
        self = this;

    this.opt.domtoimage.onclone = function (rootElement) {
      // We need to add the cloned element to an iframe to calculate bounding client rectangle
      return createIFrameContainer.bind(self)(rootElement)
          .then(function (iframe) {
            onclone_hyperlink.bind(self)(oncloneOrig, iframe);
          });
    }
  }).then(orig.toCanvas.bind(this));
};

function onclone_hyperlink(oncloneOrig, iframe) {
  // Retrieve hyperlink info if the option is enabled.
  if (this.opt.enableLinks) {
    var container = iframe.contentWindow.document.body;

    var links = container.querySelectorAll('a');
    var containerRect = unitConvert(container.getBoundingClientRect(), this.prop.pageSize.k);
    linkInfo = [];

    // Loop through each anchor tag.
    Array.prototype.forEach.call(links, function(link) {
      // Treat each client rect as a separate link (for text-wrapping).
      var clientRects = link.getClientRects();
      for (var i=0; i<clientRects.length; i++) {
        var clientRect = unitConvert(clientRects[i], this.prop.pageSize.k);
        clientRect.left -= containerRect.left;
        clientRect.top -= containerRect.top;

        var page = Math.floor(clientRect.top / this.prop.pageSize.inner.height) + 1;
        var top = this.opt.margin[0] + clientRect.top % this.prop.pageSize.inner.height;
        var left = this.opt.margin[1] + clientRect.left;

        linkInfo.push({ page, top, left, clientRect, link });
      }
    }, this);
  }

  // Call the original onclone callback.
  oncloneOrig(container);
}

Worker.prototype.toPdf = function toPdf() {
  return orig.toPdf.call(this).then(function toPdf_hyperlink() {
    // Add hyperlinks if the option is enabled.
    if (this.opt.enableLinks) {
      // Attach each anchor tag based on info from the cloned document.
      linkInfo.forEach(function(l) {
        this.prop.pdf.setPage(l.page);
        this.prop.pdf.link(l.left, l.top, l.clientRect.width, l.clientRect.height,
                           { url: l.link.href });
      }, this);

      // Reset the active page of the PDF to the final page.
      var nPages = this.prop.pdf.internal.getNumberOfPages();
      this.prop.pdf.setPage(nPages);
    }
  });
};
