class GizmoNLP {
    constructor() {
        this.tokenizer = new TextTokenizer();
        this.parser = new SyntaxParser();
        this.semanticAnalyzer = new SemanticAnalyzer();
        this.contextManager = new ContextManager();
        this.responseGenerator = new ResponseGenerator();
    }
}

class TextTokenizer {
    constructor() {
        this.specialTokens = new Set(['function', 'class', 'const', 'let', 'var', 'if', 'else', 'for', 'while']);
        this.punctuation = new Set(['.', ',', '!', '?', ';', ':', '"', "'", '(', ')', '[', ']', '{', '}']);
    }

    tokenize(text) {
        return {
            tokens: this.extractTokens(text),
            sentences: this.splitSentences(text),
            phrases: this.extractPhrases(text)
        };
    }

    extractTokens(text) {
        const tokens = [];
        let currentToken = '';
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if ((char === '"' || char === "'") && !inString) {
                inString = true;
                stringChar = char;
                currentToken = char;
            } else if (char === stringChar && inString) {
                inString = false;
                currentToken += char;
                tokens.push({
                    type: 'string',
                    value: currentToken,
                    position: i - currentToken.length + 1
                });
                currentToken = '';
            } else if (inString) {
                currentToken += char;
            } else if (this.punctuation.has(char)) {
                if (currentToken) {
                    tokens.push(this.createToken(currentToken, i - currentToken.length));
                    currentToken = '';
                }
                tokens.push({
                    type: 'punctuation',
                    value: char,
                    position: i
                });
            } else if (char === ' ' || char === '\n' || char === '\t') {
                if (currentToken) {
                    tokens.push(this.createToken(currentToken, i - currentToken.length));
                    currentToken = '';
                }
            } else {
                currentToken += char;
            }
        }

        if (currentToken) {
            tokens.push(this.createToken(currentToken, text.length - currentToken.length));
        }

        return tokens;
    }

    createToken(text, position) {
        if (this.specialTokens.has(text)) {
            return {
                type: 'keyword',
                value: text,
                position: position
            };
        }

        if (/^\d+$/.test(text)) {
            return {
                type: 'number',
                value: parseInt(text),
                position: position
            };
        }

        if (/^[a-zA-Z_]\w*$/.test(text)) {
            return {
                type: 'identifier',
                value: text,
                position: position
            };
        }

        return {
            type: 'text',
            value: text,
            position: position
        };
    }

    splitSentences(text) {
        const sentences = [];
        let currentSentence = '';
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if ((char === '"' || char === "'") && !inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar && inString) {
                inString = false;
            }

            if (!inString && (char === '.' || char === '!' || char === '?')) {
                currentSentence += char;
                if (currentSentence.trim()) {
                    sentences.push({
                        text: currentSentence.trim(),
                        end: i
                    });
                }
                currentSentence = '';
            } else {
                currentSentence += char;
            }
        }

        if (currentSentence.trim()) {
            sentences.push({
                text: currentSentence.trim(),
                end: text.length
            });
        }

        return sentences;
    }

    extractPhrases(text) {
        const phrases = [];
        const sentences = this.splitSentences(text);

        sentences.forEach(sentence => {
            const words = sentence.text.split(/\s+/);
            let currentPhrase = [];

            words.forEach((word, index) => {
                currentPhrase.push(word);

                if (this.isPhraseBreak(word, words[index + 1])) {
                    if (currentPhrase.length > 0) {
                        phrases.push({
                            text: currentPhrase.join(' '),
                            type: this.getPhraseType(currentPhrase)
                        });
                    }
                    currentPhrase = [];
                }
            });

            if (currentPhrase.length > 0) {
                phrases.push({
                    text: currentPhrase.join(' '),
                    type: this.getPhraseType(currentPhrase)
                });
            }
        });

        return phrases;
    }

    isPhraseBreak(currentWord, nextWord) {
        if (!nextWord) return true;
        if (this.punctuation.has(currentWord)) return true;
        return false;
    }

    getPhraseType(words) {
        const firstWord = words[0].toLowerCase();
        if (['the', 'a', 'an'].includes(firstWord)) return 'noun_phrase';
        if (['is', 'are', 'was', 'were'].includes(firstWord)) return 'verb_phrase';
        if (['in', 'on', 'at', 'by'].includes(firstWord)) return 'prepositional_phrase';
        return 'other';
    }
}

class SyntaxParser {
    constructor() {
        this.grammar = {
            statement: ['subject', 'predicate'],
            subject: ['noun_phrase'],
            predicate: ['verb_phrase', 'object'],
            noun_phrase: ['determiner', 'noun'],
            verb_phrase: ['verb', 'adverb']
        };
    }

    parse(tokens) {
        return {
            tree: this.buildSyntaxTree(tokens),
            dependencies: this.findDependencies(tokens)
        };
    }

    buildSyntaxTree(tokens) {
        const tree = {
            type: 'root',
            children: []
        };

        let currentNode = tree;
        let stack = [];

        tokens.forEach(token => {
            if (token.type === 'keyword') {
                const node = {
                    type: 'keyword_node',
                    value: token.value,
                    children: []
                };
                currentNode.children.push(node);
                stack.push(currentNode);
                currentNode = node;
            } else if (token.type === 'punctuation' && token.value === '{') {
                const node = {
                    type: 'block_node',
                    children: []
                };
                currentNode.children.push(node);
                stack.push(currentNode);
                currentNode = node;
            } else if (token.type === 'punctuation' && token.value === '}') {
                if (stack.length > 0) {
                    currentNode = stack.pop();
                }
            } else {
                currentNode.children.push({
                    type: 'token_node',
                    token: token
                });
            }
        });

        return tree;
    }

    findDependencies(tokens) {
        const dependencies = [];
        const stack = [];

        tokens.forEach((token, index) => {
            if (token.type === 'identifier') {
                const scope = this.getCurrentScope(stack);
                dependencies.push({
                    type: 'identifier_dependency',
                    identifier: token.value,
                    scope: scope,
                    position: index
                });
            } else if (token.type === 'keyword') {
                stack.push({
                    type: token.value,
                    start: index
                });
            } else if (token.type === 'punctuation' && token.value === '}') {
                if (stack.length > 0) {
                    const scope = stack.pop();
                    scope.end = index;
                    dependencies.push({
                        type: 'scope_dependency',
                        scope: scope
                    });
                }
            }
        });

        return dependencies;
    }

    getCurrentScope(stack) {
        if (stack.length === 0) return 'global';
        return stack[stack.length - 1].type;
    }
}

class SemanticAnalyzer {
    constructor() {
        this.contextStack = [];
        this.symbolTable = new Map();
    }

    analyze(syntaxTree) {
        return {
            semantics: this.analyzeNode(syntaxTree),
            symbols: this.symbolTable,
            context: this.contextStack
        };
    }

    analyzeNode(node, context = {}) {
        if (!node) return null;

        const analysis = {
            type: node.type,
            meaning: this.deriveMeaning(node),
            context: context,
            children: []
        };

        if (node.children) {
            node.children.forEach(child => {
                const childContext = this.updateContext(context, node);
                const childAnalysis = this.analyzeNode(child, childContext);
                if (childAnalysis) {
                    analysis.children.push(childAnalysis);
                }
            });
        }

        return analysis;
    }

    deriveMeaning(node) {
        if (node.type === 'keyword_node') {
            return this.analyzeKeyword(node);
        } else if (node.type === 'block_node') {
            return this.analyzeBlock(node);
        } else if (node.type === 'token_node') {
            return this.analyzeToken(node.token);
        }
        return null;
    }

    analyzeKeyword(node) {
        switch (node.value) {
            case 'function':
                return {
                    type: 'function_definition',
                    scope: this.getCurrentScope()
                };
            case 'class':
                return {
                    type: 'class_definition',
                    scope: this.getCurrentScope()
                };
            case 'if':
                return {
                    type: 'condition',
                    scope: this.getCurrentScope()
                };
            default:
                return {
                    type: 'keyword',
                    value: node.value
                };
        }
    }

    analyzeBlock(node) {
        return {
            type: 'code_block',
            scope: this.getCurrentScope(),
            context: this.contextStack[this.contextStack.length - 1]
        };
    }

    analyzeToken(token) {
        if (token.type === 'identifier') {
            this.symbolTable.set(token.value, {
                type: 'identifier',
                scope: this.getCurrentScope(),
                references: []
            });
        }
        return {
            type: token.type,
            value: token.value
        };
    }

    updateContext(parentContext, node) {
        const context = { ...parentContext };
        if (node.type === 'keyword_node') {
            context.keyword = node.value;
        }
        this.contextStack.push(context);
        return context;
    }

    getCurrentScope() {
        return this.contextStack.length > 0 ? 
            this.contextStack[this.contextStack.length - 1] : 
            { type: 'global' };
    }
}

class ContextManager {
    constructor() {
        this.context = {
            global: new Map(),
            local: new Map(),
            temporary: new Map()
        };
        this.history = [];
        this.maxHistorySize = 100;
    }

    updateContext(type, key, value) {
        this.context[type].set(key, {
            value: value,
            timestamp: new Date(),
            updates: (this.context[type].get(key)?.updates || 0) + 1
        });

        this.history.push({
            type: type,
            key: key,
            value: value,
            timestamp: new Date()
        });

        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        return this.context[type].get(key);
    }

    getContext(type, key) {
        return this.context[type].get(key);
    }

    getAllContext() {
        return {
            global: Object.fromEntries(this.context.global),
            local: Object.fromEntries(this.context.local),
            temporary: Object.fromEntries(this.context.temporary)
        };
    }

    clearContext(type) {
        this.context[type].clear();
    }

    getHistory(limit = 10) {
        return this.history.slice(-limit);
    }
}

class ResponseGenerator {
    constructor() {
        this.templates = {
            question: [
                "*adjusts magical spectacles* Let me ponder that question about {topic}...",
                "*taps wand thoughtfully* That's an interesting question about {topic}...",
                "*nods with curiosity* I'd love to explore that question about {topic}..."
            ],
            command: [
                "*waves wand enthusiastically* I'll help you with that {action}...",
                "*adjusts hat* Let me assist you with that {action}...",
                "*sparkles appear* I'm on it! Let's handle that {action}..."
            ],
            statement: [
                "*nods with understanding* Ah, I see what you mean about {topic}...",
                "*adjusts spectacles* That's fascinating about {topic}...",
                "*smiles warmly* I understand your point about {topic}..."
            ],
            default: [
                "*taps wand thoughtfully* I'm intrigued by what you're saying...",
                "*adjusts hat* That's quite interesting...",
                "*nods with curiosity* Tell me more about that..."
            ]
        };
    }

    generateResponse(type, context) {
        const templates = this.templates[type] || this.templates.default;
        const template = this.selectTemplate(templates, context);
        return this.fillTemplate(template, context);
    }

    selectTemplate(templates, context) {
        // Add some randomness to template selection
        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }

    fillTemplate(template, context) {
        let response = template;
        for (const [key, value] of Object.entries(context)) {
            response = response.replace(`{${key}}`, value || 'that');
        }
        return response;
    }

    enhanceResponse(response, context) {
        // Add relevant information based on context
        let enhanced = response;

        if (context.technical_level === 'expert') {
            enhanced += '\n\nTechnical details: ' + JSON.stringify(context.technical_details);
        }

        if (context.examples && context.examples.length > 0) {
            enhanced += '\n\nExample: ' + context.examples[0];
        }

        if (context.references && context.references.length > 0) {
            enhanced += '\n\nReferences:\n' + context.references.join('\n');
        }

        return enhanced;
    }
}

// Initialize Gizmo's NLP capabilities
const gizmoNLP = new GizmoNLP(); 