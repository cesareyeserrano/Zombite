# Plan: zombite3

STATUS: DRAFT

## 1. Intent (from approved spec)
- Retrieval mode: section-level

### Context snapshot
- A localhost-first 2D pixel-art gallery shooter on the web (Phaser 3 + Vite) where the player uses a centered crosshair to shoot zombies/monsters (valid targets) while avoiding civilians (invalid targets), with waves, scoring, life, penalties, UI/audio feedback, and final stats.
- Primary actor: Single player (public audience playtest/demo users).
- Expected outcome: After npm install and npm run dev, the game runs fully on localhost and is playable: player aims with mouse, shoots with left click, zombies and civilians spawn together each wave (about 70/30), zombie hits give points, civilian hits cause score/life penalties, zombies reaching the critical center damage player, HUD shows score/life/wave/accuracy, ESC pauses, restart works, and Game Over shows final stats.

### Actors snapshot
- Single player (public audience playtest/demo users).

### Functional rules snapshot
- The system must run locally with npm install + npm run dev and provide a fully playable fixed-camera gallery-shooter loop where each wave spawns zombies and civilians together, and left-click shots are resolved from the crosshair so zombies are rewarded and civilians are penalized immediately.
- All final visual/audio assets must be real licensed assets with clear permissive licenses (CC0/MIT/Apache/equivalent), documented in ASSETS.md, and final enemies must not be emojis or placeholder geometric shapes.

### Acceptance criteria snapshot
- Given a running wave with at least one civilian visible, when the player left-clicks and hits that civilian, then score decreases by 50, player life decreases by 15 (or one equivalent strike as specified), and the game shows visual and audio penalty feedback immediately.

### Security snapshot
- Do not execute untrusted remote code or dynamic scripts; keep gameplay assets local and validated, and avoid exposing admin/debug endpoints in the dev server build.

### Out-of-scope snapshot
- Excluded from v1: player movement (no WASD), multiplayer, online backend/accounts/leaderboards, realistic gore, and deployment/domain publishing (localhost first).

### Retrieval metadata
- Retrieval mode: section-level
- Retrieved sections: 1. Context, 2. Actors, 3. Functional Rules, 7. Security Considerations, 8. Out of Scope, 9. Acceptance Criteria
- Summary:
-
- Success looks like:
-

## 2. Discovery Review (Discovery Persona)
### Problem framing
- Many small prototype shooters fail demo readiness due to placeholder visuals, unclear penalties, or missing setup/docs; impact is high for public-facing demos because trust and playability drop immediately.
- Core rule to preserve: The system must run locally with npm install + npm run dev and provide a fully playable fixed-camera gallery-shooter loop where each wave spawns zombies and civilians together, and left-click shots are resolved from the crosshair so zombies are rewarded and civilians are penalized immediately.

### Constraints and dependencies
- Constraints: Must use Phaser 3 + Vite; run with npm install and npm run dev on localhost; fixed-camera/crosshair gameplay (no WASD in v1); pixel-art style with minimal stylized violence; real permissive-license assets only; mandatory README and ASSETS.md.
- Dependencies: Open-source asset providers with permissive licenses, npm ecosystem for Phaser/Vite dependencies, and local development runtime/browser.

### Success metrics
- Target: 100% local startup success via npm install + npm run dev; 100% required UI fields visible in active gameplay; deterministic scoring/penalty behavior in all waves; complete ASSETS.md coverage for all final assets.

### Key assumptions
- Assume permissive licensed pixel-art assets with coherent style are available in sufficient quality; assume overlap-based hit resolution can be tuned to feel fair for civilian-vs-zombie target conflicts.

### Discovery rigor profile
- Discovery interview mode: standard
- Planning policy: Plan for balanced decomposition with explicit risk tracking and key dependency checks.
- Follow-up gate: Escalate to deep discovery if major architectural uncertainty remains after first planning pass.

## 3. Scope
### In scope
-

### Out of scope
-

## 4. Product Review (Product Persona)
### Business value
- Address user pain by enforcing: The system must run locally with npm install + npm run dev and provide a fully playable fixed-camera gallery-shooter loop where each wave spawns zombies and civilians together, and left-click shots are resolved from the crosshair so zombies are rewarded and civilians are penalized immediately.
- Secondary value from supporting rule: All final visual/audio assets must be real licensed assets with clear permissive licenses (CC0/MIT/Apache/equivalent), documented in ASSETS.md, and final enemies must not be emojis or placeholder geometric shapes.

### Success metric
- Primary KPI: Target: 100% local startup success via npm install + npm run dev; 100% required UI fields visible in active gameplay; deterministic scoring/penalty behavior in all waves; complete ASSETS.md coverage for all final assets.
- Ship only if metric has baseline and target.

### Assumptions to validate
- Assume permissive licensed pixel-art assets with coherent style are available in sufficient quality; assume overlap-based hit resolution can be tuned to feel fair for civilian-vs-zombie target conflicts.
- Validate dependency and constraint impact before implementation start.
- Discovery rigor policy: Escalate to deep discovery if major architectural uncertainty remains after first planning pass.

## 5. Architecture (Architect Persona)
### Components
- CLI command parser
- Command handler service
- Module: zombite3-service

### Data flow
- Operator executes command with validated inputs.
- Service layer enforces FR logic and delegates to adapters.
- Result is persisted/emitted with deterministic status and error text.

### Key decisions
- Keep FR to implementation traceability explicit by preserving story and TC identifiers.
- Use Node.js CLI modules aligned with detected stack (Node.js CLI).
- Favor deterministic error paths over silent fallback behavior.

### Risks & mitigations
- Spec-to-code drift risk: enforce FR/US/TC traces in generated artifacts.
- Integration fragility risk: isolate external calls behind adapters with clear contracts.
- Scope drift risk: block changes not linked to approved FR/AC entries.

### Observability (logs/metrics/tracing)
- Structured command logs with feature and story IDs.
- Metrics for command success/failure and runtime duration.
- Trace markers for dependency boundaries.

### Domain quality profile
- Domain: Game/Interactive (game)
- Stack constraint: Use a rendering/game engine (for example Phaser or Three.js). Avoid raw primitive-only canvas logic as architecture baseline.
- Forbidden defaults: Rectangle-only or geometry-only output without asset pipeline.

## 6. Security (Security Persona)
### Threats
-

### Required controls
-

### Validation rules
-

### Abuse prevention / rate limiting (if applicable)
-

## 7. UX/UI Review (UX/UI Persona, if user-facing)
### Primary user flow
- Flow must be explicit and testable.

### Key states (empty/loading/error/success)
- Define deterministic behavior for empty/loading/error/success states.

### Accessibility baseline
- Keyboard and screen-reader baseline for user-facing interactions.

### Asset and placeholder strategy
- Use external asset loading (sprites/GLTF/audio) with public-domain packs or placeholders and document fallback behavior.
- Avoid default primitive-only output when domain requires visual fidelity.

## 8. Backlog
> Create as many epics/stories as needed. Do not impose artificial limits.

### Epics
- Epic 1:
  - Outcome:
  - Notes:
- Epic 2:
  - Outcome:
  - Notes:

### User Stories
For each story include clear Acceptance Criteria (Given/When/Then).

#### Story:
- As a <actor>, I want <capability>, so that <benefit>.
- Acceptance Criteria:
  - Given ..., when ..., then ...
  - Given ..., when ..., then ...

(repeat as needed)

## 9. Test Cases (QA Persona)
> Create as many test cases as needed. Include negative and edge cases.

### Functional
1.
2.

### Negative / Abuse
1.
2.

### Security
1.
2.

### Edge cases
1.
2.

## 10. Implementation Notes (Developer Persona)
- Suggested sequence:
-
- Dependencies:
-
- Rollout / fallback:
-
