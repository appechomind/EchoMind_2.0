import { UIUtils, ErrorHandler, AnimationUtils } from './utils.js';

class Trick {
    constructor() {
        this.displayName = 'Base Trick';
        this.inputPlaceholder = 'Type your message...';
        this.isActive = false;
        this.elements = {
            chatBox: document.getElementById('chat-box'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-button')
        };
    }

    activate() {
        this.isActive = true;
        this.updateUIForActivation();
        this.onActivate();
    }

    deactivate() {
        this.isActive = false;
        this.updateUIForDeactivation();
        this.onDeactivate();
    }

    updateUIForActivation() {
        UIUtils.updateInputPlaceholder(this.elements.userInput, this.inputPlaceholder);
        UIUtils.toggleElementDisabled(this.elements.userInput, false);
        UIUtils.toggleElementDisabled(this.elements.sendButton, false);
    }

    updateUIForDeactivation() {
        UIUtils.updateInputPlaceholder(this.elements.userInput, 'Select a trick to begin...');
        UIUtils.toggleElementDisabled(this.elements.userInput, true);
        UIUtils.toggleElementDisabled(this.elements.sendButton, true);
    }

    async processMessage(message) {
        if (!this.isActive) {
            throw new Error('Trick is not active');
        }
        return this.onProcessMessage(message);
    }

    addMessage(type, content) {
        if (!this.elements.chatBox) return;
        
        const messageElement = UIUtils.createMessageElement(type, content);
        this.elements.chatBox.appendChild(messageElement);
        UIUtils.scrollToBottom(this.elements.chatBox);
    }

    // Methods to be overridden by specific tricks
    onActivate() {
        // Override this to perform setup when trick is activated
    }

    onDeactivate() {
        // Override this to perform cleanup when trick is deactivated
    }

    async onProcessMessage(message) {
        // Override this to implement the trick's message processing logic
        throw new Error('onProcessMessage must be implemented by the trick');
    }
}

export default Trick; 