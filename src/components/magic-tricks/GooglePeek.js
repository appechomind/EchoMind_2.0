import React, { useState, useEffect } from 'react';
import './GooglePeek.css';

const GooglePeek = ({ role = 'spectator' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a prediction based on the search term
    const prediction = generatePrediction(searchTerm);
    setPrediction(prediction);
    setIsRevealed(true);
    setIsLoading(false);
  };

  const generatePrediction = (term) => {
    // This is where we'll implement the actual prediction logic
    // For now, we'll use a simple pattern matching approach
    const patterns = {
      'weather': 'You were thinking about checking the weather forecast',
      'news': 'You wanted to catch up on the latest news',
      'recipe': 'You were looking for a new recipe to try',
      'movie': 'You were thinking about watching a movie',
      'music': 'You wanted to listen to some music',
      'game': 'You were looking for a new game to play',
      'shopping': 'You were thinking about online shopping',
      'travel': 'You were planning a trip',
      'work': 'You were looking for work-related information',
      'study': 'You were searching for study materials'
    };

    // Find the best matching pattern
    const bestMatch = Object.entries(patterns).reduce((best, [key, value]) => {
      if (term.toLowerCase().includes(key) && (!best || key.length > best[0].length)) {
        return [key, value];
      }
      return best;
    }, null);

    return bestMatch ? bestMatch[1] : 'You were thinking about something interesting';
  };

  if (role === 'magician') {
    return (
      <div className="google-peek magician-view">
        <h2>Magician's View</h2>
        <div className="prediction-container">
          {prediction && (
            <div className="prediction">
              <h3>Prediction:</h3>
              <p>{prediction}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="google-peek spectator-view">
      <h2>What would you like to search for?</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter your search term..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Search'}
        </button>
      </form>
      
      {isRevealed && (
        <div className="reveal">
          <h3>I knew you were thinking about:</h3>
          <p className="prediction-text">{prediction}</p>
        </div>
      )}
    </div>
  );
};

export default GooglePeek; 