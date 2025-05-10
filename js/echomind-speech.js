class SpeechHandler {
    constructor(options = {}) {
        this.options = {
            language: options.language || 'en-US',
            continuous: options.continuous !== false,
            interimResults: options.interimResults !== false,
            onResult: options.onResult || (() => {}),
            onError: options.onError || console.error,
            onEnd: options.onEnd || (() => {}),
            debugMode: options.debugMode || false
        };

        this.recognition = null;
        this.isListening = false;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            console.warn('Speech handler already initialized');
            return true;
        }

        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            const error = new Error('Speech recognition not supported in this browser');
            this.options.onError(error);
            return false;
        }

        // Check microphone permission
        if (window.permissions) {
            const hasPermission = await window.permissions.checkMicrophonePermission();
            if (!hasPermission) {
                const granted = await window.permissions.requestMicrophonePermission();
                if (!granted) {
                    const error = new Error('Microphone permission denied');
                    this.options.onError(error);
                    return false;
                }
            }
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        this.recognition.lang = this.options.language;
        this.recognition.continuous = this.options.continuous;
        this.recognition.interimResults = this.options.interimResults;

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript;
            
            if (this.options.debugMode) {
                console.log('Speech recognized:', transcript);
            }
            
            this.options.onResult(transcript.trim());
        };

        this.recognition.onerror = (event) => {
            if (this.options.debugMode) {
                console.error('Speech recognition error:', event.error);
            }
            this.options.onError(event);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.options.debugMode) {
                console.log('Speech recognition ended');
            }
            this.options.onEnd();
            
            // Restart if continuous mode is enabled
            if (this.options.continuous && this.isListening) {
                this.start();
            }
        };

        this.initialized = true;
        return true;
    }

    async start() {
        if (!this.initialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                return false;
            }
        }

        if (!this.recognition) {
            console.error('Speech recognition not initialized');
            return false;
        }

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
    }

    stop() {
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
    }

    toggle() {
        if (this.isListening) {
            return this.stop();
        } else {
            return this.start();
        }
    }

    cleanup() {
        if (this.recognition) {
            this.stop();
            this.recognition = null;
            this.initialized = false;
        }
    }
}

// Export the SpeechHandler class
export { SpeechHandler }; 