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
    }

    show() {
        if (this.setupScreen) return;

        this.setupScreen = document.createElement('div');
        this.setupScreen.id = 'setup-screen';
        this.setupScreen.innerHTML = `
            <div class="setup-content">
                <h2>${this.title}</h2>
                <p>${this.description}</p>
                <button id="setupBtn" ${this.isSettingUp ? 'disabled' : ''}>${this.buttonText}</button>
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
        } catch (e) {
            console.error('Error during setup:', e);
            this.onSetupError(e);
            if (this.setupBtn) {
                this.setupBtn.disabled = false;
                this.setupBtn.textContent = this.buttonText;
            }
        } finally {
            this.isSettingUp = false;
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
        localStorage.setItem(this.permissionKey, 'true');
        localStorage.setItem(this.setupKey, 'true');
    }

    async checkSetupStatus() {
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
    }

    cleanup() {
        if (this.setupScreen) {
            this.setupScreen.remove();
            this.setupScreen = null;
            this.setupBtn = null;
        }
    }
} 