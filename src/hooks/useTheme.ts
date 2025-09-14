import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { themeAtom } from '../atoms/themeAtom';
import { storageService } from '../services/storageService';
import { Theme } from '../atoms/themeAtom';

// Apply theme to DOM
const applyThemeToDOM = (theme: Theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.documentElement.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.remove('dark-theme');
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = storageService.getInitialTheme();
    setTheme(initialTheme);
    applyThemeToDOM(initialTheme);
  }, [setTheme]);

  // Save theme when it changes
  useEffect(() => {
    storageService.setSetting('theme', theme);
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
};
