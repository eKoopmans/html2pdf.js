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
  // NOTE: Promise.resolve(this) doesn't actually resolve, using null for now.
  //  -> research this further!
  Object.assign(this, Worker.template);
  this.ready = Promise.resolve(null);

  this.set(opt);
  this.setProgress(1, Worker, 1, [Worker]);
};

Worker.template = {
  ready: null,
  src: null,
  container: null,
  canvas: null,
  img: null,
  pdf: null,
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
    // TODO: Implement `isCanvas`, `isDom`, `isString`, etc. (just internally in this function, using objType)
    return isCanvas(src) ? 'canvas' : isDom(src) ? 'html' : isString(src) ? 'string' : 'unknown';
  }

  return this.thenInternal(function() {
    type = type || getType(src);
    switch (type) {
      case 'string':  return this.set({ src: createElement('div', {innerHTML: src}) });
      case 'html':    return this.set({ src: src });
      case 'canvas':  return this.set({ canvas: src });
      case 'img':     return this.set({ img: src });
      default:        throw 'Unknown source type.';
    }
  });
  /*
  // TODO HERE: Change each case to use the 'setter' functions.
  return this.thenInternal(function(val) {
    if (type === 'img') {
      this.img = src;
    } else if (type === 'canvas' || !type && isCanvas(src)) {
      this.canvas = src;
    } else if (type === 'container') {
      this.container = src;
    } else if (type === 'html' || !type && isDom(src)) {
      this.src = src;
    } else if (type === 'string' || !type && isString(src)) {
      this.src = createElement('div', {innerHTML: src});
    } else {
      throw 'Unknown source type.';
    }
  });
  */
};

Worker.prototype.to = function to(target) {
  // Route the 'to' request to the appropriate method.
  // NOTE: thenInternal is necessary for the catch...
  return this.thenInternal(function() {
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
        throw 'Invalid target.';
    }
  });
};

Worker.prototype.toContainer = function toContainer() {
  // Set up function prerequisites.
  var reqs = [
    [this.src, function() { throw 'Cannot duplicate - no source HTML Element or string provided.'; }]
  ];

  return this.thenInternal(function() {
    return prereq(reqs);
  }).thenInternal(function() {
    // Define the CSS styles for the container and its overlay parent.
    var overlayCSS = {
      position: 'fixed', overflow: 'hidden', zIndex: 1000,
      left: 0, right: 0, bottom: 0, top: 0,
      backgroundColor: 'rgba(0,0,0,0.8)'
    };
    var containerCSS = {
      position: 'absolute', width: pageSize.inner.width + pageSize.unit,
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

    // TODO HERE: Finish adapting the code in here from index.js.
    /*
    // Enable page-breaks.
    var pageBreaks = source.querySelectorAll('.html2pdf__page-break');
    var pxPageHeight = pageSize.inner.height * pageSize.k / 72 * 96;
    Array.prototype.forEach.call(pageBreaks, function(el) {
      el.style.display = 'block';
      var clientRect = el.getBoundingClientRect();
      el.style.height = pxPageHeight - (clientRect.top % pxPageHeight) + 'px';
    }, this);
    */
  });
};

Worker.prototype.toCanvas = function toCanvas() {
  // Set up function prerequisites.
  var reqs = [
    [this.container, this.toContainer.bind(this)]
  ];

  // Fulfill prereqs then create the canvas.
  return this.thenInternal(function() {
    return prereq(reqs);
  }).thenInternal(function() {
    return html2canvas(this.src, this.opt.html2canvas);
  }).thenInternal(function(canvas) {
    this.canvas = canvas;
  });
};

Worker.prototype.toImg = function toImg() {
  // Set up function prerequisites.
  var reqs = [
    [this.canvas, this.toCanvas.bind(this)]
  ];

  // Fulfill prereqs then create the image.
  return this.thenInternal(function() {
    return prereq(reqs);
  }).thenInternal(function() {
    var imgData = this.canvas.toDataURL('image/' + opt.image.type, opt.image.quality);
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
  return this.thenInternal(function() {
    return prereq(reqs);
  }).thenInternal(function() {
    // TODO: Transfer PDF code from index.js.
  });
};


/* ----- EXPORT / SAVE ----- */

Worker.prototype.export = function export(type) {
  return this.thenInternal(function() {
    // TODO HERE: Program all the different export options.
  });
}

Worker.prototype.save = function save(filename) {
  // Set up function prerequisites.
  var reqs = [
    [this.pdf, this.toPdf.bind(this)]
  ];

  // Fulfill prereqs, update the filename (if provided), and save the PDF.
  return this.thenInternal(function() {
    return prereq(reqs);
  }).set(
    filename ? { filename: filename } : null
  ).thenInternal(function() {
    this.pdf.save(this.opt.filename);
  });
}

/* ----- SET / GET ----- */

Worker.prototype.set = function set(opt) {
  // TODO: Test null/undefined input to this function.
  // TODO: Implement ordered pairs?
  return this.thenInternal(function() {
    for (var key in opt) {
      if (key in Worker.template) {
        // Set root-level properties.
        this[key] = opt[key];
      } else if (key === 'margin') {
        // Parse the margin property.
        var margin = opt.margin;
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
            throw 'Invalid margin array.';
        }
        this.opt.margin = margin;
      } else {
        // Set any other properties in opt.
        this.opt[key] = opt[key];
      }
    }
  });
};

Worker.prototype.get = function get(key, cbk) {
  // Allow either callback or promise-based use.
  return this.callbackOrPromise(cbk, function() {
    // Fetch the requested property, either as a root prop or in opt.
    return (key in Worker.template) ? this[key] : this.opt[key];
  }.bind(this));
};

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

Worker.prototype.then = function then(fn) {
  // TODO: Look up how `this` is bound generally.
  //  -> i.e. for html2pdf().from(myDiv).to('canvas').then(function() {... return this;}).to('pdf');
  return this.ready.then(fn);
};

Worker.prototype.catch = function catch(fn) {
  return this.ready['catch'](fn);
};

Worker.prototype.thenInternal = function thenInternal(fn) {
  // Wrap 'this' for the encapsulated function.
  var self = this;

  // Update progress when queuing, calling, and resolving the function.
  self.updateProgress(null, null, 1, [fn]);
  self.ready = self.ready.then(function(val) {
    self.updateProgress.call(self, null, fn);
    return fn.call(self, val);
  }).then(function(val) {
    self.updateProgress.call(self, 1);
    return val;
  });

  // Internal thens always return 'this' (instead of a promise).
  return self;
};

Worker.prototype.callbackOrPromise = function callbackOrPromise(cbk, valFn) {
  // Compute the value and send to callback (via thenInternal) or return as promise.
  function task() {
    var value = valFn();
    return cbk ? cbk(value) : value;
  }
  return cbk ? this.thenInternal(task) : this.then(task);
};

/* ----- ALIASES ----- */

Worker.prototype.using = Worker.prototype.set;
Worker.prototype.saveAs = Worker.prototype.save;
Worker.prototype.output = Worker.prototype.export;
Worker.prototype.run = Worker.prototype.thenInternal;
