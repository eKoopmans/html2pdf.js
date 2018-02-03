/* ----- BELOW CODE BELONGS IN INDEX.JS ----- */

import Worker from './worker.js';

var html2pdf = function html2pdf(src, opt) {
  // opt = src ? Object.assign(opt || {}, {src: src}) : opt;
  var worker = new html2pdf.Worker(opt);

  if (src) {
    // If src is specified, perform the traditional 'simple' operation.
    worker.from(src).save();
  } else {
    // Otherwise, return the worker for new Promise-based operation.
    return worker;
  }
}
html2pdf.Worker = Worker;

/* ----- ABOVE CODE BELONGS IN INDEX.JS ----- */






import { objType, createElement, cloneNode, unitConvert } from './utils.js';

/* ----- CONSTRUCTOR ----- */

var Worker = function Worker(opt) {
  var self = Worker.convert(Promise.resolve(), Worker.template);

  self.set(opt);
  self.setProgress(1, Worker, 1, [Worker]);
  return self;
};

// Boilerplate for subclassing Promise.
Worker.prototype = Object.create(Promise.prototype);
Worker.prototype.constructor = Worker;

// Converts/casts promises into Workers.
Worker.convert = function convert(promise, inherit) {
  // Uses prototypal inheritance to receive changes made to ancestors' properties.
  promise.__proto__ = inherit || Worker.prototype;
  return promise;
};

Worker.template = {
  ready: null,
  src: null,
  container: null,
  overlay: null,
  canvas: null,
  img: null,
  pdf: null,
  pageSize: null,
  progress: {
    val: 0,
    state: null,
    n: 0,
    stack: []
  },
  opt: {
    filename: 'file.pdf',
    margin: 0,
    image: { type: 'jpeg', quality: 0.95 },
    enableLinks: true,
    html2canvas: {},
    jsPDF: {}
  }
};

/* ----- FROM / TO ----- */

Worker.prototype.from = function from(src, type) {
  function getType(src) {
    switch (objType(src)) {
      case 'string':  return 'string';
      case 'element': return src.nodeName.toLowerCase === 'canvas' ? 'canvas' : 'html';
      default:        return 'unknown';
    }
  }

  return this.then(function() {
    type = type || getType(src);
    switch (type) {
      case 'string':  return this.set({ src: createElement('div', {innerHTML: src}) });
      case 'html':    return this.set({ src: src });
      case 'canvas':  return this.set({ canvas: src });
      case 'img':     return this.set({ img: src });
      default:        return this.error('Unknown source type.');
    }
  });
};

Worker.prototype.to = function to(target) {
  // Route the 'to' request to the appropriate method.
  switch (target) {
    case 'container':
      return this.toContainer();
    case 'canvas':
      return this.toCanvas();
    case 'img':
      return this.toImg();
    case 'pdf':
      return this.toPdf();
    default:
      return this.error('Invalid target.');
  }
};

Worker.prototype.toContainer = function toContainer() {
  // Set up function prerequisites.
  var reqs = [
    [this.src, this.error.bind(this, 'Cannot duplicate - no source HTML Element or string .')],
    [this.pageSize, this.setPageSize.bind(this)]
  ];

  return this.then(function() {
    return prereq(reqs);
  }).then(function() {
    // Define the CSS styles for the container and its overlay parent.
    var overlayCSS = {
      position: 'fixed', overflow: 'hidden', zIndex: 1000,
      left: 0, right: 0, bottom: 0, top: 0,
      backgroundColor: 'rgba(0,0,0,0.8)'
    };
    var containerCSS = {
      position: 'absolute', width: this.pageSize.inner.width + this.pageSize.unit,
      left: 0, right: 0, top: 0, height: 'auto', margin: 'auto',
      backgroundColor: 'white'
    };

    // Set the overlay to hidden (could be changed in the future to provide a print preview).
    overlayCSS.opacity = 0;

    // Create and attach the elements.
    var source = cloneNode(this.src, this.opt.html2canvas.javascriptEnabled);
    this.overlay = createElement('div',   { className: 'html2pdf__overlay', style: overlayCSS });
    this.container = createElement('div', { className: 'html2pdf__container', style: containerCSS });
    this.container.appendChild(source);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);

    // Enable page-breaks.
    var pageBreaks = source.querySelectorAll('.html2pdf__page-break');
    var pxPageHeight = this.pageSize.inner.px.height;
    Array.prototype.forEach.call(pageBreaks, function(el) {
      el.style.display = 'block';
      var clientRect = el.getBoundingClientRect();
      el.style.height = pxPageHeight - (clientRect.top % pxPageHeight) + 'px';
    }, this);
  });
};

Worker.prototype.toCanvas = function toCanvas() {
  // Set up function prerequisites.
  var reqs = [
    [this.container, this.toContainer.bind(this)]
  ];

  // Fulfill prereqs then create the canvas.
  return this.then(function() {
    return prereq(reqs);
  }).then(function() {
    return html2canvas(this.src, this.opt.html2canvas);
  }).then(function(canvas) {
    this.canvas = canvas;
  });
};

Worker.prototype.toImg = function toImg() {
  // Set up function prerequisites.
  var reqs = [
    [this.canvas, this.toCanvas.bind(this)]
  ];

  // Fulfill prereqs then create the image.
  return this.then(function() {
    return prereq(reqs);
  }).then(function() {
    var imgData = this.canvas.toDataURL('image/' + this.opt.image.type, this.opt.image.quality);
    this.img = document.createElement('img');
    this.img.src = imgData;
  });
};

Worker.prototype.toPdf = function toPdf() {
  // Set up function prerequisites.
  var reqs = [
    [this.canvas, this.toCanvas.bind(this)]
  ];

  // Fulfill prereqs then create the image.
  return this.then(function() {
    return prereq(reqs);
  }).then(function() {
    // Create local copies of frequently used properties.
    var canvas = this.canvas;
    var opt = this.opt;

    // Calculate the number of pages.
    var ctx = canvas.getContext('2d');
    var pxFullHeight = canvas.height;
    var pxPageHeight = Math.floor(canvas.width * this.pageSize.inner.ratio);
    var nPages = Math.ceil(pxFullHeight / pxPageHeight);

    // Define pageHeight separately so it can be trimmed on the final page.
    var pageHeight = this.pageSize.inner.height;

    // Create a one-page canvas to split up the full image.
    var pageCanvas = document.createElement('canvas');
    var pageCtx = pageCanvas.getContext('2d');
    pageCanvas.width = canvas.width;
    pageCanvas.height = pxPageHeight;

    // Initialize the PDF.
    var pdf = new jsPDF(opt.jsPDF);

    for (var page=0; page<nPages; page++) {
      // Trim the final page to reduce file size.
      if (page === nPages-1) {
        pageCanvas.height = pxFullHeight % pxPageHeight;
        pageHeight = pageCanvas.height * this.pageSize.inner.width / pageCanvas.width;
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
                   this.pageSize.inner.width, pageHeight);
    }

    // Attach pdf to this.
    this.pdf = pdf;
  });
};


/* ----- EXPORT / SAVE ----- */

Worker.prototype.export = function export(type) {
  return this.then(function() {
    // TODO HERE: Program all the different export options.
  });
};

Worker.prototype.save = function save(filename) {
  // Set up function prerequisites.
  var reqs = [
    [this.pdf, this.toPdf.bind(this)]
  ];

  // Fulfill prereqs, update the filename (if provided), and save the PDF.
  return this.then(function() {
    return prereq(reqs);
  }).set(
    filename ? { filename: filename } : null
  ).then(function() {
    this.pdf.save(this.opt.filename);
  });
};

/* ----- SET / GET ----- */

Worker.prototype.set = function set(opt) {
  // Set properties immediately.
  //    NOTE: Don't need to worry about race conditions (with .then) because
  //    each promise is unique. So anything set here will override the
  //    prototype, even if an earlier .then resolves after this.
  // TODO: Test null/undefined input to this function.
  // TODO: Implement ordered pairs?
  for (var key in opt) {
    if (key in Worker.template) {
      // Set root-level properties.
      this[key] = opt[key];
    } else {
      switch (key) {
        case 'margin':
          this.setMargin(opt.margin);
          break;
        case 'jsPDF':
          this.jsPDF = opt.jsPDF;
        case 'pageSize':
          this.setPageSize(opt.pageSize);
          break;
        default:
          // Set any other properties in opt.
          this.opt[key] = opt[key];
      }
    }
  }

  // Return this for command chaining.
  return this;
};

Worker.prototype.get = function get(key, cbk) {
  return this.then(function() {
    // Fetch the requested property, either as a root prop or in opt.
    var val = (key in Worker.template) ? this[key] : this.opt[key];
    return cbk ? cbk(val) : val;
  });
};

Worker.prototype.setMargin = function setMargin(margin) {
  // Parse the margin property.
  switch (objType(margin)) {
    case 'number':
      margin = [margin, margin, margin, margin];
    case 'array':
      if (margin.length === 2) {
        margin = [margin[0], margin[1], margin[0], margin[1]];
      }
      if (margin.length === 4) {
        break;
      }
    default:
      return this.error('Invalid margin array.');
  }
  this.opt.margin = margin;

  // Update pageSize with the new margin.
  this.setPageSize();

  // Return this for command chaining.
  return this;
}

Worker.prototype.setPageSize = function setPageSize(pageSize) {
  function toPx(val, k) {
    return Math.floor(val * k / 72 * 96);
  }

  // Retrieve page-size based on jsPDF settings, if not explicitly provided.
  pageSize = pageSize || jsPDF.getPageSize(this.opt.jsPDF);

  // Add 'inner' field if not present.
  if (!pageSize.hasOwnProperty('inner')) {
    pageSize.inner = {
      width:  pageSize.width - this.opt.margin[1] - this.opt.margin[3],
      height: pageSize.height - this.opt.margin[0] - this.opt.margin[2]
    };
    pageSize.inner.px = {
      width:  toPx(pageSize.inner.width, pageSize.k),
      height: toPx(pageSize.inner.height, pageSize.k)
    };
    pageSize.inner.ratio = pageSize.inner.height / pageSize.inner.width;
  }

  // Attach pageSize to this.
  this.pageSize = pageSize;

  // Return this for command chaining.
  return this;
}

Worker.prototype.setProgress = function setProgress(val, state, n, stack) {
  // Immediately update all progress values.
  if (val != null)    this.progress.val = val;
  if (state != null)  this.progress.state = state;
  if (n != null)      this.progress.n = n;
  if (stack != null)  this.progress.stack = stack;
  this.progress.ratio = this.progress.val / this.progress.state;

  // Return this for command chaining.
  return this;
};

Worker.prototype.updateProgress = function updateProgress(val, state, n, stack) {
  // Immediately update all progress values, using setProgress.
  return this.setProgress(
    val ? this.progress.val + val : null,
    state ? state : null,
    n ? this.progress.n + n : null,
    stack ? this.progress.stack.concat(stack) : null
  );
};

/* ----- PROMISE MAPPING ----- */

Worker.prototype.then = function then(onFulfilled, onRejected) {
  // Wrap `this` for encapsulation and bind it to the promise handlers.
  var self = this;
  if (onFulfilled)  { onFulfilled = onFulfilled.bind(self); }
  if (onRejected)   { onRejected = onRejected.bind(self); }

  // Update progress while queuing, calling, and resolving `then`.
  self.updateProgress(null, null, 1, [onFulfilled]);
  var returnVal = Promise.prototype.then.call(self, function(val) {
    self.updateProgress(null, onFulfilled);
    return val;
  }).then(onFulfilled, onRejected).then(function(val) {
    self.updateProgress(1);
    return val;
  });

  // Return the promise, after casting it into a Worker and preserving props.
  return Worker.convert(returnVal, self);
};

Worker.prototype['catch'] = function (onRejected) {
  // Bind `this` to the promise handler, call `catch`, and return a Worker.
  if (onRejected)   { onRejected = onRejected.bind(this); }
  var returnVal = Promise.prototype['catch'].call(this, onRejected);
  return Worker.convert(returnVal, this);
};

Worker.prototype.thenExternal = function thenExternal(onFulfilled, onRejected) {
  // Call `then` and return a standard promise (exits the Worker chain).
  return Promise.prototype.then.call(this, onFulfilled, onRejected);
};

Worker.prototype.catchExternal = function catchExternal(onRejected) {
  // Call `catch` and return a standard promise (exits the Worker chain).
  return Promise.prototype['catch'].call(this, onRejected);
};

Worker.prototype.error = function error(msg) {
  // Throw the error in the Promise chain.
  return this.then(function() {
    throw msg;
  });
};

/* ----- ALIASES ----- */

Worker.prototype.using = Worker.prototype.set;
Worker.prototype.saveAs = Worker.prototype.save;
Worker.prototype.output = Worker.prototype.export;
Worker.prototype.run = Worker.prototype.then;
