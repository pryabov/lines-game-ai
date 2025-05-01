import { atom } from 'jotai';

export type Theme = 'light' | 'dark';

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = (): Theme => {
  // Check for saved theme in localStorage
  const savedTheme = localStorage.getItem('theme') as Theme;
  
  // Check for system preference if no saved theme
  if (!savedTheme) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return savedTheme === 'dark' ? 'dark' : 'light';
};

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
export const themeAtom = atom<Theme>(getInitialTheme());

// Write theme atom to persist theme selection
export const themePersistAtom = atom(
  (get) => get(themeAtom),
  (get, set, newTheme: Theme) => {
    set(themeAtom, newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    applyThemeToDOM(newTheme);
  }
); 