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
          {/* <LanguageSelector /> */}
          {/* <ThemeToggle /> */}
          TEST
          <button 
            className="settings-button" 
            onClick={openSettings}
            aria-label="Open settings"
          >
            <svg className="settings-icon" viewBox="0 0 24 24">
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97L2.46 14.6c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64L19.43 13Z"/>
            </svg>
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
