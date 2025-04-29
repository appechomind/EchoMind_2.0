import Trick from '../../core/Trick.js';
import { ErrorHandler, UIUtils } from '../../core/utils.js';

class GooglePeekTrick extends Trick {
    constructor() {
        super();
        this.displayName = 'Google Peek';
        this.inputPlaceholder = 'What would you like to search for?';
        this.searchResults = [];
        this.searchCache = new Map();
        this.maxCacheSize = 100;
    }

    onActivate() {
        this.searchResults = [];
        this.clearSearchCache();
    }

    onDeactivate() {
        this.clearSearchCache();
    }

    clearSearchCache() {
        this.searchCache.clear();
    }

    async onProcessMessage(message) {
        try {
            // Check cache first
            const cachedResults = this.searchCache.get(message);
            if (cachedResults) {
                return this.formatResults(message, cachedResults);
            }

            // Perform new search
            const searchResponse = await this.performGoogleSearch(message);
            this.searchResults = searchResponse.items || [];
            
            if (this.searchResults.length === 0) {
                return "I couldn't find any results for that search. Try something else!";
            }

            // Cache the results
            this.cacheResults(message, this.searchResults);

            return this.formatResults(message, this.searchResults);
        } catch (error) {
            return ErrorHandler.handle(error, "I encountered an error while searching. Please try again.");
        }
    }

    cacheResults(query, results) {
        if (this.searchCache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const oldestKey = this.searchCache.keys().next().value;
            this.searchCache.delete(oldestKey);
        }
        this.searchCache.set(query, results);
    }

    formatResults(query, results) {
        const formattedResults = results
            .slice(0, 3)
            .map((result, index) => 
                `${index + 1}. ${result.title}\n${result.snippet}`
            )
            .join('\n\n');

        return `Here are the top results for "${query}":\n\n${formattedResults}`;
    }

    async performGoogleSearch(query) {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Search failed');
        }
        return await response.json();
    }
}

export default GooglePeekTrick; 