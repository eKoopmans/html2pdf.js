/* global XMLHttpRequest, expect, assert */
/*
  Source:
  Copyright (c) 2010-2016 James Hall, https://github.com/MrRio/jsPDF
*/
var globalVar = (typeof self !== "undefined" && self || typeof global !== "undefined" && global || typeof window !== "undefined" && window || (Function ("return this"))());

function loadBinaryResource (url) {
  const req = new XMLHttpRequest();
  req.open('GET', url, false);
   // XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
  req.overrideMimeType('text\/plain; charset=x-user-defined');
  req.send(null);
  if (req.status !== 200) {
    throw new Error('Unable to load file');
  }

  var responseText = req.responseText;
  var responseTextLen = req.responseText.length;
  return responseText;
}

function cleanUpUnicode(value) {
  var i = 0;
  var byteArray = [];
  var StringFromCharCode = String.fromCharCode;
  for (i = 0; i < value.length; i += 1) {
    byteArray.push(StringFromCharCode(value.charCodeAt(i) & 0xff));
  }
  return byteArray.join("");
}

function sendReference (filename, data) {
  var req = new XMLHttpRequest();
  req.open('POST', 'http://localhost:9090' + filename, true);
  req.send(data);
}

function resetFile(pdfFile) {
  pdfFile = pdfFile.replace(/\/CreationDate \(D:(.*?)\)/, '/CreationDate (D:19871210000000+00\'00\')');
  pdfFile = pdfFile.replace(/(\/ID \[ (<[0-9a-fA-F]+> ){2}\])/, '/ID [ <00000000000000000000000000000000> <00000000000000000000000000000000> ]');
  pdfFile = pdfFile.replace(/(\/Producer \(jsPDF [1-9].[0-9].[0-9]\))/, '/Producer (jsPDF 0.0.0)');
  return pdfFile;
}
/**
 * Find a better way to set this
 * @type {Boolean}
 */
globalVar.comparePdf = function (actual, expectedFile, suite, unicodeCleanUp) {
  unicodeCleanUp = unicodeCleanUp || true;
  var pdf;
  var expectedPath = '/test/reference/' + expectedFile;

  try {
    pdf = loadBinaryResource('/base' + expectedPath, unicodeCleanUp);
    if (typeof pdf !== 'string') {
      throw Error("Error loading '" + expectedPath + "'");
    }
  } catch (error) {
    sendReference(expectedPath, cleanUpUnicode(resetFile(actual.replace(/^\s+|\s+$/g, ''))));
    return assert.fail(error.message);
  }
  var expected = cleanUpUnicode(resetFile(pdf.replace(/^\s+|\s+$/g, '')));
  actual = cleanUpUnicode(resetFile(actual.replace(/^\s+|\s+$/g, '')));

  expect(actual.replace(/[\r]/g, '').split('\n')).to.eql(expected.replace(/[\r]/g, '').split('\n'));
};
