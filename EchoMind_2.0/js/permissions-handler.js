// Global permissions handler
class PermissionsHandler {
  constructor() {
    this.permissionState = null;
    this.listeners = [];
  }

  async checkMicrophonePermission() {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      this.permissionState = permissionStatus.state;
      
      // Listen for permission changes
      permissionStatus.addEventListener('change', () => {
        this.permissionState = permissionStatus.state;
        this.notifyListeners();
      });

      return this.permissionState;
    } catch (e) {
      console.error('Error checking microphone permission:', e);
      return 'prompt';
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.permissionState));
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up
      return true;
    } catch (e) {
      console.error('Error requesting microphone permission:', e);
      return false;
    }
  }
}

// Create global instance
window.permissionsHandler = new PermissionsHandler(); 