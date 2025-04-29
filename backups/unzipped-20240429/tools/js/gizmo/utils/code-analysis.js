import { codeAnalysisConfig } from '../config/code-analysis-config.js';

/**
 * Calculates various complexity metrics for the given code
 * @param {string} code - The source code to analyze
 * @returns {Object} Complexity metrics
 */
export function calculateComplexity(code) {
    if (!code) return {
        cyclomaticComplexity: 0,
        nestedDepth: 0,
        parameterCount: 0,
        statementCount: 0
    };

    const complexity = {
        cyclomaticComplexity: 0,
        nestedDepth: 0,
        parameterCount: 0,
        statementCount: 0
    };

    // Count decision points for cyclomatic complexity
    const decisionPoints = (code.match(/if|while|for|switch|&&|\|\|/g) || []).length;
    complexity.cyclomaticComplexity = decisionPoints + 1;

    // Calculate nested depth
    const lines = code.split('\n');
    let currentDepth = 0;
    lines.forEach(line => {
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        currentDepth += openBraces - closeBraces;
        complexity.nestedDepth = Math.max(complexity.nestedDepth, currentDepth);
    });

    // Count parameters in function definitions
    const functionParams = code.match(/function\s*\w*\s*\((.*?)\)/g) || [];
    complexity.parameterCount = functionParams.reduce((count, params) => {
        return count + (params.match(/,/g) || []).length + 1;
    }, 0);

    // Count statements
    complexity.statementCount = (code.match(/;/g) || []).length;

    return complexity;
}

/**
 * Checks code style against configured rules
 * @param {string} code - The source code to check
 * @returns {Array} Style violations
 */
export function checkStyle(code) {
    const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
        // Check line length
        if (line.length > codeAnalysisConfig.style.maxLineLength) {
            issues.push({
                line: index + 1,
                message: `Line exceeds maximum length of ${codeAnalysisConfig.style.maxLineLength} characters`
            });
        }

        // Check indentation
        const leadingSpaces = line.match(/^\s*/)[0].length;
        if (leadingSpaces % codeAnalysisConfig.style.indentSize !== 0) {
            issues.push({
                line: index + 1,
                message: 'Incorrect indentation'
            });
        }

        // Check quote consistency
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (codeAnalysisConfig.style.preferredQuotes === 'single' && doubleQuotes > 0) {
            issues.push({
                line: index + 1,
                message: 'Use single quotes instead of double quotes'
            });
        }

        // Check spacing rules
        if (codeAnalysisConfig.style.spacingRules.beforeBraces) {
            if (line.match(/\w\{/) || line.match(/\}\w/)) {
                issues.push({
                    line: index + 1,
                    message: 'Missing space before/after brace'
                });
            }
        }
    });

    return issues;
}

/**
 * Checks code for security issues
 * @param {string} code - The source code to check
 * @returns {Array} Security issues
 */
export function checkSecurity(code) {
    const issues = [];

    // Check for forbidden functions
    codeAnalysisConfig.security.forbiddenFunctions.forEach(func => {
        const regex = new RegExp(`\\b${func}\\b`, 'g');
        const matches = code.match(regex);
        if (matches) {
            issues.push({
                type: 'forbidden_function',
                function: func,
                count: matches.length,
                severity: 'high'
            });
        }
    });

    // Check for forbidden properties
    codeAnalysisConfig.security.forbiddenProperties.forEach(prop => {
        const regex = new RegExp(`\\b${prop.replace('.', '\\.')}\\b`, 'g');
        const matches = code.match(regex);
        if (matches) {
            issues.push({
                type: 'forbidden_property',
                property: prop,
                count: matches.length,
                severity: 'medium'
            });
        }
    });

    // Check for forbidden patterns
    codeAnalysisConfig.security.forbiddenPatterns.forEach(pattern => {
        const matches = code.match(pattern);
        if (matches) {
            issues.push({
                type: 'forbidden_pattern',
                pattern: pattern.toString(),
                count: matches.length,
                severity: 'high'
            });
        }
    });

    // Check for strict mode
    if (codeAnalysisConfig.security.requireStrictMode && !code.includes('"use strict"') && !code.includes("'use strict'")) {
        issues.push({
            type: 'missing_strict_mode',
            message: 'Strict mode is required but not enabled',
            severity: 'medium'
        });
    }

    return issues;
}

/**
 * Generates code improvement suggestions
 * @param {string} code - The source code to analyze
 * @returns {Array} Improvement suggestions
 */
export function generateSuggestions(code) {
    const suggestions = [];
    const complexity = calculateComplexity(code);

    // Check complexity thresholds
    const { complexityThresholds } = codeAnalysisConfig.suggestions;
    
    if (complexity.cyclomaticComplexity > complexityThresholds.cyclomaticComplexity) {
        suggestions.push({
            type: 'complexity',
            message: 'Consider breaking down complex logic into smaller functions',
            priority: 'high'
        });
    }

    if (complexity.nestedDepth > complexityThresholds.nestedDepth) {
        suggestions.push({
            type: 'nesting',
            message: 'Consider reducing nested code depth by extracting logic',
            priority: 'medium'
        });
    }

    if (complexity.parameterCount > complexityThresholds.parameterCount) {
        suggestions.push({
            type: 'parameters',
            message: 'Consider using an options object for multiple parameters',
            priority: 'medium'
        });
    }

    // Check naming conventions
    const { namingPatterns } = codeAnalysisConfig.suggestions;
    
    const identifiers = code.match(/\b(?:const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    identifiers.forEach(identifier => {
        const name = identifier.split(/\s+/)[1];
        
        if (identifier.startsWith('const') && !namingPatterns.constants.test(name)) {
            suggestions.push({
                type: 'naming',
                message: `Constant "${name}" should use UPPER_SNAKE_CASE`,
                priority: 'low'
            });
        } else if (identifier.startsWith('function') && !namingPatterns.functions.test(name)) {
            suggestions.push({
                type: 'naming',
                message: `Function "${name}" should use camelCase`,
                priority: 'low'
            });
        } else if (identifier.startsWith('class') && !namingPatterns.classes.test(name)) {
            suggestions.push({
                type: 'naming',
                message: `Class "${name}" should use PascalCase`,
                priority: 'low'
            });
        }
    });

    // Check modern syntax usage
    if (codeAnalysisConfig.suggestions.checks.modernSyntax) {
        if (code.includes('var ')) {
            suggestions.push({
                type: 'modernization',
                message: 'Use "const" or "let" instead of "var"',
                priority: 'medium'
            });
        }
        
        if (code.includes('function') && !code.includes('=>')) {
            suggestions.push({
                type: 'modernization',
                message: 'Consider using arrow functions where appropriate',
                priority: 'low'
            });
        }
    }

    return suggestions;
}

/**
 * Formats code according to style rules
 * @param {string} code - The source code to format
 * @returns {string} Formatted code
 */
export function formatCode(code) {
    const { formatting } = codeAnalysisConfig;
    let formattedCode = code;

    // Normalize line endings
    formattedCode = formattedCode.replace(/\r\n|\r|\n/g, formatting.lineEnding);

    // Fix indentation
    const lines = formattedCode.split(formatting.lineEnding);
    let indentLevel = 0;
    formattedCode = lines.map(line => {
        line = line.trim();
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        
        const currentIndent = formatting.indentChar.repeat(indentLevel * formatting.indentSize);
        indentLevel += openBraces - closeBraces;
        
        return currentIndent + line;
    }).join(formatting.lineEnding);

    // Normalize quotes
    if (formatting.quoteStyle === 'single') {
        formattedCode = formattedCode.replace(/"([^"]*)"/g, "'$1'");
    } else {
        formattedCode = formattedCode.replace(/'([^']*)'/g, '"$1"');
    }

    // Add/remove semicolons
    if (formatting.requireSemicolons) {
        formattedCode = formattedCode.replace(/}(?!\s*(?:else|catch|finally|while|[,;]|$))/g, '};');
        formattedCode = formattedCode.replace(/([^\s;{}])(?:\s*$|\n)/g, '$1;');
    }

    // Trim trailing whitespace
    if (formatting.trimTrailingWhitespace) {
        formattedCode = formattedCode.replace(/[ \t]+$/gm, '');
    }

    // Ensure final newline
    if (formatting.insertFinalNewline && !formattedCode.endsWith(formatting.lineEnding)) {
        formattedCode += formatting.lineEnding;
    }

    return formattedCode;
} 