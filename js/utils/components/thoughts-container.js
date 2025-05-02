export class ThoughtsContainer {
    constructor(options = {}) {
        this.onThoughtClick = options.onThoughtClick || (() => {});
        this.maxHeight = options.maxHeight || '300px';
        this.container = null;
        this.list = null;
        this.thoughts = [];
    }

    render() {
        return `
            <div class="thoughts-container">
                <h3 class="thoughts-title">Your Thoughts</h3>
                <div class="thoughts-list"></div>
            </div>
        `;
    }

    initialize(parentElement) {
        this.container = parentElement.querySelector('.thoughts-container');
        this.list = parentElement.querySelector('.thoughts-list');
        this.updateDisplay();
    }

    addThought(thought, isInterim = false) {
        if (!thought) return;
        
        const thoughtObj = {
            text: thought,
            timestamp: new Date().toISOString(),
            isInterim
        };
        
        if (isInterim) {
            // Replace any existing interim thought
            const interimIndex = this.thoughts.findIndex(t => t.isInterim);
            if (interimIndex !== -1) {
                this.thoughts[interimIndex] = thoughtObj;
            } else {
                this.thoughts.push(thoughtObj);
            }
        } else {
            // Remove any interim thought
            this.thoughts = this.thoughts.filter(t => !t.isInterim);
            this.thoughts.push(thoughtObj);
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.list) return;
        
        this.list.innerHTML = this.thoughts.map(thought => `
            <div class="thought-item ${thought.isInterim ? 'interim' : ''}" 
                 data-timestamp="${thought.timestamp}">
                ${thought.text}
                ${thought.isInterim ? '<span class="interim-indicator">Listening...</span>' : ''}
            </div>
        `).join('');
        
        // Add click handlers
        this.list.querySelectorAll('.thought-item').forEach(item => {
            if (!item.classList.contains('interim')) {
                item.addEventListener('click', () => {
                    const thought = this.thoughts.find(t => 
                        t.timestamp === item.dataset.timestamp
                    );
                    if (thought) {
                        this.onThoughtClick(thought.text);
                    }
                });
            }
        });
        
        // Show container if there are thoughts
        if (this.thoughts.length > 0) {
            this.container.classList.add('visible');
        } else {
            this.container.classList.remove('visible');
        }
    }

    clear() {
        this.thoughts = [];
        this.updateDisplay();
    }

    cleanup() {
        this.clear();
        this.container = null;
        this.list = null;
    }
} 