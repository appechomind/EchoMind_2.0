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
EchoMind.PermissionsHandler = (function() {
    // Private variables
    let _debugMode = false;
    let _eventHandlers = {};
    
    // Private methods
    function _debug(message) {
        if (_debugMode) {
            console.log('[EchoMind Permissions] ' + message);
        }
    }
    
    function _triggerEvent(eventName, data = {}) {
        if (_eventHandlers[eventName]) {
            _eventHandlers[eventName].forEach(handler => {
                try {
                    handler(data);
                } catch (e) {
                    console.error(`Error in ${eventName} event handler:`, e);
                }
            });
        }
    }
    
    // Check if the Permissions API is supported
    function _isPermissionsApiSupported() {
        return 'permissions' in navigator;
    }
    
    // Public API
    return {
        /**
         * Initialize the permissions handler
         * @param {Object} options - Configuration options
         */
        init: function(options = {}) {
            _debugMode = options.debugMode || false;
            
            // Initialize event handlers
            _eventHandlers = {
                permissionGranted: [],
                permissionDenied: [],
                permissionError: []
            };
            
            _debug('Initialized permissions handler');
        },
        
        /**
         * Request microphone permission
         * @returns {Promise<boolean>} - Promise resolving to permission status
         */
        requestMicrophonePermission: async function() {
            try {
                _debug('Requesting microphone permission');
                
                // Check permission status if supported
                if (_isPermissionsApiSupported()) {
                    const status = await navigator.permissions.query({ name: 'microphone' });
                    
                    if (status.state === 'granted') {
                        _debug('Microphone permission already granted');
                        _triggerEvent('permissionGranted', { type: 'microphone' });
                        return true;
                    }
                }
                
                // Request permission by accessing the microphone
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Release tracks
                stream.getTracks().forEach(track => track.stop());
                
                _debug('Microphone permission granted');
                _triggerEvent('permissionGranted', { type: 'microphone' });
                return true;
            } catch (error) {
                _debug('Microphone permission denied: ' + error.message);
                _triggerEvent('permissionDenied', { 
                    type: 'microphone',
                    error: error.message
                });
                return false;
            }
        },
        
        /**
         * Check current microphone permission
         * @returns {Promise<string>} - Promise resolving to permission state
         */
        checkMicrophonePermission: async function() {
            try {
                if (_isPermissionsApiSupported()) {
                    const status = await navigator.permissions.query({ name: 'microphone' });
                    return status.state;
                } else {
                    return 'unknown';
                }
            } catch (error) {
                console.error('Error checking microphone permission:', error);
                return 'unknown';
            }
        },
        
        /**
         * Request camera permission
         * @returns {Promise<boolean>} - Promise resolving to permission status
         */
        requestCameraPermission: async function() {
            try {
                _debug('Requesting camera permission');
                
                // Check permission status if supported
                if (_isPermissionsApiSupported()) {
                    const status = await navigator.permissions.query({ name: 'camera' });
                    
                    if (status.state === 'granted') {
                        _debug('Camera permission already granted');
                        _triggerEvent('permissionGranted', { type: 'camera' });
                        return true;
                    }
                }
                
                // Request permission by accessing the camera
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                
                // Release tracks
                stream.getTracks().forEach(track => track.stop());
                
                _debug('Camera permission granted');
                _triggerEvent('permissionGranted', { type: 'camera' });
                return true;
            } catch (error) {
                _debug('Camera permission denied: ' + error.message);
                _triggerEvent('permissionDenied', { 
                    type: 'camera',
                    error: error.message
                });
                return false;
            }
        },
        
        /**
         * Register an event handler
         * @param {String} eventName - Event name
         * @param {Function} handler - Handler function
         * @returns {Boolean} Success status
         */
        on: function(eventName, handler) {
            if (_eventHandlers[eventName] && typeof handler === 'function') {
                _eventHandlers[eventName].push(handler);
                return true;
            }
            return false;
        },
        
        /**
         * Unregister an event handler
         * @param {String} eventName - Event name
         * @param {Function} handler - Handler to remove
         * @returns {Boolean} Success status
         */
        off: function(eventName, handler) {
            if (_eventHandlers[eventName] && typeof handler === 'function') {
                _eventHandlers[eventName] = _eventHandlers[eventName].filter(h => h !== handler);
                return true;
            }
            return false;
        }
    };
})();

// Auto-initialize on DOMContentLoaded to make it available globally
document.addEventListener('DOMContentLoaded', function() {
    window.permissionsHandler = EchoMind.PermissionsHandler;
    EchoMind.PermissionsHandler.init({ debugMode: false });
}); 