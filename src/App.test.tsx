import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the game board', () => {
  render(<App />);
  const boardElement = document.querySelector('.board');
  expect(boardElement).toBeInTheDocument();
});

test('renders score display', () => {
  render(<App />);
  const scoreElement = document.querySelector('.score');
  expect(scoreElement).toBeInTheDocument();
});
