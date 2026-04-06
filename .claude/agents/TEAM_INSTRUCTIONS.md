# Agent Team Work Instructions — Lines Game

---

## Team Composition

| Role | Count | Model | Responsibility |
|------|-------|-------|---------------|
| **TL** | 1 | opus | Plans work, assigns tasks with zero file overlap, makes architecture decisions, final review |
| **Game Dev** | 2 | sonnet | Implements game logic, UI components, animations, hooks — cross-checks the other dev's work |
| **Translator** | 1 | sonnet | Translates content across 7 languages (EN, RU, ES, DE, PL, ZH, JA) |
| **QA Specialist** | 1 | sonnet | Tests game logic, edge cases, performance, accessibility, cross-browser issues |
| **Knowledge Keeper** | 1 | sonnet | After each sprint, updates all `.claude/agents/` docs based on what changed |

---

## Workflow

### Phase 1: TL Plans
- Read all relevant files, produce task split for Game Dev 1 and Game Dev 2 with **zero file overlap**
- List translation requirements for the Translator
- All agents receive `CHANGE_LOG.md` logging instructions (see Logging section)

### Phase 2: Implementation (parallel)
- Game Dev 1 + Game Dev 2 + Translator work simultaneously
- Each agent reads files before editing

### Phase 3: Cross-checks (MANDATORY, parallel)
Not optional. Must happen after every implementation.
- **Game Dev 1 reviews ALL of Game Dev 2's files** — PASS/FAIL per file
- **Game Dev 2 reviews ALL of Game Dev 1's files** — PASS/FAIL per file
- QA Specialist tests game logic, animations, and edge cases
- Translator verifies quality in files they didn't create

### Phase 4: Fix + verify
- Fix any issues from Phase 3
- Run `yarn type-check` + `yarn build` + `yarn lint` + `yarn test` (no NEW errors, all tests pass)
- TL does not approve until cross-check results are logged

### Phase 5: Knowledge update
- **Knowledge Keeper** reads `CHANGE_LOG.md` and updates all `.claude/agents/` docs
- Updates `project-organization.md` if structure/patterns changed
- Adds new pitfalls discovered during cross-checks
- Removes outdated info

---

## Architecture Rules

### State Management (Jotai)
- **All game state** lives in `src/atoms/gameAtoms.ts` as Jotai atoms
- **Game logic** (pure functions) lives in `src/atoms/gameLogic.ts`
- **Hooks** in `src/hooks/` consume atoms and expose actions to components
- Never modify atoms directly from components — always go through hooks
- Keep game logic functions pure (no side effects, no atom access)

### Game Constants
- Grid: 9x9 (`GRID_SIZE = 9`)
- Colors: 7 (`red`, `blue`, `green`, `yellow`, `purple`, `cyan`, `orange`)
- Balls per turn: 3 (`BALLS_PER_TURN = 3`)
- Min line length: 5 (`MIN_LINE_LENGTH = 5`)
- All constants defined in `src/atoms/gameAtoms.ts` — never hardcode

### Animations
- Three animation modes: `step-by-step`, `show-path-then-move`, `instant-move`
- Animation logic lives in `src/hooks/useGameActions.ts`
- Moving balls are DOM elements created/destroyed during animation — NOT React components
- Never start a new animation while `isAnimating` is true
- Line removal animation uses `LINE_ANIMATION_DURATION` (2000ms) before state update

### Pathfinding
- BFS algorithm in `src/utils/pathfinding.ts`
- Balls can move up/down/left/right (4-directional, no diagonal movement)
- Returns empty array if no valid path exists
- Path excludes the start position, includes the end position

### i18n
- **Languages:** EN (default), RU, ES, DE, PL, ZH, JA
- **Detection:** localStorage `language` key > `navigator.language` > `'en'`
- **Translation files:** `src/translations/{en,ru,es,de,pl,zh,ja}.ts`
- **Access:** `useLanguage()` hook provides `translations` object and `setLanguage()` function
- **All user-facing strings** must use `translations.section.key` — no hardcoded text
- **English is the source of truth** — never modify EN to match other languages

### Scoring
- Line of 5: 10 points, 6: 12, 7: 18, 8: 28, 9: 42
- Defined in `SCORE_TABLE` in `src/atoms/gameAtoms.ts`
- Fallback: `lineLength * DEFAULT_SCORE_MULTIPLIER` (2)

### Persistence
- Game state saved/loaded via `useGameStatePersistence` hook
- High score tracked via `useHighScore` hook
- Storage operations go through `src/services/storageService.ts`
- Settings (theme, language, animation) stored in localStorage

### PWA
- Service Worker managed via `useServiceWorker` hook
- Offline notice via `OfflineNotice` component
- Install prompt via `InstallPrompt` component
- Update notification via `UpdateNotification` component

### Analytics
- Use `src/services/analytics.ts` — never access `gtag` directly
- Consent dialog appears on first visit
- Game analytics tracked via `useGameAnalytics` hook

---

## File Ownership (parallel work)

| Category | Game Dev 1 | Game Dev 2 |
|----------|-----------|-----------|
| Game logic | `atoms/gameLogic.ts`, `utils/pathfinding.ts` | — |
| Core game | `hooks/useGameActions.ts` | `components/Game.tsx` |
| Board & cells | `components/Board.tsx`, `components/Cell.tsx` | — |
| Dialogs | — | `components/ConfirmDialog.tsx`, `GameOverDialog.tsx`, `HelpDialog.tsx` |
| Settings | — | `components/settings/*` |
| Persistence | `hooks/useGameStatePersistence.ts` | `hooks/useHighScore.ts` |
| PWA | `hooks/useServiceWorker.ts` | `components/OfflineNotice.tsx`, `InstallPrompt.tsx`, `UpdateNotification.tsx` |
| Styles | `styles/Game.scss`, `styles/Board.scss` | `styles/DarkTheme.scss`, `styles/settings/*` |
| Translation files | Keys under `game.*`, `helpDialog.*` | Keys under `settingsDialog.*`, `resetConfirm.*`, `gameOver.*` |

Both devs edit the same translation files but under **different top-level sections**.

---

## Logging

**Every agent logs to `CHANGE_LOG.md`.** Format:

```
## [Role] — Phase X

- [Role] Modified `file.tsx` — description (line if relevant)
- [Role] Created `file.tsx` — description
```

Cross-check results:
```
- [Game Dev 1 -> Dev 2] Reviewed `GameOverDialog.tsx` — PASS
- [Game Dev 2 -> Dev 1] Reviewed `Board.tsx` — FAIL: hardcoded string on line 42
```

Log after each phase: implementation, cross-check, fixes.

---

## Integration Tests

The project has integration tests covering all user journeys defined in `docs/USER_JOURNEYS.md`.

### Running tests
```bash
yarn test                                # All tests
yarn test --testPathPattern=unit         # Unit tests only
yarn test --testPathPattern=integration  # Integration tests only
yarn test --coverage                     # With coverage report
```

### Test structure
```
src/__tests__/
├── helpers/
│   ├── renderWithProviders.tsx   # Render with Jotai + LanguageProvider
│   ├── gameTestUtils.ts          # Grid builders, ball placement helpers
│   └── localStorageMock.ts       # localStorage mock for persistence tests
├── integration/                  # User journey tests (UJ-1 through UJ-13)
│   ├── newGame.test.tsx          # UJ-1: First-time player
│   ├── coreGameplay.test.tsx     # UJ-2, UJ-3: Select, move, score, blocked path
│   ├── gameOver.test.tsx         # UJ-4: Game over
│   ├── resetGame.test.tsx        # UJ-5: Reset mid-play
│   ├── helpDialog.test.tsx       # UJ-6: Help dialog
│   ├── settings.test.tsx         # UJ-7, UJ-8, UJ-9: Theme, language, animation
│   ├── persistence.test.tsx      # UJ-10, UJ-11: State persistence, high score
│   ├── consent.test.tsx          # UJ-12: Analytics consent
│   └── offline.test.tsx          # UJ-13: Offline play
└── unit/
    ├── gameLogic.test.ts         # Pure game logic functions
    └── pathfinding.test.ts       # BFS pathfinding
```

### Rules
- Always use `renderWithProviders()` — never bare `render()`
- Mock `Math.random` for deterministic ball placement in tests
- Use `jest.useFakeTimers()` for animation tests
- When adding a new feature, add or update the corresponding integration test
- When fixing a bug, add a regression test that would have caught it
- Run `yarn test` after every change — all tests must pass

### Reference
- User journeys: `docs/USER_JOURNEYS.md`
- Test implementation plan: `docs/work_plans/INTEGRATION_TESTS.md`

---

## Pitfalls

1. Don't modify atoms directly from components — use hooks
2. Don't start animations while `isAnimating` is true — check the flag
3. Don't hardcode game constants — import from `gameAtoms.ts`
4. Don't hardcode strings — use `translations.section.key`
5. Don't access `gtag` directly — use `analytics.ts` service
6. Don't modify localStorage directly — use `storageService.ts`
7. Always run `yarn type-check` after changes — TypeScript must pass
8. Always run `yarn test` after changes — all tests must pass
9. Don't forget to place balls after line removal — the turn continues
10. Don't check for game over during animations — wait until `isAnimating` is false
11. When adding new translation keys, add them to ALL 7 language files simultaneously
12. Keep game logic functions pure — no side effects, no DOM manipulation
13. When adding a new feature, add or update the corresponding integration test (`src/__tests__/integration/`)
14. When fixing a bug, add a regression test that would have caught it
