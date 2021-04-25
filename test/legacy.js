describe('legacy mode', function () {
  beforeEach(function () {
    chai.spy.on(html2pdf.Worker.prototype, 'save', function () {return this.then(function save() {})});
    return pdftest.api.connect('http://localhost:3000');
  });

  afterEach(function () {
    chai.spy.restore();
  });

  const getPdf = async (source, opt) => {
    const pdfWorker = html2pdf(source, opt).outputPdf('arraybuffer');
    const pdfArrayBuffer = await pdfWorker;
    expect(pdfWorker.save).to.have.been.called.once;

    return pdfArrayBuffer;
  };

  it('should make a blank PDF', async function () {
    const pdfArrayBuffer = await getPdf('<div></div>', settings);
    await expect(pdfArrayBuffer).to.matchPdfSnapshot({ interactive: true });
  });

  it('should handle a source and settings', async function () {
    const settings = {
      margin: 1,
      jsPDF: {unit: 'in'},
      html2canvas: { logging: false },
    };

    const pdfArrayBuffer = await getPdf('<h1>Margin: 1 inch</h1>', settings);
    await expect(pdfArrayBuffer).to.matchPdfSnapshot({ interactive: true });
  });
});
