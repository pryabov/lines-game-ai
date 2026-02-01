import React from 'react';
import { Ball } from '../types';
import '../styles/NextBallsPanel.scss';

interface NextBallsPanelProps {
  balls: Ball[];
}

const NextBallsPanel: React.FC<NextBallsPanelProps> = ({ balls }) => {
  return (
    <div className="next-balls-panel">
      <div className="next-balls-title">Next Balls:</div>
      <div className="next-balls-container">
        {balls.map((ball) => (
          <div key={ball.id} className={`next-ball ball-${ball.color}`}>
            <div className="ball-inner"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextBallsPanel;
