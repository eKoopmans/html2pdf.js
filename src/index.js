import Worker from './worker.js';
import './plugin/jspdf-plugin.js';
import './plugin/pagebreaks.js';
import './plugin/hyperlinks.js';

/**
 * Generate a PDF from an HTML element or string using html2canvas and jsPDF.
 *
 * @param {Element|string} source - The HTML element or string to convert.
 * @param {Object=} options - Optional settings including 'margin', 'filename',
 *    'image' ('type' and 'quality'), and settings for 'html2canvas' and 'jspdf'.
 * @returns {Promise|Worker} - Returns a Promise if source is specified, otherwise the Worker instance.
 */
const generatePDF = function (source, options = {}) {
  // Initialize a new worker with the provided options.
  const workerInstance = new generatePDF.Worker(options);

  if (source) {
    // When a source is provided, initiate the 'simple' operation and save the PDF.
    return workerInstance.from(source).save();
  } else {
    // If no source is provided, return the worker instance for Promise-based operations.
    return workerInstance;
  }
};

// Assign Worker to the generatePDF function.
generatePDF.Worker = Worker;

// Export the generatePDF function as the default export.
export default generatePDF;
