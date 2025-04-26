/**
 * EchoMind Speech Recognition Module
 * 
 * This module handles speech recognition using the Web Speech API.
 * It provides an easy-to-use interface for capturing and processing
 * speech input for magic tricks and performances.
 */

// Create namespace if it doesn't exist
if (typeof window.EchoMind === 'undefined') {
    window.EchoMind = {};
}

// Speech Recognition Module
EchoMind.Speech = (function() {
    // Private variables
    let _recognition = null;
    let _isListening = false;
    let _initialized = false;
    let _eventHandlers = {};
    let _interimTranscript = '';
    let _finalTranscript = '';
    
    // Default options
    let _options = {
        continuous: true,
        interimResults: true,
        lang: 'en-US',
        maxAlternatives: 1,
        debugMode: false,
        autoRestart: true,
        restartDelay: 300
    };
    
    // Private methods
    function _debug(message) {
        if (_options.debugMode) {
            console.log('[EchoMind Speech] ' + message);
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
    
    function _initRecognition() {
        try {
            // Check if browser supports speech recognition
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                throw new Error('Speech recognition not supported in this browser.');
            }
            
            // Initialize the recognition object
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            _recognition = new SpeechRecognition();
            
            // Configure recognition settings
            _recognition.continuous = _options.continuous;
            _recognition.interimResults = _options.interimResults;
            _recognition.lang = _options.lang;
            _recognition.maxAlternatives = _options.maxAlternatives;
            
            // Set up event handlers for the recognition object
            _recognition.onstart = function(event) {
                _isListening = true;
                _debug('Recognition started');
                _triggerEvent('start', { event });
            };
            
            _recognition.onend = function(event) {
                _isListening = false;
                _debug('Recognition ended');
                _triggerEvent('end', { event });
                
                // Auto-restart recognition if enabled
                if (_options.autoRestart && _initialized) {
                    setTimeout(() => {
                        try {
                            _recognition.start();
                            _debug('Auto-restarting recognition...');
                        } catch (e) {
                            _debug('Error auto-restarting recognition: ' + e.message);
                        }
                    }, _options.restartDelay);
                }
            };
            
            _recognition.onresult = function(event) {
                _interimTranscript = '';
                _finalTranscript = '';
                
                // Process results
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        _finalTranscript += transcript;
                    } else {
                        _interimTranscript += transcript;
                    }
                }
                
                // Trigger appropriate events
                if (_finalTranscript) {
                    _debug('Final result: ' + _finalTranscript);
                    _triggerEvent('onFinalResult', { 
                        transcript: _finalTranscript,
                        confidence: event.results[event.resultIndex][0].confidence
                    });
                }
                
                if (_interimTranscript) {
                    _debug('Interim result: ' + _interimTranscript);
                    _triggerEvent('onInterimResult', { 
                        transcript: _interimTranscript 
                    });
                }
                
                // Also trigger the general result event
                _triggerEvent('result', {
                    results: event.results,
                    resultIndex: event.resultIndex,
                    finalTranscript: _finalTranscript,
                    interimTranscript: _interimTranscript
                });
            };
            
            _recognition.onerror = function(event) {
                _debug('Recognition error: ' + event.error);
                _triggerEvent('error', { 
                    error: event.error,
                    message: event.message || ''
                });
            };
            
            _recognition.onnomatch = function(event) {
                _debug('No match found');
                _triggerEvent('nomatch', { event });
            };
            
            _recognition.onsoundstart = function(event) {
                _debug('Sound detected');
                _triggerEvent('soundstart', { event });
            };
            
            _recognition.onsoundend = function(event) {
                _debug('Sound ended');
                _triggerEvent('soundend', { event });
            };
            
            _recognition.onspeechstart = function(event) {
                _debug('Speech started');
                _triggerEvent('speechstart', { event });
            };
            
            _recognition.onspeechend = function(event) {
                _debug('Speech ended');
                _triggerEvent('speechend', { event });
            };
            
            _initialized = true;
            _debug('Recognition initialized successfully');
            return true;
        } catch (error) {
            _debug('Failed to initialize recognition: ' + error.message);
            return false;
        }
    }
    
    // Public API
    return {
        /**
         * Initialize the speech recognition module
         * @param {Object} options - Configuration options
         * @returns {Boolean} Success status
         */
        init: function(options = {}) {
            if (_initialized) {
                console.warn('EchoMind.Speech is already initialized');
                return true;
            }
            
            // Merge options
            _options = { ..._options, ...options };
            
            // Initialize event handlers
            _eventHandlers = {
                start: [],
                end: [],
                result: [],
                onFinalResult: [],
                onInterimResult: [],
                error: [],
                nomatch: [],
                soundstart: [],
                soundend: [],
                speechstart: [],
                speechend: []
            };
            
            // Request microphone access (this helps ensure permissions are granted)
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function(stream) {
                    // We got microphone access, we can close it immediately
                    // This is just to trigger the permission dialog
                    stream.getTracks().forEach(track => track.stop());
                    _debug('Microphone access granted');
                })
                .catch(function(error) {
                    _debug('Microphone access denied: ' + error.message);
                    _triggerEvent('error', { 
                        error: 'microphone_access_denied',
                        message: error.message
                    });
                });
            
            return _initRecognition();
        },
        
        /**
         * Start listening for speech
         * @returns {Boolean} Success status
         */
        start: function() {
            if (!_initialized) {
                console.error('EchoMind.Speech must be initialized before starting');
                return false;
            }
            
            if (_isListening) {
                _debug('Already listening');
                return true;
            }
            
            try {
                _recognition.start();
                _debug('Starting recognition...');
                return true;
            } catch (error) {
                _debug('Error starting recognition: ' + error.message);
                return false;
            }
        },
        
        /**
         * Stop listening for speech
         */
        stop: function() {
            if (_initialized && _isListening) {
                try {
                    _recognition.stop();
                    _debug('Stopping recognition...');
                    return true;
                } catch (error) {
                    _debug('Error stopping recognition: ' + error.message);
                    return false;
                }
            }
            return false;
        },
        
        /**
         * Restart the speech recognition
         */
        restart: function() {
            this.stop();
            setTimeout(() => {
                this.start();
            }, 200);
        },
        
        /**
         * Check if speech recognition is supported
         * @returns {Boolean}
         */
        isSupported: function() {
            return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
        },
        
        /**
         * Check if currently listening
         * @returns {Boolean}
         */
        isListening: function() {
            return _isListening;
        },
        
        /**
         * Update module options
         * @param {Object} options - New options
         */
        updateOptions: function(options) {
            const wasListening = _isListening;
            
            // Stop if currently listening
            if (wasListening) {
                this.stop();
            }
            
            // Update options
            _options = { ..._options, ...options };
            
            // Update recognition settings if initialized
            if (_initialized) {
                _recognition.continuous = _options.continuous;
                _recognition.interimResults = _options.interimResults;
                _recognition.lang = _options.lang;
                _recognition.maxAlternatives = _options.maxAlternatives;
            }
            
            // Restart if was previously listening
            if (wasListening) {
                setTimeout(() => {
                    this.start();
                }, 200);
            }
            
            _debug('Options updated');
        },
        
        /**
         * Register an event handler
         * @param {String} eventName - Event name
         * @param {Function} handler - Handler function
         * @returns {Boolean} Success status
         */
        on: function(eventName, handler) {
            if (_eventHandlers[eventName] && typeof handler === 'function') {
                _eventHandlers[eventName].push(handler);
                return true;
            }
            return false;
        },
        
        /**
         * Unregister an event handler
         * @param {String} eventName - Event name
         * @param {Function} handler - Handler to remove
         * @returns {Boolean} Success status
         */
        off: function(eventName, handler) {
            if (_eventHandlers[eventName] && typeof handler === 'function') {
                _eventHandlers[eventName] = _eventHandlers[eventName].filter(h => h !== handler);
                return true;
            }
            return false;
        },
        
        /**
         * Get the latest final transcript
         * @returns {String}
         */
        getFinalTranscript: function() {
            return _finalTranscript;
        },
        
        /**
         * Get the latest interim transcript
         * @returns {String}
         */
        getInterimTranscript: function() {
            return _interimTranscript;
        }
    };
})();

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    EchoMind.Speech.init();
  }, 100);
}); 