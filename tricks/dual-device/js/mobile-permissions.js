/**
 * Mobile-optimized permissions handler for EchoMind
 * Handles microphone permissions across browsers, iOS, and Android
 */
// Create namespace if it doesn't exist
if (typeof window.EchoMind === 'undefined') {
    window.EchoMind = {};
}

// Permissions Module
EchoMind.Permissions = (function() {
    // State management
    const state = {
        hasPermission: false,
        isIOS: false,
        isAndroid: false,
        isSafari: false,
        permissionCallbacks: [],
    };

    // Private methods
    function detectPlatform() {
        const ua = navigator.userAgent.toLowerCase();
        state.isIOS = /iphone|ipad|ipod/.test(ua);
        state.isAndroid = /android/.test(ua);
        state.isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    }

    function notifyPermissionChange(hasPermission) {
        state.permissionCallbacks.forEach(callback => {
            try {
                callback(hasPermission);
            } catch (error) {
                console.error('Error in permission callback:', error);
            }
        });
    }

    // Public API
    return {
        init() {
            detectPlatform();
            this.setupPermissionObserver();
            return this.checkInitialPermission();
        },

        async checkInitialPermission() {
            try {
                if ('permissions' in navigator) {
                    const result = await navigator.permissions.query({ name: 'microphone' });
                    state.hasPermission = result.state === 'granted';
                    return state.hasPermission;
                }
                
                if ('mediaDevices' in navigator) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const hasMic = devices.some(device => device.kind === 'audioinput');
                    if (!hasMic) {
                        console.warn('No microphone devices found');
                        return false;
                    }
                }
                
                return false;
            } catch (error) {
                console.error('Error checking initial permission:', error);
                return false;
            }
        },

        setupPermissionObserver() {
            if ('permissions' in navigator) {
                navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
                    permissionStatus.onchange = () => {
                        state.hasPermission = permissionStatus.state === 'granted';
                        notifyPermissionChange(state.hasPermission);
                    };
                });
            }
        },

        async requestPermission() {
            try {
                if (state.isIOS && state.isSafari) {
                    return await this.requestIOSPermission();
                }

                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

                state.hasPermission = true;
                stream.getTracks().forEach(track => track.stop());
                notifyPermissionChange(true);
                return true;

            } catch (error) {
                console.error('Error requesting microphone access:', error);
                notifyPermissionChange(false);
                
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    this.showPermissionInstructions();
                }
                
                return false;
            }
        },

        async requestIOSPermission() {
            return new Promise((resolve) => {
                const handleInteraction = async () => {
                    document.removeEventListener('touchend', handleInteraction);
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        stream.getTracks().forEach(track => track.stop());
                        state.hasPermission = true;
                        notifyPermissionChange(true);
                        resolve(true);
                    } catch (error) {
                        console.error('iOS permission error:', error);
                        notifyPermissionChange(false);
                        resolve(false);
                    }
                };
                
                document.addEventListener('touchend', handleInteraction);
                this.showIOSInstructions();
            });
        },

        showPermissionInstructions() {
            let instructions = '';
            
            if (state.isIOS) {
                instructions = 'To use voice features:\n1. Tap Settings\n2. Scroll to Safari\n3. Tap Microphone\n4. Enable access for this site';
            } else if (state.isAndroid) {
                instructions = 'To use voice features:\n1. Tap the lock icon in the address bar\n2. Tap Site Settings\n3. Enable microphone access';
            } else {
                instructions = 'Please allow microphone access when prompted';
            }

            const event = new CustomEvent('showPermissionInstructions', {
                detail: { instructions, platform: this.getPlatform() }
            });
            document.dispatchEvent(event);
        },

        showIOSInstructions() {
            const event = new CustomEvent('showIOSInstructions', {
                detail: { message: 'Tap anywhere to enable voice features' }
            });
            document.dispatchEvent(event);
        },

        getPlatform() {
            if (state.isIOS) return 'ios';
            if (state.isAndroid) return 'android';
            return 'desktop';
        },

        isGranted() {
            return state.hasPermission;
        },

        addListener(callback) {
            state.permissionCallbacks.push(callback);
        },

        removeListener(callback) {
            const index = state.permissionCallbacks.indexOf(callback);
            if (index > -1) {
                state.permissionCallbacks.splice(index, 1);
            }
        }
    };
})();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EchoMind.Permissions;
} else {
  window.EchoMind.Permissions = EchoMind.Permissions;
} 