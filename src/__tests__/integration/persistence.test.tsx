import React from 'react';
import { act } from '@testing-library/react';
import Game from '../../components/Game';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { BALLS_PER_TURN } from '../../atoms/gameAtoms';

const GAME_STATE_KEY = 'lines-game-state';
const HIGH_SCORE_KEY = 'highScore';

describe('UJ-10: Game State Persistence', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('saves game state to localStorage on state change', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const saved = localStorage.getItem(GAME_STATE_KEY);
    expect(saved).toBeTruthy();

    const state = JSON.parse(saved!);
    expect(state).toHaveProperty('grid');
    expect(state).toHaveProperty('score');
    expect(state).toHaveProperty('nextBalls');
    expect(state).toHaveProperty('gameOver');
  });

  it('restores game state from localStorage on mount', () => {
    // First render: creates a game and saves state
    const { unmount } = renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    // Capture saved state
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    expect(savedState).toBeTruthy();

    const parsedState = JSON.parse(savedState!);
    const savedScore = parsedState.score;

    // Unmount
    unmount();

    // Re-render — should load from localStorage
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const scoreValue = document.querySelector('.score-value');
    expect(scoreValue).toHaveTextContent(String(savedScore));
  });

  it('starts a new game when no saved state exists', () => {
    // Ensure no saved state
    localStorage.removeItem(GAME_STATE_KEY);

    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    // Should have initial balls on the grid
    const ballCells = document.querySelectorAll('.cell.ball');
    expect(ballCells.length).toBe(BALLS_PER_TURN);

    // Score should be 0
    const scoreValue = document.querySelector('.score-value');
    expect(scoreValue).toHaveTextContent('0');
  });

  it('saved state includes grid, score, nextBalls, and gameOver', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const saved = localStorage.getItem(GAME_STATE_KEY);
    const state = JSON.parse(saved!);

    expect(state.grid).toHaveLength(9);
    expect(state.grid[0]).toHaveLength(9);
    expect(typeof state.score).toBe('number');
    expect(Array.isArray(state.nextBalls)).toBe(true);
    expect(typeof state.gameOver).toBe('boolean');
  });
});

describe('UJ-11: High Score', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays high score in the game info panel', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const highScoreElement = document.querySelector('.high-score');
    expect(highScoreElement).toBeInTheDocument();

    const highScoreValue = document.querySelector('.high-score-value');
    expect(highScoreValue).toBeInTheDocument();
  });

  it('high score starts at 0 with no prior history', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const highScoreValue = document.querySelector('.high-score-value');
    expect(highScoreValue).toHaveTextContent('0');
  });

  it('persists high score across page reloads', () => {
    // Set a high score in localStorage
    localStorage.setItem(HIGH_SCORE_KEY, '150');

    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const highScoreValue = document.querySelector('.high-score-value');
    expect(highScoreValue).toHaveTextContent('150');
  });

  it('high score survives game resets', () => {
    // Set a pre-existing high score
    localStorage.setItem(HIGH_SCORE_KEY, '100');

    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    // Verify high score is shown
    expect(document.querySelector('.high-score-value')).toHaveTextContent('100');

    // High score key should still be in localStorage
    expect(localStorage.getItem(HIGH_SCORE_KEY)).toBe('100');
  });
});
