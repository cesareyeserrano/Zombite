# Zombite PR Notes

## Scope delivered
- Session pacing tuned for 3-8 minute runs with hard cap at 8 minutes.
- Difficulty progression tuned across 10 levels with explicit per-level goals.
- Alpha zombie encounters moved to mid-game and scaled by level.
- Widget config alias support added: `difficultyInitial` and `dificultadInicial`.
- Embed demo and README updated to reflect config contract.

## Evidence
- Validation: `aitri validate --feature zombite --format json` => `ok: true`, no gaps.
- Static smoke tests: `node --test tests/web/zombite-smoke.test.mjs`.
- Local static serving smoke (HTTP 200): `web/index.html`, `web/app.js`, `web/embed-example.html`.

## Risks / follow-up
- Live gameplay feel still requires manual playtest in a browser to verify actual completion times by skill band.
- Recommend adding browser-driven integration tests (Playwright) in a future pass.
