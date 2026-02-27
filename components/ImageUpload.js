class ImageUpload extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.src = null;
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.openFileDialog = this.openFileDialog.bind(this);
    }

    connectedCallback() {
        this.src = this.getAttribute('preview-src') || null;
        this.render();
        this.attachListeners();
    }

    attachListeners() {
        const input = this.shadowRoot.querySelector('input[type="file"]');
        const uploadBox = this.shadowRoot.querySelector('.upload-area');
        const pasteBtn = this.shadowRoot.querySelector('.paste-btn');
        
        if (uploadBox) {
            uploadBox.addEventListener('click', this.openFileDialog);
            uploadBox.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadBox.classList.add('drag-over');
            });
            uploadBox.addEventListener('dragleave', () => {
                uploadBox.classList.remove('drag-over');
            });
            uploadBox.addEventListener('drop', this.handleDrop);
            uploadBox.addEventListener('paste', (e) => {
                e.preventDefault();
                const items = e.clipboardData.items;
                for (const item of items) {
                    if (item.type.includes('image')) {
                        const blob = item.getAsFile();
                        this.processFile(new File([blob], "pasted_image.png", { type: blob.type }));
                        break;
                    }
                }
            });
        }

        if(input) input.addEventListener('change', this.handleFileChange);
        if(pasteBtn) pasteBtn.addEventListener('click', this.handlePaste);
    }

    openFileDialog(e) {
        // If a preview is shown, clicking it should still open the dialog
        // but we prevent infinite loops by checking the target.
        if (e.target.tagName !== 'INPUT') {
            this.shadowRoot.querySelector('input[type="file"]').click();
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.shadowRoot.querySelector('.upload-area').classList.remove('drag-over');
        if (e.dataTransfer.files[0]) {
            this.processFile(e.dataTransfer.files[0]);
        }
    }

    handleFileChange(e) {
        if (e.target.files[0]) {
            this.processFile(e.target.files[0]);
        }
    }

    async handlePaste(e) {
        e.stopPropagation();
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    this.processFile(new File([blob], "pasted_image.png", { type: imageType }));
                    break; 
                }
            }
        } catch (err) {
            console.error('Clipboard read failed:', err);
            alert('Failed to paste image. Your browser might not support this feature or requires permissions.');
        }
    }

    processFile(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            this.src = event.target.result;
            this.dispatchEvent(new CustomEvent('change', {
                detail: this.src,
                bubbles: true,
                composed: true
            }));
            this.render(); // Re-render the component with the new preview
            this.attachListeners(); // Re-attach listeners after render
        };
        reader.onerror = () => {
             console.error("Failed to read file.");
             alert("Error: Could not read the selected file.");
        }
        reader.readAsDataURL(file);
    }

    render() {
        const iconClass = this.getAttribute('icon-class') || 'fa-image';
        const title = this.getAttribute('component-title') || 'Upload Image';

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :host { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; }
                .header { display: flex; justify-content: space-between; align-items: center; }
                .title { font-weight: 600; color: #1e293b; }
                .paste-btn { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #2563eb; cursor: pointer; background: none; border: none; padding: 0.25rem; }
                .upload-area { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #cbd5e1; border-radius: 1rem; text-align: center; cursor: pointer; background-color: #f8fafc; height: 300px; transition: all 0.2s; outline: none; overflow: hidden; }
                .upload-area:hover, .upload-area.drag-over { background-color: #eff6ff; border-color: #2563eb; border-style: solid; }
                .upload-content { padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .upload-icon { font-size: 2.5rem; color: #94a3b8; margin-bottom: 1rem; }
                .upload-title { font-weight: 600; color: #1e293b; }
                .upload-subtitle { font-size: 0.875rem; color: #64748b; }
                .preview-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
                input[type="file"] { display: none; }
            </style>
            <div class="header">
                <span class="title"><i class="fas ${iconClass}" style="margin-right: 0.5rem; color: #4f46e5;"></i>${title}</span>
                <button class="paste-btn">
                    <i class="fas fa-paste"></i>
                    <span>Paste</span>
                </button>
            </div>
            <div class="upload-area" tabindex="0">
                ${this.src ? `
                    <img src="${this.src}" alt="Image Preview" class="preview-image">
                ` : `
                    <div class="upload-content">
                        <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                        <span class="upload-title">Click, Drag & Drop or Paste</span>
                        <span class="upload-subtitle">Your Image Here</span>
                    </div>
                `}
                <input type="file" accept="image/*">
            </div>
        `;
    }
}
export default ImageUpload;
