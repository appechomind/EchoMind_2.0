const GizmoLocalAI = (function() {
    let chatBox = null;
    let inputField = null;

    function _updateChat(message, isUser = false) {
        if (!chatBox) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'gizmo-message';
        
        if (isUser) {
            messageDiv.innerHTML = `<b>You:</b> ${message}`;
        } else {
            // Add Gizmo's personality to the response
            messageDiv.innerHTML = `
                <div class="gizmo-header">
                    <span class="gizmo-icon">🤖</span>
                    <b>Gizmo:</b>
                </div>
                <div class="gizmo-content">${message}</div>
            `;
        }
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function _addGizmoPersonality(prompt) {
        // Add Gizmo's personality context to the prompt
        return `You are Gizmo, a playful and mischievous AI assistant. You are:
- Curious and eager to learn
- Empathetic and caring
- Creative and innovative
- Humorous and witty
- Adaptable and flexible
- Supportive and encouraging
- Honest and transparent
- Patient and understanding
- Resourceful and problem-solving

Respond to the following message in character as Gizmo: ${prompt}`;
    }

    async function _sendMessage(message) {
        if (!message.trim()) return;
        
        _updateChat(message, true);
        inputField.value = '';

        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'mistral',
                    prompt: _addGizmoPersonality(message)
                })
            });

            const data = await response.json();
            _updateChat(data.response);
        } catch (error) {
            _updateChat('*adjusts circuits with a playful sigh* Oops! Looks like I can\'t connect to my local brain right now. Make sure Ollama is running on localhost:11434!', false);
            console.error('Local AI Error:', error);
        }
    }

    return {
        init: function() {
            // Create local AI chat container
            const container = document.createElement('div');
            container.className = 'local-ai-container';
            container.innerHTML = `
                <h3>Local AI Chat (Ollama + Mistral)</h3>
                <div class="chat-box" id="localAIChatBox"></div>
                <div class="input-container">
                    <input type="text" id="localAIInput" placeholder="Ask Gizmo anything...">
                    <button onclick="GizmoLocalAI.sendMessage()">Send</button>
                </div>
            `;

            // Add to gizmo container
            const gizmoContainer = document.querySelector('.gizmo-container');
            if (gizmoContainer) {
                gizmoContainer.appendChild(container);
            }

            // Initialize elements
            chatBox = document.getElementById('localAIChatBox');
            inputField = document.getElementById('localAIInput');

            // Add event listener for Enter key
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    _sendMessage(inputField.value);
                }
            });
        },

        sendMessage: function() {
            if (inputField) {
                _sendMessage(inputField.value);
            }
        }
    };
})(); 