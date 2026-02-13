"use strict";

const MAX_LEVEL = 10;
const BASE_MAGAZINE = 5;
const BASE_HEALTH = 100;
const LEVEL_SCENES = [
  { name: "City", skyTop: "#4f86b2", skyMid: "#31597a", groundTop: "#33463a", groundBottom: "#2f382f" },
  { name: "Factory", skyTop: "#5f6f7e", skyMid: "#3a4754", groundTop: "#4b3f38", groundBottom: "#2e2622" },
  { name: "Countryside", skyTop: "#7fb8e6", skyMid: "#4f8f66", groundTop: "#4f6b3e", groundBottom: "#2f4727" },
  { name: "Highway", skyTop: "#6f7a95", skyMid: "#3f4e69", groundTop: "#4b4b53", groundBottom: "#2f3037" },
  { name: "Harbor", skyTop: "#6093b5", skyMid: "#3a6075", groundTop: "#385260", groundBottom: "#243844" },
  { name: "Subway", skyTop: "#50596c", skyMid: "#30384a", groundTop: "#4d4441", groundBottom: "#2d2726" },
  { name: "Mall", skyTop: "#7b8ca3", skyMid: "#4b5c78", groundTop: "#5a4a52", groundBottom: "#352b31" },
  { name: "Hospital", skyTop: "#7ea0b0", skyMid: "#4f6f80", groundTop: "#52636b", groundBottom: "#324149" },
  { name: "Airport", skyTop: "#7ea7c6", skyMid: "#4f7793", groundTop: "#5f6a72", groundBottom: "#39434a" },
  { name: "Bunker", skyTop: "#5e6571", skyMid: "#3d4450", groundTop: "#4c4f57", groundBottom: "#2b2e35" },
];
const SCENE_PROFILE = {
  City: { zombieColor: "#a6e277", alphaColor: "#ff7a5f", speedBoost: 0, hpBoost: 0, sizeBoost: 0, wobbleBoost: 0, damageBoost: 0, threat: "Low" },
  Factory: { zombieColor: "#b7d88f", alphaColor: "#ff8c5a", speedBoost: 0.08, hpBoost: 0, sizeBoost: 1, wobbleBoost: 2, damageBoost: 1, threat: "Guarded" },
  Countryside: { zombieColor: "#9fd26a", alphaColor: "#f97058", speedBoost: 0.12, hpBoost: 0, sizeBoost: 0, wobbleBoost: 4, damageBoost: 0, threat: "Medium" },
  Highway: { zombieColor: "#b0d4d4", alphaColor: "#ff9273", speedBoost: 0.16, hpBoost: 1, sizeBoost: 1, wobbleBoost: 3, damageBoost: 1, threat: "Medium+" },
  Harbor: { zombieColor: "#8fc3c8", alphaColor: "#ff8f66", speedBoost: 0.2, hpBoost: 1, sizeBoost: 1, wobbleBoost: 5, damageBoost: 1, threat: "High" },
  Subway: { zombieColor: "#c2c9a4", alphaColor: "#ff9a6e", speedBoost: 0.24, hpBoost: 1, sizeBoost: 2, wobbleBoost: 2, damageBoost: 2, threat: "High" },
  Mall: { zombieColor: "#c7c4a7", alphaColor: "#ff9e74", speedBoost: 0.28, hpBoost: 1, sizeBoost: 2, wobbleBoost: 3, damageBoost: 2, threat: "Very High" },
  Hospital: { zombieColor: "#b6d2c7", alphaColor: "#ffae87", speedBoost: 0.32, hpBoost: 2, sizeBoost: 2, wobbleBoost: 4, damageBoost: 2, threat: "Very High" },
  Airport: { zombieColor: "#bdd4e3", alphaColor: "#ffb38d", speedBoost: 0.36, hpBoost: 2, sizeBoost: 2, wobbleBoost: 3, damageBoost: 3, threat: "Extreme" },
  Bunker: { zombieColor: "#c5c9d0", alphaColor: "#ffc299", speedBoost: 0.4, hpBoost: 3, sizeBoost: 3, wobbleBoost: 2, damageBoost: 3, threat: "Apocalypse" },
};

const ui = {
  canvas: document.getElementById("arena"),
  levelLabel: document.getElementById("levelLabel"),
  sceneLabel: document.getElementById("sceneLabel"),
  goalLabel: document.getElementById("goalLabel"),
  statusLabel: document.getElementById("statusLabel"),
  threatLabel: document.getElementById("threatLabel"),
  ammoLabel: document.getElementById("ammoLabel"),
  healthLabel: document.getElementById("healthLabel"),
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
  lastTs: 0,
  waitingDecision: false,
  decisionMode: "none",
  savedLevel: 1,
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
};

const schemaKeys = new Set(["language", "volume", "startLevel", "difficulty"]);
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
});

ui.canvas.addEventListener("click", (event) => {
  if (!state.running || state.paused || state.gameOver) return;
  shoot(canvasPoint(event));
});

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") {
    queueReload();
    return;
  }
  if (event.key.toLowerCase() === "p" && state.running && !state.gameOver) {
    togglePause();
  }
});

window.addEventListener("message", (event) => {
  if (!allowedOrigins.has(event.origin)) return;
  const message = event.data;
  if (!message || typeof message !== "object") return;
  if (message.type !== "zombite.configure") return;
  if (!message.payload || typeof message.payload !== "object") return;
  if (!hasKnownSchema(message.payload)) return;
  applyConfig(message.payload);
  setStatus(statusText("Config updated"));
});

function readQueryConfig() {
  const params = new URLSearchParams(window.location.search);
  return {
    language: params.get("language"),
    volume: params.get("volume"),
    startLevel: params.get("startLevel"),
    difficulty: params.get("difficulty"),
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

function sanitizeConfig(next) {
  const sanitized = {};

  if (typeof next.language === "string") {
    const lang = next.language.trim().toLowerCase();
    if (lang === "es" || lang === "en") sanitized.language = lang;
  }

  if (next.volume !== undefined) {
    const value = Number(next.volume);
    if (Number.isFinite(value)) {
      sanitized.volume = clamp(value, 0, 1);
    }
  }

  if (next.startLevel !== undefined) {
    const value = Number(next.startLevel);
    if (Number.isFinite(value)) {
      sanitized.startLevel = Math.round(clamp(value, 1, MAX_LEVEL));
    }
  }

  if (typeof next.difficulty === "string") {
    const mode = next.difficulty.trim().toLowerCase();
    if (mode === "easy" || mode === "normal" || mode === "hard") {
      sanitized.difficulty = mode;
    }
  }

  return sanitized;
}

function applyConfig(incoming) {
  const sanitized = sanitizeConfig(incoming || {});
  state.config = { ...state.config, ...sanitized };
  if (!state.running || state.gameOver) {
    state.level = state.config.startLevel;
  }
  refreshHud();
}

function startGame() {
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.waitingDecision = false;
  state.decisionMode = "none";
  state.score = 0;
  state.health = BASE_HEALTH;
  state.level = state.config.startLevel;
  state.savedLevel = state.level;
  ui.pauseBtn.textContent = "Pause";
  state.zombies = [];
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
  state.goalInLevel = 7 + state.level * 2;
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
      state.health -= z.isAlpha ? damageRate * 1.8 : damageRate;
      state.zombies.splice(i, 1);
      if (state.health <= 0) {
        triggerGameOver("You were overrun");
        return;
      }
    }
  }
  refreshHud();
}

function spawnZombie() {
  const width = ui.canvas.width;
  const levelBias = state.level / MAX_LEVEL;
  const profile = currentProfile();
  const alphaLevelGate = state.level >= 3 && state.level % 3 === 0;
  const forceAlpha = alphaLevelGate && !state.alphaSpawnedInLevel && state.spawnsInLevel >= 2;
  const alphaRoll = Math.random() < 0.14 + levelBias * 0.08;
  const isAlpha = forceAlpha || (alphaLevelGate && alphaRoll);

  const z = {
    isAlpha,
    x: 80 + Math.random() * (width - 160),
    y: -50,
    radius: (isAlpha ? 36 : 24) + profile.sizeBoost,
    hp: (isAlpha ? 3 + Math.floor(state.level / 3) : 1 + Math.floor(state.level / 4)) + profile.hpBoost,
    speed: (1.1 + levelBias * 1.2 + profile.speedBoost) * difficultyFactor(),
    wobble: (isAlpha ? 24 : 14) + profile.wobbleBoost,
    wobbleSpeed: isAlpha ? 1.6 : 1.0,
    phase: Math.random() * 1000,
    color: isAlpha ? profile.alphaColor : profile.zombieColor,
  };
  state.zombies.push(z);
  state.spawnsInLevel += 1;
  if (isAlpha) state.alphaSpawnedInLevel = true;

  const maxOnScreen = 5 + Math.floor(state.level / 2) - (state.perf.quality === "low" ? 2 : 0);
  if (state.zombies.length > maxOnScreen) state.zombies.shift();
}

function difficultyFactor() {
  if (state.config.difficulty === "easy") return 0.86;
  if (state.config.difficulty === "hard") return 1.18;
  return 1;
}

function spawnIntervalMs() {
  const levelScale = 760 - state.level * 42;
  return clamp(levelScale / difficultyFactor(), 220, 850);
}

function shoot(point) {
  if (state.reloading || state.ammo <= 0) {
    if (state.ammo <= 0) queueReload();
    return;
  }
  state.ammo -= 1;
  flashMuzzle();
  let hit = false;

  for (let i = state.zombies.length - 1; i >= 0; i -= 1) {
    const z = state.zombies[i];
    const dx = point.x - z.x;
    const dy = point.y - z.y;
    const precisionWindow = Math.max(2, 8 - Math.floor(state.level / 2));
    if (Math.hypot(dx, dy) <= z.radius + precisionWindow) {
      z.hp -= 1;
      hit = true;
      if (z.hp <= 0) {
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
  ui.threatLabel.textContent = `Threat ${profile.threat}`;
  ui.ammoLabel.textContent = state.reloading ? "Ammo reloading..." : `Ammo ${state.ammo}/${BASE_MAGAZINE}`;
  ui.healthLabel.textContent = `Health ${Math.max(0, Math.round(state.health))}`;
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
      "You can retry this level or restart the run.": "Puedes reintentar este nivel o reiniciar la partida.",
      "Retry level": "Reintentar nivel",
      "Loading assets": "Cargando recursos",
      "Asset fallback mode": "Modo fallback de recursos",
      "Some assets were delayed. You can retry or continue with fallback visuals.": "Algunos recursos tardaron en cargar. Puedes reintentar o continuar con visuales de respaldo.",
      "Retry load": "Reintentar carga",
      "Fallback mode active": "Modo fallback activo",
      "Performance mode enabled": "Modo rendimiento activado",
      "Performance stable": "Rendimiento estable",
    };
    return map[source] || source;
  }
  return source;
}

function drawIntro() {
  drawSkyGround();
  ctx.fillStyle = "rgba(20, 29, 37, 0.62)";
  ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);
  ctx.fillStyle = "#f4fbff";
  ctx.font = "700 40px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("ZOMBITE", ui.canvas.width / 2, 180);
  ctx.font = "600 22px Trebuchet MS";
  ctx.fillStyle = "#cae6f8";
  ctx.fillText("Short anti-stress zombie sniper sessions", ui.canvas.width / 2, 220);
}

function draw() {
  drawSkyGround();
  for (const z of state.zombies) {
    drawZombie(z);
  }
  drawWeaponFrame();
}

function drawSkyGround() {
  const scene = currentScene();
  const gradient = ctx.createLinearGradient(0, 0, 0, ui.canvas.height);
  gradient.addColorStop(0, scene.skyTop);
  gradient.addColorStop(0.52, scene.skyMid);
  gradient.addColorStop(0.53, scene.groundTop);
  gradient.addColorStop(1, scene.groundBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height);
  if (state.perf.quality === "high") {
    drawSceneDetails(scene.name);
  } else {
    drawSceneLabel(`${scene.name} (Performance)`);
  }
}

function drawZombie(z) {
  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.fillStyle = z.color || (z.isAlpha ? "#ff7a5f" : "#a6e277");
  ctx.beginPath();
  ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#22191a";
  ctx.beginPath();
  ctx.arc(-z.radius * 0.35, -z.radius * 0.2, z.radius * 0.17, 0, Math.PI * 2);
  ctx.arc(z.radius * 0.35, -z.radius * 0.2, z.radius * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#281616";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-z.radius * 0.35, z.radius * 0.3);
  ctx.quadraticCurveTo(0, z.radius * 0.6, z.radius * 0.35, z.radius * 0.3);
  ctx.stroke();
  if (z.isAlpha) {
    ctx.strokeStyle = "#fff2c4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, z.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWeaponFrame() {
  if (state.perf.quality === "low") return;
  const h = ui.canvas.height;
  const w = ui.canvas.width;
  ctx.fillStyle = "rgba(8, 12, 17, 0.74)";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w * 0.33, h);
  ctx.lineTo(w * 0.49, h * 0.8);
  ctx.lineTo(w * 0.62, h * 0.8);
  ctx.lineTo(w * 0.75, h);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
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
  ctx.fillStyle = "rgba(245, 251, 255, 0.75)";
  ctx.font = "600 20px Trebuchet MS";
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

function flashMuzzle() {
  ui.muzzleFlash.classList.remove("active");
  void ui.muzzleFlash.offsetWidth;
  ui.muzzleFlash.classList.add("active");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
