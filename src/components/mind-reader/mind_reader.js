import PermissionsHandler from '/EchoMind_2.0/js/permissions-handler.js';

class MindReader {
    constructor() {
        this.permissionsHandler = PermissionsHandler.getInstance();
        this.initialized = false;
    }

    async initialize() {
        try {
            await this.permissionsHandler.initialize({ debugMode: true });
            const hasMic = await this.permissionsHandler.checkMicrophonePermission();
            if (!hasMic) {
                const granted = await this.permissionsHandler.requestMicrophonePermission();
                if (!granted) {
                    throw new Error('Microphone permission denied');
                }
            }
            this.initialized = true;
        } catch (error) {
            console.error('[MindReader] Error initializing:', error);
            throw error;
        }
    }
} 