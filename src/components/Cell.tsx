import React from 'react';
import { CellType } from '../types';
import '../styles/Cell.scss';

interface CellProps {
  type: CellType;
  onClick: () => void;
  isSelected: boolean;
  position: { row: number; col: number };
  isPath?: boolean;
  pathStep?: number;
  isLineComplete?: boolean;
  linePosition?: number;
}

const Cell: React.FC<CellProps> = React.memo(({
  type,
  onClick,
  isSelected,
  position,
  isPath = false,
  pathStep = 0,
  isLineComplete = false,
  linePosition = 0
}) => {
  const cellClass = `cell 
    ${isSelected ? 'selected' : ''} 
    ${type.ball ? `ball ball-${type.ball.color}` : ''} 
    ${isPath ? 'path' : ''}
    ${isPath ? `path-step-${pathStep}` : ''}
    ${isLineComplete ? 'line-complete' : ''}
    ${isLineComplete && linePosition > 0 ? `line-pos-${linePosition}` : ''}
  `;

  return (
    <div 
      className={cellClass} 
      onClick={onClick}
      data-row={position.row}
      data-col={position.col}
    >
      {type.ball && <div className="ball-inner"></div>}
      {isPath && !type.ball && <div className="path-dot"></div>}
    </div>
  );
});

export default Cell; 