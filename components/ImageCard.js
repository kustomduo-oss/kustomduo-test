class ImageCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['src', 'title', 'selected'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        const src = this.getAttribute('src');
        const title = this.getAttribute('title');
        const selected = this.hasAttribute('selected');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: relative;
                    cursor: pointer;
                }
                .card {
                    border-radius: 0.75rem; /* rounded-xl */
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); /* shadow-md */
                    transition: transform 0.2s ease-in-out;
                }
                .card:hover {
                    transform: translateY(-4px);
                }
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .title {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    padding: 0.5rem;
                    font-size: 0.875rem;
                    text-align: center;
                }
                .selection-indicator {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    width: 1.5rem;
                    height: 1.5rem;
                    border-radius: 9999px; /* rounded-full */
                    background-color: var(--blue-600, #2563eb);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    border: 2px solid white;
                    opacity: 0;
                    transform: scale(0.8);
                    transition: all 0.2s;
                }
                :host([selected]) .selection-indicator {
                    opacity: 1;
                    transform: scale(1);
                }
                :host([selected]) .card {
                    outline: 2px solid var(--blue-600, #2563eb);
                }
            </style>
            <div class="card">
                <img src="${src}" alt="${title}" onerror="this.src='https://placehold.co/400x400?text=Image+Not+Found'">
                ${title ? `<div class="title">${title}</div>` : ''}
                <div class="selection-indicator"><i class="fas fa-check"></i></div>
            </div>
        `;
    }
}

export default ImageCard;
