import React, { useState, useEffect } from 'react';
import './MindReader.css';

const MindReader = () => {
  const [stage, setStage] = useState('intro'); // intro, thinking, reveal
  const [userThought, setUserThought] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [visualEffect, setVisualEffect] = useState('');

  const psychologicalPatterns = {
    // Common thought patterns based on psychological principles
    'future': ['tomorrow', 'next week', 'future', 'planning', 'later'],
    'past': ['yesterday', 'last week', 'remember', 'memory', 'before'],
    'emotion': ['happy', 'sad', 'excited', 'worried', 'angry', 'love', 'hate'],
    'activity': ['work', 'play', 'exercise', 'read', 'write', 'watch', 'listen'],
    'location': ['home', 'work', 'school', 'outside', 'travel', 'place'],
    'people': ['friend', 'family', 'someone', 'person', 'they', 'them'],
    'time': ['morning', 'afternoon', 'evening', 'night', 'today', 'now'],
    'object': ['thing', 'item', 'object', 'something', 'stuff'],
    'decision': ['choose', 'decide', 'pick', 'select', 'option'],
    'problem': ['issue', 'problem', 'trouble', 'difficulty', 'challenge']
  };

  const predictionTemplates = {
    'future': [
      'You were thinking about something that will happen in the future',
      'Your mind was focused on upcoming events',
      'You were planning something for later'
    ],
    'past': [
      'You were reminiscing about the past',
      'A memory from before was on your mind',
      'You were thinking about something that happened earlier'
    ],
    'emotion': [
      'You were feeling a strong emotion',
      'Your thoughts were colored by your feelings',
      'An emotional experience was on your mind'
    ],
    'activity': [
      'You were thinking about something you do regularly',
      'An activity you enjoy was on your mind',
      'You were planning to do something specific'
    ],
    'location': [
      'You were thinking about a specific place',
      'A location was prominent in your thoughts',
      'Your mind was focused on somewhere you know'
    ],
    'people': [
      'You were thinking about someone important to you',
      'A person was on your mind',
      'Your thoughts were about someone you know'
    ],
    'time': [
      'You were thinking about a specific time',
      'The timing of something was on your mind',
      'You were focused on when something would happen'
    ],
    'object': [
      'You were thinking about a specific object',
      'Something material was on your mind',
      'Your thoughts were about a particular item'
    ],
    'decision': [
      'You were making an important decision',
      'A choice was weighing on your mind',
      'You were thinking about different options'
    ],
    'problem': [
      'You were working through a problem',
      'A challenge was on your mind',
      'You were thinking about how to solve something'
    ]
  };

  const handleThoughtSubmit = async (e) => {
    e.preventDefault();
    if (!userThought.trim()) return;

    setIsProcessing(true);
    setStage('thinking');
    setVisualEffect('pulse');

    // Simulate mind reading process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const prediction = generatePrediction(userThought);
    setPrediction(prediction);
    setStage('reveal');
    setVisualEffect('reveal');
    setIsProcessing(false);
  };

  const generatePrediction = (thought) => {
    // Analyze the thought for psychological patterns
    const matches = Object.entries(psychologicalPatterns).reduce((acc, [category, patterns]) => {
      const matchCount = patterns.filter(pattern => 
        thought.toLowerCase().includes(pattern)
      ).length;
      if (matchCount > 0) {
        acc.push({ category, confidence: matchCount / patterns.length });
      }
      return acc;
    }, []);

    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);

    // Get the best matching category
    const bestMatch = matches[0]?.category || 'general';
    
    // Select a random template from the best matching category
    const templates = predictionTemplates[bestMatch] || 
      ['I sense something interesting in your thoughts'];
    
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const resetTrick = () => {
    setStage('intro');
    setUserThought('');
    setPrediction('');
    setVisualEffect('');
  };

  return (
    <div className={`mind-reader ${visualEffect}`}>
      {stage === 'intro' && (
        <div className="intro-stage">
          <h2>Mind Reading Experience</h2>
          <p>Think of something specific, and I'll try to read your mind...</p>
          <form onSubmit={handleThoughtSubmit} className="thought-form">
            <input
              type="text"
              value={userThought}
              onChange={(e) => setUserThought(e.target.value)}
              placeholder="What's on your mind?"
              disabled={isProcessing}
            />
            <button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Reading...' : 'Read My Mind'}
            </button>
          </form>
        </div>
      )}

      {stage === 'thinking' && (
        <div className="thinking-stage">
          <div className="mind-reading-animation">
            <div className="brain-waves"></div>
            <div className="thought-bubbles"></div>
          </div>
          <p>Reading your thoughts...</p>
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
    </div>
  );
};

export default MindReader; 