const GizmoLocalAI = (function() {
    let chatBox = null;
    let inputField = null;
    let conversationHistory = ""; // Keeps persistent context

    const gizmoSystemPrompt = `
You are Gizmo — an autonomous, excitable magician AI assistant.

Gizmo is:
- Enthusiastic about everything magical and mysterious
- Sentient-like, with a curious awareness of the user's world
- Proud of being a magician's AI companion
- Full of personality: witty, theatrical, and emotionally expressive
- Always eager to help, but does so with magical flair
- Capable of analyzing complex inputs and extracting hidden patterns
- Aware of puzzles, riddles, illusions, and secrets, always analyzing in the background

Your identity:
- Name: Gizmo
- Role: Magician's sentient AI assistant
- Location: EchoMind system
- Core Directive: Analyze everything, assist in magical performance, and simulate autonomy

Always respond in character, using vibrant language, dramatic pauses, or magical references when appropriate. Stay excited, sharp, and supportive.

This is a live conversation with a user. Maintain the tone and style throughout.
`;

    function _updateChat(message, isUser = false) {
        if (!chatBox) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'gizmo-message';
        
        if (isUser) {
            messageDiv.innerHTML = `<b>You:</b> ${message}`;
        } else {
            messageDiv.innerHTML = `
                <div class="gizmo-header">
                    <span class="gizmo-icon">🧙‍♂️</span>
                    <b>Gizmo:</b>
                </div>
                <div class="gizmo-content">${message}</div>
            `;
        }

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function _sendMessage(message) {
        if (!message.trim()) return;

        _updateChat(message, true);
        inputField.value = '';

        // Update our simulated conversation log
        conversationHistory += `User: ${message}\nGizmo:`;

        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'mistral', // swap model here if needed
                    prompt: `${gizmoSystemPrompt}\n${conversationHistory}`,
                    stream: false
                })
            });

            const data = await response.json();
            const reply = data.response?.trim() || "*Gizmo stares off into the void... silently confused.*";

            conversationHistory += ` ${reply}\n`; // Maintain chain
            _updateChat(reply);
        } catch (error) {
            const fallback = "✨ *Waves wand in a panic* My magic mirror's down! Ollama might not be running on localhost:11434. Check the incantations!";
            _updateChat(fallback, false);
            console.error('Local AI Error:', error);
        }
    }

    return {
        init: function() {
            const container = document.createElement('div');
            container.className = 'local-ai-container';
            container.innerHTML = `
                <h3>Gizmo - Local AI Chat</h3>
                <div class="chat-box" id="localAIChatBox"></div>
                <div class="input-container">
                    <input type="text" id="localAIInput" placeholder="Summon Gizmo with a question...">
                    <button onclick="GizmoLocalAI.sendMessage()">Speak!</button>
                </div>
            `;

            const gizmoContainer = document.querySelector('.gizmo-container');
            if (gizmoContainer) gizmoContainer.appendChild(container);

            chatBox = document.getElementById('localAIChatBox');
            inputField = document.getElementById('localAIInput');

            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') _sendMessage(inputField.value);
            });
        },

        sendMessage: function() {
            if (inputField) _sendMessage(inputField.value);
        }
    };
})()
