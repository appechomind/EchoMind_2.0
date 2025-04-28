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
container.appendChild(debugElement);

function logDebug(message) {
  console.log(message);
  debugElement.innerHTML += message + '<br>';
  // Keep only last 5 messages
  const lines = debugElement.innerHTML.split('<br>');
  if (lines.length > 6) {
    debugElement.innerHTML = lines.slice(lines.length - 6).join('<br>');
  }
}

async function normalizeTranscript(transcript) {
  // Process input through language model
  const response = await languageModel.processInput(transcript);
  const words = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  const normalizedWords = words.map(word => numberMap[word] || word);
  let bestScore = 0;
  let bestMatch = fallbackCard;

  logDebug(`Words heard: ${normalizedWords.join(', ')}`);
  logDebug(`Language model confidence: ${response.confidence.toFixed(2)}`);

  // Extract entities from language model response
  const entities = response.entities || [];
  const numbers = entities.filter(e => e.type === 'number').map(e => e.value.toString());
  const properNouns = entities.filter(e => e.type === 'proper_noun').map(e => e.value.toLowerCase());

  // Combine all potential matches
  const potentialMatches = [...normalizedWords, ...numbers, ...properNouns];

  for (let value of cardNames) {
    for (let suit of suits) {
      const combo = `${value}_of_${suit}`;
      const score = (potentialMatches.includes(value) ? 1 : 0) + 
                   (potentialMatches.includes(suit) ? 1 : 0) +
                   (response.confidence * 0.5); // Add language model confidence
      
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

// Load required scripts
async function loadDependencies() {
  const scripts = [
    '../js/permissions-handler.js',
    '../js/core/language-model.js'
  ];

  for (const src of scripts) {
    await new Promise((resolve, reject) => {
      if (src.includes('language-model.js') && window.languageModel) {
        resolve();
        return;
      }
      if (src.includes('permissions-handler.js') && window.permissionsHandler) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }).catch(err => {
      logDebug(`Failed to load ${src}: ${err}`);
    });
  }
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

  // Load dependencies first
  await loadDependencies();
  
  // Initialize language model
  if (window.languageModel) {
    await languageModel.initialize();
    logDebug("Language model initialized");
  } else {
    logDebug("Language model not available");
  }
  
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

  recognition.onresult = async function(event) {
    const transcript = event.results[event.results.length - 1][0].transcript;
    logDebug(`Heard: "${transcript}"`);
    
    const match = await normalizeTranscript(transcript);
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

function handleTouchMove(e) {
  if (startY === null) return;
  
  const currentY = e.touches[0].clientY;
  const diff = startY - currentY;
  
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      startListening();
    }
    startY = null;
  }
}

function handleTouchEnd() {
  startY = null;
}

// Add touch event listeners
container.addEventListener('touchstart', handleTouchStart);
container.addEventListener('touchmove', handleTouchMove);
container.addEventListener('touchend', handleTouchEnd);

// Start listening on page load
document.addEventListener('DOMContentLoaded', startListening);
