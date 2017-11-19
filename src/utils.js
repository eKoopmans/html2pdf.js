// Determine the type of a variable/object.
var objType = function(obj) {
  if (typeof obj === 'undefined')                             return 'undefined';
  else if (typeof obj === 'string' || obj instanceof String)  return 'string';
  else if (typeof obj === 'number' || obj instanceof Number)  return 'number';
  else if (!!obj && obj.constructor === Array)                return 'array';
  else if (obj && obj.nodeType === 1)                         return 'element';
  else if (typeof obj === 'object')                           return 'object';
  else                                                        return 'unknown';
};

// Create an HTML element with optional className, innerHTML, and style.
var createElement = function(tagName, opt) {
  var el = document.createElement(tagName);
  if (opt.className)  el.className = opt.className;
  if (opt.innerHTML) {
    el.innerHTML = opt.innerHTML;
    var scripts = el.getElementsByTagName('script');
    for (var i = scripts.length; i-- > 0; null) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }
  }
  for (var key in opt.style) {
    el.style[key] = opt.style[key];
  }
  return el;
};

// Deep-clone a node and preserve contents/properties.
var cloneNode = function(node, javascriptEnabled) {
  // Recursively clone the node.
  var clone = node.nodeType === 3 ? document.createTextNode(node.nodeValue) : node.cloneNode(false);
  for (var child = node.firstChild; child; child = child.nextSibling) {
    if (javascriptEnabled === true || child.nodeType !== 1 || child.nodeName !== 'SCRIPT') {
      clone.appendChild(cloneNode(child, javascriptEnabled));
    }
  }

  if (node.nodeType === 1) {
    // Preserve contents/properties of special nodes.
    if (node.nodeName === 'CANVAS') {
      clone.width = node.width;
      clone.height = node.height;
      clone.getContext('2d').drawImage(node, 0, 0);
    } else if (node.nodeName === 'TEXTAREA' || node.nodeName === 'SELECT') {
      clone.value = node.value;
    }

    // Preserve the node's scroll position when it loads.
    clone.addEventListener('load', function() {
      clone.scrollTop = node.scrollTop;
      clone.scrollLeft = node.scrollLeft;
    }, true);
  }

  // Return the cloned node.
  return clone;
}

// Convert units using the conversion value 'k' from jsPDF.
var unitConvert = function(obj, k) {
  var newObj = {};
  for (var key in obj) {
    newObj[key] = obj[key] * 72 / 96 / k;
  }
  return newObj;
};
