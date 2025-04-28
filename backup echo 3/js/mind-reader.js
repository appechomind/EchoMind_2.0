const cardDisplay = document.getElementById('card-display');
const container = document.getElementById('container');
const setupScreen = document.getElementById('setup');
const setupBtn = document.getElementById('setupBtn');
let startY = null;
let recognition = null;
let isListening = false;
let stream = null;

// Constants for permission handling
const PERMISSION_GRANTED = 'permission_granted';
const SETUP_COMPLETED = 'setup_completed';

const cardNames = ["ace","2","3","4","5","6","7","8","9","10","jack","queen","king","back","joker"];
const suits = ["hearts","spades","diamonds","clubs"];
const specialCards = ["back", "joker"];
const fallbackCard = "back";
const extensions = ["png", "jpg", "jpeg", "webp", "PNG"];

const numberMap = {
  "two": "2", "three": "3", "four": "4", "five": "5",
  "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10"
};

// Check if we've completed setup before
async function checkSetupStatus() {
  const setupCompleted = localStorage.getItem(SETUP_COMPLETED) === 'true';
  const permissionGranted = localStorage.getItem(PERMISSION_GRANTED) === 'true';

  if (setupCompleted && permissionGranted) {
    // Verify permission is still granted
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      if (permissionStatus.state === 'granted') {
        // Skip setup and start performance
        setupScreen.classList.add('hidden');
        container.classList.remove('hidden');
        startListening();
        return;
      }
    } catch (e) {
      console.error('Error checking permission:', e);
    }
  }

  // Show setup screen if we get here
  setupScreen.classList.remove('hidden');
  container.classList.add('hidden');
}

function normalizeTranscript(transcript) {
  const words = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  const normalizedWords = words.map(word => numberMap[word] || word);

  // First check for special cards (back, joker)
  for (let special of specialCards) {
    if (normalizedWords.includes(special)) {
      return special;
    }
  }

  // Then check for regular cards
  let bestScore = 0;
  let bestMatch = null;

  for (let value of cardNames.filter(name => !specialCards.includes(name))) {
    for (let suit of suits) {
      const combo = `${value}_of_${suit}`;
      const score = (normalizedWords.includes(value) ? 1 : 0) + (normalizedWords.includes(suit) ? 1 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = combo;
      }
    }
  }

  return bestMatch;
}

function showCard(cardName) {
  if (!cardName) return;
  
  // Special handling for "back" - also show joker
  if (cardName === "back") {
    showCard("redjoker");
  }
  
  let index = 0;
  function tryNextExt() {
    if (index >= extensions.length) {
      cardDisplay.src = `/EchoMind_2.0/images/cards/${fallbackCard}.png`;
      return;
    }
    const ext = extensions[index++];
    const imgPath = `/EchoMind_2.0/images/cards/${cardName}.${ext}`;
    cardDisplay.onerror = tryNextExt;
    cardDisplay.src = imgPath;
    if (navigator.vibrate && cardName !== fallbackCard) navigator.vibrate(100);
  }
  tryNextExt();
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Your browser does not support Speech Recognition");
    return;
  }

  // If we're already listening, don't start again
  if (isListening && recognition) {
    return;
  }

  // Create a new recognition instance
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = true;  // Keep a single session
  
  recognition.onresult = function(event) {
    // Get the last result
    const lastResult = event.results[event.results.length - 1];
    if (lastResult.isFinal) {
      const transcript = lastResult[0].transcript;
      const match = normalizeTranscript(transcript);
      if (match) {
        showCard(match);
      }
    }
  };

  recognition.onend = function() {
    // Only restart if we're still supposed to be listening and don't have an error
    if (isListening && recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.error('Error restarting recognition:', e);
      }
    }
  };

  recognition.onerror = function(event) {
    console.error('Recognition error:', event.error);
    
    if (event.error === 'not-allowed') {
      isListening = false;
      recognition = null;
      localStorage.removeItem(PERMISSION_GRANTED); // Clear stored permission
      alert('Microphone access is needed. Please allow access in your browser settings and try again.');
    } else if (event.error === 'audio-capture') {
      isListening = false;
      alert('No microphone found. Please connect a microphone and try again.');
    } else if (event.error === 'network') {
      // Network errors might be temporary, try to restart
      if (isListening) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }, 1000);
      }
    }
    // For other errors, the onend handler will restart if needed
  };

  isListening = true;
  showCard(fallbackCard);
  
  try {
    recognition.start();
  } catch (e) {
    console.error('Error starting recognition:', e);
  }
}

function handleTouchStart(e) {
  startY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  if (!startY) return;
  
  const endY = e.changedTouches[0].clientY;
  const deltaY = endY - startY;
  
  // If swiped up more than 50px
  if (deltaY < -50) {
    if (isListening) {
      isListening = false;
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
    }
    container.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    // Clear setup status when ending trick
    localStorage.removeItem(SETUP_COMPLETED);
  }
  
  startY = null;
}

async function beginPerformance() {
  try {
    // Request microphone permission first
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // If we got here, permission was granted
    localStorage.setItem(PERMISSION_GRANTED, 'true');
    localStorage.setItem(SETUP_COMPLETED, 'true');
    
    setupScreen.classList.add('hidden');
    container.classList.remove('hidden');
    
    // Start the mind reading experience
    startListening();
    
    // Clean up the stream we used for permission
    stream.getTracks().forEach(track => track.stop());
    stream = null;
    
  } catch (err) {
    console.error('Microphone permission error:', err);
    localStorage.removeItem(PERMISSION_GRANTED);
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      alert('Please allow microphone access to use the mind reader.');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      alert('No microphone found. Please connect a microphone and try again.');
    } else {
      alert('Error accessing microphone. Please check your settings and try again.');
    }
  }
}

// Set up event listeners
setupBtn.addEventListener('click', beginPerformance);
container.addEventListener('touchstart', handleTouchStart);
container.addEventListener('touchend', handleTouchEnd);

// Check setup status when page loads
window.addEventListener('load', checkSetupStatus); 