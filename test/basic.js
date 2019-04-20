describe('html2pdf', function () {
  it('should exist', function () {
    expect(html2pdf).to.exist;
  });

  it('should have default settings', function () {
    return html2pdf().then(function () {
      expect(this.opt.filename).to.equal('file.pdf');
    });
  });
});
