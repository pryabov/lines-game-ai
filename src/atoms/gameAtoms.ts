import { atom } from 'jotai';
import { Ball, BallColor, CellType, Position, GameState, BallMovementAnimation } from '../types';

// Game Constants
export const GRID_SIZE = 9;
export const COLORS: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange'];
export const BALLS_PER_TURN = 3;
export const MIN_LINE_LENGTH = 5;

// Animation Constants (in milliseconds)
export const ANIMATION_DURATION = 800;
export const STEP_DURATION = 400;
export const JUMP_ANIMATION_DURATION = 350;
export const PATH_STEP_DELAY = 80;
export const INITIAL_MOVE_DELAY = 100;
export const FAST_STEP_DURATION = 60;
export const PATH_SHOW_DURATION = 500;
export const INSTANT_MOVE_DELAY = 50;
export const LINE_ANIMATION_DURATION = 2000;
export const GAME_INIT_DELAY = 100;

// Styling Constants
export const BALL_SIZE_RATIO = 0.75;
export const STEP_TRANSITION_DURATION = '0.25s';

// Scoring Constants
export const SCORE_TABLE: Record<number, number> = {
  5: 10,
  6: 12,
  7: 18,
  8: 28,
  9: 42,
};
export const DEFAULT_SCORE_MULTIPLIER = 2;

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
export const movesMadeAtom = atom<number>(0); // Track number of moves made

// Derived game state atom that combines all core atoms
export const gameStateAtom = atom<GameState>(
  (get) => ({
    grid: get(gridAtom),
    score: get(scoreAtom),
    nextBalls: get(nextBallsAtom),
    selectedCell: get(selectedCellAtom),
    gameOver: get(gameOverAtom),
    movesMade: get(movesMadeAtom)
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

// Settings atoms
export const ballMovementAnimationAtom = atom<BallMovementAnimation>('step-by-step'); 