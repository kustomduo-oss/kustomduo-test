class StepOne extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.person1 = null;
        this.person2 = null;
        this.blendRatio = 50;
        this.render();
    }

    connectedCallback() {
        const imageUpload1 = this.shadowRoot.querySelector('#person1-upload');
        const imageUpload2 = this.shadowRoot.querySelector('#person2-upload');
        const slider = this.shadowRoot.querySelector('#blend-slider');
        const blendBtn = this.shadowRoot.querySelector('#blend-btn');

        imageUpload1.addEventListener('change', (e) => this.person1 = e.detail);
        imageUpload2.addEventListener('change', (e) => this.person2 = e.detail);
        slider.addEventListener('input', (e) => this.updateBlendRatio(e.target.value));
        blendBtn.addEventListener('click', this.handleBlend.bind(this));
    }

    updateBlendRatio(value) {
        this.blendRatio = value;
        this.shadowRoot.querySelector('#slider-value').textContent = `${this.blendRatio}/${100 - this.blendRatio}`;
        this.shadowRoot.querySelector('#p1-ratio').textContent = `${100 - this.blendRatio}% P1`;
        this.shadowRoot.querySelector('#p2-ratio').textContent = `${this.blendRatio}% P2`;
    }

    handleBlend() {
        if (!this.person1 || !this.person2) {
            alert('Please upload both images.');
            return;
        }
        this.dispatchEvent(new CustomEvent('blend', {
            detail: {
                person1: this.person1,
                person2: this.person2,
                blendRatio: this.blendRatio,
                // Add other options later (model, resolution etc.)
            },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :host { display: block; }
                .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; /* gap-6 */ }
                .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }

                /* Face Blending Card */
                .blend-card { background-color: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                .slider-container { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
                .slider-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; }
                #slider-value { font-weight: 600; color: #1e293b; }
                input[type="range"] { flex-grow: 1; accent-color: #2563eb; }

                /* Options Card */
                .options-card { display: flex; justify-content: space-between; align-items: center; background-color: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                .options-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; flex-grow: 1; }
                .form-group label { display: block; font-size: 0.75rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
                select { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem; font-size: 0.875rem; }
                #blend-btn { 
                    background-color: #2563eb; 
                    color: white; 
                    font-weight: 700; 
                    padding: 1rem 2rem; 
                    border-radius: 0.75rem; 
                    border: none; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                }

            </style>
            <div class="space-y-8">
                <div class="grid-cols-2">
                    <image-upload 
                        id="person1-upload" 
                        component-title="Person 1 (Face)" 
                        icon-class="fa-user" 
                        title="Upload Person 1"
                        subtitle="Click or Paste">
                    </image-upload>
                    <image-upload 
                        id="person2-upload" 
                        component-title="Person 2 (Face)" 
                        icon-class="fa-user" 
                        title="Upload Person 2"
                        subtitle="Click or Paste">
                    </image-upload>
                </div>

                <div class="blend-card">
                    <div class="slider-labels">
                        <span id="p1-ratio">50% P1</span>
                        <span>Face Mix (Balanced)</span>
                        <span id="p2-ratio">50% P2</span>
                    </div>
                    <div class="slider-container">
                        <span>100% P1</span>
                        <input type="range" id="blend-slider" min="0" max="100" value="50">
                        <span>100% P2</span>
                    </div>
                    <div class="text-center" id="slider-value">50/50</div>
                </div>

                <div class="options-card">
                    <div class="options-grid">
                        <div class="form-group">
                            <label for="model">MODEL</label>
                            <select id="model">
                                <option>Nano Banana</option>
                            </select>
                        </div>
                         <div class="form-group">
                            <label for="resolution">RESOLUTION</label>
                            <select id="resolution">
                                <option>1K</option>
                            </select>
                        </div>
                         <div class="form-group">
                            <label for="aspect-ratio">ASPECT RATIO</label>
                            <select id="aspect-ratio">
                                <option>1:1</option>
                            </select>
                        </div>
                         <div class="form-group">
                            <label for="quantity">QUANTITY</label>
                            <select id="quantity">
                                <option>1 Image</option>
                            </select>
                        </div>
                    </div>
                    <button id="blend-btn">
                        <i class="fas fa-wand-magic-sparkles"></i>
                        Blend Faces
                    </button>
                </div>
            </div>
        `;
    }
}

export default StepOne;
