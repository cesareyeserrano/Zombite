# Zombite Web MVP

Static web game that can run standalone or embedded as iframe/widget.

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
