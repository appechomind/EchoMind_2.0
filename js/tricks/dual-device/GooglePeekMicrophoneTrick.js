import Trick from '../../core/Trick.js';
import { UIUtils, AnimationUtils } from '../../core/utils.js';
import { SpeechRecognitionManager } from '../../core/speech-recognition.js';
import { SetupScreen } from '../../core/setup-screen.js';
import { GoogleSearchBox } from '../../utils/components/google-search-box.js';
import { ThoughtsContainer } from '../../utils/components/thoughts-container.js';
import './google-interface.css';

class GooglePeekMicrophoneTrick extends Trick {
    constructor() {
        super();
        this.displayName = 'Google Peek (Microphone)';
        this.inputPlaceholder = 'Search or speak your thoughts...';
        
        // Initialize components
        this.searchBox = new GoogleSearchBox({
            onSearch: (query) => this.handleSearch(query),
            onVoiceSearch: () => this.toggleVoiceSearch(),
            placeholder: this.inputPlaceholder
        });
        
        this.thoughtsContainer = new ThoughtsContainer({
            onThoughtClick: (thought) => this.handleSearch(thought)
        });
        
        // Initialize speech recognition
        this.speechManager = new SpeechRecognitionManager({
            onResult: (transcript) => this.handleThought(transcript),
            onError: (error) => console.error('Speech recognition error:', error),
            onEnd: () => this.searchBox.updateVoiceButton(false)
        });
        
        // Initialize setup screen
        this.setupScreen = new SetupScreen({
            title: 'Mind Reading Setup',
            description: 'To perform this mind reading trick, we need microphone access to hear your thoughts.\nDon\'t worry - your thoughts are completely private and won\'t be stored.',
            buttonText: 'Enable Mind Reading',
            permissionType: 'microphone',
            setupKey: 'mic_setup_completed',
            permissionKey: 'mic_permission_granted',
            onSetupComplete: () => this.startListening()
        });
    }

    async onActivate() {
        const isSetupComplete = await this.setupScreen.checkSetupStatus();
        if (!isSetupComplete) {
            this.setupScreen.show();
        } else {
            this.initializeGoogleInterface();
            this.startListening();
        }
    }

    onDeactivate() {
        this.speechManager.cleanup();
        this.setupScreen.cleanup();
        this.searchBox.cleanup();
        this.thoughtsContainer.cleanup();
        this.cleanup();
    }

    initializeGoogleInterface() {
        const chatBox = this.elements.chatBox;
        chatBox.innerHTML = `
            <div class="google-interface">
                <div class="header">
                    <div class="header-right">
                        <a href="#">Gmail</a>
                        <a href="#">Images</a>
                    </div>
                </div>
                <div class="content">
                    <div class="logo">
                        <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google">
                    </div>
                    ${this.searchBox.render()}
                    ${this.thoughtsContainer.render()}
                </div>
            </div>
        `;

        // Initialize components
        this.searchBox.initialize(chatBox);
        this.thoughtsContainer.initialize(chatBox);
    }

    startListening() {
        try {
            this.speechManager.start();
            this.searchBox.updateVoiceButton(true);
        } catch (e) {
            console.error('Error starting speech recognition:', e);
        }
    }

    stopListening() {
        this.speechManager.stop();
        this.searchBox.updateVoiceButton(false);
    }

    toggleVoiceSearch() {
        this.speechManager.toggle();
    }

    handleThought(thought) {
        if (!thought.trim()) return;

        this.thoughtsContainer.addThought(thought);

        // Add a slight delay before showing the thought
        setTimeout(() => {
            this.addMessage('ai', `I see you're thinking about "${thought}"...`);
        }, 1000);
    }

    handleSearch(query) {
        if (!query.trim()) return;

        this.addMessage('user', `Searching for: ${query}`);
        
        // Simulate search results
        setTimeout(() => {
            const results = this.generateSearchResults(query);
            this.addMessage('ai', results);
        }, 1000);
    }

    generateSearchResults(query) {
        return `Here are the search results for "${query}":\n\n1. First result\n2. Second result\n3. Third result`;
    }

    cleanup() {
        const chatBox = this.elements.chatBox;
        chatBox.innerHTML = '';
    }
}

export default GooglePeekMicrophoneTrick; 