// Determine the type of a variable/object.
export const objType = function objType(obj) {
  var type = typeof obj;
  if (type === 'undefined')                                 return 'undefined';
  else if (type === 'string' || obj instanceof String)      return 'string';
  else if (type === 'number' || obj instanceof Number)      return 'number';
  else if (type === 'function' || obj instanceof Function)  return 'function';
  else if (!!obj && obj.constructor === Array)              return 'array';
  else if (obj && obj.nodeType === 1)                       return 'element';
  else if (type === 'object')                               return 'object';
  else                                                      return 'unknown';
};

// Create an HTML element with optional className, innerHTML, and style.
export const createElement = function createElement(tagName, opt) {
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

// Convert units from px using the conversion value 'k' from jsPDF.
export const unitConvert = function unitConvert(obj, k) {
  if (objType(obj) === 'number') {
    return obj * 72 / 96 / k;
  } else {
    var newObj = {};
    for (var key in obj) {
      newObj[key] = obj[key] * 72 / 96 / k;
    }
    return newObj;
  }
};

// Convert units to px using the conversion value 'k' from jsPDF.
export const toPx = function toPx(val, k) {
  return Math.floor(val * k / 72 * 96);
}
