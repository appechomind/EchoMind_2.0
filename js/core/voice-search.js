const VoiceSearchModule = (function() {
    let isRecording = false;
    let recordedText = [];
    let recordingTimeout = null;
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
        
        const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
        window.open(searchUrl, '_blank');
    }

    function _handleSpeechResult(data) {
        const transcript = data.transcript.toLowerCase();
        
        // Prevent duplicate processing of the same transcript
        if (transcript === lastTranscript) {
            return;
        }
        lastTranscript = transcript;
        
        _debug('Heard: ' + transcript);

        if (!isRecording && transcript.includes('about')) {
            _debug('Trigger word detected!');
            isRecording = true;
            recordedText = [];
            _updateStatus('Recording...');
            
            // Clear any existing timeout
            if (recordingTimeout) {
                clearTimeout(recordingTimeout);
            }
            
            recordingTimeout = setTimeout(() => {
                isRecording = false;
                const searchText = recordedText.join(' ').replace('about', '').trim();
                if (searchText) {
                    _performSearch(searchText);
                }
                recordedText = [];
                lastTranscript = ''; // Reset last transcript after search
            }, 3000);
        } else if (isRecording) {
            recordedText.push(transcript);
            _updateSearchInput(recordedText.join(' '));
        }
    }

    function _handleSpeechError(data) {
        _debug('Error: ' + data.error);
        _updateStatus('Error: ' + data.error);
    }

    function _cleanup() {
        if (recordingTimeout) {
            clearTimeout(recordingTimeout);
            recordingTimeout = null;
        }
        isRecording = false;
        recordedText = [];
        lastTranscript = '';
    }

    return {
        init: function(elementId) {
            statusElement = document.getElementById(elementId);
            searchInput = document.querySelector('.search-input');
            
            if (!statusElement) {
                _debug('Status element not found');
                return false;
            }

            if (!SpeechRecognitionModule.isSupported()) {
                _updateStatus('Error: Please use Chrome or Edge');
                return false;
            }

            SpeechRecognitionModule.init();
            SpeechRecognitionModule.on('result', _handleSpeechResult);
            SpeechRecognitionModule.on('error', _handleSpeechError);

            window.addEventListener('beforeunload', _cleanup);
            return true;
        },

        start: function() {
            if (SpeechRecognitionModule.start()) {
                _updateStatus('Listening for "about"...');
                return true;
            }
            return false;
        },

        stop: function() {
            _cleanup();
            SpeechRecognitionModule.stop();
            _updateStatus('Stopped listening');
        }
    };
})(); 