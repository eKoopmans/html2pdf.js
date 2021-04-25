describe('legacy mode', function () {
  beforeEach(function () {
    chai.spy.on(html2pdf.Worker.prototype, 'save', function () {return this.then(function save() {})});
    return pdftest.api.connect('http://localhost:3000');
  });

  afterEach(function () {
    chai.spy.restore();
  });

  it('should make a blank PDF', function () {
    return html2pdf('<div></div>').outputPdf().then(function (val) {
      expect(this.save).to.have.been.called.once;
      comparePdf(val, 'blank.pdf');
    });
  });

  it('should handle a source and settings', async function () {
    const settings = {
      margin: 1,
      jsPDF: {unit: 'in'},
      html2canvas: { logging: false },
    };

    const pdfWorker = html2pdf('<h1>Margin: 1 inch</h1>', settings).outputPdf('arraybuffer');
    const pdfArrayBuffer = await pdfWorker;
    expect(pdfWorker.save).to.have.been.called.once;

    await expect(pdfArrayBuffer).to.matchPdfSnapshot({ interactive: true });
  });
});
