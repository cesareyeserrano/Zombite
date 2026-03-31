# Zombite3 — Zombie Rescue Runner

A single-player browser minigame built with Phaser 3.90 + Vite 5. Protect civilians crossing to a military bunker while shooting zombies — playable locally and embeddable in any web container.

## Requirements

- Node.js 18+
- npm 10+

## Setup

```bash
git clone <repo>
cd Zombite3
npm install
npm run dev
```

Local dev server: `http://127.0.0.1:5173/`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Production bundle |
| `npm run preview` | Preview production bundle locally |
| `npm test` | Run automated test suite (node --test) |

## Controls

| Action | Control |
|---|---|
| Aim | Free mouse movement |
| Shoot | Left click (0.25s cooldown) |
| Pause / Resume | `ESC` |
| Restart run | `R` or on-screen button |
| Next level | `NEXT LEVEL` button at level end |
| Toggle audio | `Sound On/Off` button |

## Architecture

The game is a static front-end bundle with no backend. All state is in-memory during a run; only the high score is persisted via `localStorage`.

### Key components

| Component | File | Responsibility |
|---|---|---|
| **GameScene** | `src/scenes/GameScene.js` | Core gameplay loop: entity spawning, combat resolution, wave orchestration, progression, score/life state machine |
| **UIScene** | `src/scenes/UIScene.js` | HUD overlays, player messaging, level/game-over summaries, DOM interaction layer |
| **BootScene** | `src/scenes/BootScene.js` | Local asset loading and pre-play validation before gameplay starts |
| **AudioManager** | `src/audio/AudioManager.js` | Procedural Web Audio synthesis, ambient loop, and SFX dispatch. Extracted from GameScene to isolate the audio subsystem. Requires an interaction-unlocked `AudioContext`. |
| **gameRules.js** | `src/modules/module-zombite3-service/gameRules.js` | Deterministic game constants, shot resolution, penalty functions, `getDifficultyProfile()` per level |
| **ui.js** | `src/locale/ui.js` | Centralized UI string constants for all overlays and in-game copy. Single source of truth for player-visible text. |

### Directory structure

```text
src/
  main.js                  — Phaser game bootstrap
  scenes/
    BootScene.js           — Asset loading
    GameScene.js           — Gameplay loop
    UIScene.js             — HUD and overlays
  audio/
    AudioManager.js        — Web Audio subsystem
  locale/
    ui.js                  — UI string constants
  modules/
    module-zombite3-service/
      gameRules.js         — Deterministic rule functions
      securityPolicy.js    — Asset and runtime safety controls
      assetsPolicy.js      — Asset license validation
      index.js             — Module public exports
  contracts/               — Test contract implementations
tests/
  zombite3/generated/      — Automated test suite (node --test)
docs/                      — Project documentation
features/                  — Feature pipelines (Aitri)
public/assets/
  sprites/                 — Game sprites
  audio/                   — Audio assets (if any)
  fonts/                   — Font assets
```

## Gameplay loop

- Civilians run left-to-right toward the bunker across three depth lanes.
- Zombies spawn and pursue civilians; brutes appear at level 5+.
- Shoot zombies to earn score; friendly fire penalizes you.
- Power-ups appear airborne: health (+20 HP) and rescue (+50 score, -1 civilian lost).
- Game over when HP reaches 0 or too many civilians are lost.

### Difficulty curve

| Levels | Civilian goal | Spawn interval | Enemies |
|---|---|---|---|
| 1–2 | 10 | ~1.2–1.8s | Normal only |
| 3–4 | 10 | ~2.9–3.2s | + Elite (alpha) |
| 5–9 | 15 | ~2.4–2.7s | + Brute |
| 10+ | 15+ | ~1.1–1.3s | Mixed horde |

### HUD

- Life / Score / Level
- Civilians saved / goal
- Civilians lost / limit
- Accuracy (%)

## Persistence

Best score is stored in `localStorage` under the key `zrr.highScore`. No backend, no user accounts, no cloud state.

## Embedding

The production bundle (`npm run build`) is a self-contained static bundle safe for iframe or web container deployment at 800x450 and larger.
