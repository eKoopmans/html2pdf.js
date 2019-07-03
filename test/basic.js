describe('html2pdf', function () {
  describe('creation', function () {
    it('should exist', function () {
      expect(html2pdf).to.exist;
    });

    it('should produce a thenable object', function () {
      expect(html2pdf().then).to.be.a('function');
      expect((new html2pdf.Worker).then).to.be.a('function');
    });
  });
});
