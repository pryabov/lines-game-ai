import { GRID_SIZE, MIN_LINE_LENGTH, BALLS_PER_TURN, generateRandomBalls } from './gameAtoms';
import { CellType, Position, Ball } from '../types';

// Find empty cells on the grid
export const findEmptyCells = (grid: CellType[][]): Position[] => {
  const emptyCells: Position[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!grid[row][col].ball) {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
};

// Check for lines of 5 or more balls of the same color
// Returns positions of cells that form lines
export const findCompletedLines = (grid: CellType[][]): Position[] => {
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal down
    [1, -1], // diagonal up
  ];

  let cellsToRemove: Position[] = [];

  // Check each cell on the grid
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = grid[row][col];

      if (!cell.ball) continue;

      const color = cell.ball.color;

      // Check in each direction
      for (const [dx, dy] of directions) {
        const line: Position[] = [];

        // Count balls of the same color in this direction
        for (let i = 0; i < MIN_LINE_LENGTH; i++) {
          const r = row + i * dx;
          const c = col + i * dy;

          if (
            r >= 0 &&
            r < GRID_SIZE &&
            c >= 0 &&
            c < GRID_SIZE &&
            grid[r][c]?.ball &&
            grid[r][c]?.ball?.color === color
          ) {
            line.push({ row: r, col: c });
          } else {
            break;
          }
        }

        // If we found a line of sufficient length
        if (line.length >= MIN_LINE_LENGTH) {
          cellsToRemove = [...cellsToRemove, ...line];
        }
      }
    }
  }

  // Remove duplicate positions
  return Array.from(new Map(cellsToRemove.map((pos) => [`${pos.row}-${pos.col}`, pos])).values());
};

// Create a grid with balls in random positions
export const placeBallsRandomly = (grid: CellType[][], balls: Ball[]): CellType[][] => {
  const emptyCells = findEmptyCells(grid);

  if (emptyCells.length < balls.length) {
    return grid; // Not enough space
  }

  const newGrid = grid.map((row) => [
    ...row.map((cell) => ({ ball: cell.ball ? { ...cell.ball } : null })),
  ]);

  for (const ball of balls) {
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];

    newGrid[row][col] = { ball };
    emptyCells.splice(randomIndex, 1);
  }

  return newGrid;
};

// Create a deep copy of a grid
export const copyGrid = (grid: CellType[][]): CellType[][] => {
  return grid.map((rowArray) =>
    rowArray.map((cell) => ({
      ball: cell.ball ? { ...cell.ball } : null,
    }))
  );
};

// Remove balls from the grid at specified positions
export const removeGridBalls = (grid: CellType[][], positions: Position[]): CellType[][] => {
  const newGrid = copyGrid(grid);

  for (const { row, col } of positions) {
    newGrid[row][col] = { ball: null };
  }

  return newGrid;
};

// Place a ball at a specific position
export const placeBall = (grid: CellType[][], ball: Ball, position: Position): CellType[][] => {
  const newGrid = copyGrid(grid);
  newGrid[position.row][position.col] = { ball };
  return newGrid;
};

// Generate the next set of balls
export const getNextBalls = (currentBalls: Ball[]): Ball[] => {
  return generateRandomBalls(
    BALLS_PER_TURN,
    Math.max(...currentBalls.map((ball) => ball.id), 0) + 1
  );
};
