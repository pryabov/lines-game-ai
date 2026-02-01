import React, { useMemo } from 'react';
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
  // Create O(1) lookup maps for path and line animation cells
  const pathCellMap = useMemo(() =>
    new Map(pathCells.map((pos, i) => [`${pos.row}-${pos.col}`, i])),
    [pathCells]
  );

  const lineCellMap = useMemo(() =>
    new Map(lineAnimationCells.map((pos, i) => [`${pos.row}-${pos.col}`, i])),
    [lineAnimationCells]
  );

  return (
    <div className="board">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;

            // O(1) lookup for path cells
            const pathIndex = pathCellMap.get(cellKey);
            const isPath = pathIndex !== undefined;

            // O(1) lookup for line animation cells
            const lineIndex = lineCellMap.get(cellKey);
            const isLineComplete = lineIndex !== undefined;
            
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
                pathStep={isPath ? pathIndex! + 1 : 0}
                isLineComplete={isLineComplete}
                linePosition={isLineComplete ? lineIndex! + 1 : 0}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board; 