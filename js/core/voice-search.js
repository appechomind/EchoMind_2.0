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
        recognition.start();
    }

    function _handleSpeechEnd() {
        recognition.start();
    }

    return {
        init: function(elementId) {
            statusElement = document.getElementById(elementId);
            searchInput = document.querySelector('.search-input');
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = _handleSpeechResult;
            recognition.onerror = _handleSpeechError;
            recognition.onend = _handleSpeechEnd;

            _updateStatus('Say "about" followed by your search');
            recognition.start();
        }
    };
})(); 