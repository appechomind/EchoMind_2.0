export const codeAnalysisConfig = {
    // Style configuration
    style: {
        maxLineLength: 100,
        indentSize: 4,
        preferredQuotes: 'single',
        maxParameterCount: 3,
        maxNestedDepth: 3,
        maxFunctionLength: 20,
        requireSemicolons: true,
        spacingRules: {
            beforeBraces: true,
            afterCommas: true,
            aroundOperators: true
        },
        printWidth: 80,
        useTabs: false,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'always'
    },

    // Security configuration
    security: {
        forbiddenFunctions: [
            'eval',
            'Function',
            'setTimeout-with-string',
            'setInterval-with-string'
        ],
        forbiddenProperties: [
            'innerHTML',
            'outerHTML',
            '__proto__',
            'prototype'
        ],
        forbiddenPatterns: [
            /new\s+Function/,
            /document\.write/,
            /localStorage\./,
            /sessionStorage\./
        ],
        requireCSP: true,
        requireHTTPS: true,
        requireSRI: true,
        requireStrictMode: true,
        requireSafeRegex: true
    },

    // Complexity configuration
    complexity: {
        maxCyclomaticComplexity: 10,
        maxCognitiveComplexity: 15,
        maxParameters: 4,
        maxStatements: 20,
        maxNestedCallbacks: 2
    },

    // Suggestions configuration
    suggestions: {
        complexityThresholds: {
            cyclomaticComplexity: 5,
            nestedDepth: 3,
            parameterCount: 3
        },
        namingPatterns: {
            constants: /^[A-Z][A-Z0-9_]*$/,
            functions: /^[a-z][a-zA-Z0-9]*$/,
            classes: /^[A-Z][a-zA-Z0-9]*$/
        },
        checks: {
            unusedVariables: true,
            memoryLeaks: true,
            asyncAwait: true,
            modernSyntax: true,
            accessibility: true
        }
    },

    // Formatting configuration
    formatting: {
        lineEnding: '\n',
        indentChar: ' ',
        indentSize: 4,
        maxEmptyLines: 1,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        quoteStyle: 'single',
        requireSemicolons: true
    }
}; 