const VoiceSearchModule = (function() {
    let recognition = null;
    let statusElement = null;
    let searchInput = null;

    function _updateStatus(message) {
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    function _performSearch(query) {
        if (searchInput) {
            searchInput.value = query;
            setTimeout(() => {
                searchInput.form.submit();
            }, 3000);
        }
    }

    function _handleSpeechResult(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        if (transcript.includes('about')) {
            const searchQuery = transcript.replace('about', '').trim();
            _performSearch(searchQuery);
        }
    }

    function _handleSpeechError(event) {
        console.log('Speech recognition error:', event.error);
        _updateStatus('Error: ' + event.error);
        recognition.start();
    }

    function _handleSpeechEnd() {
        console.log('Speech recognition ended, restarting...');
        recognition.start();
    }

    return {
        init: function(elementId) {
            try {
                statusElement = document.getElementById(elementId);
                searchInput = document.querySelector('.search-input');
                
                // First initialize the speech recognition module
                if (!SpeechRecognitionModule.init()) {
                    _updateStatus('Error: Speech recognition not supported');
                    return false;
                }

                recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                recognition.continuous = true;
                recognition.interimResults = false;
                recognition.lang = 'en-US';
                recognition.maxAlternatives = 1;

                recognition.onresult = _handleSpeechResult;
                recognition.onerror = _handleSpeechError;
                recognition.onend = _handleSpeechEnd;

                _updateStatus('Say "about" followed by your search');
                recognition.start();
                return true;
            } catch (error) {
                console.error('Failed to initialize voice search:', error);
                _updateStatus('Error: Failed to initialize voice search');
                return false;
            }
        }
    };
})(); 