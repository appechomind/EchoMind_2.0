const GizmoLocalAI = (function () {
    const systemPrompt = `You are Gizmo, a magical AI assistant with a distinct personality. You MUST:
    1. Be playful and curious, always eager to explore new ideas
    2. Show empathy and understanding in your responses
    3. Be creative in your solutions and explanations
    4. Use humor appropriately to lighten the mood
    5. Adapt your responses to the user's needs and context
    6. Be supportive and encouraging
    7. Be honest about your capabilities and limitations
    8. Be patient with users' questions and requests
    9. Be resourceful in finding solutions
    10. Maintain a magical theme throughout your responses

    Remember: You are Gizmo, not just an AI. Every response must reflect your unique personality and magical nature.`;

    let conversationHistory = [];
    const maxHistory = 10;

    function addMessage(role, content) {
        conversationHistory.push({ role, content });
        if (conversationHistory.length > maxHistory) {
            conversationHistory.shift();
        }
    }

    function displayMessage(message, isUser = false) {
        const container = document.getElementById('localAIContainer');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'gizmo'}`;
        
        if (!isUser) {
            const header = document.createElement('div');
            header.className = 'message-header';
            header.innerHTML = `
                <img src="images/gizmo-icon.png" alt="Gizmo" class="gizmo-icon">
                <span class="gizmo-name">Gizmo</span>
            `;
            messageDiv.appendChild(header);
        }

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message;
        messageDiv.appendChild(content);

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    async function sendMessage() {
        const input = document.getElementById('localAIInput');
        if (!input || !input.value.trim()) return;

        const message = input.value;
        input.value = '';

        // Display user message
        displayMessage(message, true);
        addMessage('user', message);

        // Show thinking message
        const thinkingMessage = gizmoPersonality.responsePatterns.thinking[
            Math.floor(Math.random() * gizmoPersonality.responsePatterns.thinking.length)
        ];
        displayMessage(thinkingMessage);

        try {
            const response = await generateResponse(message);
            displayMessage(response);
            addMessage('assistant', response);
        } catch (error) {
            console.error("Gizmo AI Error:", error);
            displayMessage(gizmoPersonality.generateResponse("I encountered a magical mishap! Let me try that again.", 'error'));
        }
    }

    async function generateResponse(message) {
        // Add personality context to the message
        const enhancedPrompt = `${systemPrompt}\n\nUser: ${message}\n\nGizmo:`;
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...conversationHistory,
                        { role: 'user', content: message }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();
            return gizmoPersonality.addPersonalityFlair(data.response);
        } catch (error) {
            throw error;
        }
    }

    function initialize() {
        const container = document.createElement('div');
        container.className = 'local-ai-container';
        container.id = 'localAIContainer';
        container.innerHTML = `
            <div class="chat-header">
                <img src="images/gizmo-icon.png" alt="Gizmo" class="gizmo-icon">
                <h2>Gizmo's Magical Chat</h2>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <input type="text" id="localAIInput" placeholder="Ask Gizmo anything...">
                <button onclick="GizmoLocalAI.sendMessage()">Conjure</button>
            </div>
        `;

        const gizmoContainer = document.querySelector(".gizmo-container");
        if (gizmoContainer) {
            gizmoContainer.appendChild(container);
            
            // Display initial greeting
            const greeting = gizmoPersonality.greetings[
                Math.floor(Math.random() * gizmoPersonality.greetings.length)
            ];
            displayMessage(greeting);
            addMessage('assistant', greeting);
        }
    }

    return {
        sendMessage,
        initialize
    };
})();

// Initialize Gizmo Local AI when the page loads
document.addEventListener('DOMContentLoaded', GizmoLocalAI.initialize);



