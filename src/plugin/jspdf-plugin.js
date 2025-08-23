// Import dependencies.
import { jsPDF } from 'jspdf';

// Get dimensions of a PDF page, as determined by jsPDF.
jsPDF.getPageSize = function(orientation, unit, format) {
  // Decode options object
  if (typeof orientation === 'object') {
    var options = orientation;
    orientation = options.orientation;
    unit = options.unit || unit;
    format = options.format || format;
  }

  // Default options
  unit        = unit || 'mm';
  format      = format || 'a4';
  orientation = ('' + (orientation || 'P')).toLowerCase();
  var format_as_string = ('' + format).toLowerCase();

  // Size in pt of various paper formats
  var pageFormats = {
    'a0'  : [2383.94, 3370.39], 'a1'  : [1683.78, 2383.94],
    'a2'  : [1190.55, 1683.78], 'a3'  : [ 841.89, 1190.55],
    'a4'  : [ 595.28,  841.89], 'a5'  : [ 419.53,  595.28],
    'a6'  : [ 297.64,  419.53], 'a7'  : [ 209.76,  297.64],
    'a8'  : [ 147.40,  209.76], 'a9'  : [ 104.88,  147.40],
    'a10' : [  73.70,  104.88], 'b0'  : [2834.65, 4008.19],
    'b1'  : [2004.09, 2834.65], 'b2'  : [1417.32, 2004.09],
    'b3'  : [1000.63, 1417.32], 'b4'  : [ 708.66, 1000.63],
    'b5'  : [ 498.90,  708.66], 'b6'  : [ 354.33,  498.90],
    'b7'  : [ 249.45,  354.33], 'b8'  : [ 175.75,  249.45],
    'b9'  : [ 124.72,  175.75], 'b10' : [  87.87,  124.72],
    'c0'  : [2599.37, 3676.54], 'c1'  : [1836.85, 2599.37],
    'c2'  : [1298.27, 1836.85], 'c3'  : [ 918.43, 1298.27],
    'c4'  : [ 649.13,  918.43], 'c5'  : [ 459.21,  649.13],
    'c6'  : [ 323.15,  459.21], 'c7'  : [ 229.61,  323.15],
    'c8'  : [ 161.57,  229.61], 'c9'  : [ 113.39,  161.57],
    'c10' : [  79.37,  113.39], 'dl'  : [ 311.81,  623.62],
    'letter'            : [612,   792],
    'government-letter' : [576,   756],
    'legal'             : [612,  1008],
    'junior-legal'      : [576,   360],
    'ledger'            : [1224,  792],
    'tabloid'           : [792,  1224],
    'credit-card'       : [153,   243]
  };

  // Unit conversion
  switch (unit) {
    case 'pt':  var k = 1;          break;
    case 'mm':  var k = 72 / 25.4;  break;
    case 'cm':  var k = 72 / 2.54;  break;
    case 'in':  var k = 72;         break;
    case 'px':  var k = 72 / 96;    break;
    case 'pc':  var k = 12;         break;
    case 'em':  var k = 12;         break;
    case 'ex':  var k = 6;          break;
    default:
      throw ('Invalid unit: ' + unit);
  }

  // Dimensions are stored as user units and converted to points on output
  if (pageFormats.hasOwnProperty(format_as_string)) {
    var pageHeight = pageFormats[format_as_string][1] / k;
    var pageWidth = pageFormats[format_as_string][0] / k;
  } else {
    try {
      var pageHeight = format[1];
      var pageWidth = format[0];
    } catch (err) {
      throw new Error('Invalid format: ' + format);
    }
  }

  // Handle page orientation
  if (orientation === 'p' || orientation === 'portrait') {
    orientation = 'p';
    if (pageWidth > pageHeight) {
      var tmp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = tmp;
    }
  } else if (orientation === 'l' || orientation === 'landscape') {
    orientation = 'l';
    if (pageHeight > pageWidth) {
      var tmp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = tmp;
    }
  } else {
    throw('Invalid orientation: ' + orientation);
  }

  // Return information (k is the unit conversion ratio from pts)
  var info = { 'width': pageWidth, 'height': pageHeight, 'unit': unit, 'k': k };
  return info;
};

export default jsPDF;
