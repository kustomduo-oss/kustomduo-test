import GenerativeAi from '../utils/GenerativeAi.js';

class AppContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {
            // App State & UI
            step: 'API_KEY', // API_KEY, FACE_BLEND, POSE_CLOTHING, RESULT
            isGenerating: false, // For any AI generation
            // API & AI Client
            apiKey: null,
            aiClient: null,
            // Face Blend (Step 1) State
            blendSettings: {},
            blendedFaces: [], // Array to hold multiple generated face images
            selectedBlendedFace: null, // The face chosen by the user to proceed
            // Pose & Clothing (Step 2) State
            pose: null,
            clothing: null,
            // Result (Step 3) State
            finalResult: null, 
        };
        this.render();
    }

    connectedCallback() {
        this.shadowRoot.addEventListener('click', this.handleClick.bind(this));
        this.shadowRoot.addEventListener('blend', this.handleBlend.bind(this));
        this.shadowRoot.addEventListener('face-select', this.handleFaceSelect.bind(this)); // New event
        this.shadowRoot.addEventListener('generate-result', this.handleGenerate.bind(this));
        this.shadowRoot.addEventListener('navigate', (e) => this.handleNavigation(e));
    }

    // --- Event Handlers ---
    handleClick(e) {
        if (e.target.id === 'save-api-key-btn') {
            const apiKey = this.shadowRoot.querySelector('#api-key-input').value;
            this.handleApiKeySubmit(apiKey);
        }
    }

    handleNavigation(e) {
        const targetStep = e.detail.step;
        // Reset state when going back
        if (targetStep === 'FACE_BLEND') {
            this.setState({
                step: 'FACE_BLEND',
                blendedFaces: [],
                selectedBlendedFace: null,
                pose: null,
                clothing: null,
                finalResult: null,
            });
        } else {
            this.setState({ step: targetStep });
        }
    }

    handleApiKeySubmit(apiKey) {
        if (!apiKey) return;
        try {
            const aiClient = new GenerativeAi(apiKey);
            this.setState({ apiKey, aiClient, step: 'FACE_BLEND' });
        } catch (error) {
            console.error(error); alert('Failed to initialize AI Client.');
        }
    }
    
    async handleBlend(e) {
        this.setState({
            isGenerating: true,
            blendedFaces: [], // Clear previous results
            selectedBlendedFace: null,
            blendSettings: e.detail, // Save the settings from StepOne
        });

        // --- Mock AI Call to generate multiple faces ---
        console.log("Blending faces with settings:", this.state.blendSettings);
        // Simulate a delay for each image generation
        const generatedFaces = [];
        const quantity = this.state.blendSettings.quantity || 1;
        for (let i = 0; i < quantity; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay per image
            const randomId = Math.floor(Math.random() * 1000);
            generatedFaces.push({ 
                id: `blend_${i}`,
                src: `https://picsum.photos/512/512?random=${randomId}` // Unique placeholder
            });
             this.setState({ blendedFaces: [...generatedFaces] }); // Update UI progressively
        }

        this.setState({ isGenerating: false });
    }

    handleFaceSelect(e) {
        const faceId = e.detail.id;
        const selectedFace = this.state.blendedFaces.find(f => f.id === faceId);
        this.setState({ selectedBlendedFace: selectedFace });
        console.log("Face selected:", selectedFace);
    }

    async handleGenerate(e) {
        this.setState({ isGenerating: true, step: 'RESULT' });
        const { pose, clothing } = e.detail;

        console.log("Generating final result with:", { 
            face: this.state.selectedBlendedFace,
            pose: pose,
            clothing: clothing
        });

        // --- Mock AI call ---
        setTimeout(() => {
            this.setState({
                pose, clothing,
                finalResult: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800', 
                isGenerating: false
            });
        }, 2000);
    }
    
    // --- State & Rendering ---
    setState(newState) {
        Object.assign(this.state, newState);
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :host { display: block; }
                main { max-width: 64rem; margin: 2rem auto 0; padding: 0 1.5rem 5rem; }
                header { position: sticky; top: 0; z-index: 40; background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
                /* Add other common styles from previous render methods */
            </style>
            ${this.state.step === 'API_KEY' ? this.renderApiKeyPrompt() : this.renderApp()}
        `;
    }

    renderApiKeyPrompt() {
        // The HTML for the API Key prompt (same as before)
        return `
             <style>
                .min-h-screen { min-height: 100vh; }
                .bg-slate-50 { background-color: #f8fafc; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .p-6 { padding: 1.5rem; }
                .max-w-md { max-width: 28rem; }
                .w-full { width: 100%; }
                .bg-white { background-color: #fff; }
                .rounded-3xl { border-radius: 1.5rem; }
                .shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
                .p-10 { padding: 2.5rem; }
                .text-center { text-align: center; }
                .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .w-20 { width: 5rem; }
                .h-20 { height: 5rem; }
                .bg-blue-50 { background-color: #eff6ff; }
                .text-blue-600 { color: #2563eb; }
                .rounded-2xl { border-radius: 1rem; }
                .text-3xl { font-size: 1.875rem; }
                .text-2xl { font-size: 1.5rem; }
                .font-bold { font-weight: 700; }
                .text-slate-800 { color: #1e293b; }
                .text-slate-500 { color: #64748b; }
                .text-sm { font-size: 0.875rem; }
                #api-key-input { width: 100%; border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem;}
                #save-api-key-btn { width: 100%; padding: 1rem 0; background-color: #2563eb; color: white; border-radius: 0.75rem; font-weight: 700; }
            </style>
            <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                 <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center space-y-6">
                    <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                        <i class="fas fa-key text-3xl"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-slate-800">API Key Required</h1>
                    <input type="password" id="api-key-input" placeholder="Enter your API Key" />
                    <button id="save-api-key-btn">Start Generating</button>
                </div>
            </div>
        `;
    }

    renderApp() {
        let currentStepHtml;
        switch (this.state.step) {
            case 'FACE_BLEND':
                // Pass generated faces and selection state to step-one
                currentStepHtml = `
                    <step-one 
                        .blendedFaces='${JSON.stringify(this.state.blendedFaces)}' 
                        .selectedBlendedFace='${JSON.stringify(this.state.selectedBlendedFace)}' 
                        .isGenerating=${this.state.isGenerating}>
                    </step-one>`;
                break;
            case 'POSE_CLOTHING':
                currentStepHtml = `<step-two .baseImage='${JSON.stringify(this.state.selectedBlendedFace)}'></step-two>`;
                break;
            case 'RESULT':
                currentStepHtml = `
                    <step-three 
                        .isGenerating=${this.state.isGenerating} 
                        .generatedImage='${this.state.finalResult}'>
                    </step-three>`;
                break;
            default:
                currentStepHtml = ``;
        }

        return `
             <header>
                <div style="max-width: 64rem; margin: 0 auto; padding: 0 1.5rem; height: 4rem; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" onclick="this.getRootNode().host.dispatchEvent(new CustomEvent('navigate', { detail: { step: 'FACE_BLEND' }, bubbles: true, composed: true }))">
                        <div style="width: 2rem; height: 2rem; background-image: linear-gradient(to top right, #2563eb, #4f46e5); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                            <i class="fas fa-users-viewfinder text-sm"></i>
                        </div>
                        <span style="font-weight: 700; color: #1e293b; letter-spacing: -0.025em; font-size: 1.25rem;">Face Blender AI</span>
                    </div>
                </div>
            </header>
            <main>${currentStepHtml}</main>
        `;
    }
}

export default AppContainer;
