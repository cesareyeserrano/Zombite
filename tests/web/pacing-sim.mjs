import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../../web/app.js', import.meta.url), 'utf8');

const levelGoalsMatch = app.match(/const LEVEL_GOALS = \[([^\]]+)\]/);
if (!levelGoalsMatch) throw new Error('LEVEL_GOALS not found');
const LEVEL_GOALS = levelGoalsMatch[1]
  .split(',')
  .map((x) => Number(x.trim()))
  .filter(Number.isFinite);
const levelPaceMatch = app.match(/const LEVEL_PACE = \[([^\]]+)\]/);
if (!levelPaceMatch) throw new Error('LEVEL_PACE not found');
const LEVEL_PACE = levelPaceMatch[1]
  .split(',')
  .map((x) => Number(x.trim()))
  .filter(Number.isFinite);
const levelHpScaleMatch = app.match(/const LEVEL_HP_SCALE = \[([^\]]+)\]/);
if (!levelHpScaleMatch) throw new Error('LEVEL_HP_SCALE not found');
const LEVEL_HP_SCALE = levelHpScaleMatch[1]
  .split(',')
  .map((x) => Number(x.trim()))
  .filter(Number.isFinite);
const alphaLevelsMatch = app.match(/const ALPHA_LEVELS = new Set\(\[([^\]]+)\]\)/);
if (!alphaLevelsMatch) throw new Error('ALPHA_LEVELS not found');
const ALPHA_LEVELS = new Set(
  alphaLevelsMatch[1]
    .split(',')
    .map((x) => Number(x.trim()))
    .filter(Number.isFinite),
);

const SPAWN_BASE = 920;
const SPAWN_DECAY = 46;
const SPAWN_MIN = 220;
const SPAWN_MAX = 850;
const MAG_SIZE = 5;
const RELOAD_MS = 1000;
const INTER_LEVEL_MS = 2200;
const AIM_PENALTY_MS = 110;

const DIFF = {
  easy: { factor: 0.86, accuracy: 0.78, shotsPerSec: 2.6 },
  normal: { factor: 1.0, accuracy: 0.62, shotsPerSec: 2.2 },
  hard: { factor: 1.18, accuracy: 0.48, shotsPerSec: 1.9 },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function spawnIntervalMs(level, diffFactor) {
  const levelScale = SPAWN_BASE - level * SPAWN_DECAY;
  const pace = LEVEL_PACE[level - 1];
  return clamp(levelScale / pace / diffFactor, SPAWN_MIN, SPAWN_MAX);
}

function avgHpPerKill(level) {
  const hpScale = LEVEL_HP_SCALE[level - 1];
  const normalHp = Math.round((1 + Math.floor(level / 4)) * hpScale);
  const alphaHp = Math.round((3 + Math.floor(level / 3)) * hpScale);
  const alphaChance = ALPHA_LEVELS.has(level) ? 0.03 + (level / 10) * 0.11 : 0;
  return normalHp * (1 - alphaChance) + alphaHp * alphaChance;
}

function estimateRunMs(mode) {
  const { factor, accuracy, shotsPerSec } = DIFF[mode];
  let total = 0;

  for (let level = 1; level <= 10; level += 1) {
    const goal = LEVEL_GOALS[level - 1];
    const spawnMs = spawnIntervalMs(level, factor);
    const hpPerKill = avgHpPerKill(level);
    const shotsNeeded = Math.ceil((goal * hpPerKill) / accuracy);
    const shotCycleMs = 1000 / shotsPerSec + AIM_PENALTY_MS;
    const firingMs = shotsNeeded * shotCycleMs;
    const reloads = Math.max(0, Math.ceil(shotsNeeded / MAG_SIZE) - 1);
    const reloadMs = reloads * RELOAD_MS;
    const spawnGateMs = goal * spawnMs;

    const levelMs = Math.max(spawnGateMs, firingMs + reloadMs);
    total += levelMs;
    if (level < 10) total += INTER_LEVEL_MS;
  }

  return Math.round(total);
}

function fmt(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

for (const mode of ['easy', 'normal', 'hard']) {
  const ms = estimateRunMs(mode);
  console.log(`${mode}: ${fmt(ms)} (${ms} ms)`);
}
