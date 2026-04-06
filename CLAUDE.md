# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow

Prefer using the custom agents defined in `.claude/agents/` for all complex tasks. Follow the team workflow described in `.claude/agents/TEAM_INSTRUCTIONS.md`. Never work on tasks directly — always delegate through the agent team (TL, Game Dev, Translator, QA, Knowledge Keeper). For simple fixes, at minimum use the TL agent to plan and a Game Dev agent to implement.

## Commands

```bash
yarn start          # Dev server with hot reload (Webpack)
yarn build          # Production build to dist/
yarn test           # Run all tests (Jest)
yarn type-check     # TypeScript compilation check (tsc --noEmit)
yarn lint           # Check ESLint issues
yarn lint:fix       # Auto-fix ESLint issues
yarn format         # Prettier format (src/**/*.{ts,tsx,scss,css,json})
```

Always run `yarn format` after making code changes to ensure consistent formatting.
Always run `yarn test` after making code changes to ensure no regressions.
Always run `yarn type-check` to verify TypeScript correctness.

## Testing

Integration tests live in `src/__tests__/integration/` using Jest + React Testing Library + jsdom. Configuration is in `jest.config.js`.

### Test Structure

```
src/__tests__/
  helpers/
    renderWithProviders.tsx     # Wraps components in Jotai Provider + LanguageProvider
    gameTestUtils.ts            # Grid builders, ball placement helpers, Math.random mock
    localStorageMock.ts         # localStorage mock for persistence tests
  integration/
    newGame.test.tsx            # UJ-1: First-time player, initial state
    coreGameplay.test.tsx       # UJ-2, UJ-3: Select, move, score, blocked path
    gameOver.test.tsx           # UJ-4: Game over detection, dialog, restart
    resetGame.test.tsx          # UJ-5: Reset confirmation, cancel, confirm
    helpDialog.test.tsx         # UJ-6: Help content, open/close
    settings.test.tsx           # UJ-7, UJ-8, UJ-9: Theme, language, animation
    persistence.test.tsx        # UJ-10, UJ-11: State save/load, high score
    consent.test.tsx            # UJ-12: Analytics consent flow
    offline.test.tsx            # UJ-13: Offline notice, playability
    seo.test.tsx                # SEO: hreflang, meta tags, canonical
  unit/
    gameLogic.test.ts           # Pure game logic functions
    pathfinding.test.ts         # BFS pathfinding edge cases
```

### Key Testing Patterns

- Always use `renderWithProviders()` — never bare `render()`
- Mock `Math.random` with `jest.spyOn` for deterministic ball placement
- Use `jest.useFakeTimers()` for animation tests, advance with `jest.advanceTimersByTime()`
- User journeys are documented in `docs/USER_JOURNEYS.md`
- When adding a new feature, add or update the corresponding integration test
- When fixing a bug, add a regression test that would have caught it

## Documentation Maintenance

When making changes to the codebase, keep all documentation in sync:

- **`CLAUDE.md`** — Update commands, architecture, or testing sections if they changed
- **`.claude/agents/project-organization.md`** — Update directory structure, component tree, state atoms, or key patterns
- **`.claude/agents/TEAM_INSTRUCTIONS.md`** — Update architecture rules, file ownership, or pitfalls
- **`.claude/agents/game-dev.md`** — Update implementation rules, animation patterns, or cross-check checklist
- **`.claude/agents/tl.md`** — Update planning checklist or architecture decisions
- **`.claude/agents/translator.md`** — Update if new languages or translation patterns are added
- **`.claude/agents/qa.md`** — Update test checklist, game mechanics tests, or test file mapping
- **`.claude/agents/knowledge-keeper.md`** — Update change type → update target mapping
- **`docs/USER_JOURNEYS.md`** — Update when adding or modifying user-facing features
- **`docs/work_plans/`** — Create or update work plans for major initiatives

## Architecture

**Lines Game** is a frontend-only React SPA (no backend, no router). Entry flow: `index.tsx` → Jotai Provider + LanguageProvider + AnalyticsProvider → `App.tsx` → `Game.tsx`.

### Game Data Model

- Grid: 9x9 `CellType[][]` where each cell has `{ ball: Ball | null }`
- Ball: `{ color: BallColor, id: number }` — 7 colors (red, blue, green, yellow, purple, cyan, orange)
- Pathfinding: BFS algorithm in `src/utils/pathfinding.ts` — 4-directional only (no diagonal movement)
- Line detection: checks horizontal, vertical, and both diagonals for 5+ same-color balls
- Scoring: 5→10, 6→12, 7→18, 8→28, 9→42 points (defined in `SCORE_TABLE`)

### State Management (Jotai)

- All game state atoms in `src/atoms/gameAtoms.ts` — grid, score, nextBalls, selectedCell, gameOver, movesMade
- Pure game logic functions in `src/atoms/gameLogic.ts` — no side effects, no atom access
- Hooks in `src/hooks/` bridge atoms to components — components never import atoms directly
- Animation state: `isAnimatingAtom`, `pathCellsAtom`, `lineAnimationsAtom`

### Internationalization

- 7 languages: EN (default), RU, ES, DE, PL, ZH, JA
- Language priority: `?lang=` URL param → localStorage → `navigator.language` → `'en'`
- Translation files: `src/translations/{en,ru,es,de,pl,zh,ja}.ts`
- Access via `useLanguage()` hook — `translations.section.key`
- English is the source of truth — never modify EN to match other languages

### SEO

- Dynamic hreflang tags injected by `useSEO` hook for all 7 languages + x-default
- Dynamic meta tags (title, description, OG, Twitter) update per language
- Canonical: bare path for EN, `?lang=xx` for non-EN
- JSON-LD structured data (WebApplication) in `public/index.html`
- Multi-language `<noscript>` fallback for non-JS crawlers
- Sitemap with hreflang annotations in `public/sitemap.xml`

### Animations

- Three modes: `step-by-step`, `show-path-then-move`, `instant-move`
- Moving balls are DOM elements (not React components) created/destroyed during animation
- Always check `isAnimating` before starting new animations
- Line removal uses `LINE_ANIMATION_DURATION` (2000ms) before grid state update

### PWA & Services

- Service Worker for offline play
- Storage via `src/services/storageService.ts` — unified settings in `lines-game-settings` localStorage key
- Analytics via `src/services/analytics.ts` — consent-first, never access `gtag` directly
- Game state persistence via `useGameStatePersistence` hook — saved on every state change
