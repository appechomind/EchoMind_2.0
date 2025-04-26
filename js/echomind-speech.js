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
    let _permissionGranted = false;
    let _autoRestartTimeout = null;
    
    // Default options
    let _options = {
        continuous: true,
        interimResults: true,
        lang: 'en-US',
        maxAlternatives: 1,
        debugMode: false,
        autoRestart: true,
        autoRestartDelay: 300 // ms delay before restarting
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

    function _restartRecognition() {
        if (_options.autoRestart && _permissionGranted && !_isListening) {
            clearTimeout(_autoRestartTimeout);
            _autoRestartTimeout = setTimeout(() => {
                _debug('Auto-restarting recognition...');
                try {
                    _recognition.start();
                } catch (e) {
                    _debug('Error auto-restarting recognition: ' + e.message);
                }
            }, _options.autoRestartDelay);
        }
    }
    
    function _checkPermissions() {
        return navigator.permissions.query({ name: 'microphone' })
            .then(permissionStatus => {
                _permissionGranted = permissionStatus.state === 'granted';
                
                // Listen for permission changes
                permissionStatus.onchange = () => {
                    _permissionGranted = permissionStatus.state === 'granted';
                    if (!_permissionGranted) {
                        _triggerEvent('error', {
                            error: 'not-allowed',
                            message: 'Microphone permission denied'
                        });
                    }
                };
                
                return _permissionGranted;
            })
            .catch(() => {
                // Fallback to getUserMedia if permissions API not available
                return navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                        _permissionGranted = true;
                        return true;
                    })
                    .catch(() => {
                        _permissionGranted = false;
                        return false;
                    });
            });
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
                _restartRecognition();
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
                if (event.error === 'not-allowed') {
                    _permissionGranted = false;
                }
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
         * @returns {Promise<Boolean>} Success status
         */
        init: function(options = {}) {
            if (_initialized) {
                console.warn('EchoMind.Speech is already initialized');
                return Promise.resolve(true);
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
            
            // Check permissions first, then initialize recognition
            return _checkPermissions()
                .then(hasPermission => {
                    if (!hasPermission) {
                        _debug('Microphone permission not granted');
                        return false;
                    }
                    
                    const success = _initRecognition();
                    if (success) {
                        _initialized = true;
                        _debug('Speech recognition initialized successfully');
                    }
                    return success;
                });
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
         * @returns {Boolean} Success status
         */
        stop: function() {
            if (!_initialized || !_isListening) {
                return false;
            }
            
            try {
                clearTimeout(_autoRestartTimeout);
                _recognition.stop();
                _debug('Stopping recognition...');
                return true;
            } catch (error) {
                _debug('Error stopping recognition: ' + error.message);
                return false;
            }
        },
        
        /**
         * Check if speech recognition is currently active
         * @returns {Boolean} True if listening, false otherwise
         */
        isListening: function() {
            return _isListening;
        },
        
        /**
         * Check if speech recognition is supported in this browser
         * @returns {Boolean} True if supported, false otherwise
         */
        isSupported: function() {
            return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
        },
        
        /**
         * Register an event handler
         * @param {String} eventName - Name of the event to handle
         * @param {Function} handler - Event handler function
         */
        on: function(eventName, handler) {
            if (_eventHandlers[eventName]) {
                _eventHandlers[eventName].push(handler);
            }
        },
        
        /**
         * Unregister an event handler
         * @param {String} eventName - Name of the event
         * @param {Function} handler - Event handler function to remove
         */
        off: function(eventName, handler) {
            if (_eventHandlers[eventName]) {
                _eventHandlers[eventName] = _eventHandlers[eventName].filter(h => h !== handler);
            }
        }
    };
})(); 