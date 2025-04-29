const GizmoLocalAI = (function() {
    let chatBox = null;
    let inputField = null;

    function _updateChat(message, isUser = false) {
        if (!chatBox) return;
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<b>${isUser ? 'You' : 'Gizmo'}:</b> ${message}`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
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
                    prompt: message
                })
            });

            const data = await response.json();
            _updateChat(data.response);
        } catch (error) {
            _updateChat('Error: Could not connect to Ollama. Make sure it is running on localhost:11434', false);
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
                    <input type="text" id="localAIInput" placeholder="Type your message...">
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