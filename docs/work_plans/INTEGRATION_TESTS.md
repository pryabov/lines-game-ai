# Integration Tests Implementation Plan

**Date:** 2026-04-06
**Authors:** QA Specialist + Tech Lead
**Status:** Planned
**Covers:** All user journeys defined in `docs/USER_JOURNEYS.md`

---

## Current State

### What Exists
- **2 tests** in `src/App.test.tsx` — smoke tests checking `.board` and `.score` elements exist
- **Test stack:** Jest + jsdom + @testing-library/react + @testing-library/user-event
- **Config:** `jest.config.js` with ts-jest, CSS/image mocks, 50% coverage thresholds
- **Setup:** `src/setupTests.ts` imports `@testing-library/jest-dom`

### What's Missing
- No integration tests for any user journey
- No test helpers/utilities for rendering with providers (Jotai, LanguageProvider, AnalyticsProvider)
- No localStorage mock setup for persistence tests
- No test coverage for dialogs, settings, language switching, game logic integration

---

## Architecture Decisions

### Test Structure
```
src/
├── __tests__/
│   ├── helpers/
│   │   ├── renderWithProviders.tsx    # Render utility wrapping Jotai + Language + Analytics
│   │   ├── gameTestUtils.ts          # Helpers: place balls, simulate moves, fill board
│   │   └── localStorageMock.ts       # localStorage mock for persistence tests
│   ├── integration/
│   │   ├── newGame.test.tsx           # UJ-1: First-time player
│   │   ├── coreGameplay.test.tsx      # UJ-2, UJ-3: Select, move, score, blocked path
│   │   ├── gameOver.test.tsx          # UJ-4: Game over
│   │   ├── resetGame.test.tsx         # UJ-5: Reset mid-play
│   │   ├── helpDialog.test.tsx        # UJ-6: Help dialog
│   │   ├── settings.test.tsx          # UJ-7, UJ-8, UJ-9: Theme, language, animation
│   │   ├── persistence.test.tsx       # UJ-10, UJ-11: State persistence, high score
│   │   ├── consent.test.tsx           # UJ-12: Analytics consent flow
│   │   └── offline.test.tsx           # UJ-13: Offline play
│   └── unit/
│       ├── gameLogic.test.ts          # Pure functions: line detection, ball placement
│       └── pathfinding.test.ts        # BFS pathfinding edge cases
```

### Render Helper

Every integration test needs the full provider tree. The shared render helper avoids boilerplate:

```typescript
// src/__tests__/helpers/renderWithProviders.tsx
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'jotai';
import { LanguageProvider } from '../../hooks/useLanguage';
import React, { ReactElement } from 'react';

// Minimal wrapper that skips AnalyticsProvider to avoid consent dialog
// unless the test explicitly includes it
const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </Provider>
);

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestProviders, ...options });
```

### Game Test Utilities

Helpers to set up specific game states without going through the full UI flow:

```typescript
// src/__tests__/helpers/gameTestUtils.ts
import { CellType, Ball, BallColor } from '../../types';
import { GRID_SIZE, COLORS } from '../../atoms/gameAtoms';

// Create a grid with balls at specific positions
export const createGridWithBalls = (
  positions: Array<{ row: number; col: number; color: BallColor }>
): CellType[][] => {
  const grid: CellType[][] = Array(GRID_SIZE).fill(null)
    .map(() => Array(GRID_SIZE).fill(null).map(() => ({ ball: null })));

  positions.forEach(({ row, col, color }, index) => {
    grid[row][col] = { ball: { color, id: index + 1 } };
  });

  return grid;
};

// Create a grid with a horizontal line of N balls (for line detection tests)
export const createGridWithLine = (
  row: number, startCol: number, length: number, color: BallColor
): CellType[][] => {
  const positions = Array.from({ length }, (_, i) => ({
    row, col: startCol + i, color,
  }));
  return createGridWithBalls(positions);
};

// Create a nearly full grid (for game over tests)
export const createAlmostFullGrid = (emptyCells: number = 2): CellType[][] => {
  const grid: CellType[][] = Array(GRID_SIZE).fill(null)
    .map(() => Array(GRID_SIZE).fill(null).map(() => ({ ball: null })));

  let id = 1;
  let emptyLeft = emptyCells;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (emptyLeft > 0 && r === GRID_SIZE - 1 && c >= GRID_SIZE - emptyLeft) {
        emptyLeft--;
        continue;
      }
      grid[r][c] = { ball: { color: COLORS[id % COLORS.length], id: id++ } };
    }
  }

  return grid;
};

// Count balls on the grid
export const countBalls = (grid: CellType[][]): number =>
  grid.reduce((count, row) =>
    count + row.filter(cell => cell.ball !== null).length, 0);
```

### localStorage Mock

```typescript
// src/__tests__/helpers/localStorageMock.ts
export const setupLocalStorageMock = () => {
  let store: Record<string, string> = {};

  const mock = {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
  };

  Object.defineProperty(window, 'localStorage', { value: mock, writable: true });

  return {
    mock,
    reset: () => { store = {}; jest.clearAllMocks(); },
  };
};
```

---

## Test Implementation Plan

### Phase 1: Foundation (helpers + unit tests for pure logic)

#### Task 1.1: Create test helpers
- **Files:** `src/__tests__/helpers/renderWithProviders.tsx`, `gameTestUtils.ts`, `localStorageMock.ts`
- **Owner:** Game Dev 1
- **Why first:** All integration tests depend on these helpers

#### Task 1.2: Unit tests for game logic pure functions
- **File:** `src/__tests__/unit/gameLogic.test.ts`
- **Owner:** Game Dev 1
- **Tests:**
  - `findEmptyCells` — returns correct positions for empty, partial, and full grids
  - `findCompletedLines` — horizontal, vertical, diagonal (both), length 5/6/7/8/9, overlapping lines, no lines
  - `placeBallsRandomly` — places correct count, only in empty cells, returns unchanged grid when no space
  - `copyGrid` — deep copy (mutation of copy doesn't affect original)
  - `removeGridBalls` — removes balls at given positions, leaves others intact
  - `placeBall` — places a ball at the specified position
  - `getNextBalls` — generates correct count with incrementing IDs

#### Task 1.3: Unit tests for pathfinding
- **File:** `src/__tests__/unit/pathfinding.test.ts`
- **Owner:** Game Dev 2
- **Tests:**
  - Empty grid — finds shortest path
  - Blocked path — returns empty array
  - Adjacent cells — path has 1 step
  - Destination occupied — returns empty array
  - Out of bounds start/end — returns empty array
  - Path around obstacles — finds valid detour
  - No diagonal movement — verifies only horizontal/vertical steps
  - Complex maze — BFS finds shortest path

---

### Phase 2: Core Gameplay Integration Tests

#### Task 2.1: New game start (UJ-1)
- **File:** `src/__tests__/integration/newGame.test.tsx`
- **Owner:** Game Dev 2
- **Tests:**
  ```
  describe('UJ-1: New Game Start')
    it('renders 81 cells (9x9 grid)')
    it('places exactly 3 initial balls on the grid')
    it('shows 3 balls in the Next Balls panel')
    it('displays score as 0')
    it('displays all text from translations (not hardcoded)')
  ```

#### Task 2.2: Core gameplay — select, move, score (UJ-2, UJ-3)
- **File:** `src/__tests__/integration/coreGameplay.test.tsx`
- **Owner:** Game Dev 1
- **Tests:**
  ```
  describe('UJ-2: Select and Move')
    it('selects a ball when clicked — adds selected class')
    it('deselects a ball when clicked again')
    it('moves selection when a different ball is clicked')
    it('does nothing when clicking an empty cell with no selection')
    it('moves ball to destination when path exists')
    it('places 3 new balls after a move that does not form a line')
    it('does not place new balls when a line is formed (bonus turn)')
    it('ignores clicks during animation')

  describe('UJ-2: Scoring')
    it('awards 10 points for a line of 5')
    it('awards 12 points for a line of 6')
    it('awards 18 points for a line of 7')
    it('awards 28 points for a line of 8')
    it('awards 42 points for a line of 9')
    it('removes the balls that form the line')

  describe('UJ-3: Blocked Path')
    it('does not move ball when path is blocked')
    it('keeps ball selected after failed move attempt')
    it('does not consume the turn (no new balls placed)')
  ```

#### Task 2.3: Game over (UJ-4)
- **File:** `src/__tests__/integration/gameOver.test.tsx`
- **Owner:** Game Dev 2
- **Tests:**
  ```
  describe('UJ-4: Game Over')
    it('shows Game Over dialog when board cannot fit 3 more balls')
    it('displays the correct final score in the dialog')
    it('shows low score message for score < 50')
    it('shows medium score message for score 50-99')
    it('shows high score message for score 100-199')
    it('shows excellent score message for score >= 200')
    it('resets game completely when Play Again is clicked')
    it('clears saved game state from localStorage on Play Again')
  ```

---

### Phase 3: Dialogs & Controls Integration Tests

#### Task 3.1: Reset game (UJ-5)
- **File:** `src/__tests__/integration/resetGame.test.tsx`
- **Owner:** Game Dev 1
- **Tests:**
  ```
  describe('UJ-5: Reset Game')
    it('shows confirmation dialog when movesMade > 0 and game is not over')
    it('resets instantly when movesMade === 0')
    it('resets instantly when game is over')
    it('preserves game state when Cancel is clicked')
    it('resets all state when Confirm is clicked — score 0, grid cleared')
    it('clears localStorage game state on confirm')
    it('reset button is disabled during animation')
  ```

#### Task 3.2: Help dialog (UJ-6)
- **File:** `src/__tests__/integration/helpDialog.test.tsx`
- **Owner:** Game Dev 2
- **Tests:**
  ```
  describe('UJ-6: Help Dialog')
    it('opens when Help button is clicked')
    it('displays Rules section with 7 items')
    it('displays Scoring section with 5 items')
    it('displays Tips section with 3 items')
    it('closes when Got it! is clicked')
    it('all text comes from translations')
  ```

---

### Phase 4: Settings Integration Tests

#### Task 4.1: Settings — theme, language, animation (UJ-7, UJ-8, UJ-9)
- **File:** `src/__tests__/integration/settings.test.tsx`
- **Owner:** Game Dev 1
- **Tests:**
  ```
  describe('UJ-7: Theme Toggle')
    it('opens Settings dialog from gear button')
    it('toggles dark-theme class on document.body')
    it('persists theme choice to localStorage')
    it('restores theme from localStorage on reload')

  describe('UJ-8: Language Switch')
    it('shows 7 language options in the dropdown')
    it('updates all visible UI text when language changes')
    it('updates document.documentElement.lang attribute')
    it('persists language choice to localStorage')
    it('restores language from localStorage on reload')

  describe('UJ-9: Ball Animation Mode')
    it('shows 3 animation options')
    it('persists animation choice to localStorage')
    it('restores animation mode from localStorage on reload')
  ```

---

### Phase 5: Persistence & Consent Integration Tests

#### Task 5.1: State persistence and high score (UJ-10, UJ-11)
- **File:** `src/__tests__/integration/persistence.test.tsx`
- **Owner:** Game Dev 2
- **Tests:**
  ```
  describe('UJ-10: Game State Persistence')
    it('saves game state to localStorage on state change')
    it('restores grid, score, next balls from localStorage on mount')
    it('starts a new game when no saved state exists')

  describe('UJ-11: High Score')
    it('updates high score when current score exceeds it')
    it('does not lower high score when current score is lower')
    it('persists high score across game resets')
    it('persists high score across page reloads')
  ```

#### Task 5.2: Analytics consent (UJ-12)
- **File:** `src/__tests__/integration/consent.test.tsx`
- **Owner:** Game Dev 1
- **Tests:**
  ```
  describe('UJ-12: Analytics Consent')
    it('shows consent dialog on first visit (no prior answer)')
    it('hides consent dialog after accepting')
    it('hides consent dialog after declining')
    it('does not show consent dialog on subsequent visits')
    it('game works identically regardless of consent choice')
  ```

#### Task 5.3: Offline play (UJ-13)
- **File:** `src/__tests__/integration/offline.test.tsx`
- **Owner:** Game Dev 2
- **Tests:**
  ```
  describe('UJ-13: Offline Play')
    it('shows offline notice when navigator.onLine is false')
    it('hides offline notice when connection is restored')
    it('game remains playable while offline')
  ```

---

## File Assignment (zero overlap)

| Phase | File | Owner |
|-------|------|-------|
| 1 | `helpers/renderWithProviders.tsx`, `helpers/gameTestUtils.ts`, `helpers/localStorageMock.ts` | Game Dev 1 |
| 1 | `unit/gameLogic.test.ts` | Game Dev 1 |
| 1 | `unit/pathfinding.test.ts` | Game Dev 2 |
| 2 | `integration/coreGameplay.test.tsx` | Game Dev 1 |
| 2 | `integration/newGame.test.tsx` | Game Dev 2 |
| 2 | `integration/gameOver.test.tsx` | Game Dev 2 |
| 3 | `integration/resetGame.test.tsx` | Game Dev 1 |
| 3 | `integration/helpDialog.test.tsx` | Game Dev 2 |
| 4 | `integration/settings.test.tsx` | Game Dev 1 |
| 5 | `integration/persistence.test.tsx` | Game Dev 2 |
| 5 | `integration/consent.test.tsx` | Game Dev 1 |
| 5 | `integration/offline.test.tsx` | Game Dev 2 |

---

## Testing Patterns & Conventions

### Rendering
- Always use `renderWithProviders()` from helpers — never bare `render()`
- For consent dialog tests, render `<App />` with `AnalyticsProvider` included
- For all other tests, use the minimal provider wrapper (skips consent dialog)

### Querying DOM
- Prefer `@testing-library` queries in this order: `getByRole` > `getByText` > `getByTestId`
- Use `screen` import for queries after render
- For game grid cells: query by `data-row` and `data-col` attributes via `querySelector`
- For ball colors: check for CSS class `ball-{color}` (e.g., `ball-red`)

### User Interactions
- Use `@testing-library/user-event` (v14+) for clicks, keyboard events
- Example: `await user.click(cell)` instead of `fireEvent.click(cell)`
- Wrap state updates in `act()` when needed

### Async & Timers
- Use `jest.useFakeTimers()` for animation tests — advance with `jest.advanceTimersByTime()`
- Use `waitFor()` for assertions that depend on async state updates
- Use `jest.runAllTimers()` to flush all pending timers after game actions

### localStorage
- Call `setupLocalStorageMock()` in `beforeEach` for persistence tests
- Call `reset()` in `afterEach` to clean up
- For non-persistence tests, localStorage is available via jsdom (no mock needed)

### Controlling Randomness
- Mock `Math.random` with `jest.spyOn(Math, 'random')` for deterministic ball placement
- Return a sequence of values to control ball colors and positions
- This enables precise assertions about grid state after ball placement

### Naming
- Test files: `{feature}.test.tsx`
- Describe blocks: `UJ-{N}: {Journey Name}`
- Test names: Start with a verb — `it('renders...'), it('shows...'), it('updates...')`

---

## Verification

After all tests are implemented:

```bash
yarn test                          # All tests pass
yarn test --coverage               # Coverage meets 50% thresholds
yarn test --testPathPattern=unit   # Unit tests pass in isolation
yarn test --testPathPattern=integration  # Integration tests pass in isolation
```

---

## Dependencies

No new packages required. The existing test stack is sufficient:
- `jest` + `ts-jest` — test runner
- `jest-environment-jsdom` — browser environment simulation
- `@testing-library/react` — component rendering
- `@testing-library/jest-dom` — DOM matchers
- `@testing-library/user-event` — user interaction simulation
- `identity-obj-proxy` — CSS module mock

---

## Success Criteria

- All 13 user journeys from `docs/USER_JOURNEYS.md` have corresponding integration tests
- All tests pass with `yarn test`
- Coverage thresholds (50%) are maintained or exceeded
- Tests are deterministic — no flaky tests from random ball placement
- Tests run in under 30 seconds total
