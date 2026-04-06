import { useEffect, useRef } from 'react';
import analytics from '../services/analytics';

interface UseGameAnalyticsProps {
  score: number;
  gameOver: boolean;
}

export const useGameAnalytics = ({ score, gameOver }: UseGameAnalyticsProps) => {
  const previousScore = useRef(0);
  const wasGameOver = useRef(false);

  // Track game start on mount
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

  // Reset tracking refs when game resets
  const resetTracking = () => {
    previousScore.current = 0;
    wasGameOver.current = false;
  };

  return { resetTracking };
};
