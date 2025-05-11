import React, { useState, useEffect } from 'react';
import './GooglePeek.css';
import ReactDOM from 'react-dom';

const GooglePeek = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [prediction, setPrediction] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRevealed, setIsRevealed] = React.useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const prediction = generatePrediction(searchTerm);
    setPrediction(prediction);
    setIsLoading(false);
    setIsRevealed(true);
  };

  const generatePrediction = (term) => {
    // Simple pattern matching for demonstration
    const patterns = {
      'weather': 'You were searching for weather information',
      'news': 'You were looking for the latest news',
      'sports': 'You were interested in sports updates',
      'music': 'You were searching for music or artists',
      'movies': 'You were looking for movie information',
      'food': 'You were searching for recipes or restaurants',
      'travel': 'You were planning a trip or looking at destinations',
      'shopping': 'You were looking to buy something',
      'health': 'You were searching for health-related information',
      'education': 'You were looking for educational content'
    };

    // Find the best matching pattern
    const bestMatch = Object.entries(patterns).reduce((best, [key, value]) => {
      if (term.toLowerCase().includes(key)) {
        return { key, value };
      }
      return best;
    }, { value: 'You were searching for something interesting' });

    return bestMatch.value;
  };

  const resetTrick = () => {
    setSearchTerm('');
    setPrediction('');
    setIsRevealed(false);
  };

  return (
    <div className="google-peek">
      <h2>Google Peek</h2>
      <p>Enter what you'd like to search for, and I'll try to predict it!</p>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="What would you like to search for?"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Predicting...' : 'Predict Search'}
        </button>
      </form>

      {isRevealed && (
        <div className="prediction-reveal">
          <h3>I predict you were searching for:</h3>
          <p>{prediction}</p>
          <button onClick={resetTrick} className="try-again">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<GooglePeek />, document.getElementById('root')); 