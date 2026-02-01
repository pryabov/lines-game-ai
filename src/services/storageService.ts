import { BallMovementAnimation } from '../types';
import { Theme } from '../atoms/themeAtom';
import { Language } from '../translations';

// Unified settings interface
export interface UserSettings {
  ballMovementAnimation: BallMovementAnimation;
  theme: Theme;
  language: Language;
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  ballMovementAnimation: 'step-by-step',
  theme: 'light',
  language: 'en',
};

const STORAGE_KEY = 'lines-game-settings';

class StorageService {
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private safeGetItem(key: string): string | null {
    if (!this.isAvailable()) return null;

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to read from localStorage (${key}):`, error);
      return null;
    }
  }

  private safeSetItem(key: string, value: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to write to localStorage (${key}):`, error);
      return false;
    }
  }

  private safeRemoveItem(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove from localStorage (${key}):`, error);
      return false;
    }
  }

  // Get all settings
  getSettings(): UserSettings {
    const stored = this.safeGetItem(STORAGE_KEY);

    if (!stored) {
      return { ...DEFAULT_SETTINGS };
    }

    try {
      const parsed = JSON.parse(stored) as Partial<UserSettings>;

      // Merge with defaults to ensure all properties exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch (error) {
      console.warn('Failed to parse settings from localStorage:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  // Update specific settings
  updateSettings(updates: Partial<UserSettings>): boolean {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...updates };

    return this.safeSetItem(STORAGE_KEY, JSON.stringify(newSettings));
  }

  // Get specific setting
  getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.getSettings()[key];
  }

  // Set specific setting
  setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): boolean {
    return this.updateSettings({ [key]: value } as Partial<UserSettings>);
  }

  // Reset all settings to defaults
  resetSettings(): boolean {
    return this.safeSetItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }

  // Clear all settings
  clearSettings(): boolean {
    return this.safeRemoveItem(STORAGE_KEY);
  }

  // Migration helpers for backward compatibility
  migrateOldSettings(): void {
    const currentSettings = this.getSettings();
    let hasChanges = false;

    // Migrate old theme storage
    const oldTheme = this.safeGetItem('theme');
    if (oldTheme && !this.safeGetItem(STORAGE_KEY)) {
      try {
        const theme = JSON.parse(oldTheme) as Theme;
        if (theme === 'light' || theme === 'dark') {
          currentSettings.theme = theme;
          hasChanges = true;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Migrate old ball animation storage
    const oldAnimation = this.safeGetItem('lines-game-ball-movement-animation');
    if (oldAnimation && !this.safeGetItem(STORAGE_KEY)) {
      try {
        const animation = JSON.parse(oldAnimation) as BallMovementAnimation;
        if (['step-by-step', 'show-path-then-move', 'instant-move'].includes(animation)) {
          currentSettings.ballMovementAnimation = animation;
          hasChanges = true;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Save migrated settings and clean up old keys
    if (hasChanges) {
      this.updateSettings(currentSettings);

      // Clean up old storage keys
      this.safeRemoveItem('theme');
      this.safeRemoveItem('lines-game-ball-movement-animation');
    }
  }

  // Get initial values with smart defaults
  getInitialTheme(): Theme {
    const storedTheme = this.getSetting('theme');
    if (storedTheme !== DEFAULT_SETTINGS.theme) {
      return storedTheme;
    }

    // Use system preference as fallback
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  getInitialLanguage(): Language {
    const storedLanguage = this.getSetting('language');
    if (storedLanguage !== DEFAULT_SETTINGS.language) {
      return storedLanguage;
    }

    // Use browser language as fallback
    try {
      const browserLang = navigator.language.split('-')[0] as Language;
      const supportedLanguages: Language[] = ['en', 'ru', 'es', 'de', 'pl', 'zh', 'ja'];

      return supportedLanguages.includes(browserLang) ? browserLang : 'en';
    } catch {
      return 'en';
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
