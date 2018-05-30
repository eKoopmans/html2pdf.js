import Worker from '../worker.js';

var orig = {
  toContainer: Worker.prototype.toContainer
};

Worker.prototype.toContainer = function toContainer() {
  return orig.toContainer.call(this).then(function toContainer_pagebreak() {
    // Enable page-breaks.
    var pageBreaks = this.prop.container.querySelectorAll('.html2pdf__page-break');
    var pxPageHeight = this.prop.pageSize.inner.px.height;
    Array.prototype.forEach.call(pageBreaks, function pageBreak_loop(el) {
      el.style.display = 'block';
      var clientRect = el.getBoundingClientRect();
      el.style.height = pxPageHeight - (clientRect.top % pxPageHeight) + 'px';
    }, this);

    // Shim some padding before elements that would otherwise intersect a page break
    pageBreaks = this.prop.container.querySelectorAll('.html2pdf__avoid-page-break');
    Array.prototype.forEach.call(pageBreaks, function pageBreak_loop(el) {
      var clientRect = el.getBoundingClientRect();
      var startPage = Math.floor(clientRect.top / pxPageHeight);
      var endPage = Math.floor(clientRect.bottom / pxPageHeight);
      if (endPage > startPage && Math.abs(endPage - startPage) === 1) {
        // the element is straddling a single page break.
        // insert a padding div to push the element to the next page.
        var currentDocHeight = (startPage + 1) * pxPageHeight;
        var pad = document.createElement('div');
        pad.style.display = 'block';
        pad.style.height = currentDocHeight - clientRect.top % currentDocHeight + 'px';
        el.parentNode.insertBefore(pad, el);
      }
    }, this);
  });
};