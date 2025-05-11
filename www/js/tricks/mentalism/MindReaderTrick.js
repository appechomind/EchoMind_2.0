import Trick from '../../core/Trick.js';
import { UIUtils, AnimationUtils } from '../../core/utils.js';

class MindReaderTrick extends Trick {
    constructor() {
        super();
        this.displayName = 'Mind Reader';
        this.inputPlaceholder = 'Think of something and I will try to read your mind...';
        this.cards = [];
        this.selectedCard = null;
        this.cardStates = new Map();
        this.animationDuration = 2000;
        this.recognition = null;
        this.isListening = false;
        this.startY = null;
        this.setupCompleted = false;
    }

    async onActivate() {
        await this.checkSetupStatus();
        this.initializeCards();
        this.displayCards();
        this.setupEventListeners();
    }

    onDeactivate() {
        this.clearCards();
        this.cardStates.clear();
        this.stopListening();
    }

    async checkSetupStatus() {
        const setupCompleted = localStorage.getItem('setup_completed') === 'true';
        const permissionGranted = localStorage.getItem('permission_granted') === 'true';

        if (setupCompleted && permissionGranted) {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
                if (permissionStatus.state === 'granted') {
                    this.setupCompleted = true;
                    this.startListening();
                    return;
                }
            } catch (e) {
                console.error('Error checking permission:', e);
            }
        }

        this.showSetupScreen();
    }

    showSetupScreen() {
        const setupScreen = document.createElement('div');
        setupScreen.id = 'setup-screen';
        setupScreen.innerHTML = `
            <div class="setup-content">
                <h2>Setup Required</h2>
                <p>To perform this trick, we need microphone access for voice commands.</p>
                <button id="setupBtn">Grant Permission</button>
            </div>
        `;
        document.body.appendChild(setupScreen);
        
        document.getElementById('setupBtn').addEventListener('click', () => this.beginSetup());
    }

    async beginSetup() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            
            localStorage.setItem('permission_granted', 'true');
            localStorage.setItem('setup_completed', 'true');
            
            document.getElementById('setup-screen').remove();
            this.setupCompleted = true;
            this.startListening();
        } catch (e) {
            console.error('Error during setup:', e);
            alert('Permission denied. Please allow microphone access to use this feature.');
        }
    }

    initializeCards() {
        this.cards = [
            { id: 1, name: 'Ace of Hearts', image: 'images/cards/ace-hearts.png' },
            { id: 2, name: 'King of Spades', image: 'images/cards/king-spades.png' },
            { id: 3, name: 'Queen of Diamonds', image: 'images/cards/queen-diamonds.png' },
            { id: 4, name: 'Jack of Clubs', image: 'images/cards/jack-clubs.png' },
            { id: 5, name: 'Ten of Hearts', image: 'images/cards/ten-hearts.png' }
        ];

        this.cards.forEach(card => {
            this.cardStates.set(card.id, {
                isSelected: false,
                isRevealed: false
            });
        });
    }

    displayCards() {
        const chatBox = this.elements.chatBox;
        chatBox.innerHTML = '';

        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        this.cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            cardContainer.appendChild(cardElement);
        });

        chatBox.appendChild(cardContainer);
    }

    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.cardId = card.id;
        
        const cardImage = document.createElement('img');
        cardImage.src = card.image;
        cardImage.alt = card.name;
        
        cardElement.appendChild(cardImage);
        cardElement.addEventListener('click', () => this.selectCard(card));
        cardElement.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        cardElement.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        return cardElement;
    }

    handleTouchStart(e) {
        this.startY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        if (!this.startY) return;
        
        const endY = e.changedTouches[0].clientY;
        const deltaY = endY - this.startY;
        
        if (Math.abs(deltaY) > 50) {
            const cardElement = e.target.closest('.card');
            if (cardElement) {
                const cardId = parseInt(cardElement.dataset.cardId);
                const card = this.cards.find(c => c.id === cardId);
                if (card) {
                    this.selectCard(card);
                }
            }
        }
        
        this.startY = null;
    }

    async selectCard(card) {
        if (this.selectedCard) return;

        this.selectedCard = card;
        this.cardStates.get(card.id).isSelected = true;
        
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        this.addMessage('user', `I'm thinking of the ${card.name}`);
        await this.performMindReading();
    }

    startListening() {
        if (!this.setupCompleted) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            this.processVoiceCommand(transcript);
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                this.recognition.start();
            }
        };

        try {
            this.recognition.start();
            this.isListening = true;
        } catch (e) {
            console.error('Error starting speech recognition:', e);
        }
    }

    stopListening() {
        if (this.recognition) {
            this.isListening = false;
            this.recognition.stop();
        }
    }

    processVoiceCommand(transcript) {
        const normalizedTranscript = transcript.toLowerCase();
        
        for (const card of this.cards) {
            const cardName = card.name.toLowerCase();
            if (normalizedTranscript.includes(cardName)) {
                this.selectCard(card);
                break;
            }
        }
    }

    async performMindReading() {
        if (!this.selectedCard) return;

        await AnimationUtils.delay(this.animationDuration);

        const response = `I sense... you're thinking of the ${this.selectedCard.name}!`;
        this.addMessage('ai', response);
        
        this.cardStates.get(this.selectedCard.id).isRevealed = true;
    }

    clearCards() {
        const chatBox = this.elements.chatBox;
        chatBox.innerHTML = '';
        this.selectedCard = null;
        this.stopListening();
    }

    async onProcessMessage(message) {
        return "Focus your thoughts and I will try to read your mind...";
    }
}

export default MindReaderTrick; 