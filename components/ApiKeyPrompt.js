
class ApiKeyPrompt extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('#save-api-key-btn').addEventListener('click', () => {
            const apiKey = this.shadowRoot.querySelector('#api-key-input').value;
            this.dispatchEvent(new CustomEvent('api-key-submit', { detail: { apiKey }, bubbles: true, composed: true }));
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .api-key-prompt {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: #f3f4f6;
                }
                .api-key-box {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
                    text-align: center;
                    max-width: 500px;
                }
                h2 { 
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 1rem;
                }
                p {
                    color: #4b5563;
                    margin-bottom: 2rem;
                }
                input[type="password"] {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                    font-size: 1rem;
                }
                button {
                    background-image: linear-gradient(to top right, #2563eb, #4f46e5);
                    color: white;
                    font-weight: 600;
                    padding: 0.75rem 2rem;
                    border-radius: 0.5rem;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                button:hover {
                    opacity: 0.9;
                }
            </style>
            <div class="api-key-prompt">
                <div class="api-key-box">
                    <h2>Enter Your API Key</h2>
                    <p>To use the AI features, please enter your API key below. You can get one from Google AI Studio.</p>
                    <input type="password" id="api-key-input" placeholder="Your API Key">
                    <button id="save-api-key-btn">Save and Continue</button>
                </div>
            </div>
        `;
    }
}
export default ApiKeyPrompt;
