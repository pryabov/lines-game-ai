# Lines Game

A classic "Lines" (also known as "Color Lines") game implemented using React and TypeScript.

## Game Rules

1. The game is played on a 9x9 grid.
2. Balls of various colors appear on the board.
3. Your goal is to arrange balls of the same color into lines of 5 or more (horizontally, vertically, or diagonally).
4. To move a ball, click on it and then click on an empty cell where you want to move it.
5. A ball can only move if there's a clear path to the destination.
6. After each move, three new balls will appear on the board.
7. When you create a line of 5 or more balls of the same color, those balls will disappear, and you'll earn points.
8. The game ends when the board fills up with no more room for new balls.

## Features

- Clean and simple UI
- Responsive design
- Preview of upcoming balls
- Path-finding algorithm to ensure valid moves
- Score tracking
- Game over detection and restart option
- Animated ball movements and line completions

## Technologies Used

- React
- TypeScript
- Webpack
- Yarn
- CSS3

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- Yarn (v1.22.0 or later)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/pryabov/lines-game-ai.git
   cd lines-game
   ```

2. Install dependencies:

   ```bash
   yarn
   ```

3. Start the development server:

   ```bash
   yarn start
   ```

4. Open your browser and navigate to <http://localhost:3000>

### Building for Production

To create a production build:

```bash
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
lines-game/
├── public/             # Static files
├── src/                # Source code
│   ├── components/     # React components
│   │   ├── Board.tsx   # Game board component
│   │   ├── Cell.tsx    # Cell component
│   │   ├── Game.tsx    # Main game logic
│   │   └── NextBallsPanel.tsx  # Component showing upcoming balls
│   ├── styles/         # CSS styles
│   │   ├── Board.css
│   │   ├── Cell.css
│   │   ├── Game.css
│   │   └── NextBallsPanel.css
│   ├── utils/          # Utility functions
│   │   └── pathfinding.ts  # Path-finding algorithm
│   ├── types.ts        # TypeScript type definitions
│   ├── App.tsx         # Main App component
│   ├── index.tsx       # Entry point
│   └── ...
└── ...
```

## Game Implementation Details

- The game uses a breadth-first search algorithm for path-finding.
- Ball movements are restricted to paths without obstacles.
- Line detection works in four directions: horizontal, vertical, and both diagonals.
- The game state is managed using React hooks.
- Animations are created using CSS transitions and keyframes.

## License

MIT
