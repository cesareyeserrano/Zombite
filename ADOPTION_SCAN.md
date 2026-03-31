# Adoption Scan — Zombite3

## Stack

JavaScript ES Modules · Phaser 3.90 + Vite 5 · Node.js built-in test runner (`node --test`)

---

## Priority Actions

### CRITICAL

**1. `web/app.js` is a 2425-line orphaned god object with no test coverage and no wiring to the Phaser codebase.**
`/Users/cesareyeserrano/Documents/PROJECTS/Zombite3/web/app.js` implements a fully parallel game engine (canvas-based, magazine/ammo system, 10 LEVEL_SCENES, `BASE_MAGAZINE = 5`, `ALPHA_LEVELS`, `SCENE_PROFILE` difficulty curves) that is architecturally disconnected from `/src/scenes/GameScene.js`. The two implementations share no imports, no shared module, and no shared state contract. The entire `web/` subtree has only one smoke test (`tests/web/zombite-smoke.test.mjs`) and no FR/AC coverage. Neither the Dockerfile nor `vite.config.js` reference it as the build entry. Its role — legacy prototype, planned replacement, or dead code — is undocumented.
**Action:** Decide immediately whether `web/app.js` is dead code (delete it) or a planned successor (document its scope and gate it behind a feature flag). The current state creates navigation confusion for any new contributor and a future maintenance burden.

**2. `.gitignore` is missing critical entries — `dist/` is already committed to the repository.**
`.gitignore` lists `dist/` but the project root contains a `dist/` directory visible via `ls`. Entries missing from `.gitignore`: `.env`, `*.log`, `.nyc_output/`, `.cache/`, and there is no `.env.example` in `.gitignore` (one exists as an untracked file). Build artefacts in version control will cause stale-bundle deployment accidents.
**Action:** Verify and fix `.gitignore`; confirm `dist/` is not tracked. Add: `.env`, `*.log`, `.nyc_output/`, `.cache/`.

**3. No CI/CD pipeline exists. Tests and build are never validated automatically.**
The `Dockerfile` and `docker-compose.yml` are present and structurally correct (multi-stage build, `npm ci`, `vite build`, `vite preview`, healthcheck). A `04_TEST_RESULTS.json` records 27/27 passing as of 2026-03-10. But there is no `.github/workflows/`, no `Jenkinsfile`, no `circleci/`, and no other CI integration. The stated 27-test passing status is a point-in-time snapshot — there is no mechanism to catch regressions on new commits.
**Action:** Add a minimal CI workflow (GitHub Actions recommended given the stack) that runs `npm ci && npm test && npm run build` on every push and PR to `main`.

---

### HIGH

**4. `GameScene.js` is a 2006-line god object — all game logic, audio, entity management, pooling, input, and visual effects live in a single class.**
`/src/scenes/GameScene.js` lines 1–2006 contain: entity spawn logic (`spawnCivilian`, `spawnZombie`, `spawnPowerup`), physics (`updateEntity`, `processZombieCivilianContacts`), object pooling (`acquireCivilianVisual`, `acquireZombieVisual`, `recycleCivilianVisual`, `recycleZombieVisual`), Web Audio synthesis (`ensureAudioContext`, `startAmbientLoop`, `playSfx`, `playTone`), input binding (`bindInput`, `bindUiChannel`), localStorage persistence (`readHighScore`, `persistHighScore`, `readAudioMuted`, `persistAudioMuted`), difficulty scaling (`getDifficultyProfile`), wave orchestration (`beginWave`, `spawnFromQueue`, `flushPendingPursuers`), and all camera/feedback effects. The test suite covers game rules via `gameRules.js` in isolation but tests against `GameScene.js` use static source-text regex matching (tc-5 through tc-16), not functional verification of scene behavior.
**Action:** Extract at minimum the audio subsystem (~lines 1827–2004) and the difficulty profile (~lines 1047–1099) into separate modules. This is a maintenance risk — a regression in any one concern requires reading the full 2006-line file.

**5. `evaluateSecurityControls` is called at scene startup but its result is silently swallowed in non-blocking `console.warn`.**
`GameScene.js` lines 222–267: `runSecurityBaseline()` calls `evaluateSecurityControls`, then on `!security.ok` only emits `console.warn`. There is no blocking behavior, no test assertion against the actual scene invocation, and no operator-visible signal if the check fails in a deployed context. The check is also redundant: it tests the same hardcoded path list that `BootScene.js` already loads — it adds no runtime surface-level protection that isn't already covered by the asset manifest contract.
**Action:** Either promote the security check to a load-blocking assertion (throw on fail in dev, emit a visible HUD warning in prod), or document it explicitly as a development-only audit tool so future maintainers do not misread it as an enforced runtime guard.

**6. The `beginWave` composition no longer includes zombies from `buildWaveComposition` — they are added only as boss exceptions.**
`GameScene.js` lines 414–437: `buildWaveComposition(spawnCount)` is called, but only `composition.civilians` is used to populate `this.spawnQueue`. The zombie entries produced by `buildWaveComposition` are discarded. Normal zombies enter exclusively through `schedulePursuerForCivilian` (one pursuer per civilian spawned). At levels < 3, boss exceptions (`zombie-elite`, `zombie-brute`) are never injected either. This means early waves generate only civilians plus one pursuer zombie per civilian — the stated FR-004 requirement of "mixed-threat wave composition" is technically satisfied but only because each civilian is paired with exactly one pursuer.
`buildWaveComposition` in `gameRules.js` remains exercised by tests (TC-8 family) but its zombie output is functionally dead code in the current wave orchestration.
**Action:** Either update `beginWave` to use the full `composition.queue` as intended, or update `buildWaveComposition` to match the current pursuer-pair model and remove the misleading zombie queue output. Document which design is intentional.

**7. `docker-compose.yml` does not pin an image tag and copies the full source tree including `node_modules` into the runtime stage.**
`/Users/cesareyeserrano/Documents/PROJECTS/Zombite3/Dockerfile` line 14: `COPY --from=build /app /app` copies the entire build directory — including `node_modules` — into the runtime image. The runtime stage only needs the built static files served by `vite preview`. This creates a bloated image and a larger attack surface.
**Action:** Add a `.dockerignore`, restrict the runtime `COPY` to the `dist/` output only, and serve it via a minimal static server rather than carrying the full dev dependency tree.

---

### MEDIUM

**8. `tests/zombite3/tests.md` references a source-of-truth path that points outside the project.**
Line 18 of `tests/zombite3/tests.md` cites `/Users/cesareyeserrano/Documents/PROJECTS/Drafts/Zombite3/03_TEST_CASES.json` as the canonical test design reference — an absolute local filesystem path that will not resolve for any other developer or in any CI environment.
**Action:** Replace with a relative reference to `/03_TEST_CASES.json` in the project root.

**9. The shot trail origin is hardcoded to pixel coordinates `(130, GROUND_Y - 34)` regardless of viewport scaling.**
`GameScene.js` line 1541: `const originX = 130;` and `const originY = GROUND_Y - 34;` — this was presumably a gunman position but is a magic constant not tied to any scene object, lane, or responsive layout anchor. At non-standard viewport scales or in the embedded 800x450 container the trail will visually originate from the wrong point.
**Action:** Bind the trail origin to a named scene property (e.g., `this.gunnerOrigin`) defined during `create()` and responsive to viewport dimensions.

**10. `UIScene.js` contains hardcoded Spanish-language strings mixed with English HUD identifiers.**
`/src/scenes/UIScene.js` lines 219, 249, 258, 278, 288, 300, 308, 317, 329, 349, 415: UI copy uses Spanish (`"Protege a los civiles"`, `"INICIAR"`, `"CONTINUAR"`, `"Rotar Dispositivo"`, `"Supervivencia de Oficina"`) while game-state feedback in `GameScene.js` uses English (`"FRIENDLY FIRE"`, `"INFECTED!"`, `"SAFE! +1"`, `"Protect the civilians"`). This inconsistency is observable to end users and will complicate any future i18n work.
**Action:** Decide the product language baseline (English is used in all test assertions, feedback labels, and the HUD). Extract UI strings to a locale object or constants file.

**11. No performance budget or chunk size limit is enforced in `vite.config.js`.**
`/Users/cesareyeserrano/Documents/PROJECTS/Zombite3/vite.config.js` splits the Phaser vendor chunk manually but sets no `chunkSizeWarningLimit`, no `rollupOptions.output.assetFileNames` pattern, and no `build.target`. The `04_TEST_RESULTS.json` notes a "non-blocking large chunk warning" from Vite. The Phaser vendor chunk will be significant (~1–1.5 MB minified); without a documented size budget, load time regressions cannot be caught automatically.
**Action:** Add `build.chunkSizeWarningLimit` and document the accepted bundle size in a comment or in `DEPLOYMENT.md`.

**12. `manifest.json` sourceUrl uses a `local://` scheme that is not a real URL and cannot be validated by any standard tool.**
`/public/assets/manifest.json` entries use `"sourceUrl": "local://zombite3/original-art/..."`. The `isLocalAssetPath` function in `securityPolicy.js` tests manifest `path` fields (which start with `/assets/...`) — it does not validate `sourceUrl`. The `local://` scheme is project-invented and provides no actual provenance trail to a human or automated auditor.
**Action:** Document the `local://` convention explicitly in `ASSETS.md` or replace with relative file paths or commit SHAs that provide verifiable provenance.

---

### LOW

**13. No `engines` field in `package.json` to declare the required Node.js version.**
The project uses Node built-in test runner (`node --test`) which requires Node 18+. The Dockerfile pins `node:20-alpine` but local development has no guard. A developer on Node 16 will see silent test runner failures.
**Action:** Add `"engines": { "node": ">=18" }` to `package.json`.

**14. `BootScene.js` starts both `GameScene` and `UIScene` in `create()` without a loading progress indicator.**
`/src/scenes/BootScene.js` lines 47–50: `this.scene.start("GameScene")` and `this.scene.start("UIScene")` are called immediately after `preload()` — which loads 33+ SVG assets — with no loading bar, spinner, or progress callback. On a slow or cold-cache connection this will show a black screen with no feedback.
**Action:** Add a `this.load.on("progress", ...)` handler to display a minimal loading indicator.

**15. `docker-compose.yml` exposes no `restart` policy.**
If the container process crashes, Docker will not restart it. For a QA or demo deployment this is a reliability gap.
**Action:** Add `restart: unless-stopped` to the `zombite3` service definition.

---

## Technical Health Report

### Code Quality

The core game logic module (`gameRules.js`, 294 lines) is well-structured: pure functions, immutable state transitions, deterministic hit resolution with tiebreaking by priority, distance, spawnIndex, and id. The module boundary is clean and the service index exports a coherent surface. `GameScene.js` is the inverse — a 2006-line god class that handles every game concern. The visual pooling architecture (`zombieVisualPool`, `civilianVisualPool`, `shotTrailPool`, `particlePool`) is a solid performance decision for a fixed-budget game loop. Object pooling is correctly implemented with `busy` flags and explicit recycling on entity removal. The Web Audio synthesis approach (procedural oscillators, no external audio files) is coherent and avoids a common asset-loading failure mode. Spanish/English string inconsistency (see item 10) is the most visible polish gap.

`web/app.js` (2425 lines) is structurally a distinct product — it has a magazine/reload mechanic (`BASE_MAGAZINE = 5`), 10 named LEVEL_SCENES (Laundromat through Airport), a `SCENE_PROFILE` threat curve, canvas-based rendering, and a different state machine model. It is not connected to the Phaser project in any way.

### Test Health

27 tests, 27 passing (recorded 2026-03-10). FR coverage is formally complete across all 7 FRs. The test strategy has two tiers: (1) functional unit tests against pure `gameRules.js` exports (TC-1 through TC-4) and (2) source-text regex assertions against `GameScene.js` (TC-5 through TC-16). The regex-based tier provides structural coverage — it confirms specific patterns exist in the source — but cannot detect behavioral regressions caused by logic changes that preserve the text pattern. There are no integration tests, no browser automation tests, and no performance benchmarks. The `web/` subtree has one smoke test (`tests/web/zombite-smoke.test.mjs`) that is not counted in the FR coverage table. No tests run automatically: passing state is a manually-snapshotted artifact in `04_TEST_RESULTS.json`.

### Documentation

`01_REQUIREMENTS.json`, `02_SYSTEM_DESIGN.md`, `03_TEST_CASES.json`, and `04_TEST_RESULTS.json` represent a coherent SDLC artifact chain. `ASSETS.md` is current and cross-references `manifest.json`. `DEPLOYMENT.md` presumably covers local and Docker deployment paths (present in the file listing but not read in full). `tests/zombite3/tests.md` has a broken absolute path reference (see item 8). `IDEA.md` at scan time contained a generic project summary with no specific stabilization scope. The `web/` subtree has its own `README.md` but the relationship between `web/` and `src/` is undocumented at the root level.

### Security Posture

No hardcoded credentials detected. No external script loading. Asset paths are validated as local by `securityPolicy.js`. The `evaluateSecurityControls` call in `GameScene.runSecurityBaseline()` is a non-blocking audit check, not a runtime enforcement gate (see item 5). The `manifest.json` uses a `local://` custom scheme for `sourceUrl` that provides no verifiable external provenance (see item 12). The runtime stores only `zrr.highScore` and `zrr.audioMuted` in `localStorage` — both are player preference data with no security sensitivity. No backend, no API keys, no network calls during gameplay. Security posture is acceptable for an embedded minigame; the `evaluateSecurityControls` framing should be clarified as described in item 5.

### Infrastructure & Operational Readiness

Dockerfile: multi-stage build is correct in structure but runtime stage carries `node_modules` (see item 7). `docker-compose.yml` is minimal and functional but missing a restart policy. No CI/CD pipeline (see item 3). `vite.config.js` provides manual Phaser chunk splitting but no size budget enforcement (see item 11). `package.json` scripts cover `dev`, `build`, `preview`, and `test` — the full local operator workflow is present. No `engines` field (see item 13). The `vite.config.js` sets `strictPort: false` for dev, which is appropriate, and locks the preview port to 4173 matching the Docker exposure. The Vite preview server is used as the production runtime in Docker — this is functional but not recommended for production traffic; a proper static file server (nginx, Caddy) would be more appropriate if the deployment scales.
