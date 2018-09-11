import Worker from '../worker.js';

// Add page-break functionality.

// Refs to original functions.
var orig = {
  toContainer: Worker.prototype.toContainer
};

Worker.prototype.toContainer = function toContainer() {
  return orig.toContainer.call(this).then(function toContainer_pagebreak() {
    // Find all page-break elements and setup page height.
    var pageBreaks = this.prop.container.querySelectorAll('.html2pdf__page-break');
    var pxPageHeight = this.prop.pageSize.inner.px.height;

    // Set each page-break element to a block with the appropriate height.
    Array.prototype.forEach.call(pageBreaks, function pageBreak_loop(el) {
      el.style.display = 'block';
      var clientRect = el.getBoundingClientRect();
      el.style.height = pxPageHeight - (clientRect.top % pxPageHeight) + 'px';
    }, this);
  });
};
