import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Board from './Board';
import { useGameActions } from '../hooks/useGameActions';
import { useGameStatePersistence } from '../hooks/useGameStatePersistence';
import { useHighScore } from '../hooks/useHighScore';
import { useGameAnalytics } from '../hooks/useGameAnalytics';
import { GAME_INIT_DELAY } from '../atoms/gameAtoms';
import ConfirmDialog from './ConfirmDialog';
import GameOverDialog from './GameOverDialog';
import HelpDialog from './HelpDialog';
import { useLanguage } from '../hooks/useLanguage';
import analytics from '../services/analytics';
import '../styles/Game.scss';
import '../styles/NextBallsPanel.scss';

// Internal NextBallsPanel component
const NextBallsPanel = ({ balls, title }: { balls: React.ReactNode[]; title: string }) => {
  return (
    <div className="next-balls-panel">
      <div className="next-balls-title">{title}</div>
      <div className="next-balls-container">{balls.map((ball) => ball)}</div>
    </div>
  );
};

const Game: React.FC = () => {
  const { translations } = useLanguage();

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
    boardRef,
  } = useGameActions();

  // State for reset confirmation dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // State for help dialog
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // Use extracted hooks for cleaner code
  const highScore = useHighScore(score);
  const { resetTracking } = useGameAnalytics({ score, gameOver });

  // Use the game state persistence hook
  const { loadGameState, clearGameState } = useGameStatePersistence();
  const gameInitialized = useRef(false);

  // Place initial balls when the game starts
  useEffect(() => {
    if (!gameInitialized.current) {
      gameInitialized.current = true;

      // Try to load saved game state, if not successful, place random balls
      const loaded = loadGameState();

      if (!loaded) {
        // Add a small delay to ensure all components are properly mounted
        setTimeout(() => {
          placeRandomBalls();
        }, GAME_INIT_DELAY);
      }
    }
  }, [loadGameState, placeRandomBalls]);

  // Render the next balls - memoized to prevent recreation on every render
  const nextBallsDisplay = useMemo(
    () =>
      nextBalls.map((ball) => (
        <div key={ball.id} className={`next-ball ball-${ball.color}`}>
          <div className="ball-inner"></div>
        </div>
      )),
    [nextBalls]
  );

  // Memoize ball count to avoid O(81) scan on every render
  const ballCount = useMemo(
    () => grid.reduce((count, row) => count + row.filter((cell) => cell.ball !== null).length, 0),
    [grid]
  );

  // If we have next balls but no balls on the grid, force place random balls
  useEffect(() => {
    if (nextBalls.length > 0 && ballCount === 0 && gameInitialized.current) {
      placeRandomBalls();
    }
  }, [ballCount, nextBalls, placeRandomBalls]);

  // Handle reset button click
  const handleResetClick = () => {
    if (movesMade > 0 && !gameOver) {
      setShowResetConfirm(true);
    } else {
      performFullReset();
    }
  };

  // Enhanced cell click that tracks ball movements - memoized for stable reference
  const handleCellClickWithTracking = useCallback(
    (row: number, col: number) => {
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
    },
    [grid, selectedCell, handleCellClick]
  );

  // Perform a complete game reset including clearing saved state
  const performFullReset = () => {
    // Track reset event
    analytics.trackEvent({
      eventName: 'game_reset',
      data: { finalScore: score, movesMade },
    });

    // First clear the game state from localStorage
    clearGameState();

    // Then reset the game state in memory
    resetGame();

    // Reset initialization flag to force a fresh start
    gameInitialized.current = true;

    // Reset analytics tracking
    resetTracking();
  };

  return (
    <div className="game" ref={gameRef}>
      {/* Wrap game info and board in a new container */}
      <div className="game-content">
        <div className="game-info">
          <div className="score">
            <div className="score-label">{translations.game.score}</div>
            <div className="score-value">{score}</div>
          </div>
          <NextBallsPanel balls={nextBallsDisplay} title={translations.game.nextBalls} />
          <div className="high-score">
            <div className="high-score-label">{translations.game.max}</div>
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
      </div>{' '}
      {/* Close game-content div */}
      <div className="game-bottom">
        <button className="reset-button" onClick={handleResetClick} disabled={isAnimating}>
          {translations.game.resetGame}
        </button>
        <button className="help-button" onClick={() => setShowHelpDialog(true)}>
          {translations.game.help}
        </button>
      </div>
      {/* Game Over Dialog */}
      <GameOverDialog isOpen={gameOver} score={score} onPlayAgain={performFullReset} />
      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title={translations.resetConfirm.title}
        message={translations.resetConfirm.message}
        onConfirm={() => {
          setShowResetConfirm(false);
          performFullReset();
        }}
        onCancel={() => setShowResetConfirm(false)}
        confirmText={translations.resetConfirm.confirm}
        cancelText={translations.resetConfirm.cancel}
      />
      {/* Help Dialog */}
      <HelpDialog isOpen={showHelpDialog} onClose={() => setShowHelpDialog(false)} />
    </div>
  );
};

export default Game;
