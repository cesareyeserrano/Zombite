# Implementation Brief: US-2

Feature: zombite3
Story: As a Single player (public audience playtest/demo users).
Trace: FR-2, AC-1

## 1. Feature Context
- A localhost-first 2D pixel-art gallery shooter on the web (Phaser 3 + Vite) where the player uses a centered crosshair to shoot zombies/monsters (valid targets) while avoiding civilians (invalid targets), with waves, scoring, life, penalties, UI/audio feedback, and final stats.
- Primary actor: Single player (public audience playtest/demo users).
- Expected outcome: After npm install and npm run dev, the game runs fully on localhost and is playable: player aims with mouse, shoots with left click, zombies and civilians spawn together each wave (about 70/30), zombie hits give points, civilian hits cause score/life penalties, zombies reaching the critical center damage player, HUD shows score/life/wave/accuracy, ESC pauses, restart works, and Game Over shows final stats.

## 2. Acceptance Criteria
- Given a running wave with at least one civilian visible, when the player left-clicks and hits that civilian, then score decreases by 50, player life decreases by 15 (or one equivalent strike as specified), and the game shows visual and audio penalty feedback immediately.

## 3. Test Cases to Satisfy
- TC-2: Validate us-2 primary behavior. (Trace FR: FR-2)

## 4. Scaffold References
- Interface: src/contracts/fr-2-all-final-visual-audio-assets-mu.js
- Test stub: tests/zombite3/generated/tc-2-validate-us-2-primary-behavior.test.mjs

## 5. Dependency Notes
- Order rationale: Implement after US-1
- Plan sequence hint: -
- Plan dependency hint: -

## 6. Quality Constraints
- Domain profile: Game/Interactive (game)
- Stack constraint: Use a rendering/game engine (for example Phaser or Three.js). Avoid raw primitive-only canvas logic as architecture baseline.
- Forbidden defaults: Rectangle-only or geometry-only output without asset pipeline.
- Non-negotiable: keep FR traceability comments in interfaces and TC markers in tests.

