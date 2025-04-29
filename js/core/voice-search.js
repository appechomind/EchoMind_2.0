const VoiceSearchModule = (function() {
    let recognition = null;
    let statusElement = null;

    function _updateStatus(message) {
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    function _performSearch(query) {
        if (!query) return;
        window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    }

    function _handleSpeechResult(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        if (transcript.includes('about')) {
            const searchQuery = transcript.replace('about', '').trim();
            if (searchQuery) {
                _performSearch(searchQuery);
            }
        }
    }

    function _handleSpeechError(event) {
        if (recognition) {
            recognition.start();
        }
    }

    function _handleSpeechEnd() {
        if (recognition) {
            recognition.start();
        }
    }

    return {
        init: function(elementId) {
            statusElement = document.getElementById(elementId);
            
            if (!('webkitSpeechRecognition' in window)) {
                _updateStatus('Error: Please use Chrome or Edge');
                return false;
            }

            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = _handleSpeechResult;
            recognition.onerror = _handleSpeechError;
            recognition.onend = _handleSpeechEnd;

            _updateStatus('Say "about" followed by your search');
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