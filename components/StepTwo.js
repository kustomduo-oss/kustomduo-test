class StepTwo extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.poseImage = null;
        this.clothingImage = null;
        this.formState = {
            model: 'flash',
            aspectRatio: '1:1',
            resolution: '1024x1024',
            quantity: 1,
        };
    }

    static get observedAttributes() {
        return ['selectedblendedface'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'selectedblendedface' && oldValue !== newValue) {
            this.render();
            this.addEventListeners();
        }
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    addEventListeners() {
        const poseUpload = this.shadowRoot.querySelector('#pose-upload');
        if (poseUpload) {
            poseUpload.addEventListener('change', (e) => {
                this.poseImage = e.detail;
                this.render();
                this.addEventListeners();
            });
        }

        const clothingUpload = this.shadowRoot.querySelector('#clothing-upload');
        if (clothingUpload) {
            clothingUpload.addEventListener('change', (e) => {
                this.clothingImage = e.detail;
                this.render();
                this.addEventListeners();
            });
        }

        this.shadowRoot.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.formState.model = e.currentTarget.dataset.model;
                this.shadowRoot.querySelectorAll('.model-btn').forEach(b =>
                    b.classList.toggle('active', b.dataset.model === this.formState.model)
                );
            });
        });

        const aspectRatio = this.shadowRoot.querySelector('#aspect-ratio');
        if (aspectRatio) {
            aspectRatio.addEventListener('change', (e) => this.formState.aspectRatio = e.target.value);
        }

        const resolution = this.shadowRoot.querySelector('#resolution');
        if (resolution) {
            resolution.addEventListener('change', (e) => this.formState.resolution = e.target.value);
        }

        const quantity = this.shadowRoot.querySelector('#quantity');
        if (quantity) {
            quantity.addEventListener('change', (e) => this.formState.quantity = parseInt(e.target.value, 10));
        }

        const generateBtn = this.shadowRoot.querySelector('#generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', this.handleGenerate.bind(this));
        }

        const backBtn = this.shadowRoot.querySelector('#back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('navigate', {
                    detail: { step: 'FACE_BLEND' },
                    bubbles: true,
                    composed: true
                }));
            });
        }
    }

    handleGenerate() {
        if (!this.poseImage || !this.clothingImage) {
            alert('Please upload both a pose and a clothing image.');
            return;
        }
        this.dispatchEvent(new CustomEvent('generate-result', {
            detail: {
                pose: this.poseImage,
                clothing: this.clothingImage,
                ...this.formState,
            },
            bubbles: true,
            composed: true
        }));
    }

    get selectedBlendedFace() {
        const attr = this.getAttribute('selectedblendedface');
        try {
            return JSON.parse(attr);
        } catch (e) {
            return null;
        }
    }

    render() {
        const face = this.selectedBlendedFace;
        const { model, aspectRatio, resolution, quantity } = this.formState;

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :host { display: block; }
                .container { padding: 2rem 0; }
                .grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 2rem; }
                h2 { font-size: 1.5rem; font-weight: 800; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem; }
                .button { background-image: linear-gradient(to top right, #2563eb, #4f46e5); color: white; padding: 0.875rem 1.75rem; border-radius: 0.75rem; font-weight: 600; text-align: center; cursor: pointer; border: none; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);}
                .button:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
                .button:disabled { background: #d1d5db; background-image: none; cursor: not-allowed; box-shadow: none; transform: none; }
                .secondary-button { background: #e5e7eb; background-image: none; color: #374151; box-shadow: none; }
                .secondary-button:hover { background: #d1d5db; transform: none; box-shadow: none; }
                .card { background-color: white; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); overflow: hidden; }
                .card-content { padding: 1.5rem; }
                .card-header { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin-bottom: 1rem; }
                .upload-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
                .selected-face-card { text-align: center; }
                .selected-face-card img { max-width: 150px; border-radius: 0.75rem; margin: 0 auto; box-shadow: 0 0 20px rgba(79, 70, 229, 0.4); border: 2px solid #4f46e5; }
                .nav-buttons { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; }

                .settings-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
                .settings-section h3 { font-size: 0.875rem; font-weight: 700; color: #374151; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .settings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
                .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
                .model-selector { display: flex; background-color: #f1f5f9; border-radius: 0.75rem; padding: 0.25rem; }
                .model-btn { flex: 1; padding: 0.5rem; border: none; background-color: transparent; border-radius: 0.6rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; }
                .model-btn.active { background-color: white; color: #2563eb; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); }
                .model-btn i { margin-right: 0.3rem; }
                select { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.6rem 0.75rem; font-size: 0.875rem; background-color: #fff; cursor: pointer; }

                @media (min-width: 768px) {
                    .grid { grid-template-columns: 1fr 2fr; }
                }
            </style>

            <div class="container">
                <div class="nav-buttons" style="margin-bottom: 1.5rem; justify-content: flex-start;">
                    <button id="back-btn" class="button secondary-button"><i class="fas fa-arrow-left"></i> Back to Face Selection</button>
                </div>

                <div class="grid">
                    <!-- Left Column: Selected Face -->
                    <div class="card selected-face-card">
                        <div class="card-content">
                            <h3 class="card-header">Your AI-Generated Face</h3>
                            ${face ? `
                                <img src="${face.src}" alt="Selected blended face">
                                <p style="color: #6b7280; font-size: 0.9rem; margin-top: 1rem;">This face will be used in the final generation step.</p>
                            ` : `
                                <div style="height: 150px; display: flex; align-items: center; justify-content: center; color: #9ca3af;">No face selected.</div>
                            `}
                        </div>
                    </div>

                    <!-- Right Column: Uploads + Settings -->
                    <div class="card">
                        <div class="card-content">
                            <h2 style="margin-bottom: 1rem;">Step 2: Pose, Clothing & Settings</h2>
                            <p style="color: #6b7280; margin-bottom: 2rem;">Upload reference images and configure the output options.</p>

                            <div class="upload-grid">
                                <image-upload id="pose-upload" component-title="Pose Reference" icon-class="fa-person-running" preview-src="${this.poseImage || ''}"></image-upload>
                                <image-upload id="clothing-upload" component-title="Clothing Reference" icon-class="fa-shirt" preview-src="${this.clothingImage || ''}"></image-upload>
                            </div>

                            <div class="settings-section">
                                <h3><i class="fas fa-sliders"></i> Output Settings</h3>
                                <div class="settings-grid">
                                    <div class="form-group">
                                        <label>Model</label>
                                        <div class="model-selector">
                                            <button class="model-btn ${model === 'flash' ? 'active' : ''}" data-model="flash"><i class="fas fa-bolt"></i>Flash</button>
                                            <button class="model-btn ${model === 'pro' ? 'active' : ''}" data-model="pro"><i class="fas fa-gem"></i>Pro</button>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="aspect-ratio">Aspect Ratio</label>
                                        <select id="aspect-ratio">
                                            <option value="1:1" ${aspectRatio === '1:1' ? 'selected' : ''}>1:1 (Square)</option>
                                            <option value="16:9" ${aspectRatio === '16:9' ? 'selected' : ''}>16:9 (Widescreen)</option>
                                            <option value="9:16" ${aspectRatio === '9:16' ? 'selected' : ''}>9:16 (Vertical)</option>
                                            <option value="4:3" ${aspectRatio === '4:3' ? 'selected' : ''}>4:3 (Standard)</option>
                                            <option value="3:4" ${aspectRatio === '3:4' ? 'selected' : ''}>3:4 (Portrait)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="quantity">Quantity</label>
                                        <select id="quantity">
                                            <option value="1" ${quantity === 1 ? 'selected' : ''}>1 Image</option>
                                            <option value="2" ${quantity === 2 ? 'selected' : ''}>2 Images</option>
                                            <option value="3" ${quantity === 3 ? 'selected' : ''}>3 Images</option>
                                            <option value="4" ${quantity === 4 ? 'selected' : ''}>4 Images</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Generate Button -->
                <div class="nav-buttons">
                    <div></div>
                    <button id="generate-btn" class="button" ${!this.poseImage || !this.clothingImage ? 'disabled' : ''}>
                        <i class="fas fa-wand-magic-sparkles"></i> Generate Final Image
                    </button>
                </div>
            </div>
        `;
    }
}
export default StepTwo;
