import { expect } from '@brightspace-ui/testing';
import html2pdf from '../../src/index.js';

describe('creation', function () {
  it('html2pdf should exist', function () {
    expect(html2pdf).to.exist;
  });
  it('html2pdf() should produce a thenable object', function () {
    expect(html2pdf().then).to.be.a('function');
  });
  it('new html2pdf.Worker should produce a thenable object', function () {
    expect((new html2pdf.Worker).then).to.be.a('function');
  });
});
