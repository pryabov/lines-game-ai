# User Journeys — Lines Game

This document defines the core user journeys for the Lines Game application. Each journey describes a real user workflow end-to-end, the expected behavior at each step, and the acceptance criteria that integration tests must verify.

---

## UJ-1: First-Time Player — New Game Start

**Persona:** A user visiting the game for the first time (no saved state, no consent answer).

### Flow
1. User opens the app
2. Analytics consent dialog appears (ConsentDialog)
3. User accepts or declines analytics
4. Consent dialog closes
5. Game board renders with a 9x9 grid
6. 3 initial balls are placed on random cells
7. "Next Balls" panel shows 3 upcoming balls
8. Score displays 0, High Score displays 0

### Acceptance Criteria
- [ ] Consent dialog is visible on first load
- [ ] After accepting/declining, consent dialog disappears
- [ ] Consent choice is persisted (not shown again on reload)
- [ ] Board renders exactly 81 cells (9x9)
- [ ] Exactly 3 balls are placed on the grid after initialization
- [ ] Next Balls panel shows exactly 3 balls
- [ ] Score is 0
- [ ] All text matches the current language translations

---

## UJ-2: Core Gameplay — Select, Move, Score

**Persona:** A player in an active game making moves.

### Flow
1. User clicks a cell containing a ball → ball becomes selected (visual highlight)
2. User clicks the same ball again → ball is deselected
3. User clicks a different ball → selection moves to the new ball
4. User clicks an empty cell with a clear path → ball animates along the path to the destination
5. After the move, 3 new balls appear on random empty cells
6. If a line of 5+ same-color balls is formed, those balls are removed and score increases

### Acceptance Criteria
- [ ] Clicking a ball adds the `selected` CSS class to that cell
- [ ] Clicking the same ball again removes the `selected` class
- [ ] Clicking a different ball moves selection to it
- [ ] Clicking an empty cell with no selected ball does nothing
- [ ] After a valid move, the source cell is empty and destination cell has the ball
- [ ] 3 new balls appear after a move (when no line is formed)
- [ ] Clicking during animation (`isAnimating = true`) is ignored
- [ ] Score increases by correct amount when a line is formed (5→10, 6→12, 7→18, 8→28, 9→42)
- [ ] When a line is formed after moving, new balls are NOT placed (bonus turn)

---

## UJ-3: Blocked Path — Cannot Move

**Persona:** A player attempting to move a ball to an unreachable cell.

### Flow
1. User selects a ball
2. User clicks an empty cell that has no valid path (blocked by other balls)
3. Nothing happens — ball stays selected, no move is made

### Acceptance Criteria
- [ ] Ball remains selected after clicking an unreachable empty cell
- [ ] No balls are added to the grid (turn is not consumed)
- [ ] Score does not change
- [ ] No animation is triggered

---

## UJ-4: Game Over

**Persona:** A player whose board fills up.

### Flow
1. Player makes moves until the board has fewer than 3 empty cells
2. Game Over dialog appears showing the final score
3. Score message is contextual (low/medium/high/excellent based on score value)
4. User clicks "Play Again"
5. Board resets — empty grid, 3 new balls, score back to 0

### Acceptance Criteria
- [ ] Game Over dialog appears when empty cells < `BALLS_PER_TURN` (3)
- [ ] Dialog shows the correct final score
- [ ] Score < 50: low score message
- [ ] Score 50–99: medium score message
- [ ] Score 100–199: high score message
- [ ] Score >= 200: excellent score message
- [ ] "Play Again" resets the entire game state
- [ ] After reset: score is 0, grid has 3 balls, game over flag is false
- [ ] Saved game state is cleared from localStorage

---

## UJ-5: Reset Game Mid-Play

**Persona:** A player who wants to restart during an active game.

### Flow
1. Player has made at least 1 move (movesMade > 0)
2. Player clicks "Reset Game" button
3. Confirmation dialog appears with translated title/message
4. **Path A:** User clicks "Cancel" → dialog closes, game continues unchanged
5. **Path B:** User clicks "Reset" (confirm) → game resets completely

### Acceptance Criteria
- [ ] Reset button is visible during gameplay
- [ ] Confirmation dialog appears when movesMade > 0 and game is not over
- [ ] Confirmation dialog does NOT appear when movesMade === 0 (instant reset)
- [ ] Confirmation dialog does NOT appear when game is over (instant reset)
- [ ] Cancel preserves all game state (grid, score, selected cell)
- [ ] Confirm resets: score to 0, grid cleared, 3 new balls placed, movesMade to 0
- [ ] Saved game state is cleared from localStorage on confirm
- [ ] Reset button is disabled during animations

---

## UJ-6: Help Dialog

**Persona:** A new player learning the game rules.

### Flow
1. User clicks the "Help" button
2. Help dialog opens showing rules, scoring, and tips
3. User reads the content
4. User clicks "Got it!" to close

### Acceptance Criteria
- [ ] Help dialog opens on button click
- [ ] Dialog shows all 3 sections: Rules, Scoring, Tips
- [ ] Rules section has 7 items (matching `translations.helpDialog.rulesItems`)
- [ ] Scoring section has 5 items (matching `translations.helpDialog.scoringItems`)
- [ ] Tips section has 3 items (matching `translations.helpDialog.tipsItems`)
- [ ] "Got it!" button closes the dialog
- [ ] All text comes from translations (no hardcoded English)

---

## UJ-7: Settings — Theme Toggle

**Persona:** A player switching between light and dark mode.

### Flow
1. User opens Settings (gear icon)
2. Settings dialog shows current theme
3. User clicks the theme toggle
4. Theme changes immediately (CSS class on body/html)
5. User closes Settings
6. On reload, theme is restored from localStorage

### Acceptance Criteria
- [ ] Settings button opens the Settings dialog
- [ ] Theme toggle switches between light and dark
- [ ] `dark-theme` CSS class is applied/removed on `document.body`
- [ ] Theme preference is persisted in `lines-game-settings` localStorage key
- [ ] Theme is restored on app reload

---

## UJ-8: Settings — Language Switch

**Persona:** A player changing the interface language.

### Flow
1. User opens the language selector (header or settings)
2. Dropdown shows all 7 languages with flags
3. User selects a different language (e.g., Russian)
4. All UI text updates immediately to the selected language
5. `<html lang="">` attribute updates
6. On reload, language is restored

### Acceptance Criteria
- [ ] Language dropdown shows 7 options: EN, RU, ES, DE, PL, ZH, JA
- [ ] Selecting a language updates all visible text immediately
- [ ] `document.documentElement.lang` matches selected language code
- [ ] Language preference is persisted in `lines-game-settings` localStorage key
- [ ] Language is restored on app reload
- [ ] Game-specific text (score label, next balls label, buttons) is translated
- [ ] Dialog text (help, reset confirm, game over) is translated

---

## UJ-9: Settings — Ball Animation Mode

**Persona:** A player customizing the ball movement animation.

### Flow
1. User opens Settings
2. Ball Movement selector shows three options
3. User selects "Instant move"
4. Next ball movement uses instant animation (no step-by-step)
5. On reload, animation preference is restored

### Acceptance Criteria
- [ ] Three animation options are shown: step-by-step, show path then move, instant move
- [ ] Selected option is persisted in `lines-game-settings` localStorage key
- [ ] Animation mode is restored on app reload
- [ ] Ball movement behavior matches the selected mode

---

## UJ-10: Game State Persistence

**Persona:** A player who closes and reopens the browser tab.

### Flow
1. Player has an active game (balls on board, score > 0)
2. Player closes the tab or navigates away
3. Player returns to the app
4. Game state is fully restored: grid, score, next balls, movesMade

### Acceptance Criteria
- [ ] Game state is saved to localStorage key `lines-game-state`
- [ ] On reload, saved state is loaded and rendered
- [ ] Grid positions and ball colors match saved state
- [ ] Score matches saved state
- [ ] Next balls match saved state
- [ ] High score persists independently (key: `highScore`)

---

## UJ-11: High Score Tracking

**Persona:** A player achieving a new personal best.

### Flow
1. Player finishes a game with score 150
2. High score display shows 150
3. Player plays again, finishes with score 80
4. High score still shows 150
5. Player plays again, finishes with score 200
6. High score updates to 200

### Acceptance Criteria
- [ ] High score is displayed in the game info panel
- [ ] High score updates only when current score exceeds previous high
- [ ] High score persists across browser sessions (localStorage)
- [ ] High score survives game resets

---

## UJ-12: Analytics Consent Flow

**Persona:** A privacy-conscious user managing analytics preferences.

### Flow
1. First visit: consent dialog appears
2. **Path A — Accept:** Analytics scripts load, events are tracked
3. **Path B — Decline:** No analytics scripts load, no events tracked
4. Either choice: dialog never appears again
5. On subsequent visits: consent choice is remembered, no dialog shown

### Acceptance Criteria
- [ ] Consent dialog appears only when no prior answer exists in localStorage
- [ ] Accept stores consent and enables analytics
- [ ] Decline stores refusal and disables analytics
- [ ] Dialog does not reappear on subsequent visits
- [ ] Game functions identically regardless of consent choice

---

## UJ-13: Offline Play (PWA)

**Persona:** A player losing internet connection during gameplay.

### Flow
1. Player is playing the game online
2. Network connection drops
3. Offline notice appears (OfflineNotice component)
4. Game continues to function — moves, scoring, all work offline
5. Network reconnects
6. Offline notice disappears

### Acceptance Criteria
- [ ] Offline notice appears when `navigator.onLine` is false
- [ ] Game is fully playable offline (no network-dependent features block gameplay)
- [ ] Offline notice disappears when connection is restored
- [ ] Game state is preserved through offline/online transitions
