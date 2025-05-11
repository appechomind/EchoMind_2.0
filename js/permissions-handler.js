/**
 * EchoMind Permissions Handler
 * Centralized system for managing permissions across all pages
 */

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
        
        // Enhanced platform detection
        this.platform = {
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isAndroid: /Android/.test(navigator.userAgent),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
            isChrome: /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent),
            isFirefox: /Firefox/.test(navigator.userAgent),
            isEdge: /Edge/.test(navigator.userAgent),
            isNative: window.Capacitor && window.Capacitor.isNativePlatform
        };
        
        this.eventHandlers = {
            onPermissionChange: [],
            onError: [],
            onPlatformChange: []
        };
    }

    static getInstance() {
        if (!PermissionsHandler.instance) {
            PermissionsHandler.instance = new PermissionsHandler();
        }
        return PermissionsHandler.instance;
    }

    getPlatform() {
        if (this.platform.isNative) {
            return window.Capacitor.getPlatform();
        }
        if (this.platform.isIOS) return 'ios';
        if (this.platform.isAndroid) return 'android';
        return 'desktop';
    }

    getBrowser() {
        if (this.platform.isSafari) return 'safari';
        if (this.platform.isChrome) return 'chrome';
        if (this.platform.isFirefox) return 'firefox';
        if (this.platform.isEdge) return 'edge';
        return 'unknown';
    }

    async initialize(options = {}) {
        if (this.initialized) {
            return;
        }

        this.debugMode = options.debugMode || false;
        
        try {
            // Load saved permissions from localStorage or Capacitor Storage
            await this.loadPermissionStates();
            
            // Check current permissions if not already granted
            if (this.micPermission !== 'granted') {
                await this.checkMicrophonePermission();
            }
            if (this.cameraPermission !== 'granted') {
                await this.checkCameraPermission();
            }
            
            this.initialized = true;
            
            if (this.debugMode) {
                console.log('[EchoMind Permissions] Handler initialized');
                console.log('[EchoMind Permissions] Platform:', this.getPlatform());
                console.log('[EchoMind Permissions] Browser:', this.getBrowser());
                console.log('[EchoMind Permissions] Microphone permission:', this.micPermission);
                console.log('[EchoMind Permissions] Camera permission:', this.cameraPermission);
            }
        } catch (error) {
            console.error('[EchoMind Permissions] Error initializing:', error);
            this.emit('error', error);
            throw error;
        }
    }

    async checkMicrophonePermission() {
        // Use stored permission if available
        if (this.micPermission === 'granted') {
            if (this.debugMode) console.log('[EchoMind Permissions] Microphone permission already granted (cached)');
            return true;
        }
        // Native platform
        if (this.platform.isNative) {
            try {
                const { Storage } = await import('@capacitor/storage');
                const stored = await Storage.get({ key: 'micPermission' });
                if (stored.value === 'granted') {
                    this.micPermission = 'granted';
                    if (this.debugMode) console.log('[EchoMind Permissions] Microphone permission already granted (Capacitor Storage)');
                    return true;
                }
                const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                const permission = await SpeechRecognition.requestPermission();
                this.micPermission = permission ? 'granted' : 'denied';
                await Storage.set({ key: 'micPermission', value: this.micPermission });
                this.emit('permissionChange', { type: 'microphone', state: this.micPermission });
                if (this.debugMode) console.log('[EchoMind Permissions] Native permission result:', this.micPermission);
                return permission;
            } catch (error) {
                console.error('[EchoMind Permissions] Error checking native microphone permission:', error);
                return false;
            }
        }
        // Web platform
        if (!navigator.permissions) {
            return false;
        }
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            this.micPermission = result.state;
            localStorage.setItem('micPermission', this.micPermission);
            this.emit('permissionChange', { type: 'microphone', state: result.state });
            if (this.debugMode) console.log('[EchoMind Permissions] Web permission result:', this.micPermission);
            return result.state === 'granted';
        } catch (error) {
            console.error('[EchoMind Permissions] Error checking microphone permission:', error);
            return false;
        }
    }

    async requestMicrophonePermission() {
        // Use stored permission if available
        if (this.micPermission === 'granted') {
            if (this.debugMode) console.log('[EchoMind Permissions] Microphone permission already granted (cached)');
            return true;
        }
        // Native platform
        if (this.platform.isNative) {
            try {
                const { Storage } = await import('@capacitor/storage');
                const stored = await Storage.get({ key: 'micPermission' });
                if (stored.value === 'granted') {
                    this.micPermission = 'granted';
                    if (this.debugMode) console.log('[EchoMind Permissions] Microphone permission already granted (Capacitor Storage)');
                    return true;
                }
                const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                const permission = await SpeechRecognition.requestPermission();
                this.micPermission = permission ? 'granted' : 'denied';
                await Storage.set({ key: 'micPermission', value: this.micPermission });
                this.emit('permissionChange', { type: 'microphone', state: this.micPermission });
                if (this.debugMode) console.log('[EchoMind Permissions] Native permission result:', this.micPermission);
                return permission;
            } catch (error) {
                console.error('[EchoMind Permissions] Error requesting native microphone permission:', error);
                this.emit('error', error);
                return false;
            }
        }
        // Web platform
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.micPermission = 'granted';
            localStorage.setItem('micPermission', 'granted');
            this.emit('permissionChange', { type: 'microphone', state: 'granted' });
            if (this.debugMode) console.log('[EchoMind Permissions] Web permission result: granted');
            return true;
        } catch (error) {
            console.error('[EchoMind Permissions] Error requesting microphone permission:', error);
            this.emit('error', error);
            return false;
        }
    }

    async checkCameraPermission() {
        if (!navigator.permissions) {
            return false;
        }
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            this.cameraPermission = result.state;
            this.emit('permissionChange', { type: 'camera', state: result.state });
            return result.state === 'granted';
        } catch (error) {
            console.error('[EchoMind Permissions] Error checking camera permission:', error);
            return false;
        }
    }

    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            this.cameraPermission = 'granted';
            localStorage.setItem('cameraPermission', 'granted');
            this.emit('permissionChange', { type: 'camera', state: 'granted' });
            return true;
        } catch (error) {
            console.error('[EchoMind Permissions] Error requesting camera permission:', error);
            this.emit('error', error);
            return false;
        }
    }

    async loadPermissionStates() {
        try {
            // Native: check Capacitor Storage
            if (this.platform && this.platform.isNative) {
                const { Storage } = await import('@capacitor/storage');
                const mic = await Storage.get({ key: 'micPermission' });
                const cam = await Storage.get({ key: 'cameraPermission' });
                this.micPermission = mic.value || null;
                this.cameraPermission = cam.value || null;
                if (this.debugMode) {
                    console.log('[EchoMind Permissions] Loaded from Capacitor Storage:', {
                        mic: this.micPermission,
                        camera: this.cameraPermission
                    });
                }
            } else {
                // Web: use localStorage
                this.micPermission = localStorage.getItem('micPermission');
                this.cameraPermission = localStorage.getItem('cameraPermission');
                if (this.debugMode) {
                    console.log('[EchoMind Permissions] Loaded from localStorage:', {
                        mic: this.micPermission,
                        camera: this.cameraPermission
                    });
                }
            }
        } catch (error) {
            console.error('[EchoMind Permissions] Error loading states:', error);
        }
    }

    on(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    }

    off(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        }
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (e) {
                    console.error(`[EchoMind Permissions] Error in ${event} handler:`, e);
                }
            });
        }
    }
}

// Create and export a single instance
const permissions = PermissionsHandler.getInstance();
export default PermissionsHandler; 