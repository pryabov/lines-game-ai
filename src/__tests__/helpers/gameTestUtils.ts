import { CellType, BallColor } from '../../types';
import { GRID_SIZE, COLORS } from '../../atoms/gameAtoms';

/**
 * Create a grid with balls at specific positions.
 */
export const createGridWithBalls = (
  positions: Array<{ row: number; col: number; color: BallColor }>
): CellType[][] => {
  const grid: CellType[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({ ball: null }))
    );

  positions.forEach(({ row, col, color }, index) => {
    grid[row][col] = { ball: { color, id: index + 1 } };
  });

  return grid;
};

/**
 * Create a grid with a horizontal line of N same-color balls.
 */
export const createGridWithHorizontalLine = (
  row: number,
  startCol: number,
  length: number,
  color: BallColor
): CellType[][] => {
  const positions = Array.from({ length }, (_, i) => ({
    row,
    col: startCol + i,
    color,
  }));
  return createGridWithBalls(positions);
};

/**
 * Create a grid with a vertical line of N same-color balls.
 */
export const createGridWithVerticalLine = (
  startRow: number,
  col: number,
  length: number,
  color: BallColor
): CellType[][] => {
  const positions = Array.from({ length }, (_, i) => ({
    row: startRow + i,
    col,
    color,
  }));
  return createGridWithBalls(positions);
};

/**
 * Create a grid with a diagonal line (top-left to bottom-right).
 */
export const createGridWithDiagonalLine = (
  startRow: number,
  startCol: number,
  length: number,
  color: BallColor
): CellType[][] => {
  const positions = Array.from({ length }, (_, i) => ({
    row: startRow + i,
    col: startCol + i,
    color,
  }));
  return createGridWithBalls(positions);
};

/**
 * Create a nearly full grid with a given number of empty cells.
 * Empty cells are placed at the end (bottom-right corner).
 */
export const createAlmostFullGrid = (emptyCells: number = 2): CellType[][] => {
  const grid: CellType[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({ ball: null }))
    );

  let id = 1;
  const totalCells = GRID_SIZE * GRID_SIZE;
  const ballsToPlace = totalCells - emptyCells;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (id <= ballsToPlace) {
        grid[r][c] = { ball: { color: COLORS[id % COLORS.length], id } };
        id++;
      }
    }
  }

  return grid;
};

/**
 * Count total balls on the grid.
 */
export const countBalls = (grid: CellType[][]): number =>
  grid.reduce((count, row) => count + row.filter((cell) => cell.ball !== null).length, 0);

/**
 * Get all ball positions from the grid.
 */
export const getBallPositions = (
  grid: CellType[][]
): Array<{ row: number; col: number; color: BallColor }> => {
  const positions: Array<{ row: number; col: number; color: BallColor }> = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].ball) {
        positions.push({ row: r, col: c, color: grid[r][c].ball!.color });
      }
    }
  }
  return positions;
};

/**
 * Create a deterministic Math.random sequence for testing.
 * Returns a jest spy and a cleanup function.
 */
export const mockMathRandom = (values: number[]): jest.SpyInstance => {
  let index = 0;
  return jest.spyOn(Math, 'random').mockImplementation(() => {
    const val = values[index % values.length];
    index++;
    return val;
  });
};
