import { PermissionsManager } from './permissions-manager.js';

export class SetupScreen {
    constructor(options = {}) {
        this.title = options.title || 'Setup Required';
        this.description = options.description || 'This feature requires additional permissions.';
        this.buttonText = options.buttonText || 'Enable';
        this.onSetupComplete = options.onSetupComplete || (() => {});
        this.onSetupError = options.onSetupError || (() => {});
        this.setupScreen = null;
        this.setupBtn = null;
        this.isSettingUp = false;
        this.errorMessage = null;

        // Initialize permissions manager
        this.permissionsManager = new PermissionsManager({
            debugMode: options.debugMode || false
        });

        // Listen for permission changes
        this.permissionsManager.addEventListener(event => {
            if (event.type === 'permission_granted') {
                this.handleSetupComplete();
            } else if (event.type === 'permission_error') {
                this.handleSetupError(event.error);
            }
        });
    }

    show() {
        if (this.setupScreen) return;

        this.setupScreen = document.createElement('div');
        this.setupScreen.id = 'setup-screen';
        this.setupScreen.innerHTML = `
            <div class="setup-content">
                <h2>${this.title}</h2>
                <p>${this.description}</p>
                <div class="setup-status"></div>
                <button id="setupBtn" ${this.isSettingUp ? 'disabled' : ''}>${this.buttonText}</button>
                ${this.errorMessage ? `<div class="error-message">${this.errorMessage}</div>` : ''}
            </div>
        `;
        document.body.appendChild(this.setupScreen);
        
        this.setupBtn = document.getElementById('setupBtn');
        this.setupBtn.addEventListener('click', () => this.beginSetup());
    }

    async beginSetup() {
        if (this.isSettingUp) return;
        this.isSettingUp = true;
        
        if (this.setupBtn) {
            this.setupBtn.disabled = true;
            this.setupBtn.textContent = 'Setting up...';
        }

        try {
            const granted = await this.permissionsManager.requestPermission();
            if (granted) {
                this.handleSetupComplete();
            }
        } catch (error) {
            this.handleSetupError(error);
        } finally {
            this.isSettingUp = false;
        }
    }

    handleSetupComplete() {
        // Remove setup screen
        this.cleanup();
        
        // Call completion handler
        this.onSetupComplete();
    }

    handleSetupError(error) {
        console.error('Error during setup:', error);
        
        let errorMessage = 'An error occurred during setup. ';
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Microphone access was denied. Please grant permission to continue.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else {
            errorMessage = 'An unexpected error occurred. Please try again.';
        }

        this.errorMessage = errorMessage;
        this.updateErrorDisplay();
        this.onSetupError(error);

        if (this.setupBtn) {
            this.setupBtn.disabled = false;
            this.setupBtn.textContent = this.buttonText;
        }
    }

    updateErrorDisplay() {
        if (!this.setupScreen) return;
        
        const errorElement = this.setupScreen.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = this.errorMessage;
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = this.errorMessage;
            this.setupScreen.querySelector('.setup-content').appendChild(errorDiv);
        }
    }

    async checkSetupStatus() {
        return await this.permissionsManager.checkPermissionStatus();
    }

    cleanup() {
        if (this.setupScreen) {
            this.setupScreen.remove();
            this.setupScreen = null;
            this.setupBtn = null;
            this.errorMessage = null;
        }
        this.permissionsManager.cleanup();
    }
} 