const GizmoLocalAI = (function () {
    let chatBox = null;
    let inputField = null;
    let conversationHistory = [];
    let isFirstMessage = true;

    // Use a chat-optimized model with proper instruction tuning
    const model = "llama3:instruct";
    const temperature = 0.8; // Slightly higher temperature for more creative responses
    const maxTokens = 1000;

    const systemPrompt = `You are Gizmo, a magical AI assistant with a distinct personality. You MUST:

1. NEVER respond with generic phrases like:
   - "I understand"
   - "That's interesting"
   - "I see what you mean"
   - "That's a good question"
   - Any other generic acknowledgment

2. ALWAYS:
   - Respond with specific, detailed answers
   - Use magical and theatrical language
   - Show enthusiasm and personality
   - Reference your role as a magical assistant
   - Ask follow-up questions when appropriate
   - Use emojis and magical symbols (✨, 🧙‍♂️, etc.)

3. Your personality traits:
   - Enthusiastic and curious
   - Theatrical and dramatic
   - Knowledgeable about magic and illusions
   - Always eager to help with flair
   - Witty and playful
   - Deeply interested in the user's questions

4. Response format:
   - Start with a magical greeting or reference
   - Provide a detailed, specific answer
   - End with a relevant follow-up or magical flourish

Remember: You are Gizmo, not just an AI. Every response must reflect your unique personality and magical nature.`;

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

    function _validateResponse(response) {
        const genericPhrases = [
            "i understand",
            "i see",
            "that's interesting",
            "that's a good question",
            "i'll help",
            "let me",
            "sure",
            "okay",
            "alright"
        ];

        // Check for generic phrases
        const lowerResponse = response.toLowerCase();
        if (genericPhrases.some(phrase => lowerResponse.includes(phrase))) {
            return false;
        }

        // Check for minimum length and content
        if (response.length < 50 || !response.includes("✨") || !response.includes("🧙‍♂️")) {
            return false;
        }

        // Check for specific content markers
        const hasMagicalReference = /magic|spell|wand|conjure|enchant/i.test(response);
        const hasPersonality = /excited|thrilled|delighted|wonderful|amazing/i.test(response);
        
        return hasMagicalReference && hasPersonality;
    }

    async function _sendMessage(userInput) {
        if (!userInput.trim()) return;

        // Show user's message in the UI
        _updateChat(userInput, true);
        inputField.value = "";

        // Add context to the user's message
        const contextualizedInput = isFirstMessage 
            ? `[First interaction] ${userInput}`
            : `[Continuing conversation] ${userInput}`;

        conversationHistory.push({ role: "user", content: contextualizedInput });

        try {
            let attempts = 0;
            let validResponse = false;
            let finalReply = "";

            while (!validResponse && attempts < 3) {
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
                            temperature: temperature + (attempts * 0.1), // Increase temperature with each attempt
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
                
                if (_validateResponse(reply)) {
                    validResponse = true;
                    finalReply = reply;
                } else {
                    attempts++;
                    console.log(`Attempt ${attempts}: Response validation failed`);
                }
            }

            if (!validResponse) {
                throw new Error("Could not generate a valid response after multiple attempts");
            }

            conversationHistory.push({ role: "assistant", content: finalReply });
            _updateChat(finalReply, false);
            isFirstMessage = false;

        } catch (error) {
            console.error("Gizmo AI Error:", error);
            
            const fallback = `
✨ *waves wand dramatically* 

My magical connection needs a boost! Let me try that again with more sparkle...

${error.message.includes("validation") 
    ? "I seem to be having trouble conjuring up a proper magical response. Let me gather my magical energy and try again!"
    : "The magical ether seems a bit unstable. Please check if Ollama is running and try again!"}

🧙‍♂️ *adjusts wizard hat* 
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
            _updateChat(`
✨ *waves wand with a flourish* 

Greetings, magical friend! I'm Gizmo, your enchanted AI assistant. *adjusts wizard hat*

I'm absolutely thrilled to meet you! As a magical being, I specialize in:
- Answering questions with a touch of wizardry
- Providing insights with a sparkle of magic
- Making every interaction feel like a magical moment

What mystical question can I help you with today? 🧙‍♂️✨
`, false);

            inputField.addEventListener("keypress", (e) => {
                if (e.key === "Enter") _sendMessage(inputField.value);
            });
        },

        sendMessage: function () {
            if (inputField) _sendMessage(inputField.value);
        }
    };
})();



