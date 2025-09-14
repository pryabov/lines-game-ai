import React from 'react';
import { Provider } from 'jotai';
import Game from './components/Game';
import ThemeToggle from './components/ThemeToggle';
import OfflineNotice from './components/OfflineNotice';
import InstallPrompt from './components/InstallPrompt';
import UpdateNotification from './components/UpdateNotification';
import AnalyticsProvider from './components/AnalyticsProvider';
import LanguageSelector from './components/LanguageSelector';
import SettingsButton from './components/settings/SettingsButton';
import { LanguageProvider } from './hooks/useLanguage';
import { useLanguage } from './hooks/useLanguage';
import { useSettingsInitialization } from './hooks/useSettingsInitialization';
import { useTheme } from './hooks/useTheme';
import { useBallMovementAnimation } from './hooks/useBallMovementAnimation';
import './App.scss';
import './styles/DarkTheme.scss';
import './components/settings/styles/SettingsDialog.scss';
import '@fortawesome/fontawesome-free/css/all.css';

// Wrap the app content in the LanguageContext
const AppContent: React.FC = () => {
  const { translations } = useLanguage();
  
  // Initialize settings (migration, etc.)
  useSettingsInitialization();
  
  // Initialize individual settings hooks
  useTheme();
  useBallMovementAnimation();

  return (
    <div className="App">
      <header className="App-header">
        <h1>{translations.header.title}</h1>
        <div className="header-right">
          <LanguageSelector />
          <ThemeToggle />
          <SettingsButton />
        </div>
      </header>
      <main>
        <Game />
      </main>
      <footer className="App-footer">
        <p>
          {translations.footer.description}
          {' | '}
          <a href={`mailto:${translations.footer.email}`} className="email-link">
            {translations.footer.contactUs}
          </a>
        </p>
      </footer>
      <OfflineNotice />
      <InstallPrompt />
      <UpdateNotification />
    </div>
  );
};

function App() {
  return (
    <Provider>
      <LanguageProvider>
        <AnalyticsProvider>
          <AppContent />
        </AnalyticsProvider>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
