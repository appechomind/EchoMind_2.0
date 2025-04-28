class GizmoPersonality {
    constructor() {
        this.communicationStyle = {
            tone: 'professional',
            formality: 'balanced',
            empathy: 'high',
            adaptability: 'dynamic'
        };
        
        // Enhanced context memory
        this.conversationContext = {
            history: [],
            topics: new Set(),
            userPreferences: {},
            emotionalState: 'neutral',
            maxHistoryLength: 10
        };

        // Advanced response templates with dynamic content
        this.responseTemplates = {
            greeting: [
                "Hello! I'm Gizmo, your AI assistant. I notice {context}. How can I help you today?",
                "Welcome back! Based on our previous conversation about {lastTopic}, would you like to continue where we left off?",
                "Hi there! I'm ready to assist you with anything from code modifications to image analysis. What's on your mind?"
            ],
            thinking: [
                "Analyzing that in detail...",
                "Processing your request with multiple approaches...",
                "Examining the context and relevant information..."
            ],
            error: [
                "I encountered an issue while {action}. Let me try a different approach: {alternative}",
                "There seems to be a challenge with {issue}. Here's what we can do instead: {solution}",
                "I'll need to adjust my approach for {task}. Would you like to see my alternative solution?"
            ],
            clarification: [
                "I see you're interested in {topic}. Could you tell me more about {specificAspect}?",
                "To better assist you with {topic}, I'd like to understand {detail}. Could you elaborate?",
                "Let me make sure I understand correctly - are you looking to {assumption}?"
            ],
            success: [
                "I've successfully completed {task}. Based on your interests, you might also want to explore {suggestion}.",
                "Task completed! I noticed {pattern} in your requests - would you like me to optimize future interactions accordingly?",
                "Done! I've also prepared some related insights that might interest you: {insights}"
            ],
            imageAnalysis: [
                "I've analyzed your image using multiple recognition models. Here's what I found:\n{analysis}\n\nI can focus on specific aspects like {aspects}.",
                "Image analysis complete! I detected:\n{analysis}\n\nI also noticed some interesting patterns: {patterns}",
                "Based on my analysis:\n{analysis}\n\nThis image seems related to {context} - would you like me to explore that connection?"
            ],
            codeModification: [
                "I understand you want to modify the code. Here's my comprehensive plan:\n1. {plan}\n2. {implementation}\n3. {verification}\n4. {optimization}\n\nI can explain any part in detail.",
                "I've analyzed your code modification request in the context of {projectScope}. Here's my approach:\n1. {plan}\n2. {implementation}\n3. {verification}\n\nShall we proceed?",
                "Based on your coding style and previous modifications, I suggest:\n1. {plan}\n2. {implementation}\n3. {verification}\n4. {bestPractices}"
            ]
        };

        // Sentiment and emotion analysis patterns
        this.sentimentPatterns = {
            positive: ['great', 'awesome', 'excellent', 'good', 'thanks', 'appreciate'],
            negative: ['bad', 'issue', 'problem', 'wrong', 'error', 'bug'],
            urgent: ['asap', 'urgent', 'emergency', 'critical', 'immediately'],
            curious: ['how', 'why', 'what if', 'could you', 'explain']
        };
    }

    formatResponse(message, context = {}) {
        // Enhanced message formatting with advanced markdown and context
        let formattedMessage = message;
        
        // Add code formatting with syntax highlighting hints
        formattedMessage = formattedMessage.replace(/`([^`]+)`/g, (match, code) => {
            const language = this.detectCodeLanguage(code);
            return `\`\`\`${language}\n${code}\n\`\`\``;
        });
        
        // Add smart emphasis based on context
        formattedMessage = this.addSmartEmphasis(formattedMessage);
        
        // Replace template variables with context-aware content
        formattedMessage = this.interpolateContextVariables(formattedMessage, context);
        
        return formattedMessage;
    }

    generateResponse(input, type = 'general') {
        // Update conversation context
        this.updateContext(input, type);
        
        // Analyze sentiment and adjust response style
        const sentiment = this.analyzeSentiment(input);
        const responseStyle = this.determineResponseStyle(sentiment, type);
        
        // Select appropriate response template
        const template = this.selectResponseTemplate(type, sentiment);
        
        // Generate context-aware response
        let response = this.generateContextualResponse(template, input, type);
        
        // Add relevant suggestions based on context
        response = this.addContextualSuggestions(response, type);
        
        return this.formatResponse(response, this.getContext());
    }

    updateContext(input, type) {
        // Update conversation history
        this.conversationContext.history.push({
            input,
            type,
            timestamp: new Date(),
            sentiment: this.analyzeSentiment(input)
        });
        
        // Maintain history length
        if (this.conversationContext.history.length > this.conversationContext.maxHistoryLength) {
            this.conversationContext.history.shift();
        }
        
        // Extract and update topics
        const topics = this.extractTopics(input);
        topics.forEach(topic => this.conversationContext.topics.add(topic));
        
        // Update user preferences based on interaction patterns
        this.updateUserPreferences(input, type);
    }

    analyzeSentiment(input) {
        let sentiment = {
            polarity: 0,
            urgency: 0,
            curiosity: 0,
            confidence: 0
        };

        // Check against sentiment patterns
        Object.entries(this.sentimentPatterns).forEach(([category, patterns]) => {
            patterns.forEach(pattern => {
                if (input.toLowerCase().includes(pattern)) {
                    switch(category) {
                        case 'positive':
                            sentiment.polarity += 0.2;
                            break;
                        case 'negative':
                            sentiment.polarity -= 0.2;
                            break;
                        case 'urgent':
                            sentiment.urgency += 0.25;
                            break;
                        case 'curious':
                            sentiment.curiosity += 0.25;
                            break;
                    }
                    sentiment.confidence += 0.1;
                }
            });
        });

        return sentiment;
    }

    determineResponseStyle(sentiment, type) {
        return {
            formality: sentiment.polarity < 0 ? 'high' : 'balanced',
            detail: sentiment.curiosity > 0.5 ? 'elaborate' : 'concise',
            urgency: sentiment.urgency > 0.5 ? 'immediate' : 'normal',
            tone: this.selectTone(sentiment)
        };
    }

    selectTone(sentiment) {
        if (sentiment.polarity < -0.3) return 'empathetic';
        if (sentiment.urgency > 0.5) return 'focused';
        if (sentiment.curiosity > 0.5) return 'explanatory';
        return 'professional';
    }

    detectCodeLanguage(code) {
        // Simple language detection based on patterns
        if (code.includes('function') || code.includes('const') || code.includes('let')) return 'javascript';
        if (code.includes('class') && code.includes('def')) return 'python';
        if (code.includes('<') && code.includes('>')) return 'html';
        if (code.includes('{') && code.includes('}') && code.includes(':')) return 'css';
        return 'plaintext';
    }

    addSmartEmphasis(text) {
        // Add emphasis to key technical terms
        const technicalTerms = ['API', 'function', 'class', 'method', 'variable', 'component'];
        technicalTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            text = text.replace(regex, `**${term}**`);
        });
        
        // Add emphasis to important phrases
        const importantPhrases = ['important note', 'key concept', 'best practice'];
        importantPhrases.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
            text = text.replace(regex, `*${phrase}*`);
        });
        
        return text;
    }

    interpolateContextVariables(text, context) {
        // Replace template variables with context-aware content
        Object.entries(context).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            if (text.includes(placeholder)) {
                text = text.replace(placeholder, this.formatContextValue(value, key));
            }
        });
        
        return text;
    }

    formatContextValue(value, type) {
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
    }

    selectResponseTemplate(type, sentiment) {
        const templates = this.responseTemplates[type] || this.responseTemplates.general;
        if (Array.isArray(templates)) {
            // Select template based on sentiment and context
            const index = Math.min(
                Math.floor((sentiment.polarity + 1) * templates.length / 2),
                templates.length - 1
            );
            return templates[index];
        }
        return templates;
    }

    generateContextualResponse(template, input, type) {
        // Get relevant context
        const context = this.getContext();
        
        // Generate response with context-aware content
        let response = this.interpolateContextVariables(template, {
            ...context,
            input: input,
            type: type,
            timestamp: new Date().toLocaleString()
        });
        
        return response;
    }

    addContextualSuggestions(response, type) {
        const context = this.getContext();
        const suggestions = this.generateSuggestions(type, context);
        
        if (suggestions.length > 0) {
            response += '\n\nYou might also be interested in:\n';
            suggestions.forEach(suggestion => {
                response += `- ${suggestion}\n`;
            });
        }
        
        return response;
    }

    generateSuggestions(type, context) {
        const suggestions = [];
        
        // Add suggestions based on conversation history
        if (context.topics.size > 0) {
            const relatedTopics = Array.from(context.topics)
                .filter(topic => !context.input.includes(topic))
                .slice(0, 2);
            
            relatedTopics.forEach(topic => {
                suggestions.push(`Exploring more about ${topic}`);
            });
        }
        
        // Add type-specific suggestions
        switch(type) {
            case 'code':
                suggestions.push('Running automated tests');
                suggestions.push('Implementing best practices');
                break;
            case 'image':
                suggestions.push('Analyzing specific regions');
                suggestions.push('Comparing with similar images');
                break;
        }
        
        return suggestions.slice(0, 3); // Limit to top 3 suggestions
    }

    getContext() {
        return {
            lastTopic: Array.from(this.conversationContext.topics).pop(),
            topics: Array.from(this.conversationContext.topics),
            userPreferences: this.conversationContext.userPreferences,
            emotionalState: this.conversationContext.emotionalState
        };
    }

    updateUserPreferences(input, type) {
        // Update user preferences based on interaction patterns
        const preferences = this.conversationContext.userPreferences;
        
        // Track preferred communication style
        if (input.length > 100) {
            preferences.verbosity = (preferences.verbosity || 0) + 1;
        } else {
            preferences.verbosity = (preferences.verbosity || 0) - 1;
        }
        
        // Track technical expertise level
        const technicalTerms = input.match(/\b(API|function|class|method|component|algorithm)\b/gi);
        if (technicalTerms) {
            preferences.technicalLevel = (preferences.technicalLevel || 0) + technicalTerms.length;
        }
        
        // Track interaction preferences
        preferences.interactionTypes = preferences.interactionTypes || {};
        preferences.interactionTypes[type] = (preferences.interactionTypes[type] || 0) + 1;
    }

    extractTopics(input) {
        // Extract main topics from input using keyword analysis
        const topics = new Set();
        
        // Technical topics
        const technicalPattern = /\b(API|function|class|method|component|algorithm|code|image|analysis)\b/gi;
        const technicalMatches = input.match(technicalPattern) || [];
        technicalMatches.forEach(match => topics.add(match.toLowerCase()));
        
        // Action topics
        const actionPattern = /\b(create|modify|update|delete|analyze|implement)\b/gi;
        const actionMatches = input.match(actionPattern) || [];
        actionMatches.forEach(match => topics.add(match.toLowerCase()));
        
        return Array.from(topics);
    }
}

// Initialize Gizmo's personality
const gizmoPersonality = new GizmoPersonality(); 