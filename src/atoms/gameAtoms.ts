import { atom } from 'jotai';
import { Ball, BallColor, CellType, Position, GameState } from '../types';

// Constants
export const GRID_SIZE = 9;
export const COLORS: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange'];
export const BALLS_PER_TURN = 3;
export const MIN_LINE_LENGTH = 5;
export const ANIMATION_DURATION = 800; // Animation duration in ms
export const STEP_DURATION = 400; // Duration of each step in the path animation
export const JUMP_ANIMATION_DURATION = 350; // Duration of the jump animation

// Helper function to generate an initial empty grid
export const createEmptyGrid = (): CellType[][] => 
  Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null).map(() => ({ ball: null })));

// Helper function to generate random balls
export const generateRandomBalls = (count: number, nextIdStart: number = 1): Ball[] => {
  let nextId = nextIdStart;
  return Array(count)
    .fill(null)
    .map(() => ({
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      id: nextId++
    }));
};

// Core game state atoms
export const gridAtom = atom<CellType[][]>(createEmptyGrid());
export const scoreAtom = atom<number>(0);
export const nextBallsAtom = atom<Ball[]>(generateRandomBalls(BALLS_PER_TURN, 1));
export const selectedCellAtom = atom<Position | null>(null);
export const gameOverAtom = atom<boolean>(false);

// Derived game state atom that combines all core atoms
export const gameStateAtom = atom<GameState>(
  (get) => ({
    grid: get(gridAtom),
    score: get(scoreAtom),
    nextBalls: get(nextBallsAtom),
    selectedCell: get(selectedCellAtom),
    gameOver: get(gameOverAtom)
  })
);

// Animation state atoms
export const pathCellsAtom = atom<Position[]>([]);
export const isAnimatingAtom = atom<boolean>(false);
export const lineAnimationsAtom = atom<{
  positions: Position[];
  isAnimating: boolean;
}>({
  positions: [],
  isAnimating: false
}); 