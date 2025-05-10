// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (result.isFinal) {
      const command = result[0].transcript.toLowerCase().trim();
      handleCommand(command);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.onend = () => {
    // Restart recognition if it ends
    recognition.start();
  };

  // Start recognition when microphone permission is granted
  document.addEventListener('DOMContentLoaded', async () => {
    const hasPermission = await checkMicrophonePermission();
    if (hasPermission) {
      recognition.start();
    }
  });
} 