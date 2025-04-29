// Global script loader for EchoMind
const EchoMind = window.EchoMind || {};

EchoMind.ScriptLoader = {
    loadedScripts: new Set(),
    loadingScripts: new Set(),
    scriptCallbacks: new Map(),

    // Load a single script
    async loadScript(src) {
        if (this.loadedScripts.has(src)) {
            return Promise.resolve();
        }

        if (this.loadingScripts.has(src)) {
            return new Promise((resolve) => {
                const callbacks = this.scriptCallbacks.get(src) || [];
                callbacks.push(resolve);
                this.scriptCallbacks.set(src, callbacks);
            });
        }

        this.loadingScripts.add(src);

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;

            script.onload = () => {
                this.loadedScripts.add(src);
                this.loadingScripts.delete(src);
                resolve();

                // Resolve any pending callbacks
                const callbacks = this.scriptCallbacks.get(src) || [];
                callbacks.forEach(callback => callback());
                this.scriptCallbacks.delete(src);
            };

            script.onerror = (error) => {
                this.loadingScripts.delete(src);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    },

    // Load multiple scripts in sequence
    async loadScripts(scripts) {
        for (const script of scripts) {
            try {
                await this.loadScript(script);
            } catch (error) {
                console.error(`Error loading script ${script}:`, error);
                throw error;
            }
        }
    },

    // Check if a script is loaded
    isScriptLoaded(src) {
        return this.loadedScripts.has(src);
    },

    // Get the base URL for scripts
    getBaseUrl() {
        return '/js/core/';
    },

    // Load all core scripts
    async loadCoreScripts() {
        const baseUrl = this.getBaseUrl();
        const coreScripts = [
            'echomind-nlp.js',
            'echomind-ml.js',
            'echomind-knowledge.js',
            'language-model.js',
            'echomind-core.js',
            'echomind-permissions.js',
            'echomind-speech.js',
            'mind-reader.js'
        ].map(script => baseUrl + script);

        try {
            await this.loadScripts(coreScripts);
            console.log('All core scripts loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load core scripts:', error);
            return false;
        }
    }
};

// Make the script loader globally available
window.EchoMind = EchoMind; 