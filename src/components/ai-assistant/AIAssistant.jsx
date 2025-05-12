import React, { useEffect, useRef, useState } from 'react';
import FractalRenderer from '../../core/ui/fractal-renderer';
import useIntentStore from '../../core/ai/intent-handler';
import './AIAssistant.css';

const AIAssistant = () => {
  const containerRef = useRef(null);
  const fractalRef = useRef(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processInput = useIntentStore(state => state.processInput);
  const getContext = useIntentStore(state => state.context);

  useEffect(() => {
    // Initialize fractal renderer
    if (containerRef.current && !fractalRef.current) {
      fractalRef.current = new FractalRenderer(containerRef.current, {
        color: '#a96eff',
        speed: 0.01,
        complexity: 60
      });
    }

    return () => {
      if (fractalRef.current) {
        fractalRef.current.destroy();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setHistory(prev => [...prev, { type: 'user', content: input }]);

    try {
      const response = await processInput(input);
      setHistory(prev => [...prev, { type: 'ai', ...response }]);
      
      // Update fractal based on AI response
      if (fractalRef.current) {
        const context = getContext();
        fractalRef.current.updateOptions({
          speed: context.confidence * 0.02,
          complexity: Math.min(60, context.confidence * 2)
        });
      }
    } catch (error) {
      setHistory(prev => [...prev, {
        type: 'error',
        content: 'An error occurred while processing your request.'
      }]);
    } finally {
      setIsProcessing(false);
      setInput('');
    }
  };

  const handleActionClick = (action) => {
    setInput(action);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="ai-assistant">
      <div ref={containerRef} className="fractal-container" />
      
      <div className="content-container">
        <div className="history">
          {history.map((item, index) => (
            <div key={index} className={`message ${item.type}`}>
              {item.type === 'user' && (
                <div className="user-message">{item.content}</div>
              )}
              
              {item.type === 'ai' && (
                <div className="ai-message">
                  <div className="message-content">{item.message}</div>
                  
                  {item.confidence && (
                    <div className="confidence">
                      Confidence: {Math.round(item.confidence * 100)}%
                    </div>
                  )}
                  
                  {item.actions && item.actions.length > 0 && (
                    <div className="actions">
                      {item.actions.map((action, i) => (
                        <button
                          key={i}
                          className="action-button"
                          onClick={() => handleActionClick(action)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {item.followUp && (
                    <div className="follow-up">
                      <div className="follow-up-label">Follow-up:</div>
                      <div className="follow-up-content">{item.followUp}</div>
                    </div>
                  )}
                </div>
              )}
              
              {item.type === 'error' && (
                <div className="error-message">{item.content}</div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about magic tricks..."
            disabled={isProcessing}
          />
          <button type="submit" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant; 