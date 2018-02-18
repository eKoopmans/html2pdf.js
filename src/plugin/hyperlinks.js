import Worker from '../worker.js';
import { unitConvert } from '../utils.js';

var orig = {
  toPdf: Worker.prototype.toPdf,
};

Worker.prototype.toPdf = function toPdf() {
  // Add hyperlink functionality to the PDF creation.
  return orig.toPdf.call(this).then(function() {
    // Add hyperlinks if the option is enabled.
    if (this.opt.enableLinks) {
      // Find all anchor tags and get the container's bounds for reference.
      var links = this.container.querySelectorAll('a');
      var containerRect = unitConvert(this.container.getBoundingClientRect(), this.pageSize.k);

      // Loop through each anchor tag.
      Array.prototype.forEach.call(links, function(link) {
        // Treat each client rect as a separate link (for text-wrapping).
        var clientRects = link.getClientRects();
        for (var i=0; i<clientRects.length; i++) {
          var clientRect = unitConvert(clientRects[i], this.pageSize.k);
          clientRect.left -= containerRect.left;
          clientRect.top -= containerRect.top;

          var page = Math.floor(clientRect.top / this.pageSize.inner.height) + 1;
          var top = this.opt.margin[0] + clientRect.top % this.pageSize.inner.height;
          var left = this.opt.margin[1] + clientRect.left;

          this.pdf.setPage(page);
          this.pdf.link(left, top, clientRect.width, clientRect.height, { url: link.href });
        }
      });

      // Reset the active page of the PDF to the final page.
      var nPages = this.pdf.putTotalPages().internal.getNumberOfPages();
      this.pdf.setPage(nPages);
    }
  });
};
