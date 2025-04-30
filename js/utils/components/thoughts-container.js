export class ThoughtsContainer {
    constructor(options = {}) {
        this.options = {
            onThoughtClick: options.onThoughtClick || (() => {}),
            maxHeight: options.maxHeight || '300px'
        };
        
        this.thoughts = [];
        this.elements = {
            container: null,
            list: null
        };
    }

    render() {
        return `
            <div class="thoughts-container" style="display: none;">
                <div class="thoughts-title">Your Thoughts</div>
                <div class="thoughts-list" style="max-height: ${this.options.maxHeight}"></div>
            </div>
        `;
    }

    initialize(container) {
        this.elements.container = container.querySelector('.thoughts-container');
        this.elements.list = container.querySelector('.thoughts-list');
    }

    addThought(thought) {
        if (!thought.trim()) return;

        this.thoughts.push(thought);
        this.updateDisplay();

        // Show the container after first thought
        if (this.elements.container) {
            this.elements.container.style.display = 'block';
        }
    }

    updateDisplay() {
        if (!this.elements.list) return;

        this.elements.list.innerHTML = this.thoughts
            .map(thought => `
                <div class="thought-item" data-thought="${thought}">
                    ${thought}
                </div>
            `)
            .join('');

        // Add click handlers
        const items = this.elements.list.querySelectorAll('.thought-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const thought = item.dataset.thought;
                this.options.onThoughtClick(thought);
            });
        });
    }

    clear() {
        this.thoughts = [];
        if (this.elements.list) {
            this.elements.list.innerHTML = '';
        }
        if (this.elements.container) {
            this.elements.container.style.display = 'none';
        }
    }

    cleanup() {
        this.clear();
        this.elements = {
            container: null,
            list: null
        };
    }
} 