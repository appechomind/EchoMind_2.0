class GizmoAI {
    constructor() {
        this.imageGallery = [];
        this.initializeStorage();
        this.initializeCapabilities();
    }

    async initializeStorage() {
        // Initialize local storage for images and conversation history
        if (!localStorage.getItem('gizmo_images')) {
            localStorage.setItem('gizmo_images', JSON.stringify([]));
        }
        if (!localStorage.getItem('gizmo_history')) {
            localStorage.setItem('gizmo_history', JSON.stringify([]));
        }
        this.imageGallery = JSON.parse(localStorage.getItem('gizmo_images'));
    }

    initializeCapabilities() {
        this.capabilities = {
            codeAnalysis: {
                languages: ['javascript', 'python', 'html', 'css'],
                features: ['syntax highlighting', 'error detection', 'best practices', 'optimization']
            },
            imageAnalysis: {
                features: ['object detection', 'text recognition', 'pattern matching', 'color analysis'],
                formats: ['png', 'jpg', 'jpeg', 'gif']
            },
            contextTracking: {
                maxHistory: 10,
                features: ['topic extraction', 'sentiment analysis', 'user preferences']
            }
        };
    }

    async processMessage(message, image = null) {
        try {
            let response = {
                text: '',
                type: 'text',
                suggestions: []
            };

            // Process image if provided
            if (image) {
                const imageAnalysis = await this.analyzeImage(image);
                response.text = gizmoPersonality.generateResponse(imageAnalysis, 'image');
                response.type = 'image';
            }

            // Process text message with advanced context
            const messageContext = this.analyzeMessageContext(message);
            
            if (messageContext.isCodeRelated) {
                const codeAnalysis = await this.analyzeCode(message);
                response.text += gizmoPersonality.generateResponse(codeAnalysis, 'code');
                response.type = 'code';
            } else if (messageContext.isModification) {
                const modificationPlan = await this.handleAppModification(message);
                response.text += gizmoPersonality.generateResponse(modificationPlan, 'modification');
                response.type = 'modification';
            } else {
                response.text += await this.generateContextAwareResponse(message, messageContext);
            }

            // Add relevant suggestions
            response.suggestions = this.generateContextualSuggestions(messageContext);

            return response;
        } catch (error) {
            console.error('Error processing message:', error);
            return {
                text: gizmoPersonality.getErrorResponse('unknown'),
                type: 'error',
                error: error.message
            };
        }
    }

    analyzeMessageContext(message) {
        return {
            isCodeRelated: this.detectCodeContent(message),
            isModification: this.detectModificationIntent(message),
            topics: this.extractTopics(message),
            sentiment: gizmoPersonality.analyzeSentiment(message),
            complexity: this.assessComplexity(message)
        };
    }

    detectCodeContent(message) {
        const codePatterns = [
            /\b(function|class|const|let|var|import|export)\b/,
            /[{}\[\]()=>;]/,
            /\b(javascript|python|html|css|code)\b/i
        ];
        return codePatterns.some(pattern => pattern.test(message));
    }

    detectModificationIntent(message) {
        const modificationPatterns = [
            /\b(change|modify|update|add|remove|delete)\b/i,
            /\b(feature|functionality|behavior|style)\b/i
        ];
        return modificationPatterns.some(pattern => pattern.test(message));
    }

    extractTopics(message) {
        const topics = new Set();
        
        // Extract technical topics
        const technicalPattern = /\b(API|function|class|method|component|algorithm|code|image|analysis)\b/gi;
        const matches = message.match(technicalPattern) || [];
        matches.forEach(match => topics.add(match.toLowerCase()));
        
        return Array.from(topics);
    }

    assessComplexity(message) {
        let complexity = 0;
        
        // Check for technical terms
        complexity += (message.match(/\b(API|function|class|method|algorithm)\b/gi) || []).length * 0.2;
        
        // Check for code snippets
        complexity += (message.match(/[{}\[\]()=>;]/g) || []).length * 0.1;
        
        // Check message length
        complexity += message.length > 100 ? 0.3 : 0;
        
        return Math.min(complexity, 1);
    }

    async analyzeImage(image) {
        try {
            const base64Image = await this.imageToBase64(image);
            const analysis = await this.performImageAnalysis(base64Image);
            
            // Store enhanced analysis results
            const imageUrl = URL.createObjectURL(image);
            this.imageGallery.push({
                url: imageUrl,
                timestamp: new Date().toISOString(),
                analysis: analysis,
                metadata: {
                    size: image.size,
                    type: image.type,
                    dimensions: await this.getImageDimensions(image)
                }
            });
            
            localStorage.setItem('gizmo_images', JSON.stringify(this.imageGallery));
            
            return analysis;
        } catch (error) {
            console.error('Error analyzing image:', error);
            return gizmoPersonality.getErrorResponse('image_analysis');
        }
    }

    async performImageAnalysis(base64Image) {
        // TODO: Implement actual image analysis using a computer vision API
        return {
            description: 'An image that appears to contain various elements',
            objects: ['Detected objects would be listed here'],
            text: ['Any detected text would be shown here'],
            colors: ['Dominant colors would be listed here'],
            patterns: ['Identified patterns would be described here']
        };
    }

    async getImageDimensions(image) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height
                });
            };
            img.src = URL.createObjectURL(image);
        });
    }

    async analyzeCode(message) {
        const codeSnippets = this.extractCodeSnippets(message);
        const analysis = {
            language: this.detectLanguage(codeSnippets),
            suggestions: this.generateCodeSuggestions(codeSnippets),
            bestPractices: this.checkBestPractices(codeSnippets)
        };
        
        return analysis;
    }

    extractCodeSnippets(message) {
        const codeBlocks = message.match(/```[\s\S]*?```/g) || [];
        const inlineCode = message.match(/`[^`]+`/g) || [];
        
        return {
            blocks: codeBlocks.map(block => block.replace(/```/g, '')),
            inline: inlineCode.map(code => code.replace(/`/g, ''))
        };
    }

    detectLanguage(codeSnippets) {
        // Combine all code snippets for analysis
        const allCode = [...codeSnippets.blocks, ...codeSnippets.inline].join('\n');
        
        // Check for language-specific patterns
        if (allCode.includes('function') || allCode.includes('const')) return 'javascript';
        if (allCode.includes('def') || allCode.includes('class:')) return 'python';
        if (allCode.includes('<') && allCode.includes('>')) return 'html';
        if (allCode.includes('{') && allCode.includes('}')) return 'css';
        
        return 'unknown';
    }

    generateCodeSuggestions(codeSnippets) {
        const suggestions = [];
        const language = this.detectLanguage(codeSnippets);
        
        // Language-specific suggestions
        switch (language) {
            case 'javascript':
                suggestions.push('Consider using modern ES6+ features');
                suggestions.push('Add error handling with try/catch');
                break;
            case 'python':
                suggestions.push('Use type hints for better code clarity');
                suggestions.push('Implement error handling with try/except');
                break;
            case 'html':
                suggestions.push('Ensure proper semantic markup');
                suggestions.push('Add ARIA attributes for accessibility');
                break;
            case 'css':
                suggestions.push('Consider using CSS variables');
                suggestions.push('Implement responsive design patterns');
                break;
        }
        
        return suggestions;
    }

    checkBestPractices(codeSnippets) {
        const practices = [];
        const allCode = [...codeSnippets.blocks, ...codeSnippets.inline].join('\n');
        
        // General best practices
        if (!allCode.includes('try')) {
            practices.push('Add error handling');
        }
        if (allCode.includes('var ')) {
            practices.push('Use const/let instead of var');
        }
        if (allCode.length > 500) {
            practices.push('Consider breaking down into smaller functions');
        }
        
        return practices;
    }

    async handleAppModification(message) {
        try {
            const request = this.parseModificationRequest(message);
            const plan = this.generateModificationPlan(request);
            
            return {
                request: request,
                plan: plan,
                impact: this.assessModificationImpact(plan),
                timeline: this.estimateTimeline(plan)
            };
        } catch (error) {
            console.error('Error handling app modification:', error);
            return gizmoPersonality.getErrorResponse('modification');
        }
    }

    parseModificationRequest(message) {
        const request = {
            type: this.detectModificationType(message),
            target: this.detectModificationTarget(message),
            scope: this.detectModificationScope(message)
        };
        
        return request;
    }

    detectModificationType(message) {
        const types = {
            'change': 'modify',
            'add': 'create',
            'remove': 'delete',
            'update': 'update'
        };
        
        for (const [key, value] of Object.entries(types)) {
            if (message.toLowerCase().includes(key)) {
                return value;
            }
        }
        
        return 'modify';
    }

    detectModificationTarget(message) {
        const targets = {
            'color': 'appearance',
            'style': 'appearance',
            'feature': 'functionality',
            'function': 'functionality',
            'data': 'data',
            'content': 'content'
        };
        
        for (const [key, value] of Object.entries(targets)) {
            if (message.toLowerCase().includes(key)) {
                return value;
            }
        }
        
        return 'general';
    }

    detectModificationScope(message) {
        if (message.includes('all') || message.includes('every')) return 'global';
        if (message.includes('this') || message.includes('here')) return 'local';
        return 'specific';
    }

    generateModificationPlan(request) {
        const plan = {
            steps: [],
            requirements: [],
            validation: []
        };
        
        // Generate steps based on request type
        switch (request.type) {
            case 'create':
                plan.steps = [
                    'Analyze requirements',
                    'Design solution',
                    'Implement feature',
                    'Test functionality'
                ];
                break;
            case 'modify':
                plan.steps = [
                    'Identify affected components',
                    'Plan modifications',
                    'Implement changes',
                    'Verify functionality'
                ];
                break;
            case 'delete':
                plan.steps = [
                    'Identify dependencies',
                    'Plan removal strategy',
                    'Remove functionality',
                    'Verify system integrity'
                ];
                break;
        }
        
        return plan;
    }

    assessModificationImpact(plan) {
        return {
            complexity: plan.steps.length * 0.2,
            scope: plan.steps.filter(step => step.includes('system') || step.includes('components')).length * 0.3,
            risk: plan.steps.filter(step => step.includes('verify') || step.includes('test')).length * 0.1
        };
    }

    estimateTimeline(plan) {
        // Simple timeline estimation based on plan complexity
        const baseTime = plan.steps.length * 10; // minutes
        const complexityFactor = 1 + (plan.steps.filter(step => 
            step.includes('system') || step.includes('test')
        ).length * 0.2);
        
        return Math.round(baseTime * complexityFactor);
    }

    async generateContextAwareResponse(message, context) {
        // Generate response based on context and user preferences
        const baseResponse = gizmoPersonality.generateResponse(message, 'general');
        
        // Add context-aware enhancements
        let enhancedResponse = baseResponse;
        
        if (context.complexity > 0.7) {
            enhancedResponse += '\n\nI notice this is a complex topic. Would you like me to break it down into smaller parts?';
        }
        
        if (context.topics.length > 0) {
            enhancedResponse += '\n\nI can provide more information about: ' + context.topics.join(', ');
        }
        
        return enhancedResponse;
    }

    generateContextualSuggestions(context) {
        const suggestions = [];
        
        // Add suggestions based on context
        if (context.isCodeRelated) {
            suggestions.push('Review code best practices');
            suggestions.push('Explore similar patterns');
        }
        
        if (context.complexity > 0.5) {
            suggestions.push('Break down into smaller tasks');
            suggestions.push('See step-by-step explanation');
        }
        
        // Add topic-specific suggestions
        context.topics.forEach(topic => {
            suggestions.push(`Learn more about ${topic}`);
        });
        
        return suggestions.slice(0, 3); // Limit to top 3 suggestions
    }

    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    getImageGallery() {
        return this.imageGallery;
    }

    clearImageGallery() {
        this.imageGallery = [];
        localStorage.setItem('gizmo_images', JSON.stringify([]));
    }
}

// Initialize Gizmo AI
const gizmoAI = new GizmoAI(); 