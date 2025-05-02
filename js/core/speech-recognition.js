export class SpeechRecognitionManager {
    constructor(options = {}) {
        this.recognition = null;
        this.isListening = false;
        this.lastTranscript = '';
        this.transcriptHistory = [];
        this.currentTranscript = '';
        this.onResult = options.onResult || (() => {});
        this.onError = options.onError || (() => {});
        this.onEnd = options.onEnd || (() => {});
        this.onInterimResult = options.onInterimResult || (() => {});
        this.lang = options.lang || 'en-US';
        this.continuous = options.continuous !== false;
        this.interimResults = options.interimResults !== false;
        this.maxRetries = 3;
        this.retryCount = 0;
        this.retryTimeout = null;
        this.isSupported = this.checkSupport();
        this.errorHandlers = {
            'no-speech': () => this.handleNoSpeech(),
            'aborted': () => this.handleAborted(),
            'audio-capture': () => this.handleAudioCapture(),
            'network': () => this.handleNetwork(),
            'not-allowed': () => this.handleNotAllowed(),
            'service-not-allowed': () => this.handleServiceNotAllowed(),
            'bad-grammar': () => this.handleBadGrammar(),
            'language-not-supported': () => this.handleLanguageNotSupported()
        };
    }

    checkSupport() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return false;
        }
        return true;
    }

    initialize() {
        if (!this.isSupported) {
            throw new Error('Speech Recognition not supported in this browser');
        }

        if (this.recognition) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = this.continuous;
        this.recognition.interimResults = this.interimResults;
        this.recognition.lang = this.lang;

        // Debounce transcript updates
        let debounceTimeout;
        this.recognition.onresult = (event) => {
            const results = Array.from(event.results);
            const isFinal = results[results.length - 1].isFinal;
            
            // Get current transcript
            const transcript = results
                .map(result => result[0].transcript)
                .join('');

            // Handle interim results
            if (!isFinal) {
                this.currentTranscript = transcript;
                this.onInterimResult(transcript);
                return;
            }

            // Handle final result
            if (transcript !== this.lastTranscript) {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    this.lastTranscript = transcript;
                    this.currentTranscript = '';
                    this.transcriptHistory.push(transcript);
                    this.onResult(transcript);
                }, 100);
            }
        };

        this.recognition.onerror = (event) => {
            const handler = this.errorHandlers[event.error];
            if (handler) {
                handler();
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

    handleNoSpeech() {
        console.warn('No speech detected');
        this.onError('no-speech');
        this.retryIfListening();
    }

    handleAborted() {
        console.warn('Speech recognition aborted');
        this.onError('aborted');
        this.retryIfListening();
    }

    handleAudioCapture() {
        console.error('Audio capture failed');
        this.onError('audio-capture');
        this.stop();
    }

    handleNetwork() {
        console.error('Network error occurred');
        this.onError('network');
        this.retryIfListening();
    }

    handleNotAllowed() {
        console.error('Microphone access not allowed');
        this.onError('not-allowed');
        this.stop();
    }

    handleServiceNotAllowed() {
        console.error('Speech recognition service not allowed');
        this.onError('service-not-allowed');
        this.stop();
    }

    handleBadGrammar() {
        console.warn('Bad grammar in speech');
        this.onError('bad-grammar');
        this.retryIfListening();
    }

    handleLanguageNotSupported() {
        console.error('Language not supported');
        this.onError('language-not-supported');
        this.stop();
    }

    retryIfListening() {
        if (this.isListening && this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.retryTimeout = setTimeout(() => {
                this.recognition.start();
            }, 1000);
        } else {
            this.retryCount = 0;
            this.stop();
        }
    }

    handleRecognitionEnd() {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
        this.recognition.start();
    }

    start() {
        if (!this.isSupported) {
            this.onError('not-supported');
            return;
        }

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

    getTranscriptHistory() {
        return [...this.transcriptHistory];
    }

    getCurrentTranscript() {
        return this.currentTranscript;
    }

    getLastTranscript() {
        return this.lastTranscript;
    }

    clearTranscriptHistory() {
        this.transcriptHistory = [];
        this.lastTranscript = '';
        this.currentTranscript = '';
    }

    cleanup() {
        this.stop();
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
        this.recognition = null;
        this.isListening = false;
        this.lastTranscript = '';
        this.currentTranscript = '';
        this.transcriptHistory = [];
        this.retryCount = 0;
    }
} 