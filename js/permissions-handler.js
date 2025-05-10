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
export const PermissionsHandler = {
    debugMode: false,
    permissionStates: {},

    init: function(options = {}) {
        this.debugMode = options.debugMode || false;
        this.loadSavedStates();
    },

    debug: function(message) {
        if (this.debugMode) {
            console.log('[EchoMind Permissions] ' + message);
        }
    },

    loadSavedStates: function() {
        try {
            const savedStates = localStorage.getItem('echomind_permissions');
            if (savedStates) {
                this.permissionStates = JSON.parse(savedStates);
            }
        } catch (e) {
            console.error('Error loading saved permission states:', e);
        }
    },

    saveStates: function() {
        try {
            localStorage.setItem('echomind_permissions', JSON.stringify(this.permissionStates));
        } catch (e) {
            console.error('Error saving permission states:', e);
        }
    },

    requestMicrophonePermission: async function() {
        try {
            this.debug('Requesting microphone permission');
            
            // Check if we already have permission
            if (this.permissionStates.microphone === 'granted') {
                this.debug('Microphone permission already granted');
                return true;
            }

            // Request permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            
            this.debug('Microphone permission granted');
            this.permissionStates.microphone = 'granted';
            this.saveStates();
            return true;
        } catch (error) {
            this.debug('Microphone permission denied: ' + error.message);
            this.permissionStates.microphone = 'denied';
            this.saveStates();
            return false;
        }
    },

    checkMicrophonePermission: async function() {
        try {
            if (this.permissionStates.microphone) {
                return this.permissionStates.microphone;
            }

            if ('permissions' in navigator) {
                const status = await navigator.permissions.query({ name: 'microphone' });
                this.permissionStates.microphone = status.state;
                this.saveStates();
                return status.state;
            }
            return 'unknown';
        } catch (error) {
            console.error('Error checking microphone permission:', error);
            return 'unknown';
        }
    },

    requestCameraPermission: async function() {
        try {
            this.debug('Requesting camera permission');
            
            // Check permission status if supported
            if ('permissions' in navigator) {
                const status = await navigator.permissions.query({ name: 'camera' });
                
                if (status.state === 'granted') {
                    this.debug('Camera permission already granted');
                    return true;
                }
            }
            
            // Request permission by accessing the camera
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Release tracks
            stream.getTracks().forEach(track => track.stop());
            
            this.debug('Camera permission granted');
            this.permissionStates.camera = 'granted';
            this.saveStates();
            return true;
        } catch (error) {
            this.debug('Camera permission denied: ' + error.message);
            this.permissionStates.camera = 'denied';
            this.saveStates();
            return false;
        }
    },

    on: function(eventName, handler) {
        if (this._eventHandlers[eventName] && typeof handler === 'function') {
            this._eventHandlers[eventName].push(handler);
            return true;
        }
        return false;
    },

    off: function(eventName, handler) {
        if (this._eventHandlers[eventName] && typeof handler === 'function') {
            this._eventHandlers[eventName] = this._eventHandlers[eventName].filter(h => h !== handler);
            return true;
        }
        return false;
    }
};

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