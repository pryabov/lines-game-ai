import { useAtom } from 'jotai';
import { useCallback, useRef, useEffect } from 'react';
import { findPath } from '../utils/pathfinding';
import {
  gridAtom,
  scoreAtom,
  nextBallsAtom,
  selectedCellAtom,
  gameOverAtom,
  pathCellsAtom,
  isAnimatingAtom,
  lineAnimationsAtom,
  movesMadeAtom,
  STEP_DURATION,
  JUMP_ANIMATION_DURATION,
  createEmptyGrid,
  generateRandomBalls,
  BALLS_PER_TURN
} from '../atoms/gameAtoms';
import {
  findEmptyCells,
  findCompletedLines,
  placeBallsRandomly,
  copyGrid,
  removeGridBalls,
  getNextBalls,
  placeBall
} from '../atoms/gameLogic';
import { Ball, Position } from '../types';

export const useGameActions = () => {
  const [grid, setGrid] = useAtom(gridAtom);
  const [score, setScore] = useAtom(scoreAtom);
  const [nextBalls, setNextBalls] = useAtom(nextBallsAtom);
  const [selectedCell, setSelectedCell] = useAtom(selectedCellAtom);
  const [gameOver, setGameOver] = useAtom(gameOverAtom);
  const [pathCells, setPathCells] = useAtom(pathCellsAtom);
  const [isAnimating, setIsAnimating] = useAtom(isAnimatingAtom);
  const [lineAnimations, setLineAnimations] = useAtom(lineAnimationsAtom);
  const [movesMade, setMovesMade] = useAtom(movesMadeAtom);

  // References for DOM elements
  const gameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Calculate score based on the number of balls in a line
  const calculateScore = useCallback((lineLength: number) => {
    switch (lineLength) {
      case 5: return 10;
      case 6: return 12;
      case 7: return 18;
      case 8: return 28;
      case 9: return 42;
      default: return lineLength * 2; // Fallback for any other lengths
    }
  }, []);

  // Check if the game is over (not enough empty cells for next balls)
  const checkGameOver = useCallback(() => {
    const emptyCells = findEmptyCells(grid);
    if (emptyCells.length < BALLS_PER_TURN) {
      console.log('Game over: Not enough empty cells for next balls');
      setGameOver(true);
      return true;
    }
    return false;
  }, [grid, setGameOver]);

  // Check for completed lines after a move or ball placement
  const checkForLines = useCallback((currentGrid = grid) => {
    const cellsToRemove = findCompletedLines(currentGrid);
    
    if (cellsToRemove.length > 0) {
      // Set up animation
      setLineAnimations({
        positions: cellsToRemove,
        isAnimating: true
      });
      
      // Remove the balls after animation completes
      setTimeout(() => {
        const newGrid = removeGridBalls(currentGrid, cellsToRemove);
        
        // Calculate score based on the number of balls in each line
        // This is a simplification - ideally we'd identify distinct lines
        // For now we'll just award points based on total balls removed
        const scoreToAdd = calculateScore(cellsToRemove.length);
        
        // Update score and grid
        setScore(prev => prev + scoreToAdd);
        setGrid(newGrid);
        
        // Clear animation
        setLineAnimations({
          positions: [],
          isAnimating: false
        });
      }, 2000); // Wait for animation to complete
      
      return true;
    }
    
    return false;
  }, [grid, setGrid, setScore, setLineAnimations, calculateScore]);

  // Effect to check for game over after grid changes
  useEffect(() => {
    // Don't check during animations or if game is already over
    if (!isAnimating && !gameOver) {
      checkGameOver();
    }
  }, [grid, isAnimating, gameOver, checkGameOver]);

  // Place initial balls randomly on the grid
  const placeRandomBalls = useCallback(() => {
    // If it's called as part of a reset, we should create a fresh grid
    // to ensure we're starting with a clean board
    const currentGrid = grid.every(row => row.every(cell => cell.ball === null)) 
      ? grid  // Grid is already empty, use it
      : createEmptyGrid();  // Grid has balls, create a new empty one
      
    // Place the balls on the grid (either existing empty or new empty)
    const updatedGrid = placeBallsRandomly(currentGrid, nextBalls);
    setGrid(updatedGrid);
    
    // Generate new "next balls"
    setNextBalls(getNextBalls(nextBalls));
    
    // Check for lines after placing balls
    setTimeout(() => {
      const hasLines = checkForLines();
      // If no lines were formed, check if game is over
      if (!hasLines) {
        checkGameOver();
      }
    }, 100);
  }, [grid, nextBalls, setGrid, setNextBalls, checkForLines, checkGameOver]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    // Don't allow clicking while animation is playing
    if (gameOver || isAnimating) return;
    
    const clickedCell = grid[row][col];
    
    // If clicked on a ball
    if (clickedCell.ball) {
      // Check if the clicked ball is already selected
      if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
        // Unselect the ball
        setSelectedCell(null);
        return;
      }
      
      // Select the new ball
      setSelectedCell({ row, col });
      setPathCells([]); // Clear any previous path
      return;
    }
    
    // If a ball is selected and clicked on an empty cell
    if (selectedCell) {
      const { row: selectedRow, col: selectedCol } = selectedCell;
      
      // Make sure we don't try to move a non-existent ball
      if (!grid[selectedRow][selectedCol].ball) {
        setSelectedCell(null);
        return;
      }
      
      // Find path from selected ball to clicked cell
      const path = findPath(
        grid,
        { row: selectedRow, col: selectedCol },
        { row, col }
      );
      
      // If there's a valid path
      if (path.length > 0) {
        // Show the path
        setPathCells(path);
        setIsAnimating(true);
        
        // Increment the moves counter
        setMovesMade(prev => prev + 1);
        
        // Get the selected ball before any state updates
        const selectedBall = grid[selectedRow][selectedCol].ball as Ball;
        
        // Create a moving ball element for animation
        if (gameRef.current && boardRef.current) {
          // Get board's actual dimensions and position
          const boardRect = boardRef.current.getBoundingClientRect();
          
          // Calculate actual cell dimensions
          const cellWidth = boardRect.width / 9;
          const cellHeight = boardRect.height / 9;
          
          // Create moving ball element
          const movingBall = document.createElement('div');
          movingBall.className = 'moving-ball';
          
          // Create ball inner element
          const ballInner = document.createElement('div');
          ballInner.className = `ball-inner ball-${selectedBall.color}-inner`;
          movingBall.appendChild(ballInner);
          
          // Create a deep copy of the grid
          const newGrid = copyGrid(grid);
          
          // Remove the ball from the starting position
          newGrid[selectedRow][selectedCol] = { ball: null };
          setGrid(newGrid);
          setSelectedCell(null);
          
          // Ensure the ball has proper dimensions - use actual sizes rather than CSS variables
          // since the CSS variables might not be correctly evaluated in this context
          const actualBallSize = Math.min(cellWidth, cellHeight) * 0.75; // 75% of cell size
          
          // Initialize the ball properties with explicit dimensions
          movingBall.style.position = 'absolute';
          movingBall.style.width = `${actualBallSize}px`;
          movingBall.style.height = `${actualBallSize}px`;
          movingBall.style.display = 'flex'; // Ensure proper display mode
          movingBall.style.justifyContent = 'center';
          movingBall.style.alignItems = 'center';
          movingBall.style.opacity = '1';
          
          // Also set explicit dimensions on the inner ball
          ballInner.style.width = '100%';
          ballInner.style.height = '100%';
          ballInner.style.borderRadius = '50%';
          ballInner.style.display = 'block';
          
          // Calculate starting position using the actual ball size
          const startX = selectedCol * cellWidth + (cellWidth - actualBallSize) / 2;
          const startY = selectedRow * cellHeight + (cellHeight - actualBallSize) / 2;
          
          // Set initial position (this is just a placeholder, it will be immediately overridden)
          movingBall.style.left = `${startX}px`;
          movingBall.style.top = `${startY}px`;
          
          // Make sure the ball is created at the exact source position
          document.body.appendChild(movingBall);
          
          // Calculate the correct position relative to viewport
          const bodyRect = document.body.getBoundingClientRect();
          const boardOffsetX = boardRect.left - bodyRect.left;
          const boardOffsetY = boardRect.top - bodyRect.top;
          
          // Important: Set correct position IMMEDIATELY to avoid seeing the ball flying from elsewhere
          // Disable transitions temporarily
          movingBall.style.transition = 'none';
          
          // Get the exact source position using the special data attribute we added to cells
          const sourceCell = boardRef.current?.querySelector(`.cell[data-row="${selectedRow}"][data-col="${selectedCol}"]`);
          
          if (sourceCell) {
            const sourceCellRect = sourceCell.getBoundingClientRect();
            // Position the ball at the center of the source cell
            const initialX = sourceCellRect.left - bodyRect.left + (sourceCellRect.width - actualBallSize) / 2;
            const initialY = sourceCellRect.top - bodyRect.top + (sourceCellRect.height - actualBallSize) / 2;
            
            // Apply the position without transitions
            movingBall.style.left = `${initialX}px`;
            movingBall.style.top = `${initialY}px`;
          } else {
            // Fallback to calculated position if cell element not found
            movingBall.style.left = `${boardOffsetX + startX}px`;
            movingBall.style.top = `${boardOffsetY + startY}px`;
          }
          
          // Force reflow to ensure the position is applied immediately
          void movingBall.offsetWidth;
          
          // Re-enable transitions for future movements
          setTimeout(() => {
            movingBall.style.transition = 'left 0.25s ease-in-out, top 0.25s ease-in-out';
          }, 0);
          
          // Animate along path
          let currentStep = 0;
          const steps = path.length;
          
          // Function to move to next position and animate
          const moveToNextPosition = () => {
            if (currentStep < steps) {
              // Get current position in the path
              const { row: pathRow, col: pathCol } = path[currentStep];
              
              // Get the target cell from the DOM for accurate positioning
              const targetCell = boardRef.current?.querySelector(`.cell[data-row="${pathRow}"][data-col="${pathCol}"]`);
              
              if (targetCell) {
                // Use the actual cell position from the DOM
                const targetRect = targetCell.getBoundingClientRect();
                // Calculate position to center the ball in the cell
                const destX = targetRect.left - bodyRect.left + (targetRect.width - actualBallSize) / 2;
                const destY = targetRect.top - bodyRect.top + (targetRect.height - actualBallSize) / 2;
                
                // Add jumping animation
                movingBall.classList.add('jumping');
                
                // Explicitly remove box shadow
                movingBall.style.boxShadow = 'none';
                ballInner.style.boxShadow = 'none';
                
                // Update ball position
                movingBall.style.left = `${destX}px`;
                movingBall.style.top = `${destY}px`;
              } else {
                // Fallback to calculated position if cell element not found
                const destX = pathCol * cellWidth + (cellWidth - actualBallSize) / 2;
                const destY = pathRow * cellHeight + (cellHeight - actualBallSize) / 2;
                
                // Add jumping animation
                movingBall.classList.add('jumping');
                
                // Explicitly remove box shadow
                movingBall.style.boxShadow = 'none';
                ballInner.style.boxShadow = 'none';
                
                // Update ball position
                movingBall.style.left = `${boardOffsetX + destX}px`;
                movingBall.style.top = `${boardOffsetY + destY}px`;
              }

              // Force the browser to recognize the ball by triggering reflow
              void movingBall.offsetWidth;
              
              // Wait for jump animation to complete before moving to next step
              setTimeout(() => {
                // Remove jumping class
                movingBall.classList.remove('jumping');
                
                // Restore box shadow
                movingBall.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                ballInner.style.boxShadow = 'inset -3px -3px 5px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)';
                
                // Move to next step
                currentStep++;
                
                if (currentStep < steps) {
                  // Add a short delay between jumps
                  setTimeout(moveToNextPosition, 80);
                } else {
                  // Animation complete - remove the moving ball
                  document.body.removeChild(movingBall);
                  
                  // Place the ball at the final position
                  const finalPos = path[path.length - 1];
                  const updatedGrid = placeBall(newGrid, selectedBall, finalPos);
                  setGrid(updatedGrid);
                  
                  // Clear the path and animation state
                  setPathCells([]);
                  setIsAnimating(false);
                  
                  // Check for lines after moving the ball
                  const hasLines = checkForLines(updatedGrid);
                  
                  // If no lines formed, place new balls
                  if (!hasLines) {
                    // Check if game is over before placing new balls
                    if (checkGameOver()) {
                      return;
                    }
                    
                    const newerGrid = placeBallsRandomly(updatedGrid, nextBalls);
                    const newNextBalls = getNextBalls(nextBalls);
                    
                    // Update state with new grid and next balls
                    setGrid(newerGrid);
                    setNextBalls(newNextBalls);
                    
                    // Check for lines after placing new balls
                    checkForLines(newerGrid);
                  }
                }
              }, JUMP_ANIMATION_DURATION);
            }
          };
          
          // Add a small delay to ensure state updates are complete
          setTimeout(() => {
            // Double check ball is visible
            movingBall.style.visibility = 'visible';
            // Start animation after ensuring the ball is correctly positioned
            moveToNextPosition();
          }, 100); // Increased delay to ensure proper positioning
        }
      }
    }
  }, [
    gameOver, 
    isAnimating, 
    grid, 
    selectedCell, 
    setSelectedCell, 
    setPathCells, 
    setIsAnimating, 
    setGrid, 
    checkForLines, 
    nextBalls, 
    setNextBalls, 
    setGameOver,
    setMovesMade,
    checkGameOver
  ]);

  // Reset the game with confirmation check if moves have been made
  const resetGame = useCallback(() => {
    // We've moved the confirmation to the Game component with custom dialog
    
    setPathCells([]);
    setIsAnimating(false);
    setGrid(createEmptyGrid());
    setScore(0);
    setNextBalls(generateRandomBalls(BALLS_PER_TURN, 1));
    setSelectedCell(null);
    setGameOver(false);
    setLineAnimations({ positions: [], isAnimating: false });
    setMovesMade(0); // Reset moves counter
    
    // We need to place initial balls in the next render cycle
    setTimeout(() => {
      placeRandomBalls();
    }, 0);
  }, [
    setPathCells, 
    setIsAnimating, 
    setGrid, 
    setScore, 
    setNextBalls, 
    setSelectedCell, 
    setGameOver, 
    setLineAnimations,
    setMovesMade,
    placeRandomBalls
  ]);

  return {
    grid,
    score,
    nextBalls,
    selectedCell,
    gameOver,
    pathCells,
    lineAnimations: lineAnimations.positions,
    isAnimating: isAnimating || lineAnimations.isAnimating,
    movesMade,
    handleCellClick,
    resetGame,
    placeRandomBalls,
    gameRef,
    boardRef
  };
}; 