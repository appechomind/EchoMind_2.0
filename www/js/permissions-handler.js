/**
 * EchoMind Permissions Handler
 * Centralized system for managing permissions across all pages
 */

// EchoMind Permissions Handler (Classic JS, cross-platform)
(function() {
    function PermissionsHandler() {
        if (PermissionsHandler.instance) {
            return PermissionsHandler.instance;
        }
        PermissionsHandler.instance = this;
        this.micPermission = null;
        this.cameraPermission = null;
        this.debugMode = false;
        this.initialized = false;
        this.permissionPromises = new Map();
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

    PermissionsHandler.getInstance = function() {
        if (!PermissionsHandler.instance) {
            PermissionsHandler.instance = new PermissionsHandler();
        }
        return PermissionsHandler.instance;
    };

    PermissionsHandler.prototype.getPlatform = function() {
        if (this.platform.isNative && window.Capacitor && window.Capacitor.getPlatform) {
            return window.Capacitor.getPlatform();
        }
        if (this.platform.isIOS) return 'ios';
        if (this.platform.isAndroid) return 'android';
        return 'desktop';
    };

    PermissionsHandler.prototype.getBrowser = function() {
        if (this.platform.isSafari) return 'safari';
        if (this.platform.isChrome) return 'chrome';
        if (this.platform.isFirefox) return 'firefox';
        if (this.platform.isEdge) return 'edge';
        return 'unknown';
    };

    PermissionsHandler.prototype.initialize = function(options) {
        var self = this;
        options = options || {};
        if (this.initialized) return Promise.resolve();
        this.debugMode = options.debugMode || false;
        return this.loadPermissionStates().then(function() {
            var micPromise = (self.micPermission !== 'granted') ? self.checkMicrophonePermission() : Promise.resolve();
            var camPromise = (self.cameraPermission !== 'granted') ? self.checkCameraPermission() : Promise.resolve();
            return Promise.all([micPromise, camPromise]).then(function() {
                self.initialized = true;
                if (self.debugMode) {
                    console.log('[EchoMind Permissions] Handler initialized');
                    console.log('[EchoMind Permissions] Platform:', self.getPlatform());
                    console.log('[EchoMind Permissions] Browser:', self.getBrowser());
                    console.log('[EchoMind Permissions] Microphone permission:', self.micPermission);
                    console.log('[EchoMind Permissions] Camera permission:', self.cameraPermission);
                }
            });
        }).catch(function(error) {
            console.error('[EchoMind Permissions] Error initializing:', error);
            self.emit('error', error);
            throw error;
        });
    };

    PermissionsHandler.prototype.checkMicrophonePermission = function() {
        var self = this;
        if (this.micPermission === 'granted') {
            if (this.debugMode) console.log('[EchoMind Permissions] Microphone permission already granted (cached)');
            return Promise.resolve(true);
        }
        if (this.platform.isNative) {
            // Native: skip for now, or implement with Capacitor if needed
            return Promise.resolve(true);
        }
        if (!navigator.permissions) {
            return Promise.resolve(false);
        }
        return navigator.permissions.query({ name: 'microphone' }).then(function(result) {
            self.micPermission = result.state;
            localStorage.setItem('micPermission', self.micPermission);
            self.emit('permissionChange', { type: 'microphone', state: result.state });
            if (self.debugMode) console.log('[EchoMind Permissions] Web permission result:', self.micPermission);
            return result.state === 'granted';
        }).catch(function(error) {
            console.error('[EchoMind Permissions] Error checking microphone permission:', error);
            return false;
        });
    };

    PermissionsHandler.prototype.requestMicrophonePermission = function() {
        var self = this;
        if (this.micPermission === 'granted') {
            if (this.debugMode) console.log('[EchoMind Permissions] Microphone permission already granted (cached)');
            return Promise.resolve(true);
        }
        if (this.platform.isNative) {
            // Native: skip for now, or implement with Capacitor if needed
            return Promise.resolve(true);
        }
        return navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
            stream.getTracks().forEach(function(track) { track.stop(); });
            self.micPermission = 'granted';
            localStorage.setItem('micPermission', 'granted');
            self.emit('permissionChange', { type: 'microphone', state: 'granted' });
            if (self.debugMode) console.log('[EchoMind Permissions] Web permission result: granted');
            return true;
        }).catch(function(error) {
            console.error('[EchoMind Permissions] Error requesting microphone permission:', error);
            self.emit('error', error);
            return false;
        });
    };

    PermissionsHandler.prototype.checkCameraPermission = function() {
        var self = this;
        if (!navigator.permissions) {
            return Promise.resolve(false);
        }
        return navigator.permissions.query({ name: 'camera' }).then(function(result) {
            self.cameraPermission = result.state;
            self.emit('permissionChange', { type: 'camera', state: result.state });
            return result.state === 'granted';
        }).catch(function(error) {
            console.error('[EchoMind Permissions] Error checking camera permission:', error);
            return false;
        });
    };

    PermissionsHandler.prototype.requestCameraPermission = function() {
        var self = this;
        return navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            stream.getTracks().forEach(function(track) { track.stop(); });
            self.cameraPermission = 'granted';
            localStorage.setItem('cameraPermission', 'granted');
            self.emit('permissionChange', { type: 'camera', state: 'granted' });
            return true;
        }).catch(function(error) {
            console.error('[EchoMind Permissions] Error requesting camera permission:', error);
            self.emit('error', error);
            return false;
        });
    };

    PermissionsHandler.prototype.loadPermissionStates = function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            try {
                self.micPermission = localStorage.getItem('micPermission');
                self.cameraPermission = localStorage.getItem('cameraPermission');
                if (self.debugMode) {
                    console.log('[EchoMind Permissions] Loaded from localStorage:', {
                        mic: self.micPermission,
                        camera: self.cameraPermission
                    });
                }
                resolve();
            } catch (error) {
                console.error('[EchoMind Permissions] Error loading states:', error);
                reject(error);
            }
        });
    };

    PermissionsHandler.prototype.on = function(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    };

    PermissionsHandler.prototype.off = function(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(function(h) { return h !== handler; });
        }
    };

    PermissionsHandler.prototype.emit = function(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(function(handler) {
                try {
                    handler(data);
                } catch (e) {
                    console.error('[EchoMind Permissions] Error in ' + event + ' handler:', e);
                }
            });
        }
    };

    // Attach to window
    window.PermissionsHandler = PermissionsHandler;
})(); 