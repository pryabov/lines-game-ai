import React, { useState } from 'react';
import { Provider } from 'jotai';
import Game from './components/Game';
import ThemeToggle from './components/ThemeToggle';
import OfflineNotice from './components/OfflineNotice';
import InstallPrompt from './components/InstallPrompt';
import UpdateNotification from './components/UpdateNotification';
import AnalyticsProvider from './components/AnalyticsProvider';
import LanguageSelector from './components/LanguageSelector';
import SettingsDialog from './components/SettingsDialog';
import { LanguageProvider } from './hooks/useLanguage';
import { useLanguage } from './hooks/useLanguage';
import './App.scss';
import './styles/DarkTheme.scss';
import './styles/SettingsDialog.scss';
import '@fortawesome/fontawesome-free/css/all.css';

// Wrap the app content in the LanguageContext
const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{t.header.title}</h1>
        <div className="header-right">
          <LanguageSelector />
          <ThemeToggle />
          <button 
            className="settings-button" 
            onClick={openSettings}
            aria-label="Open settings"
          >
            <i className="fas fa-cog settings-icon"></i>
          </button>
        </div>
      </header>
      <main>
        <Game />
      </main>
      <footer className="App-footer">
        <p>
          {t.footer.description}
          {' | '}
          <a href={`mailto:${t.footer.email}`} className="email-link">
            {t.footer.contactUs}
          </a>
        </p>
      </footer>
      <OfflineNotice />
      <InstallPrompt />
      <UpdateNotification />
      <SettingsDialog isOpen={isSettingsOpen} onClose={closeSettings} />
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
