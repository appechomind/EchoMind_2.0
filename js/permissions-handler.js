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
        this.permissionPromises = new Map();
    }

    async initialize(options = {}) {
        if (this.initialized) {
            return;
        }

        this.debugMode = options.debugMode || false;
        
        try {
            // Load saved permissions from localStorage
            this.loadPermissionStates();
            
            // Check current permissions
            await Promise.all([
                this.checkMicrophonePermission(),
                this.checkCameraPermission()
            ]);
            
            this.initialized = true;
            
            if (this.debugMode) {
                console.log('Permissions handler initialized');
                console.log('Microphone permission:', this.micPermission);
                console.log('Camera permission:', this.cameraPermission);
            }
        } catch (error) {
            console.error('Error initializing permissions handler:', error);
            throw error;
        }
    }

    async checkMicrophonePermission() {
        try {
            // Check if we already have a pending request
            if (this.permissionPromises.has('microphone')) {
                return this.permissionPromises.get('microphone');
            }

            // Create new permission check promise
            const promise = (async () => {
                try {
                    const result = await navigator.permissions.query({ name: 'microphone' });
                    this.micPermission = result.state;
                    
                    result.onchange = () => {
                        this.micPermission = result.state;
                        this.savePermissionStates();
                        if (this.debugMode) {
                            console.log('Microphone permission changed:', result.state);
                        }
                    };
                    
                    return result.state === 'granted';
                } catch (error) {
                    console.error('Error checking microphone permission:', error);
                    return false;
                }
            })();

            this.permissionPromises.set('microphone', promise);
            return promise;
        } catch (error) {
            console.error('Error in checkMicrophonePermission:', error);
            return false;
        }
    }

    async requestMicrophonePermission() {
        try {
            // Check if we already have a pending request
            if (this.permissionPromises.has('microphone')) {
                return this.permissionPromises.get('microphone');
            }

            // Create new permission request promise
            const promise = (async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop());
                    this.micPermission = 'granted';
                    this.savePermissionStates();
                    if (this.debugMode) {
                        console.log('Microphone permission granted');
                    }
                    return true;
                } catch (error) {
                    console.error('Error requesting microphone permission:', error);
                    this.micPermission = 'denied';
                    this.savePermissionStates();
                    return false;
                }
            })();

            this.permissionPromises.set('microphone', promise);
            return promise;
        } catch (error) {
            console.error('Error in requestMicrophonePermission:', error);
            return false;
        }
    }

    async checkCameraPermission() {
        try {
            // Check if we already have a pending request
            if (this.permissionPromises.has('camera')) {
                return this.permissionPromises.get('camera');
            }

            // Create new permission check promise
            const promise = (async () => {
                try {
                    const result = await navigator.permissions.query({ name: 'camera' });
                    this.cameraPermission = result.state;
                    
                    result.onchange = () => {
                        this.cameraPermission = result.state;
                        this.savePermissionStates();
                        if (this.debugMode) {
                            console.log('Camera permission changed:', result.state);
                        }
                    };
                    
                    return result.state === 'granted';
                } catch (error) {
                    console.error('Error checking camera permission:', error);
                    return false;
                }
            })();

            this.permissionPromises.set('camera', promise);
            return promise;
        } catch (error) {
            console.error('Error in checkCameraPermission:', error);
            return false;
        }
    }

    async requestCameraPermission() {
        try {
            // Check if we already have a pending request
            if (this.permissionPromises.has('camera')) {
                return this.permissionPromises.get('camera');
            }

            // Create new permission request promise
            const promise = (async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    stream.getTracks().forEach(track => track.stop());
                    this.cameraPermission = 'granted';
                    this.savePermissionStates();
                    if (this.debugMode) {
                        console.log('Camera permission granted');
                    }
                    return true;
                } catch (error) {
                    console.error('Error requesting camera permission:', error);
                    this.cameraPermission = 'denied';
                    this.savePermissionStates();
                    return false;
                }
            })();

            this.permissionPromises.set('camera', promise);
            return promise;
        } catch (error) {
            console.error('Error in requestCameraPermission:', error);
            return false;
        }
    }

    savePermissionStates() {
        try {
            localStorage.setItem('micPermission', this.micPermission);
            localStorage.setItem('cameraPermission', this.cameraPermission);
            if (this.debugMode) {
                console.log('Permission states saved:', {
                    mic: this.micPermission,
                    camera: this.cameraPermission
                });
            }
        } catch (error) {
            console.error('Error saving permission states:', error);
        }
    }

    loadPermissionStates() {
        try {
            this.micPermission = localStorage.getItem('micPermission');
            this.cameraPermission = localStorage.getItem('cameraPermission');
            if (this.debugMode) {
                console.log('Permission states loaded:', {
                    mic: this.micPermission,
                    camera: this.cameraPermission
                });
            }
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