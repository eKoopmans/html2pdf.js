import JSON5 from 'json5';
import { Modal } from 'bootstrap';
import Vue from 'vue/dist/vue.esm.browser.js';

const h2pVersions = [ '0.12.1', '0.12.0', '0.11.3', '0.11.2', '0.11.1', '0.11.0', '0.10.3', '0.10.2', '0.10.1', '0.10.0', '0.9.3' ];
const iframeHtmlInitial = `<html>
  <body>
    <h1>Heading</h1>
    <p>Some text</p>
    <!-- Scripts selected above will be automatically loaded -->
  </body>
</html>`;
const h2pOptionsDefault = '{ }';
const h2cOptionsDefault = '{ windowWidth: 816 }'; // 816 pt = 612 px = 8.5"

function getHtml2pdfSrc(version, isBundle) {
  const bundleStr = isBundle ? '.bundle' : '';
  return `https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/${version}/html2pdf${bundleStr}.js`
}

Vue.component('h2p-select', {
  template: `
    <select class="form-select" v-model="$root.html2pdfVersion" @change="$root.h2pUpdateVersion">
      <option value="local">Local (latest)</option>
      <option v-for="version in $root.h2pVersions" :value="version">v{{ version }} (cdnjs)</option>
      <option value="custom">Custom source</option>
    </select>`,
});

Vue.component('custom-input', {
  props: ['id', 'label', 'placeholder', 'value', 'readonly', 'rootclass', 'inputclass', 'inputtype'],
  computed: {
    inputProps () {
      return (({ label, rootclass, inputclass, inputtype, ...rest }) => ({ class: inputclass, ...rest }))(this.$props);
    }
  },
  template: `
    <div class="input-group" :class="rootclass || 'mb-3'">
      <label class="input-group-text" :for="id">{{ label }}</label>
      <slot>
        <textarea v-if="inputtype === 'textarea'" class="form-control" v-bind="inputProps" @input="$emit('input', $event.target.value)"></textarea>
        <input v-else type="text" class="form-control" v-bind="inputProps" @input="$emit('input', $event.target.value)">
      </slot>
    </div>`,
});

Vue.component('button-with-dropdown', {
  template: `
    <div class="btn-group w-100">
      <button type="button" class="btn btn-primary" @click="$emit('click')"><slot name="label"></slot></button>
      <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" data-bs-reference="parent" aria-expanded="false">
        <span class="visually-hidden">Toggle Dropdown</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <slot></slot>
      </ul>
    </div>`,
});

Vue.component('custom-modal', {
  props: ['id', 'title', 'buttons', 'modalclass'],
  template: `
    <div class="modal fade" :id="id" tabindex="-1" :aria-labelledby="id + 'Label'" aria-hidden="true">
      <div class="modal-dialog" :class="modalclass">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="id + 'Label'">{{ title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" :id="id + 'Body'">
            <slot></slot>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <slot name="buttons"></slot>
          </div>
        </div>
      </div>
    </div>`,
});

const app = new Vue({
  el: '#main',
  data: {
    isReady: false,
    isBundle: true,
    isCustom: false,
    html2pdfVersion: 'local',
    html2pdfSrc: './html2pdf.js',
    html2canvasSrc: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.3.2/html2canvas.js',
    jspdfSrc: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.3.1/jspdf.umd.js',
    h2pVersions: h2pVersions,
    iframeHtml: iframeHtmlInitial,
    iframeWindow: null,
    h2pOptions: h2pOptionsDefault,
    h2cOptions: h2cOptionsDefault,
    selector: 'body',
    canvas: null,
  },
  computed: {
    iframe: () => document.querySelector('#iframe'),
  },
  methods: {
    h2pUpdateVersion () {
      const version = this.html2pdfVersion;
      this.isCustom = version === 'custom';
      if (this.isCustom) return;

      const isLocal = version === 'local';
      this.html2pdfSrc = isLocal ? './html2pdf.js' : getHtml2pdfSrc(version, this.isBundle);
    },
    loadHtml () {
      this.iframe.onload = this.attachScripts.bind(this);
      this.iframe.srcdoc = this.iframeHtml;
    },
    attachScripts () {
      console.log('html2canvasSrc', this.html2canvasSrc);
      const _document = this.iframe.contentDocument;
      if (!_document) throw new Error('Unexpected: Cannot access document of iframe.');

      const scriptsToAttach = [ this.html2canvasSrc, this.jspdfSrc, this.html2pdfSrc ];
      scriptsToAttach.forEach(scriptSrc => {
        const script = _document.createElement('script');
        script.src = scriptSrc;
        script.type = 'module';
        script.defer = true;
        _document.body.appendChild(script);
      });
    },
    customJsShowModal () {
      new Modal(document.querySelector('#customJsModal')).show();
    },
    h2pShowModal () {
      new Modal(document.querySelector('#h2pModal')).show();
    },
    h2cShowModal () {
      new Modal(document.querySelector('#h2cModal')).show();
    },
    setupMake (scriptName) {
      const _window = this.iframe.contentWindow;
      if (!_window[scriptName]) return alert(`${scriptName} not found in iframe. Remember to load HTML and scripts first.`);
      const target = _window.document.querySelector(this.selector);
      if (!target) return alert('Target not found in iframe.');

      return { [scriptName]: _window[scriptName], target };
    },
    makePdf ({ isDefault } = {}) {
      const { html2pdf, target } = this.setupMake('html2pdf');
      const h2pOptions = JSON5.parse(isDefault ? h2pOptionsDefault : this.h2pOptions);

      html2pdf(target, h2pOptions);
    },
    makeCanvas ({ isDefault } = {}) {
      const { html2canvas, target } = this.setupMake('html2canvas');
      const h2cOptions = JSON5.parse(isDefault ? h2cOptionsDefault : this.h2cOptions);

      html2canvas(target, h2cOptions).then(canvas => {
        this.canvas = canvas;
        canvas.style.width = '100%';
        canvas.style.height = '';
        document.querySelector('#canvas-target').replaceChildren(canvas);

        new Modal(document.querySelector('#canvasModal')).show();
      });
    },
    saveCanvas () {
      if (!this.canvas) return alert('Canvas not found.');

      const a = document.createElement('a');
      a.download = 'html2canvas-result';
      a.href = this.canvas.toDataURL();
      a.click();
    },
  },
  mounted () {
    this.isReady = true;
  },
});
