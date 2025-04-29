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
    }

    onActivate() {
        this.initializeCards();
        this.displayCards();
    }

    onDeactivate() {
        this.clearCards();
        this.cardStates.clear();
    }

    initializeCards() {
        this.cards = [
            { id: 1, name: 'Ace of Hearts', image: 'images/cards/ace-hearts.png' },
            { id: 2, name: 'King of Spades', image: 'images/cards/king-spades.png' },
            { id: 3, name: 'Queen of Diamonds', image: 'images/cards/queen-diamonds.png' },
            { id: 4, name: 'Jack of Clubs', image: 'images/cards/jack-clubs.png' },
            { id: 5, name: 'Ten of Hearts', image: 'images/cards/ten-hearts.png' }
        ];

        // Initialize card states
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
        
        return cardElement;
    }

    async selectCard(card) {
        if (this.selectedCard) return;

        this.selectedCard = card;
        this.cardStates.get(card.id).isSelected = true;
        
        this.addMessage('user', `I'm thinking of the ${card.name}`);
        await this.performMindReading();
    }

    async performMindReading() {
        if (!this.selectedCard) return;

        // Add dramatic delay
        await AnimationUtils.delay(this.animationDuration);

        // Perform the "mind reading"
        const response = `I sense... you're thinking of the ${this.selectedCard.name}!`;
        this.addMessage('ai', response);
        
        // Mark card as revealed
        this.cardStates.get(this.selectedCard.id).isRevealed = true;
    }

    clearCards() {
        const chatBox = this.elements.chatBox;
        chatBox.innerHTML = '';
        this.selectedCard = null;
    }

    async onProcessMessage(message) {
        return "Focus your thoughts and I will try to read your mind...";
    }
}

export default MindReaderTrick; 