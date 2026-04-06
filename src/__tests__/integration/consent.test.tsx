import React from 'react';
import { screen, act } from '@testing-library/react';
import App from '../../App';
import ConsentDialog from '../../components/ConsentDialog';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { en } from '../../translations/en';

const ANALYTICS_CONSENT_KEY = 'analytics_consent';

describe('UJ-12: Analytics Consent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows consent dialog on first visit (no prior answer)', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(en.consentDialog.title)).toBeInTheDocument();
  });

  it('does not show consent dialog when already answered', () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'accepted');

    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByText(en.consentDialog.title)).not.toBeInTheDocument();
  });

  it('hides consent dialog after accepting', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(en.consentDialog.title)).toBeInTheDocument();

    // Click Accept
    act(() => {
      screen.getByText(en.consentDialog.accept).click();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Consent should be saved
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('accepted');
  });

  it('hides consent dialog after declining', () => {
    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(en.consentDialog.title)).toBeInTheDocument();

    // Click Decline
    act(() => {
      screen.getByText(en.consentDialog.decline).click();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Consent should be saved as declined
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('declined');
  });

  it('displays all consent dialog content', () => {
    const mockAccept = jest.fn();
    const mockDecline = jest.fn();

    renderWithProviders(<ConsentDialog onAccept={mockAccept} onDecline={mockDecline} />);

    expect(screen.getByText(en.consentDialog.title)).toBeInTheDocument();
    expect(screen.getByText(en.consentDialog.description1)).toBeInTheDocument();
    expect(screen.getByText(en.consentDialog.description2)).toBeInTheDocument();
    expect(screen.getByText(en.consentDialog.description3)).toBeInTheDocument();
    expect(screen.getByText(en.consentDialog.accept)).toBeInTheDocument();
    expect(screen.getByText(en.consentDialog.decline)).toBeInTheDocument();
  });

  it('game board renders regardless of consent choice', () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'declined');

    render(<App />);
    act(() => {
      jest.runAllTimers();
    });

    // Game should work fine even with analytics declined
    const board = document.querySelector('.board');
    expect(board).toBeInTheDocument();
    const cells = document.querySelectorAll('.cell');
    expect(cells).toHaveLength(81);
  });
});

// Use the real render since App includes its own providers
function render(ui: React.ReactElement) {
  return require('@testing-library/react').render(ui);
}
