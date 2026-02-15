# Zombite Manual Playtest (10 minutes)

## Goal
Validate real in-browser feel for pacing (3-8 minutes), fairness, and widget config UX.

## Setup
1. From repo root run:

```bash
python3 -m http.server 8080
```

2. Open:
- Standalone: `http://127.0.0.1:8080/web/index.html`
- Embed demo: `http://127.0.0.1:8080/web/embed-example.html`

## Test matrix (3 rounds)
Run all rounds from level 1.

1. Round A (`easy`)
- URL: `http://127.0.0.1:8080/web/index.html?difficulty=easy&startLevel=1`
- Expected: complete run near lower bound of window.

2. Round B (`normal`)
- URL: `http://127.0.0.1:8080/web/index.html?difficulty=normal&startLevel=1`
- Expected: central pacing and consistent progression.

3. Round C (`hard`)
- URL: `http://127.0.0.1:8080/web/index.html?difficulty=hard&startLevel=1`
- Expected: close to upper bound of window, but not frustrating spikes.

## Embed checks
1. Open embed demo and verify boot with `dificultadInicial`.
2. Click `Send Hard Mode` and confirm game status updates (config applied).
3. Send invalid payload from console and verify it is ignored safely:

```js
const frame = document.getElementById('zombiteFrame');
frame.contentWindow.postMessage({ type: 'zombite.configure', payload: { unknown: 'x' } }, 'http://127.0.0.1:8080');
```

Expected: session continues with no crash.

4. Burst abuse guard (same host origin), send repeated invalid payloads:

```js
const frame = document.getElementById('zombiteFrame');
for (let i = 0; i < 10; i += 1) {
  frame.contentWindow.postMessage(
    { type: 'zombite.configure', payload: { difficulty: 'extreme' } },
    'http://127.0.0.1:8080'
  );
}
```

Expected:
- Status switches to `Config rate limited` (or `Configuracion limitada por rafaga` in ES).
- Additional invalid messages are blocked during cooldown.

5. Observability check (browser console in embedded game tab):
- Filter logs by `[Zombite][embed]`.
- Confirm rejected reasons include `invalid_values`, `unknown_schema`, and `burst_guard_armed` when abuse is triggered.
- Confirm telemetry object includes `invalidRecent` and `cooldownRemainingMs`.

## Pass/fail gates
- Pacing window: each run should end between 3:00 and 8:00, with `hard` not materially above 8:00.
- Progression: no abrupt impossible jump between adjacent levels.
- Alpha behavior: appears from mid-game and feels stronger than regular zombies.
- Stability: no freezes on reload/pause/restart and no breakage after invalid widget payload.
- Abuse hardening: burst guard arms on repeated invalid payloads and cooldown is observable in logs.

## Record output
Log outcomes in `docs/release/zombite-playtest-log.md`.
