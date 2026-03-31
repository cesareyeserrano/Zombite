# Discovery: Zombite3

## Problem
Public demo builds of small action games often fail before the player can judge whether the core concept is fun. The recurring pain is not only gameplay quality; it is setup friction, unclear target rules, and low trust in what the player is seeing. When a local demo is hard to boot, uses ambiguous penalties, or fails to explain who is a valid target, players read the experience as broken rather than challenging.

For Zombite3, the forcing situation is a short-session local playtest or showcase. The player needs to launch the game quickly, understand the objective in seconds, and trust that shots, penalties, and session outcomes are consistent. If the game behaves inconsistently or if assets appear provisional, the demo loses credibility immediately.

The business problem to solve is therefore: evolve the current beta into a more professional zombie rescue shooter experience that is fast to start, easy to understand, embeddable in other web surfaces, and internally consistent enough to support repeatable demo sessions and future implementation phases without product ambiguity.

## Users
### 1. Public demo player
Context:
This user opens the game in a local demo or playtest setting, usually with limited patience and no prior onboarding.

Goal:
Start a run quickly, understand which targets are safe or unsafe, survive for a meaningful session, and interpret score, loss, and progression without explanation from a developer.

### 2. Product owner / playtest operator
Context:
This user prepares the build for demos, validates whether the experience is ready to show, and needs stable requirements to compare intended behavior against actual runtime behavior.

Goal:
Confirm that the game is runnable on localhost, that the target rules and penalties are coherent, and that the experience is bounded enough to plan the next iteration without rediscovering requirements every time.

### 3. Integrator / host site owner
Context:
This user needs to place the game inside another website or controlled web surface without requiring a complex deployment or install flow.

Goal:
Embed the game reliably, keep the play session self-contained, and trust that it remains lightweight, readable, and stable inside a bounded container.

### 4. Future implementation team
Context:
This includes any engineer, designer, or AI-assisted workflow that will continue the project using Aitri after discovery and requirements are confirmed.

Goal:
Receive a clear problem definition, measurable success criteria, and explicit boundaries so the next SDLC phases do not inherit contradictions between README, tests, and gameplay behavior.

## Success Criteria
1. A first-time operator can start the game from the repository root using the documented local command flow in under 5 minutes on a standard Node.js setup.
2. A first-time player can identify the primary objective, valid targets, invalid targets, and loss condition within 30 seconds of entering the first playable state.
3. Every harmful shot against a civilian applies the same immediate penalty rule every time: score penalty, life penalty, and visible feedback are all triggered in the same interaction frame or the next rendered frame.
4. Every level/run HUD exposes, at minimum, current life, score, level, civilians saved, civilians lost, and accuracy throughout active gameplay.
5. High score persistence survives a browser reload in 100% of standard local runs where localStorage is available.
6. A host website can embed the game inside a fixed container without requiring additional installation steps for the end user.
7. The asset inventory used by the shipped playable build is fully traceable: 100% of gameplay-critical visual/audio assets loaded by the runtime are listed in the project asset inventory and documented in `ASSETS.md`.
8. Discovery is considered complete only if the next requirements phase can name the core gameplay loop, penalties, win/loss conditions, progression model, embed expectations, and scope boundaries without relying on contradictory legacy docs.

## Out of Scope
1. No multiplayer, matchmaking, shared sessions, or online cooperative/competitive features.
2. No backend services, user accounts, cloud save, telemetry pipeline, or online leaderboard.
3. No free-roam player movement or navigation-based level exploration; the product remains a fixed-camera target-shooting experience.
4. No realistic gore, dismemberment, or graphic violence beyond stylized arcade feedback.
5. No production publishing, domain launch, store release, or live-ops workflow in this phase.
6. No expansion of the scope to multiple gameplay modes until the core rescue-shooter loop is internally consistent and validated.
7. No engine migration away from the current implementation baseline in this phase; the next version continues from the Phaser-based product unless a later explicit rewrite decision is made.

## Confirmed Product Decisions
1. Wave composition is intentionally flexible. The gameplay must feel like a mixed-threat rescue scenario with active danger plus civilian protection, but the requirements must not lock the design to a fixed zombie/civilian spawn ratio.
2. Zombie-to-civilian contact follows one official penalty model:
- Normal zombie contact causes 10 life damage.
- Elite/alpha zombie contact causes 15 life damage.
- Brute contact causes 20 life damage.
- Every successful contact counts as 1 civilian lost.
- Game over happens when life reaches 0 or the civilian-loss limit is exceeded.
- Zombie-to-civilian contact does not directly subtract score.
3. The product direction is embeddable web gameplay, but local execution remains mandatory for development and QA.
4. The official product scope for the next phases is the Phaser game in `src/`. The `web/` folder is out of scope for the new requirements baseline and must not define product behavior for the main implementation track.
5. The current beta is treated as an implementation baseline to upgrade, not as a throwaway prototype. The next phases should increase quality, clarity, and completeness without forcing a stack migration.
6. Detailed visual production rules such as frame counts, exact sprite sizes, palette constraints, asset formats, audio behavior, and scoring finalization belong in formal requirements and UX/art specification, not in discovery.

## Discovery Confidence
- Confidence: Medium-high
- Reason: The core product intent is stable and the main product decisions are now explicit, but current legacy artifacts still contain drift that must be corrected in the formal requirements phase.
- Handoff decision: Safe to move to formal requirements in Aitri using this discovery as the authoritative baseline.
