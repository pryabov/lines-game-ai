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
- **Multi-language support** (English, Russian, Spanish, German, Polish, Chinese, Japanese)
- **Theme switching** (Light and Dark mode)
- **Browser tab detection** to pause game activity when the tab is not active
- **Offline play support** via Progressive Web App (PWA) capabilities
- **Automatic game state saving** to continue from where you left off

See our [Future Plans](docs/FUTURE_PLANS.md) document for upcoming features and improvements.

## Technologies Used

- React
- TypeScript
- Webpack
- Yarn
- CSS3/SCSS
- Jotai (for state management)
- Web Vitals (for performance monitoring)

## Live Demo

You can play the released version of the game at [https://lines98.fun](https://lines98.fun)

## Development

This project has been built with the assistance of [Cursor AI](https://cursor.sh/), an AI-powered code editor.

## Getting Started

### Prerequisites

- Node.js (v24 or later)
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

```text
lines-game/
├── public/             # Static files
├── src/                # Source code
│   ├── components/     # React components
│   │   ├── Board.tsx   # Game board component
│   │   ├── Cell.tsx    # Cell component
│   │   ├── Game.tsx    # Main game logic
│   │   ├── LanguageSelector.tsx # Language selection component
│   │   ├── ThemeToggle.tsx     # Theme switching component
│   │   └── NextBallsPanel.tsx  # Component showing upcoming balls
│   ├── styles/         # SCSS styles
│   ├── translations/   # Language translations
│   │   ├── en.ts       # English translations
│   │   ├── ru.ts       # Russian translations
│   │   ├── es.ts       # Spanish translations
│   │   ├── de.ts       # German translations
│   │   ├── pl.ts       # Polish translations
│   │   ├── zh.ts       # Chinese translations
│   │   └── ja.ts       # Japanese translations
│   ├── utils/          # Utility functions
│   │   └── pathfinding.ts  # Path-finding algorithm
│   ├── hooks/          # Custom React hooks
│   ├── atoms/          # Jotai atoms for state management
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
- The game state is managed using React hooks and Jotai for global state.
- Animations are created using CSS transitions and keyframes.
- Language detection automatically sets the game to the user's browser language if supported.
- Theme preference is saved and restored between sessions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
