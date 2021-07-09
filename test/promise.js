describe('promise', function () {
  it('promises should exist', function () {
    expect(window.Promise).to.exist;
  });
  it('promises should resolve', function () {
    return Promise.resolve();
  });
  it('promises should preserve their value', function () {
    return Promise.resolve(5).then(function (result) {
      expect(result).to.equal(5);
    });
  });
});
