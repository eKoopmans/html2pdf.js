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
  const pageBreakSettings = pagebreak => Object.assign({}, defaultSettings, { pagebreak, jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter' } });
  const defaultCondition = (window, customSettings, src) => {
    const settings = Object.assign({}, defaultSettings, customSettings);
    return window.html2pdf().set(settings).from(src || window.document.body).outputPdf('arraybuffer');
  };

  const conditions = {
    default: {
      runner: defaultCondition,
      name: file => `${file}.pdf`,
    },
    legacy: {
      runner: window => window.html2pdf(window.document.body, defaultSettings).outputPdf('arraybuffer'),
      name: file => `${file}.pdf`,
    },
    margin: {
      runner: window => defaultCondition(window, { margin: 1, jsPDF: { unit: 'in' } }),
      name: file => `${file}_margin.pdf`,
    },
    selectMainId: {
      runner: window => defaultCondition(window, {}, window.document.getElementById('main')),
      name: file => `${file}.pdf`,
    },
    pagebreakLegacy: {
      runner: window => defaultCondition(window, pageBreakSettings({ mode: 'legacy' })),
      name: file => `${file}_legacy.pdf`,
    },
    pagebreakCss: {
      runner: window => defaultCondition(window, pageBreakSettings({ mode: 'css' })),
      name: file => `${file}_css.pdf`,
    },
    pagebreakAvoidAll: {
      runner: window => defaultCondition(window, pageBreakSettings({ mode: 'avoid-all' })),
      name: file => `${file}_avoid-all.pdf`,
    },
    pagebreakSpecify: {
      runner: window => defaultCondition(window, pageBreakSettings({ before: '.before', after: '.after', avoid: '.avoid' })),
      name: file => `${file}_specify.pdf`,
    },
  };

  const filesToTest = {
    'blank': [ 'default' ],
    'lorem-ipsum': [ 'default', 'legacy', 'margin' ],
    'all-tags': [ 'default' ],
    'css-selectors': [ 'selectMainId' ],
    'pagebreaks': [ 'pagebreakLegacy', 'pagebreakCss', 'pagebreakAvoidAll', 'pagebreakSpecify' ],
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
      const pdf = await conditions[condition].runner(iframe.contentWindow);
      await expect(pdf).to.matchPdfSnapshot({ interactive: true, customSnapshotIdentifier: conditions[condition].name(file) });
    }));
  }));
});
