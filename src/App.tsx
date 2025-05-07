import React from 'react';
import { Provider } from 'jotai';
import Game from './components/Game';
import ThemeToggle from './components/ThemeToggle';
import OfflineNotice from './components/OfflineNotice';
import InstallPrompt from './components/InstallPrompt';
import UpdateNotification from './components/UpdateNotification';
import AnalyticsProvider from './components/AnalyticsProvider';
import LanguageSelector from './components/LanguageSelector';
import { LanguageProvider } from './hooks/useLanguage';
import { useLanguage } from './hooks/useLanguage';
import './App.scss';
import './styles/DarkTheme.scss';

// Wrap the app content in the LanguageContext
const AppContent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="App">
      <header className="App-header">
        <h1>{t.header.title}</h1>
        <div className="header-right">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>
      <main>
        <Game />
      </main>
      <footer className="App-footer">
        <p>
          {t.footer.description}
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
