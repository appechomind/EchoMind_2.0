import {
    calculateComplexity,
    checkStyle,
    checkSecurity,
    generateSuggestions,
    formatCode
} from './utils/code-analysis.js';

class CodeAnalysis {
    constructor() {
        this.parser = new CodeParser();
        this.analyzer = new CodeAnalyzer();
        this.generator = new CodeGenerator();
    }

    /**
     * Analyzes code for complexity, style, security, and generates suggestions
     * @param {string} code - The source code to analyze
     * @param {Object} context - Analysis context and options
     * @returns {Object} Analysis results
     */
    async analyzeCode(code, context = {}) {
        const complexity = calculateComplexity(code);
        const styleIssues = checkStyle(code);
        const securityIssues = checkSecurity(code);
        const suggestions = generateSuggestions(code);

        return {
            complexity,
            style: styleIssues,
            security: securityIssues,
            suggestions,
            context: this.analyzer.analyzeContext(context)
        };
    }

    /**
     * Generates code from a specification
     * @param {Object} spec - Code generation specification
     * @param {Object} context - Generation context and options
     * @returns {string} Generated code
     */
    async generateCode(spec, context = {}) {
        const template = await this.analyzer.determineTemplate(spec);
        const code = await this.generator.generate(template, context);
        return formatCode(code);
    }

    /**
     * Suggests improvements for the given code
     * @param {string} code - The source code to analyze
     * @param {Object} context - Analysis context
     * @returns {Object} Improvement suggestions
     */
    async suggestImprovements(code, context = {}) {
        const analysis = await this.analyzeCode(code, context);
        return {
            suggestions: analysis.suggestions,
            complexity: analysis.complexity,
            style: analysis.style,
            security: analysis.security
        };
    }
}

class CodeParser {
    async parse(code) {
        try {
            // Basic AST generation
            const ast = {
                type: 'Program',
                body: this.tokenize(code)
            };
            return ast;
        } catch (error) {
            console.error('Parse error:', error);
            throw error;
        }
    }

    tokenize(code) {
        // Basic tokenization
        return code.split(/\s+/).map(token => ({
            type: 'Token',
            value: token
        }));
    }
}

class CodeAnalyzer {
    analyzeContext(context) {
        return {
            scope: context.scope || 'global',
            dependencies: context.dependencies || [],
            environment: context.environment || 'browser'
        };
    }

    async determineTemplate(spec) {
        return {
            type: spec.type || 'function',
            structure: spec.structure || {},
            requirements: spec.requirements || []
        };
    }
}

class CodeGenerator {
    async generate(template, context) {
        try {
            const code = this.buildFromTemplate(template, context);
            return this.format(code);
        } catch (error) {
            console.error('Generation error:', error);
            throw error;
        }
    }

    buildFromTemplate(template, context) {
        // Basic template-based generation
        return `// Generated code for ${template.type}\n`;
    }

    format(code) {
        return formatCode(code);
    }
}

// Export the main class
export default CodeAnalysis; 