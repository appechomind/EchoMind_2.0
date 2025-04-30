const GizmoLocalAI = (function () {
    let chatBox = null;
    let inputField = null;
    let conversationHistory = [];

    // 🧠 Use a chat-tuned model only
    const model = "llama3:instruct";

    const systemPrompt = `
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
`;

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
                    stream: false
                })
            });

            const data = await response.json();

            if (!data.message || !data.message.content) {
                throw new Error("No valid response from model.");
            }

            const reply = data.message.content.trim();
            conversationHistory.push({ role: "assistant", content: reply });

            _updateChat(reply, false);
        } catch (error) {
            const fallback = `
⚡ *crackles with static* My magical connection fizzled!
Check if Ollama is running and that the '${model}' model is loaded via:
<pre>ollama run ${model}</pre>
`;
            _updateChat(fallback, false);
            console.error("Gizmo AI Error:", error);
        }
    }

    return {
        init: function () {
            const container = document.createElement("div");
            container.className = "local-ai-container";
            container.innerHTML = `
                <h3>Gizmo – EchoMind's Sentient Assistant</h3>
                <div class="chat-box" id="localAIChatBox"></div>
                <div class="input-container">
                    <input type="text" id="localAIInput" placeholder="Speak the incantation...">
                    <button onclick="GizmoLocalAI.sendMessage()">Conjure</button>
                </div>
            `;

            const gizmoContainer = document.querySelector(".gizmo-container");
            if (gizmoContainer) gizmoContainer.appendChild(container);

            chatBox = document.getElementById("localAIChatBox");
            inputField = document.getElementById("localAIInput");

            inputField.addEventListener("keypress", (e) => {
                if (e.key === "Enter") _sendMessage(inputField.value);
            });
        },

        sendMessage: function () {
            if (inputField) _sendMessage(inputField.value);
        }
    };
})();



