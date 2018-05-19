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
  });
};
