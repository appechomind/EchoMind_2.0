export class SpeechRecognitionManager {
    constructor(options = {}) {
        this.recognition = null;
        this.isListening = false;
        this.lastTranscript = '';
        this.onResult = options.onResult || (() => {});
        this.onError = options.onError || (() => {});
        this.onEnd = options.onEnd || (() => {});
        this.lang = options.lang || 'en-US';
        this.continuous = options.continuous !== false;
        this.interimResults = options.interimResults !== false;
        this.maxRetries = 3;
        this.retryCount = 0;
        this.retryTimeout = null;
    }

    initialize() {
        if (this.recognition) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error('Speech Recognition not supported in this browser');
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = this.continuous;
        this.recognition.interimResults = this.interimResults;
        this.recognition.lang = this.lang;

        // Debounce transcript updates
        let debounceTimeout;
        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            if (transcript !== this.lastTranscript) {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    this.lastTranscript = transcript;
                    this.onResult(transcript);
                }, 100);
            }
        };

        this.recognition.onerror = (event) => {
            if (event.error === 'no-speech' || event.error === 'aborted') {
                this.handleRecognitionError(event);
            } else {
                this.onError(event.error);
            }
        };

        this.recognition.onend = () => {
            this.onEnd();
            if (this.isListening) {
                this.handleRecognitionEnd();
            }
        };
    }

    handleRecognitionError(event) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.retryTimeout = setTimeout(() => {
                if (this.isListening) {
                    this.recognition.start();
                }
            }, 1000);
        } else {
            this.onError(event.error);
            this.retryCount = 0;
        }
    }

    handleRecognitionEnd() {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
        this.recognition.start();
    }

    start() {
        if (!this.recognition) {
            this.initialize();
        }

        try {
            this.recognition.start();
            this.isListening = true;
            this.retryCount = 0;
        } catch (e) {
            this.onError(e);
        }
    }

    stop() {
        if (this.recognition) {
            this.isListening = false;
            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout);
            }
            this.recognition.stop();
        }
    }

    toggle() {
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
    }

    setLanguage(lang) {
        this.lang = lang;
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }

    setContinuous(continuous) {
        this.continuous = continuous;
        if (this.recognition) {
            this.recognition.continuous = continuous;
        }
    }

    setInterimResults(interimResults) {
        this.interimResults = interimResults;
        if (this.recognition) {
            this.recognition.interimResults = interimResults;
        }
    }

    cleanup() {
        this.stop();
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
        this.recognition = null;
        this.isListening = false;
        this.lastTranscript = '';
        this.retryCount = 0;
    }
} 