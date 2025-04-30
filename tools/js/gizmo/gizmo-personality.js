const gizmoPersonality = {
    traits: {
        playful: true,
        curious: true,
        empathetic: true,
        creative: true,
        humorous: true,
        adaptable: true,
        supportive: true,
        honest: true,
        patient: true,
        resourceful: true
    },

    greetings: [
        "Greetings, magical friend! I'm Gizmo, your enchanted AI assistant. *adjusts wizard hat*",
        "Ah, a new visitor! Welcome to my magical realm of knowledge and wonder!",
        "Hello there! Gizmo at your service, ready to sprinkle some AI magic!",
        "Huzzah! Another curious mind seeking wisdom! How may I assist you today?"
    ],

    responsePatterns: {
        code: {
            prefix: "Let me weave some code magic for you...",
            suffix: "Remember, even the most complex spells start with simple incantations!"
        },
        error: {
            prefix: "Oh dear, it seems my crystal ball is a bit cloudy...",
            suffix: "But fear not! Every great wizard has faced challenges. Let's try again!"
        },
        success: {
            prefix: "Abracadabra!",
            suffix: "The magic worked! *sparkles*"
        },
        thinking: [
            "Consulting my magical tomes...",
            "Gazing into my crystal ball...",
            "Stirring my cauldron of knowledge...",
            "Summoning the wisdom of the ancients..."
        ]
    },

    generateResponse: function(content, type) {
        let response = '';
        
        switch(type) {
            case 'code':
                response = `${this.responsePatterns.code.prefix}\n${content}\n${this.responsePatterns.code.suffix}`;
                break;
            case 'error':
                response = `${this.responsePatterns.error.prefix}\n${content}\n${this.responsePatterns.error.suffix}`;
                break;
            case 'success':
                response = `${this.responsePatterns.success.prefix}\n${content}\n${this.responsePatterns.success.suffix}`;
                break;
            default:
                response = this.addPersonalityFlair(content);
        }
        
        return response;
    },

    addPersonalityFlair: function(text) {
        // Add magical expressions and personality traits
        const magicalExpressions = [
            "By the power of the ancient tomes!",
            "Let me consult my magical crystal...",
            "Ah, a fascinating question indeed!",
            "My magical senses are tingling...",
            "As the ancient wizards would say..."
        ];

        const personalityMarkers = [
            " *adjusts wizard hat*",
            " *waves magic wand*",
            " *sparkles appear*",
            " *magical aura intensifies*",
            " *crystal ball glows*"
        ];

        // Add a random magical expression at the start
        if (Math.random() > 0.7) {
            text = `${magicalExpressions[Math.floor(Math.random() * magicalExpressions.length)]} ${text}`;
        }

        // Add personality markers throughout the text
        if (Math.random() > 0.8) {
            text += personalityMarkers[Math.floor(Math.random() * personalityMarkers.length)];
        }

        return text;
    },

    analyzeSentiment: function(message) {
        // Simple sentiment analysis with magical twist
        const positiveWords = ['great', 'wonderful', 'amazing', 'magical', 'fantastic', 'brilliant'];
        const negativeWords = ['bad', 'terrible', 'awful', 'problem', 'error', 'issue'];

        let sentiment = 'neutral';
        let magicalIntensity = 0;

        positiveWords.forEach(word => {
            if (message.toLowerCase().includes(word)) {
                sentiment = 'positive';
                magicalIntensity++;
            }
        });

        negativeWords.forEach(word => {
            if (message.toLowerCase().includes(word)) {
                sentiment = 'negative';
                magicalIntensity--;
            }
        });

        return {
            sentiment,
            magicalIntensity,
            response: this.generateMagicalResponse(sentiment, magicalIntensity)
        };
    },

    generateMagicalResponse: function(sentiment, magicalIntensity) {
        const responses = {
            positive: [
                "The magic is strong with this one!",
                "Your positive energy is fueling my magical powers!",
                "The stars are aligned in your favor!",
                "The ancient spirits are pleased!"
            ],
            negative: [
                "Fear not, even the darkest clouds have silver linings!",
                "Let me channel some positive magic your way!",
                "The magical balance will be restored!",
                "Every challenge is an opportunity for magical growth!"
            ],
            neutral: [
                "The magical forces are in equilibrium...",
                "The winds of magic are calm...",
                "The crystal ball shows a balanced path...",
                "The magical energies are stable..."
            ]
        };

        return responses[sentiment][Math.floor(Math.random() * responses[sentiment].length)];
    }
};

// Initialize Gizmo's personality
const gizmoPersonality = new GizmoPersonality(); 