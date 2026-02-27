class StepThree extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.modalSrc = null;
    }

    static get observedAttributes() {
        return ['isgenerating', 'generatedimages'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
            this.addEventListeners();
        }
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    addEventListeners() {
        this.shadowRoot.addEventListener('click', e => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const idx = parseInt(btn.dataset.idx ?? '0', 10);

            if (action === 'regenerate') this.navigate('POSE_CLOTHING');
            else if (action === 'start-over') this.navigate('FACE_BLEND');
            else if (action === 'download') this.downloadImage(idx);
            else if (action === 'enlarge') this.showModal(this.generatedImages[idx]);
            else if (action === 'close-modal') this.hideModal();
        });

        const overlay = this.shadowRoot.querySelector('#modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hideModal();
            });
        }
    }

    navigate(step) {
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { step },
            bubbles: true,
            composed: true
        }));
    }

    downloadImage(idx) {
        const src = this.generatedImages[idx];
        if (!src) return;
        const link = document.createElement('a');
        link.href = src;
        link.download = `face-blend-result-${Date.now()}-${idx + 1}.png`;
        link.click();
    }

    showModal(src) {
        this.modalSrc = src;
        this.render();
        this.addEventListeners();
    }

    hideModal() {
        this.modalSrc = null;
        this.render();
        this.addEventListeners();
    }

    get isGenerating() {
        return this.getAttribute('isgenerating') === 'true';
    }

    get generatedImages() {
        try {
            return JSON.parse(this.getAttribute('generatedimages')) || [];
        } catch {
            return [];
        }
    }

    render() {
        const images = this.generatedImages;
        const hasImages = images.length > 0;
        const isSingle = images.length === 1;

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :host { display: block; }
                .header { text-align: center; margin-bottom: 2rem; }
                .header h2 { font-size: 1.875rem; font-weight: 800; color: #1e293b; }

                .single-wrapper { max-width: 512px; margin: 0 auto; }
                .grid-wrapper { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

                .image-card { border-radius: 1rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); background: #f1f5f9; }
                .image-card img { display: block; width: 100%; height: 100%; object-fit: cover; }
                .image-card-actions { display: flex; gap: 0.5rem; padding: 0.75rem; background: white; justify-content: flex-end; }

                .loader-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 0; gap: 1.5rem; }
                .loader { width: 60px; height: 60px; border: 5px solid #e2e8f0; border-top: 5px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .btn { border: none; font-weight: 600; padding: 0.6rem 1.25rem; border-radius: 0.6rem; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.875rem; }
                .btn-primary { background-color: #2563eb; color: white; }
                .btn-green { background-color: #10b981; color: white; }
                .btn-gray { background-color: #e5e7eb; color: #374151; }
                .btn-icon { background-color: rgba(0,0,0,0.5); color: white; padding: 0.5rem 0.6rem; }
                .btn:hover { opacity: 0.85; }

                .bottom-actions { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 2rem; }

                #modal-overlay {
                    display: ${this.modalSrc ? 'flex' : 'none'};
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: rgba(0,0,0,0.85);
                    align-items: center; justify-content: center; z-index: 50;
                }
                #modal-content { position: relative; max-width: 90vw; max-height: 90vh; }
                #modal-content img { display: block; max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 0.5rem; }
                #modal-close-btn { position: absolute; top: -2.5rem; right: 0; color: white; font-size: 2rem; background: none; border: none; cursor: pointer; }
            </style>

            <div class="header">
                <h2>${this.isGenerating ? 'AI가 이미지를 생성하고 있어요...' : '생성 완료!'}</h2>
            </div>

            ${this.isGenerating && !hasImages ? `
                <div class="loader-box">
                    <div class="loader"></div>
                    <p style="color: #64748b; font-weight: 600;">최종 이미지를 생성하는 중...</p>
                </div>
            ` : hasImages ? `
                <div class="${isSingle ? 'single-wrapper' : 'grid-wrapper'}">
                    ${images.map((src, i) => `
                        <div class="image-card">
                            <img src="${src}" alt="Generated Image ${i + 1}">
                            <div class="image-card-actions">
                                <button class="btn btn-icon" data-action="enlarge" data-idx="${i}" title="확대"><i class="fas fa-search-plus"></i></button>
                                <button class="btn btn-green" data-action="download" data-idx="${i}"><i class="fas fa-download"></i> 저장</button>
                            </div>
                        </div>
                    `).join('')}
                    ${this.isGenerating ? `
                        <div class="image-card" style="display:flex; align-items:center; justify-content:center; min-height:200px;">
                            <div class="loader"></div>
                        </div>
                    ` : ''}
                </div>
                ${!this.isGenerating ? `
                    <div class="bottom-actions">
                        <button class="btn btn-primary" data-action="regenerate"><i class="fas fa-sync-alt"></i> 다시 생성</button>
                        <button class="btn btn-gray" data-action="start-over"><i class="fas fa-undo"></i> 처음부터</button>
                    </div>
                ` : ''}
            ` : ''}

            <div id="modal-overlay">
                <div id="modal-content">
                    <button id="modal-close-btn" data-action="close-modal" title="닫기">&times;</button>
                    ${this.modalSrc ? `<img src="${this.modalSrc}" alt="Enlarged image">` : ''}
                </div>
            </div>
        `;
    }
}
export default StepThree;
