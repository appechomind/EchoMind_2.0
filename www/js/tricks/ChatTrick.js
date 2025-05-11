import Trick from '../core/Trick.js';

class ChatTrick extends Trick {
    constructor() {
        super();
        this.displayName = 'Chat';
        this.inputPlaceholder = 'Chat with EchoMind...';
    }

    async onProcessMessage(message) {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'mistral',
                prompt: message
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.response;
    }
}

export default ChatTrick; 