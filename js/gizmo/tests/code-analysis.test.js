import CodeAnalysis from '../code-analysis.js';
import {
    calculateComplexity,
    checkStyle,
    checkSecurity,
    generateSuggestions,
    formatCode
} from '../utils/code-analysis.js';

describe('CodeAnalysis', () => {
    let codeAnalysis;

    beforeEach(() => {
        codeAnalysis = new CodeAnalysis();
    });

    describe('Code Analysis', () => {
        test('should analyze code successfully', async () => {
            const code = 'function test() { return true; }';
            const result = await codeAnalysis.analyzeCode(code);
            
            expect(result).toBeDefined();
            expect(result.complexity).toBeDefined();
            expect(result.style).toBeDefined();
            expect(result.security).toBeDefined();
            expect(result.suggestions).toBeDefined();
        });

        test('should handle empty code', async () => {
            const result = await codeAnalysis.analyzeCode('');
            expect(result.complexity.cyclomaticComplexity).toBe(0);
            expect(result.style).toHaveLength(0);
            expect(result.security).toHaveLength(0);
        });
    });

    describe('Code Generation', () => {
        test('should generate code from specification', async () => {
            const spec = {
                type: 'function',
                structure: {
                    name: 'testFunction',
                    params: ['a', 'b'],
                    returnType: 'number'
                }
            };
            const result = await codeAnalysis.generateCode(spec);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('Code Improvements', () => {
        test('should suggest improvements for given code', async () => {
            const code = `
                function poorlyNamedFunc(x) {
                    var y = x + 1;
                    return y;
                }
            `;
            const result = await codeAnalysis.suggestImprovements(code);
            expect(result.suggestions).toBeDefined();
            expect(Array.isArray(result.suggestions)).toBe(true);
            expect(result.suggestions.some(s => s.type === 'modernization')).toBe(true);
        });
    });
});

describe('Code Analysis Utilities', () => {
    describe('calculateComplexity', () => {
        test('should calculate complexity metrics correctly', () => {
            const code = `
                function test(a, b) {
                    if (a > b) {
                        while (a > 0) {
                            a--;
                        }
                    } else if (b > 0) {
                        return b;
                    }
                    return a;
                }
            `;
            const metrics = calculateComplexity(code);
            expect(metrics.cyclomaticComplexity).toBeGreaterThan(1);
            expect(metrics.nestedDepth).toBe(2);
            expect(metrics.parameterCount).toBe(2);
        });

        test('should handle empty input', () => {
            const metrics = calculateComplexity('');
            expect(metrics.cyclomaticComplexity).toBe(0);
            expect(metrics.nestedDepth).toBe(0);
            expect(metrics.parameterCount).toBe(0);
        });
    });

    describe('checkStyle', () => {
        test('should detect style violations', () => {
            const code = `
                function test(){
                   wrongIndent();
                   const str = "should be single quotes";
                }
            `;
            const violations = checkStyle(code);
            expect(violations.length).toBeGreaterThan(0);
            expect(violations.some(v => v.message.includes('indentation'))).toBe(true);
            expect(violations.some(v => v.message.includes('quotes'))).toBe(true);
        });
    });

    describe('checkSecurity', () => {
        test('should detect security issues', () => {
            const code = `
                function unsafe() {
                    eval("console.log('test')");
                    element.innerHTML = '<script>alert("XSS")</script>';
                }
            `;
            const issues = checkSecurity(code);
            expect(issues.length).toBeGreaterThan(0);
            expect(issues.some(i => i.type === 'forbidden_function')).toBe(true);
            expect(issues.some(i => i.type === 'forbidden_property')).toBe(true);
        });
    });

    describe('generateSuggestions', () => {
        test('should suggest improvements', () => {
            const code = `
                function complex(a, b, c, d, e) {
                    if (a > b) {
                        while (b > 0) {
                            if (c > d) {
                                if (d > e) {
                                    return e;
                                }
                            }
                            b--;
                        }
                    }
                    return a;
                }
            `;
            const suggestions = generateSuggestions(code);
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions.some(s => s.type === 'complexity')).toBe(true);
            expect(suggestions.some(s => s.type === 'parameters')).toBe(true);
        });
    });

    describe('formatCode', () => {
        test('should format code correctly', () => {
            const code = `
                function test(){
                if(true){
                    console.log("test")
                }
            }`;
            const formatted = formatCode(code);
            expect(formatted).toContain(';');
            expect(formatted).toContain('{\n');
            expect(formatted).toContain("'test'");
        });

        test('should handle indentation', () => {
            const code = `
            function test(){
            wrongIndent();
                correctIndent();
            }`;
            const formatted = formatCode(code);
            const lines = formatted.split('\n');
            expect(lines.some(line => line.startsWith(' '.repeat(4)))).toBe(true);
        });
    });
});

// Mock console.error to prevent test output pollution
global.console.error = jest.fn();

// Test data
const sampleCode = `
function complexFunction(a, b, c, d, e) {
    if (a > 0) {
        if (b > 0) {
            while (c > 0) {
                if (d > 0) {
                    return e;
                }
            }
        }
    }
    eval("console.log('test')");
    return null;
}
`;

const insecureCode = `
function unsafeOperation() {
    eval('console.log("Hello")');
    element.innerHTML = '<script>alert("XSS")</script>';
}
`;

const poorlyFormattedCode = `
function   messy(  x,y ){
if(x>y){return x;}
        else{
    return y;
    }
}
`;

// Test complexity calculation
console.log('Testing complexity calculation:');
const complexityMetrics = calculateComplexity(sampleCode);
console.assert(
    complexityMetrics.cyclomaticComplexity > 1,
    'Should detect multiple control structures'
);
console.assert(
    complexityMetrics.cognitiveComplexity > complexityMetrics.cyclomaticComplexity,
    'Cognitive complexity should be higher for nested structures'
);

// Test style checking
console.log('Testing style checking:');
const styleViolations = checkStyle(sampleCode);
console.assert(
    Array.isArray(styleViolations),
    'Should return array of style violations'
);

// Test suggestions generation
console.log('Testing suggestions generation:');
const suggestions = generateSuggestions(sampleCode);
console.assert(
    suggestions.some(s => s.type === 'complexity'),
    'Should suggest breaking down complex code'
);

// Test security checking
console.log('Testing security checking:');
const securityIssues = checkSecurity(insecureCode);
console.assert(
    securityIssues.some(i => i.type === 'forbidden-function'),
    'Should detect forbidden functions'
);
console.assert(
    securityIssues.some(i => i.type === 'forbidden-property'),
    'Should detect forbidden properties'
);

// Test code formatting
console.log('Testing code formatting:');
const formattedCode = formatCode(poorlyFormattedCode);
console.assert(
    formattedCode !== poorlyFormattedCode,
    'Should format poorly formatted code'
);
console.assert(
    !formattedCode.includes('  function'),
    'Should remove extra spaces between keywords'
);

console.log('All tests completed!'); 