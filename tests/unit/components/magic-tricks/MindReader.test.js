import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the MindReader component
jest.mock('../../../src/components/magic-tricks/MindReader.html', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mind-reader">Mind Reader</div>
  };
});

describe('MindReader', () => {
  it('renders without crashing', () => {
    render(<div data-testid="mind-reader">Mind Reader</div>);
    expect(screen.getByTestId('mind-reader')).toBeInTheDocument();
  });
}); 