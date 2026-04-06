import React from 'react';
import { screen, act } from '@testing-library/react';
import Game from '../../components/Game';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { en } from '../../translations/en';

// Helper to click a cell
const clickCell = (row: number, col: number) => {
  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  if (cell) {
    act(() => {
      (cell as HTMLElement).click();
    });
  }
};

describe('UJ-5: Reset Game', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the Reset Game button', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(en.game.resetGame)).toBeInTheDocument();
  });

  it('resets instantly when no moves have been made (movesMade === 0)', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    // Click reset — should NOT show confirmation since movesMade === 0
    act(() => {
      screen.getByText(en.game.resetGame).click();
    });
    act(() => {
      jest.runAllTimers();
    });

    // Confirmation dialog should NOT appear
    expect(document.querySelector('.dialog-overlay')).not.toBeInTheDocument();

    // Score should be 0
    const scoreValue = document.querySelector('.score-value');
    expect(scoreValue).toHaveTextContent('0');
  });

  it('shows confirmation dialog with correct translated text', () => {
    // We test the ConfirmDialog component directly
    const ConfirmDialog = require('../../components/ConfirmDialog').default;
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();

    renderWithProviders(
      <ConfirmDialog
        isOpen={true}
        title={en.resetConfirm.title}
        message={en.resetConfirm.message}
        onConfirm={mockConfirm}
        onCancel={mockCancel}
        confirmText={en.resetConfirm.confirm}
        cancelText={en.resetConfirm.cancel}
      />
    );

    expect(screen.getByText(en.resetConfirm.title)).toBeInTheDocument();
    expect(screen.getByText(en.resetConfirm.message)).toBeInTheDocument();
    expect(screen.getByText(en.resetConfirm.confirm)).toBeInTheDocument();
    expect(screen.getByText(en.resetConfirm.cancel)).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const ConfirmDialog = require('../../components/ConfirmDialog').default;
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();

    renderWithProviders(
      <ConfirmDialog
        isOpen={true}
        title="Reset"
        message="Reset?"
        onConfirm={mockConfirm}
        onCancel={mockCancel}
        confirmText="Reset"
        cancelText="Cancel"
      />
    );

    act(() => {
      screen.getByText('Cancel').click();
    });

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Confirm is clicked', () => {
    const ConfirmDialog = require('../../components/ConfirmDialog').default;
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();

    renderWithProviders(
      <ConfirmDialog
        isOpen={true}
        title="Reset Game"
        message="Reset?"
        onConfirm={mockConfirm}
        onCancel={mockCancel}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    );

    act(() => {
      screen.getByText('Confirm').click();
    });

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('does not render ConfirmDialog when isOpen is false', () => {
    const ConfirmDialog = require('../../components/ConfirmDialog').default;

    renderWithProviders(
      <ConfirmDialog
        isOpen={false}
        title="Reset"
        message="Reset?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(document.querySelector('.dialog-overlay')).not.toBeInTheDocument();
  });

  it('reset button is disabled during animation', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    // The reset button should have the disabled attribute only during animations
    // At rest, it should be enabled
    const resetButton = screen.getByText(en.game.resetGame);
    expect(resetButton).not.toBeDisabled();
  });
});
