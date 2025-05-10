// Unified permissions manager for EchoMind
export class PermissionsManager {
    constructor(options = {}) {
        this.options = {
            storageKey: 'echomind_permissions',
            debugMode: options.debugMode || false,
            audioConfig: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 16000
            }
        };

        this.state = {
            permissionGranted: false,
            stream: null,
            platform: {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            },
            retryCount: 0,
            maxRetries: 3
        };

        this.listeners = new Set();
    }

    // Check if permissions API is supported
    isPermissionsApiSupported() {
        return 'permissions' in navigator && 'query' in navigator.permissions;
    }

    // Add event listener
    addEventListener(callback) {
        this.listeners.add(callback);
    }

    // Remove event listener
    removeEventListener(callback) {
        this.listeners.delete(callback);
    }

    // Notify all listeners
    notifyListeners(event) {
        this.listeners.forEach(listener => listener(event));
    }

    // Debug logging
    debug(message) {
        if (this.options.debugMode) {
            console.log(`[PermissionsManager] ${message}`);
        }
    }

    // Check current permission status
    async checkPermissionStatus() {
        try {
            // First check localStorage
            const storedPermission = localStorage.getItem(`${this.options.storageKey}_mic`);
            if (storedPermission === 'granted') {
                this.state.permissionGranted = true;
                return true;
            }

            // Then check permissions API
            if (this.isPermissionsApiSupported()) {
                const status = await navigator.permissions.query({ name: 'microphone' });
                this.state.permissionGranted = status.state === 'granted';
                return this.state.permissionGranted;
            }

            return false;
        } catch (error) {
            this.debug(`Error checking permission status: ${error.message}`);
            return false;
        }
    }

    // Request microphone permission
    async requestPermission() {
        try {
            this.debug('Requesting microphone permission');

            // Check current status first
            const isGranted = await this.checkPermissionStatus();
            if (isGranted) {
                this.debug('Permission already granted');
                return true;
            }

            // Request new permission
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: this.options.audioConfig
            });

            // Handle stream based on platform
            if (this.state.platform.isMobile) {
                if (this.state.stream) {
                    this.state.stream.getTracks().forEach(track => {
                        if (track.readyState === 'live') {
                            track.stop();
                        }
                    });
                }
                this.state.stream = stream;
            } else {
                if (this.state.stream) {
                    this.state.stream.getTracks().forEach(track => track.stop());
                }
                this.state.stream = stream;
            }

            // Update state and storage
            this.state.permissionGranted = true;
            this.state.retryCount = 0;
            localStorage.setItem(`${this.options.storageKey}_mic`, 'granted');
            
            this.notifyListeners({ type: 'permission_granted' });
            return true;

        } catch (error) {
            this.debug(`Error requesting permission: ${error.message}`);
            this.state.permissionGranted = false;
            localStorage.setItem(`${this.options.storageKey}_mic`, 'denied');

            // Handle specific errors
            const errorType = error.name === 'NotAllowedError' ? 'permission_denied' :
                            error.name === 'NotFoundError' ? 'no_microphone' : 'unknown';

            this.notifyListeners({ 
                type: 'permission_error',
                error: error,
                errorType: errorType
            });

            // Handle retries
            if (this.state.retryCount < this.state.maxRetries) {
                this.state.retryCount++;
                this.debug(`Retry attempt ${this.state.retryCount} of ${this.state.maxRetries}`);
                return await this.requestPermission();
            }

            return false;
        }
    }

    // Release resources
    cleanup() {
        if (this.state.stream) {
            this.state.stream.getTracks().forEach(track => track.stop());
            this.state.stream = null;
        }
        this.listeners.clear();
        this.state.retryCount = 0;
    }
} 