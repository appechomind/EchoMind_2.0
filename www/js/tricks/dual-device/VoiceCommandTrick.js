import Trick from '../../core/Trick.js';
import { ErrorHandler, UIUtils, AnimationUtils } from '../../core/utils.js';

class VoiceCommandTrick extends Trick {
    constructor() {
        super();
        this.displayName = 'Voice Commands';
        this.inputPlaceholder = 'Click the microphone to start voice commands...';
        this.recognition = null;
        this.isListening = false;
        this.commandHistory = [];
        this.maxHistorySize = 50;
    }

    onActivate() {
        this.initializeSpeechRecognition();
        this.commandHistory = [];
    }

    onDeactivate() {
        this.stopListening();
        this.commandHistory = [];
    }

    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            this.addMessage('error', 'Voice recognition is not supported in your browser.');
            return;
        }

        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.setupRecognitionHandlers();
    }

    setupRecognitionHandlers() {
        this.recognition.onstart = () => this.handleRecognitionStart();
        this.recognition.onend = () => this.handleRecognitionEnd();
        this.recognition.onresult = (event) => this.handleRecognitionResult(event);
        this.recognition.onerror = (event) => this.handleRecognitionError(event);
    }

    handleRecognitionStart() {
        this.isListening = true;
        this.updateUIForListening(true);
    }

    handleRecognitionEnd() {
        this.isListening = false;
        this.updateUIForListening(false);
    }

    handleRecognitionResult(event) {
        const transcript = event.results[0][0].transcript;
        this.processVoiceCommand(transcript);
    }

    handleRecognitionError(event) {
        const errorMessage = this.getErrorMessage(event.error);
        this.addMessage('error', errorMessage);
        this.stopListening();
    }

    getErrorMessage(error) {
        const errorMessages = {
            'no-speech': 'No speech was detected. Please try again.',
            'aborted': 'Speech recognition was aborted.',
            'audio-capture': 'No microphone was found. Please check your microphone settings.',
            'network': 'Network error occurred. Please check your connection.',
            'not-allowed': 'Microphone access was denied. Please allow microphone access.',
            'service-not-allowed': 'Speech recognition service is not allowed.',
            'bad-grammar': 'Speech recognition grammar error.',
            'language-not-supported': 'Language not supported.'
        };

        return errorMessages[error] || 'An error occurred with voice recognition. Please try again.';
    }

    updateUIForListening(isListening) {
        UIUtils.updateInputPlaceholder(
            this.elements.userInput,
            isListening ? 'Listening...' : this.inputPlaceholder
        );
        UIUtils.updateButtonText(
            this.elements.sendButton,
            isListening ? 'Stop' : 'Start'
        );
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    async processVoiceCommand(command) {
        this.addMessage('user', `Voice command: ${command}`);
        this.addToCommandHistory(command);
        
        try {
            const response = await this.handleCommand(command);
            this.addMessage('ai', response);
        } catch (error) {
            this.addMessage('error', ErrorHandler.handle(error));
        }
    }

    addToCommandHistory(command) {
        this.commandHistory.unshift(command);
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory.pop();
        }
    }

    async handleCommand(command) {
        // Implement specific command handling logic here
        return `I heard you say: "${command}"`;
    }
}

export default VoiceCommandTrick; 