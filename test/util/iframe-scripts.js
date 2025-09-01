import html2pdf from '../../src/index.js';
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs';
window.html2pdf = html2pdf;
window.renderPdf = renderPdf;

async function renderPdf(arrayBuffer, scale = 1) {
    const pdfObject = await pdfjs.getDocument(arrayBuffer).promise;

    const pagesPlaceholder = new Array(pdfObject.numPages).fill();
    const pages = await Promise.all(pagesPlaceholder.map(async (_, i) => {
        const canvas = document.createElement('canvas');
        canvas.style.border = '1px solid black';
        await renderPdfPage(pdfObject, i + 1, canvas, scale);
        return canvas;
    }));

    document.documentElement.innerHTML = '';
    document.documentElement.style.lineHeight = '0px';
    document.body.style.display = 'inline-block';
    document.body.style.margin = '0px';
    pages.forEach(page => document.body.appendChild(page));
}

async function renderPdfPage(pdfObject, pageNumber, canvas, scale) {
    const page = await pdfObject.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
}
