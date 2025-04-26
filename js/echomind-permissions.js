/**
 * EchoMind Permissions Handler
 * Centralized system for managing microphone permissions across all pages
 */

if (typeof window.EchoMind === 'undefined') {
    window.EchoMind = {};
}

EchoMind.Permissions = (function() {
    // Private state
    const state = {
        permissionGranted: false,
        stream: null,
        retryCount: 0,
        maxRetries: 5,
        retryDelay: 1000,
        checkInterval: 5000,
        debugMode: true,
        platform: {
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isAndroid: /Android/.test(navigator.userAgent),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        }
    };

    // Event handlers
    const handlers = {
        onPermissionChange: [],
        onError: []
    };

    // Debug logging
    function log(message, type = 'info') {
        if (state.debugMode) {
            console[type](`[EchoMind Permissions] ${message}`);
        }
    }

    // Emit events to handlers
    function emit(event, data) {
        if (handlers[event]) {
            handlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (e) {
                    log(`Error in ${event} handler: ${e}`, 'error');
                }
            });
        }
    }

    // Check if permissions API is supported
    function isPermissionsApiSupported() {
        return 'permissions' in navigator;
    }

    // Request microphone access
    async function requestMicrophoneAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // For mobile devices, keep the stream active
            if (state.platform.isMobile) {
                if (state.stream) {
                    state.stream.getTracks().forEach(track => track.stop());
                }
                state.stream = stream;
            } else {
                stream.getTracks().forEach(track => track.stop());
            }

            state.permissionGranted = true;
            state.retryCount = 0;
            emit('onPermissionChange', { granted: true });
            
            // Store permission state
            localStorage.setItem('echomind_mic_permission', 'granted');
            
            return true;
        } catch (error) {
            log(`Microphone access error: ${error.message}`, 'error');
            state.permissionGranted = false;
            emit('onError', { error });
            return false;
        }
    }

    // Handle permission errors with platform-specific logic
    async function handlePermissionError() {
        if (state.retryCount >= state.maxRetries) {
            log('Max retry attempts reached', 'warn');
            return false;
        }

        state.retryCount++;
        log(`Retrying permission request (${state.retryCount}/${state.maxRetries})`);

        if (state.platform.isIOS) {
            // iOS requires user interaction
            return new Promise(resolve => {
                const handleTouch = async () => {
                    document.removeEventListener('touchend', handleTouch);
                    const result = await requestMicrophoneAccess();
                    resolve(result);
                };
                document.addEventListener('touchend', handleTouch);
            });
        } else {
            await new Promise(resolve => setTimeout(resolve, state.retryDelay));
            return requestMicrophoneAccess();
        }
    }

    // Check and renew permissions periodically
    async function checkAndRenewPermissions() {
        if (isPermissionsApiSupported()) {
            try {
                const status = await navigator.permissions.query({ name: 'microphone' });
                const isGranted = status.state === 'granted';
                
                if (isGranted !== state.permissionGranted) {
                    state.permissionGranted = isGranted;
                    emit('onPermissionChange', { granted: isGranted });
                }

                return isGranted;
            } catch (error) {
                log(`Error checking permission status: ${error.message}`, 'error');
            }
        }

        // Fallback to checking stored permission
        return state.permissionGranted;
    }

    // Initialize visibility change handling
    function initVisibilityHandling() {
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden && state.platform.isMobile) {
                await checkAndRenewPermissions();
            }
        });

        // Handle page show/hide for iOS
        window.addEventListener('pageshow', async () => {
            if (state.platform.isMobile) {
                await checkAndRenewPermissions();
            }
        });
    }

    // Public API
    return {
        init: function(options = {}) {
            // Merge options
            Object.assign(state, options);
            
            // Initialize visibility handling
            initVisibilityHandling();
            
            // Start periodic permission checks
            setInterval(checkAndRenewPermissions, state.checkInterval);
            
            // Check stored permission state
            const storedPermission = localStorage.getItem('echomind_mic_permission');
            if (storedPermission === 'granted') {
                state.permissionGranted = true;
            }
            
            log('Permissions handler initialized');
        },

        requestPermission: async function() {
            const result = await requestMicrophoneAccess();
            if (!result) {
                return handlePermissionError();
            }
            return result;
        },

        checkPermission: checkAndRenewPermissions,

        onPermissionChange: function(callback) {
            handlers.onPermissionChange.push(callback);
        },

        onError: function(callback) {
            handlers.onError.push(callback);
        },

        isGranted: function() {
            return state.permissionGranted;
        },

        getStream: function() {
            return state.stream;
        }
    };
})(); 