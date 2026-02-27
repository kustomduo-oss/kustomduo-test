import GenerativeAi from '../utils/GenerativeAi.js';

class AppContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {
            // App State
            step: 'API_KEY', // 'API_KEY', 'FACE_BLEND', 'POSE_CLOTHING', 'RESULT'
            // API & AI Client
            apiKey: null,
            aiClient: null,
            isGenerating: false,
            // User Inputs
            person1: null,
            person2: null,
            blendRatio: 50,
            blendedFace: null, // This will hold the result from step 1
            pose: null,
            clothing: null,
            finalResult: null, // This will hold the final generated image
        };
        this.render();
    }

    connectedCallback() {
        this.shadowRoot.addEventListener('click', this.handleClick.bind(this));
        this.shadowRoot.addEventListener('blend', this.handleBlend.bind(this));
        this.shadowRoot.addEventListener('generate-result', this.handleGenerate.bind(this));
        this.shadowRoot.addEventListener('navigate', (e) => this.setState({ step: e.detail.step }));
    }

    handleClick(e) {
        if (e.target.id === 'save-api-key-btn') {
            const apiKey = this.shadowRoot.querySelector('#api-key-input').value;
            this.handleApiKeySubmit(apiKey);
        }
    }

    handleApiKeySubmit(apiKey) {
        if (!apiKey) return;
        try {
            const aiClient = new GenerativeAi(apiKey);
            this.setState({ 
                apiKey: apiKey, 
                aiClient: aiClient, 
                step: 'FACE_BLEND'
            });
        } catch (error) {
            console.error(error);
            alert('Failed to initialize AI Client. Check your key.');
        }
    }

    async handleBlend(e) {
        const { person1, person2, blendRatio } = e.detail;
        console.log("Blending faces...", { person1, person2, blendRatio });
        
        // Here you would call the AI to blend faces
        // For now, we'll just pretend and move to the next step
        // and maybe use one of the images as a placeholder.
        this.setState({
            person1,
            person2,
            blendRatio,
            blendedFace: person1, // Placeholder for the blended face
            step: 'POSE_CLOTHING'
        });
    }

    async handleGenerate(e) {
        const { pose, clothing } = e.detail;
        console.log("Generating final result...", { blendedFace: this.state.blendedFace, pose, clothing });
        this.setState({ isGenerating: true, step: 'RESULT' });

        // Mock AI call
        setTimeout(() => {
             this.setState({
                pose,
                clothing,
                finalResult: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800', // Placeholder image
                isGenerating: false
            });
        }, 2000);
    }

    setState(newState) {
        Object.assign(this.state, newState);
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :host { display: block; }
                .min-h-screen { min-height: 100vh; }
                .bg-slate-50 { background-color: #f8fafc; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                header { position: sticky; top: 0; z-index: 40; background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
                .max-w-5xl { max-width: 64rem; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
                .h-16 { height: 4rem; }
                .justify-between { justify-content: space-between; }
                .gap-2 { gap: 0.5rem; }
                .cursor-pointer { cursor: pointer; }
                 .w-8 { width: 2rem; }
                .h-8 { height: 2rem; }
                .bg-gradient-to-tr { background-image: linear-gradient(to top right, var(--tw-gradient-stops)); }
                .from-blue-600 { --tw-gradient-from: #2563eb; --tw-gradient-to: rgb(37 99 235 / 0); }
                .to-indigo-600 { --tw-gradient-to: #4f46e5; }
                .rounded-lg { border-radius: 0.5rem; }
                .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                .font-bold { font-weight: 700; }
                .text-slate-800 { color: #1e293b; }
                .tracking-tight { letter-spacing: -0.025em; }
                .text-xl { font-size: 1.25rem; }
                main { max-width: 64rem; margin: 2rem auto 0; padding: 0 1.5rem 5rem; }
            </style>
            ${this.state.step === 'API_KEY' ? this.renderApiKeyPrompt() : this.renderApp()}
        `;
    }

    renderApiKeyPrompt() {
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
        return `
            <div>
                <header>
                    <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div class="flex items-center gap-2 cursor-pointer">
                            <div class="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                <i class="fas fa-users-viewfinder text-sm"></i>
                            </div>
                            <span class="font-bold text-slate-800 tracking-tight text-xl">Face Blender AI</span>
                        </div>
                    </div>
                </header>
                <main>
                    ${ this.state.step === 'FACE_BLEND' ? '<step-one></step-one>' : '' }
                    ${ this.state.step === 'POSE_CLOTHING' ? '<step-two></step-two>' : '' }
                    ${ this.state.step === 'RESULT' ? `
                        <step-three 
                            .isGenerating=${this.state.isGenerating} 
                            .generatedImage='${this.state.finalResult}'>
                        </step-three>` : ''
                    }
                </main>
            </div>
        `;
    }
}

export default AppContainer;
