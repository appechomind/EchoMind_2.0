export class GoogleSearchBox {
    constructor(options = {}) {
        this.options = {
            onSearch: options.onSearch || (() => {}),
            onVoiceSearch: options.onVoiceSearch || (() => {}),
            placeholder: options.placeholder || 'Search Google or type a URL',
            showVoiceButton: options.showVoiceButton !== false
        };
        
        this.elements = {
            searchInput: null,
            voiceSearchBtn: null
        };
    }

    render() {
        return `
            <div class="search-container">
                <div class="search-box">
                    <svg class="search-icon" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="#9aa0a6" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <input type="text" class="search-input" placeholder="${this.options.placeholder}">
                    ${this.options.showVoiceButton ? `
                        <button class="voice-search-btn">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="#4285f4" d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                                <path fill="#34a853" d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    initialize(container) {
        this.elements.searchInput = container.querySelector('.search-input');
        this.elements.voiceSearchBtn = container.querySelector('.voice-search-btn');

        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.options.onSearch(this.elements.searchInput.value);
                }
            });
        }

        if (this.elements.voiceSearchBtn) {
            this.elements.voiceSearchBtn.addEventListener('click', () => {
                this.options.onVoiceSearch();
            });
        }
    }

    updateVoiceButton(isListening) {
        if (!this.elements.voiceSearchBtn) return;

        const voiceBtn = this.elements.voiceSearchBtn;
        if (isListening) {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#ea4335" d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                    <path fill="#ea4335" d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
            `;
        } else {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285f4" d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                    <path fill="#34a853" d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
            `;
        }
    }

    setValue(value) {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = value;
        }
    }

    cleanup() {
        if (this.elements.searchInput) {
            this.elements.searchInput.removeEventListener('keypress');
        }
        if (this.elements.voiceSearchBtn) {
            this.elements.voiceSearchBtn.removeEventListener('click');
        }
        this.elements = {
            searchInput: null,
            voiceSearchBtn: null
        };
    }
} 