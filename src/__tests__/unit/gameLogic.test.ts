import {
  findEmptyCells,
  findCompletedLines,
  placeBallsRandomly,
  copyGrid,
  removeGridBalls,
  placeBall,
  getNextBalls,
} from '../../atoms/gameLogic';
import { createEmptyGrid, generateRandomBalls, GRID_SIZE } from '../../atoms/gameAtoms';
import {
  createGridWithBalls,
  createGridWithHorizontalLine,
  createGridWithVerticalLine,
  createGridWithDiagonalLine,
  createAlmostFullGrid,
  countBalls,
} from '../helpers/gameTestUtils';

describe('findEmptyCells', () => {
  it('returns all 81 cells for an empty grid', () => {
    const grid = createEmptyGrid();
    const emptyCells = findEmptyCells(grid);
    expect(emptyCells).toHaveLength(GRID_SIZE * GRID_SIZE);
  });

  it('returns correct count for a grid with some balls', () => {
    const grid = createGridWithBalls([
      { row: 0, col: 0, color: 'red' },
      { row: 4, col: 4, color: 'blue' },
      { row: 8, col: 8, color: 'green' },
    ]);
    const emptyCells = findEmptyCells(grid);
    expect(emptyCells).toHaveLength(81 - 3);
  });

  it('returns empty array for a full grid', () => {
    const grid = createAlmostFullGrid(0);
    const emptyCells = findEmptyCells(grid);
    expect(emptyCells).toHaveLength(0);
  });

  it('returns positions that do not contain balls', () => {
    const grid = createGridWithBalls([{ row: 0, col: 0, color: 'red' }]);
    const emptyCells = findEmptyCells(grid);

    const hasOccupiedCell = emptyCells.some((pos) => pos.row === 0 && pos.col === 0);
    expect(hasOccupiedCell).toBe(false);
  });
});

describe('findCompletedLines', () => {
  it('returns empty array when no lines exist', () => {
    const grid = createGridWithBalls([
      { row: 0, col: 0, color: 'red' },
      { row: 0, col: 1, color: 'blue' },
      { row: 0, col: 2, color: 'red' },
    ]);
    expect(findCompletedLines(grid)).toHaveLength(0);
  });

  it('detects a horizontal line of 5', () => {
    const grid = createGridWithHorizontalLine(0, 0, 5, 'red');
    const result = findCompletedLines(grid);
    expect(result).toHaveLength(5);
    result.forEach((pos) => expect(pos.row).toBe(0));
  });

  it('detects a horizontal line of 6', () => {
    const grid = createGridWithHorizontalLine(3, 1, 6, 'blue');
    const result = findCompletedLines(grid);
    expect(result).toHaveLength(6);
  });

  it('detects a vertical line of 5', () => {
    const grid = createGridWithVerticalLine(0, 4, 5, 'green');
    const result = findCompletedLines(grid);
    expect(result).toHaveLength(5);
    result.forEach((pos) => expect(pos.col).toBe(4));
  });

  it('detects a diagonal line (top-left to bottom-right) of 5', () => {
    const grid = createGridWithDiagonalLine(0, 0, 5, 'yellow');
    const result = findCompletedLines(grid);
    expect(result).toHaveLength(5);
  });

  it('detects a diagonal line (top-right to bottom-left) of 5', () => {
    const grid = createGridWithBalls(
      Array.from({ length: 5 }, (_, i) => ({
        row: i,
        col: 8 - i,
        color: 'purple' as const,
      }))
    );
    const result = findCompletedLines(grid);
    expect(result).toHaveLength(5);
  });

  it('does not detect a line of 4 (below minimum)', () => {
    const grid = createGridWithHorizontalLine(0, 0, 4, 'red');
    expect(findCompletedLines(grid)).toHaveLength(0);
  });

  it('detects line of 9 (full row)', () => {
    const grid = createGridWithHorizontalLine(0, 0, 9, 'cyan');
    const result = findCompletedLines(grid);
    expect(result).toHaveLength(9);
  });

  it('does not count different colors as a line', () => {
    const grid = createGridWithBalls([
      { row: 0, col: 0, color: 'red' },
      { row: 0, col: 1, color: 'red' },
      { row: 0, col: 2, color: 'blue' },
      { row: 0, col: 3, color: 'red' },
      { row: 0, col: 4, color: 'red' },
    ]);
    expect(findCompletedLines(grid)).toHaveLength(0);
  });

  it('deduplicates positions when lines overlap', () => {
    // Create a cross: horizontal and vertical lines sharing center cell
    const grid = createGridWithBalls([
      // Horizontal line at row 4
      { row: 4, col: 0, color: 'red' },
      { row: 4, col: 1, color: 'red' },
      { row: 4, col: 2, color: 'red' },
      { row: 4, col: 3, color: 'red' },
      { row: 4, col: 4, color: 'red' },
      // Vertical line at col 2
      { row: 0, col: 2, color: 'red' },
      { row: 1, col: 2, color: 'red' },
      { row: 2, col: 2, color: 'red' },
      { row: 3, col: 2, color: 'red' },
      // row 4 col 2 already exists
    ]);
    const result = findCompletedLines(grid);
    // 5 horizontal + 5 vertical - 1 shared = 9 unique positions
    expect(result).toHaveLength(9);
  });

  it('returns empty array for empty grid', () => {
    const grid = createEmptyGrid();
    expect(findCompletedLines(grid)).toHaveLength(0);
  });
});

describe('placeBallsRandomly', () => {
  it('places the correct number of balls on an empty grid', () => {
    const grid = createEmptyGrid();
    const balls = generateRandomBalls(3, 1);
    const result = placeBallsRandomly(grid, balls);
    expect(countBalls(result)).toBe(3);
  });

  it('does not overwrite existing balls', () => {
    const grid = createGridWithBalls([
      { row: 0, col: 0, color: 'red' },
      { row: 1, col: 1, color: 'blue' },
    ]);
    const balls = generateRandomBalls(3, 10);
    const result = placeBallsRandomly(grid, balls);

    // Original balls should still exist
    expect(result[0][0].ball?.color).toBe('red');
    expect(result[1][1].ball?.color).toBe('blue');
    expect(countBalls(result)).toBe(5);
  });

  it('returns the original grid when not enough space', () => {
    const grid = createAlmostFullGrid(2);
    const balls = generateRandomBalls(3, 100);
    const result = placeBallsRandomly(grid, balls);

    // Should return same grid since we need 3 spaces but only have 2
    expect(countBalls(result)).toBe(countBalls(grid));
  });

  it('does not mutate the original grid', () => {
    const grid = createEmptyGrid();
    const balls = generateRandomBalls(3, 1);
    placeBallsRandomly(grid, balls);

    // Original grid should still be empty
    expect(countBalls(grid)).toBe(0);
  });
});

describe('copyGrid', () => {
  it('creates a deep copy', () => {
    const grid = createGridWithBalls([{ row: 0, col: 0, color: 'red' }]);
    const copy = copyGrid(grid);

    // Modify the copy
    copy[0][0] = { ball: null };

    // Original should be unchanged
    expect(grid[0][0].ball?.color).toBe('red');
  });

  it('preserves all ball data', () => {
    const grid = createGridWithBalls([
      { row: 2, col: 3, color: 'blue' },
      { row: 5, col: 7, color: 'green' },
    ]);
    const copy = copyGrid(grid);

    expect(copy[2][3].ball?.color).toBe('blue');
    expect(copy[5][7].ball?.color).toBe('green');
    expect(countBalls(copy)).toBe(2);
  });
});

describe('removeGridBalls', () => {
  it('removes balls at specified positions', () => {
    const grid = createGridWithBalls([
      { row: 0, col: 0, color: 'red' },
      { row: 1, col: 1, color: 'blue' },
      { row: 2, col: 2, color: 'green' },
    ]);

    const result = removeGridBalls(grid, [
      { row: 0, col: 0 },
      { row: 2, col: 2 },
    ]);

    expect(result[0][0].ball).toBeNull();
    expect(result[1][1].ball?.color).toBe('blue');
    expect(result[2][2].ball).toBeNull();
  });

  it('does not mutate the original grid', () => {
    const grid = createGridWithBalls([{ row: 0, col: 0, color: 'red' }]);
    removeGridBalls(grid, [{ row: 0, col: 0 }]);
    expect(grid[0][0].ball?.color).toBe('red');
  });
});

describe('placeBall', () => {
  it('places a ball at the specified position', () => {
    const grid = createEmptyGrid();
    const ball = { color: 'red' as const, id: 1 };
    const result = placeBall(grid, ball, { row: 3, col: 5 });

    expect(result[3][5].ball).toEqual(ball);
  });

  it('does not mutate the original grid', () => {
    const grid = createEmptyGrid();
    const ball = { color: 'red' as const, id: 1 };
    placeBall(grid, ball, { row: 3, col: 5 });
    expect(grid[3][5].ball).toBeNull();
  });
});

describe('getNextBalls', () => {
  it('generates the correct number of balls', () => {
    const current = generateRandomBalls(3, 1);
    const next = getNextBalls(current);
    expect(next).toHaveLength(3);
  });

  it('generates balls with incrementing IDs after current max', () => {
    const current = [
      { color: 'red' as const, id: 5 },
      { color: 'blue' as const, id: 10 },
      { color: 'green' as const, id: 8 },
    ];
    const next = getNextBalls(current);

    // IDs should start from 11 (max current id + 1)
    expect(next[0].id).toBe(11);
    expect(next[1].id).toBe(12);
    expect(next[2].id).toBe(13);
  });

  it('generates balls with valid colors', () => {
    const current = generateRandomBalls(3, 1);
    const next = getNextBalls(current);
    const validColors = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange'];

    next.forEach((ball) => {
      expect(validColors).toContain(ball.color);
    });
  });
});
