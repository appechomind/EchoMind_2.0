const cardDisplay = document.getElementById('card-display');
const container = document.getElementById('container');
let startY = null;
let recognition = null;

const cardNames = ["ace","2","3","4","5","6","7","8","9","10","jack","queen","king"];
const suits = ["hearts","spades","diamonds","clubs"];
const fallbackCard = "back";
const extensions = ["png", "jpg", "jpeg", "webp", "PNG"];

const numberMap = {
  "two": "2", "three": "3", "four": "4", "five": "5",
  "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10"
};

// Add debug element
const debugElement = document.createElement('div');
debugElement.style.position = 'absolute';
debugElement.style.bottom = '10px';
debugElement.style.left = '10px';
debugElement.style.color = 'rgba(255, 255, 255, 0.7)';
debugElement.style.fontSize = '12px';
debugElement.style.fontFamily = 'monospace';
debugElement.style.zIndex = '1000';

function logDebug(message) {
  console.log(message);
  debugElement.innerHTML += message + '<br>';
  // Keep only last 5 messages
  const lines = debugElement.innerHTML.split('<br>');
  if (lines.length > 6) {
    debugElement.innerHTML = lines.slice(lines.length - 6).join('<br>');
  }
}

function normalizeTranscript(transcript) {
  const words = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  const normalizedWords = words.map(word => numberMap[word] || word);
  let bestScore = 0;
  let bestMatch = fallbackCard;

  logDebug(`Words heard: ${normalizedWords.join(', ')}`);

  for (let value of cardNames) {
    for (let suit of suits) {
      const combo = `${value}_of_${suit}`;
      const score = (normalizedWords.includes(value) ? 1 : 0) + (normalizedWords.includes(suit) ? 1 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = combo;
      }
    }
  }

  logDebug(`Best match: ${bestMatch} (score: ${bestScore})`);
  return bestMatch;
}

function showCard(cardName) {
  logDebug(`Showing card: ${cardName}`);
  
  let index = 0;
  function tryNextExt() {
    if (index >= extensions.length) {
      logDebug(`Falling back to: ${fallbackCard}.png`);
      cardDisplay.src = `images/cards/${fallbackCard}.png`;
      return;
    }
    const ext = extensions[index++];
    const imgPath = `images/cards/${cardName}.${ext}`;
    logDebug(`Trying: ${imgPath}`);
    
    cardDisplay.onerror = function() {
      logDebug(`Error loading: ${imgPath}`);
      tryNextExt();
    };
    
    cardDisplay.src = imgPath;
    if (navigator.vibrate && cardName !== fallbackCard) navigator.vibrate(100);
  }
  tryNextExt();
}

// Load script for permissions handler
function loadPermissionsHandler() {
  return new Promise((resolve) => {
    // Check if permissionsHandler is already loaded
    if (window.permissionsHandler) {
      logDebug("Permissions handler already loaded");
      resolve(true);
      return;
    }
    
    logDebug("Loading permissions handler script");
    const script = document.createElement('script');
    script.src = '../js/permissions-handler.js';
    script.onload = () => {
      logDebug("Permissions handler script loaded");
      resolve(true);
    };
    script.onerror = () => {
      logDebug("Failed to load permissions handler");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

// Request microphone access using the global handler if available
async function requestMicrophoneAccess() {
  if (window.permissionsHandler) {
    logDebug("Using global permissions handler");
    return window.permissionsHandler.requestMicrophonePermission();
  }
  
  // Fallback to direct request
  logDebug("Requesting microphone access directly");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (e) {
    logDebug(`Microphone permission error: ${e.message}`);
    return false;
  }
}

async function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Your browser does not support Speech Recognition");
    logDebug("Speech recognition not supported");
    return;
  }

  // Try to load the permissions handler first
  await loadPermissionsHandler();
  
  // Request microphone permission
  const permissionGranted = await requestMicrophoneAccess();
  if (!permissionGranted) {
    logDebug("Microphone permission denied");
    alert("Please grant microphone access to use this feature");
    return;
  }

  logDebug("Starting speech recognition...");
  
  // Create a new instance
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.lang = 'en-US';

  recognition.onstart = function() {
    logDebug("Speech recognition started");
  };

  recognition.onresult = function(event) {
    const transcript = event.results[event.results.length - 1][0].transcript;
    logDebug(`Heard: "${transcript}"`);
    
    const match = normalizeTranscript(transcript);
    showCard(match);
  };

  recognition.onerror = function(e) {
    logDebug(`Speech recognition error: ${e.error}`);
    // Try to restart after error
    setTimeout(() => {
      try {
        recognition.start();
      } catch (err) {
        logDebug(`Failed to restart: ${err.message}`);
      }
    }, 1000);
  };

  recognition.onend = function() {
    logDebug("Speech recognition ended, restarting...");
    // Automatically restart recognition when it ends
    try {
      recognition.start();
    } catch (err) {
      logDebug(`Failed to restart: ${err.message}`);
    }
  };

  try {
    recognition.start();
    showCard(fallbackCard);
  } catch (err) {
    logDebug(`Error starting recognition: ${err.message}`);
  }
}

function handleTouchStart(e) {
  startY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  const endY = e.changedTouches[0].clientY;
  if (startY && startY - endY > 50) {
    document.body.innerHTML = '<div style="color:white;text-align:center;margin-top:50vh;font-size:2em;">Trick Ended</div>';
  }
  startY = null;
}

window.onload = () => {
  document.body.appendChild(debugElement);
  logDebug("Mind Reader initializing...");
  
  if (cardDisplay) {
    logDebug("Card display element found");
  } else {
    logDebug("ERROR: Card display element not found!");
  }
  
  startListening();
  container.addEventListener('touchstart', handleTouchStart);
  container.addEventListener('touchend', handleTouchEnd);
};
