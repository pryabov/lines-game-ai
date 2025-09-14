import React, { useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import analytics from '../services/analytics';
import '../styles/ThemeToggle.scss';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { translations } = useLanguage();

  // Track theme changes for analytics
  useEffect(() => {
    // Track theme changes, but only after the initial render
    const isInitialRender = document.readyState !== 'complete';
    if (!isInitialRender) {
      analytics.trackThemeChanged(theme);
    }
  }, [theme]);

  return (
    <div className="theme-toggle">
      <span className="theme-label">{translations.header.theme}</span>
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