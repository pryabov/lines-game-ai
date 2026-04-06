import React from 'react';
import { screen, act } from '@testing-library/react';
import Game from '../../components/Game';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { en } from '../../translations/en';

describe('UJ-4: Game Over', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not show Game Over dialog at game start', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    expect(document.querySelector('.game-over-overlay')).not.toBeInTheDocument();
  });

  it('shows correct score message for low score (< 50)', () => {
    // We test the GameOverDialog component directly for score messages
    const GameOverDialog = require('../../components/GameOverDialog').default;
    const mockPlayAgain = jest.fn();

    renderWithProviders(<GameOverDialog isOpen={true} score={25} onPlayAgain={mockPlayAgain} />);

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(en.gameOver.lowScore)).toBeInTheDocument();
  });

  it('shows correct score message for medium score (50-99)', () => {
    const GameOverDialog = require('../../components/GameOverDialog').default;
    const mockPlayAgain = jest.fn();

    renderWithProviders(<GameOverDialog isOpen={true} score={75} onPlayAgain={mockPlayAgain} />);

    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText(en.gameOver.mediumScore)).toBeInTheDocument();
  });

  it('shows correct score message for high score (100-199)', () => {
    const GameOverDialog = require('../../components/GameOverDialog').default;
    const mockPlayAgain = jest.fn();

    renderWithProviders(<GameOverDialog isOpen={true} score={150} onPlayAgain={mockPlayAgain} />);

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText(en.gameOver.highScore)).toBeInTheDocument();
  });

  it('shows correct score message for excellent score (>= 200)', () => {
    const GameOverDialog = require('../../components/GameOverDialog').default;
    const mockPlayAgain = jest.fn();

    renderWithProviders(<GameOverDialog isOpen={true} score={250} onPlayAgain={mockPlayAgain} />);

    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText(en.gameOver.excellentScore)).toBeInTheDocument();
  });

  it('displays Game Over title and Your Score label', () => {
    const GameOverDialog = require('../../components/GameOverDialog').default;
    const mockPlayAgain = jest.fn();

    renderWithProviders(<GameOverDialog isOpen={true} score={100} onPlayAgain={mockPlayAgain} />);

    expect(screen.getByText(en.gameOver.title)).toBeInTheDocument();
    expect(screen.getByText(en.gameOver.yourScore)).toBeInTheDocument();
  });

  it('calls onPlayAgain when Play Again button is clicked', () => {
    const GameOverDialog = require('../../components/GameOverDialog').default;
    const mockPlayAgain = jest.fn();

    renderWithProviders(<GameOverDialog isOpen={true} score={100} onPlayAgain={mockPlayAgain} />);

    act(() => {
      screen.getByText(en.gameOver.playAgain).click();
    });

    expect(mockPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    const GameOverDialog = require('../../components/GameOverDialog').default;
    const mockPlayAgain = jest.fn();

    renderWithProviders(<GameOverDialog isOpen={false} score={100} onPlayAgain={mockPlayAgain} />);

    expect(document.querySelector('.game-over-overlay')).not.toBeInTheDocument();
  });
});
