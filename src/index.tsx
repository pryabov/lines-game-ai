import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Apply the theme immediately before React renders
// to prevent flash of incorrect theme
const applyInitialTheme = () => {
  // Check for saved theme or use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  if (isDarkTheme) {
    document.documentElement.classList.add('dark-theme');
    document.body.classList.add('dark-theme');
  }
};

// Run immediately
applyInitialTheme();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
