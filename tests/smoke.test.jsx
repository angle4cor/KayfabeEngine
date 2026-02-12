import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Smoke', () => {
  it('renders app without crashing', async () => {
    render(<App />);
    expect(await screen.findByText(/Kayfabe Engine/i)).toBeInTheDocument();
  });
});
