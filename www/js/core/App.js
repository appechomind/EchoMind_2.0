import { VoiceCommandTrick } from '../tricks/dual-device/VoiceCommandTrick.js';

class App {
    constructor() {
        this.tricks = new Map();
        this.currentTrick = null;
        this.voiceEnabled = false;
        this.setupBaseUI();
        this.loadTricks();
        this.initializeVoice();
    }

    setupBaseUI() {
        this.chatBox = document.getElementById('chat-box');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.trickSelector = document.getElementById('trick-selector');
        this.voiceToggle = document.getElementById('voice-toggle');
        this.voiceStatus = document.getElementById('voice-status');
        this.connectionStatus = document.getElementById('connection-status');
        
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
        this.voiceToggle.addEventListener('click', () => this.toggleVoice());
    }

    async loadTricks() {
        try {
            // Load tricks dynamically
            const trickModules = await import('./tricks/index.js');
            for (const [name, module] of Object.entries(trickModules)) {
                this.registerTrick(name, module);
            }
            
            // Add VoiceCommandTrick by default
            this.registerTrick('voice', VoiceCommandTrick);
        } catch (error) {
            this.addMessage('error', 'Failed to load tricks: ' + error.message);
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
        
        const TrickClass = this.tricks.get(trickName);
        if (TrickClass) {
            this.currentTrick = new TrickClass(this);
            this.currentTrick.activate();
            this.updateUIForTrick(this.currentTrick);
        }
    }

    updateUIForTrick(trick) {
        this.userInput.placeholder = trick.inputPlaceholder || 'Type your message...';
        this.userInput.disabled = false;
    }

    async handleMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.userInput.value = '';

        if (this.currentTrick) {
            try {
                await this.currentTrick.processMessage(message);
            } catch (error) {
                this.addMessage('error', 'Error processing message: ' + error.message);
            }
        }
    }

    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = content;
        this.chatBox.appendChild(messageDiv);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    initializeVoice() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.voiceStatus.innerHTML = '<i class="fas fa-microphone-slash"></i> Voice Available';
        } else {
            this.voiceStatus.innerHTML = '<i class="fas fa-microphone-slash"></i> Voice Not Supported';
            this.voiceToggle.disabled = true;
        }
    }

    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        this.voiceToggle.classList.toggle('active', this.voiceEnabled);
        
        if (this.voiceEnabled) {
            this.voiceStatus.innerHTML = '<i class="fas fa-microphone"></i> Voice Active';
            this.switchTrick('voice');
        } else {
            this.voiceStatus.innerHTML = '<i class="fas fa-microphone-slash"></i> Voice Disabled';
            if (this.currentTrick instanceof VoiceCommandTrick) {
                this.trickSelector.value = '';
                this.switchTrick('');
            }
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App; 