import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import analytics from './services/analytics';

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

// Initialize analytics when the app loads
const initializeAnalytics = () => {
  // Track the app launch
  analytics.trackEvent({ eventName: 'app_launched' });
  
  // Track page load time
  if (performance && performance.timing) {
    const pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    analytics.trackEvent({ 
      eventName: 'page_load', 
      data: { loadTimeMs: pageLoadTime }
    });
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

// Initialize analytics after the app has loaded
window.addEventListener('load', initializeAnalytics);

// Send web vitals data to analytics
reportWebVitals(({ name, value }) => {
  analytics.trackEvent({
    eventName: 'web_vitals',
    data: { metric: name, value }
  });
});
