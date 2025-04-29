class App {
    constructor() {
        this.tricks = new Map();
        this.currentTrick = null;
        this.setupBaseUI();
        this.loadTricks();
    }

    setupBaseUI() {
        this.chatBox = document.getElementById('chat-box');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.trickSelector = document.getElementById('trick-selector');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleMessage();
        });
        this.trickSelector.addEventListener('change', (e) => {
            this.switchTrick(e.target.value);
        });
    }

    async loadTricks() {
        // Load tricks dynamically
        const trickModules = await import('./tricks/index.js');
        for (const [name, module] of Object.entries(trickModules)) {
            this.registerTrick(name, module);
        }
    }

    registerTrick(name, module) {
        this.tricks.set(name, module);
        const option = document.createElement('option');
        option.value = name;
        option.textContent = module.displayName || name;
        this.trickSelector.appendChild(option);
    }

    switchTrick(trickName) {
        if (this.currentTrick) {
            this.currentTrick.deactivate();
        }
        
        const trick = this.tricks.get(trickName);
        if (trick) {
            this.currentTrick = trick;
            trick.activate();
            this.updateUIForTrick(trick);
        }
    }

    updateUIForTrick(trick) {
        // Update UI elements based on trick requirements
        this.userInput.placeholder = trick.inputPlaceholder || 'Type your message...';
        this.chatBox.innerHTML = '';
    }

    async handleMessage() {
        if (!this.currentTrick) return;
        
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.userInput.value = '';
        this.userInput.disabled = true;
        this.sendButton.disabled = true;

        try {
            const response = await this.currentTrick.processMessage(message);
            this.addMessage('ai', response);
        } catch (error) {
            this.addMessage('error', 'Sorry, there was an error processing your request.');
            console.error('Error:', error);
        } finally {
            this.userInput.disabled = false;
            this.sendButton.disabled = false;
            this.userInput.focus();
        }
    }

    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `<b>${type === 'user' ? 'You' : 'EchoMind'}:</b> ${content}`;
        this.chatBox.appendChild(messageDiv);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }
}

export default App; 