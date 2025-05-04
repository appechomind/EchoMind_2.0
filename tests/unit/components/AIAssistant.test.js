import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIAssistant from '../../../src/components/ai-assistant/AIAssistant';
import { useAIIntentHandler } from '../../../src/core/ai/intent-handler';
import FractalRenderer from '../../../src/core/ui/fractal-renderer';

// Mock the AI intent handler
jest.mock('../../../src/core/ai/intent-handler');

// Mock the fractal renderer
jest.mock('../../../src/core/ui/fractal-renderer');

describe('AIAssistant', () => {
  const mockProcessInput = jest.fn();
  const mockGetContext = jest.fn();

  beforeEach(() => {
    // Setup mocks
    useAIIntentHandler.mockReturnValue({
      processInput: mockProcessInput,
      getContext: mockGetContext
    });

    FractalRenderer.mockImplementation(() => ({
      destroy: jest.fn(),
      updateOptions: jest.fn()
    }));

    // Clear mock calls
    mockProcessInput.mockClear();
    mockGetContext.mockClear();
    FractalRenderer.mockClear();
  });

  it('renders without crashing', () => {
    render(<AIAssistant />);
    expect(screen.getByPlaceholderText(/ask me about magic tricks/i)).toBeInTheDocument();
  });

  it('initializes fractal renderer', () => {
    render(<AIAssistant />);
    expect(FractalRenderer).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        color: '#a96eff',
        speed: 0.01,
        complexity: 60
      })
    );
  });

  it('handles user input submission', async () => {
    const mockResponse = {
      type: 'ai',
      message: 'I can help you with that',
      confidence: 0.8,
      actions: ['Show card trick', 'Mind reading']
    };

    mockProcessInput.mockResolvedValueOnce(mockResponse);
    mockGetContext.mockReturnValue({ confidence: 0.8 });

    render(<AIAssistant />);

    const input = screen.getByPlaceholderText(/ask me about magic tricks/i);
    const submitButton = screen.getByText(/send/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Show me a magic trick' } });
      fireEvent.click(submitButton);
    });

    expect(mockProcessInput).toHaveBeenCalledWith('Show me a magic trick');
    expect(screen.getByText('I can help you with that')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 80%')).toBeInTheDocument();
  });

  it('displays error messages', async () => {
    mockProcessInput.mockRejectedValueOnce(new Error('Test error'));

    render(<AIAssistant />);

    const input = screen.getByPlaceholderText(/ask me about magic tricks/i);
    const submitButton = screen.getByText(/send/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test input' } });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
  });

  it('handles action button clicks', async () => {
    const mockResponse = {
      type: 'ai',
      message: 'Choose a trick',
      actions: ['Card trick', 'Mind reading']
    };

    mockProcessInput
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce({ type: 'ai', message: 'Performing card trick' });

    render(<AIAssistant />);

    // Submit initial input
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/ask me about magic tricks/i), {
        target: { value: 'Show tricks' }
      });
      fireEvent.click(screen.getByText(/send/i));
    });

    // Click action button
    await act(async () => {
      fireEvent.click(screen.getByText('Card trick'));
    });

    expect(mockProcessInput).toHaveBeenCalledTimes(2);
    expect(mockProcessInput).toHaveBeenLastCalledWith('Card trick');
    expect(screen.getByText('Performing card trick')).toBeInTheDocument();
  });

  it('updates fractal based on AI response', async () => {
    const mockFractalUpdate = jest.fn();
    FractalRenderer.mockImplementation(() => ({
      destroy: jest.fn(),
      updateOptions: mockFractalUpdate
    }));

    mockProcessInput.mockResolvedValueOnce({
      type: 'ai',
      message: 'Test response',
      confidence: 0.9
    });

    mockGetContext.mockReturnValue({ confidence: 0.9 });

    render(<AIAssistant />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/ask me about magic tricks/i), {
        target: { value: 'Test input' }
      });
      fireEvent.click(screen.getByText(/send/i));
    });

    expect(mockFractalUpdate).toHaveBeenCalledWith({
      speed: 0.018,
      complexity: expect.any(Number)
    });
  });

  it('disables input during processing', async () => {
    mockProcessInput.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AIAssistant />);

    const input = screen.getByPlaceholderText(/ask me about magic tricks/i);
    const submitButton = screen.getByText(/send/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test input' } });
      fireEvent.click(submitButton);
    });

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/processing/i);
  });

  it('cleans up fractal renderer on unmount', () => {
    const mockDestroy = jest.fn();
    FractalRenderer.mockImplementation(() => ({
      destroy: mockDestroy,
      updateOptions: jest.fn()
    }));

    const { unmount } = render(<AIAssistant />);
    unmount();

    expect(mockDestroy).toHaveBeenCalled();
  });
}); 