# Zombite3 — Adoption Stabilization

## Problem

The Phaser-based game (`src/`) is functionally complete: 7 FRs, 27 tests passing, all requirements marked present. But the project cannot be safely handed off or iterated on at pace because three structural problems block stable adoption:

1. **Architectural ambiguity at the root.** `web/app.js` (2425 lines, canvas-based, magazine mechanic, 10 named scenes) lives alongside the Phaser implementation with no documented relationship to it. Any developer opening the repo sees two game engines and no explanation of which one is the product. This ambiguity must be resolved before the project can onboard a second contributor without a one-on-one briefing.

2. **No automated regression gate.** The 27-test green result recorded in `04_TEST_RESULTS.json` is a point-in-time snapshot. There is no CI pipeline. A commit that breaks `gameRules.js` exports, corrupts the asset manifest, or changes a line in `GameScene.js` that a regex test matches will not be caught until someone runs `npm test` manually. The test suite is a compliance artifact, not a safety net.

3. **`GameScene.js` is a 2006-line single-class entanglement of all game concerns.** Audio synthesis, entity pooling, wave orchestration, difficulty scaling, and localStorage persistence are colocated in one file. The test suite covers game rules via isolated pure functions but tests the scene itself only through source-text pattern matching. Any refactor that changes internal naming — even without changing behavior — can break these tests silently.

## Target Users

- **Product owner / QA operator** (mid tech): needs to run `npm test` and `npm run build` from a fresh checkout, trust the result, and ship without fear. Currently blocked by no CI and ambiguous project structure.
- **Host-site integrator** (mid tech): needs to embed the game via `<iframe>` or script tag, trust the Docker image produces the correct artifact, and not worry about the bundle carrying dead code from a legacy engine. Currently blocked by `web/app.js` ambiguity and oversized Docker image.
- **Office-break player** (low tech): needs the game to load fast (NFR-001: 3-second repeat-session target), start without friction, and communicate rules immediately. Currently at risk if the Vite large-chunk warning is not addressed and if the black-screen load (no progress indicator in `BootScene`) degrades the first-impression window.

## Business Rules

The following invariants are confirmed by code review and must be preserved through any stabilization work:

- Friendly fire: `-15 score`, `-10 life`, visual and audio penalty in the same interaction frame. (`gameRules.js` lines 131–144, `GAME_CONSTANTS.civilianPenaltyScore = 15`, `civilianPenaltyLife = 10`.)
- Zombie contact damage by type: normal = 10, elite = 15, brute = 20 life; each contact increments `civiliansLost` by exactly 1. (`GameScene.js` lines 988–994, `infectCivilian`.)
- Three distinct zombie categories: `zombie`, `zombie-elite` (appears at level >= 3), `zombie-brute` (appears at level >= 5), with HP of 1, 3, and 6 respectively. (`GameScene.js` line 542, `beginWave` lines 425–430.)
- Shot target priority when multiple entities overlap: brute (4) > elite (3) > zombie (2) > civilian (1) > powerup (0), tiebroken by distance then spawnIndex then id. (`gameRules.js` lines 18–25, `resolveShotTarget`.)
- Power-ups: health restores 20 life (capped at 100); rescue awards +50 score and decrements `civiliansLost` by 1. (`gameRules.js` lines 8–9, `applyShotOutcome`.)
- High score and audio mute state persist across sessions via `localStorage` keys `zrr.highScore` and `zrr.audioMuted`. (`GameScene.js` lines 1676–1717.)
- No backend, no remote scripts, no multiplayer. All assets loaded from `/public/assets/` and validated against `manifest.json` at test time.
- No realistic gore; violence stays stylized and office-safe.

## Success Criteria

Stabilization is complete when all of the following are true:

1. **`web/app.js` is resolved.** Either: it is deleted and the `web/` subtree is removed, with a note in `README.md` documenting the decision; or it is documented as a named milestone (e.g., "v3 engine") with a clear scope boundary separating it from the current `src/` baseline. A new contributor opening the repo can identify the active implementation in under 2 minutes without asking.

2. **CI runs on every push to `main`.** A workflow executes `npm ci && npm test && npm run build` and reports pass/fail. The 27-test baseline must stay green. Any new commit that breaks a test or the production build is blocked before merge.

3. **`GameScene.js` audio subsystem is extracted.** The Web Audio synthesis code (~lines 1827–2004: `ensureAudioContext`, `startAmbientLoop`, `applyAudioMuteState`, `playSfx`, `playTone`, `processCriticalStateAudio`, `toggleMute`, `readAudioMuted`, `persistAudioMuted`) moves to `src/modules/audio/audioEngine.js` or equivalent. `GameScene.js` drops below 1700 lines. All 27 existing tests still pass. No behavioral change.

4. **`.gitignore` is corrected and `dist/` is not tracked.** Entries for `.env`, `*.log`, `.nyc_output/`, `.cache/` are present. Running `git status` on a clean checkout shows no committed build artefacts.

5. **Docker image does not carry `node_modules` in the runtime stage.** A `.dockerignore` is present. `COPY --from=build /app /app` in the Dockerfile is replaced with `COPY --from=build /app/dist /app/dist`. The runtime image size drops measurably.

6. **UI language baseline is declared.** All in-game feedback strings (`GameScene.showFeedback`, `showFeedbackAt`) and all `UIScene` overlay copy use the same language. The chosen baseline (English or Spanish) is documented in a single constants file or locale object. Mixed-language text is not visible to any end user in the shipped build.
