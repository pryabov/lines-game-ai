import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './Board';
// import NextBallsPanel from './NextBallsPanel';
import { Ball, BallColor, CellType, Position, GameState } from '../types';
import { findPath } from '../utils/pathfinding';
import '../styles/Game.css';
import '../styles/NextBallsPanel.css';

// Internal NextBallsPanel component
const NextBallsPanel = ({ balls }: { balls: Ball[] }) => {
  return (
    <div className="next-balls-panel">
      <div className="next-balls-title">Next Balls:</div>
      <div className="next-balls-container">
        {balls.map((ball) => (
          <div 
            key={ball.id} 
            className={`next-ball ball-${ball.color}`}
          >
            <div className="ball-inner"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GRID_SIZE = 9;
const COLORS: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange'];
const BALLS_PER_TURN = 3;
const MIN_LINE_LENGTH = 5;
const ANIMATION_DURATION = 800; // Animation duration in ms
const STEP_DURATION = 250; // Duration of each step in the path animation (slightly longer)
const JUMP_ANIMATION_DURATION = 200; // Duration of the jump animation

const Game: React.FC = () => {
  // Add refs for animation container
  const gameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Generate a set of random balls outside of state
  const generateRandomBalls = useCallback((count: number, nextIdStart: number = 1): Ball[] => {
    let nextId = nextIdStart;
    return Array(count)
      .fill(null)
      .map(() => ({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        id: nextId++
      }));
  }, []);

  const initialGrid: CellType[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null).map(() => ({ ball: null })));
  
  const initialBalls = generateRandomBalls(BALLS_PER_TURN, 1);
  
  const [state, setState] = useState<GameState>({
    grid: initialGrid,
    score: 0,
    nextBalls: initialBalls,
    selectedCell: null,
    gameOver: false
  });

  // Add path visualization state
  const [pathCells, setPathCells] = useState<Position[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Add state for line animation
  const [lineAnimations, setLineAnimations] = useState<{
    positions: Position[];
    isAnimating: boolean;
  }>({
    positions: [],
    isAnimating: false
  });

  // Find empty cells on the grid
  const findEmptyCells = useCallback((): Position[] => {
    const emptyCells: Position[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!state.grid[row][col].ball) {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells;
  }, [state.grid]);

  // Check for lines of 5 or more balls of the same color
  const checkForLines = useCallback((grid: CellType[][]): boolean => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down
      [1, -1]   // diagonal up
    ];
    
    let cellsToRemove: Position[] = [];
    let animatedLines: Position[] = [];
    
    // Check each cell on the grid
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        
        if (!cell.ball) continue;
        
        const color = cell.ball.color;
        
        // Check in each direction
        for (const [dx, dy] of directions) {
          let line: Position[] = [];
          
          // Count balls of the same color in this direction
          for (let i = 0; i < MIN_LINE_LENGTH; i++) {
            const r = row + i * dx;
            const c = col + i * dy;
            
            if (
              r >= 0 && r < GRID_SIZE &&
              c >= 0 && c < GRID_SIZE &&
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
            animatedLines = [...animatedLines, ...line];
          }
        }
      }
    }
    
    // Remove duplicate positions
    cellsToRemove = Array.from(
      new Map(cellsToRemove.map(pos => [`${pos.row}-${pos.col}`, pos])).values()
    );
    
    // Also deduplicate animated lines
    animatedLines = Array.from(
      new Map(animatedLines.map(pos => [`${pos.row}-${pos.col}`, pos])).values()
    );
    
    if (cellsToRemove.length > 0) {
      // Set up animation
      setLineAnimations({
        positions: animatedLines,
        isAnimating: true
      });
      
      // Remove the balls after animation completes
      setTimeout(() => {
        const newGrid = [...grid.map(row => [...row])];
        
        // Remove balls from the grid
        for (const { row, col } of cellsToRemove) {
          newGrid[row][col] = { ball: null };
        }
        
        // Update score and grid, clear animation
        setState(prev => ({
          ...prev,
          grid: newGrid,
          score: prev.score + cellsToRemove.length
        }));
        
        setLineAnimations({
          positions: [],
          isAnimating: false
        });
      }, 2000); // Wait for animation to complete
      
      return true;
    }
    
    return false;
  }, []);

  // Place balls on the grid at random positions
  const placeBallsRandomly = useCallback((balls: Ball[]): void => {
    const emptyCells = findEmptyCells();
    
    if (emptyCells.length < balls.length) {
      setState(prev => ({ ...prev, gameOver: true }));
      return;
    }

    const newGrid = [...state.grid.map(row => [...row])];
    
    for (const ball of balls) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const { row, col } = emptyCells[randomIndex];
      
      newGrid[row][col] = { ball };
      emptyCells.splice(randomIndex, 1);
    }

    setState(prev => ({
      ...prev,
      grid: newGrid
    }));
    
    // Check for lines after placing new balls
    checkForLines(newGrid);
  }, [findEmptyCells, state.grid, checkForLines]);

  // Handle cell click
  const handleCellClick = (row: number, col: number): void => {
    // Don't allow clicking while animation is playing
    if (state.gameOver || isAnimating) return;
    
    const clickedCell = state.grid[row][col];
    
    // If clicked on a ball
    if (clickedCell.ball) {
      setState(prev => ({ ...prev, selectedCell: { row, col } }));
      setPathCells([]); // Clear any previous path
      return;
    }
    
    // If a ball is selected and clicked on an empty cell
    if (state.selectedCell) {
      const { row: selectedRow, col: selectedCol } = state.selectedCell;
      
      // Make sure we don't try to move a non-existent ball
      if (!state.grid[selectedRow][selectedCol].ball) {
        setState(prev => ({ ...prev, selectedCell: null }));
        return;
      }
      
      // Find path from selected ball to clicked cell
      const path = findPath(
        state.grid,
        { row: selectedRow, col: selectedCol },
        { row, col }
      );
      
      // If there's a valid path
      if (path.length > 0) {
        // Show the path
        setPathCells(path);
        setIsAnimating(true);
        
        // Get the selected ball before any state updates
        const selectedBall = state.grid[selectedRow][selectedCol].ball as Ball;
        
        // Create a moving ball element for animation
        if (gameRef.current && boardRef.current) {
          // Get board position
          const boardRect = boardRef.current.getBoundingClientRect();
          const gameRect = gameRef.current.getBoundingClientRect();
          
          // Create moving ball element
          const movingBall = document.createElement('div');
          movingBall.className = `moving-ball`;
          
          // Create ball inner element
          const ballInner = document.createElement('div');
          ballInner.className = `ball-inner ball-${selectedBall.color}-inner`;
          movingBall.appendChild(ballInner);
          
          // Position the ball at the starting cell
          const cellSize = 40; // Make sure this matches your CSS
          const startX = selectedCol * cellSize + (cellSize / 2) - 15; // Center ball in cell
          const startY = selectedRow * cellSize + (cellSize / 2) - 15;
          
          movingBall.style.left = `${startX}px`;
          movingBall.style.top = `${startY}px`;
          movingBall.style.position = 'absolute';
          movingBall.style.zIndex = '100'; // Ensure ball is on top
          
          // Add to the board
          boardRef.current.appendChild(movingBall);
          
          // Create a deep copy of the grid right away
          const newGrid = state.grid.map(rowArray => 
            rowArray.map(cell => ({
              ball: cell.ball ? { ...cell.ball } : null
            }))
          );
          
          // Remove the ball from the starting position
          newGrid[selectedRow][selectedCol] = { ball: null };
          
          // Update grid without the ball
          setState(prev => ({
            ...prev,
            grid: newGrid,
            selectedCell: null
          }));
          
          // Animate the ball moving through each path position
          let stepIndex = 0;
          
          const animateStep = () => {
            if (stepIndex < path.length) {
              const { row: pathRow, col: pathCol } = path[stepIndex];
              
              // Calculate new position
              const newX = pathCol * cellSize + (cellSize / 2) - 15;
              const newY = pathRow * cellSize + (cellSize / 2) - 15;
              
              // Move ball to next position with animation
              movingBall.style.left = `${newX}px`;
              movingBall.style.top = `${newY}px`;
              
              // Apply jump animation to the inner ball element
              ballInner.style.animation = 'none';
              // Force reflow to restart animation
              void ballInner.offsetWidth;
              ballInner.style.animation = `jumpAnimation ${JUMP_ANIMATION_DURATION}ms ease-out`;
              
              stepIndex++;
              setTimeout(animateStep, STEP_DURATION);
            } else {
              // Animation complete - remove the moving ball
              boardRef.current?.removeChild(movingBall);
              
              // Place the ball at the final position
              const finalPos = path[path.length - 1];
              newGrid[finalPos.row][finalPos.col] = { ball: selectedBall };
              
              // Update the grid with the ball at its final position
              setState(prev => ({
                ...prev,
                grid: newGrid
              }));
              
              // Clear the path
              setTimeout(() => {
                setPathCells([]);
                setIsAnimating(false);
                
                // Check for lines after moving the ball
                const hasLines = checkForLines(newGrid);
                
                // If no lines formed, place new balls
                if (!hasLines) {
                  // Add next balls to the grid
                  const nextBalls = [...state.nextBalls];
                  const emptyCells = findEmptyCells();
                  
                  if (emptyCells.length < nextBalls.length) {
                    setState(prev => ({ ...prev, gameOver: true }));
                    return;
                  }
                  
                  const newerGrid = [...newGrid.map(row => [...row])];
                  
                  // Place balls on the grid
                  for (const ball of nextBalls) {
                    if (emptyCells.length > 0) {
                      const randomIndex = Math.floor(Math.random() * emptyCells.length);
                      const { row, col } = emptyCells[randomIndex];
                      
                      newerGrid[row][col] = { ball: ball as Ball };
                      emptyCells.splice(randomIndex, 1);
                    }
                  }
                  
                  // Generate new upcoming balls
                  const nextSetOfBalls = generateRandomBalls(BALLS_PER_TURN, 
                    Math.max(...state.nextBalls.map(ball => ball.id), 0) + 1);
                  
                  // Update state with new grid and next balls
                  setState(prev => ({
                    ...prev,
                    grid: newerGrid,
                    nextBalls: nextSetOfBalls
                  }));
                  
                  // Check for lines after placing new balls
                  checkForLines(newerGrid);
                }
              }, 200);
            }
          };
          
          // Start the animation after a short delay to let the path display
          setTimeout(() => {
            // Highlight the first cell in the path before starting animation
            const firstCell = path[0];
            // Start the animation
            animateStep();
          }, 300);
        }
      }
    }
  };

  // Place initial balls when the game starts
  useEffect(() => {
    placeBallsRandomly(state.nextBalls);
    setState(prev => ({
      ...prev,
      nextBalls: generateRandomBalls(BALLS_PER_TURN, 
        Math.max(...prev.nextBalls.map(ball => ball.id), 0) + 1)
    }));
    // This effect should run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset game function
  const resetGame = useCallback(() => {
    setPathCells([]);
    setIsAnimating(false);
    
    const grid: CellType[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null).map(() => ({ ball: null })));
    
    const nextBalls = generateRandomBalls(BALLS_PER_TURN, 1);
    
    setState({
      grid,
      score: 0,
      nextBalls,
      selectedCell: null,
      gameOver: false
    });
    
    // We need to call placeBallsRandomly in the next render cycle
    setTimeout(() => {
      setState(prev => {
        const newGrid = [...prev.grid.map(row => [...row])];
        
        for (const ball of prev.nextBalls) {
          const emptyCells = [];
          for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
              if (!newGrid[row][col].ball) {
                emptyCells.push({ row, col });
              }
            }
          }
          
          if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const { row, col } = emptyCells[randomIndex];
            
            newGrid[row][col] = { ball: ball as Ball };
            emptyCells.splice(randomIndex, 1);
          }
        }
        
        return {
          ...prev,
          grid: newGrid,
          nextBalls: generateRandomBalls(BALLS_PER_TURN, 
            Math.max(...prev.nextBalls.map(ball => ball.id), 0) + 1)
        };
      });
    }, 0);
  }, [generateRandomBalls]);

  return (
    <div className="game" ref={gameRef}>
      <div className="game-info">
        <div className="score">Score: {state.score}</div>
        <NextBallsPanel balls={state.nextBalls} />
      </div>
      <div ref={boardRef} className="board-container">
        <Board
          grid={state.grid}
          onCellClick={handleCellClick}
          selectedCell={state.selectedCell}
          pathCells={pathCells}
          lineAnimationCells={lineAnimations.positions}
        />
      </div>
      {state.gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Your score: {state.score}</p>
          <button onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Game; 