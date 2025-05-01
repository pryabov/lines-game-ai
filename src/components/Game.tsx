import React, { useEffect, useRef } from 'react';
import Board from './Board';
import { useGameActions } from '../hooks/useGameActions';
import { useGameStatePersistence } from '../hooks/useGameStatePersistence';
import '../styles/Game.css';
import '../styles/NextBallsPanel.css';

// Internal NextBallsPanel component
const NextBallsPanel = ({ balls }: { balls: React.ReactNode[] }) => {
  return (
    <div className="next-balls-panel">
      <div className="next-balls-title">Next Balls:</div>
      <div className="next-balls-container">
        {balls.map((ball) => ball)}
      </div>
    </div>
  );
};

const Game: React.FC = () => {
  const {
    grid,
    score,
    nextBalls,
    selectedCell,
    gameOver,
    pathCells,
    lineAnimations,
    isAnimating,
    handleCellClick,
    resetGame,
    placeRandomBalls,
    gameRef,
    boardRef
  } = useGameActions();

  // Use the game state persistence hook
  const { loadGameState } = useGameStatePersistence();
  const gameInitialized = useRef(false);

  // Place initial balls when the game starts
  useEffect(() => {
    console.log('Game initialized effect running, initialized:', gameInitialized.current);
    
    if (!gameInitialized.current) {
      gameInitialized.current = true;
      
      // Try to load saved game state, if not successful, place random balls
      const loaded = loadGameState();
      console.log('Game state loaded:', loaded);
      
      if (!loaded) {
        console.log('Placing random balls...');
        // Add a small delay to ensure all components are properly mounted
        setTimeout(() => {
          placeRandomBalls();
        }, 100);
      }
    }
  }, [loadGameState, placeRandomBalls]);

  // Render the next balls
  const nextBallsDisplay = nextBalls.map((ball) => (
    <div 
      key={ball.id} 
      className={`next-ball ball-${ball.color}`}
    >
      <div className="ball-inner"></div>
    </div>
  ));

  // Additional effect to check grid state after render
  useEffect(() => {
    console.log('Current grid state:', grid);
    console.log('Next balls:', nextBalls);
    
    const ballCount = grid.reduce((count, row) => {
      return count + row.filter(cell => cell.ball !== null).length;
    }, 0);
    
    console.log('Total balls on grid:', ballCount);
    
    // If we have next balls but no balls on the grid, force place random balls
    if (nextBalls.length > 0 && ballCount === 0 && gameInitialized.current) {
      console.log('No balls on grid but have next balls, placing balls...');
      placeRandomBalls();
    }
  }, [grid, nextBalls, placeRandomBalls]);

  return (
    <div className="game" ref={gameRef}>
      <div className="game-info">
        <div className="score">Score: {score}</div>
        <NextBallsPanel balls={nextBallsDisplay} />
      </div>
      <div ref={boardRef} className="board-container">
        <Board
          grid={grid}
          onCellClick={handleCellClick}
          selectedCell={selectedCell}
          pathCells={pathCells}
          lineAnimationCells={lineAnimations}
        />
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Your score: {score}</p>
          <button onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Game; 