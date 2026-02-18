# Discovery: zombite3

STATUS: DRAFT

## 1. Problem Statement
Derived from approved spec retrieval snapshot:
- Retrieval mode: section-level
- Retrieved sections: 1. Context, 2. Actors, 3. Functional Rules, 7. Security Considerations, 8. Out of Scope, 9. Acceptance Criteria

### Context snapshot
- A localhost-first 2D pixel-art gallery shooter on the web (Phaser 3 + Vite) where the player uses a centered crosshair to shoot zombies/monsters (valid targets) while avoiding civilians (invalid targets), with waves, scoring, life, penalties, UI/audio feedback, and final stats.
- Primary actor: Single player (public audience playtest/demo users).
- Expected outcome: After npm install and npm run dev, the game runs fully on localhost and is playable: player aims with mouse, shoots with left click, zombies and civilians spawn together each wave (about 70/30), zombie hits give points, civilian hits cause score/life penalties, zombies reaching the critical center damage player, HUD shows score/life/wave/accuracy, ESC pauses, restart works, and Game Over shows final stats.

### Actors snapshot
- Single player (public audience playtest/demo users).

### Functional rules snapshot
- The system must run locally with npm install + npm run dev and provide a fully playable fixed-camera gallery-shooter loop where each wave spawns zombies and civilians together, and left-click shots are resolved from the crosshair so zombies are rewarded and civilians are penalized immediately.
- All final visual/audio assets must be real licensed assets with clear permissive licenses (CC0/MIT/Apache/equivalent), documented in ASSETS.md, and final enemies must not be emojis or placeholder geometric shapes.

### Security snapshot
- Do not execute untrusted remote code or dynamic scripts; keep gameplay assets local and validated, and avoid exposing admin/debug endpoints in the dev server build.

### Out-of-scope snapshot
- Excluded from v1: player movement (no WASD), multiplayer, online backend/accounts/leaderboards, realistic gore, and deployment/domain publishing (localhost first).

Refined problem framing:
- What problem are we solving? Many small prototype shooters fail demo readiness due to placeholder visuals, unclear penalties, or missing setup/docs; impact is high for public-facing demos because trust and playability drop immediately.
- Why now? Target: 100% local startup success via npm install + npm run dev; 100% required UI fields visible in active gameplay; deterministic scoring/penalty behavior in all waves; complete ASSETS.md coverage for all final assets.

## 2. Discovery Interview Summary (Discovery Persona)
- Primary users:
- Single-player public users for local demo/playtest sessions.

- Jobs to be done:
- Start and play a full localhost-first gallery shooter session, eliminate zombie threats efficiently, avoid civilian hits, survive waves, and review final performance stats.

- Current pain:
- Many small prototype shooters fail demo readiness due to placeholder visuals, unclear penalties, or missing setup/docs; impact is high for public-facing demos because trust and playability drop immediately.

- Constraints (business/technical/compliance):
- Must use Phaser 3 + Vite; run with npm install and npm run dev on localhost; fixed-camera/crosshair gameplay (no WASD in v1); pixel-art style with minimal stylized violence; real permissive-license assets only; mandatory README and ASSETS.md.

- Dependencies:
- Open-source asset providers with permissive licenses, npm ecosystem for Phaser/Vite dependencies, and local development runtime/browser.

- Success metrics:
- Target: 100% local startup success via npm install + npm run dev; 100% required UI fields visible in active gameplay; deterministic scoring/penalty behavior in all waves; complete ASSETS.md coverage for all final assets.

- Assumptions:
- Assume permissive licensed pixel-art assets with coherent style are available in sufficient quality; assume overlap-based hit resolution can be tuned to feel fair for civilian-vs-zombie target conflicts.

- Interview mode:
- standard

## 3. Scope
### In scope
- Localhost runnable Phaser+Vite scaffold; Boot/Game/UI scenes; fixed-camera crosshair aiming; zombie+civilian wave spawning; entity movement patterns; click-to-shoot hit detection; score/life/accuracy systems; civilian penalty feedback; pause/restart/game-over flow; required audio/visual feedback; README; ASSETS.md.

### Out of scope
- Multiplayer, online backend/accounts, cloud leaderboard, user movement (WASD), realistic gore, and production/domain deployment.

## 4. Actors & User Journeys
Actors:
- Single-player public users for local demo/playtest sessions.

Primary journey:
- Open the local game, start a wave session, aim and shoot zombies while avoiding civilians, survive as waves escalate, then review final score/kills/accuracy and restart.

## 5. Architecture (Architect Persona)
- Components:
-
- Data flow:
-
- Key decisions:
-
- Risks:
-

## 6. Security (Security Persona)
- Threats:
-
- Controls required:
-
- Validation rules:
-

## 7. Backlog Outline
Epic:
-

User stories:
1.
2.
3.

## 8. Test Strategy
- Smoke tests:
-
- Functional tests:
-
- Security tests:
-
- Edge cases:
-

## 9. Discovery Confidence
- Confidence:
-

- Reason:
-

- Evidence gaps:
-

- Handoff decision:
-
