import { findPath } from '../../utils/pathfinding';
import { createEmptyGrid } from '../../atoms/gameAtoms';
import { createGridWithBalls } from '../helpers/gameTestUtils';

describe('findPath', () => {
  it('finds a path on an empty grid', () => {
    const grid = createEmptyGrid();
    const path = findPath(grid, { row: 0, col: 0 }, { row: 8, col: 8 });
    expect(path.length).toBeGreaterThan(0);
    // Last element should be the destination
    expect(path[path.length - 1]).toEqual({ row: 8, col: 8 });
  });

  it('finds the shortest path (BFS guarantees this)', () => {
    const grid = createEmptyGrid();
    const path = findPath(grid, { row: 0, col: 0 }, { row: 0, col: 4 });
    // Shortest path from (0,0) to (0,4) is 4 steps (horizontal)
    expect(path).toHaveLength(4);
  });

  it('returns path for adjacent cells (1 step)', () => {
    const grid = createEmptyGrid();
    const path = findPath(grid, { row: 3, col: 3 }, { row: 3, col: 4 });
    expect(path).toHaveLength(1);
    expect(path[0]).toEqual({ row: 3, col: 4 });
  });

  it('returns empty array when destination is occupied', () => {
    const grid = createGridWithBalls([{ row: 5, col: 5, color: 'red' }]);
    const path = findPath(grid, { row: 0, col: 0 }, { row: 5, col: 5 });
    expect(path).toHaveLength(0);
  });

  it('returns empty array when path is blocked', () => {
    // Create a wall of balls blocking the path
    const grid = createGridWithBalls([
      { row: 0, col: 1, color: 'red' },
      { row: 1, col: 1, color: 'red' },
      { row: 2, col: 1, color: 'red' },
      { row: 3, col: 1, color: 'red' },
      { row: 4, col: 1, color: 'red' },
      { row: 5, col: 1, color: 'red' },
      { row: 6, col: 1, color: 'red' },
      { row: 7, col: 1, color: 'red' },
      { row: 8, col: 1, color: 'red' },
    ]);
    // Try to go from left side to right side — wall blocks
    const path = findPath(grid, { row: 0, col: 0 }, { row: 0, col: 2 });
    expect(path).toHaveLength(0);
  });

  it('returns empty array for out of bounds start', () => {
    const grid = createEmptyGrid();
    const path = findPath(grid, { row: -1, col: 0 }, { row: 5, col: 5 });
    expect(path).toHaveLength(0);
  });

  it('returns empty array for out of bounds end', () => {
    const grid = createEmptyGrid();
    const path = findPath(grid, { row: 0, col: 0 }, { row: 9, col: 9 });
    expect(path).toHaveLength(0);
  });

  it('finds path around obstacles', () => {
    // Create an L-shaped wall, forcing a detour
    const grid = createGridWithBalls([
      { row: 1, col: 1, color: 'red' },
      { row: 1, col: 2, color: 'red' },
      { row: 1, col: 3, color: 'red' },
    ]);
    const path = findPath(grid, { row: 0, col: 2 }, { row: 2, col: 2 });
    // Path must go around the wall
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toEqual({ row: 2, col: 2 });
    // Path should not pass through any wall cells
    path.forEach((pos) => {
      expect(grid[pos.row][pos.col].ball).toBeNull();
    });
  });

  it('only uses horizontal and vertical movement (no diagonals)', () => {
    const grid = createEmptyGrid();
    const path = findPath(grid, { row: 0, col: 0 }, { row: 3, col: 3 });

    // Check each step is exactly 1 cell horizontally or vertically
    let prev = { row: 0, col: 0 };
    for (const step of path) {
      const rowDiff = Math.abs(step.row - prev.row);
      const colDiff = Math.abs(step.col - prev.col);
      // Each step should move exactly 1 in row OR col, not both
      expect(rowDiff + colDiff).toBe(1);
      prev = step;
    }
  });

  it('does not include the start position in the path', () => {
    const grid = createEmptyGrid();
    const start = { row: 2, col: 2 };
    const end = { row: 2, col: 5 };
    const path = findPath(grid, start, end);

    expect(path.length).toBeGreaterThan(0);
    const includesStart = path.some((p) => p.row === start.row && p.col === start.col);
    expect(includesStart).toBe(false);
  });

  it('handles complex maze navigation', () => {
    // Create a maze-like pattern
    const grid = createGridWithBalls([
      { row: 0, col: 2, color: 'red' },
      { row: 1, col: 2, color: 'red' },
      { row: 2, col: 2, color: 'red' },
      { row: 2, col: 3, color: 'red' },
      { row: 2, col: 4, color: 'red' },
      { row: 2, col: 5, color: 'red' },
      { row: 2, col: 6, color: 'red' },
    ]);

    const path = findPath(grid, { row: 0, col: 0 }, { row: 4, col: 4 });
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toEqual({ row: 4, col: 4 });
  });
});
