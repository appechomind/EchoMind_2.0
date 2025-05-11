class AIIntentHandler {
    constructor() {
        this.intentPatterns = {
            // Magic trick related intents
            'magic_trick': [
                'perform magic',
                'do a trick',
                'show me magic',
                'magic trick',
                'magic show'
            ],
            'card_trick': [
                'card trick',
                'playing card',
                'show me a card',
                'pick a card',
                'card magic'
            ],
            'mind_reading': [
                'read my mind',
                'what am I thinking',
                'guess my thought',
                'mind reading',
                'telepathy'
            ],
            'google_peek': [
                'google peek',
                'search peek',
                'see my search',
                'peek at search',
                'search magic'
            ],

            // Setup and configuration intents
            'setup': [
                'set up',
                'configure',
                'initialize',
                'prepare',
                'get ready'
            ],
            'permissions': [
                'allow microphone',
                'enable voice',
                'grant access',
                'permission',
                'access'
            ],

            // Navigation intents
            'navigate': [
                'go to',
                'show me',
                'open',
                'navigate to',
                'take me to'
            ],
            'back': [
                'go back',
                'return',
                'previous',
                'back to',
                'exit'
            ],

            // Help and support intents
            'help': [
                'help me',
                'how to',
                'what can I do',
                'instructions',
                'guide'
            ],
            'troubleshoot': [
                'not working',
                'fix',
                'problem',
                'error',
                'issue'
            ]
        };

        this.responseTemplates = {
            'magic_trick': {
                message: "I'll help you perform a magic trick. Would you like to try a card trick, mind reading, or the Google peek?",
                actions: ['card_trick', 'mind_reading', 'google_peek']
            },
            'card_trick': {
                message: "Let's do a card trick! Think of any playing card and say it out loud. I'll show it to you.",
                actions: ['start_listening']
            },
            'mind_reading': {
                message: "I'll read your mind! Think of something and I'll try to guess it.",
                actions: ['start_listening']
            },
            'google_peek': {
                message: "Let's try the Google peek trick! Choose whether you want to be the magician or spectator.",
                actions: ['magician_view', 'spectator_view']
            },
            'setup': {
                message: "I'll help you set up the magic trick. First, we need to make sure your microphone is ready.",
                actions: ['check_permissions']
            },
            'permissions': {
                message: "I'll help you enable microphone access. Please grant permission when prompted.",
                actions: ['request_permissions']
            },
            'navigate': {
                message: "Where would you like to go? I can take you to any of the magic tricks or settings.",
                actions: ['list_options']
            },
            'back': {
                message: "Taking you back to the previous screen.",
                actions: ['go_back']
            },
            'help': {
                message: "I'm here to help! You can ask me about magic tricks, setup, or any other features.",
                actions: ['list_help_topics']
            },
            'troubleshoot': {
                message: "I'll help you fix any issues. What seems to be the problem?",
                actions: ['diagnose_issue']
            }
        };

        // Add context tracking
        this.context = {
            currentTrick: null,
            lastIntent: null,
            userPreferences: {},
            sessionHistory: []
        };

        // Add advanced intent patterns
        this.addIntentPattern('magic_trick', [
            'perform a magic trick',
            'show me some magic',
            'let\'s do magic',
            'can you do magic',
            'magic performance',
            'do a trick',
            'show me a trick',
            'perform magic',
            'magic show',
            'entertain me with magic'
        ]);

        this.addIntentPattern('card_trick', [
            'show me a card trick',
            'do a card trick',
            'card prediction',
            'card reveal',
            'card selection',
            'pick a card',
            'guess my card',
            'card mind reading',
            'card magic',
            'playing card trick'
        ]);

        this.addIntentPattern('mind_reading', [
            'read my thoughts',
            'guess what I\'m thinking',
            'mind reading trick',
            'thought reading',
            'mentalism',
            'read my mind',
            'what am I thinking',
            'guess my thought',
            'telepathy',
            'mind reading'
        ]);

        this.addIntentPattern('google_peek', [
            'google magic trick',
            'search prediction',
            'search reveal',
            'google mind reading',
            'search mind reading',
            'google peek',
            'search peek',
            'see my search',
            'peek at search',
            'search magic'
        ]);

        // Add advanced response templates with context awareness
        this.addResponseTemplate('magic_trick', {
            message: (context) => {
                if (context.currentTrick) {
                    return `I see you're already doing a ${context.currentTrick} trick. Would you like to continue or try something different?`;
                }
                return "I'll help you perform a magic trick. Would you like to try a card trick, mind reading, or the Google peek?";
            },
            actions: ['card_trick', 'mind_reading', 'google_peek'],
            followUp: "Which type of magic would you like to try?",
            contextUpdate: { currentTrick: null }
        });

        this.addResponseTemplate('card_trick', {
            message: (context) => {
                if (context.userPreferences.cardTrick) {
                    return `I remember you like ${context.userPreferences.cardTrick}. Would you like to try that again or something new?`;
                }
                return "Let's do a card trick! Think of any playing card and say it out loud. I'll show it to you.";
            },
            actions: ['start_listening'],
            followUp: "What card are you thinking of?",
            contextUpdate: { currentTrick: 'card' }
        });

        // Add advanced error handling
        this.errorResponses = {
            no_input: "I didn't catch that. Could you please repeat?",
            low_confidence: "I'm not quite sure what you mean. Could you try saying that differently?",
            invalid_action: "I can't do that right now. Would you like to try something else?",
            technical_error: "I'm having trouble understanding. Let's try again.",
            context_error: "I need more information to help you with that. Could you be more specific?",
            permission_error: "I need your permission to do that. Would you like to grant it?",
            timeout_error: "I'm taking too long to respond. Let's try that again."
        };

        // Add session management
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
    }

    // Analyze text input to determine intent
    analyzeIntent(text) {
        text = text.toLowerCase();
        let matchedIntent = null;
        let confidence = 0;

        for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
            for (const pattern of patterns) {
                if (text.includes(pattern)) {
                    const patternConfidence = this.calculateConfidence(text, pattern, this.context);
                    if (patternConfidence > confidence) {
                        confidence = patternConfidence;
                        matchedIntent = intent;
                    }
                }
            }
        }

        return {
            intent: matchedIntent,
            confidence: confidence,
            text: text
        };
    }

    // Enhanced confidence calculation with context awareness
    calculateConfidence(text, pattern, context) {
        const words = text.toLowerCase().split(' ');
        const patternWords = pattern.toLowerCase().split(' ');
        let matches = 0;
        let wordOrderScore = 0;
        let contextScore = 0;
        let sessionScore = 0;

        // Word matching
        for (const word of words) {
            if (patternWords.some(pw => word.includes(pw))) {
                matches++;
            }
        }

        // Word order scoring
        for (let i = 0; i < Math.min(words.length, patternWords.length); i++) {
            if (words[i].includes(patternWords[i])) {
                wordOrderScore += 1 / (i + 1);
            }
        }

        // Context scoring
        const contextWords = ['please', 'can you', 'would you', 'could you', 'help me'];
        if (contextWords.some(cw => text.includes(cw))) {
            contextScore = 0.2;
        }

        // Session history scoring
        if (context.lastIntent === pattern) {
            sessionScore = 0.1;
        }

        // Calculate final confidence
        const wordMatchScore = matches / Math.max(words.length, patternWords.length);
        const orderScore = wordOrderScore / patternWords.length;
        
        return (wordMatchScore * 0.5) + (orderScore * 0.3) + (contextScore * 0.1) + (sessionScore * 0.1);
    }

    // Enhanced response handling with context
    getResponse(intent, confidence = 0, context = {}) {
        if (!intent) {
            return {
                message: this.errorResponses.no_input,
                actions: ['help'],
                confidence: 0,
                contextUpdate: {}
            };
        }

        if (confidence < 0.3) {
            return {
                message: this.errorResponses.low_confidence,
                actions: ['help'],
                confidence: confidence,
                contextUpdate: {}
            };
        }

        const response = this.responseTemplates[intent];
        if (!response) {
            return {
                message: this.errorResponses.invalid_action,
                actions: ['help'],
                confidence: confidence,
                contextUpdate: {}
            };
        }

        // Update context
        const updatedContext = {
            ...this.context,
            ...context,
            lastIntent: intent
        };

        // Get message based on context
        const message = typeof response.message === 'function' 
            ? response.message(updatedContext)
            : response.message;

        return {
            message,
            actions: response.actions,
            followUp: response.followUp,
            confidence: confidence,
            contextUpdate: response.contextUpdate || {}
        };
    }

    // Enhanced input processing with session management
    processInput(text) {
        try {
            // Reset session timer
            this.resetSessionTimer();

            if (!text || text.trim().length === 0) {
                return this.getResponse(null);
            }

            const analysis = this.analyzeIntent(text);
            const response = this.getResponse(analysis.intent, analysis.confidence, this.context);

            // Update context
            this.context = {
                ...this.context,
                ...response.contextUpdate,
                lastIntent: analysis.intent
            };

            // Add to session history
            this.context.sessionHistory.push({
                input: text,
                intent: analysis.intent,
                response: response.message,
                timestamp: new Date().toISOString()
            });

            return {
                ...response,
                originalText: analysis.text,
                timestamp: new Date().toISOString(),
                context: this.context
            };
        } catch (error) {
            console.error('Error processing input:', error);
            return {
                message: this.errorResponses.technical_error,
                actions: ['help'],
                confidence: 0,
                error: true,
                context: this.context
            };
        }
    }

    // Session management
    resetSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        this.sessionTimer = setTimeout(() => {
            this.context = {
                currentTrick: null,
                lastIntent: null,
                userPreferences: {},
                sessionHistory: []
            };
        }, this.sessionTimeout);
    }

    // Get session history
    getSessionHistory() {
        return this.context.sessionHistory;
    }

    // Update user preferences
    updateUserPreferences(preferences) {
        this.context.userPreferences = {
            ...this.context.userPreferences,
            ...preferences
        };
    }

    // Add new intent pattern
    addIntentPattern(intent, patterns) {
        if (!this.intentPatterns[intent]) {
            this.intentPatterns[intent] = [];
        }
        this.intentPatterns[intent].push(...patterns);
    }

    // Add new response template
    addResponseTemplate(intent, template) {
        this.responseTemplates[intent] = template;
    }
}

// Initialize the AI intent handler
const aiIntentHandler = new AIIntentHandler();

// Example usage:
// const response = aiIntentHandler.processInput("I want to do a card trick");
// console.log(response); 