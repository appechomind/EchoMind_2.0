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
        this.initializeSpeechRecognition();
    }

    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported');
            return;
        }

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
    }

    start() {
        if (!this.recognition) {
            console.error('Speech recognition not initialized');
            return;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            if (this.options.debugMode) {
                console.log('Speech recognition started');
            }
        } catch (error) {
            console.error('Error starting speech recognition:', error);
        }
    }

    stop() {
        if (!this.recognition) return;
        
        try {
            this.recognition.stop();
            this.isListening = false;
            if (this.options.debugMode) {
                console.log('Speech recognition stopped');
            }
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    }

    toggle() {
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
    }

    cleanup() {
        if (this.recognition) {
            this.stop();
            this.recognition = null;
        }
    }
}

// Initialize speech handler
const speechHandler = new SpeechHandler({
    debugMode: false,
    onResult: (transcript) => {
        // Handle speech results
        console.log('Speech result:', transcript);
    }
}); 