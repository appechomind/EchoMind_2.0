
const cardDisplay = document.getElementById('card-display');
const container = document.getElementById('container');
let startY = null;

const cardNames = ["ace","2","3","4","5","6","7","8","9","10","jack","queen","king"];
const suits = ["hearts","spades","diamonds","clubs"];
const fallbackCard = "back";
const extensions = ["png", "jpg", "jpeg", "webp", "PNG"];

const numberMap = {
  "two": "2", "three": "3", "four": "4", "five": "5",
  "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10"
};

function normalizeTranscript(transcript) {
  const words = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  const normalizedWords = words.map(word => numberMap[word] || word);
  let bestScore = 0;
  let bestMatch = fallbackCard;

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

  return bestMatch;
}

function showCard(cardName) {
  let index = 0;
  function tryNextExt() {
    if (index >= extensions.length) {
      cardDisplay.src = `images/cards/${fallbackCard}.png`;
      return;
    }
    const ext = extensions[index++];
    const imgPath = `images/cards/${cardName}.${ext}`;
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

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';

  recognition.onresult = function(event) {
    const transcript = event.results[event.results.length - 1][0].transcript;
    const match = normalizeTranscript(transcript);
    showCard(match);
  };

  recognition.onerror = function(e) {
    console.error("Speech recognition error", e);
  };

  recognition.start();
  showCard(fallbackCard);
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
  startListening();
  container.addEventListener('touchstart', handleTouchStart);
  container.addEventListener('touchend', handleTouchEnd);
};
