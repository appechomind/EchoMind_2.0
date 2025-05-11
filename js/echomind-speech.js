// EchoMind Speech Handler (Classic JS, cross-platform)
(function() {
    function SpeechHandler(options) {
        options = options || {};
        this.options = {
            language: options.language || 'en-US',
            continuous: options.continuous !== false,
            interimResults: options.interimResults !== false,
            maxAlternatives: options.maxAlternatives || 1,
            onResult: options.onResult || function() {},
            onError: options.onError || console.error,
            onEnd: options.onEnd || function() {},
            debugMode: options.debugMode || false
        };
        this.recognition = null;
        this.isListening = false;
        this.initialized = false;
        this._restartTimeout = null;
        this._isRestarting = false;
    }

    SpeechHandler.prototype.initialize = function() {
        var self = this;
        if (this.initialized) {
            console.warn('Speech handler already initialized');
            return Promise.resolve(true);
        }
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            var error = new Error('Speech recognition not supported in this browser');
            this.options.onError(error);
            return Promise.resolve(false);
        }
        // Check microphone permission
        var micPromise = Promise.resolve(true);
        if (window.PermissionsHandler) {
            var permissions = window.PermissionsHandler.getInstance();
            micPromise = permissions.checkMicrophonePermission().then(function(hasPermission) {
                if (!hasPermission) {
                    return permissions.requestMicrophonePermission();
                }
                return hasPermission;
            });
        }
        return micPromise.then(function(granted) {
            if (!granted) {
                var error = new Error('Microphone permission denied');
                self.options.onError(error);
                return false;
            }
            // Initialize speech recognition
            var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            self.recognition = new SpeechRecognition();
            self.recognition.lang = self.options.language;
            self.recognition.continuous = self.options.continuous;
            self.recognition.interimResults = self.options.interimResults;
            self.recognition.maxAlternatives = self.options.maxAlternatives;
            // Add detailed event logging
            self.recognition.onstart = function() {
                self.isListening = true;
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onstart: Speech recognition started');
                }
            };
            self.recognition.onaudiostart = function(e) {
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onaudiostart', e);
                }
            };
            self.recognition.onsoundstart = function(e) {
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onsoundstart', e);
                }
            };
            self.recognition.onspeechstart = function(e) {
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onspeechstart', e);
                }
            };
            self.recognition.onaudioend = function(e) {
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onaudioend', e);
                }
            };
            self.recognition.onsoundend = function(e) {
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onsoundend', e);
                }
            };
            self.recognition.onspeechend = function(e) {
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onspeechend', e);
                }
            };
            self.recognition.onresult = function(event) {
                var last = event.results.length - 1;
                var transcript = event.results[last][0].transcript;
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onresult: Speech recognized:', transcript, event);
                }
                self.options.onResult(transcript.trim());
            };
            self.recognition.onerror = function(event) {
                if (self.options.debugMode) {
                    console.error('[SpeechHandler] onerror: Speech recognition error:', event.error, event);
                }
                self.options.onError(event);
            };
            self.recognition.onend = function() {
                self.isListening = false;
                if (self.options.debugMode) {
                    console.log('[SpeechHandler] onend: Speech recognition ended');
                }
                self.options.onEnd();
            };
            self.initialized = true;
            return true;
        });
    };

    SpeechHandler.prototype.start = function() {
        var self = this;
        if (!this.initialized) {
            return this.initialize().then(function(initialized) {
                if (!initialized) return false;
                return self._startRecognition();
            });
        }
        return this._startRecognition();
    };

    SpeechHandler.prototype._startRecognition = function() {
        try {
            this.recognition.start();
            this.isListening = true;
            if (this.options.debugMode) {
                console.log('Speech recognition started');
            }
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.options.onError(error);
            return false;
        }
    };

    SpeechHandler.prototype.stop = function() {
        if (!this.recognition) return false;
        try {
            this.recognition.stop();
            this.isListening = false;
            if (this.options.debugMode) {
                console.log('Speech recognition stopped');
            }
            return true;
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
            this.options.onError(error);
            return false;
        }
    };

    SpeechHandler.prototype.toggle = function() {
        if (this.isListening) {
            return this.stop();
        } else {
            return this.start();
        }
    };

    SpeechHandler.prototype.cleanup = function() {
        if (this.recognition) {
            this.stop();
            this.recognition = null;
            this.initialized = false;
        }
    };

    // Attach to window
    window.SpeechHandler = SpeechHandler;
})(); 