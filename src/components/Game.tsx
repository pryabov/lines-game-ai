import React, { useEffect } from 'react';
import Board from './Board';
import { useGameActions } from '../hooks/useGameActions';
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

  // Place initial balls when the game starts
  useEffect(() => {
    placeRandomBalls();
    // This effect should run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render the next balls
  const nextBallsDisplay = nextBalls.map((ball) => (
    <div 
      key={ball.id} 
      className={`next-ball ball-${ball.color}`}
    >
      <div className="ball-inner"></div>
    </div>
  ));

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