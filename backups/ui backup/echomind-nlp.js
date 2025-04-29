/**
 * EchoMind NLP Module
 * Advanced Natural Language Processing capabilities
 */
class EchoMindNLP {
    constructor(config = {}) {
        this.config = {
            language: 'en',
            useTransformers: true,
            useSentiment: true,
            useEntityRecognition: true,
            usePOSTagging: true,
            ...config
        };
        
        this.models = {
            tokenizer: null,
            sentiment: null,
            ner: null,
            pos: null
        };
        
        this.initialized = false;
    }

    async init() {
        try {
            // Initialize transformer models
            if (this.config.useTransformers) {
                await this._initializeTransformers();
            }

            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize NLP:', error);
            return false;
        }
    }

    async process(input, context = {}) {
        if (!this.initialized) {
            throw new Error('NLP module not initialized');
        }

        const result = {
            original: input,
            tokens: [],
            entities: [],
            sentiment: null,
            intent: null,
            pos: [],
            parsed: null
        };

        try {
            // Tokenization
            result.tokens = await this._tokenize(input);

            // Part of Speech Tagging
            if (this.config.usePOSTagging) {
                result.pos = await this._posTag(result.tokens);
            }

            // Named Entity Recognition
            if (this.config.useEntityRecognition) {
                result.entities = await this._extractEntities(input);
            }

            // Sentiment Analysis
            if (this.config.useSentiment) {
                result.sentiment = await this._analyzeSentiment(input);
            }

            // Intent Classification
            result.intent = await this._classifyIntent(input, context);

            // Parse dependencies and structure
            result.parsed = await this._parseStructure(result.tokens, result.pos);

            return result;
        } catch (error) {
            console.error('Error processing text:', error);
            throw error;
        }
    }

    async _initializeTransformers() {
        // Initialize transformer models for various NLP tasks
        // This would typically load pre-trained models
        return true;
    }

    async _tokenize(text) {
        // Advanced tokenization with support for multiple languages
        const tokens = text.toLowerCase()
            .replace(/[^\w\s]|_/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ');

        return tokens.map(token => ({
            text: token,
            start: text.indexOf(token),
            end: text.indexOf(token) + token.length
        }));
    }

    async _posTag(tokens) {
        // Part of Speech tagging
        return tokens.map(token => ({
            ...token,
            pos: this._getPOSTag(token.text)
        }));
    }

    _getPOSTag(word) {
        // Simple POS tagging rules (to be replaced with ML model)
        if (/^(i|you|he|she|it|we|they)$/i.test(word)) return 'PRON';
        if (/^(is|am|are|was|were|be|been)$/i.test(word)) return 'VERB';
        if (/^(in|on|at|by|for|with|to)$/i.test(word)) return 'PREP';
        if (/^(the|a|an|this|that|these|those)$/i.test(word)) return 'DET';
        return 'NOUN'; // Default
    }

    async _extractEntities(text) {
        const entities = [];
        
        // Named Entity Recognition patterns
        const patterns = {
            DATE: /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b(today|tomorrow|yesterday)\b/gi,
            TIME: /\b\d{1,2}:\d{2}\b|\b(noon|midnight)\b/gi,
            EMAIL: /\b[\w\.-]+@[\w\.-]+\.\w+\b/gi,
            PHONE: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/gi,
            MONEY: /\$\d+(\.\d{2})?/gi,
            PERSON: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
        };

        // Extract entities using patterns
        for (const [type, pattern] of Object.entries(patterns)) {
            const matches = text.match(pattern) || [];
            matches.forEach(match => {
                entities.push({
                    type,
                    text: match,
                    start: text.indexOf(match),
                    end: text.indexOf(match) + match.length
                });
            });
        }

        return entities;
    }

    async _analyzeSentiment(text) {
        // Simple rule-based sentiment analysis (to be replaced with ML model)
        const positiveWords = new Set(['good', 'great', 'awesome', 'excellent', 'happy', 'love']);
        const negativeWords = new Set(['bad', 'terrible', 'awful', 'horrible', 'sad', 'hate']);

        const words = text.toLowerCase().split(/\W+/);
        let score = 0;

        words.forEach(word => {
            if (positiveWords.has(word)) score += 1;
            if (negativeWords.has(word)) score -= 1;
        });

        return {
            score: score / words.length, // Normalize by text length
            label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
            confidence: Math.abs(score / words.length)
        };
    }

    async _classifyIntent(text, context) {
        // Intent classification with context awareness
        const intents = {
            QUESTION: /^(what|where|when|who|why|how|is|are|can|could|would|will|do|does|did)/i,
            COMMAND: /^(show|tell|find|search|look|get|give|help|please)/i,
            GREETING: /^(hi|hello|hey|greetings)/i,
            FAREWELL: /^(bye|goodbye|see you|farewell)/i
        };

        let intent = {
            type: 'UNKNOWN',
            confidence: 0.5,
            action: null
        };

        // Check against patterns
        for (const [type, pattern] of Object.entries(intents)) {
            if (pattern.test(text)) {
                intent.type = type;
                intent.confidence = 0.8;
                break;
            }
        }

        // Enhance with context
        if (context.history && context.history.length > 0) {
            const lastInteraction = context.history[context.history.length - 1];
            if (lastInteraction && lastInteraction.intent) {
                // Adjust for conversation flow
                intent.confidence *= 1.2;
            }
        }

        return intent;
    }

    async _parseStructure(tokens, pos) {
        // Basic dependency parsing
        const structure = {
            root: null,
            dependencies: []
        };

        // Find the main verb (root)
        const verbIndex = pos.findIndex(token => token.pos === 'VERB');
        if (verbIndex !== -1) {
            structure.root = tokens[verbIndex];

            // Build simple dependencies
            pos.forEach((token, index) => {
                if (index !== verbIndex) {
                    structure.dependencies.push({
                        type: this._getDependencyType(token.pos, pos[verbIndex].pos),
                        governor: tokens[verbIndex],
                        dependent: tokens[index]
                    });
                }
            });
        }

        return structure;
    }

    _getDependencyType(dependentPOS, governorPOS) {
        // Simple dependency type determination
        if (dependentPOS === 'PRON' && governorPOS === 'VERB') return 'nsubj';
        if (dependentPOS === 'NOUN' && governorPOS === 'VERB') return 'dobj';
        if (dependentPOS === 'PREP') return 'prep';
        if (dependentPOS === 'DET') return 'det';
        return 'dep';
    }
}

// Create global instance
if (typeof window.EchoMind === 'undefined') {
    window.EchoMind = {};
}
window.EchoMind.NLP = EchoMindNLP; 