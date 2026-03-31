# Deployment

## Purpose
Zombite3 is a localhost-first browser game. The main supported workflow is local development through Vite. Container files are included to make preview and verification reproducible, not to introduce a backend deployment target.

## Prerequisites
- Node.js 18+
- npm 10+

## Local development
```bash
npm install
npm run dev
```

Expected URL: `http://127.0.0.1:5173/`

## Verification
```bash
npm test
npm run build
```

## Container preview
```bash
docker compose up --build
```

Expected preview URL: `http://127.0.0.1:4173/`

## Health checks
- Browser preview root `/` should return HTTP 200.
- `npm test` should pass before rebuilding the preview image.
- `npm run build` should succeed before starting the container preview.
