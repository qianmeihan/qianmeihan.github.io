import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the loading state while content is being fetched', () => {
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading portfolio');
  });
});
