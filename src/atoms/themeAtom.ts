import { atom } from 'jotai';
import { storageService } from '../services/storageService';

export type Theme = 'light' | 'dark';

// Function to apply theme to DOM
const applyThemeToDOM = (theme: Theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.documentElement.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.remove('dark-theme');
  }
};

// Create theme atom
export const themeAtom = atom<Theme>(storageService.getInitialTheme());

// Write theme atom to persist theme selection using storage service
export const themePersistAtom = atom(
  (get) => get(themeAtom),
  (get, set, newTheme: Theme) => {
    set(themeAtom, newTheme);
    storageService.setSetting('theme', newTheme);
    applyThemeToDOM(newTheme);
  }
); 