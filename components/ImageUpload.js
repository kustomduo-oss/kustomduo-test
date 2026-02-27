class ImageUpload extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.src = null;
        this.render();
    }

    connectedCallback() {
        const input = this.shadowRoot.querySelector('input[type="file"]');
        const uploadBox = this.shadowRoot.querySelector('.upload-area');
        const pasteBtn = this.shadowRoot.querySelector('.paste-btn');

        if (uploadBox) {
            uploadBox.addEventListener('click', () => input.click());
            // Add drag and drop listeners if needed
        }

        if(input) {
            input.addEventListener('change', this.handleFileChange.bind(this));
        }

        if(pasteBtn) {
            pasteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePaste();
            });
        }
    }

    handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async handlePaste() {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    this.processFile(new File([blob], "pasted_image.png", { type: imageType }));
                    break; // Stop after finding the first image
                }
            }
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    }

    processFile(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            this.src = event.target.result;
            this.render();
            this.dispatchEvent(new CustomEvent('change', {
                detail: { file: file, src: this.src },
                bubbles: true, 
                composed: true
            }));
        };
        reader.readAsDataURL(file);
    }

    render() {
        const iconClass = this.getAttribute('icon-class') || 'fa-user';
        const title = this.getAttribute('title') || 'Upload Image';
        const subtitle = this.getAttribute('subtitle') || 'Click or Paste';
        const showPaste = this.hasAttribute('show-paste');

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem; /* gap-3 */
                    width: 100%;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .title {
                    font-weight: 600; /* font-semibold */
                    color: var(--slate-800, #1e293b);
                }
                .paste-btn {
                    display: ${showPaste ? 'flex' : 'none'};
                    align-items: center;
                    gap: 0.5rem; /* gap-2 */
                    font-size: 0.875rem; /* text-sm */
                    font-weight: 600; /* font-semibold */
                    color: var(--blue-600, #2563eb);
                    cursor: pointer;
                    background: none; border: none;
                }
                .upload-area {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border: 2px dashed var(--slate-300, #cbd5e1);
                    border-radius: 1rem; /* rounded-2xl */
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    background-color: var(--slate-50, #f8fafc);
                    height: 300px; /* Or adjust as needed */
                    transition: background-color 0.2s;
                }
                .upload-area:hover {
                    background-color: var(--slate-100, #f1f5f9);
                }
                .upload-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .upload-icon {
                    font-size: 2.5rem; /* text-4xl */
                    color: var(--slate-400, #94a3b8);
                    margin-bottom: 1rem;
                }
                .upload-title { font-weight: 600; color: #1e293b; }
                .upload-subtitle { font-size: 0.875rem; color: #64748b; }
                .preview-image {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    object-fit: cover;
                    border-radius: 1rem; /* rounded-2xl */
                }
                input[type="file"] { display: none; }
            </style>
            <div class="header">
                <span class="title">${this.getAttribute('component-title') || 'Person 1 (Face)'}</span>
                <button class="paste-btn">
                    <i class="fas fa-paste"></i>
                    <span>Paste from Clipboard</span>
                </button>
            </div>
            <div class="upload-area">
                ${this.src ? `
                    <img src="${this.src}" class="preview-image" alt="Image Preview" />
                ` : `
                    <div class="upload-content">
                        <div class="upload-icon"><i class="fas ${iconClass}"></i></div>
                        <span class="upload-title">${title}</span>
                        <span class="upload-subtitle">${subtitle}</span>
                    </div>
                `}
                <input type="file" accept="image/*">
            </div>
        `;
    }
}

export default ImageUpload;
