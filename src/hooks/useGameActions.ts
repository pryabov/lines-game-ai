import { useAtom } from 'jotai';
import { useCallback, useRef } from 'react';
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

  // References for DOM elements
  const gameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

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
        
        // Update score and grid
        setScore(prev => prev + cellsToRemove.length);
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
  }, [grid, setGrid, setScore, setLineAnimations]);

  // Place initial balls randomly on the grid
  const placeRandomBalls = useCallback(() => {
    setGrid(placeBallsRandomly(grid, nextBalls));
    setNextBalls(getNextBalls(nextBalls));
    
    // Check for lines after placing balls
    setTimeout(() => {
      checkForLines();
    }, 100);
  }, [grid, nextBalls, setGrid, setNextBalls, checkForLines]);

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
        
        // Get the selected ball before any state updates
        const selectedBall = grid[selectedRow][selectedCol].ball as Ball;
        
        // Create a moving ball element for animation
        if (gameRef.current && boardRef.current) {
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
          
          // Create a deep copy of the grid
          const newGrid = copyGrid(grid);
          
          // Remove the ball from the starting position
          newGrid[selectedRow][selectedCol] = { ball: null };
          
          // Update grid without the ball
          setGrid(newGrid);
          setSelectedCell(null);
          
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
              void ballInner.offsetWidth; // Force reflow to restart animation
              ballInner.style.animation = `jumpAnimation ${JUMP_ANIMATION_DURATION}ms ease-out`;
              
              stepIndex++;
              setTimeout(animateStep, STEP_DURATION);
            } else {
              // Animation complete - remove the moving ball
              boardRef.current?.removeChild(movingBall);
              
              // Place the ball at the final position
              const finalPos = path[path.length - 1];
              const updatedGrid = placeBall(newGrid, selectedBall, finalPos);
              
              setGrid(updatedGrid);
              
              // Clear the path
              setTimeout(() => {
                setPathCells([]);
                setIsAnimating(false);
                
                // Check for lines after moving the ball
                const hasLines = checkForLines(updatedGrid);
                
                // If no lines formed, place new balls
                if (!hasLines) {
                  // Add next balls to the grid
                  const emptyCells = findEmptyCells(updatedGrid);
                  
                  if (emptyCells.length < nextBalls.length) {
                    setGameOver(true);
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
              }, 200);
            }
          };
          
          // Start the animation after a short delay to let the path display
          setTimeout(animateStep, 300);
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
    setGameOver
  ]);

  // Reset the game
  const resetGame = useCallback(() => {
    setPathCells([]);
    setIsAnimating(false);
    setGrid(createEmptyGrid());
    setScore(0);
    setNextBalls(generateRandomBalls(BALLS_PER_TURN, 1));
    setSelectedCell(null);
    setGameOver(false);
    setLineAnimations({ positions: [], isAnimating: false });
    
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
    handleCellClick,
    resetGame,
    placeRandomBalls,
    gameRef,
    boardRef
  };
}; 