import { create } from 'zustand';

const useIntentStore = create((set, get) => ({
  // State
  context: {
    currentTrick: null,
    lastIntent: null,
    userPreferences: {},
    sessionHistory: [],
    confidenceThreshold: 0.7
  },

  // Intent patterns
  intentPatterns: {
    magic_trick: [
      'perform magic',
      'do a trick',
      'show me magic',
      'magic trick',
      'magic show',
      'perform a magic trick',
      'show me some magic',
      'let\'s do magic',
      'can you do magic',
      'magic performance'
    ],
    card_trick: [
      'card trick',
      'playing card',
      'show me a card',
      'pick a card',
      'card magic',
      'show me a card trick',
      'do a card trick',
      'card prediction',
      'card reveal',
      'card selection'
    ],
    mind_reading: [
      'read my mind',
      'what am I thinking',
      'guess my thought',
      'mind reading',
      'telepathy',
      'read my thoughts',
      'guess what I\'m thinking',
      'mind reading trick',
      'thought reading',
      'mentalism'
    ],
    google_peek: [
      'google peek',
      'search peek',
      'see my search',
      'peek at search',
      'search magic',
      'google magic trick',
      'search prediction',
      'search reveal',
      'google mind reading',
      'search mind reading'
    ]
  },

  // Response templates
  responseTemplates: {
    magic_trick: {
      message: (context) => {
        if (context.currentTrick) {
          return `I see you're already doing a ${context.currentTrick} trick. Would you like to continue or try something different?`;
        }
        return "I'll help you perform a magic trick. Would you like to try a card trick, mind reading, or the Google peek?";
      },
      actions: ['card_trick', 'mind_reading', 'google_peek'],
      followUp: "Which type of magic would you like to try?",
      contextUpdate: { currentTrick: null }
    },
    card_trick: {
      message: (context) => {
        if (context.userPreferences.cardTrick) {
          return `I remember you like ${context.userPreferences.cardTrick}. Would you like to try that again or something new?`;
        }
        return "Let's do a card trick! Think of any playing card and say it out loud. I'll show it to you.";
      },
      actions: ['start_listening'],
      followUp: "What card are you thinking of?",
      contextUpdate: { currentTrick: 'card' }
    },
    mind_reading: {
      message: (context) => {
        if (context.userPreferences.mindReading) {
          return `I remember your mind reading preferences. Would you like to try that again?`;
        }
        return "I'll read your mind! Think of something and I'll try to guess it.";
      },
      actions: ['start_listening'],
      followUp: "What are you thinking about?",
      contextUpdate: { currentTrick: 'mind_reading' }
    },
    google_peek: {
      message: (context) => {
        if (context.userPreferences.googlePeek) {
          return `I remember your Google peek preferences. Would you like to try that again?`;
        }
        return "Let's try the Google peek trick! Choose whether you want to be the magician or spectator.";
      },
      actions: ['magician_view', 'spectator_view'],
      followUp: "Which role would you like to play?",
      contextUpdate: { currentTrick: 'google_peek' }
    }
  },

  // Error responses
  errorResponses: {
    no_input: "I didn't catch that. Could you please repeat?",
    low_confidence: "I'm not quite sure what you mean. Could you try saying that differently?",
    invalid_action: "I can't do that right now. Would you like to try something else?",
    technical_error: "I'm having trouble understanding. Let's try again.",
    context_error: "I need more information to help you with that. Could you be more specific?",
    permission_error: "I need your permission to do that. Would you like to grant it?",
    timeout_error: "I'm taking too long to respond. Let's try that again."
  },

  // Actions
  analyzeIntent: (text) => {
    const state = get();
    text = text.toLowerCase();
    let matchedIntent = null;
    let confidence = 0;

    for (const [intent, patterns] of Object.entries(state.intentPatterns)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          const patternConfidence = state.calculateConfidence(text, pattern, state.context);
          if (patternConfidence > confidence) {
            confidence = patternConfidence;
            matchedIntent = intent;
          }
        }
      }
    }

    return {
      intent: matchedIntent,
      confidence: confidence,
      text: text
    };
  },

  calculateConfidence: (text, pattern, context) => {
    // Word matching score
    const words = text.split(' ');
    const patternWords = pattern.split(' ');
    const matchingWords = words.filter(word => patternWords.includes(word));
    const wordScore = matchingWords.length / patternWords.length;

    // Word order score
    const textOrder = words.map(word => patternWords.indexOf(word));
    const orderScore = textOrder.reduce((acc, curr, i) => {
      if (curr === -1) return acc;
      return acc + (i === curr ? 1 : 0.5);
    }, 0) / patternWords.length;

    // Context score
    const contextScore = context.lastIntent === pattern ? 0.2 : 0;

    // Final confidence calculation
    return (wordScore * 0.4) + (orderScore * 0.4) + (contextScore * 0.2);
  },

  getResponse: (intent, confidence = 0, context = {}) => {
    const state = get();
    const response = {
      message: '',
      actions: [],
      followUp: '',
      confidence: confidence,
      timestamp: Date.now(),
      context: context
    };

    if (!intent || confidence < state.context.confidenceThreshold) {
      response.message = state.errorResponses.low_confidence;
      response.error = true;
      return response;
    }

    const template = state.responseTemplates[intent];
    if (!template) {
      response.message = state.errorResponses.invalid_action;
      response.error = true;
      return response;
    }

    response.message = typeof template.message === 'function' 
      ? template.message(context) 
      : template.message;
    response.actions = template.actions;
    response.followUp = template.followUp;

    // Update context
    if (template.contextUpdate) {
      set(state => ({
        context: {
          ...state.context,
          ...template.contextUpdate,
          lastIntent: intent
        }
      }));
    }

    return response;
  },

  processInput: (text) => {
    const state = get();
    if (!text || text.trim() === '') {
      return {
        message: state.errorResponses.no_input,
        error: true,
        timestamp: Date.now()
      };
    }

    const { intent, confidence, text: processedText } = state.analyzeIntent(text);
    const response = state.getResponse(intent, confidence, state.context);

    // Add to session history
    set(state => ({
      context: {
        ...state.context,
        sessionHistory: [
          ...state.context.sessionHistory,
          {
            input: processedText,
            intent,
            confidence,
            response,
            timestamp: Date.now()
          }
        ]
      }
    }));

    return response;
  },

  resetSessionTimer: () => {
    set(state => ({
      context: {
        ...state.context,
        sessionHistory: []
      }
    }));
  },

  updateUserPreferences: (preferences) => {
    set(state => ({
      context: {
        ...state.context,
        userPreferences: {
          ...state.context.userPreferences,
          ...preferences
        }
      }
    }));
  },

  addIntentPattern: (intent, patterns) => {
    set(state => ({
      intentPatterns: {
        ...state.intentPatterns,
        [intent]: [
          ...(state.intentPatterns[intent] || []),
          ...patterns
        ]
      }
    }));
  },

  addResponseTemplate: (intent, template) => {
    set(state => ({
      responseTemplates: {
        ...state.responseTemplates,
        [intent]: template
      }
    }));
  }
}));

export default useIntentStore; 