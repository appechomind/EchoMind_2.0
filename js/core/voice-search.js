const VoiceSearchModule = (function() {
    let recognition = null;
    let isListening = false;
    let statusElement = null;
    let searchInput = null;
    let recordingTimeout = null;
    let recordedText = [];

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
        
        // Construct and open Google search URL
        const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
        window.location.href = searchUrl; // Navigate directly to the search results
    }

    function _startRecording() {
        _updateStatus('Recording...');
        isListening = true;
        recordedText = [];
        
        // Clear any existing timeout
        if (recordingTimeout) {
            clearTimeout(recordingTimeout);
        }
        
        // Set timeout to stop recording after 3 seconds
        recordingTimeout = setTimeout(() => {
            _stopRecording();
        }, 3000);
    }

    function _stopRecording() {
        if (recordingTimeout) {
            clearTimeout(recordingTimeout);
            recordingTimeout = null;
        }
        isListening = false;
        
        // Perform search with recorded text
        const searchText = recordedText.join(' ').replace('about', '').trim();
        if (searchText) {
            _performSearch(searchText);
        }
        
        _updateStatus('Listening for "about"...');
    }

    function _handleSpeechResult(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        _debug('Heard: ' + transcript);

        if (!isListening && transcript.includes('about')) {
            _startRecording();
        } else if (isListening) {
            recordedText.push(transcript);
            _updateSearchInput(recordedText.join(' '));
        }
    }

    function _handleSpeechError(event) {
        _debug('Error: ' + event.error);
        _updateStatus('Error: ' + event.error);
        _stopRecording();
    }

    function _handleSpeechEnd() {
        if (isListening) {
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
                _stopRecording();
                recognition.stop();
                _updateStatus('Stopped listening');
            }
        }
    };
})(); 