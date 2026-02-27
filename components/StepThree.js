class StepThree extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._isGenerating = false;
        this._generatedImage = null;
    }

    // Listen for property changes
    set isGenerating(value) {
        this._isGenerating = value;
        this.render();
    }
    get isGenerating() { return this._isGenerating; }

    set generatedImage(value) {
        this._generatedImage = value;
        this.render();
    }
    get generatedImage() { return this._generatedImage; }

    connectedCallback() {
        this.render(); // Initial render
        this.shadowRoot.addEventListener('click', e => {
            if (e.target.id === 'regenerate-btn') {
                this.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { step: 'POSE_CLOTHING' }, 
                    bubbles: true, 
                    composed: true 
                }));
            }
            if (e.target.id === 'start-over-btn') {
                this.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { step: 'FACE_BLEND' }, 
                    bubbles: true, 
                    composed: true 
                }));
            }
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }
                .text-center { text-align: center; }
                .text-2xl { font-size: 1.5rem; }
                .font-bold { font-weight: 700; }
                .text-slate-800 { color: #1e293b; }
                .text-slate-500 { color: #64748b; }
                .mb-8 { margin-bottom: 2rem; }
                .result-wrapper { max-width: 512px; margin: 0 auto; }
                .result-image-wrapper { 
                    border-radius: 1rem; 
                    overflow: hidden; 
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); 
                    background-color: #e2e8f0; 
                    aspect-ratio: 1 / 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .result-image { width: 100%; height: 100%; object-fit: cover; display: block; }
                .loader { width: 60px; height: 60px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .button-group { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;}
                .btn { border: none; font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 0.75rem; cursor: pointer; transition: all 0.2s; }
                #regenerate-btn { background-color: #2563eb; color: white; }
                #start-over-btn { background-color: #e5e7eb; color: #374151; }
            </style>
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-slate-800">
                    ${this._isGenerating ? 'Generating Your Image...' : 'Generation Complete!'}
                </h2>
            </div>
            <div class="result-wrapper">
                <div class="result-image-wrapper">
                    ${this._isGenerating ? '<div class="loader"></div>' : `
                        ${this._generatedImage ? `
                            <img class="result-image" src="${this._generatedImage}" alt="Generated Image">
                        ` : '<p class="text-slate-500">No image generated yet.</p>'}
                    `}
                </div>
                ${!this._isGenerating && this._generatedImage ? `
                    <div class="button-group">
                        <button id="regenerate-btn" class="btn">Regenerate</button>
                        <button id="start-over-btn" class="btn">Start Over</button>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

export default StepThree;
