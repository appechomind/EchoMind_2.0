/**
 * Mobile-optimized permissions handler for EchoMind
 * Handles microphone permissions across browsers, iOS, and Android
 */
const MobilePermissions = {
  // State management
  state: {
    hasPermission: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    permissionCallbacks: [],
  },

  // Initialize the permissions handler
  init() {
    this.detectPlatform();
    this.setupPermissionObserver();
    return this.checkInitialPermission();
  },

  // Detect platform and browser
  detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    this.state.isIOS = /iphone|ipad|ipod/.test(ua);
    this.state.isAndroid = /android/.test(ua);
    this.state.isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  },

  // Check initial microphone permission
  async checkInitialPermission() {
    try {
      // Check if permission is already granted
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'microphone' });
        this.state.hasPermission = result.state === 'granted';
        return this.state.hasPermission;
      }
      
      // Fallback for browsers that don't support permissions API
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

  // Set up permission change observer
  setupPermissionObserver() {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
        permissionStatus.onchange = () => {
          this.state.hasPermission = permissionStatus.state === 'granted';
          this.notifyPermissionChange(this.state.hasPermission);
        };
      });
    }
  },

  // Request microphone access with platform-specific handling
  async requestMicrophoneAccess() {
    try {
      // For iOS Safari, we need to handle permissions differently
      if (this.state.isIOS && this.state.isSafari) {
        return await this.requestIOSPermission();
      }

      // Standard permission request
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Successfully got stream, clean up and return true
      this.state.hasPermission = true;
      stream.getTracks().forEach(track => track.stop());
      this.notifyPermissionChange(true);
      return true;

    } catch (error) {
      console.error('Error requesting microphone access:', error);
      this.notifyPermissionChange(false);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.showPermissionInstructions();
      }
      
      return false;
    }
  },

  // Special handling for iOS Safari
  async requestIOSPermission() {
    try {
      // iOS Safari requires user interaction
      await new Promise((resolve) => {
        // Show iOS-specific instructions
        this.showIOSInstructions();
        
        // Wait for user interaction
        const handleInteraction = async () => {
          document.removeEventListener('touchend', handleInteraction);
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.state.hasPermission = true;
            this.notifyPermissionChange(true);
            resolve(true);
          } catch (error) {
            console.error('iOS permission error:', error);
            this.notifyPermissionChange(false);
            resolve(false);
          }
        };
        
        document.addEventListener('touchend', handleInteraction);
      });
      
      return this.state.hasPermission;
    } catch (error) {
      console.error('iOS permission request failed:', error);
      return false;
    }
  },

  // Show platform-specific instructions
  showPermissionInstructions() {
    let instructions = '';
    
    if (this.state.isIOS) {
      instructions = 'To use voice features:\n' +
        '1. Tap Settings\n' +
        '2. Scroll to Safari\n' +
        '3. Tap Microphone\n' +
        '4. Enable access for this site';
    } else if (this.state.isAndroid) {
      instructions = 'To use voice features:\n' +
        '1. Tap the lock icon in the address bar\n' +
        '2. Tap Site Settings\n' +
        '3. Enable microphone access';
    } else {
      instructions = 'Please allow microphone access when prompted';
    }

    // Show instructions in a user-friendly way
    const event = new CustomEvent('showPermissionInstructions', {
      detail: { instructions, platform: this.getPlatform() }
    });
    document.dispatchEvent(event);
  },

  // Show iOS-specific instructions
  showIOSInstructions() {
    const event = new CustomEvent('showIOSInstructions', {
      detail: {
        message: 'Tap anywhere to enable voice features'
      }
    });
    document.dispatchEvent(event);
  },

  // Get current platform
  getPlatform() {
    if (this.state.isIOS) return 'ios';
    if (this.state.isAndroid) return 'android';
    return 'desktop';
  },

  // Add permission change listener
  addPermissionListener(callback) {
    this.state.permissionCallbacks.push(callback);
  },

  // Remove permission change listener
  removePermissionListener(callback) {
    const index = this.state.permissionCallbacks.indexOf(callback);
    if (index > -1) {
      this.state.permissionCallbacks.splice(index, 1);
    }
  },

  // Notify all listeners of permission changes
  notifyPermissionChange(hasPermission) {
    this.state.permissionCallbacks.forEach(callback => {
      try {
        callback(hasPermission);
      } catch (error) {
        console.error('Error in permission callback:', error);
      }
    });
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobilePermissions;
} else {
  window.MobilePermissions = MobilePermissions;
} 