import React, { forwardRef } from 'react';
import Cell from './Cell';
import { CellType, Position } from '../types';
import '../styles/Board.scss';

interface BoardProps {
  grid: CellType[][];
  onCellClick: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
  pathCells?: Position[];
  lineAnimationCells?: Position[];
}

const Board: React.FC<BoardProps> = ({ 
  grid, 
  onCellClick, 
  selectedCell,
  pathCells = [],
  lineAnimationCells = []
}) => {
  return (
    <div className="board">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => {
            // Check if this cell is part of the path
            const pathIndex = pathCells.findIndex(
              pos => pos.row === rowIndex && pos.col === colIndex
            );
            const isPath = pathIndex !== -1;
            
            // Check if this cell is part of a completed line
            const lineIndex = lineAnimationCells.findIndex(
              pos => pos.row === rowIndex && pos.col === colIndex
            );
            const isLineComplete = lineIndex !== -1;
            
            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                type={cell}
                onClick={() => onCellClick(rowIndex, colIndex)}
                isSelected={
                  selectedCell !== null &&
                  selectedCell.row === rowIndex &&
                  selectedCell.col === colIndex
                }
                position={{ row: rowIndex, col: colIndex }}
                isPath={isPath}
                pathStep={isPath ? pathIndex + 1 : 0}
                isLineComplete={isLineComplete}
                linePosition={isLineComplete ? lineIndex + 1 : 0}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board; 