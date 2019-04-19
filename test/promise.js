describe('promise', function () {
  it('should resolve', function () {
    return Promise.resolve();
  });

  it('should preserve its value', function () {
    return Promise.resolve(5).then(function (result) {
      expect(result).to.equal(5);
    });
  });
});
