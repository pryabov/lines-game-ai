# Project Organization — Lines Game

## Overview

Lines Game is a classic "Color Lines" (Lines 98) browser game built with React + TypeScript. Players move colored balls on a 9x9 grid to form lines of 5+ same-color balls, which are then removed for points. The game ends when the board fills up.

**Live URL:** lines98.fun
**Tech stack:** React 19, TypeScript 5.8, Jotai (state), SCSS (styles), Webpack 5 (build), Jest (tests)

---

## Directory Structure

```
src/
├── atoms/                      # Jotai atoms and pure game logic
│   ├── gameAtoms.ts            # All game state atoms + constants
│   ├── gameLogic.ts            # Pure functions: line detection, ball placement, grid ops
│   └── themeAtom.ts            # Theme state atom
│
├── components/                 # React components
│   ├── AnalyticsProvider.tsx   # Google Analytics consent + provider
│   ├── Board.tsx               # 9x9 grid renderer
│   ├── Cell.tsx                # Individual grid cell (ball or empty)
│   ├── ConfirmDialog.tsx       # Generic confirmation dialog
│   ├── ConsentDialog.tsx       # Analytics consent dialog
│   ├── Game.tsx                # Main game orchestrator (score, board, controls)
│   ├── GameOverDialog.tsx      # Game over screen with score
│   ├── HelpDialog.tsx          # How-to-play instructions
│   ├── InstallPrompt.tsx       # PWA install prompt
│   ├── LanguageSelector.tsx    # Language dropdown (7 languages)
│   ├── NextBallsPanel.tsx      # Shows next 3 balls preview
│   ├── OfflineNotice.tsx       # Offline status indicator
│   ├── ThemeToggle.tsx         # Dark/light theme switch
│   ├── UpdateNotification.tsx  # PWA update available notice
│   ├── BallAnimationSelector.tsx  # Animation mode selector
│   └── settings/
│       ├── SettingsButton.tsx  # Settings gear icon button
│       └── SettingsDialog.tsx  # Settings modal (theme, language, animation)
│
├── hooks/                      # Custom React hooks
│   ├── useBallMovementAnimation.ts  # Animation mode persistence
│   ├── useGameActions.ts       # Core game actions (click, move, reset, animate)
│   ├── useGameAnalytics.ts     # Game event tracking
│   ├── useGameStatePersistence.ts  # Save/load game state to localStorage
│   ├── useHighScore.ts         # High score tracking
│   ├── useLanguage.tsx         # Language context provider + hook
│   ├── useServiceWorker.ts     # Service worker registration
│   ├── useSettingsInitialization.ts  # Settings migration on app load
│   └── useTheme.ts             # Theme persistence
│
├── services/                   # External service integrations
│   ├── analytics.ts            # Google Analytics wrapper
│   └── storageService.ts       # localStorage abstraction
│
├── translations/               # i18n translation files
│   ├── en.ts                   # English (SOURCE OF TRUTH)
│   ├── ru.ts                   # Russian
│   ├── es.ts                   # Spanish
│   ├── de.ts                   # German
│   ├── pl.ts                   # Polish
│   ├── zh.ts                   # Chinese (Simplified)
│   └── ja.ts                   # Japanese
│
├── utils/
│   └── pathfinding.ts          # BFS pathfinding algorithm
│
├── styles/                     # SCSS stylesheets
│   ├── App.scss
│   ├── Board.scss
│   ├── Game.scss
│   ├── NextBallsPanel.scss
│   └── DarkTheme.scss
│
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Root component (providers + layout)
├── App.test.tsx                # App-level tests
├── index.tsx                   # Entry point
├── react-app-env.d.ts          # CRA type declarations
├── reportWebVitals.ts          # Web Vitals reporting
└── setupTests.ts               # Jest test setup
```

---

## Component Architecture

```
App (Provider > LanguageProvider > AnalyticsProvider)
└── AppContent
    ├── Header (title, LanguageSelector, ThemeToggle, SettingsButton)
    ├── Game
    │   ├── GameInfo (score, NextBallsPanel, high score)
    │   ├── Board
    │   │   └── Cell (×81) — each cell renders a ball or empty space
    │   ├── GameControls (reset button, help button)
    │   ├── GameOverDialog
    │   ├── ConfirmDialog (reset confirmation)
    │   └── HelpDialog
    ├── Footer
    ├── OfflineNotice
    ├── InstallPrompt
    └── UpdateNotification
```

---

## State Management (Jotai)

### Core Atoms (`gameAtoms.ts`)
| Atom | Type | Description |
|------|------|-------------|
| `gridAtom` | `CellType[][]` | 9x9 game grid |
| `scoreAtom` | `number` | Current score |
| `nextBallsAtom` | `Ball[]` | Next 3 balls to be placed |
| `selectedCellAtom` | `Position \| null` | Currently selected cell |
| `gameOverAtom` | `boolean` | Game over flag |
| `movesMadeAtom` | `number` | Total moves in current game |

### Animation Atoms
| Atom | Type | Description |
|------|------|-------------|
| `pathCellsAtom` | `Position[]` | Highlighted path cells |
| `isAnimatingAtom` | `boolean` | Animation in progress flag |
| `lineAnimationsAtom` | `{ positions, isAnimating }` | Line removal animation state |
| `ballMovementAnimationAtom` | `BallMovementAnimation` | Selected animation mode |

### Derived
| Atom | Type | Description |
|------|------|-------------|
| `gameStateAtom` | `GameState` | Combined read-only view of all core atoms |

---

## Game Data Flow

```
User clicks cell
  → handleCellClick (useGameActions)
    → If ball: select/deselect
    → If empty + selected: findPath (BFS)
      → If path exists:
        1. Set isAnimating = true
        2. Remove ball from source (grid update)
        3. Create DOM moving ball element
        4. Animate along path (step-by-step / show-path / instant)
        5. On complete: place ball at destination (grid update)
        6. Check for completed lines (findCompletedLines)
          → If lines: animate removal, update score, remove balls
          → If no lines: place 3 new random balls, check for new lines
        7. Check game over (fewer than 3 empty cells)
        8. Set isAnimating = false
```

---

## Key Types (`types.ts`)

```typescript
type BallColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'cyan' | 'orange';
type BallMovementAnimation = 'step-by-step' | 'show-path-then-move' | 'instant-move';

interface Ball { color: BallColor; id: number; }
interface CellType { ball: Ball | null; pathHighlight?: boolean; }
interface Position { row: number; col: number; }
interface GameState { grid, score, nextBalls, selectedCell, gameOver, movesMade }
```

---

## Game Constants (`gameAtoms.ts`)

| Constant | Value | Description |
|----------|-------|-------------|
| `GRID_SIZE` | 9 | Grid dimension |
| `COLORS` | 7 colors | Available ball colors |
| `BALLS_PER_TURN` | 3 | Balls added per turn |
| `MIN_LINE_LENGTH` | 5 | Minimum balls to form a line |
| `ANIMATION_DURATION` | 800ms | General animation duration |
| `LINE_ANIMATION_DURATION` | 2000ms | Line removal animation |
| `BALL_SIZE_RATIO` | 0.75 | Ball size relative to cell |

---

## Build & Development

| Command | Purpose |
|---------|---------|
| `yarn start` | Dev server (Webpack) |
| `yarn build` | Production build |
| `yarn test` | Run Jest tests |
| `yarn type-check` | TypeScript compilation check |
| `yarn lint` | ESLint check |
| `yarn lint:fix` | ESLint auto-fix |
| `yarn format` | Prettier formatting |

---

## Key Patterns

## Testing

### Structure
```
src/__tests__/
├── helpers/
│   ├── renderWithProviders.tsx   # Render with Jotai + LanguageProvider
│   ├── gameTestUtils.ts          # Grid builders, ball helpers
│   └── localStorageMock.ts       # localStorage mock
├── integration/                  # User journey tests (UJ-1 through UJ-13)
│   ├── newGame.test.tsx          # UJ-1: First-time player
│   ├── coreGameplay.test.tsx     # UJ-2, UJ-3: Gameplay + blocked path
│   ├── gameOver.test.tsx         # UJ-4: Game over
│   ├── resetGame.test.tsx        # UJ-5: Reset mid-play
│   ├── helpDialog.test.tsx       # UJ-6: Help dialog
│   ├── settings.test.tsx         # UJ-7–9: Theme, language, animation
│   ├── persistence.test.tsx      # UJ-10, UJ-11: State + high score
│   ├── consent.test.tsx          # UJ-12: Analytics consent
│   └── offline.test.tsx          # UJ-13: Offline play
└── unit/
    ├── gameLogic.test.ts         # Pure game logic functions
    └── pathfinding.test.ts       # BFS pathfinding
```

### Key references
- User journeys: `docs/USER_JOURNEYS.md`
- Test implementation plan: `docs/work_plans/INTEGRATION_TESTS.md`

---

## Key Patterns

### Adding a new game feature
1. Define any new types in `types.ts`
2. Add state atoms in `gameAtoms.ts`
3. Add pure logic functions in `gameLogic.ts`
4. Create/update hook in `hooks/` to expose actions
5. Update component(s) to use the hook
6. Add translation keys to all 7 language files
7. Add/update integration tests in `src/__tests__/integration/`
8. Run `yarn test` — all tests must pass

### Adding a new translation key
1. Add key to `src/translations/en.ts` first (source of truth)
2. Add same key with translated value to all other 6 files
3. Access via `translations.section.key` from `useLanguage()` hook

### Adding a new animation mode
1. Add variant to `BallMovementAnimation` type in `types.ts`
2. Implement animation function in `useGameActions.ts`
3. Add case to the switch statement in `handleCellClick`
4. Add UI option in `SettingsDialog.tsx` and `BallAnimationSelector.tsx`
5. Add translation keys for the new option name
