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
    let _autoRestartTimeout = null;
    
    // Default options
    let _options = {
        continuous: true,
        interimResults: true,
        lang: 'en-US',
        maxAlternatives: 1,
        debugMode: false,
        autoRestart: true,
        autoRestartDelay: 300, // ms delay before restarting
        keepAlive: true
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
        if (_options.autoRestart && !_isListening && EchoMind.Permissions.isGranted()) {
            clearTimeout(_autoRestartTimeout);
            _autoRestartTimeout = setTimeout(() => {
                _debug('Auto-restarting recognition...');
                try {
                    _recognition.start();
                    _isListening = true;
                } catch (e) {
                    _debug('Error auto-restarting recognition: ' + e.message);
                    _isListening = false;
                }
            }, _options.autoRestartDelay);
        }
    }
    
    function _initRecognition() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                _debug('Speech Recognition not supported');
                return false;
            }
            
            _recognition = new SpeechRecognition();
            
            // Configure recognition
            _recognition.continuous = _options.continuous;
            _recognition.interimResults = _options.interimResults;
            _recognition.maxAlternatives = _options.maxAlternatives;
            _recognition.lang = _options.lang;
            
            // Set up handlers
            _recognition.onstart = function() {
                _debug('Recognition started');
                _isListening = true;
                _triggerEvent('start');
            };
            
            _recognition.onend = function() {
                _debug('Recognition ended');
                _isListening = false;
                _triggerEvent('end');
                
                // Only auto-restart if we have permission
                if (_options.autoRestart && EchoMind.Permissions.isGranted()) {
                    _restartRecognition();
                }
            };
            
            _recognition.onresult = function(event) {
                // Only process results if we have permission
                if (!EchoMind.Permissions.isGranted()) {
                    _debug('No permission, ignoring results');
                    return;
                }

                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                if (interimTranscript !== _interimTranscript) {
                    _interimTranscript = interimTranscript;
                    _triggerEvent('onInterimResult', { transcript: _interimTranscript });
                }
                
                if (finalTranscript !== _finalTranscript) {
                    _finalTranscript = finalTranscript;
                    _triggerEvent('onFinalResult', { transcript: _finalTranscript });
                }
                
                _triggerEvent('result', {
                    interimTranscript: _interimTranscript,
                    finalTranscript: _finalTranscript
                });
            };
            
            _recognition.onerror = function(event) {
                _debug('Recognition error: ' + event.error);
                _isListening = false;

                if (event.error === 'not-allowed') {
                    // Let the permissions handler handle it
                    EchoMind.Permissions.requestPermission();
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
            
            // Initialize recognition
            const success = _initRecognition();
            if (success) {
                _initialized = true;
                _debug('Speech recognition initialized successfully');
            }
            return Promise.resolve(success);
        },
        
        start: function() {
            if (!_initialized) {
                _debug('Speech recognition not initialized');
                return false;
            }
            
            if (!EchoMind.Permissions.isGranted()) {
                _debug('No microphone permission, requesting...');
                return EchoMind.Permissions.requestPermission()
                    .then(granted => {
                        if (granted) {
                            try {
                                _recognition.start();
                                _isListening = true;
                                return true;
                            } catch (e) {
                                _debug('Error starting recognition: ' + e.message);
                                _isListening = false;
                                return false;
                            }
                        }
                        return false;
                    });
            }
            
            try {
                _recognition.start();
                _isListening = true;
                return Promise.resolve(true);
            } catch (e) {
                _debug('Error starting recognition: ' + e.message);
                _isListening = false;
                return Promise.resolve(false);
            }
        },
        
        stop: function() {
            if (_initialized && _isListening) {
                try {
                    _recognition.stop();
                    _isListening = false;
                    return true;
                } catch (e) {
                    _debug('Error stopping recognition: ' + e.message);
                    return false;
                }
            }
            return false;
        },
        
        on: function(eventName, callback) {
            if (_eventHandlers[eventName]) {
                _eventHandlers[eventName].push(callback);
                return true;
            }
            return false;
        },
        
        off: function(eventName, callback) {
            if (_eventHandlers[eventName]) {
                _eventHandlers[eventName] = _eventHandlers[eventName]
                    .filter(handler => handler !== callback);
                return true;
            }
            return false;
        },
        
        get isListening() {
            return _isListening;
        },
        
        get isInitialized() {
            return _initialized;
        }
    };
})();

// Export to global scope
window.EchoMindSpeech = EchoMind.Speech; 