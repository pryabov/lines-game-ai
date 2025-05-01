import React, { useEffect } from 'react';
import '../styles/GameOverDialog.css';

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  onPlayAgain: () => void;
}

const GameOverDialog: React.FC<GameOverDialogProps> = ({
  isOpen,
  score,
  onPlayAgain
}) => {
  // Add exit animation
  useEffect(() => {
    // Focus on play again button for accessibility
    if (isOpen) {
      const button = document.getElementById('play-again-button');
      if (button) {
        setTimeout(() => button.focus(), 300);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="game-over-overlay">
      <div className="game-over-container">
        <div className="game-over-header">
          <h2>Game Over</h2>
        </div>
        <div className="game-over-content">
          <div className="final-score">
            <span className="score-label">Your Score</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="score-message">
            {score < 50 
              ? 'Good effort! Try again to improve your score.' 
              : score < 100 
                ? 'Nice job! You\'re getting better!' 
                : score < 200 
                  ? 'Great score! You\'re really good at this!' 
                  : 'Amazing! You\'re a Lines game master!'}
          </div>
        </div>
        <div className="game-over-actions">
          <button 
            id="play-again-button"
            className="play-again-button" 
            onClick={onPlayAgain}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverDialog; 