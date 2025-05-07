import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { themePersistAtom } from '../atoms/themeAtom';
import { useLanguage } from '../hooks/useLanguage';
import analytics from '../services/analytics';
import '../styles/ThemeToggle.scss';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useAtom(themePersistAtom);
  const { t } = useLanguage();

  // Apply theme class on first render and when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Track theme changes, but only after the initial render
    const isInitialRender = document.readyState !== 'complete';
    if (!isInitialRender) {
      analytics.trackThemeChanged(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <div className="theme-toggle">
      <span className="theme-label">{t.header.theme}</span>
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
};

export default ThemeToggle; 