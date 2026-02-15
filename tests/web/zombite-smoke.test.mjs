import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { estimateLevelMs, estimateRunMs } from './pacing-sim.mjs';

const indexHtml = readFileSync(new URL('../../web/index.html', import.meta.url), 'utf8');
const embedHtml = readFileSync(new URL('../../web/embed-example.html', import.meta.url), 'utf8');
const appJs = readFileSync(new URL('../../web/app.js', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../../web/README.md', import.meta.url), 'utf8');

function parseNumberList(regex, label) {
  const match = appJs.match(regex);
  assert.ok(match, `${label} is missing`);
  return match[1]
    .split(',')
    .map((value) => Number(value.trim()))
    .filter(Number.isFinite);
}

test('index wires game script and session HUD label', () => {
  assert.match(indexHtml, /id="sessionLabel">Time 08:00</);
  assert.match(indexHtml, /<script src="\.\/app\.js"><\/script>/);
});

test('core loop exposes quick start HUD and clear continue/restart outcomes', () => {
  assert.match(indexHtml, /id="levelLabel">Level 1\/10</);
  assert.match(indexHtml, /id="statusLabel">Press Start</);
  assert.match(indexHtml, /id="startBtn" type="button">Start Game</);
  assert.match(indexHtml, /id="continueBtn" type="button">Continue</);
  assert.match(indexHtml, /id="restartBtn" type="button">Restart Run</);

  assert.match(appJs, /setStatus\(statusText\("Hunt started"\)\)/);
  assert.match(appJs, /title: statusText\("Level complete"\)/);
  assert.match(appJs, /text: statusText\("You can continue to the next level or restart\."\)/);
  assert.match(appJs, /continueText: statusText\("Continue"\)/);
  assert.match(appJs, /title: statusText\("Level failed"\)/);
  assert.match(appJs, /text: statusText\("You can retry this level or restart the run\."\)/);
  assert.match(appJs, /continueText: statusText\("Retry level"\)/);
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
  assert.match(appJs, /recordEmbedReject\("invalid_values"/);
  assert.match(appJs, /"burst_blocked"/);
  assert.match(appJs, /"burst_guard_armed"/);
  assert.match(appJs, /setStatus\(statusText\("Config rate limited"\)\)/);
  assert.match(appJs, /cooldownRemainingMs/);
  assert.match(appJs, /invalidRecent/);
  assert.match(appJs, /\[Zombite\]\[embed\] \${outcome}:\${reason}/);
});

test('app ignores known-schema payloads when values are invalid', () => {
  assert.match(appJs, /const configResult = applyConfig\(message\.payload\)/);
  assert.match(appJs, /if \(!configResult\.applied\) \{/);
  assert.match(appJs, /setStatus\(statusText\("Config ignored"\)\)/);
  assert.match(appJs, /return {\s*applied: false,/);
  assert.match(appJs, /"Config ignored": "Configuracion ignorada"/);
  assert.match(appJs, /"Config rate limited": "Configuracion limitada por rafaga"/);
});

test('runtime includes recoil and hit-marker feedback for shooter feel', () => {
  assert.match(appJs, /hitMarker:\s*\{\s*ttl:\s*0,\s*tone:\s*"normal"/);
  assert.match(appJs, /weapon:\s*\{\s*recoil:\s*0,\s*swayX:\s*0,\s*swayY:\s*0,\s*swayTargetX:\s*0,\s*swayTargetY:\s*0,\s*shotLightTtl:\s*0/);
  assert.match(appJs, /damageFx:\s*\{\s*ttl:\s*0,\s*intensity:\s*0,\s*pulse:\s*0/);
  assert.match(appJs, /hitStop:\s*\{\s*ttl:\s*0,\s*maxTtl:\s*0,\s*intensity:\s*0,\s*mode:\s*"none"/);
  assert.match(appJs, /state\.weapon\.recoil = Math\.min\(1, state\.weapon\.recoil \+ 0\.9\)/);
  assert.match(appJs, /state\.weapon\.shotLightTtl = Math\.max\(state\.weapon\.shotLightTtl, 130\)/);
  assert.match(appJs, /state\.weapon\.swayTargetX = normalizedX/);
  assert.match(appJs, /state\.weapon\.swayTargetY = normalizedY/);
  assert.match(appJs, /const swayX = state\.weapon\.swayX/);
  assert.match(appJs, /const swayY = state\.weapon\.swayY/);
  assert.match(appJs, /const sprintWeight = z\.rush \|\| 0/);
  assert.match(appJs, /\brush,\s*/);
  assert.match(appJs, /function drawShotLightOverlay\(\)/);
  assert.match(appJs, /triggerHitMarker\(z\.isAlpha \? "alpha" : "normal"\)/);
  assert.match(appJs, /function applyZombieImpactReaction\(z, point\)/);
  assert.match(appJs, /z\.staggerMs = Math\.max\(z\.staggerMs, z\.isAlpha \? 170 : 130\)/);
  assert.match(appJs, /function triggerDamageOverlay\(amount\)/);
  assert.match(appJs, /state\.damageFx\.ttl = Math\.max\(state\.damageFx\.ttl, 380 \+ normalized \* 240\)/);
  assert.match(appJs, /const HIT_STOP_PROFILE = \{/);
  assert.match(appJs, /function triggerHitStop\(strength = 0\.5, mode = "normal"\)/);
  assert.match(appJs, /const ttl = profile\.baseMs \+ power \* profile\.spanMs/);
  assert.match(appJs, /state\.hitStop\.mode = mode/);
  assert.match(appJs, /const worldDt = dt \* worldScale/);
  assert.match(appJs, /state\.nextSpawnMs -= worldDt/);
  assert.match(appJs, /if \(state\.damageFx\.ttl <= 0\) return;/);
  assert.match(appJs, /const sparks = \[]/);
  assert.match(appJs, /ringMax:/);
  assert.match(appJs, /function drawHitMarker\(\)/);
  assert.match(appJs, /drawHitMarker\(\);/);
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

test('pacing model keeps progression gradual and level 10 reachable for medium skill', () => {
  const easyMs = estimateRunMs('easy');
  const normalMs = estimateRunMs('normal');
  const hardMs = estimateRunMs('hard');

  assert.ok(easyMs >= 3 * 60 * 1000, `easy run too short: ${easyMs}`);
  assert.ok(hardMs <= 8 * 60 * 1000, `hard run exceeds session limit: ${hardMs}`);
  assert.ok(easyMs < normalMs && normalMs < hardMs, 'difficulty pacing is not monotonic');

  const levelTimes = [];
  for (let level = 1; level <= 10; level += 1) {
    levelTimes.push(estimateLevelMs(level, 'normal'));
  }
  for (let i = 1; i < levelTimes.length; i += 1) {
    const prev = levelTimes[i - 1];
    const current = levelTimes[i];
    assert.ok(current <= prev * 2.7, `abrupt spike at level ${i + 1}: ${prev} -> ${current}`);
  }

  const level10Ms = estimateLevelMs(10, 'normal');
  assert.ok(level10Ms >= 45 * 1000, `level 10 too easy for medium skill: ${level10Ms}`);
  assert.ok(level10Ms <= 95 * 1000, `level 10 not reachable for medium skill: ${level10Ms}`);
});

test('alpha encounters are distinct, tougher, and progression-safe', () => {
  assert.match(appJs, /const ALPHA_LEVELS\s*=\s*new Set\(\[4, 6, 8, 10\]\)/);
  assert.match(appJs, /const firstAlphaThisLevel\s*=\s*isAlpha && !state\.alphaSpawnedInLevel/);
  assert.match(appJs, /setStatus\(statusText\("Alpha spotted"\)\)/);
  assert.match(appJs, /ctx\.fillText\("ALPHA", 0, torsoTop - headRadius \* 2\.1\)/);
  assert.match(appJs, /const baseHp = isAlpha \? 3 \+ Math\.floor\(state\.level \/ 3\) : 1 \+ Math\.floor\(state\.level \/ 4\)/);
  assert.match(appJs, /state\.score \+= z\.isAlpha \? 55 : 10/);
  assert.match(appJs, /if \(state\.killsInLevel >= state\.goalInLevel\) {\s*onLevelComplete\(\);\s*break;\s*}/);

  const levelGoals = parseNumberList(/const LEVEL_GOALS = \[([^\]]+)\]/, 'LEVEL_GOALS');
  const alphaLevels = parseNumberList(/const ALPHA_LEVELS = new Set\(\[([^\]]+)\]\)/, 'ALPHA_LEVELS');

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const alphaSpawnAtSpawnCount = (level) => clamp(7 - Math.floor(level / 2), 2, 5);

  for (const level of alphaLevels) {
    const goal = levelGoals[level - 1];
    const forcedSpawnAt = alphaSpawnAtSpawnCount(level);
    assert.ok(forcedSpawnAt < goal, `alpha event can be skipped at level ${level}: spawnAt=${forcedSpawnAt}, goal=${goal}`);
  }
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
