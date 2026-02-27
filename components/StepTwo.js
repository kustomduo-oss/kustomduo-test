class StepTwo extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.pose = null;
        this.clothing = null;
        this.render();
    }

    connectedCallback() {
        const poseUpload = this.shadowRoot.querySelector('#pose-upload');
        const clothingUpload = this.shadowRoot.querySelector('#clothing-upload');
        const generateBtn = this.shadowRoot.querySelector('#generate-btn');
        const backBtn = this.shadowRoot.querySelector('#back-btn');

        poseUpload.addEventListener('change', (e) => this.pose = e.detail);
        clothingUpload.addEventListener('change', (e) => this.clothing = e.detail);
        
        generateBtn.addEventListener('click', this.handleGenerate.bind(this));
        backBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('navigate', { detail: { step: 'FACE_BLEND' }, bubbles: true, composed: true }));
        });
    }

    handleGenerate() {
        if (!this.pose || !this.clothing) {
            alert('Please upload both pose and clothing references.');
            return;
        }
        this.dispatchEvent(new CustomEvent('generate-result', {
            detail: {
                pose: this.pose,
                clothing: this.clothing
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
                .step-header { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; }
                .step-header span { background-color: #2563eb; color: white; border-radius: 9999px; padding: 0.25rem 0.6rem; font-size: 0.875rem; margin-right: 0.5rem; }
                .info-box { background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem; color: #374151; }
                .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
                .button-group { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; }
                .btn { border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
                #back-btn { background-color: #e5e7eb; color: #374151; }
                #generate-btn {
                    background-color: #2563eb;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                }
                #generate-btn.disabled { background-color: #9ca3af; cursor: not-allowed; }
                .generate-text p { margin: 0; font-size: 0.75rem; color: #6b7280; }

            </style>
            <h2 class="step-header"><span>1</span> Select Face Identity (Base)</h2>
            <div class="info-box">
                 No base images found. Please go back to Step 1 and generate a face.
            </div>

            <h2 class="step-header"><span>2</span> Upload Pose & Clothing References</h2>
            <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1rem;">The AI will combine the <b>Face</b> from Step 1, the <b>Pose</b> from image A, and the <b>Clothing</b> from image B.</p>

            <div class="grid-cols-2">
                <image-upload 
                    id="pose-upload" 
                    component-title="Pose Reference (Structure)" 
                    icon-class="fa-person-running" 
                    title="Upload Pose Photo"
                    subtitle="This photo determines the body pose, background, and camera angle."
                    show-paste>
                </image-upload>
                <image-upload 
                    id="clothing-upload" 
                    component-title="Clothing Reference (Attire)" 
                    icon-class="fa-shirt" 
                    title="Upload Clothing Photo"
                    subtitle="This photo determines the outfit the character will wear."
                    show-paste>
                </image-upload>
            </div>

            <div class="button-group">
                <button id="back-btn" class="btn">Back</button>
                <button id="generate-btn" class="btn">
                    Generate Result
                    <div class="generate-text">
                        <p>Please select a Face, and upload a Pose or Clothing image.</p>
                    </div>
                </button>
            </div>
        `;
    }
}

export default StepTwo;
