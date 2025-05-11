/**
 * EchoMind Voice Commands Module
 * 
 * A module that processes speech input and detects commands.
 * Works with the EchoMind.Speech module to provide a complete
 * voice command system.
 */

// Create namespace if it doesn't exist
if (typeof window.EchoMind === 'undefined') {
    window.EchoMind = {};
}

// Commands Module
EchoMind.Commands = (function() {
    // Private variables
    let _initialized = false;
    let _commandMode = false;
    let _commands = [];
    let _eventHandlers = {};
    let _lastTriggerTime = 0;
    
    // Default options
    let _options = {
        triggerPhrase: 'hey echo',
        commandTimeoutMs: 10000, // 10 seconds
        debugMode: false,
        caseSensitive: false,
        allowFuzzyMatch: true,
        fuzzyMatchThreshold: 0.8 // 80% match required for fuzzy matching
    };
    
    // Private methods
    function _debug(message) {
        if (_options.debugMode) {
            console.log('[EchoMind Commands] ' + message);
        }
    }
    
    function _triggerEvent(eventName, data = {}) {
        if (_eventHandlers[eventName]) {
            _eventHandlers[eventName].forEach(handler => {
                try {
                    handler(data);
                } catch (e) {
                    console.error(`Error in ${eventName} event handler:`, e);
                }
            });
        }
    }
    
    function _activateCommandMode() {
        _commandMode = true;
        _lastTriggerTime = Date.now();
        _triggerEvent('commandModeActivated');
        
        // Set timeout to deactivate command mode
        setTimeout(() => {
            if (_commandMode) {
                _deactivateCommandMode();
                _triggerEvent('commandTimeout');
            }
        }, _options.commandTimeoutMs);
        
        _debug('Command mode activated');
    }
    
    function _deactivateCommandMode() {
        _commandMode = false;
        _triggerEvent('commandModeDeactivated');
        _debug('Command mode deactivated');
    }
    
    function _normalizeText(text) {
        return _options.caseSensitive ? text : text.toLowerCase();
    }
    
    function _exactMatch(text, pattern) {
        return _normalizeText(text) === _normalizeText(pattern);
    }
    
    function _containsMatch(text, pattern) {
        return _normalizeText(text).includes(_normalizeText(pattern));
    }
    
    function _fuzzyMatch(text, pattern) {
        // Simple Levenshtein distance implementation
        function levenshteinDistance(a, b) {
            const matrix = [];
            
            // Initialize the matrix
            for (let i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }
            
            for (let j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }
            
            // Fill the matrix
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        );
                    }
                }
            }
            
            return matrix[b.length][a.length];
        }
        
        // Calculate similarity as a value between 0 and 1
        const normalizedText = _normalizeText(text);
        const normalizedPattern = _normalizeText(pattern);
        
        const maxLength = Math.max(normalizedText.length, normalizedPattern.length);
        if (maxLength === 0) return 1.0; // Both strings are empty
        
        const distance = levenshteinDistance(normalizedText, normalizedPattern);
        const similarity = 1 - (distance / maxLength);
        
        return similarity >= _options.fuzzyMatchThreshold;
    }
    
    function _checkForTriggerPhrase(transcript) {
        if (_containsMatch(transcript, _options.triggerPhrase)) {
            _triggerEvent('triggerDetected', { phrase: _options.triggerPhrase });
            _activateCommandMode();
            return true;
        }
        return false;
    }
    
    function _findWildcardParameters(command, text) {
        // Process the command phrase to extract wildcard parameters
        const wildCardRegex = /\*/g;
        let wildCardPositions = [];
        let match;
        
        // Extract position of wildcards
        while ((match = wildCardRegex.exec(command.phrase)) !== null) {
            wildCardPositions.push(match.index);
        }
        
        if (wildCardPositions.length === 0) {
            return []; // No wildcards in this command
        }
        
        // Replace wildcards with regex capture groups
        const regexPattern = _normalizeText(command.phrase).replace(/\*/g, '(.+)');
        const regex = new RegExp(regexPattern);
        
        // Extract parameters from the text
        const matches = _normalizeText(text).match(regex);
        
        if (!matches) {
            return [];
        }
        
        // First element is the full match, rest are capture groups
        return matches.slice(1);
    }
    
    function _checkForCommands(transcript) {
        if (!_commandMode) {
            return;
        }
        
        for (const command of _commands) {
            const hasWildcards = command.phrase.includes('*');
            let isMatch = false;
            let params = [];
            
            if (hasWildcards) {
                // Handle wildcard matching
                const pattern = command.phrase.replace(/\*/g, '.*');
                const regexPattern = new RegExp(_normalizeText(pattern));
                
                if (regexPattern.test(_normalizeText(transcript))) {
                    isMatch = true;
                    params = _findWildcardParameters(command, transcript);
                }
            } else if (_options.allowFuzzyMatch) {
                // Check for fuzzy match
                isMatch = _fuzzyMatch(transcript, command.phrase);
            } else {
                // Check for exact or contains match
                isMatch = _containsMatch(transcript, command.phrase);
            }
            
            if (isMatch) {
                _debug(`Command matched: "${command.phrase}"`);
                
                _triggerEvent('commandDetected', {
                    phrase: command.phrase,
                    params: params
                });
                
                // Execute the command callback with the parameters
                if (typeof command.callback === 'function') {
                    command.callback.apply(null, params);
                }
                
                _deactivateCommandMode();
                return true;
            }
        }
        
        return false;
    }
    
    // Connect to speech recognition module
    function _connectToSpeechRecognition() {
        if (!EchoMind.Speech) {
            console.error('EchoMind.Speech module is required but not found!');
            return false;
        }
        
        EchoMind.Speech.on('onFinalResult', function(data) {
            const transcript = data.transcript;
            
            if (_commandMode) {
                _checkForCommands(transcript);
            } else {
                _checkForTriggerPhrase(transcript);
            }
        });
        
        return true;
    }
    
    // Public API
    return {
        /**
         * Initialize the commands module
         * @param {Object} options - Configuration options
         */
        init: function(options = {}) {
            if (_initialized) {
                console.warn('EchoMind.Commands is already initialized');
                return true;
            }
            
            // Merge options
            _options = { ..._options, ...options };
            
            // Initialize event handlers
            _eventHandlers = {
                commandModeActivated: [],
                commandModeDeactivated: [],
                commandDetected: [],
                triggerDetected: [],
                commandTimeout: []
            };
            
            _initialized = true;
            return _connectToSpeechRecognition();
        },
        
        /**
         * Register voice commands
         * @param {Array<{phrase: string, callback: Function}>} commands - Array of command objects
         * @returns {boolean} Success status
         */
        registerCommands: function(commands) {
            if (!_initialized) {
                console.error('Commands module must be initialized before registering commands');
                return false;
            }

            if (!Array.isArray(commands)) {
                console.error('Commands must be an array');
                return false;
            }

            try {
                commands.forEach(command => {
                    if (!command.phrase || typeof command.phrase !== 'string') {
                        throw new Error('Each command must have a phrase property of type string');
                    }
                    if (!command.callback || typeof command.callback !== 'function') {
                        throw new Error('Each command must have a callback property of type function');
                    }
                });

                // Add new commands to the existing ones
                _commands = _commands.concat(commands);
                _debug(`Registered ${commands.length} new commands`);
                return true;
            } catch (error) {
                console.error('Error registering commands:', error);
                return false;
            }
        },
        
        /**
         * Register a new command
         * @param {Object} command - Command configuration
         * @param {string} command.phrase - The command phrase to listen for
         * @param {Function} command.callback - Function to call when command is detected
         * @param {string} [command.description] - Optional description of the command
         * @returns {boolean} - Success status
         */
        registerCommand: function(command) {
            if (!_initialized) {
                console.error('EchoMind.Commands must be initialized before registering commands');
                return false;
            }
            
            if (!command.phrase || typeof command.phrase !== 'string') {
                console.error('Command must have a phrase property');
                return false;
            }
            
            if (!command.callback || typeof command.callback !== 'function') {
                console.error('Command must have a callback function');
                return false;
            }
            
            _commands.push({
                phrase: command.phrase,
                callback: command.callback,
                description: command.description || ''
            });
            
            _debug(`Registered command: "${command.phrase}"`);
            return true;
        },
        
        /**
         * Unregister a command by its phrase
         * @param {string} phrase - The phrase to unregister
         * @returns {boolean} - Success status
         */
        unregisterCommand: function(phrase) {
            const initialLength = _commands.length;
            _commands = _commands.filter(cmd => cmd.phrase !== phrase);
            
            const removed = initialLength > _commands.length;
            if (removed) {
                _debug(`Unregistered command: "${phrase}"`);
            }
            
            return removed;
        },
        
        /**
         * Get all registered commands
         * @returns {Array} - Array of command objects
         */
        getAllCommands: function() {
            return [..._commands];
        },
        
        /**
         * Check if command mode is active
         * @returns {boolean} - Command mode status
         */
        isCommandModeActive: function() {
            return _commandMode;
        },
        
        /**
         * Manually activate command mode
         */
        activateCommandMode: function() {
            _activateCommandMode();
        },
        
        /**
         * Manually deactivate command mode
         */
        deactivateCommandMode: function() {
            _deactivateCommandMode();
        },
        
        /**
         * Set a new trigger phrase
         * @param {string} phrase - The new trigger phrase
         */
        setTriggerPhrase: function(phrase) {
            if (typeof phrase === 'string' && phrase.trim() !== '') {
                _options.triggerPhrase = phrase.trim();
                _debug(`Trigger phrase changed to: "${_options.triggerPhrase}"`);
                return true;
            }
            return false;
        },
        
        /**
         * Update module options
         * @param {Object} options - New options
         */
        setOptions: function(options) {
            _options = { ..._options, ...options };
            _debug('Options updated');
        },
        
        /**
         * Add event listener
         * @param {string} eventName - Name of the event
         * @param {Function} callback - Event handler function
         */
        on: function(eventName, callback) {
            if (!_eventHandlers[eventName]) {
                _eventHandlers[eventName] = [];
            }
            _eventHandlers[eventName].push(callback);
        },
        
        /**
         * Remove event listener
         * @param {string} eventName - Name of the event
         * @param {Function} callback - Event handler function to remove
         */
        off: function(eventName, callback) {
            if (_eventHandlers[eventName]) {
                _eventHandlers[eventName] = _eventHandlers[eventName].filter(
                    handler => handler !== callback
                );
            }
        },
        
        /**
         * Process text input manually (for testing or alternative inputs)
         * @param {string} text - Text to process
         */
        processText: function(text) {
            if (_commandMode) {
                return _checkForCommands(text);
            } else {
                return _checkForTriggerPhrase(text);
            }
        },
        
        /**
         * Check if the module is initialized
         * @returns {boolean} Initialization status
         */
        isInitialized: function() {
            return _initialized;
        },
        
        /**
         * Reset the module state
         */
        reset: function() {
            _commandMode = false;
            _lastTriggerTime = 0;
            _debug('Commands module reset');
        }
    };
})(); 