const SpeechRecognitionModule = (function() {
    let recognition = null;
    let isListening = false;
    let isInitialized = false;
    let eventHandlers = {};
    let options = {
        continuous: true,
        interimResults: true,
        lang: 'en-US',
        maxAlternatives: 1,
        autoRestart: true,
        restartDelay: 100
    };

    function _debug(message) {
        console.log('[SpeechRecognition]', message);
    }

    function _triggerEvent(eventName, data) {
        if (eventHandlers[eventName]) {
            eventHandlers[eventName].forEach(handler => handler(data));
        }
    }

    function _initRecognition() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported in this browser');
            }

            recognition = new SpeechRecognition();
            recognition.continuous = options.continuous;
            recognition.interimResults = options.interimResults;
            recognition.lang = options.lang;
            recognition.maxAlternatives = options.maxAlternatives;

            recognition.onstart = () => {
                isListening = true;
                _debug('Recognition started');
                _triggerEvent('start');
            };

            recognition.onend = () => {
                isListening = false;
                _debug('Recognition ended');
                _triggerEvent('end');
                
                if (options.autoRestart) {
                    setTimeout(() => {
                        try {
                            recognition.start();
                            _debug('Auto-restarting recognition...');
                        } catch (e) {
                            _debug('Error auto-restarting: ' + e.message);
                        }
                    }, options.restartDelay);
                }
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                _triggerEvent('result', { transcript, event });
            };

            recognition.onerror = (event) => {
                _debug('Error: ' + event.error);
                _triggerEvent('error', { error: event.error });
            };

            isInitialized = true;
            return true;
        } catch (error) {
            _debug('Failed to initialize: ' + error.message);
            return false;
        }
    }

    return {
        init: function(customOptions = {}) {
            if (isInitialized) {
                _debug('Already initialized');
                return true;
            }

            options = { ...options, ...customOptions };
            return _initRecognition();
        },

        start: function() {
            if (!isInitialized) {
                _debug('Not initialized');
                return false;
            }

            if (isListening) {
                _debug('Already listening');
                return true;
            }

            try {
                recognition.start();
                return true;
            } catch (error) {
                _debug('Error starting: ' + error.message);
                return false;
            }
        },

        stop: function() {
            if (isInitialized && isListening) {
                try {
                    recognition.stop();
                    return true;
                } catch (error) {
                    _debug('Error stopping: ' + error.message);
                    return false;
                }
            }
            return false;
        },

        on: function(eventName, handler) {
            if (!eventHandlers[eventName]) {
                eventHandlers[eventName] = [];
            }
            eventHandlers[eventName].push(handler);
        },

        off: function(eventName, handler) {
            if (eventHandlers[eventName]) {
                eventHandlers[eventName] = eventHandlers[eventName].filter(h => h !== handler);
            }
        },

        isSupported: function() {
            return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        },

        isListening: function() {
            return isListening;
        }
    };
})(); 