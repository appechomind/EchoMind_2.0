/**
 * EchoMind Permissions Handler
 * 
 * This module handles requesting and managing permissions for browser features
 * such as microphone access, camera access, etc.
 */

// Create namespace if it doesn't exist
if (typeof window.EchoMind === 'undefined') {
    window.EchoMind = {};
}

// Permissions Handler Module
export class PermissionsHandler {
    constructor() {
        this.debugMode = false;
        this.permissionStates = {
            microphone: null,
            camera: null
        };
        this.loadSavedStates();
    }

    init(options = {}) {
        this.debugMode = options.debugMode || false;
        this.debug('PermissionsHandler initialized');
    }

    debug(message) {
        if (this.debugMode) {
            console.log(`[PermissionsHandler] ${message}`);
        }
    }

    loadSavedStates() {
        try {
            const saved = localStorage.getItem('permissionStates');
            if (saved) {
                this.permissionStates = JSON.parse(saved);
                this.debug('Loaded saved permission states');
            }
        } catch (error) {
            console.error('Error loading saved permission states:', error);
        }
    }

    saveStates() {
        try {
            localStorage.setItem('permissionStates', JSON.stringify(this.permissionStates));
            this.debug('Saved permission states');
        } catch (error) {
            console.error('Error saving permission states:', error);
        }
    }

    async requestMicrophonePermission() {
        this.debug('Requesting microphone permission');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.permissionStates.microphone = 'granted';
            this.saveStates();
            this.debug('Microphone permission granted');
            return true;
        } catch (error) {
            this.debug(`Microphone permission denied: ${error.message}`);
            this.permissionStates.microphone = 'denied';
            this.saveStates();
            return false;
        }
    }

    async checkMicrophonePermission() {
        this.debug('Checking microphone permission');
        if (this.permissionStates.microphone === 'granted') {
            this.debug('Microphone permission already granted');
            return true;
        }

        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            this.permissionStates.microphone = result.state;
            this.saveStates();
            this.debug(`Microphone permission state: ${result.state}`);
            return result.state === 'granted';
        } catch (error) {
            this.debug(`Error checking microphone permission: ${error.message}`);
            return false;
        }
    }

    async requestCameraPermission() {
        this.debug('Requesting camera permission');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            this.permissionStates.camera = 'granted';
            this.saveStates();
            this.debug('Camera permission granted');
            return true;
        } catch (error) {
            this.debug(`Camera permission denied: ${error.message}`);
            this.permissionStates.camera = 'denied';
            this.saveStates();
            return false;
        }
    }

    async checkCameraPermission() {
        this.debug('Checking camera permission');
        if (this.permissionStates.camera === 'granted') {
            this.debug('Camera permission already granted');
            return true;
        }

        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            this.permissionStates.camera = result.state;
            this.saveStates();
            this.debug(`Camera permission state: ${result.state}`);
            return result.state === 'granted';
        } catch (error) {
            this.debug(`Error checking camera permission: ${error.message}`);
            return false;
        }
    }
}

// Auto-initialize on DOMContentLoaded to make it available globally
document.addEventListener('DOMContentLoaded', function() {
    window.permissionsHandler = EchoMind.PermissionsHandler;
    EchoMind.PermissionsHandler.init({ debugMode: false });
});

class PermissionsHandler {
    constructor() {
        this.permissionStatus = document.getElementById('permissionStatus');
        this.checkMicrophonePermission();
    }

    async checkMicrophonePermission() {
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            this.updatePermissionStatus(result.state);
            
            result.onchange = () => {
                this.updatePermissionStatus(result.state);
            };
        } catch (error) {
            console.error('Error checking microphone permission:', error);
            this.updatePermissionStatus('error');
        }
    }

    updatePermissionStatus(state) {
        if (!this.permissionStatus) return;

        this.permissionStatus.className = state;
        switch (state) {
            case 'granted':
                this.permissionStatus.textContent = 'Microphone access granted';
                break;
            case 'denied':
                this.permissionStatus.textContent = 'Microphone access denied';
                break;
            case 'prompt':
                this.permissionStatus.textContent = 'Microphone permission needed';
                break;
            default:
                this.permissionStatus.textContent = 'Could not check microphone permission';
        }
    }

    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.updatePermissionStatus('granted');
            return true;
        } catch (error) {
            console.error('Error requesting microphone permission:', error);
            this.updatePermissionStatus('denied');
            return false;
        }
    }
}

// Initialize permissions handler
const permissionsHandler = new PermissionsHandler(); 

// Initialize the permissions handler
const permissions = new PermissionsHandler();
permissions.init({ debugMode: true });

// Make it available globally for non-module scripts
window.PermissionsHandler = PermissionsHandler;
window.permissions = permissions; 