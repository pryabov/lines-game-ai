import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  gridAtom, 
  scoreAtom, 
  nextBallsAtom, 
  selectedCellAtom, 
  gameOverAtom, 
  gameStateAtom, 
  movesMadeAtom 
} from '../atoms/gameAtoms';
import { GameState } from '../types';

const STORAGE_KEY = 'lines-game-state';

export const useGameStatePersistence = () => {
  const [, setGrid] = useAtom(gridAtom);
  const [, setScore] = useAtom(scoreAtom);
  const [, setNextBalls] = useAtom(nextBallsAtom);
  const [, setSelectedCell] = useAtom(selectedCellAtom);
  const [, setGameOver] = useAtom(gameOverAtom);
  const [gameState] = useAtom(gameStateAtom);
  const [, setMovesMade] = useAtom(movesMadeAtom);

  // Save current game state to local storage
  const saveGameState = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      return true;
    } catch (error) {
      console.error('Failed to save game state:', error);
      return false;
    }
  }, [gameState]);

  // Load game state from local storage
  const loadGameState = useCallback((): boolean => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      
      if (!savedState) {
        return false;
      }
      
      const parsedState = JSON.parse(savedState) as GameState;
      
      // Validate the parsed state
      if (!parsedState || !parsedState.grid || !parsedState.nextBalls) {
        return false;
      }
      
      // Set all game state atoms
      setGrid(parsedState.grid);
      setScore(parsedState.score);
      setNextBalls(parsedState.nextBalls);
      setSelectedCell(parsedState.selectedCell);
      setGameOver(parsedState.gameOver);
      setMovesMade(parsedState.movesMade || 0);
      
      return true;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return false;
    }
  }, [setGrid, setScore, setNextBalls, setSelectedCell, setGameOver, setMovesMade]);

  // Clear saved game state
  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear game state:', error);
      return false;
    }
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    if (gameState.grid.length > 0) {
      saveGameState();
    }
  }, [gameState, saveGameState]);

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

  return { saveGameState, loadGameState, clearGameState };
}; 