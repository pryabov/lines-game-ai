import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  gridAtom, 
  scoreAtom, 
  nextBallsAtom, 
  gameOverAtom 
} from '../atoms/gameAtoms';

const STORAGE_KEY = 'lines-game-state';

export function useGameStatePersistence() {
  const [grid, setGrid] = useAtom(gridAtom);
  const [score, setScore] = useAtom(scoreAtom);
  const [nextBalls, setNextBalls] = useAtom(nextBallsAtom);
  const [gameOver, setGameOver] = useAtom(gameOverAtom);

  // Load game state from localStorage
  const loadGameState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      
      if (savedState) {
        const { grid, score, nextBalls, gameOver, timestamp } = JSON.parse(savedState);
        
        // Optional: Check if the saved state is too old (e.g., more than 24 hours)
        const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const now = Date.now();
        
        if (now - timestamp < MAX_AGE) {
          setGrid(grid);
          setScore(score);
          setNextBalls(nextBalls);
          setGameOver(gameOver);
          console.log('Game state loaded from localStorage');
          return true;
        } else {
          console.log('Saved game state is too old, starting fresh');
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
    
    return false;
  }, [setGrid, setScore, setNextBalls, setGameOver]);

  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      const state = {
        grid,
        score,
        nextBalls,
        gameOver,
        timestamp: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('Game state saved to localStorage');
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [grid, score, nextBalls, gameOver]);

  // Save game state whenever it changes
  useEffect(() => {
    if (grid.length > 0) {
      saveGameState();
    }
  }, [grid, score, nextBalls, gameOver, saveGameState]);

  // Listen for 'beforeunload' event to save the state before the page is unloaded
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGameState();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also listen for visibility change to save state when app goes to background
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveGameState();
      }
    });
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveGameState]);

  return { loadGameState, saveGameState };
} 