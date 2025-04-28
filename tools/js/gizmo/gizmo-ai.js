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
            },
            githubIntegration: {
                features: ['repository analysis', 'code search', 'issue management', 'pull requests'],
                actions: ['analyze', 'search', 'suggest', 'create']
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
            
            if (messageContext.isGitHubRelated) {
                const githubAnalysis = await this.handleGitHubRequest(message);
                response.text = gizmoPersonality.generateResponse(githubAnalysis, 'github');
                response.type = 'github';
            } else if (messageContext.isCodeRelated) {
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
                text: gizmoPersonality.generateResponse('unknown', 'error'),
                type: 'error',
                error: error.message
            };
        }
    }

    analyzeMessageContext(message) {
        return {
            isGitHubRelated: this.detectGitHubContent(message),
            isCodeRelated: this.detectCodeContent(message),
            isModification: this.detectModificationIntent(message),
            topics: this.extractTopics(message),
            sentiment: gizmoPersonality.analyzeSentiment(message),
            complexity: this.assessComplexity(message)
        };
    }

    detectGitHubContent(message) {
        const githubPatterns = [
            /\b(github|repo|repository|issue|pull request|pr|commit)\b/i,
            /github\.com/,
            /\b(clone|fork|branch|merge)\b/i
        ];
        return githubPatterns.some(pattern => pattern.test(message));
    }

    detectCodeContent(message) {
        const codePatterns = [
            /\b(function|class|var|const|let)\b/,
            /[{}\[\]()=>;]/,
            /\b(code|script|program|debug|error)\b/i
        ];
        return codePatterns.some(pattern => pattern.test(message));
    }

    detectModificationIntent(message) {
        const modificationPatterns = [
            /\b(change|modify|update|add|remove|delete)\b/i,
            /\b(make|create|implement)\b/i,
            /\b(improve|optimize|enhance)\b/i
        ];
        return modificationPatterns.some(pattern => pattern.test(message));
    }

    extractTopics(message) {
        const topics = new Set();
        
        // Extract technical terms
        const technicalTerms = message.match(/\b(API|function|code|image|analysis|data|UI|app)\b/gi) || [];
        technicalTerms.forEach(term => topics.add(term.toLowerCase()));
        
        // Extract action words
        const actions = message.match(/\b(create|modify|analyze|implement|change|update)\b/gi) || [];
        actions.forEach(action => topics.add(action.toLowerCase()));
        
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
            // Convert image to base64
            const base64Image = await this.convertImageToBase64(image);
            
            // Perform image analysis
            const analysis = await this.performImageAnalysis(base64Image);
            
            // Store in gallery
            const imageInfo = {
                url: URL.createObjectURL(image),
                analysis: analysis.description,
                timestamp: Date.now()
            };
            this.imageGallery.push(imageInfo);
            localStorage.setItem('gizmo_images', JSON.stringify(this.imageGallery));
            
            return analysis;
        } catch (error) {
            console.error('Image analysis error:', error);
            throw error;
        }
    }

    async convertImageToBase64(image) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(image);
        });
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
        const codeBlocks = message.match(/`{1,3}[\s\S]*?`{1,3}/g) || [];
        return codeBlocks.map(block => block.replace(/`/g, ''));
    }

    detectLanguage(codeSnippets) {
        // Simple language detection based on keywords and syntax
        const languages = {
            javascript: /\b(function|const|let|var|=>)\b/,
            python: /\b(def|class|import|from)\b/,
            html: /<[^>]+>/,
            css: /[^{]*{[^}]*}/
        };

        for (const [lang, pattern] of Object.entries(languages)) {
            if (codeSnippets.some(snippet => pattern.test(snippet))) {
                return lang;
            }
        }
        
        return 'unknown';
    }

    generateCodeSuggestions(codeSnippets) {
        const suggestions = [];
        
        // Check for common patterns and generate suggestions
        codeSnippets.forEach(snippet => {
            if (snippet.includes('var ')) {
                suggestions.push('Consider using const or let instead of var');
            }
            if (snippet.includes('function ') && !snippet.includes('=>')) {
                suggestions.push('Consider using arrow functions for cleaner syntax');
            }
            if (snippet.includes('.innerHTML')) {
                suggestions.push('Consider using safer alternatives to innerHTML');
            }
        });
        
        return suggestions;
    }

    checkBestPractices(codeSnippets) {
        const practices = [];
        
        // Check for common best practices
        codeSnippets.forEach(snippet => {
            if (snippet.length > 100) {
                practices.push('Consider breaking down long functions');
            }
            if ((snippet.match(/if/g) || []).length > 3) {
                practices.push('Consider simplifying complex conditions');
            }
            if (snippet.includes('console.log')) {
                practices.push('Remember to remove debug statements');
            }
        });
        
        return practices;
    }

    async handleAppModification(message) {
        const request = this.parseModificationRequest(message);
        const plan = this.generateModificationPlan(request);
        const impact = this.assessModificationImpact(plan);
        const timeline = this.estimateTimeline(plan);
        
        return {
            request,
            plan,
            impact,
            timeline
        };
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
            create: /\b(create|add|implement|new)\b/i,
            modify: /\b(change|update|modify|improve)\b/i,
            delete: /\b(remove|delete|eliminate)\b/i
        };
        
        for (const [type, pattern] of Object.entries(types)) {
            if (pattern.test(message)) {
                return type;
            }
        }
        
        return 'modify'; // Default type
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

    async handleGitHubRequest(message) {
        // Extract GitHub URL if present
        const urlMatch = message.match(/https:\/\/github\.com\/[^\/]+\/[^\/\s]+/);
        if (urlMatch) {
            const repoUrl = urlMatch[0];
            const analysis = await gizmoGitHub.analyzeRepository(repoUrl);
            return {
                type: 'repository',
                url: repoUrl,
                ...analysis
            };
        }

        // Handle other GitHub-related requests
        if (message.toLowerCase().includes('search')) {
            const query = message.replace(/^.*search\s+/i, '').trim();
            const results = await gizmoGitHub.searchCode(query);
            return {
                type: 'search',
                query,
                results
            };
        }

        if (message.toLowerCase().includes('issue')) {
            const title = message.replace(/^.*issue\s+/i, '').trim();
            const issue = await gizmoGitHub.createIssue(title, 'Created by Gizmo AI');
            return {
                type: 'issue',
                issue
            };
        }

        return {
            type: 'unknown',
            message: 'I can help you with GitHub repositories. Try providing a repository URL or asking me to search for something specific.'
        };
    }

    getImageGallery() {
        return this.imageGallery;
    }
}

// Initialize Gizmo AI
const gizmoAI = new GizmoAI(); 