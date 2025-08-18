import { css, html, LitElement, nothing } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { LoadingCompleteMixin } from '@brightspace-ui/core/mixins/loading-complete/loading-complete-mixin.js';

const IFRAME_SCRIPTS_URL = new URL('./iframe-scripts.js', import.meta.url).href;
const defaultCommand = (window, element, settings) => window.html2pdf().set(settings).from(element).outputPdf('arraybuffer');

class TestHarness extends LoadingCompleteMixin(LitElement) {
    static properties = {
        command: { type: Function, attribute: false },
        controls: { type: Boolean },
        href: { type: String },
        selector: { type: String },
        settings: { type: Object, attribute: false },
        show: { type: String, reflect: true },
        _arrayBuffer: { state: true },
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        iframe {
            border: none;
            width: 100%;
        }
        iframe[hidden] {
            display: block;
            height: 0;
            visibility: hidden;
            width: 0;
        }
    `;

    constructor() {
        super();

        this.command = null;
        this.controls = false;
        this.href = null;
        this.selector = 'body';
        this.settings = {};
        this.show = 'source';

        this._pdfIframe = null;
        this._pdfIframeWindow = null;
        this._refHref = createRef();
    }

    render() {
        if (!this.href) return nothing;

        return html`
            <div ?hidden=${!this.controls}>
                <label>
                    href:
                    <input type="text" value=${this.href} ${ref(this._refHref)}>
                    <button @click=${this._clickSetHref}>Set href</button>
                </label>
                <button @click=${this._clickShow}>Show ${this.show === 'pdf' ? 'Source' : 'PDF'}</button>
            </div>
            <iframe
                ?hidden=${this.show !== 'source'}
                id="source"
                src=${this.href}
                @load=${this._handleIframeLoad}
            ></iframe>
            <iframe
                ?hidden=${this.show !== 'pdf'}
                id="pdf"
                src=${this.href}
                @load=${this._handleIframeLoad}
            ></iframe>
        `;
    }

    _clickSetHref() {
        this.href = this._refHref.value.value;
    }

    _clickShow() {
        this.show = this.show === 'pdf' ? 'source' : 'pdf';
    }

    _handleIframeLoad(e) {
        const iframe = e.target;
        if (iframe.id === 'source') {
            return this._resizeIframe(iframe);
        }

        this._pdfIframe = e.target;
        this._pdfIframeWindow = e.target.contentWindow;

        const script = this._pdfIframeWindow.document.createElement('script');
        script.addEventListener('load', this._handleScriptLoad.bind(this));
        script.src = IFRAME_SCRIPTS_URL;
        script.type = 'module';

        this._pdfIframeWindow.document.body.appendChild(script);
    }

    async _handleScriptLoad() {
        const element = this._pdfIframeWindow.document.querySelector(this.selector);

        const command = this.command || defaultCommand;
        const arrayBuffer = await command(this._pdfIframeWindow, element, this.settings);
        await this._pdfIframeWindow.renderPdf(arrayBuffer);

        this._resizeIframe(this._pdfIframe);
        this.resolveLoadingComplete();
    }

    _resizeIframe(iframe) {
        iframe.width = iframe.contentWindow.document.documentElement.offsetWidth;
        iframe.height = iframe.contentWindow.document.documentElement.offsetHeight;
    }
}

customElements.define('test-harness', TestHarness);
