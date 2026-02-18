# Zombite Web MVP

Static web game that can run standalone or embedded as iframe/widget.

## Gameplay pacing

- Session timer: up to 8 minutes per run.
- Level targets are tuned for short sessions (3-8 minutes depending on skill).
- Progression curve uses per-level pace/HP tuning to avoid abrupt difficulty spikes.
- 10 levels with gradual difficulty and alpha zombie encounters on defined levels: 4, 6, 8, and 10.

## Run locally

From repository root:

```bash
python3 -m http.server 8080
```

Then open:

- Game: `http://127.0.0.1:8080/web/index.html`
- Embed demo: `http://127.0.0.1:8080/web/embed-example.html`

## Widget configuration

1. Query params (`index.html?...`):
- `language`: `en` or `es`
- `difficulty`: `easy`, `normal`, `hard`
- `difficultyInitial` / `dificultadInicial`: alias for initial difficulty
- `startLevel`: `1..10`
- `volume`: `0..1`
- `allowedOrigin`: comma-separated allowlist for `postMessage` origins

2. Runtime message from host:

```js
iframe.contentWindow.postMessage(
  {
    type: "zombite.configure",
    payload: { difficulty: "hard", volume: 0.5 },
  },
  "https://your-host.com"
);
```

Validation behavior:
- Unknown payload keys are rejected.
- Known keys with invalid values are ignored, keeping safe defaults/current config.
- Repeated invalid payloads trigger a temporary rate limit (`burst_guard_armed` / `burst_blocked`).
