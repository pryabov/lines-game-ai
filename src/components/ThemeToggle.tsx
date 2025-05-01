import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { themePersistAtom } from '../atoms/themeAtom';
import '../styles/ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useAtom(themePersistAtom);

  // Apply theme class on first render and when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="theme-toggle">
      <span className="theme-label">Theme</span>
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