export class UIUtils {
    static updateInputPlaceholder(input, placeholder) {
        if (input) input.placeholder = placeholder;
    }

    static updateButtonText(button, text) {
        if (button) button.textContent = text;
    }

    static toggleElementDisabled(element, disabled) {
        if (element) element.disabled = disabled;
    }

    static createMessageElement(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `<b>${type === 'user' ? 'You' : 'EchoMind'}:</b> ${content}`;
        return messageDiv;
    }

    static scrollToBottom(element) {
        if (element) element.scrollTop = element.scrollHeight;
    }
}

export class ErrorHandler {
    static handle(error, fallbackMessage = 'An error occurred. Please try again.') {
        console.error('Error:', error);
        return fallbackMessage;
    }
}

export class AnimationUtils {
    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
} 