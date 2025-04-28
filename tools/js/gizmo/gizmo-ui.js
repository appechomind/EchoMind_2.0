class GizmoUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.uploadButton = document.getElementById('uploadImage');
        this.galleryGrid = document.getElementById('galleryGrid');
        
        this.setupEventListeners();
        this.loadGallery();
    }

    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.handleSendMessage());

        // Send message on Enter (but allow Shift+Enter for new lines)
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Handle image upload
        this.uploadButton.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => this.handleImageUpload(e.target.files[0]);
            input.click();
        });
    }

    async handleSendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Process message with AI
        const response = await gizmoAI.processMessage(message);
        this.addMessage(response.text, 'ai');
    }

    async handleImageUpload(file) {
        if (!file) return;

        // Show upload preview
        this.addMessage(`Uploading image: ${file.name}...`, 'user', file);

        // Process image with AI
        const response = await gizmoAI.processMessage('', file);
        this.addMessage(response.text, 'ai');

        // Refresh gallery
        this.loadGallery();
    }

    addMessage(text, sender, image = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Add text content
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        messageDiv.appendChild(textSpan);

        // Add image if provided
        if (image) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(image);
            messageDiv.appendChild(img);
        }

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    loadGallery() {
        const images = gizmoAI.getImageGallery();
        this.galleryGrid.innerHTML = '';

        images.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = 'Gallery Image';
            
            item.appendChild(img);
            this.galleryGrid.appendChild(item);

            // Add click handler to show full analysis
            item.addEventListener('click', () => {
                this.addMessage(`Image Analysis from ${new Date(image.timestamp).toLocaleString()}:\n${image.analysis}`, 'ai');
            });
        });
    }
}

// Initialize Gizmo UI
document.addEventListener('DOMContentLoaded', () => {
    const ui = new GizmoUI();
}); 