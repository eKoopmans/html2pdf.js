import '../util/test-harness.js';
import { expect, fixture, html } from '@brightspace-ui/testing';
import { ifDefined } from 'lit/directives/if-defined.js';

const pageSize = { height: 794, width: 614 };
const viewport = { height: pageSize.height * 10 + 100, width: pageSize.width + 100 };

const conditions = {
  default: {},
  legacy: { command: 'legacy' },
  margin: { settings: 'margin' },
  selectCanvas: { selector: '#canvas' },
  selectMainId: { selector: '#main' },
  pagebreakLegacy: { settings: 'pagebreakLegacy' },
  pagebreakCss: { settings: 'pagebreakCss' },
  pagebreakAvoidAll: { settings: 'pagebreakAvoidAll' },
  pagebreakSpecify: { settings: 'pagebreakSpecify' },
  textSource: { textSource: true },
};

const fileConditions = {
  'blank': ['default', 'textSource'],
  'lorem-ipsum': ['default', 'legacy', 'margin'],
  'all-tags': ['default', 'selectCanvas'],
  'css-selectors': ['default', 'selectMainId'],
  'pagebreaks': ['pagebreakLegacy', 'pagebreakCss', 'pagebreakAvoidAll', 'pagebreakSpecify'],
};

describe('html2pdf', () => {
  Object.keys(fileConditions).forEach(file => describe(file, () => {
    const href = `/test/reference/${file}.html`;

    fileConditions[file].forEach(conditionName => it(conditionName, async () => {
      const condition = conditions[conditionName];
      const testHarness = await fixture(html`
        <test-harness
          command=${ifDefined(condition.command)}
          href=${href}
          selector=${ifDefined(condition.selector)}
          settings=${ifDefined(condition.settings)}
          show="pdf"
          text-source=${ifDefined(condition.textSource)}
        ></test-harness>
      `, { viewport });

      await expect(testHarness).to.be.golden();
    }));
  }));
});
