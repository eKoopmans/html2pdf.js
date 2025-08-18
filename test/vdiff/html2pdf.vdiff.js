import '../util/test-harness.js';
import { expect, fixture, html } from '@brightspace-ui/testing';
import { ifDefined } from 'lit/directives/if-defined.js';
import sinon from 'sinon';

describe('html2pdf', () => {
  const defaultSettings = { html2canvas: { logging: false } };
  const pageBreakSettings = pagebreak => ({
    ...defaultSettings,
    pagebreak,
    jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter' },
  });

  const conditions = {
    default: {},
    legacy: {
      command: async (window, element, settings) => {
        const stub = sinon.stub(window.html2pdf.Worker.prototype, 'save').callsFake(function () { return this.then(function save() { }); });
        const arrayBuffer = await window.html2pdf(element, settings).outputPdf('arraybuffer');
        stub.restore();
        return arrayBuffer;
      },
    },
    margin: {
      settings: { ...defaultSettings, margin: 1, jsPDF: { unit: 'in' } },
    },
    selectCanvas: {
      selector: '#canvas',
    },
    selectMainId: {
      selector: '#main',
    },
    pagebreakLegacy: {
      settings: pageBreakSettings({ mode: 'legacy' }),
    },
    pagebreakCss: {
      settings: pageBreakSettings({ mode: 'css' }),
    },
    pagebreakAvoidAll: {
      settings: pageBreakSettings({ mode: 'avoid-all' }),
    },
    pagebreakSpecify: {
      settings: pageBreakSettings({ before: '.before', after: '.after', avoid: '.avoid' }),
    },
  };

  const filesToTest = {
    'blank': [ 'default' ],
    'lorem-ipsum': [ 'default', 'legacy', 'margin' ],
    'all-tags': [ 'default', 'selectCanvas' ],
    'css-selectors': [ 'default', 'selectMainId' ],
    'pagebreaks': [ 'pagebreakLegacy', 'pagebreakCss', 'pagebreakAvoidAll', 'pagebreakSpecify' ],
  };

  Object.keys(filesToTest).forEach(file => describe(file, () => {
    const href = `/test/reference/${file}.html`;

    filesToTest[file].forEach(conditionName => it(conditionName, async () => {
      const condition = conditions[conditionName];
      const testHarness = await fixture(html`
        <test-harness
          .command=${condition.command}
          href=${href}
          selector=${ifDefined(condition.selector)}
          .settings=${condition.settings || defaultSettings}
          show="pdf"
        ></test-harness>
      `, { viewport: { height: 20000, width: 1000 } });

      await expect(testHarness).to.be.golden();
    }));
  }));
});
