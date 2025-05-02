export class SetupScreen {
    constructor(options = {}) {
        this.title = options.title || 'Setup Required';
        this.description = options.description || 'This feature requires additional permissions.';
        this.buttonText = options.buttonText || 'Enable';
        this.onSetupComplete = options.onSetupComplete || (() => {});
        this.onSetupError = options.onSetupError || (() => {});
        this.permissionType = options.permissionType || 'microphone';
        this.setupKey = options.setupKey || 'setup_completed';
        this.permissionKey = options.permissionKey || 'permission_granted';
        this.setupScreen = null;
        this.setupBtn = null;
        this.isSettingUp = false;
        this.errorMessage = null;
        this.retryCount = 0;
        this.maxRetries = 3;
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
            const constraints = this.getMediaConstraints();
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Stop all tracks immediately
            stream.getTracks().forEach(track => track.stop());
            
            // Store setup status
            this.storeSetupStatus();
            
            // Remove setup screen
            this.cleanup();
            
            // Call completion handler
            this.onSetupComplete();
        } catch (error) {
            this.handleSetupError(error);
        } finally {
            this.isSettingUp = false;
        }
    }

    handleSetupError(error) {
        console.error('Error during setup:', error);
        this.retryCount++;
        
        let errorMessage = 'An error occurred during setup. ';
        if (this.retryCount < this.maxRetries) {
            errorMessage += `Retrying... (${this.retryCount}/${this.maxRetries})`;
            setTimeout(() => this.beginSetup(), 1000);
        } else {
            errorMessage += 'Please try again later.';
            if (this.setupBtn) {
                this.setupBtn.disabled = false;
                this.setupBtn.textContent = this.buttonText;
            }
        }

        this.errorMessage = errorMessage;
        this.updateErrorDisplay();
        this.onSetupError(error);
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

    getMediaConstraints() {
        switch (this.permissionType) {
            case 'microphone':
                return { audio: true };
            case 'camera':
                return { video: true };
            case 'both':
                return { audio: true, video: true };
            default:
                throw new Error('Unsupported permission type');
        }
    }

    storeSetupStatus() {
        try {
            localStorage.setItem(this.permissionKey, 'true');
            localStorage.setItem(this.setupKey, 'true');
        } catch (error) {
            console.error('Failed to store setup status:', error);
        }
    }

    async checkSetupStatus() {
        try {
            const setupCompleted = localStorage.getItem(this.setupKey) === 'true';
            const permissionGranted = localStorage.getItem(this.permissionKey) === 'true';

            if (setupCompleted && permissionGranted) {
                try {
                    const permissionStatus = await navigator.permissions.query({ name: this.permissionType });
                    return permissionStatus.state === 'granted';
                } catch (e) {
                    console.error('Error checking permission:', e);
                    return false;
                }
            }

            return false;
        } catch (error) {
            console.error('Error checking setup status:', error);
            return false;
        }
    }

    cleanup() {
        if (this.setupScreen) {
            this.setupScreen.remove();
            this.setupScreen = null;
            this.setupBtn = null;
            this.errorMessage = null;
            this.retryCount = 0;
        }
    }
} 