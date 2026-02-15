"use strict";

const MAX_LEVEL = 10;
const BASE_MAGAZINE = 5;
const BASE_HEALTH = 100;
const SESSION_TARGET_MIN_MS = 3 * 60 * 1000;
const SESSION_LIMIT_MS = 8 * 60 * 1000;
const LEVEL_GOALS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const ALPHA_LEVELS = new Set([4, 6, 8, 10]);
const NIGHT_CITY_SCENE = {
  name: "Night Street",
  skyTop: "#05070b",
  skyMid: "#111824",
  groundTop: "#1a1d23",
  groundBottom: "#0c0e12",
};
const THREAT_SCALE = ["Low", "Guarded", "Elevated", "High", "Critical", "Lethal"];
const LEVEL_PACE = [1.0, 1.04, 1.08, 1.13, 1.18, 1.23, 1.28, 1.34, 1.4, 1.47];
const LEVEL_HP_SCALE = [1.0, 1.0, 1.01, 1.03, 1.05, 1.07, 1.1, 1.13, 1.16, 1.2];
const LEVEL_SCENES = [
  NIGHT_CITY_SCENE,
  { name: "City", skyTop: "#0f1525", skyMid: "#1d2b3f", groundTop: "#1c1e26", groundBottom: "#121319" },
  { name: "Factory", skyTop: "#121018", skyMid: "#2b2320", groundTop: "#2a2624", groundBottom: "#1a1614" },
  { name: "Countryside", skyTop: "#0e1d26", skyMid: "#234238", groundTop: "#213429", groundBottom: "#131f19" },
  { name: "Highway", skyTop: "#10131c", skyMid: "#263247", groundTop: "#2e323a", groundBottom: "#1e2229" },
  { name: "Harbor", skyTop: "#0d1b2b", skyMid: "#24495f", groundTop: "#244150", groundBottom: "#162736" },
  { name: "Subway", skyTop: "#14141d", skyMid: "#2a2a34", groundTop: "#24242e", groundBottom: "#171720" },
  { name: "Mall", skyTop: "#1b1522", skyMid: "#3b2f43", groundTop: "#2f2a35", groundBottom: "#1d1921" },
  { name: "Hospital", skyTop: "#131d24", skyMid: "#2f4550", groundTop: "#2b3b44", groundBottom: "#1a252c" },
  { name: "Airport", skyTop: "#101a26", skyMid: "#2f3f4f", groundTop: "#2a333c", groundBottom: "#1a2028" },
];
const SCENE_PROFILE = {
  "Night Street": {
    threat: THREAT_SCALE[0],
    speedBoost: 0.04,
    hpBoost: 0,
    sizeBoost: -1,
    wobbleBoost: 0,
    damageBoost: 0,
    zombieColor: "#6d8b66",
    alphaColor: "#a57860",
  },
  City: {
    threat: THREAT_SCALE[0],
    speedBoost: 0.05,
    hpBoost: 0,
    sizeBoost: 0,
    wobbleBoost: 1,
    damageBoost: 0,
    zombieColor: "#7f916a",
    alphaColor: "#ba7c6a",
  },
  Factory: {
    threat: THREAT_SCALE[1],
    speedBoost: 0.08,
    hpBoost: 1,
    sizeBoost: 1,
    wobbleBoost: 2,
    damageBoost: 0.6,
    zombieColor: "#839474",
    alphaColor: "#c98f70",
  },
  Countryside: {
    threat: THREAT_SCALE[1],
    speedBoost: 0.11,
    hpBoost: 1,
    sizeBoost: 1,
    wobbleBoost: 1,
    damageBoost: 0.8,
    zombieColor: "#7a9363",
    alphaColor: "#bb7d58",
  },
  Highway: {
    threat: THREAT_SCALE[2],
    speedBoost: 0.14,
    hpBoost: 1,
    sizeBoost: 2,
    wobbleBoost: 2,
    damageBoost: 1.2,
    zombieColor: "#8b8f7e",
    alphaColor: "#cb8766",
  },
  Harbor: {
    threat: THREAT_SCALE[3],
    speedBoost: 0.18,
    hpBoost: 1,
    sizeBoost: 2,
    wobbleBoost: 2,
    damageBoost: 1.6,
    zombieColor: "#7e9488",
    alphaColor: "#ca815f",
  },
  Subway: {
    threat: THREAT_SCALE[3],
    speedBoost: 0.22,
    hpBoost: 2,
    sizeBoost: 2,
    wobbleBoost: 3,
    damageBoost: 2.0,
    zombieColor: "#8a948f",
    alphaColor: "#d38f72",
  },
  Mall: {
    threat: THREAT_SCALE[4],
    speedBoost: 0.26,
    hpBoost: 2,
    sizeBoost: 3,
    wobbleBoost: 3,
    damageBoost: 2.5,
    zombieColor: "#919684",
    alphaColor: "#d89875",
  },
  Hospital: {
    threat: THREAT_SCALE[4],
    speedBoost: 0.31,
    hpBoost: 2,
    sizeBoost: 3,
    wobbleBoost: 4,
    damageBoost: 3.0,
    zombieColor: "#8a9d8c",
    alphaColor: "#da9a79",
  },
  Airport: {
    threat: THREAT_SCALE[5],
    speedBoost: 0.37,
    hpBoost: 3,
    sizeBoost: 4,
    wobbleBoost: 4,
    damageBoost: 3.6,
    zombieColor: "#98a08f",
    alphaColor: "#e1a784",
  },
};
const INVALID_MESSAGE_WINDOW_MS = 1500;
const INVALID_MESSAGE_LIMIT = 8;
const INVALID_MESSAGE_COOLDOWN_MS = 4000;

const ui = {
  canvas: document.getElementById("arena"),
  levelLabel: document.getElementById("levelLabel"),
  sceneLabel: document.getElementById("sceneLabel"),
  goalLabel: document.getElementById("goalLabel"),
  statusLabel: document.getElementById("statusLabel"),
  sessionLabel: document.getElementById("sessionLabel"),
  threatLabel: document.getElementById("threatLabel"),
  ammoLabel: document.getElementById("ammoLabel"),
  healthLabel: document.getElementById("healthLabel"),
  crosshair: document.getElementById("crosshair"),
  startBtn: document.getElementById("startBtn"),
  reloadBtn: document.getElementById("reloadBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  muzzleFlash: document.getElementById("muzzleFlash"),
  outcomePanel: document.getElementById("outcomePanel"),
  outcomeTitle: document.getElementById("outcomeTitle"),
  outcomeText: document.getElementById("outcomeText"),
  continueBtn: document.getElementById("continueBtn"),
  restartBtn: document.getElementById("restartBtn"),
};

const ctx = ui.canvas.getContext("2d");
const state = {
  running: false,
  paused: false,
  gameOver: false,
  level: 1,
  killsInLevel: 0,
  goalInLevel: 0,
  spawnsInLevel: 0,
  alphaSpawnedInLevel: false,
  score: 0,
  health: BASE_HEALTH,
  ammo: BASE_MAGAZINE,
  reloading: false,
  nextSpawnMs: 0,
  zombies: [],
  pointer: { x: ui.canvas.width / 2, y: ui.canvas.height / 2 },
  pointerVisible: false,
  lastTs: 0,
  waitingDecision: false,
  decisionMode: "none",
  savedLevel: 1,
  session: {
    elapsedMs: 0,
    targetMinMs: SESSION_TARGET_MIN_MS,
    limitMs: SESSION_LIMIT_MS,
  },
  config: {
    language: "en",
    volume: 0.7,
    startLevel: 1,
    difficulty: "normal",
  },
  perf: {
    quality: "high",
    sampleFpsSum: 0,
    sampleFrames: 0,
    lowScore: 0,
    highScore: 0,
  },
  impacts: [],
  bloodPools: [],
  camera: {
    shakeMs: 0,
    intensity: 0,
  },
  audio: {
    ctx: null,
    unlocked: false,
  },
  embed: {
    acceptedMessages: 0,
    rejectedMessages: 0,
    rejectedByReason: {},
    invalidWindow: [],
    blockedUntilMs: 0,
    lastLogMs: 0,
  },
};

const schemaKeys = new Set([
  "language",
  "volume",
  "startLevel",
  "difficulty",
  "difficultyInitial",
  "dificultadInicial",
]);
const queryConfig = readQueryConfig();
const allowedOrigins = buildAllowedOrigins(queryConfig.allowedOrigin);
applyConfig(queryConfig);
refreshHud();
bootRuntime();

ui.startBtn.addEventListener("click", () => {
  if (!state.running || state.gameOver) {
    startGame();
    return;
  }
  if (state.paused) {
    togglePause();
  }
});

ui.reloadBtn.addEventListener("click", () => {
  queueReload();
});

ui.pauseBtn.addEventListener("click", () => {
  if (!state.running || state.gameOver) return;
  togglePause();
});

ui.continueBtn.addEventListener("click", () => {
  if (!state.waitingDecision) return;
  continueRun();
});

ui.restartBtn.addEventListener("click", () => {
  restartRun();
});

ui.canvas.addEventListener("pointermove", (event) => {
  const point = canvasPoint(event);
  state.pointer.x = point.x;
  state.pointer.y = point.y;
  moveCrosshair(event);
});

ui.canvas.addEventListener("pointerenter", (event) => {
  state.pointerVisible = true;
  ui.crosshair.classList.add("active");
  moveCrosshair(event);
});

ui.canvas.addEventListener("pointerleave", () => {
  state.pointerVisible = false;
  ui.crosshair.classList.remove("active");
});

ui.canvas.addEventListener("click", (event) => {
  if (!state.running || state.paused || state.gameOver) return;
  shoot(canvasPoint(event));
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "r") {
    queueReload();
    return;
  }
  if (key === "p" && state.running && !state.gameOver) {
    togglePause();
    return;
  }
  if ((key === " " || key === "spacebar") && state.running && !state.gameOver) {
    event.preventDefault();
    shootFromKeyboard();
    return;
  }
  if (key === "enter") {
    event.preventDefault();
    if (state.waitingDecision) {
      continueRun();
      return;
    }
    if (!state.running || state.gameOver) {
      startGame();
      return;
    }
    if (state.paused) {
      togglePause();
    }
    return;
  }
  if (key === "escape" && state.running && !state.gameOver) {
    togglePause();
  }
});

window.addEventListener("message", (event) => {
  handleEmbedMessage(event);
});

function readQueryConfig() {
  const params = new URLSearchParams(window.location.search);
  return {
    language: params.get("language"),
    volume: params.get("volume"),
    startLevel: params.get("startLevel"),
    difficulty: params.get("difficulty"),
    difficultyInitial: params.get("difficultyInitial"),
    dificultadInicial: params.get("dificultadInicial"),
    allowedOrigin: params.get("allowedOrigin"),
  };
}

function buildAllowedOrigins(rawList) {
  const origins = new Set([window.location.origin]);
  if (!rawList) return origins;
  const segments = rawList.split(",").map((item) => item.trim());
  for (const origin of segments) {
    if (!origin) continue;
    if (isValidUrlOrigin(origin)) origins.add(origin);
  }
  return origins;
}

function hasKnownSchema(payload) {
  const keys = Object.keys(payload);
  if (keys.length === 0) return false;
  return keys.every((key) => schemaKeys.has(key));
}

function handleEmbedMessage(event) {
  const now = performance.now();
  if (isEmbedBurstBlocked(now)) {
    recordEmbedReject("burst_blocked", event, now);
    if (allowedOrigins.has(event.origin)) {
      setStatus(statusText("Config rate limited"));
    }
    return;
  }

  if (!allowedOrigins.has(event.origin)) {
    recordEmbedReject("origin_blocked", event, now);
    return;
  }

  const message = event.data;
  if (!message || typeof message !== "object") {
    recordEmbedReject("invalid_envelope", event, now);
    return;
  }

  const messageType = typeof message.type === "string" ? message.type : "";
  if (!messageType.startsWith("zombite.")) return;
  if (messageType !== "zombite.configure") {
    recordEmbedReject("unsupported_type", event, now);
    return;
  }

  if (!message.payload || typeof message.payload !== "object") {
    recordEmbedReject("invalid_payload", event, now);
    return;
  }
  if (!hasKnownSchema(message.payload)) {
    recordEmbedReject("unknown_schema", event, now);
    return;
  }

  const configResult = applyConfig(message.payload);
  if (!configResult.applied) {
    recordEmbedReject("invalid_values", event, now);
    setStatus(statusText("Config ignored"));
    return;
  }

  state.embed.acceptedMessages += 1;
  setStatus(statusText("Config updated"));
  logEmbedMessage("accepted", "config_updated", event.origin, now);
}

function pruneEmbedInvalidWindow(now) {
  const cutoff = now - INVALID_MESSAGE_WINDOW_MS;
  state.embed.invalidWindow = state.embed.invalidWindow.filter((entry) => entry >= cutoff);
}

function isEmbedBurstBlocked(now) {
  pruneEmbedInvalidWindow(now);
  return now < state.embed.blockedUntilMs;
}

function recordEmbedReject(reason, event, now = performance.now()) {
  state.embed.rejectedMessages += 1;
  state.embed.rejectedByReason[reason] = (state.embed.rejectedByReason[reason] || 0) + 1;

  if (reason !== "burst_blocked") {
    state.embed.invalidWindow.push(now);
    pruneEmbedInvalidWindow(now);
    if (state.embed.invalidWindow.length >= INVALID_MESSAGE_LIMIT) {
      state.embed.blockedUntilMs = now + INVALID_MESSAGE_COOLDOWN_MS;
      state.embed.rejectedMessages += 1;
      state.embed.rejectedByReason.burst_guard_armed = (state.embed.rejectedByReason.burst_guard_armed || 0) + 1;
      if (allowedOrigins.has(event.origin)) {
        setStatus(statusText("Config rate limited"));
      }
      logEmbedMessage("rejected", "burst_guard_armed", event.origin, now);
    }
  }

  logEmbedMessage("rejected", reason, event.origin, now);
}

function logEmbedMessage(outcome, reason, origin, now = performance.now()) {
  if (outcome === "rejected" && now - state.embed.lastLogMs < 220) return;
  state.embed.lastLogMs = now;
  const logger = outcome === "accepted" ? console.info : console.warn;
  const cooldownRemainingMs = Math.max(0, Math.round(state.embed.blockedUntilMs - now));
  logger(`[Zombite][embed] ${outcome}:${reason}`, {
    origin,
    accepted: state.embed.acceptedMessages,
    rejected: state.embed.rejectedMessages,
    invalidRecent: state.embed.invalidWindow.length,
    cooldownRemainingMs,
  });
}

function sanitizeConfig(next) {
  const normalized = normalizeConfigInput(next);
  const sanitized = {};

  if (typeof normalized.language === "string") {
    const lang = normalized.language.trim().toLowerCase();
    if (lang === "es" || lang === "en") sanitized.language = lang;
  }

  if (normalized.volume !== undefined) {
    const value = Number(normalized.volume);
    if (Number.isFinite(value)) {
      sanitized.volume = clamp(value, 0, 1);
    }
  }

  if (normalized.startLevel !== undefined) {
    const value = Number(normalized.startLevel);
    if (Number.isFinite(value)) {
      sanitized.startLevel = Math.round(clamp(value, 1, MAX_LEVEL));
    }
  }

  if (typeof normalized.difficulty === "string") {
    const mode = normalized.difficulty.trim().toLowerCase();
    if (mode === "easy" || mode === "normal" || mode === "hard") {
      sanitized.difficulty = mode;
    }
  }

  return sanitized;
}

function normalizeConfigInput(raw) {
  const next = raw && typeof raw === "object" ? { ...raw } : {};
  if (next.difficulty === undefined && typeof next.difficultyInitial === "string") {
    next.difficulty = next.difficultyInitial;
  }
  if (next.difficulty === undefined && typeof next.dificultadInicial === "string") {
    next.difficulty = next.dificultadInicial;
  }
  return next;
}

function applyConfig(incoming) {
  const sanitized = sanitizeConfig(incoming || {});
  if (Object.keys(sanitized).length === 0) {
    refreshHud();
    return {
      applied: false,
      sanitized,
    };
  }

  state.config = { ...state.config, ...sanitized };
  if (!state.running || state.gameOver) {
    state.level = state.config.startLevel;
  }
  refreshHud();
  return {
    applied: true,
    sanitized,
  };
}

function startGame() {
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.waitingDecision = false;
  state.decisionMode = "none";
  state.score = 0;
  state.session.elapsedMs = 0;
  state.health = BASE_HEALTH;
  state.level = state.config.startLevel;
  state.savedLevel = state.level;
  ui.pauseBtn.textContent = "Pause";
  state.zombies = [];
  state.impacts = [];
  state.bloodPools = [];
  state.camera.shakeMs = 0;
  state.camera.intensity = 0;
  state.ammo = BASE_MAGAZINE;
  state.reloading = false;
  hideOutcome();
  beginLevel();
  state.lastTs = performance.now();
  setStatus(statusText("Hunt started"));
  requestAnimationFrame(loop);
}

function beginLevel() {
  state.savedLevel = state.level;
  state.killsInLevel = 0;
  state.goalInLevel = goalForLevel(state.level);
  state.spawnsInLevel = 0;
  state.alphaSpawnedInLevel = false;
  state.zombies = [];
  state.nextSpawnMs = 0;
  setStatus(statusText(`Level ${state.level} - ${currentScene().name}`));
  refreshHud();
}

function loop(ts) {
  if (!state.running) return;
  const dt = Math.min(40, ts - state.lastTs);
  state.lastTs = ts;
  observePerformance(dt);

  if (!state.paused && !state.gameOver && !state.waitingDecision) {
    update(dt);
  }

  draw();
  requestAnimationFrame(loop);
}

function update(dt) {
  state.session.elapsedMs += dt;
  if (state.session.elapsedMs >= state.session.limitMs) {
    triggerSessionTimeout();
    return;
  }

  state.nextSpawnMs -= dt;
  if (state.nextSpawnMs <= 0) {
    spawnZombie();
    state.nextSpawnMs = spawnIntervalMs();
  }

  const arenaHeight = ui.canvas.height;
  const profile = currentProfile();
  const damageRate =
    (state.config.difficulty === "hard" ? 11 : state.config.difficulty === "easy" ? 6 : 8) + profile.damageBoost;

  for (let i = state.zombies.length - 1; i >= 0; i -= 1) {
    const z = state.zombies[i];
    z.y += z.speed * (dt / 16.6);
    z.x += Math.sin((performance.now() + z.phase) * 0.001 * z.wobbleSpeed) * z.wobble;

    if (z.y > arenaHeight - 78) {
      applyPlayerDamage(z.isAlpha ? damageRate * 1.8 : damageRate);
      state.zombies.splice(i, 1);
      if (state.health <= 0) {
        triggerGameOver("You were overrun");
        return;
      }
    }
  }

  for (let i = state.impacts.length - 1; i >= 0; i -= 1) {
    state.impacts[i].ttl -= dt;
    if (state.impacts[i].ttl <= 0) state.impacts.splice(i, 1);
  }

  for (let i = state.bloodPools.length - 1; i >= 0; i -= 1) {
    state.bloodPools[i].ttl -= dt;
    if (state.bloodPools[i].ttl <= 0) state.bloodPools.splice(i, 1);
  }

  if (state.camera.shakeMs > 0) {
    state.camera.shakeMs = Math.max(0, state.camera.shakeMs - dt);
    if (state.camera.shakeMs === 0) {
      state.camera.intensity = 0;
    }
  }
  refreshHud();
}

function spawnZombie() {
  const width = ui.canvas.width;
  const levelBias = state.level / MAX_LEVEL;
  const profile = currentProfile();
  const pace = levelPace(state.level);
  const hpScale = levelHpScale(state.level);
  const alphaLevelGate = levelHasAlpha(state.level);
  const forceAlpha = alphaLevelGate && !state.alphaSpawnedInLevel && state.spawnsInLevel >= alphaSpawnAtSpawnCount(state.level);
  const alphaRoll = alphaLevelGate && Math.random() < 0.03 + levelBias * 0.11;
  const isAlpha = forceAlpha || (alphaLevelGate && alphaRoll);
  const firstAlphaThisLevel = isAlpha && !state.alphaSpawnedInLevel;
  const baseHp = isAlpha ? 3 + Math.floor(state.level / 3) : 1 + Math.floor(state.level / 4);
  const scaledHp = Math.max(1, Math.round(baseHp * hpScale));

  const z = {
    isAlpha,
    x: 80 + Math.random() * (width - 160),
    y: 120 + Math.random() * 40,
    radius: (isAlpha ? 36 : 24) + profile.sizeBoost,
    hp: scaledHp + profile.hpBoost,
    speed: (1.0 + levelBias * 0.95 + profile.speedBoost) * difficultyFactor() * pace,
    wobble: (isAlpha ? 24 : 14) + profile.wobbleBoost,
    wobbleSpeed: isAlpha ? 1.6 : 1.0,
    phase: Math.random() * 1000,
    color: isAlpha ? profile.alphaColor : profile.zombieColor,
  };
  state.zombies.push(z);
  state.spawnsInLevel += 1;
  if (isAlpha) state.alphaSpawnedInLevel = true;
  if (firstAlphaThisLevel) {
    setStatus(statusText("Alpha spotted"));
  }

  const maxOnScreen = 5 + Math.floor(state.level / 2) - (state.perf.quality === "low" ? 2 : 0);
  if (state.zombies.length > maxOnScreen) state.zombies.shift();
}

function difficultyFactor() {
  if (state.config.difficulty === "easy") return 0.86;
  if (state.config.difficulty === "hard") return 1.18;
  return 1;
}

function spawnIntervalMs() {
  const levelScale = 920 - state.level * 46;
  const pacedScale = levelScale / levelPace(state.level);
  return clamp(pacedScale / difficultyFactor(), 220, 850);
}

function goalForLevel(level) {
  const idx = clamp(level, 1, MAX_LEVEL) - 1;
  return LEVEL_GOALS[idx];
}

function levelHasAlpha(level) {
  const normalized = Math.round(clamp(level, 1, MAX_LEVEL));
  return ALPHA_LEVELS.has(normalized);
}

function alphaSpawnAtSpawnCount(level) {
  const normalized = Math.round(clamp(level, 1, MAX_LEVEL));
  return clamp(7 - Math.floor(normalized / 2), 2, 5);
}

function levelPace(level) {
  const normalized = Math.round(clamp(level, 1, MAX_LEVEL));
  return LEVEL_PACE[normalized - 1];
}

function levelHpScale(level) {
  const normalized = Math.round(clamp(level, 1, MAX_LEVEL));
  return LEVEL_HP_SCALE[normalized - 1];
}

function shoot(point) {
  ensureAudioReady();
  if (state.reloading || state.ammo <= 0) {
    if (state.ammo <= 0) queueReload();
    return;
  }
  state.ammo -= 1;
  flashMuzzle();
  startCameraShake(65, 2.4);
  playShotSound();
  let hit = false;

  for (let i = state.zombies.length - 1; i >= 0; i -= 1) {
    const z = state.zombies[i];
    const dx = point.x - z.x;
    const dy = point.y - z.y;
    const precisionWindow = Math.max(2, 8 - Math.floor(state.level / 2));
    if (Math.hypot(dx, dy) <= z.radius + precisionWindow) {
      z.hp -= 1;
      hit = true;
      addImpact(point.x, point.y, z.isAlpha ? "#ffbdb0" : "#b7ffbf");
      playHitSound(z.isAlpha);
      if (z.hp <= 0) {
        addBloodPool(z.x, z.y, z.isAlpha);
        playKillSound(z.isAlpha);
        state.zombies.splice(i, 1);
        state.killsInLevel += 1;
        state.score += z.isAlpha ? 55 : 10;
        if (state.killsInLevel >= state.goalInLevel) {
          onLevelComplete();
          break;
        }
      }
    }
  }

  if (!hit) {
    state.score = Math.max(0, state.score - 1);
  }

  if (state.ammo <= 0) queueReload();
  refreshHud();
}

function shootFromKeyboard() {
  if (!state.running || state.paused || state.gameOver || state.waitingDecision) return;
  const point = state.pointerVisible
    ? { x: state.pointer.x, y: state.pointer.y }
    : { x: ui.canvas.width / 2, y: ui.canvas.height / 2 };
  shoot(point);
}

function queueReload() {
  if (state.reloading || state.ammo === BASE_MAGAZINE || state.gameOver || !state.running) return;
  state.reloading = true;
  setStatus(statusText("Reloading"));
  setTimeout(() => {
    state.ammo = BASE_MAGAZINE;
    state.reloading = false;
    setStatus(statusText("Ready"));
    refreshHud();
  }, 1000);
}

function onLevelComplete() {
  state.savedLevel = state.level;
  if (state.level >= MAX_LEVEL) {
    state.running = false;
    state.gameOver = true;
    showOutcome({
      title: statusText("Victory"),
      text: statusText("You cleared all 10 levels"),
      continueText: statusText("Play again"),
      mode: "victory",
    });
    setStatus(statusText("Victory - all 10 levels complete"));
    refreshHud();
    return;
  }

  showOutcome({
    title: statusText("Level complete"),
    text: statusText("You can continue to the next level or restart."),
    continueText: statusText("Continue"),
    mode: "level_complete",
  });
  setStatus(statusText("Level complete - choose next action"));
  refreshHud();
}

function triggerGameOver(text) {
  state.gameOver = true;
  state.waitingDecision = true;
  state.decisionMode = "game_over";
  showOutcome({
    title: statusText("Level failed"),
    text: statusText("You can retry this level or restart the run."),
    continueText: statusText("Retry level"),
    mode: "game_over",
  });
  setStatus(statusText(text));
  refreshHud();
}

function triggerSessionTimeout() {
  state.running = false;
  state.gameOver = true;
  showOutcome({
    title: statusText("Session complete"),
    text: statusText("The 8-minute run ended. Restart to play again."),
    continueText: statusText("Play again"),
    mode: "victory",
  });
  setStatus(statusText("Time is up"));
  refreshHud();
}

function togglePause() {
  state.paused = !state.paused;
  ui.pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  setStatus(statusText(state.paused ? "Paused" : "Resumed"));
}

function refreshHud() {
  const scene = currentScene();
  const profile = currentProfile();
  ui.levelLabel.textContent = `Level ${state.level}/${MAX_LEVEL}`;
  ui.sceneLabel.textContent = `Scene ${scene.name}`;
  ui.goalLabel.textContent = `Goal ${state.killsInLevel}/${state.goalInLevel}`;
  if (ui.sessionLabel) {
    const remainingMs = Math.max(0, state.session.limitMs - state.session.elapsedMs);
    ui.sessionLabel.textContent = `Time ${formatClock(remainingMs)}`;
  }
  const alphaSuffix = levelHasAlpha(state.level) ? " +Alpha" : "";
  ui.threatLabel.textContent = `Threat ${profile.threat}${alphaSuffix}`;
  ui.ammoLabel.textContent = state.reloading ? "Ammo reloading..." : `Ammo ${state.ammo}/${BASE_MAGAZINE}`;
  ui.healthLabel.textContent = `Health ${Math.max(0, Math.round(state.health))}`;
}

function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = (totalSeconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function setStatus(text) {
  ui.statusLabel.textContent = text;
}

function statusText(source) {
  if (state.config.language === "es") {
    const map = {
      "Press Start": "Presiona Start",
      "Hunt started": "Caceria iniciada",
      Reloading: "Recargando",
      Ready: "Listo",
      Paused: "Pausa",
      Resumed: "Reanudado",
      "Config updated": "Configuracion actualizada",
      "Config ignored": "Configuracion ignorada",
      "Config rate limited": "Configuracion limitada por rafaga",
      "You were overrun": "Los zombies te alcanzaron",
      "Victory - all 10 levels complete": "Victoria - completaste 10 niveles",
      Victory: "Victoria",
      "You cleared all 10 levels": "Completaste los 10 niveles",
      "Play again": "Jugar otra vez",
      "Level complete": "Nivel completado",
      "You can continue to the next level or restart.": "Puedes continuar al siguiente nivel o reiniciar.",
      Continue: "Continuar",
      "Level complete - choose next action": "Nivel completado - elige accion",
      "Level failed": "Nivel fallado",
      "Alpha spotted": "Alfa detectado",
      "You can retry this level or restart the run.": "Puedes reintentar este nivel o reiniciar la partida.",
      "Retry level": "Reintentar nivel",
      "Loading assets": "Cargando recursos",
      "Asset fallback mode": "Modo fallback de recursos",
      "Some assets were delayed. You can retry or continue with fallback visuals.": "Algunos recursos tardaron en cargar. Puedes reintentar o continuar con visuales de respaldo.",
      "Retry load": "Reintentar carga",
      "Fallback mode active": "Modo fallback activo",
      "Performance mode enabled": "Modo rendimiento activado",
      "Performance stable": "Rendimiento estable",
      "Time is up": "Se acabo el tiempo",
      "Session complete": "Sesion completada",
      "The 8-minute run ended. Restart to play again.": "La partida de 8 minutos termino. Reinicia para jugar otra vez.",
    };
    return map[source] || source;
  }
  return source;
}

function drawIntro() {
  drawSkyGround();
  ctx.fillStyle = "rgba(12, 8, 8, 0.7)";
  ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);
  ctx.fillStyle = "#ffe0e0";
  ctx.font = "700 48px Oswald";
  ctx.textAlign = "center";
  ctx.fillText("ZOMBITE", ui.canvas.width / 2, 180);
  ctx.font = "700 20px Oswald";
  ctx.fillStyle = "#ff9e9e";
  ctx.fillText("SURVIVE THE HORDE", ui.canvas.width / 2, 220);
}

function draw() {
  const shake = currentShakeOffset();
  ctx.save();
  ctx.translate(shake.x, shake.y);
  drawSkyGround();
  drawBloodPools();
  for (const z of state.zombies) {
    drawZombie(z);
  }
  drawImpacts();
  drawWeaponFrame();
  ctx.restore();
}

function drawSkyGround() {
  const scene = currentScene();
  const gradient = ctx.createLinearGradient(0, 0, 0, ui.canvas.height);
  gradient.addColorStop(0, shadeColor(scene.skyTop, -82));
  gradient.addColorStop(0.46, shadeColor(scene.skyMid, -64));
  gradient.addColorStop(0.47, shadeColor(scene.groundTop, -52));
  gradient.addColorStop(1, shadeColor(scene.groundBottom, -46));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);
  drawBackFog();
  drawGroundPlane();
  if (state.perf.quality === "high") {
    drawSceneDetails(scene.name);
  } else {
    drawSceneLabel(`${scene.name} (Performance)`);
  }
  drawFilmNoise();
  drawVignette();
}

function drawZombie(z) {
  const horizonY = ui.canvas.height * 0.25;
  const depth = clamp((z.y - horizonY) / (ui.canvas.height - horizonY), 0, 1);
  const scale = 0.48 + depth * 1.05;
  const bodyHeight = ((z.isAlpha ? 148 : 128) + z.radius * 0.45) * scale;
  const shoulder = (z.isAlpha ? 30 : 24) * scale;
  const armLength = (z.isAlpha ? 34 : 29) * scale;
  const legLength = (z.isAlpha ? 46 : 42) * scale;
  const headRadius = (z.isAlpha ? 14 : 12) * scale;
  const swing = Math.sin((performance.now() + z.phase) * 0.008) * 6.5 * scale;
  const torsoTop = -bodyHeight * 0.68;
  const hipY = -bodyHeight * 0.12;

  if (depth <= 0.02) return;

  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.globalAlpha = 0.8 + depth * 0.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(16, 9, 9, 0.95)";
  ctx.lineWidth = 8 * scale;
  ctx.beginPath();
  ctx.moveTo(-shoulder + swing, torsoTop + armLength * 0.36);
  ctx.lineTo(-shoulder * 1.5 + swing, torsoTop + armLength);
  ctx.moveTo(shoulder - swing, torsoTop + armLength * 0.36);
  ctx.lineTo(shoulder * 1.5 - swing, torsoTop + armLength);
  ctx.stroke();

  ctx.strokeStyle = z.isAlpha ? "#d9c7ad" : "#b7c6ae";
  ctx.lineWidth = 4.4 * scale;
  ctx.beginPath();
  ctx.moveTo(-shoulder + swing, torsoTop + armLength * 0.36);
  ctx.lineTo(-shoulder * 1.4 + swing, torsoTop + armLength);
  ctx.moveTo(shoulder - swing, torsoTop + armLength * 0.36);
  ctx.lineTo(shoulder * 1.4 - swing, torsoTop + armLength);
  ctx.stroke();

  ctx.strokeStyle = "rgba(12, 8, 8, 0.95)";
  ctx.lineWidth = 8.4 * scale;
  ctx.beginPath();
  ctx.moveTo(-shoulder * 0.2, hipY);
  ctx.lineTo(-shoulder * 0.45 + swing * 0.35, hipY + legLength);
  ctx.moveTo(shoulder * 0.2, hipY);
  ctx.lineTo(shoulder * 0.45 - swing * 0.35, hipY + legLength);
  ctx.stroke();

  ctx.strokeStyle = z.isAlpha ? "#68574d" : "#5f685f";
  ctx.lineWidth = 4.8 * scale;
  ctx.beginPath();
  ctx.moveTo(-shoulder * 0.2, hipY);
  ctx.lineTo(-shoulder * 0.45 + swing * 0.35, hipY + legLength);
  ctx.moveTo(shoulder * 0.2, hipY);
  ctx.lineTo(shoulder * 0.45 - swing * 0.35, hipY + legLength);
  ctx.stroke();

  ctx.fillStyle = z.isAlpha ? "#4f3732" : "#364133";
  ctx.beginPath();
  ctx.moveTo(-shoulder * 1.1, torsoTop + shoulder * 0.2);
  ctx.lineTo(shoulder * 1.1, torsoTop + shoulder * 0.2);
  ctx.lineTo(shoulder * 0.72, hipY);
  ctx.lineTo(-shoulder * 0.72, hipY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(12, 8, 8, 0.95)";
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  ctx.fillStyle = z.isAlpha ? "#766159" : "#68775e";
  ctx.beginPath();
  ctx.arc(0, torsoTop - headRadius * 0.4, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(10, 7, 7, 0.95)";
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  ctx.fillStyle = "#120909";
  ctx.beginPath();
  ctx.arc(-headRadius * 0.4, torsoTop - headRadius * 0.48, headRadius * 0.18, 0, Math.PI * 2);
  ctx.arc(headRadius * 0.4, torsoTop - headRadius * 0.48, headRadius * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = z.isAlpha ? "#ff624f" : "#c4e89f";
  ctx.lineWidth = Math.max(1.2, 2.2 * scale);
  ctx.beginPath();
  ctx.moveTo(-headRadius * 0.46, torsoTop - headRadius * 0.2);
  ctx.lineTo(-headRadius * 0.2, torsoTop - headRadius * 0.14);
  ctx.moveTo(headRadius * 0.46, torsoTop - headRadius * 0.2);
  ctx.lineTo(headRadius * 0.2, torsoTop - headRadius * 0.14);
  ctx.stroke();
  ctx.strokeStyle = z.isAlpha ? "#e75744" : "#b6db93";
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.beginPath();
  ctx.moveTo(-headRadius * 0.52, torsoTop + headRadius * 0.22);
  ctx.quadraticCurveTo(0, torsoTop + headRadius * 0.48, headRadius * 0.52, torsoTop + headRadius * 0.22);
  ctx.stroke();

  if (z.isAlpha) {
    ctx.strokeStyle = "rgba(255, 102, 80, 0.88)";
    ctx.lineWidth = 2.8 * scale;
    ctx.beginPath();
    ctx.ellipse(0, hipY * 0.2, shoulder * 1.8, bodyHeight * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 225, 193, 0.95)";
    ctx.font = `${Math.max(10, 11 * scale)}px Oswald`;
    ctx.textAlign = "center";
    ctx.fillText("ALPHA", 0, torsoTop - headRadius * 2.1);
  }
  ctx.restore();
}

function drawWeaponFrame() {
  if (state.perf.quality === "low") return;
  const h = ui.canvas.height;
  const w = ui.canvas.width;
  ctx.fillStyle = "rgba(8, 11, 15, 0.88)";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w * 0.3, h);
  ctx.lineTo(w * 0.45, h * 0.82);
  ctx.lineTo(w * 0.62, h * 0.82);
  ctx.lineTo(w * 0.77, h);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(183, 204, 225, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.33, h * 0.92);
  ctx.lineTo(w * 0.5, h * 0.78);
  ctx.lineTo(w * 0.68, h * 0.92);
  ctx.stroke();
}

function currentScene() {
  const idx = clamp(state.level, 1, MAX_LEVEL) - 1;
  return LEVEL_SCENES[idx];
}

function currentProfile() {
  const scene = currentScene();
  return SCENE_PROFILE[scene.name] || SCENE_PROFILE.City;
}

function drawSceneDetails(sceneName) {
  if (sceneName === "City") {
    drawCityBlocks();
    return;
  }
  if (sceneName === "Factory") {
    drawFactorySilhouette();
    return;
  }
  if (sceneName === "Countryside") {
    drawCountrysideHills();
    return;
  }
  if (sceneName === "Highway") {
    drawHighwayOverpass();
    return;
  }
  if (sceneName === "Harbor") {
    drawHarborDocks();
    return;
  }
  if (sceneName === "Subway") {
    drawSubwayTunnel();
    return;
  }
  if (sceneName === "Mall") {
    drawMallFacade();
    return;
  }
  if (sceneName === "Hospital") {
    drawHospitalBlock();
    return;
  }
  if (sceneName === "Airport") {
    drawAirportRunway();
    return;
  }
  if (sceneName === "Bunker") {
    drawBunkerEntrance();
    return;
  }
  drawSceneLabel(sceneName);
}

function drawCityBlocks() {
  const h = ui.canvas.height;
  const yBase = h * 0.56;
  ctx.fillStyle = "rgba(18, 24, 33, 0.55)";
  for (let x = 30; x < ui.canvas.width; x += 120) {
    const bw = 66 + ((x / 10) % 36);
    const bh = 90 + ((x / 7) % 120);
    ctx.fillRect(x, yBase - bh, bw, bh);
  }
  drawSceneLabel("City");
}

function drawFactorySilhouette() {
  const h = ui.canvas.height;
  const y = h * 0.57;
  ctx.fillStyle = "rgba(28, 26, 24, 0.62)";
  ctx.fillRect(0, y, ui.canvas.width, h - y);
  ctx.fillRect(120, y - 130, 210, 130);
  ctx.fillRect(370, y - 85, 260, 85);
  ctx.fillRect(700, y - 110, 180, 110);
  ctx.fillRect(930, y - 95, 210, 95);
  ctx.fillRect(230, y - 190, 40, 190);
  ctx.fillRect(790, y - 170, 36, 170);
  drawSceneLabel("Factory");
}

function drawCountrysideHills() {
  const h = ui.canvas.height;
  ctx.fillStyle = "rgba(35, 73, 42, 0.6)";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.6);
  ctx.quadraticCurveTo(ui.canvas.width * 0.25, h * 0.5, ui.canvas.width * 0.5, h * 0.6);
  ctx.quadraticCurveTo(ui.canvas.width * 0.75, h * 0.68, ui.canvas.width, h * 0.58);
  ctx.lineTo(ui.canvas.width, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  drawSceneLabel("Countryside");
}

function drawHighwayOverpass() {
  const h = ui.canvas.height;
  ctx.fillStyle = "rgba(33, 36, 44, 0.62)";
  ctx.fillRect(0, h * 0.64, ui.canvas.width, h * 0.36);
  ctx.fillRect(0, h * 0.58, ui.canvas.width, 14);
  for (let x = 0; x < ui.canvas.width; x += 120) {
    ctx.fillRect(x + 16, h * 0.58, 10, 70);
  }
  ctx.fillStyle = "rgba(223, 233, 242, 0.45)";
  for (let x = 36; x < ui.canvas.width; x += 80) {
    ctx.fillRect(x, h * 0.69, 34, 4);
  }
  drawSceneLabel("Highway");
}

function drawHarborDocks() {
  const h = ui.canvas.height;
  ctx.fillStyle = "rgba(24, 44, 58, 0.6)";
  ctx.fillRect(0, h * 0.66, ui.canvas.width, h * 0.34);
  ctx.fillStyle = "rgba(55, 73, 82, 0.68)";
  ctx.fillRect(80, h * 0.58, 280, 26);
  ctx.fillRect(430, h * 0.61, 320, 26);
  ctx.fillRect(820, h * 0.56, 280, 26);
  ctx.fillRect(160, h * 0.46, 12, 130);
  ctx.fillRect(520, h * 0.43, 12, 150);
  ctx.fillRect(930, h * 0.4, 12, 160);
  drawSceneLabel("Harbor");
}

function drawSubwayTunnel() {
  const h = ui.canvas.height;
  const w = ui.canvas.width;
  ctx.fillStyle = "rgba(28, 30, 37, 0.66)";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.58);
  ctx.quadraticCurveTo(w * 0.5, h * 0.24, w, h * 0.58);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(198, 208, 220, 0.33)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i += 1) {
    const y = h * (0.62 + i * 0.05);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  drawSceneLabel("Subway");
}

function drawMallFacade() {
  const h = ui.canvas.height;
  const y = h * 0.54;
  ctx.fillStyle = "rgba(67, 58, 70, 0.62)";
  ctx.fillRect(60, y - 110, ui.canvas.width - 120, 170);
  ctx.fillStyle = "rgba(198, 210, 225, 0.28)";
  for (let x = 100; x < ui.canvas.width - 100; x += 90) {
    ctx.fillRect(x, y - 80, 60, 50);
  }
  ctx.fillStyle = "rgba(40, 36, 44, 0.72)";
  ctx.fillRect(0, y + 60, ui.canvas.width, h - y);
  drawSceneLabel("Mall");
}

function drawHospitalBlock() {
  const h = ui.canvas.height;
  const cx = ui.canvas.width * 0.5;
  const y = h * 0.56;
  ctx.fillStyle = "rgba(64, 82, 92, 0.64)";
  ctx.fillRect(cx - 220, y - 150, 440, 190);
  ctx.fillRect(cx - 60, y - 200, 120, 240);
  ctx.fillStyle = "rgba(215, 230, 236, 0.4)";
  ctx.fillRect(cx - 10, y - 185, 20, 80);
  ctx.fillRect(cx - 45, y - 150, 90, 20);
  ctx.fillStyle = "rgba(42, 55, 62, 0.7)";
  ctx.fillRect(0, y + 40, ui.canvas.width, h - y);
  drawSceneLabel("Hospital");
}

function drawAirportRunway() {
  const h = ui.canvas.height;
  const w = ui.canvas.width;
  ctx.fillStyle = "rgba(50, 58, 65, 0.68)";
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.55);
  ctx.lineTo(w * 0.7, h * 0.55);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(232, 238, 244, 0.48)";
  for (let y = h * 0.62; y < h * 0.95; y += 28) {
    ctx.fillRect(w * 0.49, y, w * 0.02, 12);
  }
  ctx.fillStyle = "rgba(62, 76, 86, 0.62)";
  ctx.fillRect(80, h * 0.5, 260, 30);
  ctx.fillRect(920, h * 0.5, 260, 30);
  drawSceneLabel("Airport");
}

function drawBunkerEntrance() {
  const h = ui.canvas.height;
  const w = ui.canvas.width;
  ctx.fillStyle = "rgba(43, 46, 54, 0.74)";
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.beginPath();
  ctx.moveTo(w * 0.28, h * 0.62);
  ctx.lineTo(w * 0.42, h * 0.48);
  ctx.lineTo(w * 0.58, h * 0.48);
  ctx.lineTo(w * 0.72, h * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(20, 24, 31, 0.9)";
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.62);
  ctx.lineTo(w * 0.5, h * 0.53);
  ctx.lineTo(w * 0.58, h * 0.62);
  ctx.closePath();
  ctx.fill();
  drawSceneLabel("Bunker");
}

function drawSceneLabel(sceneName) {
  ctx.fillStyle = "rgba(255, 207, 207, 0.8)";
  ctx.font = "700 20px Oswald";
  ctx.textAlign = "left";
  ctx.fillText(sceneName, 20, 36);
}

function canvasPoint(event) {
  const rect = ui.canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * ui.canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * ui.canvas.height,
  };
}

function moveCrosshair(event) {
  const rect = ui.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  ui.crosshair.style.left = `${x}px`;
  ui.crosshair.style.top = `${y}px`;
}

function flashMuzzle() {
  ui.muzzleFlash.classList.remove("active");
  void ui.muzzleFlash.offsetWidth;
  ui.muzzleFlash.classList.add("active");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function addImpact(x, y, tone) {
  state.impacts.push({
    x,
    y,
    color: tone,
    ttl: 140,
  });
  if (state.impacts.length > 24) state.impacts.shift();
}

function addBloodPool(x, y, isAlpha) {
  state.bloodPools.push({
    x,
    y: y + (isAlpha ? 8 : 5),
    radius: isAlpha ? 36 : 24,
    ttl: isAlpha ? 7000 : 5200,
    tone: isAlpha ? "rgba(130, 12, 12, 0.55)" : "rgba(120, 10, 10, 0.5)",
  });
  if (state.bloodPools.length > 36) state.bloodPools.shift();
}

function drawBloodPools() {
  for (const pool of state.bloodPools) {
    const life = clamp(pool.ttl / 7000, 0, 1);
    const fade = life < 0.28 ? life / 0.28 : 1;
    const spread = pool.radius * (1.45 - life * 0.4);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = pool.tone;
    ctx.beginPath();
    ctx.ellipse(pool.x, pool.y + 4, spread, spread * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(30, 3, 3, 0.22)";
    ctx.beginPath();
    ctx.ellipse(pool.x + spread * 0.12, pool.y + 5, spread * 0.45, spread * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function applyPlayerDamage(amount) {
  state.health -= amount;
  startCameraShake(170, 5.8);
  playDamageSound();
}

function startCameraShake(durationMs, intensity) {
  state.camera.shakeMs = Math.max(state.camera.shakeMs, durationMs);
  state.camera.intensity = Math.max(state.camera.intensity, intensity);
}

function currentShakeOffset() {
  if (state.camera.shakeMs <= 0) return { x: 0, y: 0 };
  const phase = state.camera.shakeMs / 180;
  const strength = state.camera.intensity * Math.max(0.1, phase);
  return {
    x: (Math.random() * 2 - 1) * strength,
    y: (Math.random() * 2 - 1) * strength,
  };
}

function drawImpacts() {
  for (const hit of state.impacts) {
    const life = clamp(hit.ttl / 140, 0, 1);
    const radius = 4 + (1 - life) * 22;
    ctx.save();
    ctx.globalAlpha = life * 0.8;
    ctx.strokeStyle = hit.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(hit.x - radius, hit.y);
    ctx.lineTo(hit.x + radius, hit.y);
    ctx.moveTo(hit.x, hit.y - radius);
    ctx.lineTo(hit.x, hit.y + radius);
    ctx.moveTo(hit.x - radius * 0.7, hit.y - radius * 0.7);
    ctx.lineTo(hit.x + radius * 0.7, hit.y + radius * 0.7);
    ctx.moveTo(hit.x - radius * 0.7, hit.y + radius * 0.7);
    ctx.lineTo(hit.x + radius * 0.7, hit.y - radius * 0.7);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 73, 73, 0.35)";
    ctx.beginPath();
    ctx.arc(hit.x, hit.y, Math.max(1.4, radius * 0.12), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawGroundPlane() {
  const horizon = ui.canvas.height * 0.52;
  const maxY = ui.canvas.height;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 176, 176, 0.08)";
  ctx.lineWidth = 1;
  for (let y = horizon + 26; y < maxY; y += 26) {
    const bend = (y - horizon) * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(ui.canvas.width * 0.5, y + bend, ui.canvas.width, y);
    ctx.stroke();
  }
  for (let x = 0; x <= ui.canvas.width; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, maxY);
    ctx.lineTo(ui.canvas.width * 0.5 + (x - ui.canvas.width * 0.5) * 0.1, horizon);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBackFog() {
  const fog = ctx.createLinearGradient(0, ui.canvas.height * 0.2, 0, ui.canvas.height * 0.75);
  fog.addColorStop(0, "rgba(112, 31, 31, 0.08)");
  fog.addColorStop(0.55, "rgba(27, 18, 18, 0.22)");
  fog.addColorStop(1, "rgba(9, 6, 6, 0.42)");
  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);
}

function drawFilmNoise() {
  if (state.perf.quality === "low") return;
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 70; i += 1) {
    const x = Math.random() * ui.canvas.width;
    const y = Math.random() * ui.canvas.height;
    const w = 1 + Math.random() * 2;
    const h = 1 + Math.random() * 2;
    const shade = 180 + Math.floor(Math.random() * 75);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

function ensureAudioReady() {
  if (state.audio.ctx && state.audio.ctx.state !== "closed") {
    if (state.audio.ctx.state === "suspended") {
      state.audio.ctx.resume().catch(() => undefined);
    }
    return;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  state.audio.ctx = new AudioCtx();
  state.audio.unlocked = true;
}

function audioGainValue(multiplier) {
  return clamp(state.config.volume * multiplier, 0, 1);
}

function playTone({ frequency, type, gain, durationMs, slideTo, q }) {
  const audioCtx = state.audio.ctx;
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency * 1.8;
  filter.Q.value = q || 0.8;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + durationMs / 1000);
  }

  amp.gain.setValueAtTime(Math.max(0.0001, gain), now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  osc.connect(filter);
  filter.connect(amp);
  amp.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

function playShotSound() {
  if (!state.audio.ctx) return;
  playTone({
    frequency: 170,
    type: "sawtooth",
    gain: audioGainValue(0.09),
    durationMs: 85,
    slideTo: 70,
    q: 2.8,
  });
}

function playHitSound(isAlpha) {
  if (!state.audio.ctx) return;
  playTone({
    frequency: isAlpha ? 122 : 146,
    type: "square",
    gain: audioGainValue(isAlpha ? 0.055 : 0.04),
    durationMs: isAlpha ? 92 : 70,
    slideTo: isAlpha ? 90 : 105,
    q: 1.2,
  });
}

function playKillSound(isAlpha) {
  if (!state.audio.ctx) return;
  playTone({
    frequency: isAlpha ? 92 : 108,
    type: "triangle",
    gain: audioGainValue(isAlpha ? 0.08 : 0.06),
    durationMs: isAlpha ? 190 : 140,
    slideTo: isAlpha ? 58 : 66,
    q: 0.9,
  });
}

function playDamageSound() {
  ensureAudioReady();
  if (!state.audio.ctx) return;
  playTone({
    frequency: 72,
    type: "square",
    gain: audioGainValue(0.07),
    durationMs: 130,
    slideTo: 55,
    q: 1.6,
  });
}

function drawVignette() {
  const vignette = ctx.createRadialGradient(
    ui.canvas.width * 0.5,
    ui.canvas.height * 0.56,
    ui.canvas.height * 0.15,
    ui.canvas.width * 0.5,
    ui.canvas.height * 0.56,
    ui.canvas.height * 0.86,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(6, 3, 3, 0.72)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);
}

function shadeColor(hex, amount) {
  const parsed = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  if (!parsed) return hex;
  const clampColor = (n) => clamp(n + amount, 0, 255);
  const r = clampColor(parseInt(parsed[1], 16));
  const g = clampColor(parseInt(parsed[2], 16));
  const b = clampColor(parseInt(parsed[3], 16));
  return `rgb(${r}, ${g}, ${b})`;
}

function isValidUrlOrigin(text) {
  try {
    const parsed = new URL(text);
    return Boolean(parsed.origin && (parsed.protocol === "https:" || parsed.protocol === "http:"));
  } catch (_error) {
    return false;
  }
}

function notifyReady() {
  window.parent?.postMessage(
    {
      type: "zombite.ready",
      payload: { version: 1, accepts: [...schemaKeys] },
    },
    "*",
  );
}

function bootRuntime() {
  setStatus(statusText("Loading assets"));
  ui.startBtn.disabled = true;
  drawIntro();
  preloadRuntimeAssets()
    .then(() => {
      ui.startBtn.disabled = false;
      hideOutcome();
      setStatus(statusText("Press Start"));
      notifyReady();
    })
    .catch(() => {
      ui.startBtn.disabled = false;
      showOutcome({
        title: statusText("Asset fallback mode"),
        text: statusText("Some assets were delayed. You can retry or continue with fallback visuals."),
        continueText: statusText("Retry load"),
        mode: "boot_retry",
      });
      setStatus(statusText("Fallback mode active"));
      notifyReady();
    });
}

function preloadRuntimeAssets() {
  const timeoutMs = 2400;
  const timeout = new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error("asset timeout")), timeoutMs);
  });
  return Promise.race([
    Promise.all([waitForFonts(), waitForAnimationFrame()]),
    timeout,
  ]);
}

function waitForFonts() {
  if (!document.fonts || !document.fonts.ready) return Promise.resolve();
  return document.fonts.ready.then(() => undefined);
}

function waitForAnimationFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function observePerformance(dt) {
  if (!Number.isFinite(dt) || dt <= 0) return;
  const fps = 1000 / dt;
  state.perf.sampleFpsSum += fps;
  state.perf.sampleFrames += 1;
  if (state.perf.sampleFrames < 30) return;

  const avgFps = state.perf.sampleFpsSum / state.perf.sampleFrames;
  state.perf.sampleFpsSum = 0;
  state.perf.sampleFrames = 0;

  if (avgFps < 42) {
    state.perf.lowScore += 1;
    state.perf.highScore = 0;
  } else if (avgFps > 54) {
    state.perf.highScore += 1;
    state.perf.lowScore = Math.max(0, state.perf.lowScore - 1);
  } else {
    state.perf.lowScore = Math.max(0, state.perf.lowScore - 1);
    state.perf.highScore = Math.max(0, state.perf.highScore - 1);
  }

  if (state.perf.quality === "high" && state.perf.lowScore >= 3) {
    state.perf.quality = "low";
    setStatus(statusText("Performance mode enabled"));
  } else if (state.perf.quality === "low" && state.perf.highScore >= 5) {
    state.perf.quality = "high";
    setStatus(statusText("Performance stable"));
  }
}

function showOutcome({ title, text, continueText, mode }) {
  state.waitingDecision = true;
  state.decisionMode = mode;
  ui.outcomeTitle.textContent = title;
  ui.outcomeText.textContent = text;
  ui.continueBtn.textContent = continueText;
  ui.outcomePanel.classList.remove("hidden");
}

function hideOutcome() {
  ui.outcomePanel.classList.add("hidden");
}

function continueRun() {
  if (state.decisionMode === "boot_retry") {
    state.waitingDecision = false;
    state.decisionMode = "none";
    hideOutcome();
    bootRuntime();
    return;
  }

  if (state.decisionMode === "level_complete") {
    state.level += 1;
    state.health = clamp(state.health + 20, 0, BASE_HEALTH);
    state.ammo = BASE_MAGAZINE;
    state.reloading = false;
    state.gameOver = false;
    state.waitingDecision = false;
    state.decisionMode = "none";
    hideOutcome();
    beginLevel();
    setStatus(statusText(`Level ${state.level} started`));
    return;
  }

  if (state.decisionMode === "game_over") {
    state.level = state.savedLevel;
    state.running = true;
    state.gameOver = false;
    state.waitingDecision = false;
    state.decisionMode = "none";
    state.health = BASE_HEALTH;
    state.ammo = BASE_MAGAZINE;
    state.reloading = false;
    hideOutcome();
    beginLevel();
    setStatus(statusText(`Level ${state.level} started`));
    return;
  }

  if (state.decisionMode === "victory") {
    startGame();
  }
}

function restartRun() {
  startGame();
}
