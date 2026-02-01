import { atom } from 'jotai';

export type Theme = 'light' | 'dark';

// Function to apply theme to DOM
export const applyThemeToDOM = (theme: Theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.documentElement.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.remove('dark-theme');
  }
};

// Create theme atom with default value (will be initialized by hook)
export const themeAtom = atom<Theme>('light');
