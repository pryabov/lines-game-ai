export type BallColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'cyan' | 'orange';

export interface Ball {
  color: BallColor;
  id: number;
}

export interface CellType {
  ball: Ball | null;
  pathHighlight?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  grid: CellType[][];
  score: number;
  nextBalls: Ball[];
  selectedCell: Position | null;
  gameOver: boolean;
  movesMade: number;
} 