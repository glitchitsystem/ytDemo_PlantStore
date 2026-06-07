import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('renders the app without crashing', () => {
  render(<App />);
  expect(screen.getByText(/PlantShop/i)).toBeInTheDocument();
});

test('renders main navigation links', () => {
  render(<App />);
  // Header and Footer both contain Products/Cart links, so use getAllByRole
  expect(screen.getAllByRole('link', { name: /^Products$/i })).not.toHaveLength(0);
  expect(screen.getAllByRole('link', { name: /^Cart$/i })).not.toHaveLength(0);
});

test('renders the home page by default', () => {
  render(<App />);
  expect(screen.getByText('Welcome to GreenThumb Garden')).toBeInTheDocument();
});
