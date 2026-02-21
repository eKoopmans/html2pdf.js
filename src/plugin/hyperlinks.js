import Worker from '../worker.js';
import { unitConvert } from '../utils.js';

// Add hyperlink functionality to the PDF creation.

// Main link array, and refs to original functions.
var linkInfo = [];
var orig = {
  toContainer: Worker.prototype.toContainer,
  toPdf: Worker.prototype.toPdf,
};

Worker.prototype.toContainer = function toContainer() {
  var self = this;
  return orig.toContainer.call(this).then(function toContainer_hyperlink() {
    // Retrieve hyperlink info if the option is enabled.

    function storeLinkInfo(container, externalPage) {
      var links = container.querySelectorAll('a');
      var containerRect = unitConvert(container.getBoundingClientRect(), self.prop.pageSize.k);

      // Loop through each anchor tag.
      Array.prototype.forEach.call(links, function(link) {
        // Treat each client rect as a separ nmate link (for text-wrapping).
        var clientRects = link.getClientRects();
        for (var i=0; i<clientRects.length; i++) {
          var clientRect = unitConvert(clientRects[i], self.prop.pageSize.k);
          clientRect.left -= containerRect.left;
          clientRect.top -= containerRect.top;

          var page = externalPage || (Math.floor(clientRect.top / self.prop.pageSize.inner.height) + 1);
          var top = self.opt.margin[0] + clientRect.top % self.prop.pageSize.inner.height;
          var left = self.opt.margin[1] + clientRect.left;

          linkInfo.push({ page, top, left, clientRect, link });
        }
      });
    }

    if (self.opt.enableLinks) {
      // Find all anchor tags and get the container's bounds for reference.
      linkInfo = [];

      if (Array.isArray(self.opt.enableLinks)) {
        self.opt.enableLinks.forEach(function({id, page}) {
          storeLinkInfo(document.getElementById(id), page);
        });
      } else {
        storeLinkInfo(self.prop.container);
      }
    }
  });
};

Worker.prototype.toPdf = function toPdf() {
  return orig.toPdf.call(this).then(function toPdf_hyperlink() {
    // Add hyperlinks if the option is enabled.
    if (this.opt.enableLinks) {
      // Attach each anchor tag based on info from toContainer().
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
