const VoiceSearchModule = (function() {
    let statusElement = null;

    function _updateStatus(message) {
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    function _performSearch(query) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.location.href = searchUrl;
    }

    function _handleSpeechResult(data) {
        const transcript = data.transcript.toLowerCase();
        console.log('Heard:', transcript);
        
        if (transcript.includes('about')) {
            const searchQuery = transcript.replace('about', '').trim();
            console.log('Searching for:', searchQuery);
            _performSearch(searchQuery);
        }
    }

    return {
        init: function(elementId) {
            try {
                statusElement = document.getElementById(elementId);
                
                // Initialize speech recognition
                if (!SpeechRecognitionModule.init({
                    continuous: true,
                    interimResults: false,
                    maxAlternatives: 1
                })) {
                    _updateStatus('Error: Speech recognition not supported');
                    return false;
                }

                // Set up event handlers
                SpeechRecognitionModule.on('result', _handleSpeechResult);
                SpeechRecognitionModule.on('error', (data) => {
                    console.log('Error:', data.error);
                    _updateStatus('Error: ' + data.error);
                });

                _updateStatus('Say "about" followed by your search');
                SpeechRecognitionModule.start();
                return true;
            } catch (error) {
                console.error('Failed to initialize voice search:', error);
                _updateStatus('Error: Failed to initialize voice search');
                return false;
            }
        }
    };
})(); 