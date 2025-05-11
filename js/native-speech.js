import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export async function startNativeSpeechRecognition() {
  // Request permission
  const hasPermission = await SpeechRecognition.requestPermission();
  if (!hasPermission) {
    console.error('Microphone permission denied');
    return;
  }

  // Start listening
  SpeechRecognition.start({
    language: 'en-US',
    partialResults: true
  })
  .addListener('partialResults', (result) => {
    console.log('[NativeSpeech] Partial:', result.matches);
  })
  .addListener('result', (result) => {
    console.log('[NativeSpeech] Final:', result.matches);
  });
}

// Optionally, auto-start when the app loads (uncomment if desired):
// startNativeSpeechRecognition(); 