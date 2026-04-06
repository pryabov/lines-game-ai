import React from 'react';
import { screen, act } from '@testing-library/react';
import Game from '../../components/Game';
import HelpDialog from '../../components/HelpDialog';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { en } from '../../translations/en';

describe('UJ-6: Help Dialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens when Help button is clicked', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    // Help dialog should not be visible initially
    expect(screen.queryByText(en.helpDialog.title)).not.toBeInTheDocument();

    // Click Help button
    act(() => {
      screen.getByText(en.game.help).click();
    });

    // Help dialog should now be visible
    expect(screen.getByText(en.helpDialog.title)).toBeInTheDocument();
  });

  it('displays Rules section with 7 items', () => {
    const mockClose = jest.fn();
    renderWithProviders(<HelpDialog isOpen={true} onClose={mockClose} />);

    expect(screen.getByText(en.helpDialog.rules)).toBeInTheDocument();

    // Check all rule items are rendered
    en.helpDialog.rulesItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
    expect(en.helpDialog.rulesItems).toHaveLength(7);
  });

  it('displays Scoring section with 5 items', () => {
    const mockClose = jest.fn();
    renderWithProviders(<HelpDialog isOpen={true} onClose={mockClose} />);

    expect(screen.getByText(en.helpDialog.scoring)).toBeInTheDocument();

    en.helpDialog.scoringItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
    expect(en.helpDialog.scoringItems).toHaveLength(5);
  });

  it('displays Tips section with 3 items', () => {
    const mockClose = jest.fn();
    renderWithProviders(<HelpDialog isOpen={true} onClose={mockClose} />);

    expect(screen.getByText(en.helpDialog.tips)).toBeInTheDocument();

    en.helpDialog.tipsItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
    expect(en.helpDialog.tipsItems).toHaveLength(3);
  });

  it('closes when Got it! is clicked', () => {
    renderWithProviders(<Game />);
    act(() => {
      jest.runAllTimers();
    });

    // Open help dialog
    act(() => {
      screen.getByText(en.game.help).click();
    });

    expect(screen.getByText(en.helpDialog.title)).toBeInTheDocument();

    // Click "Got it!"
    act(() => {
      screen.getByText(en.helpDialog.gotIt).click();
    });

    // Dialog should be closed
    expect(screen.queryByText(en.helpDialog.title)).not.toBeInTheDocument();
  });

  it('calls onClose callback when Got it! is clicked', () => {
    const mockClose = jest.fn();
    renderWithProviders(<HelpDialog isOpen={true} onClose={mockClose} />);

    act(() => {
      screen.getByText(en.helpDialog.gotIt).click();
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    const mockClose = jest.fn();
    renderWithProviders(<HelpDialog isOpen={false} onClose={mockClose} />);

    expect(screen.queryByText(en.helpDialog.title)).not.toBeInTheDocument();
  });

  it('all text comes from translations (not hardcoded)', () => {
    const mockClose = jest.fn();
    renderWithProviders(<HelpDialog isOpen={true} onClose={mockClose} />);

    // Verify section headers match translations
    expect(screen.getByText(en.helpDialog.title)).toBeInTheDocument();
    expect(screen.getByText(en.helpDialog.rules)).toBeInTheDocument();
    expect(screen.getByText(en.helpDialog.scoring)).toBeInTheDocument();
    expect(screen.getByText(en.helpDialog.tips)).toBeInTheDocument();
    expect(screen.getByText(en.helpDialog.gotIt)).toBeInTheDocument();
  });
});
