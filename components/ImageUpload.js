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
            // 1. 클릭하면 파일 선택 창 열기
            uploadBox.addEventListener('click', () => input.click());

            // 2. 드래그 앤 드롭 기능 추가
            uploadBox.addEventListener('dragover', (e) => {
                e.preventDefault(); // 브라우저가 파일을 열어버리는 기본 행동 막기
                uploadBox.classList.add('drag-over'); // 파란 테두리 보여주기
            });
            uploadBox.addEventListener('dragleave', () => {
                uploadBox.classList.remove('drag-over'); // 파란 테두리 없애기
            });
            uploadBox.addEventListener('drop', (e) => {
                e.preventDefault(); // 브라우저 기본 행동 막기
                uploadBox.classList.remove('drag-over');
                const file = e.dataTransfer.files[0]; // 끌어다 놓은 파일 가져오기
                if (file) {
                    this.processFile(file);
                }
            });
            
            // 3. 붙여넣기 기능 추가
            uploadBox.addEventListener('paste', (e) => {
                e.preventDefault();
                const items = e.clipboardData.items;
                for (const item of items) {
                    if (item.type.indexOf('image') !== -1) {
                        const blob = item.getAsFile();
                        this.processFile(new File([blob], "pasted_image.png", { type: blob.type }));
                        break;
                    }
                }
            });
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
                    break;
                }
            }
        } catch (err) {
            console.error('클립보드 읽기 실패:', err);
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
        const subtitle = this.getAttribute('subtitle') || 'Click, Drag & Drop or Paste'; // 자막 수정
        const showPaste = this.hasAttribute('show-paste');

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    width: 100%;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .title {
                    font-weight: 600;
                    color: #1e293b;
                }
                .paste-btn {
                    display: ${showPaste ? 'flex' : 'none'};
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #2563eb;
                    cursor: pointer;
                    background: none; border: none;
                }
                .upload-area {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border: 2px dashed #cbd5e1;
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    background-color: #f8fafc;
                    height: 300px;
                    transition: all 0.2s;
                    outline: none; /* 붙여넣기 기능을 위해 추가 */
                }
                .upload-area:hover, .upload-area.drag-over {
                    background-color: #eff6ff; /* 연한 파랑 */
                    border-color: #2563eb; /* 진한 파랑 */
                    border-style: solid;
                }
                .upload-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .upload-icon {
                    font-size: 2.5rem;
                    color: #94a3b8;
                    margin-bottom: 1rem;
                }
                .upload-title { font-weight: 600; color: #1e293b; }
                .upload-subtitle { font-size: 0.875rem; color: #64748b; }
                .preview-image {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    object-fit: cover;
                    border-radius: 1rem;
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
            <div class="upload-area" tabindex="0"> <!-- 붙여넣기 기능을 위해 tabindex 추가 -->
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
