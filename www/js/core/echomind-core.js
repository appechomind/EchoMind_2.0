/**
 * EchoMind Core Module - Advanced AI Integration
 * Version 2.0
 */
class EchoMindCore {
    constructor() {
        this.initialized = false;
        this.modules = {
            permissions: null,
            speech: null,
            language: null,
            commands: null,
            nlp: null,
            ml: null,
            knowledge: null
        };
        this.debug = false;
        this.context = {
            session: {},
            global: {},
            history: []
        };
        this.config = {
            aiModel: 'advanced',
            contextWindow: 1000,
            temperature: 0.7,
            maxTokens: 2048
        };
    }

    /**
     * Initialize the EchoMind core and required modules
     * @param {Object} config Configuration options
     * @returns {Promise} Resolves when initialization is complete
     */
    async init(config = {}) {
        if (this.initialized) {
            console.warn('EchoMind core already initialized');
            return;
        }

        this.debug = config.debug || false;
        this.config = { ...this.config, ...config };
        
        try {
            // Verify required modules are available
            if (!window.EchoMindNLP || !window.EchoMindML || !window.EchoMindKnowledge) {
                throw new Error('Required AI modules not loaded');
            }

            // Initialize core AI components
            this.modules.nlp = new EchoMindNLP(this.config);
            this.modules.ml = new EchoMindML(this.config);
            this.modules.knowledge = new EchoMindKnowledge(this.config);

            // Initialize modules in correct order
            await this.modules.nlp.init();
            await this.modules.ml.init();
            await this.modules.knowledge.init();

            // Initialize other modules
            if (window.EchoMindPermissions) {
                this.modules.permissions = EchoMindPermissions;
                await this.modules.permissions.initialize();
            }

            if (window.EchoMindSpeech) {
                this.modules.speech = EchoMindSpeech;
                await this.modules.speech.init();
            }

            if (window.EchoMindLanguage) {
                this.modules.language = EchoMindLanguage;
                await this.modules.language.init();
            }

            if (window.EchoMindCommands) {
                this.modules.commands = EchoMindCommands;
                await this.modules.commands.init();
            }

            // Initialize context
            await this._initializeContext();

            this.initialized = true;
            console.log('EchoMind core initialized successfully');
        } catch (error) {
            console.error('EchoMind initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize context tracking system
     * @private
     */
    _initializeContext() {
        this.context.session.startTime = Date.now();
        this.context.session.interactions = 0;
        
        // Load any persisted global context
        try {
            const savedContext = localStorage.getItem('echomind_global_context');
            if (savedContext) {
                this.context.global = JSON.parse(savedContext);
            }
        } catch (e) {
            console.warn('Failed to load persisted context:', e);
        }
    }

    /**
     * Process input through all relevant modules
     * @param {Object} input Input data (text, speech, etc.)
     * @returns {Promise<Object>} Processing results
     */
    async process(input) {
        if (!this.initialized) {
            throw new Error('EchoMind core not initialized');
        }

        try {
            // Update context
            this.context.session.interactions++;
            this.context.history.push({
                timestamp: Date.now(),
                input: input
            });

            // Trim history if needed
            if (this.context.history.length > this.config.contextWindow) {
                this.context.history = this.context.history.slice(-this.config.contextWindow);
            }

            // Process through NLP
            let processedInput = input;
            if (this.modules.nlp) {
                processedInput = await this.modules.nlp.process(input, this.context);
            }

            // Get ML predictions if available
            let predictions = null;
            if (this.modules.ml) {
                predictions = await this.modules.ml.predict(processedInput, this.context);
            }

            // Query knowledge base
            let knowledge = null;
            if (this.modules.knowledge) {
                knowledge = await this.modules.knowledge.query(processedInput);
            }

            // Generate response using language model
            let response = null;
            if (this.modules.language) {
                response = await this.modules.language.generateResponse(processedInput, {
                    predictions,
                    knowledge,
                    context: this.context
                });
            }

            return {
                input: processedInput,
                predictions,
                knowledge,
                response,
                context: this.context
            };
        } catch (error) {
            console.error('Error processing input:', error);
            throw error;
        }
    }

    /**
     * Get a module instance
     * @param {string} moduleName Name of the module to get
     * @returns {Object|null} Module instance or null if not found
     */
    getModule(moduleName) {
        return this.modules[moduleName] || null;
    }

    /**
     * Check if a module is available
     * @param {string} moduleName Name of the module to check
     * @returns {boolean} True if module is available
     */
    hasModule(moduleName) {
        return this.modules[moduleName] !== null;
    }

    /**
     * Enable or disable debug mode
     * @param {boolean} enabled Whether to enable debug mode
     */
    setDebug(enabled) {
        this.debug = enabled;
        // Propagate debug setting to modules
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.setDebug === 'function') {
                module.setDebug(enabled);
            }
        });
    }

    /**
     * Save current context to persistent storage
     */
    async saveContext() {
        try {
            localStorage.setItem('echomind_global_context', JSON.stringify(this.context.global));
        } catch (e) {
            console.warn('Failed to save context:', e);
        }
    }
}

// Create global instance
window.EchoMind = new EchoMindCore();

// Export to global scope
window.EchoMindCore = EchoMindCore; 