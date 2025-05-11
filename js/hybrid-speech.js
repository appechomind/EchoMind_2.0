// Hybrid Speech Recognition Script (Web + Native)
// This script uses classic JS (no ES modules) and works on both web and native (Capacitor) platforms.

(function() {
    // Global handler for speech recognition results
    window.handleSpeechResult = function(result) {
        console.log('Speech result received:', result);
        var searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = result;
            console.log('Updated search bar with:', result);
            // Trigger search (e.g., by dispatching an input event)
            searchInput.dispatchEvent(new Event('input'));
        } else {
            console.error('Search input element not found!');
        }
    };

    // Function to initialize speech recognition
    function initSpeechRecognition() {
        console.log('Initializing speech recognition...');
        if (window.Capacitor && window.Capacitor.isNative) {
            console.log('Running on native platform, using Capacitor Speech Recognition');
            // Native speech recognition logic (Capacitor)
            // Example: Capacitor.Plugins.SpeechRecognition.startListening({ ... })
            // For now, simulate a result for testing
            setTimeout(function() {
                window.handleSpeechResult('test native speech');
            }, 2000);
        } else {
            console.log('Running on web platform, using browser Speech Recognition');
            // Web speech recognition logic
            if ('webkitSpeechRecognition' in window) {
                var recognition = new webkitSpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = function(event) {
                    var result = event.results[event.results.length - 1][0].transcript;
                    console.log('Web speech result:', result);
                    window.handleSpeechResult(result);
                };

                recognition.onerror = function(event) {
                    console.error('Speech recognition error:', event.error);
                };

                recognition.start();
                console.log('Web speech recognition started');
            } else {
                console.error('Speech recognition not supported in this browser');
            }
        }
    }

    // Initialize speech recognition when the script loads
    initSpeechRecognition();
})(); 