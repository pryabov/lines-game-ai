import React, { useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/GameOverDialog.scss';

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
  const { t } = useLanguage();

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

  // Get score message based on score
  const getScoreMessage = (score: number) => {
    if (score < 50) return t.gameOver.lowScore;
    if (score < 100) return t.gameOver.mediumScore;
    if (score < 200) return t.gameOver.highScore;
    return t.gameOver.excellentScore;
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-container">
        <div className="game-over-header">
          <h2>{t.gameOver.title}</h2>
        </div>
        <div className="game-over-content">
          <div className="final-score">
            <span className="score-label">{t.gameOver.yourScore}</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="score-message">
            {getScoreMessage(score)}
          </div>
        </div>
        <div className="game-over-actions">
          <button 
            id="play-again-button"
            className="play-again-button" 
            onClick={onPlayAgain}
          >
            {t.gameOver.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverDialog; 