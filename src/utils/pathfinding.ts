import { CellType, Position } from '../types';

// Define directions: up, right, down, left
const directions = [
  { row: -1, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 0, col: -1 }
];

/**
 * Find a path from start to end position using Breadth-First Search
 */
export const findPath = (
  grid: CellType[][],
  start: Position,
  end: Position
): Position[] => {
  const gridSize = grid.length;
  
  // If start or end is out of bounds, return empty path
  if (
    start.row < 0 || start.row >= gridSize ||
    start.col < 0 || start.col >= gridSize ||
    end.row < 0 || end.row >= gridSize ||
    end.col < 0 || end.col >= gridSize
  ) {
    return [];
  }
  
  // If end position has a ball, return empty path
  if (grid[end.row][end.col].ball) {
    return [];
  }
  
  // Create a visited grid
  const visited: boolean[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(false));
  
  // Create a parent map to reconstruct the path
  const parent: Map<string, Position | null> = new Map();
  
  // Queue for BFS
  const queue: Position[] = [start];
  
  // Mark start as visited
  visited[start.row][start.col] = true;
  parent.set(`${start.row}-${start.col}`, null);
  
  // BFS
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // If we reached the end, reconstruct the path
    if (current.row === end.row && current.col === end.col) {
      return reconstructPath(parent, start, end);
    }
    
    // Try all four directions
    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;
      
      // Check if next position is valid
      if (
        nextRow >= 0 && nextRow < gridSize &&
        nextCol >= 0 && nextCol < gridSize &&
        !visited[nextRow][nextCol] &&
        !grid[nextRow][nextCol].ball
      ) {
        visited[nextRow][nextCol] = true;
        parent.set(`${nextRow}-${nextCol}`, current);
        queue.push({ row: nextRow, col: nextCol });
      }
    }
  }
  
  // If no path found
  return [];
};

/**
 * Reconstruct the path from end to start using the parent map
 */
const reconstructPath = (
  parent: Map<string, Position | null>,
  start: Position,
  end: Position
): Position[] => {
  const path: Position[] = [];
  let current: Position | null = end;
  
  // Work backwards from end to start
  while (current && (current.row !== start.row || current.col !== start.col)) {
    path.unshift(current);
    current = parent.get(`${current.row}-${current.col}`) || null;
  }
  
  return path;
}; 