import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../../web/index.html', import.meta.url), 'utf8');
const embedHtml = readFileSync(new URL('../../web/embed-example.html', import.meta.url), 'utf8');
const appJs = readFileSync(new URL('../../web/app.js', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../../web/README.md', import.meta.url), 'utf8');

test('index wires game script and session HUD label', () => {
  assert.match(indexHtml, /id="sessionLabel">Time 08:00</);
  assert.match(indexHtml, /<script src="\.\/app\.js"><\/script>/);
});

test('embed demo uses spanish initial difficulty alias', () => {
  assert.match(embedHtml, /dificultadInicial=normal/);
  assert.match(embedHtml, /type:\s*"zombite\.configure"/);
});

test('app accepts widget config aliases and schema keys', () => {
  assert.match(appJs, /"difficultyInitial"/);
  assert.match(appJs, /"dificultadInicial"/);
  assert.match(appJs, /next\.difficulty\s*=\s*next\.difficultyInitial/);
  assert.match(appJs, /next\.difficulty\s*=\s*next\.dificultadInicial/);
});

test('app hardens embed messaging with burst guard telemetry', () => {
  assert.match(appJs, /INVALID_MESSAGE_WINDOW_MS/);
  assert.match(appJs, /INVALID_MESSAGE_LIMIT/);
  assert.match(appJs, /INVALID_MESSAGE_COOLDOWN_MS/);
  assert.match(appJs, /recordEmbedReject\("origin_blocked"/);
  assert.match(appJs, /recordEmbedReject\("unknown_schema"/);
  assert.match(appJs, /"burst_blocked"/);
  assert.match(appJs, /\[Zombite\]\[embed\] \${outcome}:\${reason}/);
});

test('keyboard controls cover primary actions', () => {
  assert.match(appJs, /if \(\(key === " " \|\| key === "spacebar"\) && state\.running && !state\.gameOver\)/);
  assert.match(appJs, /if \(key === "enter"\)/);
  assert.match(appJs, /if \(key === "escape" && state\.running && !state\.gameOver\)/);
  assert.match(appJs, /function shootFromKeyboard\(\)/);
  assert.match(indexHtml, /Space to shoot/);
  assert.match(indexHtml, /Enter starts\/continues/);
});

test('session pacing controls exist in runtime', () => {
  assert.match(appJs, /SESSION_LIMIT_MS\s*=\s*8\s*\*\s*60\s*\*\s*1000/);
  assert.match(appJs, /state\.session\.elapsedMs\s*\+=\s*dt/);
  assert.match(appJs, /triggerSessionTimeout\(\)/);
  assert.match(appJs, /Time\s\$\{formatClock\(remainingMs\)\}/);
});

test('level progression tuning and alpha escalation are present', () => {
  assert.match(appJs, /const LEVEL_GOALS\s*=\s*\[6, 7, 8, 9, 10, 11, 12, 13, 14, 15\]/);
  assert.match(appJs, /const ALPHA_LEVELS\s*=\s*new Set\(\[4, 6, 8, 10\]\)/);
  assert.match(appJs, /const LEVEL_PACE\s*=\s*\[[^\]]+\]/);
  assert.match(appJs, /const LEVEL_HP_SCALE\s*=\s*\[[^\]]+\]/);
  assert.match(appJs, /function levelPace\(level\)/);
  assert.match(appJs, /function levelHpScale\(level\)/);
  assert.match(appJs, /goalForLevel\(state\.level\)/);
  assert.match(appJs, /alphaLevelGate\s*=\s*levelHasAlpha\(state\.level\)/);
  assert.match(appJs, /function levelHasAlpha\(level\)/);
  assert.match(appJs, /Threat \$\{profile\.threat\}\$\{alphaSuffix\}/);
});

test('scene and profile tables are defined for runtime HUD and visuals', () => {
  assert.match(appJs, /const LEVEL_SCENES\s*=\s*\[/);
  assert.match(appJs, /const SCENE_PROFILE\s*=\s*\{/);
  assert.match(appJs, /return LEVEL_SCENES\[idx\]/);
  assert.match(appJs, /return SCENE_PROFILE\[scene\.name\] \|\| SCENE_PROFILE\.City/);
});

test('README documents difficulty aliases', () => {
  assert.match(readme, /`difficultyInitial`\s*\/\s*`dificultadInicial`/);
});
