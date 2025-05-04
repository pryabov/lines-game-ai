import React, { useEffect, useRef, useState } from 'react';
import Board from './Board';
import { useGameActions } from '../hooks/useGameActions';
import { useGameStatePersistence } from '../hooks/useGameStatePersistence';
import ConfirmDialog from './ConfirmDialog';
import GameOverDialog from './GameOverDialog';
import HelpDialog from './HelpDialog';
import analytics from '../services/analytics';
import '../styles/Game.scss';
import '../styles/NextBallsPanel.scss';

// Internal NextBallsPanel component
const NextBallsPanel = ({ balls }: { balls: React.ReactNode[] }) => {
  return (
    <div className="next-balls-panel">
      <div className="next-balls-title">Next Balls</div>
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
    movesMade,
    handleCellClick,
    resetGame,
    placeRandomBalls,
    gameRef,
    boardRef
  } = useGameActions();

  // State for reset confirmation dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // State for help dialog
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const previousScore = useRef(0);
  const wasGameOver = useRef(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Use the game state persistence hook
  const { loadGameState, clearGameState } = useGameStatePersistence();
  const gameInitialized = useRef(false);

  // Track game start
  useEffect(() => {
    analytics.trackGameStart();
  }, []);

  // Track score changes
  useEffect(() => {
    if (score > 0 && score !== previousScore.current) {
      analytics.trackScoreChanged(score);
      
      // If score increased by 5 or more, a line was completed
      const scoreDiff = score - previousScore.current;
      if (scoreDiff >= 5) {
        analytics.trackLineCompleted(scoreDiff);
      }
      
      previousScore.current = score;
    }
  }, [score]);

  // Track game over
  useEffect(() => {
    if (gameOver && !wasGameOver.current) {
      analytics.trackGameOver(score);
      wasGameOver.current = true;
    } else if (!gameOver && wasGameOver.current) {
      wasGameOver.current = false;
    }
  }, [gameOver, score]);

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

  // Update high score when needed
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score.toString());
    }
  }, [score, highScore]);

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

  // Handle reset button click
  const handleResetClick = () => {
    if (movesMade > 0 && !gameOver) {
      setShowResetConfirm(true);
    } else {
      performFullReset();
    }
  };

  // Enhanced cell click that tracks ball movements
  const handleCellClickWithTracking = (row: number, col: number) => {
    const cellHadBall = grid[row][col].ball !== null;
    const hadSelectedCell = selectedCell !== null;
    
    // If we have a selected cell and clicked on an empty cell, track the potential move
    if (hadSelectedCell && !cellHadBall && selectedCell) {
      const fromCoord = `${selectedCell.row},${selectedCell.col}`;
      const toCoord = `${row},${col}`;
      analytics.trackBallMoved(fromCoord, toCoord);
    }
    
    // Call the original handler
    handleCellClick(row, col);
  };

  // Perform a complete game reset including clearing saved state
  const performFullReset = () => {
    // Track reset event
    analytics.trackEvent({ 
      eventName: 'game_reset', 
      data: { finalScore: score, movesMade } 
    });
    
    // First clear the game state from localStorage
    clearGameState();
    
    // Then reset the game state in memory
    resetGame();
    
    // Reset initialization flag to force a fresh start
    gameInitialized.current = true;
    
    // Reset tracking references
    previousScore.current = 0;
    wasGameOver.current = false;
  };

  return (
    <div className="game" ref={gameRef}>
      {/* Wrap game info and board in a new container */}
      <div className="game-content"> 
        <div className="game-info">
          <div className="score">
            <div className="score-label">Score</div>
            <div className="score-value">{score}</div>
          </div>
          <NextBallsPanel balls={nextBallsDisplay} />
          <div className="high-score">
            <div className="high-score-label">Max</div>
            <div className="high-score-value">{highScore}</div>
          </div>
        </div>
        
        <div ref={boardRef} className="board-container">
          <Board
            grid={grid}
            onCellClick={handleCellClickWithTracking}
            selectedCell={selectedCell}
            pathCells={pathCells}
            lineAnimationCells={lineAnimations}
          />
        </div>
      </div> {/* Close game-content div */}

      <div className="game-bottom">
        <button 
          className="reset-button" 
          onClick={handleResetClick}
          disabled={isAnimating}
        >
          Reset Game
        </button>
        <button 
          className="help-button" 
          onClick={() => setShowHelpDialog(true)}
        >
          Help
        </button>
      </div>

      {/* Game Over Dialog */}
      <GameOverDialog
        isOpen={gameOver}
        score={score}
        onPlayAgain={performFullReset}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Game"
        message="Are you sure you want to reset the game? Your progress will be lost."
        onConfirm={() => {
          setShowResetConfirm(false);
          performFullReset();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Help Dialog */}
      <HelpDialog
        isOpen={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
      />
    </div>
  );
};

export default Game; 