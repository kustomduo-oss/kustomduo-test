class StepOne extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Component properties to receive from AppContainer
        this.blendedFaces = [];
        this.selectedBlendedFace = null;
        this.isGenerating = false;

        // Internal state for the form
        this.formState = {
            person1: null,
            person2: null,
            blendRatio: 50,
            model: 'flash', 
            resolution: '1024x1024',
            aspectRatio: '1:1',
            quantity: 1,
            advancedSettingsVisible: false,
        };
    }
    
    // When the component is added to the page, parse the properties
    connectedCallback() {
        this.blendedFaces = JSON.parse(this.getAttribute('blendedFaces') || '[]');
        this.selectedBlendedFace = JSON.parse(this.getAttribute('selectedBlendedFace') || 'null');
        this.isGenerating = this.getAttribute('isGenerating') === 'true';
        this.render();
        this.addEventListeners();
    }

    addEventListeners() {
        // Determine which view is active and add listeners accordingly
        if (this.blendedFaces.length > 0) {
            // Listeners for the results view
            this.shadowRoot.querySelectorAll('.face-card').forEach(card => {
                card.addEventListener('click', () => this.handleFaceSelect(card.dataset.id));
            });
            const nextStepBtn = this.shadowRoot.querySelector('#next-step-btn');
            if (nextStepBtn) {
                nextStepBtn.addEventListener('click', this.goToNextStep.bind(this));
            }
        } else {
            // Listeners for the initial form view
            this.shadowRoot.querySelector('#person1-upload').addEventListener('change', (e) => this.formState.person1 = e.detail);
            this.shadowRoot.querySelector('#person2-upload').addEventListener('change', (e) => this.formState.person2 = e.detail);
            this.shadowRoot.querySelector('#blend-slider').addEventListener('input', (e) => this.updateBlendRatio(e.target.value));
            this.shadowRoot.querySelector('#blend-btn').addEventListener('click', this.handleBlend.bind(this));
            this.shadowRoot.querySelector('#toggle-advanced').addEventListener('click', this.toggleAdvancedSettings.bind(this));
            this.shadowRoot.querySelectorAll('.model-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.formState.model = e.currentTarget.dataset.model;
                    this.updateUI();
                });
            });
            this.shadowRoot.querySelector('#resolution').addEventListener('change', (e) => this.formState.resolution = e.target.value);
            this.shadowRoot.querySelector('#aspect-ratio').addEventListener('change', (e) => this.formState.aspectRatio = e.target.value);
            this.shadowRoot.querySelector('#quantity').addEventListener('change', (e) => this.formState.quantity = parseInt(e.target.value, 10));
        }
    }

    // --- Event Handlers ---
    handleBlend() {
        if (!this.formState.person1 || !this.formState.person2) {
            alert('Please upload both face images.');
            return;
        }
        this.dispatchEvent(new CustomEvent('blend', {
            detail: { ...this.formState },
            bubbles: true, composed: true
        }));
    }
    
    handleFaceSelect(faceId) {
        this.dispatchEvent(new CustomEvent('face-select', { 
            detail: { id: faceId },
            bubbles: true, composed: true
        }));
    }

    goToNextStep() {
        if (!this.selectedBlendedFace) {
            alert('Please select a blended face to continue.');
            return;
        }
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { step: 'POSE_CLOTHING' },
            bubbles: true, composed: true
        }));
    }

    // --- UI Updates ---
    updateBlendRatio(value) {
        this.formState.blendRatio = value;
        this.shadowRoot.querySelector('#slider-value').textContent = `${100 - this.formState.blendRatio}/${this.formState.blendRatio}`;
        this.shadowRoot.querySelector('#p1-ratio').textContent = `${100 - this.formState.blendRatio}% P1`;
        this.shadowRoot.querySelector('#p2-ratio').textContent = `${this.formState.blendRatio}% P2`;
    }

    toggleAdvancedSettings() {
        this.formState.advancedSettingsVisible = !this.formState.advancedSettingsVisible;
        this.updateUI();
    }
    
    updateUI() {
        // This method is now safe to call even if the elements aren't there
        this.shadowRoot.querySelectorAll('.model-btn').forEach(btn => {
            btn.classList.toggle('active', this.formState.model === btn.dataset.model);
        });

        const advancedContent = this.shadowRoot.querySelector('#advanced-settings-content');
        const advancedToggle = this.shadowRoot.querySelector('#toggle-advanced');
        if (advancedContent) {
            advancedContent.style.display = this.formState.advancedSettingsVisible ? 'grid' : 'none';
            advancedToggle.classList.toggle('active', this.formState.advancedSettingsVisible);
        }
    }

    // --- RENDER --- 
    render() {
        // Decide which view to show
        if (this.isGenerating || this.blendedFaces.length > 0) {
            this.shadowRoot.innerHTML = this.renderResults();
        } else {
            this.shadowRoot.innerHTML = this.renderForm();
        }
        this.updateUI(); // Ensure UI state is correct after rendering
    }

    renderForm() {
        // All the HTML for the initial form with image uploads and settings.
        // This is the same as the previous render method content.
        return `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
             <style>
                :host { display: block; }
                .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
                .space-y-8 > *:not(:last-child) { margin-bottom: 2rem; }
                .card { background-color: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                .slider-container { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
                .slider-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; }
                #slider-value { font-weight: 600; color: #1e293b; }
                input[type="range"] { flex-grow: 1; accent-color: #2563eb; cursor: pointer; }
                .settings-container { display: flex; flex-direction: column; gap: 1rem; }
                .main-controls { display: flex; justify-content: space-between; align-items: stretch; gap: 1rem; }
                .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
                .model-selector { display: flex; background-color: #f1f5f9; border-radius: 0.75rem; padding: 0.25rem; }
                .model-btn { flex: 1; padding: 0.5rem; border: none; background-color: transparent; border-radius: 0.6rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
                .model-btn.active { background-color: white; color: #2563eb; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); }
                .model-btn i { margin-right: 0.5rem; }
                #toggle-advanced { background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer; transition: color 0.2s; padding: 0.5rem; }
                #toggle-advanced.active, #toggle-advanced:hover { color: #2563eb; }
                #advanced-settings-content { display: none; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; margin-top: 1rem; }
                select { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem; background-color: #fff; }
                #blend-btn { background-color: #2563eb; color: white; font-weight: 700; padding: 0 2.5rem; border-radius: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); transition: background-color 0.2s; white-space: nowrap; }
                #blend-btn:hover { background-color: #1d4ed8; }
            </style>
            <div class="space-y-8">
                <div class="grid-cols-2">
                    <image-upload id="person1-upload" component-title="Person 1 (Face)" icon-class="fa-user" title="Upload Person 1"></image-upload>
                    <image-upload id="person2-upload" component-title="Person 2 (Face)" icon-class="fa-user" title="Upload Person 2"></image-upload>
                </div>
                <div class="card">
                    <div class="slider-labels"><span id="p1-ratio">50% P1</span><span>Face Mix Ratio</span><span id="p2-ratio">50% P2</span></div>
                    <div class="slider-container"><span><i class="fas fa-user"></i></span><input type="range" id="blend-slider" min="0" max="100" value="50"><span><i class="fas fa-user"></i></span></div>
                    <div class="text-center" id="slider-value">50/50</div>
                </div>
                <div class="card settings-container">
                    <div class="main-controls">
                        <div class="form-group" style="flex-grow: 1;"><label>Model</label><div class="model-selector"><button class="model-btn" data-model="flash"><i class="fas fa-bolt"></i>Flash</button><button class="model-btn" data-model="pro"><i class="fas fa-gem"></i>Pro</button></div></div>
                        <div class="form-group" style="align-self: flex-end;"><button id="toggle-advanced">Advanced <i class="fas fa-chevron-down"></i></button></div>
                        <button id="blend-btn"><i class="fas fa-wand-magic-sparkles"></i>Blend Faces</button>
                    </div>
                    <div id="advanced-settings-content">
                        <div class="form-group"><label for="resolution">Resolution</label><select id="resolution"><option value="1024x1024">1024 x 1024</option><option value="2048x2048">2048 x 2048</option><option value="4096x4096">4096 x 4096</option></select></div>
                        <div class="form-group"><label for="aspect-ratio">Aspect Ratio</label><select id="aspect-ratio"><option value="1:1">1:1 (Square)</option><option value="16:9">16:9 (Widescreen)</option><option value="9:16">9:16 (Vertical)</option><option value="4:3">4:3 (Standard)</option><option value="3:4">3:4 (Portrait)</option></select></div>
                        <div class="form-group"><label for="quantity">Quantity</label><select id="quantity"><option value="1">1 Image</option><option value="2">2 Images</option><option value="3">3 Images</option><option value="4">4 Images</option></select></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderResults() {
        const selectedId = this.selectedBlendedFace ? this.selectedBlendedFace.id : null;
        
        return `
            <style>
                .results-header { text-align: center; margin-bottom: 2rem; }
                .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
                .face-card { position: relative; border-radius: 1rem; overflow: hidden; cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: all 0.2s; border: 4px solid transparent; }
                .face-card.selected { border-color: #2563eb; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2); transform: translateY(-5px); }
                .face-card img { display: block; width: 100%; height: 100%; object-fit: cover; }
                .face-card .check-icon { position: absolute; top: 0.75rem; right: 0.75rem; width: 2rem; height: 2rem; background-color: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; opacity: 0; transform: scale(0.8); transition: all 0.2s; }
                .face-card.selected .check-icon { opacity: 1; transform: scale(1); }
                .loading-spinner, .loading-text { text-align: center; margin: 4rem 0; }
                .spinner { margin: 0 auto; width: 56px; height: 56px; border: 8px solid #f1f5f9; border-left-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .actions { text-align: center; margin-top: 2rem; }
                #next-step-btn { background-color: #16a34a; color: white; font-weight: 700; padding: 1rem 2.5rem; border-radius: 0.75rem; border: none; cursor: pointer; transition: background-color 0.2s; }
                #next-step-btn:disabled { background-color: #9ca3af; cursor: not-allowed; }
                #next-step-btn:not(:disabled):hover { background-color: #15803d; }
            </style>
            <div class="results-header">
                <h2 style="font-size: 1.875rem; font-weight: 800; color: #1e293b;">Select Your Base Face</h2>
                <p style="color: #64748b; margin-top: 0.5rem;">Choose the best blended face to use in the next step.</p>
            </div>

            ${this.isGenerating && this.blendedFaces.length === 0 ? `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p class="loading-text" style="margin-top: 1rem; font-weight: 600; color: #475569;">Generating blended faces...</p>
                </div>
            ` : `
                <div class="results-grid">
                    ${this.blendedFaces.map(face => `
                        <div class="face-card ${selectedId === face.id ? 'selected' : ''}" data-id="${face.id}">
                            <img src="${face.src}" alt="Blended Face ${face.id}">
                            <div class="check-icon"><i class="fas fa-check"></i></div>
                        </div>
                    `).join('')}
                </div>
                <div class="actions">
                     <button id="next-step-btn" ${!this.selectedBlendedFace ? 'disabled' : ''}>
                        Next Step <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `}
        `;
    }
}

export default StepOne;
