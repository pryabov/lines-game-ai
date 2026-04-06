import React from 'react';
import { act } from '@testing-library/react';
import OfflineNotice from '../../components/OfflineNotice';
import Game from '../../components/Game';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Helper to simulate online/offline events
const goOffline = () => {
  Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
  window.dispatchEvent(new Event('offline'));
};

const goOnline = () => {
  Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  window.dispatchEvent(new Event('online'));
};

describe('UJ-13: Offline Play', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    // Start online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  });

  afterEach(() => {
    jest.useRealTimers();
    // Restore online state
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  });

  it('does not show offline notice when online', () => {
    renderWithProviders(<OfflineNotice />);

    const notice = document.querySelector('[style*="position: fixed"]');
    expect(notice).not.toBeInTheDocument();
  });

  it('shows offline notice when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    renderWithProviders(<OfflineNotice />);

    const notice = document.querySelector('[style*="position: fixed"]');
    expect(notice).toBeInTheDocument();
    expect(notice?.textContent).toContain('offline');
  });

  it('shows offline notice when connection drops', () => {
    renderWithProviders(<OfflineNotice />);

    // Initially online — no notice
    expect(document.querySelector('[style*="position: fixed"]')).not.toBeInTheDocument();

    // Go offline
    act(() => {
      goOffline();
    });

    const notice = document.querySelector('[style*="position: fixed"]');
    expect(notice).toBeInTheDocument();
  });

  it('hides offline notice when connection is restored', () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    renderWithProviders(<OfflineNotice />);

    // Should be showing notice
    expect(document.querySelector('[style*="position: fixed"]')).toBeInTheDocument();

    // Go online
    act(() => {
      goOnline();
    });

    // Notice should disappear
    expect(document.querySelector('[style*="position: fixed"]')).not.toBeInTheDocument();
  });

  it('game remains playable while offline', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    // Go offline
    act(() => {
      goOffline();
    });

    // Game board should still be present
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();

    // Cells should still be present
    const cells = document.querySelectorAll('.cell');
    expect(cells).toHaveLength(81);

    // Balls should still be on the grid
    const ballCells = document.querySelectorAll('.cell.ball');
    expect(ballCells.length).toBeGreaterThan(0);

    // Score should still be visible
    const scoreValue = document.querySelector('.score-value');
    expect(scoreValue).toBeInTheDocument();
  });
});
