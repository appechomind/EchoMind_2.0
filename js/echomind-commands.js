/**
 * EchoMind Commands Module
 * 
 * This module handles voice command registration and processing.
 * It provides fuzzy matching and command execution for magic tricks
 * and performances.
 */

// Create namespace if it doesn't exist
if (typeof window.EchoMind === 'undefined') {
    window.EchoMind = {};
}

// Commands Module
EchoMind.Commands = (function() {
    // Private variables
    let _initialized = false;
    let _commands = new Map();
    let _options = {
        fuzzyMatchThreshold: 0.8,
        debugMode: false,
        caseSensitive: false,
        allowPartialMatches: true
    };
    
    // Private methods
    function _debug(message) {
        if (_options.debugMode) {
            console.log('[EchoMind Commands] ' + message);
        }
    }
    
    function _fuzzyMatch(str1, str2) {
        if (!_options.caseSensitive) {
            str1 = str1.toLowerCase();
            str2 = str2.toLowerCase();
        }
        
        if (str1 === str2) return 1.0;
        if (str1.length < 2 || str2.length < 2) return 0.0;
        
        let len1 = str1.length;
        let len2 = str2.length;
        
        // Initialize the matrix of scores
        let matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
        
        // Initialize first row and column
        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;
        
        // Fill in the rest of the matrix
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                let cost = (str1[i-1] === str2[j-1]) ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i-1][j] + 1,      // deletion
                    matrix[i][j-1] + 1,      // insertion
                    matrix[i-1][j-1] + cost  // substitution
                );
            }
        }
        
        // Calculate similarity score
        let maxLen = Math.max(len1, len2);
        let similarity = (maxLen - matrix[len1][len2]) / maxLen;
        
        return similarity;
    }
    
    function _findBestMatch(input) {
        let bestMatch = null;
        let bestScore = -1;
        
        for (let [command, handler] of _commands.entries()) {
            let score = _fuzzyMatch(input, command);
            if (score > bestScore && score >= _options.fuzzyMatchThreshold) {
                bestScore = score;
                bestMatch = { command, handler, score };
            }
        }
        
        return bestMatch;
    }
    
    // Public API
    return {
        /**
         * Initialize the commands module
         * @param {Object} options - Configuration options
         * @returns {Boolean} Success status
         */
        init: function(options = {}) {
            if (_initialized) {
                console.warn('EchoMind.Commands is already initialized');
                return true;
            }
            
            // Merge options
            _options = { ..._options, ...options };
            
            // Clear any existing commands
            _commands.clear();
            
            _initialized = true;
            _debug('Commands module initialized');
            return true;
        },
        
        /**
         * Register a new command
         * @param {string} command - The command phrase to listen for
         * @param {Function} handler - The function to execute when command is recognized
         * @returns {Boolean} Success status
         */
        registerCommand: function(command, handler) {
            if (!_initialized) {
                console.error('EchoMind.Commands must be initialized before registering commands');
                return false;
            }
            
            if (typeof command !== 'string' || typeof handler !== 'function') {
                console.error('Invalid command or handler');
                return false;
            }
            
            _commands.set(command, handler);
            _debug(`Registered command: ${command}`);
            return true;
        },
        
        /**
         * Register multiple commands at once
         * @param {Object} commands - Object mapping command phrases to handler functions
         * @returns {Boolean} Success status
         */
        registerCommands: function(commands) {
            if (!_initialized) {
                console.error('EchoMind.Commands must be initialized before registering commands');
                return false;
            }
            
            if (typeof commands !== 'object') {
                console.error('Commands must be an object');
                return false;
            }
            
            let success = true;
            for (let [command, handler] of Object.entries(commands)) {
                if (!this.registerCommand(command, handler)) {
                    success = false;
                }
            }
            
            return success;
        },
        
        /**
         * Remove a registered command
         * @param {string} command - The command phrase to remove
         * @returns {Boolean} Success status
         */
        unregisterCommand: function(command) {
            if (!_initialized) return false;
            return _commands.delete(command);
        },
        
        /**
         * Process speech input and execute matching command
         * @param {string} input - The speech input to process
         * @returns {Object|null} Result object or null if no match found
         */
        processInput: function(input) {
            if (!_initialized || typeof input !== 'string') {
                return null;
            }
            
            let match = _findBestMatch(input);
            if (match) {
                _debug(`Found match for "${input}": "${match.command}" (score: ${match.score})`);
                try {
                    let result = match.handler(input);
                    return {
                        command: match.command,
                        score: match.score,
                        result: result
                    };
                } catch (error) {
                    console.error('Error executing command handler:', error);
                    return null;
                }
            }
            
            _debug(`No match found for "${input}"`);
            return null;
        },
        
        /**
         * Clear all registered commands
         */
        clearCommands: function() {
            if (_initialized) {
                _commands.clear();
                _debug('All commands cleared');
            }
        },
        
        /**
         * Get all registered commands
         * @returns {Array} Array of registered command phrases
         */
        getCommands: function() {
            return Array.from(_commands.keys());
        },
        
        /**
         * Check if a specific command is registered
         * @param {string} command - The command phrase to check
         * @returns {Boolean} Whether the command is registered
         */
        hasCommand: function(command) {
            return _commands.has(command);
        },
        
        /**
         * Check if the module is initialized
         * @returns {Boolean} Initialization status
         */
        isInitialized: function() {
            return _initialized;
        }
    };
})(); 