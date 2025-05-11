module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // File patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js'
  ],

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],

  // Module name mapper for CSS and asset imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/fileMock.js'
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },

  // Ignore patterns
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ],

  // Verbose output
  verbose: true,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Global configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,

  // Fail on console errors/warnings
  errorOnDeprecated: true,

  // Notify mode
  notify: true,
  notifyMode: 'failure-change',

  // Bail configuration
  bail: 1,

  // Cache configuration
  cacheDirectory: '.jest-cache',

  // Display configuration
  displayName: {
    name: 'EchoMind',
    color: 'magenta'
  }
}; 