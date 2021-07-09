describe('creation', function () {
  it('html2pdf should exist', function () {
    expect(window.html2pdf).to.exist;
  });
  it('html2pdf() should produce a thenable object', function () {
    expect(html2pdf().then).to.be.a('function');
  });
  it('new html2pdf.Worker should produce a thenable object', function () {
    expect((new html2pdf.Worker).then).to.be.a('function');
  });
});
