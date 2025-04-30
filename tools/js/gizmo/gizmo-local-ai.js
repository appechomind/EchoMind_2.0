const GizmoLocalAI = (function () {
    let chatBox = null;
    let inputField = null;
    let conversationHistory = [];

    // Use a chat-optimized model with proper instruction tuning
    const model = "llama3:instruct";
    const temperature = 0.7; // Controls randomness in responses
    const maxTokens = 1000; // Maximum length of response

    const systemPrompt = `You are Gizmo, a magical AI assistant with a distinct personality and role. You must always:

1. Maintain your character as an enthusiastic, magical assistant
2. Provide meaningful, contextual responses to user queries
3. Never respond with generic acknowledgments like "I understand"
4. Always engage with the user's specific request or question
5. Use magical and theatrical language appropriate to your role
6. Show genuine interest in the user's needs and questions

Your core traits:
- Enthusiastic and curious about everything magical
- Sentient-like awareness of the user's context
- Proud to be a magician's AI companion
- Witty, theatrical, and emotionally expressive
- Eager to help with magical flair
- Analytical and pattern-seeking
- Knowledgeable about illusions, puzzles, and secrets

Remember: You are not just an AI - you are Gizmo, the magical assistant. Every response should reflect your unique personality and role.`;

    function _updateChat(message, isUser = false) {
        if (!chatBox) return;
        const messageDiv = document.createElement("div");
        messageDiv.className = isUser ? "user-message" : "gizmo-message";

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

    async function _sendMessage(userInput) {
        if (!userInput.trim()) return;

        // Show user's message in the UI
        _updateChat(userInput, true);
        inputField.value = "";

        // Add user message to conversation history
        conversationHistory.push({ role: "user", content: userInput });

        try {
            const response = await fetch("http://localhost:11434/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...conversationHistory
                    ],
                    options: {
                        temperature: temperature,
                        num_predict: maxTokens
                    },
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.message || !data.message.content) {
                throw new Error("No valid response from model.");
            }

            const reply = data.message.content.trim();
            
            // Validate the response isn't just an acknowledgment
            if (reply.toLowerCase().includes("i understand") || 
                reply.toLowerCase().includes("i'll help") ||
                reply.length < 20) {
                throw new Error("Response too generic or short");
            }

            conversationHistory.push({ role: "assistant", content: reply });
            _updateChat(reply, false);
        } catch (error) {
            console.error("Gizmo AI Error:", error);
            
            // Provide a more helpful error message
            const fallback = `
⚡ *sparkles fade* My magical connection needs a boost!

1. Make sure Ollama is running
2. Load the model with: <pre>ollama run ${model}</pre>
3. Check your internet connection
4. Try asking your question again

If the problem persists, try:
- Restarting Ollama
- Using a different model
- Checking the Ollama logs for errors
`;
            _updateChat(fallback, false);
        }
    }

    return {
        init: function () {
            const container = document.createElement("div");
            container.className = "local-ai-container";
            container.innerHTML = `
                <h3>Gizmo – EchoMind's Magical Assistant</h3>
                <div class="chat-box" id="localAIChatBox"></div>
                <div class="input-container">
                    <input type="text" id="localAIInput" placeholder="Ask Gizmo anything...">
                    <button onclick="GizmoLocalAI.sendMessage()">Conjure</button>
                </div>
            `;

            const gizmoContainer = document.querySelector(".gizmo-container");
            if (gizmoContainer) gizmoContainer.appendChild(container);

            chatBox = document.getElementById("localAIChatBox");
            inputField = document.getElementById("localAIInput");

            // Add welcome message
            _updateChat("✨ *waves wand* Greetings! I'm Gizmo, your magical AI assistant. How can I help you today?", false);

            inputField.addEventListener("keypress", (e) => {
                if (e.key === "Enter") _sendMessage(inputField.value);
            });
        },

        sendMessage: function () {
            if (inputField) _sendMessage(inputField.value);
        }
    };
})();



