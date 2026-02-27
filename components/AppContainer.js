
import GenerativeAi from '../utils/GenerativeAi.js';

class AppContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {
            step: 'API_KEY',
            isGenerating: false,
            apiKey: null,
            aiClient: null,
            blendSettings: {},
            blendedFaces: [],
            selectedBlendedFace: null,
            pose: null,
            clothing: null,
            finalResults: [],
            errorMessage: null,
        };
        this.render();
    }

    connectedCallback() {
        this.shadowRoot.addEventListener('api-key-submit', this.handleApiKeySubmit.bind(this));
        this.shadowRoot.addEventListener('blend', this.handleBlend.bind(this));
        this.shadowRoot.addEventListener('face-select', this.handleFaceSelect.bind(this));
        this.shadowRoot.addEventListener('generate-result', this.handleGenerate.bind(this));
        this.shadowRoot.addEventListener('navigate', (e) => this.handleNavigation(e));
    }

    handleNavigation(e) {
        const targetStep = e.detail.step;
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

    handleApiKeySubmit(e) {
        const { apiKey } = e.detail;
        if (!apiKey) return;
        try {
            const aiClient = new GenerativeAi(apiKey);
            this.setState({ apiKey, aiClient, step: 'FACE_BLEND' });
        } catch (error) {
            console.error(error);
            alert('Failed to initialize AI Client. Please check the API Key and try again.');
        }
    }

    async handleBlend(e) {
        this.setState({
            isGenerating: true,
            blendedFaces: [],
            selectedBlendedFace: null,
            blendSettings: e.detail,
            errorMessage: null,
        });

        const { person1, person2, quantity, blendRatio, model, aspectRatio } = this.state.blendSettings;

        const generatedFaces = [];
        for (let i = 0; i < quantity; i++) {
            const result = await this.state.aiClient.generateBlendedFace(
                person1, person2, blendRatio, aspectRatio, model
            );
            if (result.status === 'RATE_LIMIT') {
                this.setState({ errorMessage: `사용량 한도 초과. ${result.retryAfter}초 후 다시 시도해 주세요.`, isGenerating: false });
                return;
            }
            if (result.status === 'ERROR') {
                this.setState({ errorMessage: result.error, isGenerating: false });
                return;
            }
            generatedFaces.push({
                id: `blend_${Date.now()}_${i}`,
                src: result.data,
                sourceFiles: { person1, person2 }
            });
            this.setState({ blendedFaces: [...generatedFaces] });
        }
        this.setState({ isGenerating: false });
    }

    handleFaceSelect(e) {
        const faceId = e.detail.id;
        const selectedFace = this.state.blendedFaces.find(f => f.id === faceId);
        this.setState({ 
            selectedBlendedFace: selectedFace,
            step: 'POSE_CLOTHING' 
        });
    }

    async handleGenerate(e) {
        const { pose, clothing, model, aspectRatio, quantity } = e.detail;
        this.setState({ isGenerating: true, step: 'RESULT', errorMessage: null, finalResults: [] });
        const { sourceFiles } = this.state.selectedBlendedFace;

        const results = [];
        for (let i = 0; i < quantity; i++) {
            const result = await this.state.aiClient.generateFinalImage(
                sourceFiles.person1, pose, clothing, aspectRatio, model
            );
            if (result.status === 'RATE_LIMIT') {
                this.setState({ errorMessage: `사용량 한도 초과. ${result.retryAfter}초 후 다시 시도해 주세요.`, isGenerating: false, step: 'POSE_CLOTHING' });
                return;
            }
            if (result.status === 'ERROR') {
                this.setState({ errorMessage: result.error, isGenerating: false, step: 'POSE_CLOTHING' });
                return;
            }
            results.push(result.data);
            this.setState({ finalResults: [...results] });
        }
        this.setState({ pose, clothing, isGenerating: false });
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
                main { max-width: 64rem; margin: 2rem auto 0; padding: 0 1.5rem 5rem; }
                header { position: sticky; top: 0; z-index: 40; background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
            </style>
            ${this.state.step === 'API_KEY' ? '<api-key-prompt></api-key-prompt>' : this.renderApp()}
        `;
    }

    renderApp() {
        let currentStepHtml;
        switch (this.state.step) {
            case 'FACE_BLEND':
                currentStepHtml = `
                    <step-one 
                        blendedfaces='${JSON.stringify(this.state.blendedFaces)}' 
                        selectedblendedface='${JSON.stringify(this.state.selectedBlendedFace)}' 
                        isgenerating='${this.state.isGenerating}'>
                    </step-one>`;
                break;
            case 'POSE_CLOTHING':
                currentStepHtml = `<step-two selectedblendedface='${JSON.stringify(this.state.selectedBlendedFace)}'></step-two>`;
                break;
            case 'RESULT':
                currentStepHtml = `
                    <step-three
                        isgenerating='${this.state.isGenerating}'
                        generatedimages='${JSON.stringify(this.state.finalResults)}'>
                    </step-three>`;
                break;
            default:
                currentStepHtml = ``;
        }

        const errorBanner = this.state.errorMessage ? `
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 0.75rem 1.5rem; text-align: center; font-weight: 600; font-size: 0.875rem;">
                ⚠️ ${this.state.errorMessage}
            </div>
        ` : '';

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
            ${errorBanner}
            <main>${currentStepHtml}</main>
        `;
    }
}
export default AppContainer;
