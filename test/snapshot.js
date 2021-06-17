describe('snapshot', () => {
  before(() => {
    return pdftest.api.connect('http://localhost:3000');
  });

  function loadElement({ document, tagName, src }) {
    const element = document.createElement(tagName);
    const loaded = new Promise(resolve => element.addEventListener('load', () => resolve(element)));
    element.src = src;
    document.body.appendChild(element);
    return loaded;
  }

  const defaultSettings = { html2canvas: { logging: false } };

  const conditions = {
    default: (window, document) => window.html2pdf().set(defaultSettings).from(document.body).outputPdf('arraybuffer'),
    legacy: (window, document) => window.html2pdf(document.body, defaultSettings).outputPdf('arraybuffer'),
    margin: (window, document) => {
      const settings = Object.assign({}, defaultSettings, { margin: 1, jsPDF: { unit: 'in' } });
      return window.html2pdf().set(settings).from(document.body).outputPdf('arraybuffer');
    },
  };

  const snapshotNames = {
    default: file => `${file}.pdf`,
    legacy: file => `${file}.pdf`,
    margin: file => `${file}_margin.pdf`,
  };

  const filesToTest = {
    'blank': [ 'default' ],
    'lorem-ipsum': [ 'default', 'legacy', 'margin' ],
    'all-tags': [ 'default' ],
  };

  Object.keys(filesToTest).forEach(file => describe(file, () => {
    let iframe;
    
    before(async () => {
      iframe = await loadElement({ document, tagName: 'iframe', src: `/base/test/reference/${file}.html` });
      await loadElement({ document: iframe.contentDocument, tagName: 'script', src: '/base/src/index.js' });
      chai.spy.on(iframe.contentWindow.html2pdf.Worker.prototype, 'save', function () { return this.then(function save() {}); });
    });
    after(() => {
      chai.spy.restore();
      document.body.removeChild(iframe);
    });

    filesToTest[file].forEach(condition => it(`should match snapshot for ${condition} settings`, async () => {
      const pdf = await conditions[condition](iframe.contentWindow, iframe.contentDocument);
      await expect(pdf).to.matchPdfSnapshot({ interactive: true, customSnapshotIdentifier: snapshotNames[condition](file) });
    }));
  }));
});
