const VoiceSearchModule = (function() {
    let recognition = null;
    let statusElement = null;
    let searchInput = null;
    let lastTranscript = '';

    function _debug(message) {
        console.log('[VoiceSearch]', message);
    }

    function _updateStatus(message) {
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    function _updateSearchInput(text) {
        if (searchInput) {
            searchInput.value = text;
        }
    }

    function _performSearch(query) {
        if (!query) return;
        
        _debug('Searching for: ' + query);
        _updateStatus('Searching: ' + query);
        _updateSearchInput(query);
        
        // Navigate directly to Google search results
        const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
        window.location.href = searchUrl;
    }

    function _handleSpeechResult(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        
        // Prevent duplicate processing
        if (transcript === lastTranscript) return;
        lastTranscript = transcript;
        
        _debug('Heard: ' + transcript);

        if (transcript.includes('about')) {
            const searchQuery = transcript.replace('about', '').trim();
            if (searchQuery) {
                _performSearch(searchQuery);
            }
        }
    }

    function _handleSpeechError(event) {
        _debug('Error: ' + event.error);
        _updateStatus('Error: ' + event.error);
        
        // Restart recognition on error
        if (recognition) {
            recognition.start();
        }
    }

    function _handleSpeechEnd() {
        // Always restart recognition when it ends
        if (recognition) {
            recognition.start();
        }
    }

    return {
        init: function(elementId) {
            statusElement = document.getElementById(elementId);
            searchInput = document.querySelector('.search-input');
            
            if (!statusElement) {
                _debug('Status element not found');
                return false;
            }

            if (!('webkitSpeechRecognition' in window)) {
                _updateStatus('Error: Please use Chrome or Edge');
                return false;
            }

            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onresult = _handleSpeechResult;
            recognition.onerror = _handleSpeechError;
            recognition.onend = _handleSpeechEnd;

            _updateStatus('Initialized');
            return true;
        },

        start: function() {
            if (recognition) {
                recognition.start();
                _updateStatus('Listening for "about"...');
                return true;
            }
            return false;
        },

        stop: function() {
            if (recognition) {
                recognition.stop();
                _updateStatus('Stopped listening');
            }
        }
    };
})(); 