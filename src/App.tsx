import React from 'react';
import { Provider } from 'jotai';
import Game from './components/Game';
import ThemeToggle from './components/ThemeToggle';
import './App.css';
import './styles/DarkTheme.css';

function App() {
  return (
    <Provider>
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
      </div>
    </Provider>
  );
}

export default App;
