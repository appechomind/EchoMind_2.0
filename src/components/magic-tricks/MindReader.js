import React, { useState, useEffect } from 'react';
import './MindReader.css';

const MindReader = () => {
  const [stage, setStage] = React.useState('intro'); // intro, thinking, reveal
  const [userThought, setUserThought] = React.useState('');
  const [prediction, setPrediction] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [visualEffect, setVisualEffect] = React.useState('');
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [isListening, setIsListening] = React.useState(false);
  const [recognition, setRecognition] = React.useState(null);

  const cards = [
    { id: 1, symbol: '♠', color: 'black' },
    { id: 2, symbol: '♥', color: 'red' },
    { id: 3, symbol: '♦', color: 'red' },
    { id: 4, symbol: '♣', color: 'black' }
  ];

  React.useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        // Check for card names in the transcript
        const cardNames = {
          'ace of spades': { image: 'ace_of_spades.png' },
          'ace of hearts': { image: 'ace_of_hearts.png' },
          'ace of diamonds': { image: 'ace_of_diamonds.png' },
          'ace of clubs': { image: 'ace_of_clubs.png' },
          'king of spades': { image: 'king_of_spades.png' },
          'king of hearts': { image: 'king_of_hearts.png' },
          'king of diamonds': { image: 'king_of_diamonds.png' },
          'king of clubs': { image: 'king_of_clubs.png' },
          'queen of spades': { image: 'queen_of_spades.png' },
          'queen of hearts': { image: 'queen_of_hearts.png' },
          'queen of diamonds': { image: 'queen_of_diamonds.png' },
          'queen of clubs': { image: 'queen_of_clubs.png' },
          'jack of spades': { image: 'jack_of_spades.png' },
          'jack of hearts': { image: 'jack_of_hearts.png' },
          'jack of diamonds': { image: 'jack_of_diamonds.png' },
          'jack of clubs': { image: 'jack_of_clubs.png' }
        };

        for (const [name, card] of Object.entries(cardNames)) {
          if (transcript.includes(name)) {
            setSelectedCard(card);
            setIsListening(false);
            recognition.stop();
            break;
          }
        }
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      setRecognition(recognition);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      setIsListening(false);
      recognition.stop();
    }
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setIsProcessing(true);
    setStage('thinking');
    setVisualEffect('pulse');

    // Simulate mind reading process
    setTimeout(() => {
      setPrediction(`I sense you chose the ${card.color} ${card.symbol} card`);
      setStage('reveal');
      setVisualEffect('reveal');
      setIsProcessing(false);
    }, 2000);
  };

  const resetTrick = () => {
    setStage('intro');
    setSelectedCard(null);
    setPrediction('');
    setVisualEffect('');
  };

  return (
    <div className={`mind-reader ${visualEffect}`}>
      {stage === 'intro' && (
        <div className="intro-stage">
          <h2>Mind Reading Experience</h2>
          <p>Pick a card, any card...</p>
          <div className="card-grid">
            {cards.map(card => (
              <div
                key={card.id}
                className={`card ${card.color}`}
                onClick={() => handleCardSelect(card)}
              >
                {card.symbol}
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'thinking' && (
        <div className="thinking-stage">
          <div className="mind-reading-animation">
            <div className="brain-waves"></div>
            <div className="thought-bubbles"></div>
          </div>
          <p>Reading your mind...</p>
        </div>
      )}

      {stage === 'reveal' && (
        <div className="reveal-stage">
          <h3>I sense that...</h3>
          <div className="prediction">
            <p>{prediction}</p>
          </div>
          <button onClick={resetTrick} className="try-again">
            Try Again
          </button>
        </div>
      )}

      <div className="card-container">
        {selectedCard ? (
          <div className="card">
            <img src={`../../images/cards/${selectedCard.image}`} alt={selectedCard.image.replace('.png', '').replace(/_/g, ' ')} />
          </div>
        ) : (
          <div className="card-back">
            <img src="../../images/cards/back.png" alt="Card Back" />
          </div>
        )}
      </div>
      <div className="voice-controls">
        <button 
          onClick={startListening}
          className={isListening ? 'listening' : ''}
        >
          {isListening ? 'Listening...' : 'Start Voice Command'}
        </button>
        <button onClick={stopListening}>Stop</button>
      </div>
    </div>
  );
};

export default MindReader; 