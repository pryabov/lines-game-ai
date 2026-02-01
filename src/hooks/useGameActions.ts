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
  ballMovementAnimationAtom,
  JUMP_ANIMATION_DURATION,
  PATH_STEP_DELAY,
  INITIAL_MOVE_DELAY,
  FAST_STEP_DURATION,
  PATH_SHOW_DURATION,
  INSTANT_MOVE_DELAY,
  LINE_ANIMATION_DURATION,
  BALL_SIZE_RATIO,
  STEP_TRANSITION_DURATION,
  SCORE_TABLE,
  DEFAULT_SCORE_MULTIPLIER,
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
  const [ballMovementAnimation] = useAtom(ballMovementAnimationAtom);

  // References for DOM elements
  const gameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Animation helper functions
  const createMovingBall = useCallback((selectedBall: Ball, boardRect: DOMRect) => {
    const cellWidth = boardRect.width / 9;
    const cellHeight = boardRect.height / 9;
    const actualBallSize = Math.min(cellWidth, cellHeight) * BALL_SIZE_RATIO;

    const movingBall = document.createElement('div');
    movingBall.className = 'moving-ball';
    
    const ballInner = document.createElement('div');
    ballInner.className = `ball-inner ball-${selectedBall.color}-inner`;
    movingBall.appendChild(ballInner);
    
    // Set up the moving ball styling
    movingBall.style.position = 'absolute';
    movingBall.style.width = `${actualBallSize}px`;
    movingBall.style.height = `${actualBallSize}px`;
    movingBall.style.display = 'flex';
    movingBall.style.justifyContent = 'center';
    movingBall.style.alignItems = 'center';
    movingBall.style.opacity = '1';
    movingBall.style.visibility = 'visible';
    
    // Initial box shadow for the ball
    movingBall.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    
    // Set up the inner ball styling
    ballInner.style.width = '100%';
    ballInner.style.height = '100%';
    ballInner.style.borderRadius = '50%';
    ballInner.style.display = 'block';
    
    // Initial inner ball shadow
    ballInner.style.boxShadow = 'inset -3px -3px 5px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)';

    return { movingBall, actualBallSize };
  }, []);

  const positionBallAtCell = useCallback((movingBall: HTMLElement, row: number, col: number, actualBallSize: number, boardRect: DOMRect) => {
    const bodyRect = document.body.getBoundingClientRect();
    
    const targetCell = boardRef.current?.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    
    if (targetCell) {
      const targetRect = targetCell.getBoundingClientRect();
      const destX = targetRect.left - bodyRect.left + (targetRect.width - actualBallSize) / 2;
      const destY = targetRect.top - bodyRect.top + (targetRect.height - actualBallSize) / 2;
      
      movingBall.style.left = `${destX}px`;
      movingBall.style.top = `${destY}px`;
    } else {
      // Fallback calculation
      const cellWidth = boardRect.width / 9;
      const cellHeight = boardRect.height / 9;
      const boardOffsetX = boardRect.left - bodyRect.left;
      const boardOffsetY = boardRect.top - bodyRect.top;
      const destX = col * cellWidth + (cellWidth - actualBallSize) / 2;
      const destY = row * cellHeight + (cellHeight - actualBallSize) / 2;
      
      movingBall.style.left = `${boardOffsetX + destX}px`;
      movingBall.style.top = `${boardOffsetY + destY}px`;
    }
  }, []);

  // Animation implementations for different types
  const animateStepByStep = useCallback((movingBall: HTMLElement, path: Position[], actualBallSize: number, boardRect: DOMRect, onComplete: () => void) => {
    let currentStep = 0;
    const steps = path.length;

    // Set up proper transitions for step-by-step movement
    movingBall.style.transition = `left ${STEP_TRANSITION_DURATION} ease-in-out, top ${STEP_TRANSITION_DURATION} ease-in-out`;
    
    const moveToNextPosition = () => {
      if (currentStep < steps) {
        const { row: pathRow, col: pathCol } = path[currentStep];
        
        // Add jumping animation
        movingBall.classList.add('jumping');
        
        // Remove box shadows during jump
        movingBall.style.boxShadow = 'none';
        const ballInner = movingBall.querySelector('.ball-inner') as HTMLElement;
        if (ballInner) {
          ballInner.style.boxShadow = 'none';
        }
        
        // Move to position
        positionBallAtCell(movingBall, pathRow, pathCol, actualBallSize, boardRect);
        
        // Force reflow to ensure position is applied
        void movingBall.offsetWidth;
        
        setTimeout(() => {
          // Remove jumping class
          movingBall.classList.remove('jumping');
          
          // Restore box shadows
          movingBall.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
          if (ballInner) {
            ballInner.style.boxShadow = 'inset -3px -3px 5px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)';
          }
          
          currentStep++;
          if (currentStep < steps) {
            setTimeout(moveToNextPosition, PATH_STEP_DELAY);
          } else {
            onComplete();
          }
        }, JUMP_ANIMATION_DURATION);
      }
    };

    setTimeout(moveToNextPosition, INITIAL_MOVE_DELAY);
  }, [positionBallAtCell]);

  const animateShowPathThenMove = useCallback((movingBall: HTMLElement, path: Position[], actualBallSize: number, boardRect: DOMRect, onComplete: () => void) => {
    // Show path first (path cells are already set)
    setTimeout(() => {
      let currentStep = 0;
      const steps = path.length;

      // Set up smooth transition for each step
      movingBall.style.transition = `left ${FAST_STEP_DURATION}ms linear, top ${FAST_STEP_DURATION}ms linear`;

      const moveToNextPosition = () => {
        if (currentStep < steps) {
          const { row: pathRow, col: pathCol } = path[currentStep];

          // Move smoothly to next position in path
          positionBallAtCell(movingBall, pathRow, pathCol, actualBallSize, boardRect);

          currentStep++;

          if (currentStep < steps) {
            // Continue to next position
            setTimeout(moveToNextPosition, FAST_STEP_DURATION);
          } else {
            // Animation complete - wait for final transition to finish
            setTimeout(() => {
              onComplete();
            }, FAST_STEP_DURATION + INSTANT_MOVE_DELAY);
          }
        }
      };

      // Start the path movement
      moveToNextPosition();

    }, PATH_SHOW_DURATION);
  }, [positionBallAtCell]);

  const animateInstantMove = useCallback((movingBall: HTMLElement, path: Position[], actualBallSize: number, boardRect: DOMRect, onComplete: () => void) => {
    // Move instantly to final position
    const finalPos = path[path.length - 1];
    movingBall.style.transition = 'none';
    positionBallAtCell(movingBall, finalPos.row, finalPos.col, actualBallSize, boardRect);

    setTimeout(() => {
      onComplete();
    }, INSTANT_MOVE_DELAY);
  }, [positionBallAtCell]);

  // Calculate score based on the number of balls in a line
  const calculateScore = useCallback((lineLength: number) => {
    return SCORE_TABLE[lineLength] ?? lineLength * DEFAULT_SCORE_MULTIPLIER;
  }, []);

  // Check if the game is over (not enough empty cells for next balls)
  const checkGameOver = useCallback(() => {
    const emptyCells = findEmptyCells(grid);
    if (emptyCells.length < BALLS_PER_TURN) {
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
      }, LINE_ANIMATION_DURATION);
      
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
        // Show the path (for show-path-then-move and step-by-step, but not for instant-move)
        if (ballMovementAnimation !== 'instant-move') {
          setPathCells(path);
        }
        setIsAnimating(true);
        
        // Increment the moves counter
        setMovesMade(prev => prev + 1);
        
        // Get the selected ball before any state updates
        const selectedBall = grid[selectedRow][selectedCol].ball as Ball;
        
        // Create a moving ball element for animation
        if (gameRef.current && boardRef.current) {
          const boardRect = boardRef.current.getBoundingClientRect();
          const { movingBall, actualBallSize } = createMovingBall(selectedBall, boardRect);
          
          // Create a deep copy of the grid
          const newGrid = copyGrid(grid);
          
          // Remove the ball from the starting position
          newGrid[selectedRow][selectedCol] = { ball: null };
          setGrid(newGrid);
          setSelectedCell(null);
          
          // Position ball at starting position
          movingBall.style.transition = 'none';
          positionBallAtCell(movingBall, selectedRow, selectedCol, actualBallSize, boardRect);
          document.body.appendChild(movingBall);
          
          // Force reflow
          void movingBall.offsetWidth;
          
          // Animation completion handler
          const onAnimationComplete = () => {
            // Remove the moving ball
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
          };
          
          // Choose animation based on setting
          switch (ballMovementAnimation) {
            case 'step-by-step':
              animateStepByStep(movingBall, path, actualBallSize, boardRect, onAnimationComplete);
              break;
            case 'show-path-then-move':
              animateShowPathThenMove(movingBall, path, actualBallSize, boardRect, onAnimationComplete);
              break;
            case 'instant-move':
              animateInstantMove(movingBall, path, actualBallSize, boardRect, onAnimationComplete);
              break;
          }
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
    checkGameOver,
    ballMovementAnimation
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