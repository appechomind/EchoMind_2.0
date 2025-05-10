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
class PermissionsHandler {
    constructor() {
        if (PermissionsHandler.instance) {
            return PermissionsHandler.instance;
        }
        PermissionsHandler.instance = this;
        
        this.micPermission = null;
        this.cameraPermission = null;
        this.debugMode = false;
        this.initialized = false;
    }

    async initialize(options = {}) {
        if (this.initialized) {
            return;
        }

        this.debugMode = options.debugMode || false;
        
        // Load saved permissions from localStorage
        this.loadPermissionStates();
        
        // Check current permissions
        await this.checkMicrophonePermission();
        await this.checkCameraPermission();
        
        this.initialized = true;
        
        if (this.debugMode) {
            console.log('Permissions handler initialized');
        }
    }

    async checkMicrophonePermission() {
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            this.micPermission = result.state;
            
            result.onchange = () => {
                this.micPermission = result.state;
                this.savePermissionStates();
            };
            
            return result.state === 'granted';
        } catch (error) {
            console.error('Error checking microphone permission:', error);
            return false;
        }
    }

    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.micPermission = 'granted';
            this.savePermissionStates();
            return true;
        } catch (error) {
            console.error('Error requesting microphone permission:', error);
            this.micPermission = 'denied';
            this.savePermissionStates();
            return false;
        }
    }

    async checkCameraPermission() {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            this.cameraPermission = result.state;
            
            result.onchange = () => {
                this.cameraPermission = result.state;
                this.savePermissionStates();
            };
            
            return result.state === 'granted';
        } catch (error) {
            console.error('Error checking camera permission:', error);
            return false;
        }
    }

    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            this.cameraPermission = 'granted';
            this.savePermissionStates();
            return true;
        } catch (error) {
            console.error('Error requesting camera permission:', error);
            this.cameraPermission = 'denied';
            this.savePermissionStates();
            return false;
        }
    }

    savePermissionStates() {
        try {
            localStorage.setItem('micPermission', this.micPermission);
            localStorage.setItem('cameraPermission', this.cameraPermission);
        } catch (error) {
            console.error('Error saving permission states:', error);
        }
    }

    loadPermissionStates() {
        try {
            this.micPermission = localStorage.getItem('micPermission');
            this.cameraPermission = localStorage.getItem('cameraPermission');
        } catch (error) {
            console.error('Error loading permission states:', error);
        }
    }
}

// Create and export a single instance
const permissions = new PermissionsHandler();
export { permissions };

// Make it available globally for non-module scripts
window.permissions = permissions; 