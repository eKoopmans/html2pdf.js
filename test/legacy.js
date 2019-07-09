describe('legacy mode', function () {
  // Stub the save functionality.
  beforeEach(function () {
    chai.spy.on(html2pdf.Worker.prototype, 'save', function () {return this.then(function save() {})});
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
  it('should handle a source and settings', function () {
    var settings = {
      margin: 1,
      jsPDF: {unit: 'in'}
    };
    return html2pdf('<h1>Margin: 1 inch</h1>', settings).outputPdf().then(function (val) {
      expect(this.save).to.have.been.called.once;
      comparePdf(val, 'margin-1in.pdf');
    });
  });
});
