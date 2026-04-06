import React from 'react';
import { CellType } from '../types';
import '../styles/Cell.scss';

interface CellProps {
  type: CellType;
  onCellClick: (row: number, col: number) => void;
  isSelected: boolean;
  row: number;
  col: number;
  isPath?: boolean;
  pathStep?: number;
  isLineComplete?: boolean;
  linePosition?: number;
}

const Cell: React.FC<CellProps> = React.memo(
  ({
    type,
    onCellClick,
    isSelected,
    row,
    col,
    isPath = false,
    pathStep = 0,
    isLineComplete = false,
    linePosition = 0,
  }) => {
    const handleClick = () => onCellClick(row, col);

    const cellClass = `cell
    ${isSelected ? 'selected' : ''}
    ${type.ball ? `ball ball-${type.ball.color}` : ''}
    ${isPath ? 'path' : ''}
    ${isPath ? `path-step-${pathStep}` : ''}
    ${isLineComplete ? 'line-complete' : ''}
    ${isLineComplete && linePosition > 0 ? `line-pos-${linePosition}` : ''}
  `;

    return (
      <div className={cellClass} onClick={handleClick} data-row={row} data-col={col}>
        {type.ball && <div className="ball-inner"></div>}
        {isPath && !type.ball && <div className="path-dot"></div>}
      </div>
    );
  }
);

Cell.displayName = 'Cell';

export default Cell;
