import React from 'react';
import '../styles/HelpDialog.scss';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="dialog-container help-dialog">
        <div className="dialog-header help-dialog-header">
          <h2>How to Play</h2>
        </div>
        <div className="dialog-content">
          <h3>Game Rules</h3>
          <ul>
            <li>The game is played on a 9×9 grid where colored balls appear.</li>
            <li>Each turn, 3 new balls of random colors are added to the board.</li>
            <li>Select a ball and click on an empty cell to move it.</li>
            <li>Balls can only move if there is a clear path (no other balls in the way).</li>
            <li>Form lines of 5 or more balls of the same color (horizontally, vertically, or diagonally).</li>
            <li>When lines are formed, the balls disappear and you earn points.</li>
            <li>The game ends when the board is filled with balls and no more moves are possible.</li>
          </ul>
          
          <h3>Scoring</h3>
          <ul>
            <li>5 balls in a line: 10 points</li>
            <li>6 balls in a line: 12 points</li>
            <li>7 balls in a line: 18 points</li>
            <li>8 balls in a line: 28 points</li>
            <li>9 balls in a line: 42 points</li>
          </ul>
          
          <h3>Tips</h3>
          <ul>
            <li>Plan your moves carefully to avoid filling the board too quickly.</li>
            <li>Try to set up multiple lines at once for higher scores.</li>
            <li>Keep track of the next 3 balls that will appear.</li>
          </ul>
        </div>
        <div className="dialog-actions">
          <button className="primary-button" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpDialog; 