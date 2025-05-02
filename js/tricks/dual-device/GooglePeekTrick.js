import Trick from '../../core/Trick.js';
import { UIUtils, AnimationUtils } from '../../core/utils.js';
import { SpeechRecognitionManager } from '../../core/speech-recognition.js';
import { SetupScreen } from '../../core/setup-screen.js';
import { GoogleSearchBox } from '../../utils/components/google-search-box.js';
import { ThoughtsContainer } from '../../utils/components/thoughts-container.js';
import './google-interface.css';

class GooglePeekTrick extends Trick {
    constructor() {
        super();
        this.displayName = 'Google Peek';
        this.inputPlaceholder = 'Search or speak your thoughts...';
        this.isPerformer = false;
        this.pairedDevice = null;
        this.searchHistory = [];
        this.searchTimeout = null;
        this.isOffline = false;
        this.analytics = {
            searches: 0,
            voiceSearches: 0,
            errors: 0,
            transcriptHistory: []
        };
        
        // Initialize components
        this.searchBox = new GoogleSearchBox({
            onSearch: (query) => this.handleSearch(query),
            onVoiceSearch: () => this.toggleVoiceSearch(),
            placeholder: this.inputPlaceholder
        });
        
        this.thoughtsContainer = new ThoughtsContainer({
            onThoughtClick: (thought) => this.handleSearch(thought)
        });
        
        // Initialize speech recognition with fallback
        this.speechManager = new SpeechRecognitionManager({
            onResult: (transcript) => this.handleVoiceSearch(transcript),
            onInterimResult: (transcript) => this.handleInterimResult(transcript),
            onError: (error) => this.handleSpeechError(error),
            onEnd: () => this.searchBox.updateVoiceButton(false)
        });
        
        // Initialize setup screen
        this.setupScreen = new SetupScreen({
            title: 'Google Peek Setup',
            description: 'To perform this trick, we need microphone access for voice search.',
            buttonText: 'Grant Permission',
            permissionType: 'microphone',
            setupKey: 'setup_completed',
            permissionKey: 'permission_granted',
            onSetupComplete: () => this.startListening()
        });

        // Check online status
        this.checkOnlineStatus();
        window.addEventListener('online', () => this.handleOnlineStatusChange(true));
        window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
    }

    async onActivate() {
        try {
            const isSetupComplete = await this.setupScreen.checkSetupStatus();
            if (!isSetupComplete) {
                this.setupScreen.show();
            } else {
                this.initializeGoogleInterface();
                this.startListening();
            }
        } catch (error) {
            this.handleError('Failed to activate trick', error);
        }
    }

    onDeactivate() {
        try {
            this.speechManager.cleanup();
            this.setupScreen.cleanup();
            this.searchBox.cleanup();
            this.thoughtsContainer.cleanup();
            this.cleanup();
        } catch (error) {
            this.handleError('Failed to deactivate trick', error);
        }
    }

    initializeGoogleInterface() {
        try {
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
                        ${this.isOffline ? '<div class="offline-notice">You are currently offline. Some features may be limited.</div>' : ''}
                    </div>
                </div>
            `;

            this.searchBox.initialize(chatBox);
            this.thoughtsContainer.initialize(chatBox);
        } catch (error) {
            this.handleError('Failed to initialize interface', error);
        }
    }

    startListening() {
        try {
            this.speechManager.start();
            this.searchBox.updateVoiceButton(true);
            this.analytics.voiceSearches++;
        } catch (error) {
            this.handleError('Failed to start listening', error);
        }
    }

    stopListening() {
        try {
            this.speechManager.stop();
            this.searchBox.updateVoiceButton(false);
        } catch (error) {
            this.handleError('Failed to stop listening', error);
        }
    }

    toggleVoiceSearch() {
        try {
            this.speechManager.toggle();
        } catch (error) {
            this.handleError('Failed to toggle voice search', error);
        }
    }

    handleInterimResult(transcript) {
        try {
            // Update search box with interim result
            this.searchBox.setValue(transcript);
            
            // Show interim result in thoughts container
            this.thoughtsContainer.addThought(transcript, true);
        } catch (error) {
            this.handleError('Failed to handle interim result', error);
        }
    }

    handleVoiceSearch(transcript) {
        try {
            // Store transcript in analytics
            this.analytics.transcriptHistory.push({
                transcript,
                timestamp: new Date().toISOString()
            });
            
            // Update search box with final transcript
            this.searchBox.setValue(transcript);
            
            // Clear interim thoughts
            this.thoughtsContainer.clear();
            
            // Handle the search
            this.handleSearch(transcript);
        } catch (error) {
            this.handleError('Failed to handle voice search', error);
        }
    }

    handleSpeechError(error) {
        this.analytics.errors++;
        console.error('Speech recognition error:', error);
        this.searchBox.updateVoiceButton(false);
        this.showError('Voice search is not available. Please try typing your search instead.');
    }

    handleSearch(query) {
        try {
            if (!query.trim()) return;

            this.analytics.searches++;
            
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            this.searchHistory.push(query);
            this.addMessage('user', `Searching for: ${query}`);
            
            this.searchTimeout = setTimeout(() => {
                const results = this.generateSearchResults(query);
                this.addMessage('ai', results);
            }, 1000);
        } catch (error) {
            this.handleError('Failed to handle search', error);
        }
    }

    generateSearchResults(query) {
        try {
            const isPerformer = this.isPerformer;
            return isPerformer ? 
                `I see you're thinking about "${query}"... Let me show you something interesting.` :
                `Here are the search results for "${query}":\n\n1. First result\n2. Second result\n3. Third result`;
        } catch (error) {
            this.handleError('Failed to generate search results', error);
            return 'Sorry, I encountered an error while generating results.';
        }
    }

    checkOnlineStatus() {
        this.isOffline = !navigator.onLine;
        if (this.isOffline) {
            this.showOfflineNotice();
        }
    }

    handleOnlineStatusChange(isOnline) {
        this.isOffline = !isOnline;
        if (this.isOffline) {
            this.showOfflineNotice();
        } else {
            this.hideOfflineNotice();
        }
    }

    showOfflineNotice() {
        const notice = document.createElement('div');
        notice.className = 'offline-notice';
        notice.textContent = 'You are currently offline. Some features may be limited.';
        document.querySelector('.google-interface .content').appendChild(notice);
    }

    hideOfflineNotice() {
        const notice = document.querySelector('.offline-notice');
        if (notice) {
            notice.remove();
        }
    }

    handleError(context, error) {
        this.analytics.errors++;
        console.error(`${context}:`, error);
        this.showError(`An error occurred: ${error.message}`);
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.querySelector('.google-interface .content').appendChild(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
    }

    cleanup() {
        try {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            const chatBox = this.elements.chatBox;
            chatBox.innerHTML = '';
            
            // Store analytics including transcript history
            localStorage.setItem('google_peek_analytics', JSON.stringify(this.analytics));
            
            // Clear transcript history
            this.speechManager.clearTranscriptHistory();
        } catch (error) {
            console.error('Failed to cleanup:', error);
        }
    }
}

export default GooglePeekTrick; 