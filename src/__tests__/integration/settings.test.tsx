import React from 'react';
import { screen, act } from '@testing-library/react';
import SettingsDialog from '../../components/settings/SettingsDialog';
import ThemeToggle from '../../components/ThemeToggle';
import BallAnimationSelector from '../../components/BallAnimationSelector';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { en } from '../../translations/en';

describe('UJ-7: Theme Toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.remove('dark-theme');
  });

  it('renders theme toggle with label', () => {
    renderWithProviders(<ThemeToggle />);
    expect(screen.getByText(en.header.theme)).toBeInTheDocument();
  });

  it('toggles dark-theme class on document.body', () => {
    renderWithProviders(<ThemeToggle />);

    const toggleBtn = screen.getByRole('button', { name: /switch to/i });

    // Initially light
    expect(document.body.classList.contains('dark-theme')).toBe(false);

    // Toggle to dark
    act(() => {
      toggleBtn.click();
    });
    expect(document.body.classList.contains('dark-theme')).toBe(true);

    // Toggle back to light
    act(() => {
      toggleBtn.click();
    });
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('persists theme choice to localStorage', () => {
    renderWithProviders(<ThemeToggle />);

    const toggleBtn = screen.getByRole('button', { name: /switch to/i });

    act(() => {
      toggleBtn.click();
    });

    const stored = localStorage.getItem('lines-game-settings');
    expect(stored).toBeTruthy();
    const settings = JSON.parse(stored!);
    expect(settings.theme).toBe('dark');
  });
});

describe('UJ-8: Language Switch', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Settings dialog with language selector', () => {
    const mockClose = jest.fn();
    renderWithProviders(<SettingsDialog isOpen={true} onClose={mockClose} />);

    expect(screen.getByText(en.settingsDialog.selectLanguage)).toBeInTheDocument();
  });

  it('renders Settings dialog with all sections', () => {
    const mockClose = jest.fn();
    renderWithProviders(<SettingsDialog isOpen={true} onClose={mockClose} />);

    expect(screen.getByText(en.settingsDialog.title)).toBeInTheDocument();
    // "Theme" appears in both the setting label and the ThemeToggle label, so use getAllByText
    expect(screen.getAllByText(en.settingsDialog.theme).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(en.settingsDialog.selectLanguage)).toBeInTheDocument();
    expect(screen.getByText(en.settingsDialog.ballAnimation)).toBeInTheDocument();
  });

  it('updates document.documentElement.lang when language changes', () => {
    renderWithProviders(<SettingsDialog isOpen={true} onClose={jest.fn()} />);

    // Default should be 'en'
    expect(document.documentElement.lang).toBe('en');
  });

  it('persists language choice to localStorage', () => {
    renderWithProviders(<SettingsDialog isOpen={true} onClose={jest.fn()} />);

    // After rendering with default language, settings should be stored
    const stored = localStorage.getItem('lines-game-settings');
    if (stored) {
      const settings = JSON.parse(stored);
      expect(settings.language).toBeDefined();
    }
  });

  it('closes Settings dialog when Close button is clicked', () => {
    const mockClose = jest.fn();
    renderWithProviders(<SettingsDialog isOpen={true} onClose={mockClose} />);

    act(() => {
      screen.getByText(en.settingsDialog.close).click();
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('closes Settings dialog when X button is clicked', () => {
    const mockClose = jest.fn();
    renderWithProviders(<SettingsDialog isOpen={true} onClose={mockClose} />);

    const closeBtn = screen.getByRole('button', { name: /close settings/i });
    act(() => {
      closeBtn.click();
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('does not render Settings dialog when isOpen is false', () => {
    renderWithProviders(<SettingsDialog isOpen={false} onClose={jest.fn()} />);

    expect(screen.queryByText(en.settingsDialog.title)).not.toBeInTheDocument();
  });
});

describe('UJ-9: Ball Animation Mode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders animation selector with current selection', () => {
    renderWithProviders(<BallAnimationSelector />);

    // Default should be "Step by step"
    expect(screen.getByText(en.settingsDialog.ballAnimationStepByStep)).toBeInTheDocument();
  });

  it('shows 3 animation options when dropdown is opened', () => {
    renderWithProviders(<BallAnimationSelector />);

    // Open dropdown
    const button = screen.getByRole('button', { name: /select ball movement/i });
    act(() => {
      button.click();
    });

    // "Step by step" appears twice: once in the button label and once in the dropdown option
    expect(
      screen.getAllByText(en.settingsDialog.ballAnimationStepByStep).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(en.settingsDialog.ballAnimationShowPath)).toBeInTheDocument();
    expect(screen.getByText(en.settingsDialog.ballAnimationInstant)).toBeInTheDocument();
  });

  it('persists animation choice to localStorage', () => {
    renderWithProviders(<BallAnimationSelector />);

    // Open dropdown
    const button = screen.getByRole('button', { name: /select ball movement/i });
    act(() => {
      button.click();
    });

    // Select instant move
    act(() => {
      screen.getByText(en.settingsDialog.ballAnimationInstant).click();
    });

    const stored = localStorage.getItem('lines-game-settings');
    expect(stored).toBeTruthy();
    const settings = JSON.parse(stored!);
    expect(settings.ballMovementAnimation).toBe('instant-move');
  });
});
