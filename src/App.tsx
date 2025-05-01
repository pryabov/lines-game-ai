import React from 'react';
import { Provider } from 'jotai';
import Game from './components/Game';
import './App.css';

function App() {
  return (
    <Provider>
      <div className="App">
        <header className="App-header">
          <h1>Lines Game</h1>
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
