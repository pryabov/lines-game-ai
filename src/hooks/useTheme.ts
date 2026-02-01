import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { themeAtom, applyThemeToDOM } from '../atoms/themeAtom';
import { storageService } from '../services/storageService';

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const isInitializedRef = useRef(false);

  // Initialize theme on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      const initialTheme = storageService.getInitialTheme();
      setTheme(initialTheme);
      applyThemeToDOM(initialTheme);
      isInitializedRef.current = true;
    }
  }, [setTheme]);

  // Save theme when it changes (but not on initial load)
  useEffect(() => {
    if (isInitializedRef.current) {
      storageService.setSetting('theme', theme);
      applyThemeToDOM(theme);
    }
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
