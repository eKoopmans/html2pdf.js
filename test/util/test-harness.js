import { css, html, LitElement, nothing } from 'lit';
import { LoadingCompleteMixin } from '@brightspace-ui/core/mixins/loading-complete/loading-complete-mixin.js';

const IFRAME_SCRIPTS_URL = new URL('./iframe-scripts.js', import.meta.url).href;
const TEXT_SOURCE = `
    <span id="target">Safe</span> text
    <img src=x onerror="document.querySelector('#target').innerHTML = 'Onerror'">
    <script>document.querySelector('#target').innerHTML = 'Script'</script>
`;
const stub = (object, method, fake) => {
    const original = object[method];
    object[method] = fake;
    return () => object[method] = original;
};

const commands = {
    default: (window, src, settings) => window.html2pdf().set(settings).from(src).outputPdf('arraybuffer'),
    legacy: async (window, src, settings) => {
        const restore = stub(window.html2pdf.Worker.prototype, 'save', function () { return this.then(function save() { }); });
        const arrayBuffer = await window.html2pdf(src, settings).outputPdf('arraybuffer');
        restore();
        return arrayBuffer;
    },
};
const files = ['all-tags', 'blank', 'css-selectors', 'lorem-ipsum', 'pagebreaks'];
const selectors = ['body', '#canvas', '#main'];
const settingsDefault = {
    html2canvas: { logging: false },
    jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter' },
};
const settings = {
    default: settingsDefault,
    margin: { ...settingsDefault, margin: 1 },
    pagebreakAvoidAll: { ...settingsDefault, pagebreak: { mode: 'avoid-all' } },
    pagebreakCss: { ...settingsDefault, pagebreak: { mode: 'css' } },
    pagebreakLegacy: { ...settingsDefault, pagebreak: { mode: 'legacy' } },
    pagebreakSpecify: { ...settingsDefault, pagebreak: { before: '.before', after: '.after', avoid: '.avoid' } },
};

class TestHarness extends LoadingCompleteMixin(LitElement) {
    static properties = {
        command: { type: String },
        controls: { type: Boolean },
        file: { type: String },
        href: { type: String, reflect: true },
        selector: { type: String },
        settings: { type: String },
        show: { type: String, reflect: true },
        textSource: { type: Boolean, attribute: 'text-source' },
        _arrayBuffer: { state: true },
    };

    static styles = css`
        :host {
            display: inline-block;
        }
        iframe {
            border: none;
        }
        iframe[hidden] {
            display: block;
            height: 0;
            visibility: hidden;
            width: 0;
        }
        iframe#source {
            width: 100%;
        }
        .controls {
            display: flex;
            flex-wrap: wrap;
            font-size: 14px;
            gap: 4px;
        }
        .controls select {
            font-size: 12px;
        }
    `;

    constructor() {
        super();

        this.command = 'default';
        this.controls = false;
        this.file = '';
        this.href = null;
        this.selector = 'body';
        this.settings = 'default';
        this.show = 'pdf';

        this._pdfIframe = null;
        this._pdfIframeWindow = null;
    }

    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);

        if (changedProperties.has('file') && this.file) {
            this.href = `/test/reference/${this.file}.html`;
        }

        if (['command', 'selector', 'settings'].some(v => changedProperties.has(v))) {
            this._pdfIframeWindow?.location.reload();
        }
    }

    render() {
        if (!this.href) return nothing;

        return html`
            ${this._renderControls()}
            <iframe
                ?hidden=${this.show !== 'source'}
                id="source"
                src=${this.href}
                @load=${this._handleSrcIframeLoad}
            ></iframe>
            <iframe
                ?hidden=${this.show !== 'pdf'}
                id="pdf"
                src=${this.href}
                @load=${this._handlePdfIframeLoad}
            ></iframe>
        `;
    }

    _clickShow() {
        this.show = this.show === 'pdf' ? 'source' : 'pdf';
    }

    _handlePdfIframeLoad(e) {
        this._pdfIframe = e.target;
        this._pdfIframeWindow = e.target.contentWindow;

        const script = this._pdfIframeWindow.document.createElement('script');
        script.addEventListener('load', this._handleScriptLoad.bind(this));
        script.src = IFRAME_SCRIPTS_URL;
        script.type = 'module';

        this._pdfIframeWindow.document.body.appendChild(script);
    }

    _handleSrcIframeLoad(e) {
        const iframe = e.target;
        return this._resizeIframe(iframe);
    }

    async _handleScriptLoad() {
        const src = this.textSource ? TEXT_SOURCE : this._pdfIframeWindow.document.querySelector(this.selector);

        const command = commands[this.command || 'default'];
        const arrayBuffer = await command(this._pdfIframeWindow, src, settings[this.settings || 'default']);
        await this._pdfIframeWindow.renderPdf(arrayBuffer);

        this._resizeIframe(this._pdfIframe, true);
        this.resolveLoadingComplete();
    }

    _renderControls() {
        if (!this.controls) return nothing;

        return html`
            <div class="controls">
                <label for="file-select">File:</label>
                <select id="file-select" @change=${this._selectFile}>
                    <option value=""></option>
                    ${files.map(file => html`<option value="${file}" ?selected=${file === this.file}>${file}</option>`)}
                </select>

                <label for="selector-select">Selector:</label>
                <select id="selector-select" @change=${this._selectSelector}>
                    ${selectors.map(selector => html`<option value="${selector}" ?selected=${selector === this.selector}>${selector}</option>`)}
                </select>

                <label for="settings-select">Settings:</label>
                <select id="settings-select" @change=${this._selectSettings}>
                    ${Object.keys(settings).map(setting => html`<option value="${setting}" ?selected=${settings === this.settings}>${setting}</option>`)}
                </select>

                <label for="command-select">Command:</label>
                <select id="command-select" @change=${this._selectCommand}>
                    ${Object.keys(commands).map(command => html`<option value="${command}" ?selected=${command === this.command}>${command}</option>`)}
                </select>

                <button @click=${this._clickShow}>Show ${this.show === 'pdf' ? 'Source' : 'PDF'}</button>
            </div>
        `;
    }

    _resizeIframe(iframe, useBody) {
        const html = iframe.contentWindow.document.documentElement;
        const target = useBody ? html.querySelector('body') : html;
        const domRect = target.getBoundingClientRect();
        iframe.width = domRect.width;
        iframe.height = domRect.height;
    }

    _selectCommand(e) {
        this.command = e.target.value;
    }

    _selectFile(e) {
        this.file = e.target.value;
    }

    _selectSelector(e) {
        this.selector = e.target.value;
    }

    _selectSettings(e) {
        this.settings = e.target.value;
    }
}

customElements.define('test-harness', TestHarness);
