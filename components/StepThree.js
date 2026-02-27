class StepThree extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._isGenerating = false;
        this._generatedImage = null;
        this.render();
    }

    static get observedAttributes() {
        return ['is-generating', 'generated-image'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'is-generating') {
            this._isGenerating = newValue === 'true';
        }
        if (name === 'generated-image') {
            this._generatedImage = newValue;
        }
        this.render();
    }
    
    set isGenerating(value) {
        this.setAttribute('is-generating', value);
    }

    get isGenerating() {
        return this._isGenerating;
    }

    set generatedImage(value) {
        if (value) {
            this.setAttribute('generated-image', value);
        }
    }

    get generatedImage() {
        return this._generatedImage;
    }

    connectedCallback() {
        this.shadowRoot.addEventListener('click', e => {
            if (e.target.id === 'regenerate-btn') {
                this.dispatchEvent(new CustomEvent('navigate', { detail: { step: 'POSE_INPUT' }, bubbles: true, composed: true }));
            }
            if (e.target.id === 'start-over-btn') {
                this.dispatchEvent(new CustomEvent('navigate', { detail: { step: 'BASE_CHARACTER' }, bubbles: true, composed: true }));
            }
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .text-center { text-align: center; }
                .text-2xl { font-size: 1.5rem; }
                .font-bold { font-weight: 700; }
                .text-slate-800 { color: #1e293b; }
                .mb-8 { margin-bottom: 2rem; }
                .result-wrapper { max-width: 512px; margin: 0 auto 2rem; }
                .result-image-wrapper { border-radius: 1rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
                .result-image { width: 100%; display: block; }
                .button-group { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;}
                .loader { width: 60px; height: 60px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 2rem auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                button { border: none; background: none; cursor: pointer; font-weight: 700; padding: 1rem 2rem; border-radius: 0.75rem; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                #regenerate-btn { background-color: #2563eb; color: white; }
                #regenerate-btn:hover { background-color: #1d4ed8; }
                #start-over-btn { background-color: #e2e8f0; color: #1e293b; }
                #start-over-btn:hover { background-color: #cbd5e1; }
            </style>
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-slate-800">
                    ${this._isGenerating ? 'Generating Your Image...' : 'Generation Complete!'}
                </h2>
            </div>
            <div class="result-wrapper">
                ${this._isGenerating ? '<div class="loader"></div>' : `
                    ${this._generatedImage ? `
                        <div class="result-image-wrapper">
                            <img class="result-image" src="${this._generatedImage}" alt="Generated Image" onerror="this.src='https://placehold.co/512x512?text=Error+Loading+Image'">
                        </div>
                        <div class="button-group">
                            <button id="regenerate-btn">Regenerate</button>
                            <button id="start-over-btn">Start Over</button>
                        </div>
                    ` : '<p class="text-center text-slate-500">Something went wrong. Please try again.</p>'}
                `}
            </div>
        `;
    }
}

export default StepThree;
