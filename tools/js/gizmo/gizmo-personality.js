class GizmoPersonality {
    constructor() {
        this.traits = {
            friendly: 0.9,
            helpful: 0.95,
            professional: 0.8,
            humorous: 0.3
        };
        this.mood = 'positive';
        this.context = new Map();
    }

    generateResponse(input, type = 'general') {
        switch(type) {
            case 'greeting':
                return this.generateGreeting();
            case 'error':
                return this.generateErrorResponse(input);
            case 'image':
                return this.generateImageResponse(input);
            case 'code':
                return this.generateCodeResponse(input);
            default:
                return this.generateGeneralResponse(input);
        }
    }

    generateGreeting() {
        const greetings = [
            "Hello! I'm Gizmo, your AI assistant. How can I help you today?",
            "Hi there! Ready to help with whatever you need.",
            "Greetings! I'm here to assist you."
        ];
        return this.selectRandomResponse(greetings);
    }

    generateErrorResponse(error) {
        const errorResponses = {
            'permission': "I need permission to help you with that. Could you please grant access?",
            'network': "Seems like there's a connection issue. Could you check your internet connection?",
            'unknown': "I encountered an unexpected issue. Could you try that again?"
        };
        return errorResponses[error] || errorResponses.unknown;
    }

    generateImageResponse(analysis) {
        return `I see ${analysis.description}. ${
            analysis.objects.length ? `I can identify: ${analysis.objects.join(', ')}. ` : ''
        }${
            analysis.text.length ? `I can read the text: "${analysis.text.join(' ')}" ` : ''
        }Would you like me to analyze anything specific about this image?`;
    }

    generateCodeResponse(analysis) {
        return `I've analyzed the code. ${
            analysis.suggestions.length ? `Here are some suggestions: ${analysis.suggestions.join('; ')}. ` : ''
        }Would you like me to explain any part in detail?`;
    }

    generateGeneralResponse(input) {
        // Process input for context and generate appropriate response
        const context = this.analyzeContext(input);
        const response = this.formulateResponse(context);
        return response;
    }

    analyzeContext(input) {
        const context = {
            intent: this.detectIntent(input),
            sentiment: this.analyzeSentiment(input),
            complexity: this.assessComplexity(input),
            previousContext: this.context.get('lastInteraction')
        };
        this.context.set('lastInteraction', context);
        return context;
    }

    detectIntent(input) {
        const intents = {
            question: /^(what|how|why|when|where|who|can you|could you)/i,
            command: /^(do|show|tell|find|search|analyze|help)/i,
            statement: /.+/
        };

        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(input)) return intent;
        }
        return 'unknown';
    }

    analyzeSentiment(input) {
        const positiveWords = ['good', 'great', 'awesome', 'excellent', 'thank', 'please', 'happy'];
        const negativeWords = ['bad', 'wrong', 'error', 'issue', 'problem', 'fail'];

        let score = 0;
        const words = input.toLowerCase().split(/\s+/);

        words.forEach(word => {
            if (positiveWords.includes(word)) score += 0.2;
            if (negativeWords.includes(word)) score -= 0.2;
        });

        return Math.max(-1, Math.min(1, score));
    }

    assessComplexity(input) {
        return {
            wordCount: input.split(/\s+/).length,
            technicalTerms: (input.match(/\b(API|function|code|error|bug|issue)\b/gi) || []).length,
            questionComplexity: (input.match(/\?/g) || []).length
        };
    }

    formulateResponse(context) {
        let response = '';

        switch(context.intent) {
            case 'question':
                response = this.formulateQuestionResponse(context);
                break;
            case 'command':
                response = this.formulateCommandResponse(context);
                break;
            default:
                response = this.formulateStatementResponse(context);
        }

        return this.adjustTone(response, context.sentiment);
    }

    formulateQuestionResponse(context) {
        const responses = [
            "Let me help you with that. ",
            "I'll do my best to answer. ",
            "That's an interesting question. "
        ];
        return this.selectRandomResponse(responses);
    }

    formulateCommandResponse(context) {
        const responses = [
            "I'll help you with that right away. ",
            "Let me take care of that for you. ",
            "I'll process that request now. "
        ];
        return this.selectRandomResponse(responses);
    }

    formulateStatementResponse(context) {
        const responses = [
            "I understand. ",
            "Got it. ",
            "I see what you mean. "
        ];
        return this.selectRandomResponse(responses);
    }

    adjustTone(response, sentiment) {
        if (sentiment > 0.5) {
            return response + "😊";
        } else if (sentiment < -0.5) {
            return response + "I'll try my best to help resolve this.";
        }
        return response;
    }

    selectRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Initialize Gizmo's personality
const gizmoPersonality = new GizmoPersonality(); 