import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const app = readFileSync(new URL('../../web/app.js', import.meta.url), 'utf8');

function parseNumberArray(source, regex, label) {
  const match = source.match(regex);
  if (!match) throw new Error(`${label} not found`);
  return match[1]
    .split(',')
    .map((x) => Number(x.trim()))
    .filter(Number.isFinite);
}

export function loadBalanceFromSource(source = app) {
  const levelGoals = parseNumberArray(source, /const LEVEL_GOALS = \[([^\]]+)\]/, 'LEVEL_GOALS');
  const levelPace = parseNumberArray(source, /const LEVEL_PACE = \[([^\]]+)\]/, 'LEVEL_PACE');
  const levelHpScale = parseNumberArray(source, /const LEVEL_HP_SCALE = \[([^\]]+)\]/, 'LEVEL_HP_SCALE');
  const alphaLevels = parseNumberArray(source, /const ALPHA_LEVELS = new Set\(\[([^\]]+)\]\)/, 'ALPHA_LEVELS');
  return {
    LEVEL_GOALS: levelGoals,
    LEVEL_PACE: levelPace,
    LEVEL_HP_SCALE: levelHpScale,
    ALPHA_LEVELS: new Set(alphaLevels),
  };
}

const DEFAULT_BALANCE = loadBalanceFromSource();

const SPAWN_BASE = 920;
const SPAWN_DECAY = 46;
const SPAWN_MIN = 220;
const SPAWN_MAX = 850;
const MAG_SIZE = 5;
const RELOAD_MS = 1000;
const INTER_LEVEL_MS = 2200;
const AIM_PENALTY_MS = 110;

export const DIFF = {
  easy: { factor: 0.86, accuracy: 0.78, shotsPerSec: 2.6 },
  normal: { factor: 1.0, accuracy: 0.62, shotsPerSec: 2.2 },
  hard: { factor: 1.18, accuracy: 0.48, shotsPerSec: 1.9 },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function spawnIntervalMs(level, diffFactor, balance) {
  const levelScale = SPAWN_BASE - level * SPAWN_DECAY;
  const pace = balance.LEVEL_PACE[level - 1];
  return clamp(levelScale / pace / diffFactor, SPAWN_MIN, SPAWN_MAX);
}

function avgHpPerKill(level, balance) {
  const hpScale = balance.LEVEL_HP_SCALE[level - 1];
  const normalHp = Math.round((1 + Math.floor(level / 4)) * hpScale);
  const alphaHp = Math.round((3 + Math.floor(level / 3)) * hpScale);
  const alphaChance = balance.ALPHA_LEVELS.has(level) ? 0.03 + (level / 10) * 0.11 : 0;
  return normalHp * (1 - alphaChance) + alphaHp * alphaChance;
}

export function estimateLevelMs(level, mode, balance = DEFAULT_BALANCE) {
  const { factor, accuracy, shotsPerSec } = DIFF[mode];
  if (!DIFF[mode]) throw new Error(`Unknown mode: ${mode}`);
  if (level < 1 || level > balance.LEVEL_GOALS.length) throw new Error(`Level out of range: ${level}`);

  const goal = balance.LEVEL_GOALS[level - 1];
  const spawnMs = spawnIntervalMs(level, factor, balance);
  const hpPerKill = avgHpPerKill(level, balance);
  const shotsNeeded = Math.ceil((goal * hpPerKill) / accuracy);
  const shotCycleMs = 1000 / shotsPerSec + AIM_PENALTY_MS;
  const firingMs = shotsNeeded * shotCycleMs;
  const reloads = Math.max(0, Math.ceil(shotsNeeded / MAG_SIZE) - 1);
  const reloadMs = reloads * RELOAD_MS;
  const spawnGateMs = goal * spawnMs;
  return Math.round(Math.max(spawnGateMs, firingMs + reloadMs));
}

export function estimateRunMs(mode, balance = DEFAULT_BALANCE) {
  let total = 0;
  for (let level = 1; level <= balance.LEVEL_GOALS.length; level += 1) {
    total += estimateLevelMs(level, mode, balance);
    if (level < balance.LEVEL_GOALS.length) total += INTER_LEVEL_MS;
  }
  return total;
}

function fmt(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

function runCli() {
  for (const mode of ['easy', 'normal', 'hard']) {
    const ms = estimateRunMs(mode);
    console.log(`${mode}: ${fmt(ms)} (${ms} ms)`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
