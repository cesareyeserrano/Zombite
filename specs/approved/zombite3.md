# AF-SPEC: zombite3

STATUS: APPROVED
## 1. Context
A localhost-first 2D pixel-art gallery shooter on the web (Phaser 3 + Vite) where the player uses a centered crosshair to shoot zombies/monsters (valid targets) while avoiding civilians (invalid targets), with waves, scoring, life, penalties, UI/audio feedback, and final stats.

Primary actor: Single player (public audience playtest/demo users).
Expected outcome: After npm install and npm run dev, the game runs fully on localhost and is playable: player aims with mouse, shoots with left click, zombies and civilians spawn together each wave (about 70/30), zombie hits give points, civilian hits cause score/life penalties, zombies reaching the critical center damage player, HUD shows score/life/wave/accuracy, ESC pauses, restart works, and Game Over shows final stats.
In scope: Included in v1: Phaser 3 + Vite project; BootScene/GameScene/UIScene; fixed-camera first-person simulation with centered crosshair; wave system with progressive difficulty; zombies (edge spawn, move to center with slight zigzag); civilians (lateral crossing, variable speed); hit detection from crosshair; life/defeat conditions; score and accuracy tracking; pause/menu/game-over screens; required audio and visual feedback (shot, zombie hit/kill, civilian error, muzzle flash, hit marker, light screen shake); pixel-art assets under permissive licenses; README with exact localhost steps; ASSETS.md with source URL/license/author for each asset.
Out of scope: Excluded from v1: player movement (no WASD), multiplayer, online backend/accounts/leaderboards, realistic gore, and deployment/domain publishing (localhost first).
Technology: Phaser 3 + Vite, using JavaScript or TypeScript, with source in /src and assets in /public/assets.
Requirement source: Provided explicitly by user in guided draft.

## 2. Actors
- Single player (public audience playtest/demo users).

## 3. Functional Rules (traceable)
- FR-1: The system must run locally with npm install + npm run dev and provide a fully playable fixed-camera gallery-shooter loop where each wave spawns zombies and civilians together, and left-click shots are resolved from the crosshair so zombies are rewarded and civilians are penalized immediately.
- FR-2: All final visual/audio assets must be real licensed assets with clear permissive licenses (CC0/MIT/Apache/equivalent), documented in ASSETS.md, and final enemies must not be emojis or placeholder geometric shapes.

## 4. Edge Cases
- A single shot frame may overlap multiple entities near the crosshair (for example a civilian crossing in front of a zombie), so hit resolution priority and penalties must be deterministic and consistent.

## 5. Failure Conditions
- TBD (refine during review)

## 6. Non-Functional Requirements
- TBD (refine during review)

## 7. Security Considerations
- Do not execute untrusted remote code or dynamic scripts; keep gameplay assets local and validated, and avoid exposing admin/debug endpoints in the dev server build.

## 8. Out of Scope
- Excluded from v1: player movement (no WASD), multiplayer, online backend/accounts/leaderboards, realistic gore, and deployment/domain publishing (localhost first).

## 9. Acceptance Criteria
- AC-1: Given a running wave with at least one civilian visible, when the player left-clicks and hits that civilian, then score decreases by 50, player life decreases by 15 (or one equivalent strike as specified), and the game shows visual and audio penalty feedback immediately.

## 10. Requirement Source Statement
- All requirements in this draft were provided explicitly by the user.
- Aitri structured the content and did not invent requirements.

## 11. Resource Strategy
- Use externally sourced pixel-art sprites/audio/fonts only from permissive-license sources, store under /public/assets, and document each asset (name, source URL, license, author/credits) in ASSETS.md.
