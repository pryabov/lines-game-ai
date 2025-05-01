import React from 'react';
import { Provider } from 'jotai';
import Game from './components/Game';
import ThemeToggle from './components/ThemeToggle';
import OfflineNotice from './components/OfflineNotice';
import InstallPrompt from './components/InstallPrompt';
import UpdateNotification from './components/UpdateNotification';
import AnalyticsProvider from './components/AnalyticsProvider';
import './App.scss';
import './styles/DarkTheme.scss';

function App() {
  return (
    <Provider>
      <AnalyticsProvider>
        <div className="App">
          <header className="App-header">
            <h1>Lines Game</h1>
            <div className="header-right">
              <ThemeToggle />
            </div>
          </header>
          <main>
            <Game />
          </main>
          <footer className="App-footer">
            <p>
              Lines Game - Match 5 or more balls of the same color in a line.
            </p>
          </footer>
          <OfflineNotice />
          <InstallPrompt />
          <UpdateNotification />
        </div>
      </AnalyticsProvider>
    </Provider>
  );
}

export default App;
