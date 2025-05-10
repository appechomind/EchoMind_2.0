import { useAIIntentHandler } from '../../../src/core/ai/intent-handler';

describe('AI Intent Handler', () => {
  let intentHandler;

  beforeEach(() => {
    intentHandler = useAIIntentHandler();
  });

  describe('processInput', () => {
    it('should process magic trick related input', async () => {
      const input = 'Show me a card trick';
      const response = await intentHandler.processInput(input);

      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('confidence');
      expect(response.confidence).toBeGreaterThan(0.7);
      expect(response.type).toBe('ai');
    });

    it('should handle empty input', async () => {
      const input = '';
      const response = await intentHandler.processInput(input);

      expect(response).toHaveProperty('type', 'error');
      expect(response.content).toContain('empty');
    });

    it('should handle low confidence inputs', async () => {
      const input = 'xyz123 random text';
      const response = await intentHandler.processInput(input);

      expect(response.confidence).toBeLessThan(0.3);
      expect(response).toHaveProperty('followUp');
    });
  });

  describe('getContext', () => {
    it('should return current context', () => {
      const context = intentHandler.getContext();

      expect(context).toHaveProperty('currentTrick');
      expect(context).toHaveProperty('lastIntent');
      expect(context).toHaveProperty('confidenceThreshold');
    });

    it('should update context after processing input', async () => {
      const input = 'Perform a mind reading trick';
      await intentHandler.processInput(input);
      const context = intentHandler.getContext();

      expect(context.currentTrick).toBe('mind_reading');
      expect(context.lastIntent).toBe('magic_trick');
    });
  });

  describe('calculateConfidence', () => {
    it('should calculate high confidence for exact matches', () => {
      const input = 'Show me a card trick';
      const confidence = intentHandler.calculateConfidence(input, 'magic_trick');

      expect(confidence).toBeGreaterThan(0.9);
    });

    it('should calculate medium confidence for partial matches', () => {
      const input = 'I want to see some magic';
      const confidence = intentHandler.calculateConfidence(input, 'magic_trick');

      expect(confidence).toBeBetween(0.4, 0.8);
    });

    it('should calculate low confidence for unrelated input', () => {
      const input = 'What is the weather today';
      const confidence = intentHandler.calculateConfidence(input, 'magic_trick');

      expect(confidence).toBeLessThan(0.3);
    });
  });

  describe('error handling', () => {
    it('should handle invalid actions gracefully', async () => {
      const input = 'perform invalid action';
      const response = await intentHandler.processInput(input);

      expect(response).toHaveProperty('type', 'error');
      expect(response.content).toContain('invalid');
    });

    it('should handle technical errors', async () => {
      // Simulate a technical error
      jest.spyOn(intentHandler, 'processInput').mockRejectedValueOnce(new Error('Technical error'));

      const input = 'Show me a trick';
      const response = await intentHandler.processInput(input);

      expect(response).toHaveProperty('type', 'error');
      expect(response.content).toContain('technical');
    });
  });
});

// Custom matcher
expect.extend({
  toBeBetween(received, lower, upper) {
    const pass = received >= lower && received <= upper;
    if (pass) {
      return {
        message: () => `expected ${received} not to be between ${lower} and ${upper}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be between ${lower} and ${upper}`,
        pass: false,
      };
    }
  },
}); 