import Worker from '../worker.js';

var orig = {
  toContainer: Worker.prototype.toContainer
};

/**
 * html2pdf__page-break-before - Page break Before the Element the pagebreak is on.
 * html2pdf__page-break-after - Page break After the Element the pagebreak is on.
 * html2pdf__page-break - Same behaviour as html2pdf__page-break-after.
 * html2pdf__page-break-auto - Automatically determine if the page break is necessary,
 *                             this is usefull on elements like images that you
 *                             do not want to break.
 */
Worker.prototype.toContainer = function toContainer() {
  return orig.toContainer.call(this).then(function toContainer_pagebreak() {
    var pageBreaksBefore = this.prop.container.querySelectorAll('.html2pdf__page-break-before');
    var pageBreaksAfter = this.prop.container.querySelectorAll('.html2pdf__page-break-after');
    var pageBreaks = this.prop.container.querySelectorAll('.html2pdf__page-break');
    var pageBreakAvoid = this.prop.container.querySelectorAll('.html2pdf__page-break-auto');
    var pxPageHeight = this.prop.pageSize.inner.px.height;
    function toPx(val, k) {
      return Math.floor(val * k / 72 * 96);
    }
    Array.prototype.forEach.call(pageBreakAvoid, function pageBreak_loop(el) {
      el.style.display = 'block';
      var clientRect = el.getBoundingClientRect();
      var margin = toPx(this.opt.margin[0], this.prop.pageSize.k);
      if ((((clientRect.bottom + margin) / this.prop.container.offsetHeight) * pxPageHeight) > pxPageHeight) {
        el.style.marginTop = pxPageHeight - (clientRect.top - margin) % pxPageHeight + 'px';
      }
    }, this);
    Array.prototype.forEach.call(pageBreaksBefore, function pageBreak_loop(el) {
      el.style.display = 'block';
      var clientRect = el.getBoundingClientRect();
      el.style.marginTop = pxPageHeight - (clientRect.top - margin) % pxPageHeight + 'px';
    }, this);
    Array.prototype.forEach.call(pageBreaksAfter, function pageBreak_loop(el) {
      el.style.display = 'block';
      var clientRect = el.getBoundingClientRect();
      el.style.marginBottom = pxPageHeight - (clientRect.top - margin) % pxPageHeight + 'px';
    }, this);
    Array.prototype.forEach.call(pageBreaks, function pageBreak_loop(el) {
      el.style.display = 'block';
      var clientRect = el.getBoundingClientRect();
      el.style.marginBottom = pxPageHeight - (clientRect.top - margin) % pxPageHeight + 'px';
    }, this);
  });
};
