import React from 'react';
import { screen, act } from '@testing-library/react';
import Game from '../../components/Game';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { GRID_SIZE, BALLS_PER_TURN } from '../../atoms/gameAtoms';
import { en } from '../../translations/en';

describe('UJ-1: New Game Start', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders 81 cells (9x9 grid)', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const cells = document.querySelectorAll('.cell');
    expect(cells).toHaveLength(GRID_SIZE * GRID_SIZE);
  });

  it('renders 9 rows on the board', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const rows = document.querySelectorAll('.board-row');
    expect(rows).toHaveLength(GRID_SIZE);
  });

  it('places exactly 3 initial balls on the grid', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const ballCells = document.querySelectorAll('.cell.ball');
    expect(ballCells.length).toBe(BALLS_PER_TURN);
  });

  it('shows 3 balls in the Next Balls panel', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const nextBalls = document.querySelectorAll('.next-ball');
    expect(nextBalls).toHaveLength(BALLS_PER_TURN);
  });

  it('displays score as 0', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const scoreValue = document.querySelector('.score-value');
    expect(scoreValue).toHaveTextContent('0');
  });

  it('displays the score label from translations', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const scoreLabel = document.querySelector('.score-label');
    expect(scoreLabel).toHaveTextContent(en.game.score);
  });

  it('displays the next balls title from translations', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const nextBallsTitle = document.querySelector('.next-balls-title');
    expect(nextBallsTitle).toHaveTextContent(en.game.nextBalls);
  });

  it('renders Reset Game and Help buttons', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(en.game.resetGame)).toBeInTheDocument();
    expect(screen.getByText(en.game.help)).toBeInTheDocument();
  });

  it('displays the board element', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
  });
});
