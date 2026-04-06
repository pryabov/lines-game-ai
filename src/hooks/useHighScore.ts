import { useState, useEffect } from 'react';

const HIGH_SCORE_KEY = 'highScore';

export const useHighScore = (currentScore: number) => {
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Update high score when current score exceeds it
  useEffect(() => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem(HIGH_SCORE_KEY, currentScore.toString());
    }
  }, [currentScore, highScore]);

  return highScore;
};
