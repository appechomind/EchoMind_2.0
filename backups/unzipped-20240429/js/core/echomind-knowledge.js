/**
 * EchoMind Knowledge Module
 * Advanced knowledge base management and querying
 */
class EchoMindKnowledge {
    constructor(config = {}) {
        this.config = {
            useCache: true,
            maxCacheSize: 1000,
            similarityThreshold: 0.7,
            maxResults: 10,
            ...config
        };

        this.knowledgeBase = new Map();
        this.cache = new Map();
        this.initialized = false;
        
        // Initialize knowledge categories
        this.categories = {
            GENERAL: 'general',
            TECHNICAL: 'technical',
            COMMANDS: 'commands',
            TRICKS: 'tricks',
            USER_SPECIFIC: 'user_specific'
        };
    }

    async init() {
        try {
            // Load initial knowledge base
            await this._loadKnowledgeBase();
            
            // Load cached data if available
            if (this.config.useCache) {
                await this._loadCache();
            }

            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize knowledge base:', error);
            return false;
        }
    }

    async query(input, context = {}) {
        if (!this.initialized) {
            throw new Error('Knowledge module not initialized');
        }

        try {
            const result = {
                matches: [],
                relatedTopics: [],
                confidence: 0,
                source: null
            };

            // Check cache first
            if (this.config.useCache) {
                const cached = this._checkCache(input);
                if (cached) {
                    return cached;
                }
            }

            // Process query
            const processedQuery = await this._processQuery(input);
            
            // Find relevant knowledge
            result.matches = await this._findMatches(processedQuery);
            
            // Get related topics
            result.relatedTopics = await this._findRelatedTopics(processedQuery);
            
            // Calculate confidence
            result.confidence = this._calculateConfidence(result.matches);
            
            // Store in cache if useful
            if (this.config.useCache && result.confidence > 0.5) {
                this._addToCache(input, result);
            }

            return result;
        } catch (error) {
            console.error('Error querying knowledge base:', error);
            throw error;
        }
    }

    async addKnowledge(data, category = this.categories.GENERAL) {
        if (!this.initialized) {
            throw new Error('Knowledge module not initialized');
        }

        try {
            // Process and validate new knowledge
            const processed = await this._processNewKnowledge(data, category);
            
            // Add to knowledge base
            const key = this._generateKey(processed);
            this.knowledgeBase.set(key, {
                ...processed,
                category,
                timestamp: Date.now(),
                usage: 0
            });

            // Clear relevant cache entries
            if (this.config.useCache) {
                this._clearRelatedCache(processed);
            }

            return true;
        } catch (error) {
            console.error('Error adding to knowledge base:', error);
            return false;
        }
    }

    async _loadKnowledgeBase() {
        // Load built-in knowledge
        const builtInKnowledge = {
            commands: {
                'help': {
                    description: 'Show available commands',
                    usage: 'help [command]',
                    category: this.categories.COMMANDS
                },
                'search': {
                    description: 'Search for information',
                    usage: 'search <query>',
                    category: this.categories.COMMANDS
                }
            },
            tricks: {
                'mindReading': {
                    name: 'Basic Mind Reading',
                    description: 'Simple mind reading trick',
                    steps: ['Ask for a number', 'Perform calculation', 'Reveal result'],
                    category: this.categories.TRICKS
                }
            }
        };

        // Add built-in knowledge to knowledge base
        for (const [domain, items] of Object.entries(builtInKnowledge)) {
            for (const [key, value] of Object.entries(items)) {
                await this.addKnowledge(value, value.category);
            }
        }

        return true;
    }

    async _loadCache() {
        try {
            const savedCache = localStorage.getItem('echomind_knowledge_cache');
            if (savedCache) {
                const parsed = JSON.parse(savedCache);
                this.cache = new Map(Object.entries(parsed));
            }
        } catch (e) {
            console.warn('Failed to load knowledge cache:', e);
        }
    }

    _checkCache(query) {
        const normalized = this._normalizeQuery(query);
        return this.cache.get(normalized) || null;
    }

    _addToCache(query, result) {
        const normalized = this._normalizeQuery(query);
        
        // Maintain cache size limit
        if (this.cache.size >= this.config.maxCacheSize) {
            const oldestKey = Array.from(this.cache.keys())[0];
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(normalized, {
            ...result,
            cachedAt: Date.now()
        });

        // Persist cache
        try {
            localStorage.setItem('echomind_knowledge_cache', 
                JSON.stringify(Object.fromEntries(this.cache)));
        } catch (e) {
            console.warn('Failed to persist knowledge cache:', e);
        }
    }

    _clearRelatedCache(knowledge) {
        // Clear cache entries that might be affected by new knowledge
        for (const [key, value] of this.cache.entries()) {
            if (this._isRelated(knowledge, value)) {
                this.cache.delete(key);
            }
        }
    }

    async _processQuery(query) {
        // Normalize and enhance query
        const normalized = this._normalizeQuery(query);
        
        return {
            original: query,
            normalized,
            tokens: normalized.split(' '),
            timestamp: Date.now()
        };
    }

    _normalizeQuery(query) {
        return query.toLowerCase().trim()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ');
    }

    async _findMatches(processedQuery) {
        const matches = [];
        const queryTokens = new Set(processedQuery.tokens);

        // Search through knowledge base
        for (const [key, entry] of this.knowledgeBase.entries()) {
            const similarity = this._calculateSimilarity(queryTokens, entry);
            
            if (similarity >= this.config.similarityThreshold) {
                matches.push({
                    ...entry,
                    similarity
                });
            }
        }

        // Sort by similarity and limit results
        return matches
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, this.config.maxResults);
    }

    _calculateSimilarity(queryTokens, entry) {
        // Calculate Jaccard similarity between query and entry
        const entryTokens = new Set(this._normalizeQuery(entry.description).split(' '));
        
        const intersection = new Set(
            [...queryTokens].filter(token => entryTokens.has(token))
        );
        
        const union = new Set([...queryTokens, ...entryTokens]);
        
        return intersection.size / union.size;
    }

    async _findRelatedTopics(processedQuery) {
        const related = [];
        const matches = await this._findMatches(processedQuery);

        // Find topics related to matches
        for (const match of matches) {
            const relatedEntries = Array.from(this.knowledgeBase.values())
                .filter(entry => 
                    entry.category === match.category && 
                    entry !== match
                )
                .slice(0, 3);

            related.push(...relatedEntries);
        }

        // Remove duplicates and sort by relevance
        return Array.from(new Set(related))
            .sort((a, b) => b.usage - a.usage)
            .slice(0, this.config.maxResults);
    }

    _calculateConfidence(matches) {
        if (matches.length === 0) return 0;
        
        // Calculate average similarity of top matches
        const topMatches = matches.slice(0, 3);
        const avgSimilarity = topMatches.reduce(
            (sum, match) => sum + match.similarity, 
            0
        ) / topMatches.length;

        return Math.min(avgSimilarity * 1.2, 1.0);
    }

    async _processNewKnowledge(data, category) {
        // Validate and normalize new knowledge entry
        if (!data.description) {
            throw new Error('Knowledge entry must have a description');
        }

        return {
            ...data,
            description: this._normalizeQuery(data.description),
            category,
            created: Date.now(),
            lastUpdated: Date.now()
        };
    }

    _generateKey(knowledge) {
        // Generate unique key for knowledge entry
        return `${knowledge.category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _isRelated(knowledge1, knowledge2) {
        // Check if two knowledge entries are related
        if (knowledge1.category === knowledge2.category) return true;
        
        const similarity = this._calculateSimilarity(
            new Set(this._normalizeQuery(knowledge1.description).split(' ')),
            knowledge2
        );
        
        return similarity >= this.config.similarityThreshold;
    }
}

// Create global instance
if (typeof window.EchoMind === 'undefined') {
    window.EchoMind = {};
}
window.EchoMind.Knowledge = EchoMindKnowledge; 